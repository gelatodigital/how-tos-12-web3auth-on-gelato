export const counterAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newCounterValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "msgSender",
        "type": "address"
      }
    ],
    "name": "IncrementCounter",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "counter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]