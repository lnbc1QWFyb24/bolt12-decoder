# BOLT12 Decoder

Decode BOLT12 Offers, Invoice Requests and invoices.

## Install

`yarn add bolt12-decoder`
`npm i bolt12-decoder`

## Usage

```javascript
import decodeBolt12 from 'bolt12-decoder'

const bolt12 =
  'lno1qgsqvgnwgcg35z6ee2h3yczraddm72xrfua9uve2rlrm9deu7xyfzrc2q42xjurnyyfqys2zzcssx06thlxk00g0epvynxff5vj46p3en8hz8ax9uy4ckyyfuyet8eqg'

const decoded = decodeBolt12(bolt12)

console.log(decoded)

// {
//   offer_chains: ['06226e46111a0b59caaf126043eb5bbf28c34f3a5e332a1fc7b2b73cf188910f'],
//   offer_description: 'Tips!',
//   offer_id: '45880e501c65e9060d33128d2de1d23ff52ae768b2bcb62bef262d90b741b8cd',
//   offer_issuer: 'AB',
//   offer_node_id: '033f4bbfcd67bd0fc858499929a3255d063999ee23f4c5e12b8b1089e132b3e408',
//   type: 'bolt12 offer',
//   valid: true
// }
```
