import { NETWORKS } from './constants';

// Function to add HyperEVM network to user's wallet
export const addHyperEVMNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or similar wallet not found');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [NETWORKS.hyperevm]
    });
    return true;
  } catch (error) {
    console.error('Error adding HyperEVM network:', error);
    throw error;
  }
};

// Function to switch to HyperEVM network
export const switchToHyperEVMNetwork = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask or similar wallet not found');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORKS.hyperevm.chainId }]
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await addHyperEVMNetwork();
        return true;
      } catch (addError) {
        console.error('Error adding HyperEVM network:', addError);
        throw addError;
      }
    }
    console.error('Error switching to HyperEVM network:', switchError);
    throw switchError;
  }
};

// Check if connected to HyperEVM network
export const isHyperEVMNetwork = (chainId) => {
  return chainId === NETWORKS.hyperevm.chainId;
};

// Get transaction link for HyperEVM explorer
export const getTransactionLink = (txHash) => {
  return `${NETWORKS.hyperevm.blockExplorer}/tx/${txHash}`;
};

// Get address link for HyperEVM explorer
export const getAddressLink = (address) => {
  return `${NETWORKS.hyperevm.blockExplorer}/address/${address}`;
};

// Format HyperEVM-specific error messages
export const formatHyperEVMError = (error) => {
  if (error.message.includes('user rejected transaction')) {
    return 'Transaction was rejected';
  }
  
  if (error.message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }
  
  if (error.message.includes('execution reverted')) {
    // Extract the revert reason if possible
    const revertMatch = error.message.match(/execution reverted: ([^"]*)/);
    return revertMatch ? revertMatch[1] : 'Transaction reverted';
  }
  
  return error.message;
};

// Helper to wait for transaction confirmation
export const waitForTransaction = async (provider, txHash) => {
  const receipt = await provider.waitForTransaction(txHash);
  if (!receipt.status) {
    throw new Error('Transaction failed');
  }
  return receipt;
};