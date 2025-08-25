import { useState, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers, parseEther } from 'ethers';
import {TokenVestingABI} from '../contracts/TokenVestingABI';


const CONTRACT_ADDRESS = "0x5950FcC9Df77655e675c4bD959342a3c06ef905a" ;

export function useVestingContract() {
  const { wallets } = useWallets();
  const [contract, setContract] = useState(null);

  const getContract = useCallback(async() => {
    if (!wallets.length) {
      return null
    }else{

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer =  await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, TokenVestingABI, signer);
    }
  }, [wallets]);

  const createStream = async (
    recipient,
    tokenAddress,
    totalAmount,
    startTime,
    cliffDuration,
    streamDuration,
    isNative = false
  ) => {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer =  await provider.getSigner();
    const vestingContract = new ethers.Contract(CONTRACT_ADDRESS, TokenVestingABI, signer);
    // const vestingContract = getContract();
    const value = isNative ? parseEther(totalAmount) : 0;
    
    const tx = await vestingContract.createStream(
      recipient,
      tokenAddress,
      parseEther(totalAmount),
      startTime,
      cliffDuration,
      streamDuration,
      { value }
    );
    
    return await tx.wait();
  };

  const claimTokens = async (streamId) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer =  await provider.getSigner();
    const vestingContract = new ethers.Contract(CONTRACT_ADDRESS, TokenVestingABI, signer);
    const tx = await vestingContract.claimTokens(streamId);
    return await tx.wait();
  };

  const cancelStream = async (streamId) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer =  await provider.getSigner();
    const vestingContract = new ethers.Contract(CONTRACT_ADDRESS, TokenVestingABI, signer);
    const tx = await vestingContract.cancelStream(streamId);
    return await tx.wait();
  };

  const getRecipientStreams = async (address) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer =  await provider.getSigner();
    const vestingContract = new ethers.Contract(CONTRACT_ADDRESS, TokenVestingABI, signer);
    return await vestingContract.getRecipientStreams(address);
  };

  const getStreamDetails = async (streamId) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer =  await provider.getSigner();
    const vestingContract = new ethers.Contract(CONTRACT_ADDRESS, TokenVestingABI, signer);
    const details = await vestingContract.getStreamDetails(streamId);
    
    return {
      id: streamId,
      creator: details[0],
      recipient: details[1],
      tokenAddress: details[2],
      totalAmount: ethers.formatEther(details[3]),
      amountClaimed: ethers.formatEther(details[4]),
      startTime: parseInt(details[5]),
      cliffDuration: parseInt(details[6]),
      streamDuration: parseInt(details[7]),
      isCancelled: details[8]
    };
  };

  return {
    createStream,
    claimTokens,
    cancelStream,
    getRecipientStreams,
    getStreamDetails
  };
}