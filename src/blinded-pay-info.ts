import { Buffer } from 'buffer/'

export interface BlindedPayInfo {
  feeBaseMsat: number
  feeProportionalMillionths: number
  cltvExpiryDelta: number
  htlcMinimumMsat: string
  htlcMaximumMsat: string
  features: string
}

export class BlindedPayInfoParser {
  private position: number = 0
  private buffer: Buffer

  constructor(data: Buffer) {
    this.buffer = data
  }

  private readUInt32BE(): number {
    if (this.position + 4 > this.buffer.length) {
      throw new Error('Buffer overflow while reading uint32')
    }
    const value = this.buffer.readUInt32BE(this.position)
    this.position += 4
    return value
  }

  private readUInt16BE(): number {
    if (this.position + 2 > this.buffer.length) {
      throw new Error('Buffer overflow while reading uint16')
    }
    const value = this.buffer.readUInt16BE(this.position)
    this.position += 2
    return value
  }

  private readUInt64BE(): bigint {
    if (this.position + 8 > this.buffer.length) {
      throw new Error('Buffer overflow while reading uint64')
    }
    const value = this.buffer.readBigUInt64BE(this.position)
    this.position += 8
    return BigInt(value.toString())
  }

  private readBytes(length: number): Buffer {
    if (this.position + length > this.buffer.length) {
      throw new Error('Buffer overflow while reading bytes')
    }
    const data = this.buffer.subarray(this.position, this.position + length)
    this.position += length
    return Buffer.from(data)
  }

  private parseSinglePayInfo(): BlindedPayInfo {
    // Read fee base (4 bytes)
    const feeBaseMsat = this.readUInt32BE()

    // Read fee proportional (4 bytes)
    const feeProportionalMillionths = this.readUInt32BE()

    // Read CLTV expiry delta (2 bytes)
    const cltvExpiryDelta = this.readUInt16BE()

    // Read HTLC minimum (8 bytes)
    const htlcMinimumMsat = this.readUInt64BE().toString()

    // Read HTLC maximum (8 bytes)
    const htlcMaximumMsat = this.readUInt64BE().toString()

    // Read feature length (2 bytes)
    const featureLength = this.readUInt16BE()

    // Validate feature length
    if (featureLength > 1024) {
      throw new Error('Feature vector too long')
    }

    // Read features
    const features = this.readBytes(featureLength).toString('hex')

    // Validate values
    if (htlcMinimumMsat > htlcMaximumMsat) {
      throw new Error('HTLC minimum larger than maximum')
    }

    if (cltvExpiryDelta === 0) {
      throw new Error('CLTV expiry delta cannot be zero')
    }

    // Maximum reasonable fee rate is 100%
    if (feeProportionalMillionths > 1000000) {
      throw new Error('Fee rate too high')
    }

    return {
      feeBaseMsat,
      feeProportionalMillionths,
      cltvExpiryDelta,
      htlcMinimumMsat,
      htlcMaximumMsat,
      features
    }
  }

  public parse(): BlindedPayInfo[] {
    const payInfos: BlindedPayInfo[] = []

    // Parse until we run out of buffer
    while (this.position < this.buffer.length) {
      try {
        payInfos.push(this.parseSinglePayInfo())
      } catch (error) {
        throw new Error(`Failed to parse blinded pay info: ${(error as Error).message}`)
      }
    }

    if (payInfos.length === 0) {
      throw new Error('No blinded pay info found')
    }

    return payInfos
  }

  public static parse(buffer: Buffer): BlindedPayInfo[] {
    const parser = new BlindedPayInfoParser(buffer)
    return parser.parse()
  }
}
