'use client'

import { useState, useMemo, useEffect } from 'react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import Idl from '../../../anchor/target/idl/basic.json';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';

import {deriveKeyFromPassword, encryptSecret, decryptSecret} from './_components/cipher'


export default function Page() {
    const programId = new web3.PublicKey(Idl.address)

    const [title, setTitle] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [password_for_encrypting, setPassword_for_encrypting] = useState<string>("");
    const [findTitle, setFindTitle] = useState<string>("");
    const [password_for_decrypting, setPassword_for_decrypting] = useState<string>("");
    const [pdas, setPda] = useState<string>("");

    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [error, setError] = useState<string>("");
    const [pdaKey, setPdaKey] = useState<string>("");

    const {publicKey, wallet, connected} = useWallet();
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    
    const anchorWallet = useAnchorWallet();
    const provider = anchorWallet ? new AnchorProvider(connection, anchorWallet, { commitment: "confirmed" }) : null;

    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(Idl, provider);
    }, [provider]);

    const handleCreatePda = async () => {

        setLoading1(true);

        if (!publicKey || !program || !password_for_encrypting || !title) {
            setError("Missing critical modules or title!");
            setLoading1(false);
            return;
        }

        const [journalPda] = web3.PublicKey.findProgramAddressSync(
            [new TextEncoder().encode(title), publicKey.toBuffer()],
            program.programId
        );

        const { key, salt } = await deriveKeyFromPassword(password_for_encrypting);
        const { ciphertext, nonce } = await encryptSecret(Uint8Array.from(key), message);

        if (salt.length !== 16) {
            setError("Salt is not 16 sympols length");
            setLoading1(false);
            return
        };
        if (nonce.length !== 12) {
            setError("Nonce is not 16 sympols length");
            setLoading1(false);
            return
        };

        try {
            await program.methods
            .initialize(
                title,
                Buffer.from(ciphertext),
                Buffer.from(salt),
                Buffer.from(nonce)
            )
            .accounts({
                journalEntry: journalPda,
                owner: publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();

            setPdaKey(journalPda.toBase58());
            setLoading1(false);

        } catch (err) {

            const er = "Error creating PDA:" + err;
            setLoading1(false);

            setError(er);
        }
    };

    const findPdas = async () => {

        setLoading2(true);

        if (!program || !publicKey || !findTitle || !password_for_decrypting) {
            setError("Program/wallet/password/title missing");
            setLoading2(false);
            return;
        }

        const [pda] = web3.PublicKey.findProgramAddressSync(
            [new TextEncoder().encode(findTitle), publicKey.toBuffer()],
            program.programId
        );

        try {
            const account = await program.account.journalEntreState.fetch(pda);

            const saltArr = account.salt instanceof Uint8Array ? account.salt : Uint8Array.from(account.salt);
            const nonceArr = account.nonce instanceof Uint8Array ? account.nonce : Uint8Array.from(account.nonce);
            const msgArr   = account.message instanceof Uint8Array ? account.message : Uint8Array.from(account.message);

            const { key } = await deriveKeyFromPassword(password_for_decrypting, saltArr);

            const decrypted = await decryptSecret(Uint8Array.from(key), msgArr, nonceArr);
            setPda(decrypted);
            setLoading2(false);
            setError("")

        } catch (err) {

            const er = "Error creating PDA:" + err
            setLoading2(false);

            setError(er);
        }
    };

    const [flag, setFlag] = useState(false);

    useEffect(() => {
        if (pdaKey) {
            setFlag(true);
            const t = setTimeout(() => setFlag(false), 2000);
            return () => clearTimeout(t);
        }
    }, [pdaKey]);

    return(
        <div className='w-full flex flex-row justify-between gap-5 min-h-sreen'>
            <div className='flex flex-col gap-5 sm:w-1/2 w-full'>
                <p className='text-xl'>Hello, here you can save your passwords and keys</p>
                <input className='border-[1px] px-3 py-2 border-white rounded-md' onChange={(e) => setTitle(e.target.value)} placeholder='title'/>
                <input className='border-[1px] px-3 py-2 border-white rounded-md' onChange={(e) => setMessage(e.target.value)} placeholder='message'/>
                <input className='border-[1px] px-3 py-2 border-white rounded-md' onChange={(e) => setPassword_for_encrypting(e.target.value)} placeholder='password'/>
                <button 
                    className="px-4 py-2 bg-white text-black cursor-pointer rounded-md"
                    onClick={() => handleCreatePda()}
                >
                    {!loading1 ? "Создать" : "Создание..."}
                </button>
                {error && (
                    <div className="w-full border border-red-400 min-h-[60px] rounded-md p-3">
                        {error}
                    </div>
                )}
            </div>
            <div className='flex flex-col gap-5 sm:w-1/2 w-full min-h-[500px] border border-white rounded-xl py-10 px-3'>
                <div className='flex flex-row w-full items-center justify-between gap-3'>
                    <button 
                        className='text-center text-md h-full py-2 bg-white w-1/3 text-black rounded-md whitespace-nowrap'
                        onClick={() => findPdas()}
                    >
                        {!loading2 ? "Загрузить" : "Загрузка..."}
                    </button>
                    <div className='flex flex-col gap-2 w-full'>
                        <input className='border-[1px] px-3 py-2 border-white rounded-md w-full'  onChange={(e) => setFindTitle(e.target.value)} placeholder='title'/>
                        <input className='border-[1px] px-3 py-2 border-white rounded-md w-full'  onChange={(e) => setPassword_for_decrypting(e.target.value)} placeholder='password'/>
                    </div>
                </div>
                <div>
                    {pdas && <pre>Ваш пароль - <span className='font-bold'>{pdas}</span></pre>}
                </div>
            </div>
            {flag && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-2/3 max-w-xl bg-green-800 text-white text-center py-2 rounded-md shadow-lg">
                    {pdaKey}
                </div>
                )}
        </div>
    )
}