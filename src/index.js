import { Buffer } from 'buffer'
import { sha256 } from '@noble/hashes/sha256'
import { bytesToHex } from '@noble/hashes/utils'
import schnorr from 'bip-schnorr'
import { tlv_offer, tlv_invoice_request, tlv_invoice } from './gencode.js'
import { fromwire_bigsize } from './fundamental_types.js'

const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
const isBech32 = {}
const ALPHABET_MAP = {}

class Recurrence {
  constructor(
    recurrence,
    recurrence_paywindow = null,
    recurrence_limit = null,
    recurrence_base = null
  ) {
    this.period = recurrence['period']
    this.time_unit = recurrence['time_unit']
    this.paywindow = recurrence_paywindow
    this.limit = recurrence_limit
    this.base = recurrence_base
  }
  has_fixed_base() {
    return this.base != null
  }
  can_start_offset() {
    return this.has_fixed_base && this.base['start_any_period']
  }
  _adjust_date(basedate, units, n, sameday) {
    while (true) {
      if (units == 'seconds') {
        var ret = new Date(basedate)
        ret.setSeconds(ret.getSeconds() + n)
      } else if (units == 'days') {
        var ret = new Date(basedate)
        ret.setDate(ret.getDate() + n)
      } else if (units == 'months') {
        var ret = new Date(basedate)
        ret.setMonth(ret.getMonth() + n)
      } else if (units == 'years') {
        var ret = new Date(basedate)
        ret.setMonth(ret.getMonth() + 12 * n)
      }
      if (!sameday || ret.getDate() == basedate.getDate()) return ret
      basedate.setDate(basedate.getDate() - 1)
    }
  }
  _get_period(n, basetime) {
    var basedate = new Date()
    basedate.setTime(basetime * 1000)
    if (this.time_unit == 0) {
      var units = 'seconds'
      var sameday = false
    } else if (this.time_unit == 1) {
      var units = 'days'
      var sameday = false
    } else if (this.time_unit == 2) {
      var units = 'months'
      var sameday = true
    } else if (this.time_unit == 3) {
      var units = 'years'
      var sameday = true
    }

    var startdate = new Date()
    startdate.setTime(this._adjust_date(basedate, units, this.period * n, sameday))
    var enddate = new Date()
    enddate.setTime(this._adjust_date(startdate, units, this.period, sameday))
    var start = startdate.getTime()
    var end = enddate.getTime()

    if (this.paywindow == null) {
      var paystartdate = this._adjust_date(startdate, units, -this.period, sameday)
      var paystart = paystartdate.getTime()
      var payend = end
    } else {
      var paystart = start - Number(this.paywindow['seconds_before'])
      var payend = start + Number(this.paywindow['seconds_after'])
    }
    return {
      start: start / 1000,
      end: end / 1000,
      paystart: paystart / 1000,
      payend: payend / 1000
    }
  }
  get_period(n) {
    if (this.limit != null && n > this.limit && n <= 0) {
      return null
    }
    if (this.base != null) {
      var basetime = this.base['basetime']
    }
    return this._get_period(n, basetime)
  }
  get_pay_factor(period, time) {
    if (this.paywindow == null || !this.paywindow['proportional_amount']) return 1
    if (time < period['start']) return 1
    if (time > period['end']) return 0
    return (period['end'] - time) / period['end'] - period['start']
  }
  period_start_offset(when) {
    if (this.can_start_offset) {
      if (this.time_unit == 0) {
        var approx_mul = 1
      } else if (this.time_unit == 1) {
        var approx_mul = 24 * 60 * 60
      } else if (this.time_unit == 2) {
        var approx_mul = 30 * 24 * 60 * 60
      } else if (this.time_unit == 3) {
        var approx_mul = 365 * 30 * 24 * 60 * 60
      }
      var period_num = (when - self.base['basetime']) / (self.period * approx_mul)
      while (true) {
        period = self._get_period(period_num, self.base['basetime'])
        if (when < period['end']) {
          period_num -= 1
        } else if (when >= this.period.end) {
          period_num += 1
        } else {
          return period_num
        }
      }
    } else throw Error('can_start_offset is not true')
  }
}

for (let z = 0; z < ALPHABET.length; z++) {
  const x = ALPHABET.charAt(z)
  ALPHABET_MAP[x] = z
  isBech32[x] = true
}

function hash(message) {
  return sha256(message)
}

