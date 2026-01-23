'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { checkIsOwner } from '@/lib/contractUtils'

interface Material {
  id: string
  name: string
  category: string
  totalQuantity: string
  availableQuantity: string
  unit: string
  pricePerUnit: string
  vendorId: string
  receivedAt: string
  isActive: boolean
}

interface Vendor {
  id: string
  addr: string
  name: string
  location: string
  isActive: boolean
}

interface SupplyHistory {
  id: string
  materialId: string
  vendorId: string
  quantity: string
  pricePerUnit: string
  totalAmount: string
  suppliedAt: string
}

export default function MaterialsPage() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isVendor, setIsVendor] = useState(false)
  const [vendorId, setVendorId] = useState<string>('0')
  const [vendorInfo, setVendorInfo] = useState<Vendor | null>(null)
  
  const [materials, setMaterials] = useState<Material[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [supplyHistory, setSupplyHistory] = useState<SupplyHistory[]>([])
  const [activeTab, setActiveTab] = useState<'inventory' | 'add' | 'restock' | 'history'>('inventory')

  // Vendor's own material form (no vendor selection needed)
  const [vendorMaterialForm, setVendorMaterialForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    pricePerUnit: ''
  })

  // Admin's material form (with vendor selection)
  const [adminMaterialForm, setAdminMaterialForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    pricePerUnit: '',
    vendorId: ''
  })

  // Vendor restock form
  const [vendorRestockForm, setVendorRestockForm] = useState({
    materialId: '',
    quantity: '',
    pricePerUnit: ''
  })

  // Admin restock form
  const [adminRestockForm, setAdminRestockForm] = useState({
    materialId: '',
    quantity: '',
    vendorId: '',
    pricePerUnit: ''
  })

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
      const vendorCount = await contract.methods.vendorCtr().call()
      const vendorPromises = []
      for (let i = 1; i <= parseInt(vendorCount); i++) {
        vendorPromises.push(contract.methods.vendors(i).call())
      }
      const vendorData = await Promise.all(vendorPromises)
      setVendors(vendorData)

      // Check if current user is a vendor
      const vId = await contract.methods.findVendor(account).call()
      if (parseInt(vId) > 0) {
        setIsVendor(true)
        setVendorId(vId)
        const vInfo = vendorData.find(v => v.id === vId)
        if (vInfo) setVendorInfo(vInfo)
      }

      // Load materials
      const materialCount = await contract.methods.materialCtr().call()
      const materialPromises = []
      for (let i = 1; i <= parseInt(materialCount); i++) {
        materialPromises.push(contract.methods.materials(i).call())
      }
      const materialData = await Promise.all(materialPromises)
      setMaterials(materialData)

      // Load supply history
      const historyCount = await contract.methods.supplyHistoryCtr().call()
      const historyPromises = []
      for (let i = 1; i <= parseInt(historyCount); i++) {
        historyPromises.push(contract.methods.supplyHistory(i).call())
      }
      const historyData = await Promise.all(historyPromises)
      setSupplyHistory(historyData)

      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error loading data')
      setLoading(false)
    }
  }

  // Vendor adds their own material
  const vendorAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isVendor) return

    try {
      await supplyChain.methods.vendorAddMaterial(
        vendorMaterialForm.name,
        vendorMaterialForm.category,
        parseInt(vendorMaterialForm.quantity),
        vendorMaterialForm.unit,
        parseInt(vendorMaterialForm.pricePerUnit)
      ).send({ from: currentAccount })
      
      setVendorMaterialForm({ name: '', category: '', quantity: '', unit: '', pricePerUnit: '' })
      loadBlockchainData()
      alert('Material added successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error adding material')
    }
  }

  // Vendor restocks their own material
  const vendorRestock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isVendor) return

    try {
      await supplyChain.methods.vendorRestockMaterial(
        parseInt(vendorRestockForm.materialId),
        parseInt(vendorRestockForm.quantity),
        parseInt(vendorRestockForm.pricePerUnit)
      ).send({ from: currentAccount })
      
      setVendorRestockForm({ materialId: '', quantity: '', pricePerUnit: '' })
      loadBlockchainData()
      alert('Material restocked successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error restocking material')
    }
  }

  // Admin adds material for any vendor
  const adminAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      await supplyChain.methods.addMaterial(
        adminMaterialForm.name,
        adminMaterialForm.category,
        parseInt(adminMaterialForm.quantity),
        adminMaterialForm.unit,
        parseInt(adminMaterialForm.pricePerUnit),
        parseInt(adminMaterialForm.vendorId)
      ).send({ from: currentAccount })
      
      setAdminMaterialForm({ name: '', category: '', quantity: '', unit: '', pricePerUnit: '', vendorId: '' })
      loadBlockchainData()
      alert('Material added successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error adding material')
    }
  }

  // Admin restocks material
  const adminRestock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      await supplyChain.methods.restockMaterial(
        parseInt(adminRestockForm.materialId),
        parseInt(adminRestockForm.quantity),
        parseInt(adminRestockForm.vendorId),
        parseInt(adminRestockForm.pricePerUnit)
      ).send({ from: currentAccount })
      
      setAdminRestockForm({ materialId: '', quantity: '', vendorId: '', pricePerUnit: '' })
      loadBlockchainData()
      alert('Material restocked successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error restocking material')
    }
  }

  const getVendorName = (vendorIdStr: string) => {
    const vendor = vendors.find(v => v.id === vendorIdStr)
    return vendor ? vendor.name : 'Unknown'
  }

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    return material ? material.name : 'Unknown'
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return 'N/A'
    return new Date(parseInt(timestamp) * 1000).toLocaleString()
  }

  // Get materials owned by current vendor
  const myMaterials = materials.filter(m => m.vendorId === vendorId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const canAddMaterial = isOwner || isVendor

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">📦 Material Inventory</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            ← Back to Home
          </button>
        </div>

        {/* User Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-gray-300">Connected: <span className="text-blue-400">{currentAccount}</span></p>
          {isOwner && <span className="text-green-500 font-bold">(Admin)</span>}
          {isVendor && vendorInfo && (
            <div className="mt-2">
              <span className="bg-cyan-600 px-3 py-1 rounded-full text-sm font-semibold">
                Vendor: {vendorInfo.name}
              </span>
              <span className="text-gray-400 ml-2">({vendorInfo.location})</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Total Materials</p>
            <p className="text-2xl font-bold">{materials.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">{isVendor ? 'My Materials' : 'Active Vendors'}</p>
            <p className="text-2xl font-bold">{isVendor ? myMaterials.length : vendors.filter(v => v.isActive).length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Supply Transactions</p>
            <p className="text-2xl font-bold">{supplyHistory.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-500">
              {materials.filter(m => parseInt(m.availableQuantity) < 10).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {(['inventory', 'add', 'restock', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab === 'add' ? 'Add Material' : tab === 'restock' ? 'Restock' : tab === 'history' ? 'Supply History' : 'Inventory'}
            </button>
          ))}
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {isVendor ? `My Materials (${myMaterials.length})` : `Material Inventory (${materials.length})`}
            </h2>
            {(isVendor ? myMaterials : materials).length === 0 ? (
              <p className="text-gray-400">
                {isVendor ? 'You have not added any materials yet.' : 'No materials in inventory yet.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Category</th>
                      <th className="px-4 py-2 text-left">Available</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Unit</th>
                      <th className="px-4 py-2 text-left">Price/Unit</th>
                      {!isVendor && <th className="px-4 py-2 text-left">Vendor</th>}
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isVendor ? myMaterials : materials).map((m) => (
                      <tr key={m.id} className="border-b border-gray-700">
                        <td className="px-4 py-2">{m.id}</td>
                        <td className="px-4 py-2 font-semibold">{m.name}</td>
                        <td className="px-4 py-2">{m.category}</td>
                        <td className="px-4 py-2">
                          <span className={parseInt(m.availableQuantity) < 10 ? 'text-yellow-500' : 'text-green-500'}>
                            {m.availableQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-2">{m.totalQuantity}</td>
                        <td className="px-4 py-2">{m.unit}</td>
                        <td className="px-4 py-2">${m.pricePerUnit}</td>
                        {!isVendor && <td className="px-4 py-2">{getVendorName(m.vendorId)}</td>}
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${m.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                            {m.isActive ? 'Active' : 'Inactive'}
                          </span>
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
        {activeTab === 'add' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {isVendor ? '🏭 Add Your Material' : isOwner ? '📦 Add Material (Admin)' : 'Add Material'}
            </h2>
            
            {!canAddMaterial ? (
              <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-300">
                  ⚠️ Only registered vendors or admin can add materials.
                </p>
              </div>
            ) : isVendor ? (
              // Vendor Form - No vendor selection needed
              <form onSubmit={vendorAddMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Material Name"
                  value={vendorMaterialForm.name}
                  onChange={(e) => setVendorMaterialForm({...vendorMaterialForm, name: e.target.value})}
                  className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={vendorMaterialForm.category}
                  onChange={(e) => setVendorMaterialForm({...vendorMaterialForm, category: e.target.value})}
                  className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={vendorMaterialForm.quantity}
                  onChange={(e) => setVendorMaterialForm({...vendorMaterialForm, quantity: e.target.value})}
                  className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                  min="1"
                  required
                />
                <input
                  type="text"
                  placeholder="Unit (e.g., kg, liters, pieces)"
                  value={vendorMaterialForm.unit}
                  onChange={(e) => setVendorMaterialForm({...vendorMaterialForm, unit: e.target.value})}
                  className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                  required
                />
                <input
                  type="number"
                  placeholder="Price per Unit"
                  value={vendorMaterialForm.pricePerUnit}
                  onChange={(e) => setVendorMaterialForm({...vendorMaterialForm, pricePerUnit: e.target.value})}
                  className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                  min="0"
                  required
                />
                <div className="flex items-center text-gray-400">
                  Will be added under: <span className="ml-2 text-cyan-400 font-semibold">{vendorInfo?.name}</span>
                </div>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 px-6 py-2 rounded-lg font-semibold md:col-span-2"
                >
                  Add My Material
                </button>
              </form>
            ) : isOwner ? (
              // Admin Form - With vendor selection
              <>
                {vendors.length === 0 ? (
                  <div className="text-yellow-400">
                    ⚠️ Please add vendors first before adding materials.
                    <button
                      onClick={() => router.push('/roles')}
                      className="ml-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
                    >
                      Go to Manage Participants
                    </button>
                  </div>
                ) : (
                  <form onSubmit={adminAddMaterial} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Material Name"
                      value={adminMaterialForm.name}
                      onChange={(e) => setAdminMaterialForm({...adminMaterialForm, name: e.target.value})}
                      className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={adminMaterialForm.category}
                      onChange={(e) => setAdminMaterialForm({...adminMaterialForm, category: e.target.value})}
                      className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={adminMaterialForm.quantity}
                      onChange={(e) => setAdminMaterialForm({...adminMaterialForm, quantity: e.target.value})}
                      className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                      min="1"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g., kg, liters, pieces)"
                      value={adminMaterialForm.unit}
                      onChange={(e) => setAdminMaterialForm({...adminMaterialForm, unit: e.target.value})}
                      className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price per Unit"
                      value={adminMaterialForm.pricePerUnit}
                      onChange={(e) => setAdminMaterialForm({...adminMaterialForm, pricePerUnit: e.target.value})}
                      className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                      min="0"
                      required
                    />
                    <select
                      value={adminMaterialForm.vendorId}
                      onChange={(e) => setAdminMaterialForm({...adminMaterialForm, vendorId: e.target.value})}
                      className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.filter(v => v.isActive).map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.location})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-semibold md:col-span-2"
                    >
                      Add Material to Inventory
                    </button>
                  </form>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Restock Tab */}
        {activeTab === 'restock' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {isVendor ? '📦 Restock My Materials' : 'Restock Material'}
            </h2>
            
            {!canAddMaterial ? (
              <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-300">
                  ⚠️ Only registered vendors or admin can restock materials.
                </p>
              </div>
            ) : isVendor ? (
              // Vendor Restock Form
              myMaterials.length === 0 ? (
                <p className="text-yellow-400">⚠️ You have no materials to restock. Add materials first.</p>
              ) : (
                <form onSubmit={vendorRestock} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={vendorRestockForm.materialId}
                    onChange={(e) => setVendorRestockForm({...vendorRestockForm, materialId: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select Your Material</option>
                    {myMaterials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Available: {m.availableQuantity} {m.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity to Add"
                    value={vendorRestockForm.quantity}
                    onChange={(e) => setVendorRestockForm({...vendorRestockForm, quantity: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    min="1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price per Unit"
                    value={vendorRestockForm.pricePerUnit}
                    onChange={(e) => setVendorRestockForm({...vendorRestockForm, pricePerUnit: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    min="0"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-500 px-6 py-2 rounded-lg font-semibold md:col-span-3"
                  >
                    Restock Material
                  </button>
                </form>
              )
            ) : isOwner ? (
              // Admin Restock Form
              materials.length === 0 ? (
                <p className="text-yellow-400">⚠️ No materials available to restock.</p>
              ) : (
                <form onSubmit={adminRestock} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={adminRestockForm.materialId}
                    onChange={(e) => setAdminRestockForm({...adminRestockForm, materialId: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select Material</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Available: {m.availableQuantity} {m.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantity to Add"
                    value={adminRestockForm.quantity}
                    onChange={(e) => setAdminRestockForm({...adminRestockForm, quantity: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    min="1"
                    required
                  />
                  <select
                    value={adminRestockForm.vendorId}
                    onChange={(e) => setAdminRestockForm({...adminRestockForm, vendorId: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.filter(v => v.isActive).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.location})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Price per Unit"
                    value={adminRestockForm.pricePerUnit}
                    onChange={(e) => setAdminRestockForm({...adminRestockForm, pricePerUnit: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    min="0"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-500 px-6 py-2 rounded-lg font-semibold md:col-span-2"
                  >
                    Restock Material
                  </button>
                </form>
              )
            ) : null}
          </div>
        )}

        {/* Supply History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {isVendor ? `My Supply History` : `Supply History (${supplyHistory.length})`}
            </h2>
            {(() => {
              const filteredHistory = isVendor 
                ? supplyHistory.filter(s => s.vendorId === vendorId)
                : supplyHistory
              
              return filteredHistory.length === 0 ? (
                <p className="text-gray-400">No supply transactions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Material</th>
                        {!isVendor && <th className="px-4 py-2 text-left">Vendor</th>}
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">Price/Unit</th>
                        <th className="px-4 py-2 text-left">Total Amount</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((s) => (
                        <tr key={s.id} className="border-b border-gray-700">
                          <td className="px-4 py-2">{s.id}</td>
                          <td className="px-4 py-2">{getMaterialName(s.materialId)}</td>
                          {!isVendor && <td className="px-4 py-2">{getVendorName(s.vendorId)}</td>}
                          <td className="px-4 py-2">{s.quantity}</td>
                          <td className="px-4 py-2">${s.pricePerUnit}</td>
                          <td className="px-4 py-2 font-semibold text-green-400">${s.totalAmount}</td>
                          <td className="px-4 py-2">{formatDate(s.suppliedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
