import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { Basic } from '../target/types/basic';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import Idl from '../target/idl/basic.json';

// helper
function arraysEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// env
const owner = Keypair.generate();
const connection = new web3.Connection("http://127.0.0.1:8899", "confirmed");
const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(owner), { commitment: "confirmed" });
anchor.setProvider(provider);
const program = new Program<Basic>(Idl as any, provider);

// data
const title = 'someTitle'.slice(0, 32);
const message = Buffer.from('Тестовый текст 🙃');
const salt = new Uint8Array(16).map((_, i) => i);
const nonce = new Uint8Array(12).fill(1);

let pda: PublicKey;

beforeAll(async () => {
  [pda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(title), owner.publicKey.toBuffer()],
    program.programId
  );

  await program.methods
    .initialize(title, message, salt, nonce)
    .accounts({
      journal_entry: pda,
      owner: owner.publicKey,
      system_program: SystemProgram.programId,
    })
    .rpc();
});

describe("PDA tests", () => {
  it("fetches and validates account", async () => {
    let account
    try{
      account = await program.account.journalEntreState.fetch(pda);
    } catch (err) {
      console.log(err)
    }

    const titleOk = account.title === title;
    const messageOk = arraysEqual(account.message, message);
    const saltOk = arraysEqual(account.salt, salt);
    const nonceOk = arraysEqual(account.nonce, nonce);

    console.log({ titleOk, messageOk, saltOk, nonceOk });

    expect(titleOk).toBe(true);
    expect(messageOk).toBe(true);
    expect(saltOk).toBe(true);
    expect(nonceOk).toBe(true);
  });
});