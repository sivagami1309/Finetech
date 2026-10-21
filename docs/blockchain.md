# FinGuard – TrustFlow: Blockchain & Smart Contract Architecture

## Target Network: Polygon Amoy Testnet
* **Network Name**: Polygon Amoy Testnet
* **Chain ID**: `80002` (Hex: `0x13882`)
* **RPC Endpoint**: `https://rpc-amoy.polygon.technology/`
* **Block Explorer**: `https://amoy.polygonscan.com`
* **Currency Symbol**: `POL` (0 monetary value test token)

## Solidity Smart Contract: `FinGuardTrustFlow.sol`
* Compiler: Solidity `0.8.20`
* Contract Address: `0x217d83E71c5324D69B0C522B2945dC3806Fa6a85`

### Key Contract Functions
1. `registerPaymentRecord(string paymentRef, bytes32 metadataHash)`
   * Rejects duplicate references.
   * Emits `PaymentRecordRegistered(paymentRef, metadataHash, msg.sender, block.timestamp)`.
   * Restricts writing to authorized callers / owner.
2. `getRecord(string paymentRef)`
   * Returns: `ref`, `metaHash`, `registeredBy`, `timestamp`, `blockNumber`, `isVerified`.
3. `isRecordRegistered(string paymentRef)`
   * Returns boolean existence flag.

### Metadata Hashing Standard
```typescript
const payload = JSON.stringify({
  paymentRef: "FG-2026-USIN-89421",
  sourceAmount: "1200.00",
  sourceCurrency: "USD",
  destinationAmount: "99850.00",
  destinationCurrency: "INR",
  recipient: "arjun mehta"
});
const metadataHash = ethers.keccak256(ethers.toUtf8Bytes(payload));
```
