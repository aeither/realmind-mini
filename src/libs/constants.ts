// Contract addresses by chain ID
const CONTRACT_ADDRESSES = {
  // Hyperion (Testnet)
  133717: {
    token1ContractAddress: "0x9599861081C211E5C289cD833eeC9EE223Bcd51A",
    quizGameContractAddress: "0x37E2619161ACe4149FD9366F30846DB909bd2A07",
    // New demo contracts (placeholder addresses - update after deployment)
    quizDuelContractAddress: "0x0000000000000000000000000000000000000001",
    guildSystemContractAddress: "0x0000000000000000000000000000000000000002",
    quizNFTContractAddress: "0x0000000000000000000000000000000000000003"
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

// Legacy exports for backward compatibility (defaults to Core Testnet)
export const token1ContractAddress = CONTRACT_ADDRESSES[133717].token1ContractAddress;
export const quizGameContractAddress = CONTRACT_ADDRESSES[133717].quizGameContractAddress;

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
      tMETIS: { price: 1.23, index: 1 },
      ETH: { price: 2450.50, index: 2 }
    },
    GUILD_MEMBERS: [
      { name: "Alex", score: 850, avatar: "👤", fid: 12345 },
      { name: "Sarah", score: 720, avatar: "👩", fid: 23456 },
      { name: "Mike", score: 680, avatar: "👨", fid: 34567 },
      { name: "Emma", score: 590, avatar: "👱‍♀️", fid: 45678 }
    ]
  }
} as const;