import { Buffer } from 'buffer/'

// Error types for different parsing failures
export class TLVParsingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TLVParsingError'
  }
}

// Interface for parsed TLV record
export interface TLVRecord {
  type: bigint
  length: bigint
  value: Buffer
}

export class TLVParser {
  private position: number = 0
  private buffer: Buffer

  constructor(data: Buffer) {
    this.buffer = data
  }

  // Parse BigSize format as specified in the Lightning spec
  private parseBigSize(): bigint {
    if (this.position >= this.buffer.length) {
      throw new TLVParsingError('Unexpected end of data while parsing BigSize')
    }

    const first = this.buffer[this.position]

    // Single byte encoding (0-252)
    if (first <= 252) {
      this.position += 1
      return BigInt(first)
    }

    // Two byte encoding (253 + uint16)
    if (first === 253) {
      if (this.position + 3 > this.buffer.length) {
        throw new TLVParsingError('Insufficient bytes for 2-byte BigSize')
      }
      const value = this.buffer.readUInt16BE(this.position + 1)
      if (value <= 252) {
        throw new TLVParsingError('Non-minimal BigSize encoding')
      }
      this.position += 3
      return BigInt(value)
    }

    // Four byte encoding (254 + uint32)
    if (first === 254) {
      if (this.position + 5 > this.buffer.length) {
        throw new TLVParsingError('Insufficient bytes for 4-byte BigSize')
      }
      const value = this.buffer.readUInt32BE(this.position + 1)
      if (value <= 0xffff) {
        throw new TLVParsingError('Non-minimal BigSize encoding')
      }
      this.position += 5
      return BigInt(value)
    }

    // Eight byte encoding (255 + uint64)
    if (first === 255) {
      if (this.position + 9 > this.buffer.length) {
        throw new TLVParsingError('Insufficient bytes for 8-byte BigSize')
      }
      const value = this.buffer.readBigUInt64BE(this.position + 1)
      if (BigInt(value.toString()) <= 0xffffffffn) {
        throw new TLVParsingError('Non-minimal BigSize encoding')
      }
      this.position += 9
      return BigInt(value.toString())
    }

    throw new TLVParsingError('Invalid BigSize encoding')
  }

  // Parse a single TLV record
  private parseTLVRecord(): TLVRecord {
    // Parse type
    const type = this.parseBigSize()

    // Parse length
    const length = this.parseBigSize()

    // Check if we have enough bytes for the value
    if (this.position + Number(length) > this.buffer.length) {
      throw new TLVParsingError('Insufficient bytes for TLV value')
    }

    // Extract value
    const value = this.buffer.subarray(this.position, this.position + Number(length))
    this.position += Number(length)

    return { type, length, value: Buffer.from(value) }
  }

  // Parse entire TLV stream
  public parseTLVStream(): TLVRecord[] {
    const records: TLVRecord[] = []
    let lastType: bigint = BigInt(-1)

    while (this.position < this.buffer.length) {
      const record = this.parseTLVRecord()

      // Check for strictly increasing type values
      if (record.type <= lastType) {
        throw new TLVParsingError('TLV records not in strictly-increasing order')
      }

      // Handle unknown even-typed records (must fail)
      if (record.type >= BigInt(65536) && record.type % BigInt(2) === BigInt(0)) {
        throw new TLVParsingError('Unknown even-typed record encountered')
      }

      records.push(record)
      lastType = record.type
    }

    return records
  }
}
