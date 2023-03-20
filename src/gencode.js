import { Buffer } from 'buffer'

import {
  towire_byte,
  fromwire_byte,
  towire_chain_hash,
  fromwire_chain_hash,
  towire_array_utf8,
  fromwire_array_utf8,
  towire_point,
  fromwire_point,
  towire_point32,
  fromwire_point32,
  towire_sha256,
  fromwire_sha256,
  towire_bip340sig,
  fromwire_bip340sig,
  towire_tu32,
  fromwire_tu32,
  towire_tu64,
  fromwire_tu64,
  towire_u16,
  fromwire_u16,
  towire_u32,
  fromwire_u32,
  towire_u64,
  fromwire_u64
} from './fundamental_types.js'

export function towire_offer_chains(value) {
  let buf = Buffer.alloc(0)
  value = { chains: value }
  for (let v of value['chains']) {
    buf = Buffer.concat([buf, towire_chain_hash(v)])
  }

  return buf
}

export function fromwire_offer_chains(buffer) {
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

export function towire_offer_currency(value) {
  let buf = Buffer.alloc(0)
  value = { iso4217: value }
  buf = Buffer.concat([buf, towire_array_utf8(value['iso4217'])])

  return buf
}

export function fromwire_offer_currency(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['iso4217'] = retarr[0]
  buffer = retarr[1]

  return value['iso4217']
}

export function towire_offer_amount(value) {
  let buf = Buffer.alloc(0)
  value = { amount: value }
  buf = Buffer.concat([buf, towire_tu64(value['amount'])])

  return buf
}

export function fromwire_offer_amount(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['amount'] = retarr[0]
  buffer = retarr[1]

  return value['amount']
}

export function towire_offer_description(value) {
  let buf = Buffer.alloc(0)
  value = { description: value }
  buf = Buffer.concat([buf, towire_array_utf8(value['description'])])

  return buf
}

export function fromwire_offer_description(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['description'] = retarr[0]
  buffer = retarr[1]

  return value['description']
}

export function towire_offer_features(value) {
  let buf = Buffer.alloc(0)
  value = { features: value }
  for (let v of value['features']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_offer_features(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return value['features']
}

export function towire_offer_absolute_expiry(value) {
  let buf = Buffer.alloc(0)
  value = { seconds_from_epoch: value }
  buf = Buffer.concat([buf, towire_tu64(value['seconds_from_epoch'])])

  return buf
}

export function fromwire_offer_absolute_expiry(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['seconds_from_epoch'] = retarr[0]
  buffer = retarr[1]

  return value['seconds_from_epoch']
}

export function towire_offer_paths(value) {
  let buf = Buffer.alloc(0)
  value = { paths: value }
  for (let v of value['paths']) {
    buf = Buffer.concat([buf, towire_blinded_path(v)])
  }

  return buf
}

export function fromwire_offer_paths(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_blinded_path(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['paths'] = v

  return value['paths']
}

export function towire_offer_issuer(value) {
  let buf = Buffer.alloc(0)
  value = { vendor: value }
  buf = Buffer.concat([buf, towire_array_utf8(value['vendor'])])

  return buf
}

export function fromwire_offer_issuer(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['issuer'] = retarr[0]
  buffer = retarr[1]

  return value['issuer']
}

export function towire_offer_quantity_max(value) {
  let buf = Buffer.alloc(0)
  value = { max: value }
  buf = Buffer.concat([buf, towire_tu64(value['max'])])

  return buf
}

export function fromwire_offer_quantity_max(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['max'] = retarr[0]
  buffer = retarr[1]

  return value['max']
}

export function towire_offer_recurrence(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_byte(value['time_unit'])])

  buf = Buffer.concat([buf, towire_tu32(value['period'])])

  return buf
}

export function fromwire_offer_recurrence(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_byte(buffer)
  value['time_unit'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_tu32(buffer)
  value['period'] = retarr[0]
  buffer = retarr[1]

  return value
}

export function towire_offer_recurrence_paywindow(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_u32(value['seconds_before'])])

  buf = Buffer.concat([buf, towire_byte(value['proportional_amount'])])

  buf = Buffer.concat([buf, towire_tu32(value['seconds_after'])])

  return buf
}

export function fromwire_offer_recurrence_paywindow(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_u32(buffer)
  value['seconds_before'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_byte(buffer)
  value['proportional_amount'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_tu32(buffer)
  value['seconds_after'] = retarr[0]
  buffer = retarr[1]

  return value
}

export function towire_offer_recurrence_limit(value) {
  let buf = Buffer.alloc(0)
  value = { max_period: value }
  buf = Buffer.concat([buf, towire_tu32(value['max_period'])])

  return buf
}

export function fromwire_offer_recurrence_limit(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['max_period'] = retarr[0]
  buffer = retarr[1]

  return value['max_period']
}

export function towire_offer_recurrence_base(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_byte(value['start_any_period'])])

  buf = Buffer.concat([buf, towire_tu64(value['basetime'])])

  return buf
}

export function fromwire_offer_recurrence_base(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_byte(buffer)
  value['start_any_period'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_tu64(buffer)
  value['basetime'] = retarr[0]
  buffer = retarr[1]

  return value
}

export function towire_offer_node_id(value) {
  let buf = Buffer.alloc(0)
  value = { node_id: value }
  buf = Buffer.concat([buf, towire_point32(value['node_id'])])

  return buf
}

export function fromwire_offer_node_id(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point32(buffer)
  value['node_id'] = retarr[0]
  buffer = retarr[1]

  return value['node_id']
}

export function towire_offer_signature(value) {
  let buf = Buffer.alloc(0)
  value = { sig: value }
  buf = Buffer.concat([buf, towire_bip340sig(value['sig'])])

  return buf
}

export function fromwire_offer_signature(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_bip340sig(buffer)
  value['sig'] = retarr[0]
  buffer = retarr[1]

  return value['sig']
}

export const tlv_offer = {
  2: ['offer_chains', towire_offer_chains, fromwire_offer_chains],
  4: ['offer_metadata', towire_offer_description, fromwire_offer_description],
  6: ['offer_currency', towire_offer_currency, fromwire_offer_currency],
  8: ['offer_amount', towire_offer_amount, fromwire_offer_amount],
  10: ['offer_description', towire_offer_description, fromwire_offer_description],
  12: ['offer_features', towire_offer_features, fromwire_offer_features],
  14: ['offer_absolute_expiry', towire_offer_absolute_expiry, fromwire_offer_absolute_expiry],
  16: ['offer_paths', towire_offer_paths, fromwire_offer_paths],
  18: ['offer_issuer', towire_offer_issuer, fromwire_offer_issuer],
  20: ['offer_quantity_max', towire_offer_quantity_max, fromwire_offer_quantity_max],
  22: ['offer_node_id', towire_offer_node_id, fromwire_offer_node_id],
  26: ['recurrence', towire_offer_recurrence, fromwire_offer_recurrence],
  64: [
    'recurrence_paywindow',
    towire_offer_recurrence_paywindow,
    fromwire_offer_recurrence_paywindow
  ],
  66: ['recurrence_limit', towire_offer_recurrence_limit, fromwire_offer_recurrence_limit],
  28: ['recurrence_base', towire_offer_recurrence_base, fromwire_offer_recurrence_base],
  240: ['signature', towire_offer_signature, fromwire_offer_signature]
}

export function towire_invoice_request_chains(value) {
  let buf = Buffer.alloc(0)
  value = { chains: value }
  for (let v of value['chains']) {
    buf = Buffer.concat([buf, towire_chain_hash(v)])
  }

  return buf
}

export function fromwire_invoice_request_chains(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_chain_hash(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['chains'] = v

  return value['chains']
}

export function towire_invoice_request_offer_id(value) {
  let buf = Buffer.alloc(0)
  value = { offer_id: value }
  buf = Buffer.concat([buf, towire_sha256(value['offer_id'])])

  return buf
}

export function fromwire_invoice_request_offer_id(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_sha256(buffer)
  value['offer_id'] = retarr[0]
  buffer = retarr[1]

  return value['offer_id']
}

export function towire_invoice_request_amount(value) {
  let buf = Buffer.alloc(0)
  value = { msat: value }
  buf = Buffer.concat([buf, towire_tu64(value['msat'])])

  return buf
}

export function fromwire_invoice_request_amount(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['msat'] = retarr[0]
  buffer = retarr[1]

  return value['msat']
}

export function towire_invoice_request_features(value) {
  let buf = Buffer.alloc(0)
  value = { features: value }
  for (let v of value['features']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_invoice_request_features(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return value['features']
}

export function towire_invoice_request_quantity(value) {
  let buf = Buffer.alloc(0)
  value = { quantity: value }
  buf = Buffer.concat([buf, towire_tu64(value['quantity'])])

  return buf
}

export function fromwire_invoice_request_quantity(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['quantity'] = retarr[0]
  buffer = retarr[1]

  return value['quantity']
}

export function towire_invoice_request_recurrence_counter(value) {
  let buf = Buffer.alloc(0)
  value = { counter: value }
  buf = Buffer.concat([buf, towire_tu32(value['counter'])])

  return buf
}

export function fromwire_invoice_request_recurrence_counter(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['counter'] = retarr[0]
  buffer = retarr[1]

  return value['counter']
}

export function towire_invoice_request_recurrence_start(value) {
  let buf = Buffer.alloc(0)
  value = { period_offset: value }
  buf = Buffer.concat([buf, towire_tu32(value['period_offset'])])

  return buf
}

export function fromwire_invoice_request_recurrence_start(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['period_offset'] = retarr[0]
  buffer = retarr[1]

  return value['period_offset']
}

export function towire_invoice_request_payer_key(value) {
  let buf = Buffer.alloc(0)
  value = { key: value }
  buf = Buffer.concat([buf, towire_point32(value['key'])])

  return buf
}

export function fromwire_invoice_request_payer_key(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point32(buffer)
  value['key'] = retarr[0]
  buffer = retarr[1]

  return value['key']
}

export function towire_invoice_request_payer_note(value) {
  let buf = Buffer.alloc(0)
  value = { note: value }
  buf = Buffer.concat([buf, towire_array_utf8(value['note'])])

  return buf
}

export function fromwire_invoice_request_payer_note(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['note'] = retarr[0]
  buffer = retarr[1]

  return value['note']
}

export function towire_invoice_request_payer_info(value) {
  let buf = Buffer.alloc(0)
  value = { blob: value }
  for (let v of value['blob']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_invoice_request_payer_info(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['blob'] = v

  return value['blob']
}

export function towire_invoice_request_replace_invoice(value) {
  let buf = Buffer.alloc(0)
  value = { payment_hash: value }
  buf = Buffer.concat([buf, towire_sha256(value['payment_hash'])])

  return buf
}

export function fromwire_invoice_request_replace_invoice(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_sha256(buffer)
  value['payment_hash'] = retarr[0]
  buffer = retarr[1]

  return value['payment_hash']
}

export function towire_invoice_request_payer_signature(value) {
  let buf = Buffer.alloc(0)
  value = { sig: value }
  buf = Buffer.concat([buf, towire_bip340sig(value['sig'])])

  return buf
}

export function fromwire_invoice_request_payer_signature(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_bip340sig(buffer)
  value['sig'] = retarr[0]
  buffer = retarr[1]

  return value['sig']
}

export const tlv_invoice_request = {
  2: ['chains', towire_invoice_request_chains, fromwire_invoice_request_chains],
  4: ['offer_id', towire_invoice_request_offer_id, fromwire_invoice_request_offer_id],
  8: ['amount', towire_invoice_request_amount, fromwire_invoice_request_amount],
  12: ['features', towire_invoice_request_features, fromwire_invoice_request_features],
  32: ['quantity', towire_invoice_request_quantity, fromwire_invoice_request_quantity],
  36: [
    'recurrence_counter',
    towire_invoice_request_recurrence_counter,
    fromwire_invoice_request_recurrence_counter
  ],
  68: [
    'recurrence_start',
    towire_invoice_request_recurrence_start,
    fromwire_invoice_request_recurrence_start
  ],
  38: ['payer_key', towire_invoice_request_payer_key, fromwire_invoice_request_payer_key],
  39: ['payer_note', towire_invoice_request_payer_note, fromwire_invoice_request_payer_note],
  50: ['payer_info', towire_invoice_request_payer_info, fromwire_invoice_request_payer_info],
  56: [
    'replace_invoice',
    towire_invoice_request_replace_invoice,
    fromwire_invoice_request_replace_invoice
  ],
  240: [
    'payer_signature',
    towire_invoice_request_payer_signature,
    fromwire_invoice_request_payer_signature
  ]
}

export function towire_invoice_chains(value) {
  let buf = Buffer.alloc(0)
  value = { chains: value }
  for (let v of value['chains']) {
    buf = Buffer.concat([buf, towire_chain_hash(v)])
  }

  return buf
}

export function fromwire_invoice_chains(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_chain_hash(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['chains'] = v

  return value['chains']
}

export function towire_invoice_offer_id(value) {
  let buf = Buffer.alloc(0)
  value = { offer_id: value }
  buf = Buffer.concat([buf, towire_sha256(value['offer_id'])])

  return buf
}

export function fromwire_invoice_offer_id(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_sha256(buffer)
  value['offer_id'] = retarr[0]
  buffer = retarr[1]

  return value['offer_id']
}

export function towire_invoice_amount(value) {
  let buf = Buffer.alloc(0)
  value = { msat: value }
  buf = Buffer.concat([buf, towire_tu64(value['msat'])])

  return buf
}

export function fromwire_invoice_amount(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['msat'] = retarr[0]
  buffer = retarr[1]

  return value['msat']
}

export function towire_invoice_description(value) {
  let buf = Buffer.alloc(0)
  value = { description: value }
  buf = Buffer.concat([buf, towire_array_utf8(value['description'])])

  return buf
}

export function fromwire_invoice_description(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['description'] = retarr[0]
  buffer = retarr[1]

  return value['description']
}

export function towire_invoice_features(value) {
  let buf = Buffer.alloc(0)
  value = { features: value }
  for (let v of value['features']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_invoice_features(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return value['features']
}

export function towire_invoice_paths(value) {
  let buf = Buffer.alloc(0)
  value = { paths: value }
  for (let v of value['paths']) {
    buf = Buffer.concat([buf, towire_blinded_path(v)])
  }

  return buf
}

export function fromwire_invoice_paths(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_blinded_path(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['paths'] = v

  return value['paths']
}

export function towire_invoice_blindedpay(value) {
  let buf = Buffer.alloc(0)
  value = { payinfo: value }
  for (let v of value['payinfo']) {
    buf = Buffer.concat([buf, towire_blinded_payinfo(v)])
  }

  return buf
}

export function fromwire_invoice_blindedpay(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_blinded_payinfo(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['payinfo'] = v

  return value['payinfo']
}

export function towire_invoice_blinded_capacities(value) {
  let buf = Buffer.alloc(0)
  value = { incoming_msat: value }
  for (let v of value['incoming_msat']) {
    buf = Buffer.concat([buf, towire_u64(v)])
  }

  return buf
}

export function fromwire_invoice_blinded_capacities(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_u64(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['incoming_msat'] = v

  return value['incoming_msat']
}

export function towire_invoice_issuer(value) {
  let buf = Buffer.alloc(0)
  value = { issuer: value }
  buf = Buffer.concat([buf, towire_array_utf8(value['issuer'])])

  return buf
}

export function fromwire_invoice_issuer(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['issuer'] = retarr[0]
  buffer = retarr[1]

  return value['issuer']
}

export function towire_invoice_node_id(value) {
  let buf = Buffer.alloc(0)
  value = { node_id: value }
  buf = Buffer.concat([buf, towire_point32(value['node_id'])])

  return buf
}

export function fromwire_invoice_node_id(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point32(buffer)
  value['node_id'] = retarr[0]
  buffer = retarr[1]

  return value['node_id']
}

export function towire_invoice_quantity(value) {
  let buf = Buffer.alloc(0)
  value = { quantity: value }
  buf = Buffer.concat([buf, towire_tu64(value['quantity'])])

  return buf
}

export function fromwire_invoice_quantity(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['quantity'] = retarr[0]
  buffer = retarr[1]

  return value['quantity']
}

export function towire_invoice_refund_for(value) {
  let buf = Buffer.alloc(0)
  value = { refunded_payment_hash: value }
  buf = Buffer.concat([buf, towire_sha256(value['refunded_payment_hash'])])

  return buf
}

export function fromwire_invoice_refund_for(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_sha256(buffer)
  value['refunded_payment_hash'] = retarr[0]
  buffer = retarr[1]

  return value['refunded_payment_hash']
}

export function towire_invoice_recurrence_counter(value) {
  let buf = Buffer.alloc(0)
  value = { counter: value }
  buf = Buffer.concat([buf, towire_tu32(value['counter'])])

  return buf
}

export function fromwire_invoice_recurrence_counter(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['counter'] = retarr[0]
  buffer = retarr[1]

  return value['counter']
}

export function towire_invoice_recurrence_start(value) {
  let buf = Buffer.alloc(0)
  value = { period_offset: value }
  buf = Buffer.concat([buf, towire_tu32(value['period_offset'])])

  return buf
}

export function fromwire_invoice_recurrence_start(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['period_offset'] = retarr[0]
  buffer = retarr[1]

  return value['period_offset']
}

export function towire_invoice_recurrence_basetime(value) {
  let buf = Buffer.alloc(0)
  value = { basetime: value }
  buf = Buffer.concat([buf, towire_tu64(value['basetime'])])

  return buf
}

export function fromwire_invoice_recurrence_basetime(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['basetime'] = retarr[0]
  buffer = retarr[1]

  return value['basetime']
}

export function towire_invoice_payer_key(value) {
  let buf = Buffer.alloc(0)
  value = { key: value }
  buf = Buffer.concat([buf, towire_point32(value['key'])])

  return buf
}

export function fromwire_invoice_payer_key(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point32(buffer)
  value['key'] = retarr[0]
  buffer = retarr[1]

  return value['key']
}

export function towire_invoice_payer_note(value) {
  let buf = Buffer.alloc(0)
  value = { note: value }
  buf = Buffer.concat([buf, towire_array_utf8(value['note'])])

  return buf
}

export function fromwire_invoice_payer_note(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_array_utf8(buffer, buffer.length)
  value['note'] = retarr[0]
  buffer = retarr[1]

  return value['note']
}

export function towire_invoice_payer_info(value) {
  let buf = Buffer.alloc(0)
  value = { blob: value }
  for (let v of value['blob']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_invoice_payer_info(buffer) {
  let retarr
  const value = {}
  v = []
  for (let i = 0; buffer.length; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['blob'] = v

  return value['blob']
}

export function towire_invoice_created_at(value) {
  let buf = Buffer.alloc(0)
  value = { timestamp: value }
  buf = Buffer.concat([buf, towire_tu64(value['timestamp'])])

  return buf
}

export function fromwire_invoice_created_at(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu64(buffer)
  value['timestamp'] = retarr[0]
  buffer = retarr[1]

  return value['timestamp']
}

export function towire_invoice_payment_hash(value) {
  let buf = Buffer.alloc(0)
  value = { payment_hash: value }
  buf = Buffer.concat([buf, towire_sha256(value['payment_hash'])])

  return buf
}

export function fromwire_invoice_payment_hash(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_sha256(buffer)
  value['payment_hash'] = retarr[0]
  buffer = retarr[1]

  return value['payment_hash']
}

export function towire_invoice_relative_expiry(value) {
  let buf = Buffer.alloc(0)
  value = { seconds_from_creation: value }
  buf = Buffer.concat([buf, towire_tu32(value['seconds_from_creation'])])

  return buf
}

export function fromwire_invoice_relative_expiry(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['seconds_from_creation'] = retarr[0]
  buffer = retarr[1]

  return value['seconds_from_creation']
}

export function towire_invoice_cltv(value) {
  let buf = Buffer.alloc(0)
  value = { min_final_cltv_expiry: value }
  buf = Buffer.concat([buf, towire_tu32(value['min_final_cltv_expiry'])])

  return buf
}

export function fromwire_invoice_cltv(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_tu32(buffer)
  value['min_final_cltv_expiry'] = retarr[0]
  buffer = retarr[1]

  return value['min_final_cltv_expiry']
}

export function towire_invoice_fallbacks(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_byte(value['fallbacks'].length)])

  for (let v of value['fallbacks']) {
    buf = Buffer.concat([buf, towire_fallback_address(v)])
  }

  return buf
}

export function fromwire_invoice_fallbacks(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_byte(buffer)
  let lenfield_num = retarr[0]
  buffer = retarr[1]
  v = []
  for (let i = 0; lenfield_num; i++) {
    retarr = fromwire_fallback_address(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['fallbacks'] = v

  return value
}

export function towire_invoice_refund_signature(value) {
  let buf = Buffer.alloc(0)
  value = { payer_signature: value }
  buf = Buffer.concat([buf, towire_bip340sig(value['payer_signature'])])

  return buf
}

export function fromwire_invoice_refund_signature(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_bip340sig(buffer)
  value['payer_signature'] = retarr[0]
  buffer = retarr[1]

  return value['payer_signature']
}

export function towire_invoice_signature(value) {
  let buf = Buffer.alloc(0)
  value = { sig: value }
  buf = Buffer.concat([buf, towire_bip340sig(value['sig'])])

  return buf
}

export function fromwire_invoice_signature(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_bip340sig(buffer)
  value['sig'] = retarr[0]
  buffer = retarr[1]

  return value['sig']
}

export const tlv_invoice = {
  2: ['chains', towire_invoice_chains, fromwire_invoice_chains],
  4: ['offer_id', towire_invoice_offer_id, fromwire_invoice_offer_id],
  8: ['amount', towire_invoice_amount, fromwire_invoice_amount],
  10: ['description', towire_invoice_description, fromwire_invoice_description],
  12: ['features', towire_invoice_features, fromwire_invoice_features],
  16: ['paths', towire_invoice_paths, fromwire_invoice_paths],
  18: ['blindedpay', towire_invoice_blindedpay, fromwire_invoice_blindedpay],
  19: [
    'blinded_capacities',
    towire_invoice_blinded_capacities,
    fromwire_invoice_blinded_capacities
  ],
  20: ['issuer', towire_invoice_issuer, fromwire_invoice_issuer],
  30: ['node_id', towire_invoice_node_id, fromwire_invoice_node_id],
  32: ['quantity', towire_invoice_quantity, fromwire_invoice_quantity],
  34: ['refund_for', towire_invoice_refund_for, fromwire_invoice_refund_for],
  36: [
    'recurrence_counter',
    towire_invoice_recurrence_counter,
    fromwire_invoice_recurrence_counter
  ],
  68: ['recurrence_start', towire_invoice_recurrence_start, fromwire_invoice_recurrence_start],
  64: [
    'recurrence_basetime',
    towire_invoice_recurrence_basetime,
    fromwire_invoice_recurrence_basetime
  ],
  38: ['payer_key', towire_invoice_payer_key, fromwire_invoice_payer_key],
  39: ['payer_note', towire_invoice_payer_note, fromwire_invoice_payer_note],
  50: ['payer_info', towire_invoice_payer_info, fromwire_invoice_payer_info],
  40: ['created_at', towire_invoice_created_at, fromwire_invoice_created_at],
  42: ['payment_hash', towire_invoice_payment_hash, fromwire_invoice_payment_hash],
  44: ['relative_expiry', towire_invoice_relative_expiry, fromwire_invoice_relative_expiry],
  46: ['cltv', towire_invoice_cltv, fromwire_invoice_cltv],
  48: ['fallbacks', towire_invoice_fallbacks, fromwire_invoice_fallbacks],
  52: ['refund_signature', towire_invoice_refund_signature, fromwire_invoice_refund_signature],
  240: ['signature', towire_invoice_signature, fromwire_invoice_signature]
}

export function towire_onionmsg_path(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_point(value['node_id'])])

  buf = Buffer.concat([buf, towire_u16(value['enctlv'].length)])

  for (let v of value['enctlv']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_onionmsg_path(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point(buffer)
  value['node_id'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  let lenfield_enclen = retarr[0]
  buffer = retarr[1]
  v = []
  for (let i = 0; lenfield_enclen; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['enctlv'] = v

  return [value, buffer]
}

export function towire_blinded_path(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_point(value['blinding'])])

  buf = Buffer.concat([buf, towire_u16(value['path'].length)])

  for (let v of value['path']) {
    buf = Buffer.concat([buf, towire_onionmsg_path(v)])
  }

  return buf
}

export function fromwire_blinded_path(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_point(buffer)
  value['blinding'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  let lenfield_num_hops = retarr[0]
  buffer = retarr[1]
  v = []
  for (let i = 0; lenfield_num_hops; i++) {
    retarr = fromwire_onionmsg_path(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['path'] = v

  return [value, buffer]
}

export function towire_blinded_payinfo(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_u32(value['fee_base_msat'])])

  buf = Buffer.concat([buf, towire_u32(value['fee_proportional_millionths'])])

  buf = Buffer.concat([buf, towire_u16(value['cltv_expiry_delta'])])

  buf = Buffer.concat([buf, towire_u16(value['features'].length)])

  for (let v of value['features']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_blinded_payinfo(buffer) {
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
  v = []
  for (let i = 0; lenfield_flen; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['features'] = v

  return [value, buffer]
}

export function towire_fallback_address(value) {
  let buf = Buffer.alloc(0)
  buf = Buffer.concat([buf, towire_byte(value['version'])])

  buf = Buffer.concat([buf, towire_u16(value['address'].length)])

  for (let v of value['address']) {
    buf = Buffer.concat([buf, towire_byte(v)])
  }

  return buf
}

export function fromwire_fallback_address(buffer) {
  let retarr
  const value = {}
  retarr = fromwire_byte(buffer)
  value['version'] = retarr[0]
  buffer = retarr[1]
  retarr = fromwire_u16(buffer)
  let lenfield_len = retarr[0]
  buffer = retarr[1]
  v = []
  for (let i = 0; lenfield_len; i++) {
    retarr = fromwire_byte(buffer)
    v.push(retarr[0])
    buffer = retarr[1]
  }
  value['address'] = v

  return [value, buffer]
}
