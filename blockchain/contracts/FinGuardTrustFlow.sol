// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FinGuardTrustFlow
 * @dev Verifiable Cross-Border Payment Reference Registry for Freelancers.
 * Stores tamper-proof cryptographic attestations and metadata hashes for international payments.
 * Note: This contract does NOT hold custody of funds or execute bank settlements;
 * it provides transparent, immutable proof-of-transaction records on Polygon Amoy.
 */
contract FinGuardTrustFlow {
    address public owner;

    struct PaymentRecord {
        string paymentRef;
        bytes32 metadataHash;
        address registeredBy;
        uint256 timestamp;
        uint256 blockNumber;
        bool exists;
    }

    // Mapping from unique payment reference string to on-chain record
    mapping(string => PaymentRecord) private _records;
    
    // Whitelisted addresses allowed to register records (e.g., backend settlement oracle)
    mapping(address => bool) public authorizedRecorders;

    // Total count of verified payment references
    uint256 public totalRecordsCount;

    // Events
    event PaymentRecordRegistered(
        string indexed paymentRef,
        bytes32 metadataHash,
        address indexed registeredBy,
        uint256 timestamp
    );

    event RecorderAuthorizationUpdated(
        address indexed recorder,
        bool isAuthorized
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "FinGuard: Caller is not contract owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedRecorders[msg.sender],
            "FinGuard: Caller is not authorized to register payment records"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedRecorders[msg.sender] = true;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Authorize or revoke an address from submitting payment records
     */
    function setAuthorizedRecorder(address recorder, bool isAuthorized) external onlyOwner {
        require(recorder != address(0), "FinGuard: Invalid recorder address");
        authorizedRecorders[recorder] = isAuthorized;
        emit RecorderAuthorizationUpdated(recorder, isAuthorized);
    }

    /**
     * @notice Transfer ownership of the contract
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "FinGuard: New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @notice Register a verifiable payment reference with its SHA-256/Keccak-256 metadata hash
     * @param paymentRef Unique transaction reference (e.g. 'FG-2026-USIN-89421')
     * @param metadataHash Cryptographic hash of transaction terms (amount, rate, recipient hash)
     */
    function registerPaymentRecord(
        string calldata paymentRef,
        bytes32 metadataHash
    ) external onlyAuthorized {
        require(bytes(paymentRef).length > 0, "FinGuard: Payment reference cannot be empty");
        require(metadataHash != bytes32(0), "FinGuard: Metadata hash cannot be zero");
        require(!_records[paymentRef].exists, "FinGuard: Duplicate record - reference already registered");

        _records[paymentRef] = PaymentRecord({
            paymentRef: paymentRef,
            metadataHash: metadataHash,
            registeredBy: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number,
            exists: true
        });

        totalRecordsCount += 1;

        emit PaymentRecordRegistered(
            paymentRef,
            metadataHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Retrieve public verification information for a given payment reference
     */
    function getRecord(string calldata paymentRef)
        external
        view
        returns (
            string memory ref,
            bytes32 metaHash,
            address registeredBy,
            uint256 timestamp,
            uint256 blockNumber,
            bool isVerified
        )
    {
        PaymentRecord memory rec = _records[paymentRef];
        if (!rec.exists) {
            return (paymentRef, bytes32(0), address(0), 0, 0, false);
        }
        return (
            rec.paymentRef,
            rec.metadataHash,
            rec.registeredBy,
            rec.timestamp,
            rec.blockNumber,
            true
        );
    }

    /**
     * @notice Check whether a payment reference is registered
     */
    function isRecordRegistered(string calldata paymentRef) external view returns (bool) {
        return _records[paymentRef].exists;
    }
}
