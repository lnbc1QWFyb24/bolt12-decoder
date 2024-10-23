import { bech32 } from "bech32";
import { TLVParser, type TLVRecord } from "./tlv-parser";
import { BlindedPathDecoder, type BlindedPath } from "./blinded-paths";

export interface BlindedPayInfo {
  feeBaseMsat: number;
  feeProportionalMillionths: number;
  cltvExpiryDelta: number;
  htlcMinimumMsat: bigint;
  htlcMaximumMsat: bigint;
  features: Buffer;
}

export interface FallbackAddress {
  version: number;
  address: string;
}

// Message types with discriminators
export interface Offer {
  type: "offer";
  chains?: string[];
  metadata?: string;
  currency?: string;
  amount?: string;
  description?: string;
  features?: string;
  absoluteExpiry?: number;
  paths?: BlindedPath[];
  issuer?: string;
  quantityMax?: number;
  issuerId?: string;
}

export interface InvoiceRequest extends Omit<Offer, "type"> {
  type: "invoice_request";
  metadata: string;
  chain?: string;
  amount?: string;
  features?: string;
  quantity?: number;
  payerId: string;
  payerNote?: string;
  paths?: BlindedPath[];
  signature: string;
}

export interface Invoice extends Omit<InvoiceRequest, "type"> {
  type: "invoice";
  paths: BlindedPath[];
  blindedPayInfo: BlindedPayInfo[];
  createdAt: number;
  relativeExpiry?: number;
  paymentHash: string;
  amount: string;
  fallbacks?: FallbackAddress[];
  features?: string;
  nodeId: string;
  signature: string;
}

export type BOLT12Message = Offer | InvoiceRequest | Invoice;

export class BOLT12Parser {
  // Prefixes for different message types
  private static readonly OFFER_PREFIX = "lno";
  private static readonly INVOICE_REQUEST_PREFIX = "lnr";
  private static readonly INVOICE_PREFIX = "lni";

  // TLV type constants
  private static readonly TLV_TYPES = {
    // Offer types (1-79)
    OFFER_CHAINS: 2n,
    OFFER_METADATA: 4n,
    OFFER_CURRENCY: 6n,
    OFFER_AMOUNT: 8n,
    OFFER_DESCRIPTION: 10n,
    OFFER_FEATURES: 12n,
    OFFER_ABSOLUTE_EXPIRY: 14n,
    OFFER_PATHS: 16n,
    OFFER_ISSUER: 18n,
    OFFER_QUANTITY_MAX: 20n,
    OFFER_ISSUER_ID: 22n,

    // Invoice Request types (80-159)
    INVREQ_METADATA: 0n,
    INVREQ_CHAIN: 80n,
    INVREQ_AMOUNT: 82n,
    INVREQ_FEATURES: 84n,
    INVREQ_QUANTITY: 86n,
    INVREQ_PAYER_ID: 88n,
    INVREQ_PAYER_NOTE: 89n,
    INVREQ_PATHS: 90n,

    // Invoice types (160+)
    INVOICE_PATHS: 160n,
    INVOICE_BLINDEDPAY: 162n,
    INVOICE_CREATED_AT: 164n,
    INVOICE_RELATIVE_EXPIRY: 166n,
    INVOICE_PAYMENT_HASH: 168n,
    INVOICE_AMOUNT: 170n,
    INVOICE_FALLBACKS: 172n,
    INVOICE_FEATURES: 174n,
    INVOICE_NODE_ID: 176n,
    SIGNATURE: 240n,
  };

  /**
   * Main decode method for any BOLT12 message
   */
  public static decode(bech32String: string): BOLT12Message {
    const lowerString = bech32String.toLowerCase();

    if (lowerString.startsWith(this.OFFER_PREFIX)) {
      return this.parseOffer(bech32String);
    }

    if (lowerString.startsWith(this.INVOICE_REQUEST_PREFIX)) {
      return this.parseInvoiceRequest(bech32String);
    }

    if (lowerString.startsWith(this.INVOICE_PREFIX)) {
      return this.parseInvoice(bech32String);
    }

    throw new Error("Invalid BOLT12 message prefix");
  }

