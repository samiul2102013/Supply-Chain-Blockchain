'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { checkIsOwner } from '@/lib/contractUtils'

interface Material {
  id: string
  name: string
  category: string
  quantity: string
  unit: string
  pricePerUnit: string
  supplierId: string
  addedTimestamp: string
  isActive: boolean
}

interface MaterialTransaction {
  id: string
  materialId: string
  vendorId: string
  productId: string
  quantity: string
  timestamp: string
  transactionType: string
}

interface Vendor {
  addr: string
  id: string
  name: string
  place: string
}

export default function MaterialsPage() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [transactions, setTransactions] = useState<MaterialTransaction[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'transactions'>('inventory')

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    supplierId: '',
  })

  const categories = ['Chemical', 'Metal', 'Plastic', 'Fabric', 'Electronic', 'Organic', 'Other']
  const units = ['kg', 'g', 'liters', 'ml', 'units', 'meters', 'pieces']

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    try {
      setLoading(true)
      const { contract, account } = await getContract()
      setSupplyChain(contract)
      setCurrentAccount(account)

      // Load vendors
      const rmsCount = await contract.methods.rmsCtr().call()
      const vendorList: Vendor[] = []
      for (let i = 1; i <= parseInt(rmsCount); i++) {
        const vendor = await contract.methods.RMS(i).call()
        vendorList.push(vendor)
      }
      setVendors(vendorList)

      // Load materials
      const materialCount = await contract.methods.materialCtr().call()
      const materialList: Material[] = []
      for (let i = 1; i <= parseInt(materialCount); i++) {
        const material = await contract.methods.Materials(i).call()
        materialList.push(material)
      }
      setMaterials(materialList)

      // Load transactions
      const txCount = await contract.methods.transactionCtr().call()
      const txList: MaterialTransaction[] = []
      for (let i = 1; i <= parseInt(txCount); i++) {
        const tx = await contract.methods.MaterialTransactions(i).call()
        txList.push(tx)
      }
      setTransactions(txList.reverse()) // Show newest first

      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)

      setLoading(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      alert(err?.message || 'Error loading data')
      setLoading(false)
    }
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const priceInWei = newMaterial.pricePerUnit ? 
        BigInt(parseFloat(newMaterial.pricePerUnit) * 1e18).toString() : '0'
      
      const receipt = await supplyChain.methods.addMaterial(
        newMaterial.name,
        newMaterial.category,
        newMaterial.quantity,
        newMaterial.unit,
        priceInWei,
        newMaterial.supplierId
      ).send({ from: currentAccount })

      if (receipt) {
        alert('Material added successfully!')
        setNewMaterial({ name: '', category: '', quantity: '', unit: 'kg', pricePerUnit: '', supplierId: '' })
        loadBlockchainData()
        setActiveTab('inventory')
      }
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error adding material')
    }
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return 'N/A'
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const formatPrice = (priceWei: string) => {
    if (!priceWei || priceWei === '0') return 'N/A'
    return (parseFloat(priceWei) / 1e18).toFixed(4) + ' ETH'
  }

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    return vendor?.name || `Vendor #${vendorId}`
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Chemical': 'bg-red-100 text-red-700 border-red-200',
      'Metal': 'bg-gray-100 text-gray-700 border-gray-200',
      'Plastic': 'bg-blue-100 text-blue-700 border-blue-200',
      'Fabric': 'bg-purple-100 text-purple-700 border-purple-200',
      'Electronic': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Organic': 'bg-green-100 text-green-700 border-green-200',
      'Other': 'bg-orange-100 text-orange-700 border-orange-200',
    }
    return colors[category] || colors['Other']
  }

  const getTxTypeStyle = (type: string) => {
    switch (type) {
      case 'RECEIVED':
        return 'bg-green-100 text-green-700'
      case 'USED':
        return 'bg-blue-100 text-blue-700'
      case 'RETURNED':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Loading Materials...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Materials Tracking</h1>
                <p className="text-gray-600 text-sm">Track raw materials with full traceability</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </button>
          </div>
          <div className="text-xs text-gray-500 font-mono">Account: {currentAccount}</div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Materials</p>
                <p className="text-3xl font-bold text-gray-800">{materials.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">📦</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Vendors</p>
                <p className="text-3xl font-bold text-gray-800">{vendors.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">🏭</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transactions</p>
                <p className="text-3xl font-bold text-gray-800">{transactions.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">📊</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-3xl font-bold text-gray-800">
                  {new Set(materials.map(m => m.category)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">🏷️</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📦 Material Inventory
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'add'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ➕ Add Material
              </button>
            )}
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📜 Transaction History
            </button>
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {materials.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Materials in Inventory</h3>
                <p className="text-gray-500">Add your first material to start tracking</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">ID</th>
                      <th className="px-6 py-4 text-left">Material</th>
                      <th className="px-6 py-4 text-left">Category</th>
                      <th className="px-6 py-4 text-left">Quantity</th>
                      <th className="px-6 py-4 text-left">Price/Unit</th>
                      <th className="px-6 py-4 text-left">Supplier</th>
                      <th className="px-6 py-4 text-left">Added</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material, index) => (
                      <tr key={material.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 font-bold text-gray-800">#{material.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{material.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(material.category)}`}>
                            {material.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-lg text-gray-800">{material.quantity}</span>
                          <span className="text-gray-500 ml-1">{material.unit}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{formatPrice(material.pricePerUnit)}</td>
                        <td className="px-6 py-4">
                          <span className="text-blue-600 font-medium">{getVendorName(material.supplierId)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatTimestamp(material.addedTimestamp)}</td>
                        <td className="px-6 py-4">
                          {material.isActive ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Active</span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Add Material Tab */}
        {activeTab === 'add' && isOwner && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3">➕</span> Add New Material
            </h2>
            
            {vendors.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-gray-600 mb-4">You need to register at least one vendor first</p>
                <button
                  onClick={() => router.push('/vendors')}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Go to Vendor Management
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddMaterial} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Material Name *</label>
                    <input
                      type="text"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., Steel Plates"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      value={newMaterial.category}
                      onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      value={newMaterial.quantity}
                      onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit *</label>
                    <select
                      value={newMaterial.unit}
                      onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      required
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price per Unit (ETH)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={newMaterial.pricePerUnit}
                      onChange={(e) => setNewMaterial({ ...newMaterial, pricePerUnit: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      placeholder="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier *</label>
                    <select
                      value={newMaterial.supplierId}
                      onChange={(e) => setNewMaterial({ ...newMaterial, supplierId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name} (#{vendor.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                >
                  Add Material to Inventory
                </button>
              </form>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Transaction History</h2>
              <p className="text-gray-500 text-sm">Complete audit trail of all material movements</p>
            </div>
            {transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📜</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Transactions Yet</h3>
                <p className="text-gray-500">Transactions will appear here when materials are added or used</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((tx) => {
                  const material = materials.find(m => m.id === tx.materialId)
                  return (
                    <div key={tx.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                            tx.transactionType === 'RECEIVED' ? 'bg-green-100' :
                            tx.transactionType === 'USED' ? 'bg-blue-100' : 'bg-orange-100'
                          }`}>
                            {tx.transactionType === 'RECEIVED' ? '📥' :
                             tx.transactionType === 'USED' ? '📤' : '↩️'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTxTypeStyle(tx.transactionType)}`}>
                                {tx.transactionType}
                              </span>
                              <span className="font-semibold text-gray-800">
                                {material?.name || `Material #${tx.materialId}`}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: <span className="font-medium">{tx.quantity}</span> | 
                              Vendor: <span className="font-medium text-blue-600">{getVendorName(tx.vendorId)}</span>
                              {tx.productId !== '0' && (
                                <> | Product: <span className="font-medium text-purple-600">#{tx.productId}</span></>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-gray-500">TX #{tx.id}</p>
                          <p className="text-xs text-gray-400">{formatTimestamp(tx.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
