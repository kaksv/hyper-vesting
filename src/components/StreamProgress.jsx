import { useEffect, useState } from 'react';

export default function StreamProgress({ 
  totalAmount, 
  claimedAmount, 
  startTime, 
  cliffDuration, 
  streamDuration, 
  isCancelled 
}) {
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  const calculateProgress = () => {
    if (isCancelled) return 100;
    
    const cliffEndTime = parseInt(startTime) + parseInt(cliffDuration);
    if (currentTime < cliffEndTime) {
      return 0;
    }
    
    const streamingStartTime = cliffEndTime;
    const streamingEndTime = streamingStartTime + parseInt(streamDuration);
    
    if (currentTime >= streamingEndTime) {
      return 100;
    }
    
    const elapsed = currentTime - streamingStartTime;
    const progress = (elapsed / parseInt(streamDuration)) * 100;
    return Math.min(progress, 100);
  };

  const progress = calculateProgress();
  const cliffEndTime = parseInt(startTime) + parseInt(cliffDuration);
  const isCliffPeriod = currentTime < cliffEndTime;
  const isStreaming = currentTime >= cliffEndTime && currentTime < cliffEndTime + parseInt(streamDuration);
  const isCompleted = currentTime >= cliffEndTime + parseInt(streamDuration);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Claimed: {claimedAmount} / {totalAmount}</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="text-xs text-gray-500">
        {isCliffPeriod && (
          <p>Cliff period: {formatTime(cliffEndTime - currentTime)} remaining</p>
        )}
        {isStreaming && (
          <p>
            Streaming: {formatTime(currentTime - cliffEndTime)} elapsed /{' '}
            {formatTime(streamDuration)} total
          </p>
        )}
        {isCompleted && !isCancelled && (
          <p>Streaming completed</p>
        )}
        {isCancelled && (
          <p>Stream cancelled</p>
        )}
      </div>
    </div>
  );
}