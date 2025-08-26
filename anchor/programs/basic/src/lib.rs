use anchor_lang::prelude::*;

declare_id!("J6gTUyT68sbzPAhDtjUEWDdh1LqEiWenwx8Sdf9AHLUr");

pub const DISRIMINATOR:usize = 8;
pub const MAX_TITLE: usize = 64;
pub const MAX_MESSAGE: usize = 256;

#[program]
pub mod basic {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        title: String, 
        message: Vec<u8>, 
        salt: [u8; 16], 
        nonce: [u8; 12]
    ) -> Result<()> {
        msg!("GM!");
        let context = &mut ctx.accounts.journal_entry;
        context.title = title;
        context.message = message;
        context.owner = ctx.accounts.owner.key();
        context.salt = salt;
        context.nonce = nonce;
        Ok(())
    }

    pub fn delete_key(_ctx: Context<Close>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[account]
pub struct JournalEntreState {
    pub owner: Pubkey,
    pub title: String,
    pub message: Vec<u8>,
    pub salt: [u8; 16],
    pub nonce: [u8; 12],
}

#[derive(Accounts)]
#[instruction(title: String, message: Vec<u8>)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = DISRIMINATOR + 32 + 8 + MAX_TITLE + MAX_MESSAGE + 16 + 12
    )]
    pub journal_entry: Account<'info, JournalEntreState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(seed:Vec<u8>)]
pub struct Close<'info>{
    #[account(
        mut,
        seeds= [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner,
        constraint = journal_entry.owner == owner.key() @ ErrorCode::Unauthorized
    )]
    pub journal_entry: Account<'info, JournalEntreState>,
    #[account(mut)]
    pub owner: Signer<'info>,
}


//Errors
#[error_code]
pub enum ErrorCode {
    #[msg("You are not the owner of this account")]
    Unauthorized,
}