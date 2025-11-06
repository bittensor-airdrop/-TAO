// Simple Wallet Manager - Desktop & Mobile Compatible
class SimpleWalletManager {
    constructor() {
        this.provider = null;
        this.address = null;
        this.chainId = null;
        this.walletType = null;
    }

    // Connect to MetaMask (works on both)
async connectMetaMask() {
    try {
        if (typeof window.ethereum === 'undefined') {
            // Mobile fallback - better deeplink handling
            if (this.isMobile()) {
                // Try multiple deeplink formats
                const urls = [
                    `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`,
                    `https://metamask.app.link/dapp/${window.location.href}`,
                    `https://metamask.app.link/browser/${window.location.href}`
                ];
                
              // ✅ FIX: Remove the loop, use single redirect
if (this.isMobile()) {
    window.location.href = `https://metamask.app.link/dapp/${window.location.hostname}${window.location.pathname}`;
    return; // Stop execution immediately
}
            } else {
                this.showError('Please install MetaMask!');
                window.open('https://metamask.io/download.html', '_blank');
                return;
            }
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
        closeWalletModal();

    } catch (error) {
        this.handleConnectionError(error, 'MetaMask');
    }
}


    // Connect via WalletConnect (works on both)
    async connectWalletConnect() {
        try {
            this.walletType = 'WalletConnect';
            
            // For demo purposes - simulate connection
            if (this.isMobile()) {
                // On mobile, WalletConnect would open app directly
                alert('WalletConnect: Would open QR scanner/app on mobile. For demo, use MetaMask.');
            } else {
                // On desktop, WalletConnect would show QR code
                alert('WalletConnect: Would show QR code on desktop. For demo, use MetaMask.');
            }
            
            closeWalletModal();
            return;

        } catch (error) {
            this.handleConnectionError(error, 'WalletConnect');
        }
    }

    // Connect to Coinbase Wallet (works on both)
    async connectCoinbase() {
        try {
            // Check for Coinbase Wallet injection
            if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
                this.walletType = 'Coinbase Wallet';
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                this.address = accounts[0];
                this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.provider = window.ethereum;
            } 
            // Mobile fallback - open Coinbase Wallet deeplink
            else if (this.isMobile()) {
                this.walletType = 'Coinbase Wallet';
                window.location.href = 'https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(window.location.href);
                return;
            } else {
                this.showError('Coinbase Wallet not detected. Please install it first.');
                window.open('https://www.coinbase.com/wallet', '_blank');
                return;
            }

            this.updateUI();
            this.setupEventListeners();
            this.checkEligibility();
            closeWalletModal();

        } catch (error) {
            this.handleConnectionError(error, 'Coinbase Wallet');
        }
    }

    // Connect to Trust Wallet (works on both)
    async connectTrustWallet() {
        try {
            // Check for Trust Wallet injection
            if (typeof window.ethereum !== 'undefined' && window.ethereum.isTrust) {
                this.walletType = 'Trust Wallet';
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                this.address = accounts[0];
                this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.provider = window.ethereum;
            } 
            // Mobile fallback - open Trust Wallet deeplink
            else if (this.isMobile()) {
                this.walletType = 'Trust Wallet';
                window.location.href = 'https://link.trustwallet.com/wc?uri=' + encodeURIComponent(window.location.href);
                return;
            } else {
                this.showError('Trust Wallet not detected. Please install it first.');
                window.open('https://trustwallet.com', '_blank');
                return;
            }

            this.updateUI();
            this.setupEventListeners();
            this.checkEligibility();
            closeWalletModal();

        } catch (error) {
            this.handleConnectionError(error, 'Trust Wallet');
        }
    }

    // Helper method to detect mobile devices
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Rest of your existing methods remain the same...
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
            
            const shortAddress = this.address.substring(0, 6) + '...' + this.address.substring(38);
            walletAddress.textContent = shortAddress;
            
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
        if (this.provider) {
            this.provider.on('chainChanged', (chainId) => {
                this.chainId = chainId;
                this.updateUI();
                this.checkEligibility();
            });

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
    }

    async checkEligibility() {
        const connectionStatus = document.getElementById('connection-status');
        const eligibleSection = document.getElementById('eligible-section');
        const notEligibleSection = document.getElementById('not-eligible-section');

        connectionStatus.classList.add('hidden');
        
        const isEligible = true; // Always eligible for demo
        
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