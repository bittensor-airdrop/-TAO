// Smart Contract Integration for TAO Airdrop
class ContractManager {
    constructor() {
        this.contract = null;
        this.tokenAddress = "0x..."; // Replace with deployed contract address
        this.contractABI = [
            {
                "inputs": [
                    {"internalType": "uint256", "name": "initialSupply", "type": "uint256"}
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
                    {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
                ],
                "name": "Approval",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
                    {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
                    {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
                ],
                "name": "Transfer",
                "type": "event"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "owner", "type": "address"},
                    {"internalType": "address", "name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}
                ],
                "name": "decreaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "addedValue", "type": "uint256"}
                ],
                "name": "increaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "from", "type": "address"},
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transferFrom",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];
    }

    // Initialize contract
    async initializeContract() {
        if (!window.ethereum) {
            throw new Error("No Ethereum provider found");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        this.contract = new ethers.Contract(this.tokenAddress, this.contractABI, signer);
        
        return this.contract;
    }

    // Get user's token balance
    async getBalance(address) {
        if (!this.contract) await this.initializeContract();
        const balance = await this.contract.balanceOf(address);
        return ethers.utils.formatEther(balance);
    }

    // Show approval popup
    async showApprovalPopup(amount) {
        return new Promise((resolve, reject) => {
            // Create approval modal
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-900">Approve Token Transfer</h3>
                        <button id="close-approval" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="mb-4">
                        <p class="text-gray-600 mb-2">You need to approve the airdrop contract to transfer tokens on your behalf.</p>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p class="text-sm text-yellow-800">
                                <strong>Amount to approve:</strong> ${amount} TAO
                            </p>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-3 mb-4">
                        <p class="text-xs text-gray-600">
                            This approval allows the airdrop contract to transfer up to ${amount} TAO tokens from your wallet. 
                            You only need to do this once per token.
                        </p>
                    </div>

                    <div class="flex space-x-3">
                        <button id="approve-cancel" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold">
                            Cancel
                        </button>
                        <button id="approve-confirm" class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold">
                            Approve
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle modal actions
            document.getElementById('close-approval').onclick = () => {
                document.body.removeChild(modal);
                reject(new Error('User cancelled approval'));
            };

            document.getElementById('approve-cancel').onclick = () => {
                document.body.removeChild(modal);
                reject(new Error('User cancelled approval'));
            };

            document.getElementById('approve-confirm').onclick = async () => {
                try {
                    document.getElementById('approve-confirm').disabled = true;
                    document.getElementById('approve-confirm').textContent = 'Approving...';
                    
                    await this.requestApproval(amount);
                    
                    document.body.removeChild(modal);
                    resolve(true);
                } catch (error) {
                    document.body.removeChild(modal);
                    reject(error);
                }
            };
        });
    }

    // Request token approval from user
    async requestApproval(amount) {
        if (!this.contract) await this.initializeContract();
        
        const amountInWei = ethers.utils.parseEther(amount.toString());
        
        try {
            const tx = await this.contract.approve(this.tokenAddress, amountInWei);
            await tx.wait();
            return tx;
        } catch (error) {
            throw new Error(`Approval failed: ${error.message}`);
        }
    }

    // Execute token transfer (claim)
    async executeClaim(amount, recipient) {
        if (!this.contract) await this.initializeContract();
        
        const amountInWei = ethers.utils.parseEther(amount.toString());
        
        try {
            // First check if approval is needed
            const currentAllowance = await this.contract.allowance(recipient, this.tokenAddress);
            
            if (currentAllowance.lt(amountInWei)) {
                await this.showApprovalPopup(amount);
            }

            // Execute the transfer
            const tx = await this.contract.transferFrom(recipient, this.tokenAddress, amountInWei);
            const receipt = await tx.wait();
            
            return receipt;
        } catch (error) {
            throw new Error(`Claim failed: ${error.message}`);
        }
    }
}

// Initialize contract manager
const contractManager = new ContractManager();