use anchor_lang::prelude::*;
use core::str::from_utf8;

//my solana program unique public key, got after anchor build from inside target/deploy/solblog-Keypair.json
//got with command <solana address -k ./target/deploy/solblog-keypair.json>
declare_id!("AnqHyLczmevHe24FGtvHtpioaLXEUNxoPdetw3zZmji2");

#[program]
pub mod solblog {
    use super::*;
    // The #[account] macros in #[derive(Accounts)] wire up all the connections we need in order to use blog_account and authority in our initilize function. So now we can use blog_account and authority in our function:
    pub fn initialize(ctx: Context<Initialize>) -> ProgramResult {
        let blog_post_account = &mut ctx.accounts.blog_account;// grab a mutable reference to our BlogAccount struct
        blog_post_account.authority = *ctx.accounts.authority.key; // set the BlogAccount.authority to the pubkey of the authority
        Ok(())
    }
    //1 blog post data Vec<u8> vector of uint8 size (array inside array)
    //2 Our blog posts are going to be Strings, but we don't know how long these strings are going to be. Yes, we could pad them to a certain size, but a String is really just an array of bytes. In Rust we can describe our array of bytes as a Rust Vector of u8 bytes (Vec<u8>),
    pub fn make_post(ctx: Context<MakePost>, new_post: Vec<u8>) -> ProgramResult {
        //we take the Vec<u8> and convert it to a String slice (&str) with a bit of error handling included, in case we don't get valid UTF8:
        let post = from_utf8(&new_post).map_err(|err|{
            msg!("Invalid UTF-8, from byte {}", err.valid_up_to());
            ProgramError::InvalidInstructionData
        })?;
        msg!(post);// msg!() is a Solana macro that prints string slices to the program log, which we can grab from the transaction block data
        let the_blog_account = &mut ctx.accounts.blog_account;
        the_blog_account.latest_post = new_post;// cannot find function `from_utf8` in this scope

        // past posts will be saved in transaction logs
        Ok(())
    }
}

/**
 * In initialize we want to set our blog account authority. We will set authority to the same public key as the keys that signed the transaction.
    BUT, in order for us to have access to authority in initialize() we need:
    BlogAccount must be a created account
    BlogAccount must paid for by someone
    BlogAccount must have enough space allocated to store our data
    initialize must have access to the authority field on BlogAccount
    authority must sign the initialize tranaction request
 */

#[derive(Accounts)]
// this account struct that describes the account itself and enables us to access fields from the account struct
pub struct Initialize<'info> {
    #[account(
        init, // 1. Hey Anchor, initialize an account with these details for me
        payer = authority, // 2. See that authority Signer (pubkey) down there? They're paying for this
        space = 8 // 3.A) all accounts need 8 bytes for the account discriminator prepended to the account
        + 32 // 3.B) authority: Pubkey needs 32 bytes
        + 566 // 3.C) latest_post: post bytes could need up to 566 bytes for the memo
        // You have to do this math yourself, there's no macro for this
    )]
    pub blog_account: Account<'info, BlogAccount>,// initialize this account variable & add it to Context.accounts.blog_account can now be used above in our initialize function
    pub authority: Signer<'info>,// let's name the account that signs this transaction "authority" and make it mutable so we can set the value to it in `initialize` function above
    pub system_program: Program<'info, System> //Anchor boilerplate
}


#[account]
pub struct BlogAccount {
    pub authority: Pubkey, //need to have this keypair in order to make posts,
    pub latest_post: Vec<u8> //where the latest blog post will be stored
}

#[derive(Accounts)]
pub struct MakePost<'info>{
    #[account(mut, // we can make changes to this account
            has_one = authority)]
    // this is here again because it holds that .latest_post field where our post is saved
    pub blog_account: Account<'info, BlogAccount>,//enable this account to also be used in the make_post function

    // Also put authority here
    // has_one = authority ensure it was provided as a function arg
    // ensures the poster has the keys
    // has to come after the Account statement above
    // no mut this time, because we don't change authority when we post
    pub authority: Signer<'info>
}

// We need 2 keypairs in order to deploy:
// Our Program Authority keypair, and
// Our Program Keypair

