export enum GenesisBlockhash {
  regtest = '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
  mainnet = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
  testnet = '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943'
}

export type DecodedType = 'bolt12 offer' | 'bolt12 invoice' | 'bolt12 invoice_request'

export type DecodedCommon = {
  type: DecodedType
  valid: boolean
}

export type TLV = {
  type: number
  length: number
  value: string
}

export type OfferCommon = {
  offer_id: string
  offer_description: string
  offer_node_id: string
  offer_chains?: GenesisBlockhash[]
  offer_metadata?: string
  offer_currency?: string
  currency_minor_unit?: number
  offer_amount?: string | number
  offer_amount_msat?: string | number
  offer_issuer?: string
  offer_features?: string
  offer_absolute_expiry?: number
  offer_quantity_max?: number
  offer_recurrence?: {
    time_unit: number
    period: number
    time_unit_name?: string
    basetime?: number
    start_any_period?: number
    limit?: number
    paywindow?: {
      seconds_before: number
      seconds_after: number
      proportional_amount?: boolean
    }
  }
  warning_unknown_offer_currency?: number
}

export type DecodedBolt12Offer = DecodedCommon &
  OfferCommon & {
    unknown_offer_tlvs?: TLV[]
  }

export type Bolt12InvoiceCommon = {
  invreq_metadata: string
  invreq_payer_id: string
  invoice_created_at: number
  invoice_payment_hash: string
  invoice_amount_msat: string | number
  signature: string
  invreq_chain?: string
  invreq_amount_msat?: string | number
  invreq_features?: string
  invreq_quantity?: number
  invreq_payer_note?: string
  invreq_recurrence_counter?: number
  invreq_recurrence_start?: number
}

export type DecodedBolt12Invoice = DecodedCommon &
  Omit<OfferCommon, 'offer_id'> &
  Bolt12InvoiceCommon & {
    invoice_relative_expiry?: number
    invoice_fallbacks: {
      version: number
      hex: string
      address?: string
    }[]
    invoice_features?: string
    invoice_node_id?: string
    invoice_recurrence_basetime?: number
    unknown_invoice_tlvs?: TLV[]
  }

export type DecodedBolt12InvoiceRequest = DecodedCommon &
  Omit<OfferCommon, 'offer_id'> &
  Bolt12InvoiceCommon & {
    invreq_id: string
    unknown_invoice_request_tlvs: TLV[]
  }

export type DecodeResponse = DecodedBolt12Offer | DecodedBolt12Invoice | DecodedBolt12InvoiceRequest