  /**
   * Parse a bech32 string into TLV records
   */
  private static parseBech32(bech32String: string): TLVRecord[] {
    // Remove formatting characters
    const cleanString = bech32String.replace(/\+\s*/g, "");

    // Split into parts
    const parts = cleanString.toLowerCase().split("1");
    if (parts.length !== 2) {
      throw new Error("Invalid BOLT12 format: missing separator");
    }

    const [prefix, data] = parts;

    // Convert data characters to 5-bit integers (words)
    const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    const words: number[] = [];

    for (const char of data) {
      const index = CHARSET.indexOf(char);
      if (index === -1) {
        throw new Error("Invalid character in data part");
      }
      words.push(index);
    }

    const bytes = Buffer.from(bech32.fromWords(words));

    // Parse TLV stream
    const parser = new TLVParser(bytes);
    return parser.parseTLVStream();
  }

  /**
   * Parse an offer message
   */
  private static parseOffer(bech32String: string): Offer {
    const records = this.parseBech32(bech32String);
    const offer: Offer = { type: "offer" };

    for (const record of records) {
      switch (record.type) {
        case this.TLV_TYPES.OFFER_CHAINS:
          offer.chains = this.parseChainHashes(record.value);
          break;
        case this.TLV_TYPES.OFFER_METADATA:
          offer.metadata = record.value.toString("hex");
          break;
        case this.TLV_TYPES.OFFER_CURRENCY:
          offer.currency = record.value.toString("utf8");
          break;
        case this.TLV_TYPES.OFFER_AMOUNT:
          offer.amount = this.parseTruncatedUint(record.value).toString();
          break;
        case this.TLV_TYPES.OFFER_DESCRIPTION:
          offer.description = record.value.toString("utf8");
          break;
        case this.TLV_TYPES.OFFER_FEATURES:
          offer.features = record.value.toString("hex");
          break;
        case this.TLV_TYPES.OFFER_ABSOLUTE_EXPIRY:
          offer.absoluteExpiry = Number(this.parseTruncatedUint(record.value));
          break;
        case this.TLV_TYPES.OFFER_PATHS:
          offer.paths = this.parseBlindedPaths(record.value);
          break;
        case this.TLV_TYPES.OFFER_ISSUER:
          offer.issuer = record.value.toString("utf8");
          break;
        case this.TLV_TYPES.OFFER_QUANTITY_MAX:
          offer.quantityMax = Number(this.parseTruncatedUint(record.value));
          break;
        case this.TLV_TYPES.OFFER_ISSUER_ID:
          offer.issuerId = this.parsePoint(record.value);
          break;
      }
    }

    return offer;
  }

  /**
   * Parse an invoice request message
   */
  private static parseInvoiceRequest(bech32String: string): InvoiceRequest {
    const records = this.parseBech32(bech32String);
    const baseOffer = this.parseOffer(bech32String);
    const request: InvoiceRequest = { ...baseOffer, type: "invoice_request" } as InvoiceRequest;

    for (const record of records) {
      switch (record.type) {
        case this.TLV_TYPES.INVREQ_METADATA:
          request.metadata = record.value.toString("hex");
          break;
        case this.TLV_TYPES.INVREQ_CHAIN:
          request.chain = this.parseChainHash(record.value);
          break;
        case this.TLV_TYPES.INVREQ_AMOUNT:
          request.amount = this.parseTruncatedUint(record.value).toString();
          break;
        case this.TLV_TYPES.INVREQ_FEATURES:
          request.features = record.value.toString("hex");
          break;
        case this.TLV_TYPES.INVREQ_QUANTITY:
          request.quantity = Number(this.parseTruncatedUint(record.value));
          break;
        case this.TLV_TYPES.INVREQ_PAYER_ID:
          request.payerId = this.parsePoint(record.value);
          break;
        case this.TLV_TYPES.INVREQ_PAYER_NOTE:
          request.payerNote = record.value.toString("utf8");
          break;
        case this.TLV_TYPES.INVREQ_PATHS:
          request.paths = this.parseBlindedPaths(record.value);
          break;
        case this.TLV_TYPES.SIGNATURE:
          request.signature = record.value.toString("hex");
          break;
      }
    }

    if (!request.metadata || !request.payerId || !request.signature) {
      throw new Error("Missing required invoice request fields");
    }

    return request;
  }

