// Bittensor TAO Airdrop - MetaMask Wallet Manager
class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.chainId = null;
    }

    // Check for MetaMask
    hasMetaMask() {
        return typeof window.ethereum !== 'undefined';
    }

    // Connect to MetaMask
    async connectWallet() {
        try {
            if (!this.hasMetaMask()) {
                alert('Please install MetaMask to claim your $TAO tokens!');
                window.open('https://metamask.io/download.html', '_blank');
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            this.address = accounts[0];
            this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            // Create ethers provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();

            this.updateUI();
            this.setupEventListeners();
            this.checkEligibility();

        } catch (error) {
            console.error('Wallet connection failed:', error);
            if (error.code === 4001) {
                alert('Please connect your MetaMask wallet to claim $TAO tokens.');
            } else {
                alert('Failed to connect wallet: ' + error.message);
            }
        }
    }

    updateUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const network = document.getElementById('network');
        const connectionStatus = document.getElementById('connection-status');

        if (this.address) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            connectionStatus.classList.add('hidden');
            
            // Shorten address for display
            const shortAddress = this.address.substring(0, 6) + '...' + this.address.substring(38);
            walletAddress.textContent = shortAddress;
            
            // Display network
            const networkName = this.getNetworkName(this.chainId);
            network.textContent = networkName;
        }
    }

    getNetworkName(chainId) {
        const networks = {
            '0x1': 'Ethereum',
            '0xaa36a7': 'Sepolia',
            '0x89': 'Polygon',
            '0xa4b1': 'Arbitrum'
        };
        return networks[chainId] || `Chain ${chainId}`;
    }

    setupEventListeners() {
        // Handle chain changes
        window.ethereum.on('chainChanged', (chainId) => {
            this.chainId = chainId;
            this.updateUI();
            this.checkEligibility();
        });

        // Handle account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                this.disconnect();
            } else {
                this.address = accounts[0];
                this.updateUI();
                this.checkEligibility();
            }
        });
    }

    async checkEligibility() {
        // Mock eligibility check - in real app, this would verify against Merkle root
        const connectionStatus = document.getElementById('connection-status');
        const eligibleSection = document.getElementById('eligible-section');
        const notEligibleSection = document.getElementById('not-eligible-section');

        connectionStatus.classList.add('hidden');
        
        // For demo: 70% chance of being eligible
        // In real app, this would check against the actual eligibility list
        const isEligible = Math.random() > 0.3;
        
        if (isEligible) {
            eligibleSection.classList.remove('hidden');
            notEligibleSection.classList.add('hidden');
        } else {
            eligibleSection.classList.add('hidden');
            notEligibleSection.classList.remove('hidden');
        }
    }

    disconnect() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const eligibleSection = document.getElementById('eligible-section');
        const notEligibleSection = document.getElementById('not-eligible-section');
        const connectionStatus = document.getElementById('connection-status');

        connectBtn.classList.remove('hidden');
        walletInfo.classList.add('hidden');
        eligibleSection.classList.add('hidden');
        notEligibleSection.classList.add('hidden');
        connectionStatus.classList.remove('hidden');
    }
}

// Initialize wallet manager
const walletManager = new WalletManager();

// Event listeners when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    const connectBtn = document.getElementById('connect-wallet');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => walletManager.connectWallet());
    }

    // Auto-connect if previously connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        walletManager.connectWallet();
    }
});