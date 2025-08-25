import { useState, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import TokenVestingABI from '../contracts/TokenVestingABI.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export function useVestingContract() {
  const { wallets } = useWallets();
  const [contract, setContract] = useState(null);

  const getContract = useCallback(() => {
    if (!wallets.length) return null;
    
    const provider = new ethers.BrowserProvider(wallets[0].provider);
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, TokenVestingABI, signer);
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
    const vestingContract = getContract();
    const value = isNative ? ethers.parseEther(totalAmount) : 0;
    
    const tx = await vestingContract.createStream(
      recipient,
      tokenAddress,
      ethers.parseEther(totalAmount),
      startTime,
      cliffDuration,
      streamDuration,
      { value }
    );
    
    return await tx.wait();
  };

  const claimTokens = async (streamId) => {
    const vestingContract = getContract();
    const tx = await vestingContract.claimTokens(streamId);
    return await tx.wait();
  };

  const cancelStream = async (streamId) => {
    const vestingContract = getContract();
    const tx = await vestingContract.cancelStream(streamId);
    return await tx.wait();
  };

  const getRecipientStreams = async (address) => {
    const vestingContract = getContract();
    return await vestingContract.getRecipientStreams(address);
  };

  const getStreamDetails = async (streamId) => {
    const vestingContract = getContract();
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