  /**
   * Parse an invoice message
   */
  private static parseInvoice(bech32String: string): Invoice {
    const records = this.parseBech32(bech32String);
    const baseRequest = this.parseInvoiceRequest(bech32String);
    const invoice: Invoice = { ...baseRequest, type: "invoice" } as Invoice;

    for (const record of records) {
      switch (record.type) {
        case this.TLV_TYPES.INVOICE_PATHS:
          invoice.paths = this.parseBlindedPaths(record.value);
          break;
        case this.TLV_TYPES.INVOICE_BLINDEDPAY:
          invoice.blindedPayInfo = this.parseBlindedPayInfo(record.value);
          break;
        case this.TLV_TYPES.INVOICE_CREATED_AT:
          invoice.createdAt = Number(this.parseTruncatedUint(record.value));
          break;
        case this.TLV_TYPES.INVOICE_RELATIVE_EXPIRY:
          invoice.relativeExpiry = Number(this.parseTruncatedUint(record.value));
          break;
        case this.TLV_TYPES.INVOICE_PAYMENT_HASH:
          invoice.paymentHash = record.value.toString("hex");
          break;
        case this.TLV_TYPES.INVOICE_AMOUNT:
          invoice.amount = this.parseTruncatedUint(record.value).toString();
          break;
        case this.TLV_TYPES.INVOICE_FALLBACKS:
          invoice.fallbacks = this.parseFallbacks(record.value);
          break;
        case this.TLV_TYPES.INVOICE_FEATURES:
          invoice.features = record.value.toString("hex");
          break;
        case this.TLV_TYPES.INVOICE_NODE_ID:
          invoice.nodeId = this.parsePoint(record.value);
          break;
      }
    }

    if (
      !invoice.paths ||
      !invoice.createdAt ||
      !invoice.paymentHash ||
      typeof invoice.amount === "undefined" ||
      !invoice.nodeId
    ) {
      throw new Error("Missing required invoice fields");
    }

    return invoice;
  }

  // Helper methods for parsing specific field types
  private static parseChainHash(buffer: Buffer): string {
    if (buffer.length !== 32) {
      throw new Error("Invalid chain hash length");
    }
    return buffer.toString("hex");
  }

  private static parseChainHashes(buffer: Buffer): string[] {
    const hashes: string[] = [];
    for (let i = 0; i < buffer.length; i += 32) {
      hashes.push(this.parseChainHash(buffer.subarray(i, i + 32)));
    }
    return hashes;
  }

  private static parsePoint(buffer: Buffer): string {
    if (buffer.length !== 33) {
      throw new Error("Invalid point length");
    }
    return buffer.toString("hex");
  }

  private static parseTruncatedUint(buffer: Buffer): bigint {
    if (buffer.length > 8) {
      throw new Error("Invalid truncated uint length");
    }

    let value = 0n;
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8n) | BigInt(buffer[i]);
    }
    return value;
  }

  private static parseBlindedPaths(buffer: Buffer): BlindedPath[] {
    const decoder = new BlindedPathDecoder(buffer);
    return decoder.decodeBlindedPaths();
  }

  private static parseBlindedPayInfo(buffer: Buffer): BlindedPayInfo[] {
    return [];
  }

  private static parseFallbacks(buffer: Buffer): FallbackAddress[] {
    return [];
  }
}

