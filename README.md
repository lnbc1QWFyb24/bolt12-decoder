# BOLT12 Decoder

The goal is to match the output of the CoreLN [`decode` RPC response](https://docs.corelightning.org/reference/lightning-decode).

Code is mostly grabbed from [Rusty's BOLT12 repo](https://github.com/rustyrussell/bolt12/tree/master/javascript) with some changes and fixes.

## WIP

- `offer_id` is not currently being derived correctly and needs to be fixed.
