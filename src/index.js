import { Buffer } from 'buffer'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import { fromwire_bigsize } from './fundamental_types.js'
import { tagParser } from './parser.js'

const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const isBech32 = {}
const ALPHABET_MAP = {}

for (let z = 0; z < ALPHABET.length; z++) {
  const x = ALPHABET.charAt(z)
  ALPHABET_MAP[x] = z
  isBech32[x] = true
}

function hash(message) {
  return sha256(message)
}

function convert(data, inBits, outBits) {
  let value = 0
  let bits = 0
  const maxV = (1 << outBits) - 1

  const result = []
  for (let i = 0; i < data.length; ++i) {
    value = (value << inBits) | data[i]
    bits += inBits

    while (bits >= outBits) {
      bits -= outBits
      result.push((value >> bits) & maxV)
    }
  }

  if (bits > 0) {
    result.push((value << (outBits - bits)) & maxV)
  }
  return result
}

function check_offer(final) {
  if (!('offer_description' in final)) {
    throw Error('missing description')
  }

  if (!('offer_node_id' in final)) {
    throw Error('missing node_id')
  }

  if ('offer_absolute_expiry' in final) {
    if (final['offer_absolute_expiry'] < new Date() / 1000) {
      throw Error('Absolute_expiry has passed!')
    }
  }

  return true
}

function check_invoice(final) {
  if (
    !'amount' in final ||
    !'description' in final ||
    !'created_at' in final ||
    !'payment_hash' in final
  ) {
    throw Error('(amount, description, created_at, payment_hash) are mandatory fields!')
  }

  const sec_since_epoch = new Date() / 1000

  if ('relative_expiry' in final) {
    if (sec_since_epoch > final['created_at'] + final['relative_expiry']) {
      throw Error('invoice is expired!')
    }
  } else {
    //Is this 7200 random?
    if (sec_since_epoch > final['created_at'] + 7200) {
      throw Error('invoice is expired!')
    }
  }

  if ('blinded_path' in final) {
    if (!'blinded_payinfo' in final) {
      throw Error('blinded_payinfo is missing!')
    }
  }

  return true
}

function check_invoice_request(final) {
  if (!'payer_key' in final || !'offer_id' in final || !'payer_signature' in final) {
    throw Error('(payer_key, offer_id, payer_signature) is mandatory')
  }

  return true
}

/**
 * @param {string} paymentReq
 * @returns { import("./types").DecodeResponse }
 */
function decode(paymentReq) {
  if (typeof paymentReq !== 'string') {
    throw new Error('Lightning Payment Request must be string')
  }

  let paymentRequest = ''

  for (let i = 0; i < paymentReq.length; i++) {
    if (paymentReq[i] == '\n' || paymentReq[i] == '\r') {
      paymentRequest += ' '
      continue
    } else {
      paymentRequest += paymentReq[i]
    }
  }

  for (let i = 0; i < paymentRequest.length; i++) {
    if (paymentRequest[i] == '+') {
      let s = i,
        e
      i++

      while (i < paymentRequest.length && paymentRequest[i] == ' ') {
        i++
      }

      e = i

      if (
        e == paymentRequest.length ||
        s == 0 ||
        paymentRequest.charAt(s - 1) in isBech32 == false ||
        paymentRequest.charAt(e) in isBech32 == false
      ) {
        throw new Error('Lightning Payment Request must be string')
      }

      paymentRequest = paymentRequest.slice(0, s) + paymentRequest.slice(e)
    }
  }

  if (paymentRequest.indexOf(' ') != -1) throw new Error('Lightning Payment Request must be string')

  if (
    paymentRequest != paymentRequest.toLowerCase() &&
    paymentRequest != paymentRequest.toUpperCase()
  ) {
    throw new Error('Lightning Payment Request must be string')
  }

  paymentRequest = paymentRequest.toLowerCase()

  if (paymentRequest.slice(0, 2) != 'ln') {
    throw new Error('Not a proper lightning payment request')
  }

  if (paymentRequest.indexOf('1') == -1) {
    throw new Error('Separator not present')
  }

  const encodedData = paymentRequest.slice(paymentRequest.lastIndexOf('1') + 1)
  const prefix = paymentRequest.slice(0, paymentRequest.lastIndexOf('1'))

  for (let i = 0; i < encodedData.length; i++) {
    if (encodedData.charAt(i) in isBech32 == false) {
      throw new Error('Not a proper lightning pay request')
    }
  }

  let words = []
  let type

  switch (prefix) {
    case 'lno':
      type = 'bolt12 offer'
      break
    case 'lnr':
      type = 'bolt12 invoice_request'
      break
    case 'lni':
      type = 'bolt12 invoice'
      break
    default:
      throw new Error(prefix.toString() + ' is not a proper lightning prefix')
  }

  for (let i = 0; i < encodedData.length; i++) {
    words[words.length] = ALPHABET_MAP[encodedData.charAt(i)]
  }

  const words_8bit = convert(words, 5, 8)

  const tags = []
  const final = {}
  const unknowns = {}
  const tgcode = []

  final.type = type

  let buffer = Buffer.from(words_8bit)

  if ((words.length * 5) % 8 != 0) {
    buffer = buffer.subarray(0, -1)
  }

  while (buffer.length) {
    let tlvs = []
    let res = fromwire_bigsize(buffer)

    const tagCode = res[0]

    if (tgcode.length > 0 && tagCode <= tgcode[tgcode.length - 1]) {
      throw Error('TLVs should be in ascending order!')
    }

    tgcode.push(tagCode)

    tlvs.push(tagCode)
    buffer = res[1]
    res = fromwire_bigsize(buffer)
    const tagLength = res[0]
    tlvs.push(tagLength)
    buffer = res[1]
    const tagWords = buffer.subarray(0, tagLength)

    if (tagCode in tagParser) {
      const [name, parser] = tagParser[tagCode]
      final[name] = parser(Buffer.from(tagWords))
    } else if (Number(tagCode) % 2 == 1) {
      unknowns[tagCode] = tagWords
      final[tagcode] = tagWords.toString('hex')
    } else {
      if (tagCode !== 160 && tagCode !== 162) {
        throw Error('Invalid: Unknown even field number ' + tagCode)
      }
    }

    tlvs.push(tagWords)
    buffer = buffer.subarray(tagLength)

    if (
      (prefix === 'lno' && tagCode > 0 && tagCode < 80) ||
      ((prefix === 'lni' || prefix === 'lnr') && tagCode < 240)
    ) {
      tags.push(Buffer.concat([Buffer.from(tlvs.slice(0, 2)), tlvs[2]]).toString('hex'))
    }
  }

  const id = bytesToHex(hash(Buffer.concat(tags.map((tag) => Buffer.from(tag, 'hex')))))

  if (prefix == 'lno') {
    if (check_offer(final)) {
      final.valid = true
      final.offer_id = id
      return final
    }
  }
  if (prefix == 'lni') {
    if (check_invoice(final)) {
      final.valid = true
      final.offer_id = id
      return final
    }
  }
  if (prefix == 'lnr') {
    if (check_invoice_request(final)) {
      final.valid = true
      final.invreq_id = id
      return final
    }
  }
}

export default decode
