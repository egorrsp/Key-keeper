/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/basic.json`.
 */
export type Basic = {
  "address": "J6gTUyT68sbzPAhDtjUEWDdh1LqEiWenwx8Sdf9AHLUr",
  "metadata": {
    "name": "basic",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "deleteKey",
      "discriminator": [
        109,
        187,
        83,
        65,
        222,
        57,
        126,
        251
      ],
      "accounts": [
        {
          "name": "journalEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "journalEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "title"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "message",
          "type": "bytes"
        },
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "nonce",
          "type": {
            "array": [
              "u8",
              12
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "journalEntreState",
      "discriminator": [
        235,
        167,
        241,
        45,
        13,
        83,
        83,
        219
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "You are not the owner of this account"
    }
  ],
  "types": [
    {
      "name": "journalEntreState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "message",
            "type": "bytes"
          },
          {
            "name": "salt",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "nonce",
            "type": {
              "array": [
                "u8",
                12
              ]
            }
          }
        ]
      }
    }
  ]
};
