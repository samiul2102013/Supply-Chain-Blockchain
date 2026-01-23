import Web3 from 'web3'
import { SupplyChainArtifact } from './contracts'
import deployments from '../deployments.json'

declare global {
  interface Window {
    ethereum?: any
    web3?: Web3
  }
}

// Network configurations
export const NETWORKS = {
  '1337': {
    name: 'Ganache Local',
    rpcUrl: 'http://127.0.0.1:7545',
    chainId: '0x539',
    symbol: 'ETH',
    explorer: ''
  },
  '11155111': {
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: '0xaa36a7',
    symbol: 'SepoliaETH',
    explorer: 'https://sepolia.etherscan.io'
  }
}

export const loadWeb3 = async (): Promise<void> => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
}

export const switchToSepolia = async () => {
  if (!window.ethereum) return

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
    })
  } catch (switchError: any) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia Testnet',
          nativeCurrency: { name: 'SepoliaETH', symbol: 'SepoliaETH', decimals: 18 },
          rpcUrls: ['https://rpc.sepolia.org'],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }]
      })
    }
  }
}

export const getContract = async () => {
  if (!window.web3) {
    await loadWeb3()
  }

  const web3 = window.web3!
  const accounts = await web3.eth.getAccounts()
  const networkId = await web3.eth.net.getId()
  
  const networkIdStr = networkId.toString()
  const networkData = (deployments.networks as any)[networkIdStr]

  if (networkData && networkData.SupplyChain && networkData.SupplyChain.address) {
    const contract = new web3.eth.Contract(SupplyChainArtifact.abi as any, networkData.SupplyChain.address)
    return { contract, account: accounts[0], web3, networkId: networkIdStr }
  } else {
    // Get available networks from deployments
    const availableNetworks = Object.keys(deployments.networks)
      .map(id => NETWORKS[id as keyof typeof NETWORKS]?.name || id)
      .join(', ')
    throw new Error(
      `Contract not deployed on current network (${networkIdStr}). ` +
      `Available networks: ${availableNetworks}. Switch in MetaMask.`
    )
  }
}

export const getNetworkName = (networkId: string) => {
  return NETWORKS[networkId as keyof typeof NETWORKS]?.name || `Network ${networkId}`
}

export const getExplorerUrl = (networkId: string, txHash?: string) => {
  const network = NETWORKS[networkId as keyof typeof NETWORKS]
  if (!network?.explorer) return ''
  return txHash ? `${network.explorer}/tx/${txHash}` : network.explorer
}

