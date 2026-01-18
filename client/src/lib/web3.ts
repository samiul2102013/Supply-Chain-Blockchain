import Web3 from 'web3'
import { SupplyChainArtifact } from './contracts'
import deployments from '../deployments.json'

declare global {
  interface Window {
    ethereum?: any
    web3?: Web3
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
    return { contract, account: accounts[0], web3 }
  } else {
    // Get available networks from deployments
    const availableNetworks = Object.keys(deployments.networks).join(', ')
    throw new Error(
      `Contract not deployed on current network (${networkIdStr}). ` +
      `Please switch MetaMask to network: ${availableNetworks}`
    )
  }
}