function taggedHash(tag, msg) {
  const hashed = sha256.create()
  hashed.update(tag)
  hashed.update(Buffer.from(msg, 'hex'))
  return hashed.digest()
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

function leaves(list_of_nodes) {
  const parents = []

  if (list_of_nodes.length % 2 == 0) {
    for (let i = 0; i < list_of_nodes.length; i += 2) {
      const smallerSHA256 =
        list_of_nodes[i] < list_of_nodes[i + 1] ? list_of_nodes[i] : list_of_nodes[i + 1]

      const greaterSHA256 =
        list_of_nodes[i] > list_of_nodes[i + 1] ? list_of_nodes[i] : list_of_nodes[i + 1]

      parents.push(
        bytesToHex(
          taggedHash(Buffer.from('LnBranch'), Buffer.from(smallerSHA256 + greaterSHA256, 'hex'))
        )
      )
    }
  } else {
    for (let i = 0; i < list_of_nodes.length - 1; i += 2) {
      const smallerSHA256 =
        list_of_nodes[i] < list_of_nodes[i + 1] ? list_of_nodes[i] : list_of_nodes[i + 1]

      const greaterSHA256 =
        list_of_nodes[i] > list_of_nodes[i + 1] ? list_of_nodes[i] : list_of_nodes[i + 1]

      parents.push(
        bytesToHex(
          taggedHash(Buffer.from('LnBranch'), Buffer.from(smallerSHA256 + greaterSHA256, 'hex'))
        )
      )
    }

    parents.push(list_of_nodes[list_of_nodes.length - 1])
  }

  return parents
}

function branch_from_tlv(firstTlv, tlv) {
  const l = bytesToHex(taggedHash(Buffer.from('LnLeaf'), tlv))
  const [tlv_type] = fromwire_bigsize(Buffer.from(tlv, 'hex'))

  const lnonce = bytesToHex(
    taggedHash(
      Buffer.concat([Buffer.from('LnNonce'), Buffer.from(firstTlv, 'hex')]),
      tlv_type.toString(16)
    )
  )

  const smallerSHA256 = l < lnonce ? l : lnonce
  const greaterSHA256 = l > lnonce ? l : lnonce

  return bytesToHex(
    taggedHash(Buffer.from('LnBranch'), Buffer.from(smallerSHA256 + greaterSHA256, 'hex'))
  )
}

function check_sign(msgname, fieldname, merkle_root, pubkey32, bip340sig) {
  const msg = bytesToHex(taggedHash(Buffer.from('lightning' + msgname + fieldname), merkle_root))

  try {
    schnorr.verify(
      Buffer.from(pubkey32, 'hex'),
      Buffer.from(msg, 'hex'),
      Buffer.from(bip340sig, 'hex')
    )
  } catch (e) {
    throw Error('bad_signature')
  }
}

function merkle_calc(tlvs) {
  let merkle_nodes = []

  for (let i = 0; i < tlvs.length; i++) {
    merkle_nodes[merkle_nodes.length] = branch_from_tlv(tlvs[0], tlvs[i])
  }

  while (merkle_nodes.length != 1) {
    merkle_nodes = leaves(merkle_nodes)
  }
  return merkle_nodes[0]
}

function check_offer(final) {
  if ('signature' in final) {
    try {
      check_sign(
        (prefix = 'offer'),
        (fieldname = 'signature'),
        final['offer_id'],
        final['node_id'],
        final['signature']
      )
    } catch (e) {
      throw Error('Bad Signature!')
    }
  }

  if (!('offer_description' in final)) {
    throw Error('missing description')
  }

  if (!('offer_node_id' in final)) {
    throw Error('missing node_id')
  }

  if ('offer_absolute_expiry' in final) {
    sec_since_epoch = new Date() / 1000
    if (final['offer_absolute_expiry'] < sec_since_epoch) {
      throw Error('Absolute_expiry has passed!')
    }
  }

  return true
}

function check_invoice(final) {
  if ('signature' in final) {
    try {
      check_sign(
        (prefix = 'invoice'),
        (fieldname = 'signature'),
        final['offer_id'],
        final['offer_node_id'],
        final['signature']
      )
    } catch (e) {
      throw Error('Bad Signature!')
    }
  } else {
    throw Error('Missing signature!')
  }

  if (
    !'amount' in final ||
    !'description' in final ||
    !'created_at' in final ||
    !'payment_hash' in final
  ) {
    throw Error('(amount, description, created_at, payment_hash) are mandatory fields!')
  }

  if ('relative_expiry' in final) {
    sec_since_epoch = new Date() / 1000
    if (sec_since_epoch > final['created_at'] + final['relative_expiry']) {
      throw Error('invoice is expired!')
    }
  } else {
    sec_since_epoch = new Date() / 1000
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

  if ('payer_signature' in final) {
    try {
      check_sign(
        (prefix = 'invoice_request'),
        (fieldname = 'payer_signature'),
        final['offer_id'],
        final['payer_key'],
        final['payer_signature']
      )
    } catch (e) {
      throw Error('Bad Signature!')
    }
  } else {
    throw Error('Missing  payer_signature!')
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
  let TAGPARSER

  switch (prefix) {
    case 'lno':
      type = 'bolt12 offer'
      TAGPARSER = tlv_offer
      break
    case 'lnr':
      type = 'bolt12 invoice_request'
      TAGPARSER = tlv_invoice_request
      break
    case 'lni':
      type = 'bolt12 invoice'
      TAGPARSER = tlv_invoice
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

  final['type'] = type

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

    if (tagCode in TAGPARSER) {
      const tagName = TAGPARSER[tagCode][0]
      final[tagName] = TAGPARSER[tagCode][2](Buffer.from(tagWords))
    }
    // This doesn't apply to invoices?
    else if (Number(tagCode) % 2 == 1) {
      unknowns[tagCode] = tagWords
      final[tagcode] = tagWords.toString('hex')
    } else {
      throw Error('Invalid: Unknown even field number ' + tagCode)
    }

    tlvs.push(tagWords)
    buffer = buffer.subarray(tagLength)

    if (tagCode < 240 || tagCode > 1000) {
      tags.push(Buffer.concat([Buffer.from(tlvs.slice(0, 2)), tlvs[2]]).toString('hex'))
    }
  }

  console.log({ tags })

  final['offer_id'] = merkle_calc(tags)

  if (prefix == 'lno') {
    if (check_offer(final)) {
      final['valid'] = true
      return final
    }
  }
  if (prefix == 'lni') {
    if (check_invoice(final)) {
      final['valid'] = true
      return final
    }
  }
  if (prefix == 'lnr') {
    if (check_invoice_request(final)) {
      final['valid'] = true
      return final
    }
  }
}

function get_recurrence(address) {
  let decoded = decode(address)
  if (!'recurrence' in decoded) {
    return null
  } else {
    recur = new Recurrence(
      decoded['recurrence'],
      decoded['recurrence_paywindow'],
      decoded['recurrence_limit'],
      decoded['recurrence_base']
    )
    return recur
  }
}

let tlv_invoice_request_rev = {}

for (const [key, value] of Object.entries(tlv_invoice_request)) {
  tlv_invoice_request_rev[value[0]] = Number(key)
}

function invoice_req_check(offer, val_dict) {
  if (!('payer_key' in val_dict)) {
    throw Error('payer key required!')
  }
  // SIGNATURE ENCODE AFTER GETTING THE PAYER_KEY
  if ('quantity_max' in offer) {
    if (!('quantity' in val_dict)) {
      throw Error('Must set quantity')
    } else {
      if ('quantity_min' in offer) {
        if (val_dict['quantity'] < offer['quantity_min']) {
          throw Error('quantity is less than quantity_min')
        }
      }
      if ('quantity_max' in offer) {
        if (val_dict['quantity'] > offer['quantity_max']) {
          throw Error('quantity is greater than quantity_max')
        }
      }
    }
  } else {
    if ('quantity' in val_dict) {
      throw Error('Quantity is not required!')
    }
  }

  if (!'amount' in offer) {
    if (val_dict['amount'] == null) {
      throw Error('Set amount!')
    }
  } else {
    if ('amount' in val_dict) {
      if (val_dict['amount'] < offer['amount']) {
        throw Error('amount is less than what is required!')
      }
    }
  }
  //previous unpaid invoice(clear doubts from rusty)
  if ('recurrence' in offer) {
    if (!val_dict['recurrence_counter'] in val_dict) {
      throw Error('set a valid recurrence counter')
    }
    if ('recurrence_base' in offer && offer['recurrence_base']['start_any_period']) {
      if (!'recurrence_start' in val_dict) throw Error('Must set valid recurrence_start')
      if (!'period_offset' in val_dict) throw Error('Must set valid period_offset')
    } else {
      if ('recurrence_start' in val_dict) {
        throw Error('recurrence_start is illegal')
      }
    }
    if ('recurrence_limit' in offer && val_dict['recurrence_counter'] > offer['recurrence_limit']) {
      throw Error('Invoice request for a period greater than max_period is illegal!')
    }
    if ('recurrence_paywindow' in offer) {
      if ('recurrence_basetime' in offer || 'recurrence_counter' in offer) {
        //should not send for period prior to 'seconds_before' and later than 'seconds_after'
      }
    } else {
    }
  } else {
    if ('recurrence_counter' in val_dict) {
      throw Error('There is no recurrence in offer!')
    }
    if ('recurrence_start' in val_dict) {
      throw Error('There is no recurrence in offer!')
    }
  }
}

export default decode

console.log(
  decode(
    'lno1qgsqvgnwgcg35z6ee2h3yczraddm72xrfua9uve2rlrm9deu7xyfzrc2z4ek2mnyypkk2grpyp6xjupqwpkx2ctnv5s3yrnhd9jxwet5wvhxxmmd9esh29qppgtzzq7flqemvmemfwta5n23rnmck3yhrc6ckg3mtan6aarztpy8wzuzuy'
  )
)
