import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useVestingContract } from '../hooks/useVestingContract';

// eslint-disable-next-line react/prop-types
export default function CreateStreamForm({ onStreamCreated }) {
  const { wallets } = useWallets();
  const { createStream } = useVestingContract();
  
  const [formData, setFormData] = useState({
    recipient: '',
    tokenAddress: '',
    totalAmount: '',
    startTime: '',
    cliffDuration: '0',
    streamDuration: '',
    isNativeToken: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const wallet = wallets[0];
      const startTimestamp = Math.floor(new Date(formData.startTime).getTime() / 1000);
      
      await createStream(
        formData.recipient,
        formData.isNativeToken ? '0x0000000000000000000000000000000000000000' : formData.tokenAddress,
        formData.totalAmount,
        startTimestamp,
        parseInt(formData.cliffDuration),
        parseInt(formData.streamDuration),
        formData.isNativeToken
      );
      
      setFormData({
        recipient: '',
        tokenAddress: '',
        totalAmount: '',
        startTime: '',
        cliffDuration: '0',
        streamDuration: '',
        isNativeToken: false,
      });
      
      onStreamCreated();
      alert('Stream created successfully!');
    } catch (error) {
      console.error('Error creating stream:', error);
      alert('Failed to create stream: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Create New Vesting Stream</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0x..."
          />
        </div>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="isNativeToken"
            name="isNativeToken"
            checked={formData.isNativeToken}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isNativeToken" className="ml-2 block text-sm text-gray-900">
            Use native token (HYPE)
          </label>
        </div>
        
        {!formData.isNativeToken && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ERC-20 Token Address
            </label>
            <input
              type="text"
              name="tokenAddress"
              value={formData.tokenAddress}
              onChange={handleInputChange}
              required={!formData.isNativeToken}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Amount
          </label>
          <input
            type="number"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleInputChange}
            required
            min="0"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliff Duration (seconds)
          </label>
          <input
            type="number"
            name="cliffDuration"
            value={formData.cliffDuration}
            onChange={handleInputChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Time before streaming begins (0 for no cliff)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stream Duration (seconds)
          </label>
          <input
            type="number"
            name="streamDuration"
            value={formData.streamDuration}
            onChange={handleInputChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 15552000 for 6 months"
          />
          <p className="text-xs text-gray-500 mt-1">
            Total duration over which tokens will be streamed
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Stream...' : 'Create Stream'}
        </button>
      </form>
    </div>
  );
}