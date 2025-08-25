import { PrivyProvider } from '@privy-io/react-auth';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState, useEffect } from 'react';
import CreateStreamForm from './components/CreateStreamForm';
import StreamList from './components/StreamList';
import NotificationCenter from './components/NotificationCenter';
import { useVestingContract } from './hooks/useVestingContract';
import './App.css';

function AppContent() {
    // Hyper Liquid network configuration
const HYPER_LIQUID_NETWORK = {
  chainId: '0x3e6', // Hyper Liquid mainnet chain ID (23294 in decimal)
  chainName: 'Hyper Liquid',
  nativeCurrency: {
    name: 'Hype',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.hyperliquid-testnet.xyz/evm'],
  blockExplorerUrls: ['https://app.hyperliquid-testnet.xyz/explorer/'],
};


  const { login, logout, authenticated, user, ready } = usePrivy();
  const { wallets } = useWallets();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [streams, setStreams] = useState([]);
  const { getRecipientStreams, getStreamDetails } = useVestingContract();


 // Check if user is connected to Hyper Liquid network
  const checkNetwork = async () => {
    if (!wallets || wallets.length === 0) return false;

    try {
      const wallet = wallets[0];
      const provider = await wallet.getEthersProvider();
      const network = await provider.getNetwork();
      
      // Convert chainId to hex for comparison
      const currentChainId = `0x${network.chainId.toString(16)}`;
      return currentChainId === HYPER_LIQUID_NETWORK.chainId;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };


  // Switch to Hyper Liquid network
  const switchToHyperLiquid = async () => {
    if (!wallets || wallets.length === 0) return;

    setIsSwitching(true);
    try {
      const wallet = wallets[0];
      
      // Try to switch network, if not present, add it
      try {
        await wallet.switchChain(HYPER_LIQUID_NETWORK.chainId);
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await wallet.addChain(HYPER_LIQUID_NETWORK);
        } else {
          throw switchError;
        }
      }
      
      // Verify the switch was successful
      const isNowCorrect = await checkNetwork();
      setIsCorrectNetwork(isNowCorrect);
    } catch (error) {
      console.error('Error switching network:', error);
      alert('Failed to switch to Hyper Liquid network. Please switch manually.');
    } finally {
      setIsSwitching(false);
    }
  };


  useEffect(() => {
    const verifyNetwork = async () => {
    
    if (authenticated && wallets.length > 0) {
      const isCorrect = await checkNetwork();
      setIsCorrectNetwork(isCorrect);
      if (!isCorrect) {
          // Auto-prompt to switch network
          switchToHyperLiquid();
      }
      loadStreams();
     }
    }
    verifyNetwork
  }, [authenticated, wallets]);

  const loadStreams = async () => {
    try {
      const wallet = wallets[0];
      const recipientStreamIds = await getRecipientStreams(wallet.address);
      
      const streamDetails = await Promise.all(
        recipientStreamIds.map(id => getStreamDetails(id))
      );
      
      setStreams(streamDetails);
    } catch (error) {
      console.error('Error loading streams:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Hyper- Vesting</h1>
          {authenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 px-2 ">
                {wallets[0]?.address.slice(0, 4)}...{wallets[0]?.address.slice(-6)}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {authenticated ? (
          <>
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Create Stream
                </button>
                <button
                  onClick={() => setActiveTab('streams')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'streams'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Streams
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'notifications'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Notifications
                </button>
              </nav>
            </div>

            {activeTab === 'create' && <CreateStreamForm onStreamCreated={loadStreams} />}
            {activeTab === 'streams' && <StreamList streams={streams} onUpdate={loadStreams} />}
            {activeTab === 'notifications' && <NotificationCenter />}
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Connect your wallet to get started
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Create token vesting streams, manage existing streams, and claim your tokens
            </p>
            {/* <button
              onClick={login}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Connect Wallet
            </button> */}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID || "your-privy-app-id"}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'apple'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://your-logo-url.com/logo.png',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <AppContent />
    </PrivyProvider>
  );
}

export default App;