// Contract addresses by chain ID
const CONTRACT_ADDRESSES = {
  // Base (Mainnet)
  8453: {
    token1ContractAddress: "0xF3c3D545f3dD2A654dF2F54BcF98421CE2e3f121",
    quizGameContractAddress: "0x25D79A35F6323D0d3EE617549Cc507ED6B9639Cb",
    // New demo contracts (placeholder addresses - update after deployment)
    quizDuelContractAddress: "0x0000000000000000000000000000000000000001",
    guildSystemContractAddress: "0x0000000000000000000000000000000000000002",
    quizNFTContractAddress: "0x0000000000000000000000000000000000000003"
  },
  42220: {
    token1ContractAddress: "0xa933a6Ad2b7DD4c57771A975F9e0E5afdE0e99dc",
    quizGameContractAddress: "0xD9f245B50558686aF4D0Bf137a32D6fcEfba4054"
  }
} as const;

// Token1 ABI for balance checking
export const token1ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  }
] as const;

// Function to get contract addresses by chain ID
export function getContractAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || {
    token1ContractAddress: "0x0000000000000000000000000000000000000000",
    quizGameContractAddress: "0x0000000000000000000000000000000000000000"
  };
}

// Legacy exports removed - use getContractAddresses(chainId) instead

// Demo configuration
export const DEMO_CONFIG = {
  AUTO_PLAY_INTERVAL: 30000, // 30 seconds per step
  STEP_DURATION: {
    1: 20000, // Solo Quiz: 20 seconds
    2: 29000, // PvP Duel: 29 seconds  
    3: 29000, // Guild System: 29 seconds
    4: 26000  // NFT Quizzes: 26 seconds
  },
  MOCK_DATA: {
    ORACLE_PRICES: {
      ETH: { price: 2450.50, index: 1 },
      BASE: { price: 1.23, index: 2 }
    },
    GUILD_MEMBERS: [
      { name: "Alex", score: 850, avatar: "👤", fid: 12345 },
      { name: "Sarah", score: 720, avatar: "👩", fid: 23456 },
      { name: "Mike", score: 680, avatar: "👨", fid: 34567 },
      { name: "Emma", score: 590, avatar: "👱‍♀️", fid: 45678 }
    ]
  }
} as const;