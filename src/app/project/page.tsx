'use client'

import { useState, useMemo } from 'react';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import Idl from '../../../anchor/target/idl/basic.json';
import { Connection, PublicKey } from '@solana/web3.js';
import { clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';


export default function Page() {
    const programId = new web3.PublicKey(Idl.address)

    const [title, setTitle] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [findTitle, setFindTitle] = useState<string>("");

    const [pdas, setPda] = useState([]);
    const {publicKey, wallet, connected} = useWallet();
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    
    const anchorWallet = useAnchorWallet();
    const provider = anchorWallet ? new AnchorProvider(connection, anchorWallet, { commitment: "confirmed" }) : null;

    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(Idl, provider);
    }, [provider]);

    const handleCreatePda = async () => {
        if (!publicKey) return;
        if (!program) return;

        const [journalPda, bump] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from(title.slice(0, 32)), publicKey.toBuffer()],
            program.programId
        );

        try {
            await program.methods
                .initialize(title, message)
                .accounts({
                    journalEntry: journalPda,
                    owner: publicKey,
                    systemProgram: web3.SystemProgram.programId
                })
                .rpc();

            console.log("PDA created:", journalPda.toBase58());
        } catch (err) {
            console.error("Error creating PDA:", err);
        }
    }

    const findPdas = async () => {
        if (!program || !publicKey) {
            console.log("Program or wallet missing");
            return;
        }

        try {
            const [pda, bump] = web3.PublicKey.findProgramAddressSync(
                [Buffer.from(findTitle), publicKey.toBuffer()],
                program.programId
            );

            const account = await program.account.journalEntreState.fetch(pda);
            setPda(account);
            console.log({account});
        } catch (err) {
            console.log("Error fetching PDA:", err);
        }
    }

    
    return(
        <div className='w-full flex flex-row justify-between gap-5'>
            <div className='flex flex-col gap-5 sm:w-1/2 w-full'>
                <p className='text-xl'>Здрасте, тут мы будем мутить PDA</p>
                <input className='border-[1px] px-3 py-2 border-white rounded-md' onChange={(e) => setTitle(e.target.value)} placeholder='title'/>
                <input className='border-[1px] px-3 py-2 border-white rounded-md' onChange={(e) => setMessage(e.target.value)} placeholder='message'/>
                <button 
                    className="px-4 py-2 bg-white text-black cursor-pointer rounded-md"
                    onClick={() => handleCreatePda()}
                >
                    Создать
                </button>
            </div>
            <div className='flex flex-col gap-5 sm:w-1/2 w-full min-h-[500px] border border-white rounded-xl py-10 px-3'>
                <div className='flex flex-row w-full items-center justify-between gap-3'>
                    <button 
                        className='text-center text-md py-2 bg-white w-1/3 text-black rounded-md whitespace-nowrap'
                        onClick={() => findPdas()}
                    >
                        Загрузить
                    </button>
                    <input className='border-[1px] px-3 py-2 border-white rounded-md w-full'  onChange={(e) => setFindTitle(e.target.value)}/>
                </div>
                <div>
                    <pre>{JSON.stringify(pdas, null, 2)}</pre>
                </div>
            </div>
        </div>
    )
}