// const message = BOLT12Parser.decode(
//   "lni1qqgqp9et744ne2r7zg3kq0vz860xgyxvqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glc7qsp2dxt6avc2avfxg2avl58psv7xflwzhfmv2gtm9wytkn5c7uusvpq9qr8h0nh66qpv7xa9hyguuc3ar3y42qlxsxcy0genwt8d7tsamvaqqeec63yjlkyyd05gkfzrwwvaxl8y9jjxemwsqrnc2j6xdjrg0yzj7k5x2pwvyga3heejhra24a0wushp6rfqq3jdf2glnwaydeml333v4xrap92ek3q9qgm7370exxs45f68p42sqqpqrslyuarpkn5r78nquzma65rrs6jqvqcdgzcyypdf0d2vqmqu02ruex9mskrzmr5d3rrzygttq425w89c3z3arqh8f9ql5qe5quxfmcztl0gldv8mxy3sm8x5jscdz27u39fy6luxu8zcdn9j73l3uppfjclju37sq4pfcne5gw9l9vydpsnfwlnkc0f2ncu786mxzpss0szqfhylpxyl0pjvnwheheful2mjtu0zvvnfwmrkzm7e5flnh5dmpmxzqz998um6nckle0n2sse3lad2cm2m87wqssjn8rtrstgw7fr4cq7jcss3aspnmgg2sua776240454kl9f5sv9t3cfe58xur7mch6q9rz6u4sdffra2cz7nwvw2xcmty0eut4dayy03n6guksvrvtt237tl6264ks8yyfhqjspn9uj9zg4wrhpsvrw56skaqcfd3ul6d6tlpw3qrz5jnuz609ee7czc6n629rm5ccncackrspca3mpzk4phrjwcc9hukuxck2u93wkpmp0hx8rn2c7pd65hsl8hwkzqemkx7p2g0zkx92gzvyg5cfpktvm42g57d6spjy7clkwtrtz72pmm4a990phfa3exzldwsydqxpq3tepwk5v9474zmmd98ttyyzx058t2sf5dvpn73hlvdhnycv55t4lsv6a9080a83dl9s7mf02ukt48nhche6he45j9npx87jk7eyhzxsrjpzz0t5e2n206an9ma59uhatgsuqqqq86qqqqqxgq9zqqqqqqqqqqp7sqqqqqqqqqcdgqqqpfqyvm5xhjdxqy72sg8wkseztv2dpeudmcx0ahz6ezxx86thwrzvjfq400rnhh7vmcrs6k4qxqvx5zhqxqsqqzczzq3jdf2glnwaydeml333v4xrap92ek3q9qgm7370exxs45f68p42srcyql379vw777n9rmj66ze9qmq8agvuz9fdg6nnu5wcdn6ppvrh3rjcftld8rtakadngfdalgq9czau46yfa07pqpeffqlx8qaruzv7w5qs",
// );

const message = BOLT12Parser.decode(
  "lno1zrxq8pjw7qjlm68mtp7e3yvxee4y5xrgjhhyf2fxhlphpckrvevh50u0qvkrg7d9ccqz2pwl5h6950geyuzthnw48c9vzxnftwuejd9h8cnpvqsr8z0tck0dlhh4jm7xwzkstavrsf2qwya7vrl7gphuwk2vgcf84unsqve5apem23d4u6gnr3uznx5h6nlfqlp8w59ptau96xr9wl95mwkx24y2qq4pmxswvfpll5xna6t44yn4h3vqqfklcug6y3e0spezwzjlws7uhf67zacma5c6g38lyn3hmn6h7dkmjqqsclcy7fsfxcktk5cqcg85znwd0u",
);

console.log(JSON.stringify(message, null, 2));
