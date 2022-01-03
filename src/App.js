import "./App.css";
import * as React from "react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./abi/WavePortal.json";
require("dotenv").config();

const contractAddress = "0x6b3248522e754DCb91b03A22bD55De4f15E1E20B";

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [nbWaves, setNbWaves] = useState(0);

  const contractAbi = abi.abi;

  const getTextboxValue = async (e) => {
    // console.log(e.target.value)
    setMessage(e.target.value);
  };

  const wave = async (e) => {
    try {
      const { ethereum } = window;
      e.preventDefault();

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        //console.log("Retrieved total wave count...", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(message, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        //console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        //console.log("Retrieved total wave count...", count.toNumber());
      } else {
        // console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const countWaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        //setNbWaves(count)

        setNbWaves(count.toNumber());
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractAbi,
          signer
        );
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map((wave) => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
            test: "test",
          };
        });
        wavesCleaned.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Listen in for emitter events!
   */
  useEffect(() => {
    getAllWaves();
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      //console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);
  useEffect(() => {
    countWaves();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return false;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        return false;
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      //console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Your need to be logged in");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      //console.log("Connected", accounts[0]);
      setCurrentAccount("");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        {/* 
        <input
          type="text"
          className="message"
          placeholder="Write a message"
          onChange={getTextboxValue}
        />

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button> */}

        <form action="" className="waveForm" onSubmit={wave}>
          <div className="bio">
            <p>
              I am Malchik and I'm learning solidity tricks ! That's pretty cool
              right?
            </p>
            <p>
              Connect your wallet to Ethereum Rinkeby , write your twitter handle and wave
              at me!
            </p>
            <p>Follow me on Twitter: @0xProudFrog</p>
            {currentAccount ? (
              <p>
                I already received {nbWaves} waves ! What are you waiting for ?
              </p>
            ) : null}
          </div>
          <input
            type="text"
            className="waveFormMessage"
            placeholder="Write a message"
            required
            onChange={getTextboxValue}
          />

          <button type="submit" className="waveButton">
            Wave at Me
          </button>
        </form>

        {!currentAccount ? (
          <button className="connectButton" onClick={connectWallet}>
            Connect
          </button>
        ) : (
          <button className="connectButton" onClick={disconnectWallet}>
            <p>
              {currentAccount.substring(0, 4) +
                "..." +
                currentAccount.substring(11, 14)}{" "}
              - Click to logout
            </p>
          </button>
        )}

        {currentAccount
          ? allWaves.map((wave, index) => {
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#333",
                    marginTop: "16px",
                    padding: "8px",
                    color: "white",
                  }}
                >
                  <div>Address: {wave.address}</div>
                  <div>Time: {wave.timestamp.toString()}</div>
                  <div>Message: {wave.message}</div>
                </div>
              );
            })
          : ""}
      </div>
    </div>
  );
}
