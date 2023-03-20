class TruncatedIntType {
  constructor(name, byteslen) {
    this.val = name
    this.bytelen = byteslen
  }
  read() {
    let buffer = this.val
    if (buffer.length > this.bytelen) throw Error('Out of Bounds!')
    if (buffer.length == 0) buffer = Buffer.from('00', 'hex')
    let big_i = BigInt('0x' + buffer.toString('hex'))
    // Number is limited to 2^53 - 1, so use BigInt if required!
    let num = Number(big_i)
    if (num != big_i) {
      num = big_i
    }
    return [num, Buffer.alloc(0)]
  }
  write() {
    var value = this.val
    let buff = value.toString(16)
    if (buff.length > 2 * this.bytelen) throw Error('Out of Bounds!')
    buff = buff.padStart(2 * this.bytelen, '0')
    buff = Buffer.from(buff, 'hex')
    let waste_bytes = 0
    for (let i = 0; i < buff.length; i++) {
      if (buff[i] === 0) waste_bytes++
      else break
    }
    return buff.slice(waste_bytes)
  }
}

class IntegerType {
  constructor(name, bytelen) {
    this.val = name
    this.bytelen = bytelen
  }
  read() {
    let buffer = this.val
    if (buffer.length < this.bytelen) throw Error('Not enough bytes!')
    return [
      parseInt(Number('0x' + buffer.slice(0, this.bytelen).toString('hex')), 10),
      buffer.slice(this.bytelen)
    ]
  }
  write() {
    let value = this.val
    let buff = value.toString(16)
    if (buff.length > 2 * this.bytelen) throw Error('Out of Bounds!')
    buff = buff.padStart(2 * this.bytelen, '0')
    buff = Buffer.from(buff, 'hex')
    return buff
  }
}

class FundamentalHexType {
  constructor(val, byteslen) {
    this.val = val
    this.byteslen = byteslen
  }
  read() {
    let buffer = this.val
    if (buffer.length < this.byteslen) {
      throw Error('Not enough bytes!')
    }
    return [Buffer.from(buffer, 'hex').toString('hex'), buffer.slice(this.byteslen)]
  }
  write() {
    if (this.val.length != 2 * this.byteslen) {
      throw Error('Buffer length is not appropriate')
    }

    return Buffer.from(this.val, 'hex')
  }
}

export function towire_tu16(value) {
  return new TruncatedIntType(value, 2).write()
}

export function fromwire_tu16(buffer) {
  return new TruncatedIntType(buffer, 2).read()
}

export function towire_tu32(value) {
  return new TruncatedIntType(value, 4).write()
}

export function fromwire_tu32(buffer) {
  return new TruncatedIntType(buffer, 4).read()
}

export function towire_tu64(value) {
  return new TruncatedIntType(value, 8).write()
}

export function fromwire_tu64(buffer) {
  return new TruncatedIntType(buffer, 8).read()
}

export function towire_u16(value) {
  return new IntegerType(value, 2).write()
}

export function fromwire_u16(buffer) {
  return new IntegerType(buffer, 2).read()
}

export function towire_u32(value) {
  return new IntegerType(value, 4).write()
}

export function fromwire_u32(buffer) {
  return new IntegerType(buffer, 4).read()
}

export function towire_u64(value) {
  return new IntegerType(value, 8).write()
}

export function fromwire_u64(buffer) {
  return new IntegerType(buffer, 8).read()
}

export function towire_byte(value) {
  return new IntegerType(value, 1).write()
}

export function fromwire_byte(buffer) {
  return new IntegerType(buffer, 1).read()
}

export function towire_chain_hash(value) {
  return new FundamentalHexType(value, 32).write()
}

export function fromwire_chain_hash(buffer) {
  return new FundamentalHexType(buffer, 32).read()
}

export function fromwire_channel_id(buffer) {
  return new FundamentalHexType(buffer, 32).read()
}

export function towire_sha256(value) {
  return new FundamentalHexType(value, 32).write()
}

export function fromwire_sha256(buffer) {
  return new FundamentalHexType(buffer, 32).read()
}

export function towire_point(value) {
  return new FundamentalHexType(value, 33).write()
}

export function fromwire_point(buffer) {
  return new FundamentalHexType(buffer, 33).read()
}

export function towire_point32(value) {
  return new FundamentalHexType(value, 32).write()
}

export function fromwire_point32(buffer) {
  return new FundamentalHexType(buffer, 32).read()
}

export function towire_bip340sig(value) {
  return new FundamentalHexType(value, 64).write()
}

export function fromwire_bip340sig(buffer) {
  return new FundamentalHexType(buffer, 64).read()
}

export function towire_array_utf8(value) {
  return Buffer.from(value.toString())
}

export function fromwire_array_utf8(buffer, len) {
  return [buffer.slice(0, len).toString('utf8'), buffer]
}

export function fromwire_bigsize(buffer) {
  var val = fromwire_byte(buffer)
  buffer = val[1]

  let minval
  if (val == 0xfd) {
    minval = 0xfd
    val = fromwire_u16(buffer)
  } else if (val == 0xfe) {
    minval = 0x10000
    val = fromwire_u32(buffer)
  } else if (val == 0xff) {
    minval = 0x100000000
    val = fromwire_u64(buffer)
  } else minval = 0
  if (val < minval) {
    throw Error('non minimal-encoded bigsize')
  }

  return val
}
