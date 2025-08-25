import { useState } from 'react';
import { useVestingContract } from '../hooks/useVestingContract';
import StreamProgress from './StreamProgress';

// eslint-disable-next-line react/prop-types
export default function StreamList({ streams, onUpdate }) {
  const { claimTokens, cancelStream } = useVestingContract();
  const [processingIds, setProcessingIds] = useState(new Set());

  const handleClaim = async (streamId) => {
    setProcessingIds(prev => new Set(prev).add(streamId));
    try {
      await claimTokens(streamId);
      onUpdate();
      alert('Tokens claimed successfully!');
    } catch (error) {
      console.error('Error claiming tokens:', error);
      alert('Failed to claim tokens: ' + error.message);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(streamId);
        return newSet;
      });
    }
  };

  const handleCancel = async (streamId) => {
    if (!window.confirm('Are you sure you want to cancel this stream?')) return;
    
    setProcessingIds(prev => new Set(prev).add(streamId));
    try {
      await cancelStream(streamId);
      onUpdate();
      alert('Stream cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling stream:', error);
      alert('Failed to cancel stream: ' + error.message);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(streamId);
        return newSet;
      });
    }
  };

  // eslint-disable-next-line react/prop-types
  if (streams.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No vesting streams found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {streams.map(stream => (
        <div key={stream.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-medium">Stream #{stream.id}</h3>
              <p className="text-sm text-gray-500">
                From: {stream.creator.slice(0, 8)}...{stream.creator.slice(-6)}
              </p>
              <p className="text-sm text-gray-500">
                Token: {stream.tokenAddress === '0x0000000000000000000000000000000000000000' 
                  ? 'ETH' 
                  : stream.tokenAddress.slice(0, 8)}...{stream.tokenAddress.slice(-6)}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {new Date(stream.startTime * 1000).toLocaleDateString()}
              </p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                stream.isCancelled 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {stream.isCancelled ? 'Cancelled' : 'Active'}
              </span>
            </div>
          </div>
          
          <StreamProgress 
            totalAmount={stream.totalAmount} 
            claimedAmount={stream.amountClaimed} 
            startTime={stream.startTime}
            cliffDuration={stream.cliffDuration}
            streamDuration={stream.streamDuration}
            isCancelled={stream.isCancelled}
          />
          
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => handleClaim(stream.id)}
              disabled={processingIds.has(stream.id) || stream.isCancelled}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {processingIds.has(stream.id) ? 'Processing...' : 'Claim Tokens'}
            </button>
            
            {!stream.isCancelled && (
              <button
                onClick={() => handleCancel(stream.id)}
                disabled={processingIds.has(stream.id)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Stream
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}