use anchor_lang::prelude::*;

declare_id!("5jYr5nueJ2AfxSGh9qZMeXFwcdXmFCqW9tFmkiC6aC7U");

#[program]
pub mod myepicproject {
  use super::*;
  pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> Result <()> {
    let base_account = &mut ctx.accounts.base_account;
    base_account.total_gif_count = 0;
    Ok(())
  }

  pub fn add_gif(ctx:Context<AddGif> , gif_link:String)-> Result<()> {
    let base_account = &mut ctx.accounts.base_account;
    let user_address = &mut ctx.accounts.user;
    let item = ItemStruct{
        gif_link:gif_link.to_string() ,
        user_address: *user_address.to_account_info().key,
        up_vote:0,
    };
    base_account.gif_link_user_address_struct.push(item);
    base_account.total_gif_count += 1;
    Ok(())
  }

  pub fn upvote_gif(ctx: Context<UpvoteGif>, gif_link: String) -> Result<()> {
    let base_account = &mut ctx.accounts.base_account;

    // Find the GIF by its link
    for item in base_account.gif_link_user_address_struct.iter_mut() {
      if item.gif_link == gif_link {
          item.up_vote += 1;
          break;
      }
  }
    Ok(())

}


}

#[derive(Accounts)]
pub struct  StartStuffOff<'info>{
    #[account(init , payer = user , space = 9000)]
    pub base_account : Account<'info , BaseAccount>,
    #[account(mut)]
    pub user : Signer<'info>,
    pub system_program : Program<'info ,System>
}

#[derive(Accounts)]
pub struct AddGif<'info>{
    #[account(mut)]
    pub base_account : Account<'info , BaseAccount>,
    #[account(mut)]
    pub user : Signer<'info>
}

#[derive(Accounts)]
pub struct UpvoteGif<'info>{
  #[account(mut)]
  pub  base_account : Account<'info , BaseAccount>,
  #[account(mut)]
  pub user : Signer<'info>
}

#[derive(Debug , Clone , AnchorSerialize , AnchorDeserialize)]
pub struct ItemStruct{
    pub gif_link : String,
    pub user_address:Pubkey,
    pub up_vote:u128,
}

#[account]
pub struct BaseAccount{
    pub total_gif_count:u64,
    pub gif_link_user_address_struct:Vec<ItemStruct>
}