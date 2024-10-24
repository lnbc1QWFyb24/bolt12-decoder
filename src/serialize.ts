import type { TLVRecord } from './tlv-parser'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'

// Constants for BigSize encoding
const BIGSIZE_PREFIX_THRESHOLD = 0xfd
const BIGSIZE_16 = 0xfd
const BIGSIZE_32 = 0xfe
const BIGSIZE_64 = 0xff

function encodeBigSize(value: bigint): Uint8Array {
  if (value < BigInt(BIGSIZE_PREFIX_THRESHOLD)) {
    return new Uint8Array([Number(value)])
  } else if (value < BigInt(0x10000)) {
    const buf = new Uint8Array(3)
    buf[0] = BIGSIZE_16
    new DataView(buf.buffer).setUint16(1, Number(value), false) // false for big-endian
    return buf
  } else if (value < BigInt(0x100000000)) {
    const buf = new Uint8Array(5)
    buf[0] = BIGSIZE_32
    new DataView(buf.buffer).setUint32(1, Number(value), false) // false for big-endian
    return buf
  } else {
    const buf = new Uint8Array(9)
    buf[0] = BIGSIZE_64
    const high = Number(value >> BigInt(32))
    const low = Number(value & BigInt(0xffffffff))
    const view = new DataView(buf.buffer)
    view.setUint32(1, high, false) // false for big-endian
    view.setUint32(5, low, false)
    return buf
  }
}

function serializeTLVRecord(record: TLVRecord): Uint8Array {
  // Validate that type and length are minimally encoded
  if (record.type < BigInt(0) || record.length < BigInt(0)) {
    throw new Error('Type and length must be non-negative')
  }

  if (record.value.length !== Number(record.length)) {
    throw new Error('Value length does not match length field')
  }

  // Encode type and length using BigSize
  const typeBuffer = encodeBigSize(record.type)
  const lengthBuffer = encodeBigSize(record.length)

  // Concatenate all parts
  const totalLength = typeBuffer.length + lengthBuffer.length + record.value.length
  const result = new Uint8Array(totalLength)
  result.set(typeBuffer, 0)
  result.set(lengthBuffer, typeBuffer.length)
  result.set(record.value, typeBuffer.length + lengthBuffer.length)
  return result
}

export function serializeTLVRecords(records: TLVRecord[]): string {
  // Calculate total length
  const totalLength = records.reduce((sum, record) => {
    const serialized = serializeTLVRecord(record)
    return sum + serialized.length
  }, 0)

  // Serialize all records into a single buffer
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const record of records) {
    const serialized = serializeTLVRecord(record)
    result.set(serialized, offset)
    offset += serialized.length
  }

  return bytesToHex(sha256(result))
}
