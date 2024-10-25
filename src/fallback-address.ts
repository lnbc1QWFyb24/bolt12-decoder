import { Buffer } from 'buffer/'

export interface FallbackAddress {
  version: number // Witness version
  address: Buffer // Witness program
}

export class FallbackAddressParser {
  private position: number = 0
  private buffer: Buffer

  constructor(data: Buffer) {
    this.buffer = data
  }

  private readUInt8(): number {
    if (this.position >= this.buffer.length) {
      throw new Error('Buffer overflow while reading version')
    }
    return this.buffer[this.position++]
  }

  private readUInt16BE(): number {
    if (this.position + 2 > this.buffer.length) {
      throw new Error('Buffer overflow while reading length')
    }
    const value = this.buffer.readUInt16BE(this.position)
    this.position += 2
    return value
  }

  private readBytes(length: number): Buffer {
    if (this.position + length > this.buffer.length) {
      throw new Error('Buffer overflow while reading address')
    }
    const data = this.buffer.subarray(this.position, this.position + length)
    this.position += length
    return Buffer.from(data)
  }

  private parseSingleAddress(): FallbackAddress {
    // Read version byte (1 byte)
    const version = this.readUInt8()
    if (version > 16) {
      throw new Error('Invalid witness version')
    }

    // Read address length (2 bytes)
    const length = this.readUInt16BE()
    if (length < 2 || length > 40) {
      throw new Error('Invalid witness program length')
    }

    // Read address bytes
    const address = this.readBytes(length)

    // Validate according to witness version requirements
    switch (version) {
      case 0:
        // For version 0, only lengths 20 (P2WPKH) and 32 (P2WSH) are valid
        if (length !== 20 && length !== 32) {
          throw new Error('Invalid P2WPKH/P2WSH witness program length')
        }
        break

      case 1:
        // For version 1, Taproot requires exactly 32 bytes
        if (length !== 32) {
          throw new Error('Invalid Taproot witness program length')
        }
        break

      default:
        // For future witness versions, we accept 2-40 bytes as per spec
        break
    }

    return {
      version,
      address
    }
  }

  public parse(): FallbackAddress[] {
    const addresses: FallbackAddress[] = []

    // Parse addresses until we run out of buffer
    while (this.position < this.buffer.length) {
      try {
        addresses.push(this.parseSingleAddress())
      } catch (error) {
        throw new Error(`Failed to parse fallback address: ${(error as Error).message}`)
      }
    }

    return addresses
  }

  public static parse(buffer: Buffer): FallbackAddress[] {
    const parser = new FallbackAddressParser(buffer)
    return parser.parse()
  }
}
