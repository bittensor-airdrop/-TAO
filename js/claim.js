// Bittensor $TAO Claim Functionality
class ClaimManager {
    constructor() {
        this.claimInProgress = false;
    }

    async claimTokens() {
        if (this.claimInProgress) return;
        
        if (!walletManager.address) {
            alert('Please connect your wallet first!');
            openWalletModal();
            return;
        }

        this.claimInProgress = true;
        this.showTransactionStatus('Processing your $TAO claim transaction...', 'processing');

        try {
            // Simulate transaction processing
            await new Promise(resolve => setTimeout(resolve, 3500));
            
            // Mock successful claim
            this.showTransactionStatus('🎉 Success! 8.5 $TAO claimed immediately (~$4,122). 34 $TAO vested over 12 months.', 'success');
            
            this.disableClaimButtons();

        } catch (error) {
            this.showTransactionStatus('❌ Claim failed: ' + error.message, 'error');
        } finally {
            this.claimInProgress = false;
        }
    }

    async claimGasless() {
        if (this.claimInProgress) return;
        
        if (!walletManager.address) {
            alert('Please connect your wallet first!');
            openWalletModal();
            return;
        }

        this.claimInProgress = true;
        this.showTransactionStatus('Processing gasless $TAO claim via relayer...', 'processing');

        try {
            // Simulate gasless claim processing
            await new Promise(resolve => setTimeout(resolve, 4500));
            
            // Mock successful gasless claim
            this.showTransactionStatus('🎉 Gasless claim successful! 8.5 $TAO claimed. No gas fees charged.', 'success');
            
            this.disableClaimButtons();

        } catch (error) {
            this.showTransactionStatus('❌ Gasless claim failed: ' + error.message, 'error');
        } finally {
            this.claimInProgress = false;
        }
    }

    disableClaimButtons() {
        const claimBtn = document.getElementById('claim-btn');
        const gaslessBtn = document.getElementById('gasless-claim');
        
        claimBtn.disabled = true;
        gaslessBtn.disabled = true;
        claimBtn.textContent = '✅ Claimed';
        gaslessBtn.textContent = '✅ Claimed';
        claimBtn.classList.remove('bg-yellow-400', 'hover:bg-yellow-300');
        gaslessBtn.classList.remove('hover:bg-opacity-30');
        claimBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
        gaslessBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
    }

    showTransactionStatus(message, type) {
        const statusDiv = document.getElementById('transaction-status');
        const colors = {
            processing: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800'
        };

        statusDiv.className = `p-4 rounded-lg border ${colors[type]} shadow-lg`;
        statusDiv.innerHTML = `
            <div class="flex items-start">
                <i class="fas fa-${type === 'processing' ? 'sync-alt animate-spin' : type === 'success' ? 'check-circle' : 'exclamation-triangle'} mr-3 mt-1"></i>
                <div>
                    <p class="font-medium">${message}</p>
                    ${type === 'processing' ? '<p class="text-sm opacity-75 mt-1">Confirm transaction in your wallet...</p>' : ''}
                </div>
            </div>
        `;
        statusDiv.classList.remove('hidden');

        // Auto-hide success messages after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 10000);
        }
    }
}

// Initialize claim manager
const claimManager = new ClaimManager();

// Event listeners for claim buttons
document.addEventListener('DOMContentLoaded', function() {
    const claimBtn = document.getElementById('claim-btn');
    const gaslessBtn = document.getElementById('gasless-claim');

    if (claimBtn) {
        claimBtn.addEventListener('click', () => claimManager.claimTokens());
    }

    if (gaslessBtn) {
        gaslessBtn.addEventListener('click', () => claimManager.claimGasless());
    }
});