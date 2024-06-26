// const anchor = require("@coral-xyz/anchor");

// describe("myepicproject", () => {
//   // Configure the client to use the local cluster.
//   anchor.setProvider(anchor.AnchorProvider.env());

//   it("Is initialized!", async () => {
//     // Add your test here.
//     const program = anchor.workspace.Myepicproject;
//     const tx = await program.methods.initialize().rpc();
//     console.log("Your transaction signature", tx);
//   });
// });


const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;
const main = async () => {
  console.log("🚀 Starting test...")

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Myepicproject;
  const createBaseAccount = anchor.web3.Keypair.generate();
  console.log("Program ==> " , program);
  const tx = await program.rpc.startStuffOff(
    {
      accounts: {
        baseAccount: createBaseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      }, signers: [createBaseAccount],
    }
  );
  console.log("📝 initialize gif count => ", tx);
  let account = await program.account.baseAccount.fetch(createBaseAccount.publicKey);
  console.log("👁️👁️ GIF Count = ", account.totalGifCount.toString());
  

  const tx1 = await program.rpc.addGif(("Hello Word")
    ,{
      accounts: {
        baseAccount: createBaseAccount.publicKey,
        user:provider.wallet.publicKey
      }
    }
  )
  
  const tx2 = await program.rpc.addGif(("Hello Word")
    ,{
      accounts: {
        baseAccount: createBaseAccount.publicKey,
        user:provider.wallet.publicKey
      }
    }
  )
  
  const tx3 = await program.rpc.addGif(("Hello Word2")
    ,{
      accounts: {
        baseAccount: createBaseAccount.publicKey,
        user:provider.wallet.publicKey
      }
    }
  )
  
  const tx4 = await program.rpc.addGif(("Hello Word1")
    ,{
      accounts: {
        baseAccount: createBaseAccount.publicKey,
        user:provider.wallet.publicKey
      }
    }
  )
  
  // console.log("📝 Add 1 gif count => ", tx1);

  const txupvote = await program.rcp.upvoteGif(("Hello Word2") , {
    accounts:{
      baseAccount:createBaseAccount.publicKey,
      user:provider.wallet.publicKey,
    }
  })


  account = await program.account.baseAccount.fetch(createBaseAccount.publicKey);
  console.log("👁️👁️ GIF Count = ", account.totalGifCount.toString());
  console.log("👁️👁️ GIF Link list = ", account.gifLinkUserAddressStruct);

}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();