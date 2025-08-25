// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  hyperevm: import.meta.env.VITE_CONTRACT_ADDRESS || "0xYourDeployedContractAddress",
//   sepolia: "0x...", // Example for other networks
  localhost: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
};

// Supported tokens with their addresses and decimals
export const SUPPORTED_TOKENS = {
  hype: {
    HYPE: {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "HYPE",
      decimals: 18,
      name: "Hype Token"
    },
    USDC: {
      address: "0xYourUSDCAddressOnHyperEVM",
      symbol: "USDC",
      decimals: 6,
      name: "USD Coin"
    },
    // Add more tokens as needed
  }
};

// Network configurations
export const NETWORKS = {
  hyperevm: {
    chainId: "0x3e6", // HyperEVM chain ID for testnet
    chainName: "HyperEVM",
    rpcUrl: "https://rpc.hyperliquid-testnet.xyz/evm",
    blockExplorer: "https://app.hyperliquid-testnet.xyz/explorer",
    nativeCurrency: {
      name: "Hype",
      symbol: "HYPE",
      decimals: 18
    }
  }
};

// Default stream durations in seconds
export const DEFAULT_DURATIONS = {
  THREE_MONTHS: 7776000,   // 90 days
  SIX_MONTHS: 15552000,    // 180 days
  ONE_YEAR: 31536000,      // 365 days
  TWO_YEARS: 63072000      // 730 days
};

// Notification types
export const NOTIFICATION_TYPES = {
  STREAM_CREATED: 'stream_created',
  TOKENS_CLAIMED: 'tokens_claimed',
  STREAM_CANCELLED: 'stream_cancelled',
  STREAM_EDITED: 'stream_edited'
};

// Error messages
export const ERROR_MESSAGES = {
  CONTRACT_NOT_DEPLOYED: "Contract not deployed on this network",
  WALLET_NOT_CONNECTED: "Please connect your wallet first",
  INSUFFICIENT_BALANCE: "Insufficient balance",
  TRANSACTION_FAILED: "Transaction failed",
  INVALID_ADDRESS: "Invalid address format"
};