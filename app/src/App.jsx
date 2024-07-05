import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import loader from "./assets/loader-unscreen.gif"
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from "../myepicproject.json"
import kp from './keypair.json'
import "./App.css";
import { Buffer } from "buffer";
window.Buffer = Buffer;

// Constants
const TWITTER_HANDLE = "HarshRadadiya99";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

const { SystemProgram, Keypair } = web3;
// let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

const PROGRAM_ID = idl.metadata.address;
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed"
}

const App = () => {


  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState()
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);
  const [loading, setLoading] = useState(true)

  const getMyBalance = async (address) => {
    // console.log("Address ----->>> " ,address);
    const key = new PublicKey(address);
    const connection = new Connection(clusterApiUrl("devnet"));
    const accountInfo =  await connection.getAccountInfo(key);
    console.log("Accoiunt info ==> " , accountInfo);
    connection.getBalance(key).then(balance => {
      setBalance(balance / web3.LAMPORTS_PER_SOL)
    })
    // setBalance(balance);

  }

  const getProvider = () => {
    const connction = new Connection(network, opts.preflightCommitment)
    const provider = new AnchorProvider(connction, window.solana, opts.preflightCommitment)
    return provider;
  }

  const getProgram = () => {
    const program = new Program(idl, PROGRAM_ID, getProvider());
    return program;
  }



  // Actions
  const checkIfWalletIsConnected = async () => {
    if (window?.solana?.isPhantom) {
      console.log("Phantom wallet found!");
      const response = await window.solana.connect({ onlyIfTrusted: true });
      console.log("Connected with Public Key:", response.publicKey.toString());

      const address = response.publicKey.toBase58();
      setWalletAddress(response.publicKey.toBase58());
      getMyBalance(address);

    } else {
      alert("Solana object not found! Get a Phantom Wallet 👻");
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const sendGif = async () => {
    setLoading(true)
    if (inputValue.length > 0) {
      const program = getProgram();
      const provider = getProvider();
      console.log("Gif link:", inputValue);
      setGifList([...gifList, inputValue]);
      setInputValue("");
      console.log("Link ==> ", inputValue);
      try {
        const tx = await program.rpc.addGif(inputValue, {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
          }
        })
        console.log("Add link TX ==> ", tx);
        await getGifList();
      } catch (error) {
        console.log("Error sending GIF:", error)
      }
    } else {
      console.log("Empty input. Try again.");
    }
    setLoading(false)
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const renderConnectedContainer = () => {
    // console.log("GIF +++>>> " , gifList);
    if (gifList == null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>

      )
    } else {
      return (
        <div>
          {
            loading == true ? (
              <div className="connected-container">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendGif();
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter gif link!"
                    value={inputValue}
                    onChange={onInputChange}
                  />
                  <button type="submit" className="cta-button submit-gif-button">
                    Submit
                  </button>
                </form>
                <div className="gif-grid">
                  {/* Map through gifList instead of TEST_GIFS */}
                  {gifList && (gifList.map((gif, i) => (
                    <div className="gif-item" key={i}>
                      <img src={gif.gifLink} alt={gif} />
                      {gif.userAddress ? (

                        <div className="sub-text">{gif.userAddress.toString()}</div>
                      ) : (
                        <div className="connected-container">
                          <img src={loader} alt="" srcset="" />
                        </div>
                      )

                      }
                    </div>
                  )))}
                </div>
              </div>
            ) : (
              <div className="connected-container">
                <img src={loader} alt="" srcset="" />
              </div>
            )
          }

        </div>

      )
    }
  };



  // program intraction
  const createGifAccount = async () => {
    try {
      const program = getProgram();
      const provider = getProvider();
      const tx = await program.rpc.startStuffOff(
        {
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId
          }, signers: [baseAccount],
        }
      )
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();

      console.log("Init BaseAccount ==> ", tx);

    } catch (error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const getGifList = async () => {
    try {
      const program = await getProgram();
      console.log("Proram ==> ", program);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      // console.log("Got the account", account)
      setGifList(account.gifLinkUserAddressStruct)

    } catch (error) {
      console.log("Error in getGifList: ", error)
      setGifList(null);
    }

  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");

      // Call Solana program here.

      // Set state
      getGifList();
    }
  }, [walletAddress]);


  return (
    <div className="App">
      {/* This was solely added for some styling fanciness */}
      {balance && <h3 className="sub-text" >
        Balance : {balance}
      </h3>}
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼️ GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {/* Add the condition to show this only if we don't have a wallet address */}
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && loading ? renderConnectedContainer() : (
            <div>
              <img src={loader} alt="" srcset="" />
            </div>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
