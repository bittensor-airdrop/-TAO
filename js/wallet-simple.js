// Simple Wallet Manager - No Ethers.js Dependency
class SimpleWalletManager {
    constructor() {
        this.provider = null;
        this.address = null;
        this.chainId = null;
        this.walletType = null;
    }

    // Connect to MetaMask
    async connectMetaMask() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showError('Please install MetaMask!');
                window.open('https://metamask.io/download.html', '_blank');
                return;
            }

            this.walletType = 'MetaMask';
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            this.address = accounts[0];
            this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.provider = window.ethereum;

            this.updateUI();
            this.setupEventListeners();
            this.checkEligibility();
            closeWalletModal(); // FIXED

        } catch (error) {
            this.handleConnectionError(error, 'MetaMask');
        }
    }

    // Connect via WalletConnect
    async connectWalletConnect() {
        try {
            this.walletType = 'WalletConnect';
            alert('WalletConnect: In a production app, this would open QR scanner. For now, please use MetaMask.');
            closeWalletModal(); // FIXED
            return;

        } catch (error) {
            this.handleConnectionError(error, 'WalletConnect');
        }
    }

    // Connect to Coinbase Wallet
    async connectCoinbase() {
        try {
            if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
                this.walletType = 'Coinbase Wallet';
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                this.address = accounts[0];
                this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.provider = window.ethereum;
            } else if (typeof window.coinbaseWalletExtension !== 'undefined') {
                this.walletType = 'Coinbase Wallet';
                const accounts = await window.coinbaseWalletExtension.request({
                    method: 'eth_requestAccounts'
                });
                this.address = accounts[0];
                this.chainId = await window.coinbaseWalletExtension.request({ method: 'eth_chainId' });
                this.provider = window.coinbaseWalletExtension;
            } else {
                this.showError('Coinbase Wallet not detected. Please install it first.');
                window.open('https://www.coinbase.com/wallet', '_blank');
                return;
            }

            this.updateUI();
            this.setupEventListeners();
            this.checkEligibility();
            closeWalletModal(); // FIXED

        } catch (error) {
            this.handleConnectionError(error, 'Coinbase Wallet');
        }
    }

    // Connect to Trust Wallet
    async connectTrustWallet() {
        try {
            if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
                this.walletType = 'Trust Wallet';
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                this.address = accounts[0];
                this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.provider = window.ethereum;
            } else {
                this.showError('Trust Wallet not detected. Please install it first.');
                window.open('https://trustwallet.com', '_blank');
                return;
            }

            this.updateUI();
            this.setupEventListeners();
            this.checkEligibility();
            closeWalletModal(); // FIXED

        } catch (error) {
            this.handleConnectionError(error, 'Trust Wallet');
        }
    }

    // Update UI with wallet info
    updateUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        const network = document.getElementById('network');
        const walletType = document.getElementById('wallet-type');
        const connectionStatus = document.getElementById('connection-status');

        if (this.address) {
            connectBtn.classList.add('hidden');
            walletInfo.classList.remove('hidden');
            connectionStatus.classList.add('hidden');
            
            // Shorten address for display
            const shortAddress = this.address.substring(0, 6) + '...' + this.address.substring(38);
            walletAddress.textContent = shortAddress;
            
            // Display network and wallet type
            const networkName = this.getNetworkName(this.chainId);
            network.textContent = networkName;
            walletType.textContent = this.walletType;
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
        this.provider.on('chainChanged', (chainId) => {
            this.chainId = chainId;
            this.updateUI();
            this.checkEligibility();
        });

        // Handle account changes
        this.provider.on('accountsChanged', (accounts) => {
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
        const connectionStatus = document.getElementById('connection-status');
        const eligibleSection = document.getElementById('eligible-section');
        const notEligibleSection = document.getElementById('not-eligible-section');

        connectionStatus.classList.add('hidden');
        
        // Mock eligibility check - always eligible for demo
        const isEligible = true;
        
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
        this.address = null;
        this.walletType = null;
        
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

    handleConnectionError(error, walletName) {
        console.error(`${walletName} connection failed:`, error);
        
        if (error.code === 4001) {
            this.showError(`You rejected the ${walletName} connection request.`);
        } else {
            this.showError(`Failed to connect ${walletName}: ${error.message}`);
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize wallet manager
const walletManager = new SimpleWalletManager();

// Modal functions
function openWalletModal() {
    document.getElementById('wallet-modal').classList.remove('hidden');
}

function closeWalletModal() {
    document.getElementById('wallet-modal').classList.add('hidden');
}

// Global connection functions
function connectMetaMask() {
    walletManager.connectMetaMask();
}

function connectWalletConnect() {
    walletManager.connectWalletConnect();
}

function connectCoinbase() {
    walletManager.connectCoinbase();
}

function connectTrustWallet() {
    walletManager.connectTrustWallet();
}

// Global disconnect function
function disconnectWallet() {
    walletManager.disconnect();
}

// Event listeners when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    const connectBtn = document.getElementById('connect-wallet');
    const disconnectBtn = document.getElementById('disconnect-wallet');
    
    if (connectBtn) {
        connectBtn.addEventListener('click', openWalletModal);
    }
    
    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', disconnectWallet);
    }

    // Auto-connect if MetaMask was previously connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        walletManager.connectMetaMask();
    }

    // Close modal when clicking outside
    document.getElementById('wallet-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeWalletModal();
        }
    });
});