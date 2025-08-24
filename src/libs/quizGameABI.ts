const quizGameABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "type": "error",
        "name": "OwnableInvalidOwner"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "type": "error",
        "name": "OwnableUnauthorizedAccount"
    },
    {
        "inputs": [],
        "type": "error",
        "name": "ReentrancyGuardReentrantCall"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "previousOwner",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "OwnershipTransferred",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "string",
                "name": "quizId",
                "type": "string",
                "indexed": false
            },
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "tokensMinted",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "submittedCorrectAnswers",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "expectedCorrectAnswers",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "QuizCompleted",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "string",
                "name": "quizId",
                "type": "string",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "userAnswer",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint128",
                "name": "amountPaid",
                "type": "uint128",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "initialTokensMinted",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "QuizStarted",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "oldToken",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "newToken",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "TokenAddressUpdated",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "oldMultiplier",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "newMultiplier",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "TokenMultiplierUpdated",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "oldVault",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "newVault",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "VaultAddressUpdated",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "submittedCorrectAnswers",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "completeQuiz"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "getQuizSession",
        "outputs": [
            {
                "internalType": "struct QuizGame.QuizSession",
                "name": "",
                "type": "tuple",
                "components": [
                    {
                        "internalType": "bool",
                        "name": "active",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint128",
                        "name": "amountPaid",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "timestamp",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint256",
                        "name": "userAnswer",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "correctAnswers",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "quizId",
                        "type": "string"
                    }
                ]
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "hasActiveQuiz",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "mintToken"
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "renounceOwnership"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setToken"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newMultiplier",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setTokenMultiplier"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newVaultAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setVaultAddress"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "quizId",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "userAnswer",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "expectedCorrectAnswers",
                "type": "uint256"
            }
        ],
        "stateMutability": "payable",
        "type": "function",
        "name": "startQuiz"
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "token",
        "outputs": [
            {
                "internalType": "contract Token1",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "tokenMultiplier",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transferOwnership"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "userSessions",
        "outputs": [
            {
                "internalType": "bool",
                "name": "active",
                "type": "bool"
            },
            {
                "internalType": "uint128",
                "name": "amountPaid",
                "type": "uint128"
            },
            {
                "internalType": "uint128",
                "name": "timestamp",
                "type": "uint128"
            },
            {
                "internalType": "uint256",
                "name": "userAnswer",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "correctAnswers",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "quizId",
                "type": "string"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "vaultAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw"
    },
    {
        "inputs": [],
        "stateMutability": "payable",
        "type": "receive"
    }
] as const

export { quizGameABI }