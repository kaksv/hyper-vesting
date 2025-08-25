// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract TokenVesting {
    struct Stream {
        address creator;
        address recipient;
        address tokenAddress;
        uint256 totalAmount;
        uint256 amountClaimed;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 streamDuration;
        bool isCancelled;
    }

    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public recipientStreams;
    mapping(address => uint256[]) public creatorStreams;
    
    uint256 public nextStreamId;
    
    event StreamCreated(
        uint256 indexed streamId,
        address indexed creator,
        address indexed recipient,
        address tokenAddress,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 streamDuration
    );
    
    event StreamEdited(
        uint256 indexed streamId,
        uint256 newTotalAmount,
        uint256 newStreamDuration
    );
    
    event StreamCancelled(uint256 indexed streamId);
    
    event TokensClaimed(
        uint256 indexed streamId,
        address indexed recipient,
        uint256 amount
    );

    function createStream (
        address recipient,
        address tokenAddress,
        uint256 totalAmount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 streamDuration
    ) external payable  returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(totalAmount > 0, "Amount must be positive");
        require(streamDuration > 0, "Duration must be positive");
        require(startTime >= block.timestamp, "Start time must be in future");
        
        if (tokenAddress != address(0)) {
            IERC20 token = IERC20(tokenAddress);
            require(
                token.allowance(msg.sender, address(this)) >= totalAmount,
                "Insufficient allowance"
            );
            require(
                token.transferFrom(msg.sender, address(this), totalAmount),
                "Token transfer failed"
            );
        } else {
            require(msg.value >= totalAmount, "Insufficient ETH sent");
        }
        
        uint256 streamId = nextStreamId++;
        streams[streamId] = Stream({
            creator: msg.sender,
            recipient: recipient,
            tokenAddress: tokenAddress,
            totalAmount: totalAmount,
            amountClaimed: 0,
            startTime: startTime,
            cliffDuration: cliffDuration,
            streamDuration: streamDuration,
            isCancelled: false
        });
        
        recipientStreams[recipient].push(streamId);
        creatorStreams[msg.sender].push(streamId);
        
        emit StreamCreated(
            streamId,
            msg.sender,
            recipient,
            tokenAddress,
            totalAmount,
            startTime,
            cliffDuration,
            streamDuration
        );
        
        return streamId;
    }

    function editStream(
        uint256 streamId,
        uint256 newTotalAmount,
        uint256 newStreamDuration
    ) external {
        Stream storage stream = streams[streamId];
        require(stream.creator == msg.sender, "Only creator can edit");
        require(!stream.isCancelled, "Stream is cancelled");
        require(block.timestamp < stream.startTime, "Stream has already started");
        
        stream.totalAmount = newTotalAmount;
        stream.streamDuration = newStreamDuration;
        
        emit StreamEdited(streamId, newTotalAmount, newStreamDuration);
    }

    function cancelStream(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.creator == msg.sender, "Only creator can cancel");
        require(!stream.isCancelled, "Stream already cancelled");
        
        stream.isCancelled = true;
        uint256 refundAmount = stream.totalAmount - stream.amountClaimed;
        
        if (stream.tokenAddress != address(0)) {
            IERC20(stream.tokenAddress).transfer(stream.creator, refundAmount);
        } else {
            payable(stream.creator).transfer(refundAmount);
        }
        
        emit StreamCancelled(streamId);
    }

    function claimableAmount(uint256 streamId) public view returns (uint256) {
        Stream storage stream = streams[streamId];
        
        if (stream.isCancelled) return 0;
        if (block.timestamp < stream.startTime + stream.cliffDuration) return 0;
        
        uint256 elapsedTime = block.timestamp - (stream.startTime + stream.cliffDuration);
        if (elapsedTime > stream.streamDuration) {
            elapsedTime = stream.streamDuration;
        }
        
        uint256 totalClaimable = (stream.totalAmount * elapsedTime) / stream.streamDuration;
        return totalClaimable - stream.amountClaimed;
    }

    function claimTokens(uint256 streamId) external {
        Stream storage stream = streams[streamId];
        require(stream.recipient == msg.sender, "Only recipient can claim");
        require(!stream.isCancelled, "Stream is cancelled");
        
        uint256 amount = claimableAmount(streamId);
        require(amount > 0, "No tokens to claim");
        
        stream.amountClaimed += amount;
        
        if (stream.tokenAddress != address(0)) {
            IERC20(stream.tokenAddress).transfer(stream.recipient, amount);
        } else {
            payable(stream.recipient).transfer(amount);
        }
        
        emit TokensClaimed(streamId, stream.recipient, amount);
    }

    function getRecipientStreams(address recipient) external view returns (uint256[] memory) {
        return recipientStreams[recipient];
    }

    function getCreatorStreams(address creator) external view returns (uint256[] memory) {
        return creatorStreams[creator];
    }

    function getStreamDetails(uint256 streamId) external view returns (
        address creator,
        address recipient,
        address tokenAddress,
        uint256 totalAmount,
        uint256 amountClaimed,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 streamDuration,
        bool isCancelled
    ) {
        Stream storage stream = streams[streamId];
        return (
            stream.creator,
            stream.recipient,
            stream.tokenAddress,
            stream.totalAmount,
            stream.amountClaimed,
            stream.startTime,
            stream.cliffDuration,
            stream.streamDuration,
            stream.isCancelled
        );
    }
    
    receive() external payable {}
}