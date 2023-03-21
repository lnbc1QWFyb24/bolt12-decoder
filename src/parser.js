import { Buffer } from 'buffer'

import {
  fromwire_byte,
  fromwire_chain_hash,
  fromwire_array_utf8,
  fromwire_point,
  fromwire_point32,
  fromwire_sha256,
  fromwire_bip340sig,
  fromwire_tu32,
  fromwire_tu64,
  fromwire_u16,
  fromwire_u32
} from './fundamental_types.js'

export const tagParser = {
  0: ['invreq_metadata', (buf) => buf.toString('hex')],
  2: ['offer_chains', fromwire_offer_chains],
  4: ['offer_metadata', (buf) => buf.toString('hex')],
  6: ['offer_currency', fromwire_offer_currency],
  8: ['offer_amount', fromwire_offer_amount],
  10: ['offer_description', fromwire_offer_description],
  12: ['offer_features', fromwire_offer_features],
  14: ['offer_absolute_expiry', fromwire_offer_absolute_expiry],
  16: ['offer_paths', fromwire_offer_paths],
  18: ['offer_issuer', fromwire_offer_issuer],
  20: ['offer_quantity_max', fromwire_offer_quantity_max],
  22: ['offer_node_id', fromwire_offer_node_id],
  80: ['invreq_chain', fromwire_offer_node_id],
  82: ['invreq_amount', fromwire_invoice_request_amount],
  84: ['invreq_features', fromwire_invoice_request_features],
  86: ['invreq_quantity', fromwire_invoice_request_quantity],
  88: ['invreq_payer_id', fromwire_invoice_request_payer_key],
  89: ['invreq_payer_note', fromwire_invoice_request_payer_note],
  // 160: ['invoice_paths', fromwire_invoice_paths],
  // 162: ['invoice_blindedpay', fromwire_invoice_blindedpay],
  164: ['invoice_created_at', fromwire_invoice_created_at],
  166: ['invoice_relative_expiry', fromwire_invoice_relative_expiry],
  168: ['invoice_payment_hash', fromwire_invoice_payment_hash],
  170: ['invoice_amount', fromwire_invoice_amount],
  172: ['invoice_fallbacks', fromwire_invoice_fallbacks],
  174: ['invoice_features', fromwire_invoice_features],
  176: ['invoice_node_id', fromwire_invoice_node_id],
  240: ['signature', fromwire_offer_signature]
}

function fromwire_offer_chains(buffer) {
  let retarr
  const value = {}
  const v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_chain_hash(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['chains'] = v

  return value['chains']
}

function fromwire_offer_currency(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['iso4217'] = retarr[0]
  buffer = retarr[1]

  return value['iso4217']
}

function fromwire_offer_amount(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['amount'] = retarr[0]
  buffer = retarr[1]

  return value['amount']
}

function fromwire_offer_description(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['description'] = retarr[0]
  buffer = retarr[1]

  return value['description']
}

function fromwire_offer_features(buffer) {
  let retarr
  const value = {}
  const v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return value['features']
}

function fromwire_offer_absolute_expiry(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['seconds_from_epoch'] = retarr[0]
  buffer = retarr[1]

  return value['seconds_from_epoch']
}

function fromwire_offer_paths(buffer) {
  let retarr
  const value = {}
  const v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_blinded_path(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['paths'] = v

  return value['paths']
}

function fromwire_offer_issuer(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['issuer'] = retarr[0]
  buffer = retarr[1]

  return value['issuer']
}

function fromwire_offer_quantity_max(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['max'] = retarr[0]
  buffer = retarr[1]

  return value['max']
}

function fromwire_offer_node_id(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point32(buffer)
  value['node_id'] = retarr[0]
  buffer = retarr[1]

  return value['node_id']
}

function towire_offer_signature(value) {
  let buf = Buffer.alloc(0)
  value = { sig: value }
  buf = Buffer.concat([buf, towire_bip340sig(value['sig'])])

  return buf
}

function fromwire_offer_signature(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_bip340sig(buffer)
  value['sig'] = retarr[0]
  buffer = retarr[1]

  return value['sig']
}

function fromwire_invoice_request_amount(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['msat'] = retarr[0]
  buffer = retarr[1]

  return value['msat']
}

function fromwire_invoice_request_features(buffer) {
  let retarr
  const value = {}
  const v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return value['features']
}

function fromwire_invoice_request_quantity(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['quantity'] = retarr[0]
  buffer = retarr[1]

  return value['quantity']
}

function fromwire_invoice_request_payer_key(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point32(buffer)
  value['key'] = retarr[0]
  buffer = retarr[1]

  return value['key']
}

function fromwire_invoice_request_payer_note(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['note'] = retarr[0]
  buffer = retarr[1]

  return value['note']
}

function fromwire_invoice_amount(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['msat'] = retarr[0]
  buffer = retarr[1]

  return value['msat']
}

function fromwire_invoice_features(buffer) {
  let retarr
  const value = {}
  const v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return value['features']
}

function fromwire_invoice_paths(buffer) {
  let retarr
  const value = {}
  const v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_blinded_path(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['paths'] = v

  return value['paths']
}

function fromwire_invoice_blindedpay(buffer) {
  let retarr
  const value = {}
  const v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_blinded_payinfo(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['payinfo'] = v

  return value['payinfo']
}

function fromwire_invoice_node_id(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point32(buffer)
  value['node_id'] = retarr[0]
  buffer = retarr[1]

  return value['node_id']
}

function fromwire_invoice_created_at(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['timestamp'] = retarr[0]
  buffer = retarr[1]

  return value['timestamp']
}

function fromwire_invoice_payment_hash(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_sha256(buffer)
  value['payment_hash'] = retarr[0]
  buffer = retarr[1]

  return value['payment_hash']
}

function fromwire_invoice_relative_expiry(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['seconds_from_creation'] = retarr[0]
  buffer = retarr[1]

  return value['seconds_from_creation']
}

function fromwire_invoice_fallbacks(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_byte(buffer)
  let lenfield_num = retarr[0]
  buffer = retarr[1]
  const v = []
  for (let i = 0; lenfield_num; i++) {
    retarr = fromwire_fallback_address(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['fallbacks'] = v

  return value
}

function fromwire_onionmsg_path(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point(buffer)
  value['node_id'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  let lenfield_enclen = retarr[0]
  buffer = retarr[1]
  const v = []
  for (let i = 0; lenfield_enclen; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['enctlv'] = v

  return [value, buffer]
}

function fromwire_blinded_path(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point(buffer)
  value['blinding'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  let lenfield_num_hops = retarr[0]
  buffer = retarr[1]
  const v = []
  for (let i = 0; lenfield_num_hops; i++) {
    retarr = fromwire_onionmsg_path(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['path'] = v

  return [value, buffer]
}

function fromwire_blinded_payinfo(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_u32(buffer)
  value['fee_base_msat'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u32(buffer)
  value['fee_proportional_millionths'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  value['cltv_expiry_delta'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  let lenfield_flen = retarr[0]
  buffer = retarr[1]
  const v = []
  for (let i = 0; lenfield_flen; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return [value, buffer]
}

function towire_fallback_address(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_byte(value['version'])])

  buf = Buffer.concat([buf, towire_u16(value['address'].length)])

  for (let v of value['address']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

function fromwire_fallback_address(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_byte(buffer)
  value['version'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  let lenfield_len = retarr[0]
  buffer = retarr[1]
  const v = []
  for (let i = 0; lenfield_len; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['address'] = v

  return [value, buffer]
}
