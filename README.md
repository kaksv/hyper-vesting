# Token Vesting App with Privy Wallet

A comprehensive token vesting application built with Vite, React, and Privy wallet integration.

## Features

- **Token Locking & Streaming**: Create linear vesting schedules over custom time periods
- **Cliff Support**: Optional delayed start before streaming begins
- **Editable Streams**: Stream creators can update or cancel future streams
- **Multiple Streams**: Support for multiple streams per recipient
- **HyperEVM Deployment**: Contracts deployed on HyperEVM network
- **Visual Timeline**: Progress indicators for all active streams
- **Notifications**: On-chain events with off-chain notification support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Privy account (for wallet integration)

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `VITE_PRIVY_APP_ID`: Your Privy app ID
   - `VITE_CONTRACT_ADDRESS`: Deployed contract address
4. Start development server: `npm run dev`

### Deployment

#### Smart Contract Deployment

1. Set up Hardhat: `npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox`
2. Configure network settings in `hardhat.config.js`
3. Run deployment: `npx hardhat run scripts/deploy.js --network hyperevm`

#### Frontend Deployment

1. Build the app: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service

## Usage

### Creating a Stream

1. Connect your wallet using Privy
2. Navigate to the "Create Stream" tab
3. Fill in recipient address, token details, and vesting parameters
4. Submit the transaction to create the stream

### Managing Streams

- View all your streams in the "My Streams" tab
- Claim available tokens from active streams
- Cancel streams (if you're the creator) before they start

### Notifications

Check the "Notifications" tab for updates on:
- New streams created for you
- Available tokens to claim
- Stream cancellations

## Smart Contract Details

The `TokenVesting` contract includes:

- Stream creation with custom parameters
- Token claiming functionality
- Stream cancellation and editing
- Event emissions for all major actions

## Integration Guide

To integrate this vesting system into your dApp:

1. Import the contract ABI and address
2. Use the provided hooks for contract interaction
3. Handle wallet connection with Privy or your preferred provider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.