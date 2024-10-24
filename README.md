# BOLT12 Decoder

Decode BOLT12 Offers, Invoice Requests and Invoices.

## Install

`yarn add bolt12-decoder` OR `npm i bolt12-decoder` OR `bun add bolt12-decoder`

## Usage

```javascript
import BOLT12Decoder from 'bolt12-decoder'

const offer =
  'lno1qgsqvgnwgcg35z6ee2h3yczraddm72xrfua9uve2rlrm9deu7xyfzrc2q42xjurnyyfqys2zzcssx06thlxk00g0epvynxff5vj46p3en8hz8ax9uy4ckyyfuyet8eqg'

const decodedOffer = BOLT12Decoder.decode(offer)
console.log(JSON.stringify(decodedOffer, null, 2))

// {
//   "id": "45880e501c65e9060d33128d2de1d23ff52ae768b2bcb62bef262d90b741b8cd",
//   "type": "offer",
//   "chains": [
//     "06226e46111a0b59caaf126043eb5bbf28c34f3a5e332a1fc7b2b73cf188910f"
//   ],
//   "description": "Tips!",
//   "issuer": "AB",
//   "issuerId": "033f4bbfcd67bd0fc858499929a3255d063999ee23f4c5e12b8b1089e132b3e408"
// }

const invoice =
  'lni1qqgqp9et744ne2r7zg3kq0vz860xgyxvqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glc7qsp2dxt6avc2avfxg2avl58psv7xflwzhfmv2gtm9wytkn5c7uusvpq9qr8h0nh66qpv7xa9hyguuc3ar3y42qlxsxcy0genwt8d7tsamvaqqeec63yjlkyyd05gkfzrwwvaxl8y9jjxemwsqrnc2j6xdjrg0yzj7k5x2pwvyga3heejhra24a0wushp6rfqq3jdf2glnwaydeml333v4xrap92ek3q9qgm7370exxs45f68p42sqqpqrslyuarpkn5r78nquzma65rrs6jqvqcdgzcyypdf0d2vqmqu02ruex9mskrzmr5d3rrzygttq425w89c3z3arqh8f9ql5qe5quxfmcztl0gldv8mxy3sm8x5jscdz27u39fy6luxu8zcdn9j73l3uppfjclju37sq4pfcne5gw9l9vydpsnfwlnkc0f2ncu786mxzpss0szqfhylpxyl0pjvnwheheful2mjtu0zvvnfwmrkzm7e5flnh5dmpmxzqz998um6nckle0n2sse3lad2cm2m87wqssjn8rtrstgw7fr4cq7jcss3aspnmgg2sua776240454kl9f5sv9t3cfe58xur7mch6q9rz6u4sdffra2cz7nwvw2xcmty0eut4dayy03n6guksvrvtt237tl6264ks8yyfhqjspn9uj9zg4wrhpsvrw56skaqcfd3ul6d6tlpw3qrz5jnuz609ee7czc6n629rm5ccncackrspca3mpzk4phrjwcc9hukuxck2u93wkpmp0hx8rn2c7pd65hsl8hwkzqemkx7p2g0zkx92gzvyg5cfpktvm42g57d6spjy7clkwtrtz72pmm4a990phfa3exzldwsydqxpq3tepwk5v9474zmmd98ttyyzx058t2sf5dvpn73hlvdhnycv55t4lsv6a9080a83dl9s7mf02ukt48nhche6he45j9npx87jk7eyhzxsrjpzz0t5e2n206an9ma59uhatgsuqqqq86qqqqqxgq9zqqqqqqqqqqp7sqqqqqqqqqcdgqqqpfqyvm5xhjdxqy72sg8wkseztv2dpeudmcx0ahz6ezxx86thwrzvjfq400rnhh7vmcrs6k4qxqvx5zhqxqsqqzczzq3jdf2glnwaydeml333v4xrap92ek3q9qgm7370exxs45f68p42srcyql379vw777n9rmj66ze9qmq8agvuz9fdg6nnu5wcdn6ppvrh3rjcftld8rtakadngfdalgq9czau46yfa07pqpeffqlx8qaruzv7w5qs'

const decodedInvoice = BOLT12Decoder.decode(invoice)
console.log(JSON.stringify(decodedInvoice, null, 2))

// {
//   "id": "4f80127354452142ca241c0964b65632d4f6209e9376f1d968e372ef0d1b6dfe",
//   "type": "invoice",
//   "paths": [
//     {
//       "firstNodeId": "03864ef025fde8fb587d989186ce6a4a186895ee44a926bfc370e2c366597a3f8f",
//       "firstPathKey": "0214cb1f9723e802a14e279a21c5f9584686134bbf3b61e954f1cf1f5b3083083e",
//       "numHops": 2,
//       "path": [
//         {
//           "blindedNodeId": "026e4f84c4fbc3264dd7cdf29e7d5b92f8f131934bb63b0b7ecd13f9de8dd87661",
//           "encryptedRecipientData": "29f9bd4f16fe5f3542198ffad5636ad9fce0421299c6b1c16877923ae01e962108f6019ed085439df7b4aabeb4adbe54d20c2ae384e6873707ede2fa01462d72b06a523eab"
//         },
//         {
//           "blindedNodeId": "02f4dcc728d8dac8fcf1756f4847c67a472d060d8b5aa3e5ff4ad56d039089b825",
//           "encryptedRecipientData": "bc91448ab8770c18375350b74184b63cfe9ba5fc2e88062a4a7c169e5ce7d816353d28a3dd3189e3b8b0e01c763b08ad50dc7276305bf2dc362cae162eb07617dcc71cd58f05baa5e1f3ddd61033bb1bc1521e2b18aa40984453090d96cdd548a79ba80644f63f672c6b17941deebd295e1ba7b1c985f6ba04680c1045790bad4616bea8b7b694eb5908233e875aa09a35819fa37fb1b79930ca5175fc19ae95e77f4f16fcb0f6d2f572cba9e77c5f3abe6b49166131fd2b7b24b88d01c82213d74caa6a7ebb32efb42f2fd5"
//         }
//       ]
//     }
//   ],
//   "metadata": "00972bf56b3ca87e1223603d823e9e64",
//   "amount": "100000",
//   "payerId": "02d4bdaa60360e3d43e64c5dc2c316c746c4631110b582aaa38e5c4451e8c173a4",
//   "signature": "7e3e2b1def7a651ee5ad0b2506c07ea19c1152d46a73e51d86cf410b07788e584afed38d7db75b3425bdfa005c0bbcae889ebfc100729483e6383a3e099e7501",
//   "blindedPayInfo": [
//     {
//       "feeBaseMsat": 1000,
//       "feeProportionalMillionths": 100,
//       "cltvExpiryDelta": 162,
//       "htlcMinimumMsat": "1000",
//       "htlcMaximumMsat": "200000",
//       "features": ""
//     }
//   ],
//   "createdAt": 1726507977,
//   "relativeExpiry": 60,
//   "paymentHash": "eeb43225b14d0e78dde0cfedc5ac88c63e97770c4c924157bc73bdfccde070d5",
//   "features": "020000",
//   "nodeId": "02326a548fcddd2373bfc631654c3e84aacda202811bf47cfc98d0ad13a386aa80"
// }
```

## Running Locally

### Install Deps

`bun install`

### Build

`bun run build:all`
