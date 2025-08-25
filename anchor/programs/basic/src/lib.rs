use anchor_lang::prelude::*;

declare_id!("J6gTUyT68sbzPAhDtjUEWDdh1LqEiWenwx8Sdf9AHLUr");

pub const DISRIMINATOR:usize = 8;

#[program]
pub mod basic {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, title: String, message: String) -> Result<()> {
        msg!("GM!");
        let context = &mut ctx.accounts.journal_entry;
        context.title = title;
        context.message = message;
        Ok(())
    }
}

#[account]
pub struct JournalEntreState {
    pub owner: Pubkey,
    pub title: String,
    pub message: String
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct Initialize<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = DISRIMINATOR + 32 + 4 + title.len() + 4 + message.len()
    )]
    pub journal_entry: Account<'info, JournalEntreState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}
