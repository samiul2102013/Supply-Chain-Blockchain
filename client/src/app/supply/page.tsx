'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'

interface Product {
  id: string
  name: string
  description: string
  targetQuantity: string
  manufacturerId: string
  distributorId: string
  retailerId: string
  stage: string
  createdAt: string
}

interface Material {
  id: string
  name: string
  category: string
  availableQuantity: string
  unit: string
  pricePerUnit: string
  vendorId: string
}

interface ProductMaterialUsage {
  materialId: string
  quantityUsed: string
  assignedAt: string
}

interface Manufacturer {
  id: string
  addr: string
  name: string
  location: string
}

interface Distributor {
  id: string
  addr: string
  name: string
  location: string
}

interface Retailer {
  id: string
  addr: string
  name: string
  location: string
}

interface Vendor {
  id: string
  name: string
}

type UserRole = 'none' | 'manufacturer' | 'distributor' | 'retailer' | 'owner'
type ActiveTab = 'manufacturer' | 'distributor' | 'retailer' | 'overview'

export default function SupplyChainPage() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])
  const [productMaterials, setProductMaterials] = useState<{[key: string]: ProductMaterialUsage[]}>({})
  
  const [userRole, setUserRole] = useState<UserRole>('none')
  const [userRoleId, setUserRoleId] = useState<string>('0')
  const [userRoleInfo, setUserRoleInfo] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  
  // Active tab for interface switching
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  // Material selection form for manufacturer
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [materialSelection, setMaterialSelection] = useState({ materialId: '', quantity: '' })
  
  // Product selection for distributor/retailer
  const [selectedDistProduct, setSelectedDistProduct] = useState<string>('')
  const [selectedRetailProduct, setSelectedRetailProduct] = useState<string>('')

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

      // Check if owner
      const owner = await contract.methods.Owner().call()
      const ownerCheck = owner.toLowerCase() === account.toLowerCase()
      setIsOwner(ownerCheck)

      // Load vendors
      const vendorCount = await contract.methods.vendorCtr().call()
      const vendorPromises = []
      for (let i = 1; i <= parseInt(vendorCount); i++) {
        vendorPromises.push(contract.methods.vendors(i).call())
      }
      setVendors(await Promise.all(vendorPromises))

      // Load materials
      const materialCount = await contract.methods.materialCtr().call()
      const materialPromises = []
      for (let i = 1; i <= parseInt(materialCount); i++) {
        materialPromises.push(contract.methods.materials(i).call())
      }
      const materialData = await Promise.all(materialPromises)
      setMaterials(materialData)

      // Load products
      const productCount = await contract.methods.productCtr().call()
      const productPromises = []
      for (let i = 1; i <= parseInt(productCount); i++) {
        productPromises.push(contract.methods.products(i).call())
      }
      const productData = await Promise.all(productPromises)
      setProducts(productData)

      // Load product materials
      const prodMaterials: {[key: string]: ProductMaterialUsage[]} = {}
      for (let i = 1; i <= parseInt(productCount); i++) {
        const count = await contract.methods.getProductMaterialsCount(i).call()
        if (parseInt(count) > 0) {
          prodMaterials[i.toString()] = await contract.methods.getProductMaterials(i).call()
        } else {
          prodMaterials[i.toString()] = []
        }
      }
      setProductMaterials(prodMaterials)

      // Load manufacturers
      const manCount = await contract.methods.manufacturerCtr().call()
      const manPromises = []
      for (let i = 1; i <= parseInt(manCount); i++) {
        manPromises.push(contract.methods.manufacturers(i).call())
      }
      const manData = await Promise.all(manPromises)
      setManufacturers(manData)

      // Load distributors
      const disCount = await contract.methods.distributorCtr().call()
      const disPromises = []
      for (let i = 1; i <= parseInt(disCount); i++) {
        disPromises.push(contract.methods.distributors(i).call())
      }
      setDistributors(await Promise.all(disPromises))

      // Load retailers
      const retCount = await contract.methods.retailerCtr().call()
      const retPromises = []
      for (let i = 1; i <= parseInt(retCount); i++) {
        retPromises.push(contract.methods.retailers(i).call())
      }
      setRetailers(await Promise.all(retPromises))

      // Determine user role
      const manId = await contract.methods.findManufacturer(account).call()
      const disId = await contract.methods.findDistributor(account).call()
      const retId = await contract.methods.findRetailer(account).call()

      if (ownerCheck) {
        setUserRole('owner')
        setActiveTab('manufacturer') // Default to manufacturer view for owner
      } else if (parseInt(manId) > 0) {
        setUserRole('manufacturer')
        setUserRoleId(manId)
        setUserRoleInfo(manData.find(m => m.id === manId))
        setActiveTab('manufacturer')
      } else if (parseInt(disId) > 0) {
        setUserRole('distributor')
        setUserRoleId(disId)
        setActiveTab('distributor')
      } else if (parseInt(retId) > 0) {
        setUserRole('retailer')
        setUserRoleId(retId)
        setActiveTab('retailer')
      }
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error loading data')
      setLoading(false)
    }
  }

  // Manufacturer selects material for a product
  const selectMaterial = async (productId: string) => {
    if (!supplyChain || !materialSelection.materialId || !materialSelection.quantity) return

    try {
      await supplyChain.methods.manufacturerSelectMaterial(
        parseInt(productId),
        parseInt(materialSelection.materialId),
        parseInt(materialSelection.quantity)
      ).send({ from: currentAccount })
      
      setMaterialSelection({ materialId: '', quantity: '' })
      setSelectedProduct('')
      loadBlockchainData()
      alert('✅ Material selected! Quantity deducted from inventory.')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error selecting material')
    }
  }

  // Manufacturer confirms and starts manufacturing
  const confirmManufacturing = async (productId: string) => {
    if (!supplyChain) return

    try {
      await supplyChain.methods.confirmAndStartManufacturing(parseInt(productId)).send({ from: currentAccount })
      loadBlockchainData()
      alert('✅ Manufacturing started!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error starting manufacturing')
    }
  }

  const startDistribution = async (productId: string) => {
    if (!supplyChain) return

    try {
      await supplyChain.methods.startDistribution(parseInt(productId)).send({ from: currentAccount })
      loadBlockchainData()
      alert('✅ Distribution started!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error starting distribution')
    }
  }

  const receiveAtRetail = async (productId: string) => {
    if (!supplyChain) return

    try {
      await supplyChain.methods.receiveAtRetail(parseInt(productId)).send({ from: currentAccount })
      loadBlockchainData()
      alert('✅ Product received at retail!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error receiving at retail')
    }
  }

  const markAsSold = async (productId: string) => {
    if (!supplyChain) return

    try {
      await supplyChain.methods.markAsSold(parseInt(productId)).send({ from: currentAccount })
      loadBlockchainData()
      alert('✅ Product marked as sold!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error marking as sold')
    }
  }

  const getStageText = (stage: string) => {
    const stages = ['Init', 'Materials Selected', 'Manufacturing', 'Distribution', 'Retail', 'Sold']
    return stages[parseInt(stage)] || 'Unknown'
  }

  const getStageColor = (stage: string) => {
    const colors = ['bg-gray-600', 'bg-blue-600', 'bg-yellow-600', 'bg-purple-600', 'bg-green-600', 'bg-emerald-600']
    return colors[parseInt(stage)] || 'bg-gray-600'
  }

  const getRoleBadge = () => {
    if (isOwner) return { text: '👑 Admin (All Roles)', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' }
    if (userRole === 'manufacturer') return { text: '🏭 Manufacturer', color: 'bg-yellow-600' }
    if (userRole === 'distributor') return { text: '🚛 Distributor', color: 'bg-purple-600' }
    if (userRole === 'retailer') return { text: '🏪 Retailer', color: 'bg-green-600' }
    return { text: 'No Role Assigned', color: 'bg-gray-600' }
  }

  const getMaterialName = (id: string) => materials.find(m => m.id === id)?.name || 'Unknown'
  const getMaterialUnit = (id: string) => materials.find(m => m.id === id)?.unit || ''
  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name || 'Unknown'
  const getManufacturerName = (id: string) => manufacturers.find(m => m.id === id)?.name || 'Not assigned'
  const getDistributorName = (id: string) => distributors.find(d => d.id === id)?.name || 'Not assigned'
  const getRetailerName = (id: string) => retailers.find(r => r.id === id)?.name || 'Not assigned'

  // Products available for each role
  const manufacturerProducts = products.filter(p => p.stage === '0' || p.stage === '1')
  const distributorProducts = products.filter(p => p.stage === '2') // Ready to distribute
  const distributorInProgress = products.filter(p => p.stage === '3') // Currently being distributed
  const retailerProducts = products.filter(p => p.stage === '3' || p.stage === '4')

  // Check if user can access a tab
  const canAccessTab = (tab: ActiveTab) => {
    if (isOwner) return true // Owner can access all
    if (tab === 'overview') return true
    if (tab === 'manufacturer' && userRole === 'manufacturer') return true
    if (tab === 'distributor' && userRole === 'distributor') return true
    if (tab === 'retailer' && userRole === 'retailer') return true
    return false
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const roleBadge = getRoleBadge()

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🚚 Supply Chain Operations</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            ← Back to Home
          </button>
        </div>

        {/* User Info */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-gray-300">Connected: <span className="text-blue-400 font-mono text-sm">{currentAccount}</span></p>
              {userRoleInfo && <p className="text-gray-400 text-sm">{userRoleInfo.name} - {userRoleInfo.location}</p>}
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${roleBadge.color}`}>
              {roleBadge.text}
            </span>
          </div>
        </div>

        {/* Role Tabs - Show all tabs for owner, specific tab for roles */}
        {(isOwner || userRole !== 'none') && (
          <div className="flex flex-wrap gap-2 mb-6">
            {canAccessTab('manufacturer') && (
              <button
                onClick={() => setActiveTab('manufacturer')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'manufacturer' 
                    ? 'bg-yellow-600 text-white shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🏭 Manufacturer View
                {manufacturerProducts.length > 0 && (
                  <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-xs">
                    {manufacturerProducts.length}
                  </span>
                )}
              </button>
            )}
            {canAccessTab('distributor') && (
              <button
                onClick={() => setActiveTab('distributor')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'distributor' 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🚛 Distributor View
                {distributorProducts.length > 0 && (
                  <span className="ml-2 bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {distributorProducts.length}
                  </span>
                )}
              </button>
            )}
            {canAccessTab('retailer') && (
              <button
                onClick={() => setActiveTab('retailer')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'retailer' 
                    ? 'bg-green-600 text-white shadow-lg' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🏪 Retailer View
                {retailerProducts.length > 0 && (
                  <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {retailerProducts.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              📋 All Products
            </button>
          </div>
        )}

        {userRole === 'none' && !isOwner ? (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-yellow-300 mb-4">⚠️ No Role Assigned</h2>
            <p className="text-gray-300 mb-4">
              You are not registered as a manufacturer, distributor, or retailer.
            </p>
            <button onClick={() => router.push('/roles')} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg">
              View Participants
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* MANUFACTURER VIEW */}
            {activeTab === 'manufacturer' && (
              <>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-300">
                    🏭 <strong>Manufacturer Actions:</strong> Select materials for products, then start manufacturing.
                    Material quantities will auto-deduct from inventory. Any manufacturer can contribute to any product!
                  </p>
                </div>

                {/* Quick Action Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">⚡ Quick Actions - Manufacturing</h2>
                  
                  {manufacturerProducts.length === 0 ? (
                    <p className="text-gray-400">No products available for manufacturing. Admin needs to create products first.</p>
                  ) : (
                    <div className="grid gap-4">
                      {manufacturerProducts.map((product) => (
                        <div key={product.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-yellow-400">#{product.id} {product.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs ${getStageColor(product.stage)}`}>
                                  {getStageText(product.stage)}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mt-1">{product.description}</p>
                              <p className="text-sm mt-1">Target Qty: <span className="text-green-400 font-semibold">{product.targetQuantity}</span></p>
                            </div>
                          </div>

                          {/* Show already selected materials */}
                          {productMaterials[product.id]?.length > 0 && (
                            <div className="mb-4 bg-gray-800 rounded p-3">
                              <p className="text-sm font-semibold mb-2 text-green-400">✓ Selected Materials:</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {productMaterials[product.id].map((pm, idx) => (
                                  <div key={idx} className="flex justify-between text-sm bg-gray-700 rounded px-2 py-1">
                                    <span>{getMaterialName(pm.materialId)}</span>
                                    <span className="text-green-400">{pm.quantityUsed} {getMaterialUnit(pm.materialId)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Material Selection Form */}
                          {(product.stage === '0' || product.stage === '1') && (
                            <div className="border-t border-gray-600 pt-4 mt-2">
                              <p className="text-sm font-semibold mb-3">➕ Add Material:</p>
                              <div className="flex gap-2 flex-wrap">
                                <select
                                  value={selectedProduct === product.id ? materialSelection.materialId : ''}
                                  onChange={(e) => { 
                                    setSelectedProduct(product.id); 
                                    setMaterialSelection({...materialSelection, materialId: e.target.value}); 
                                  }}
                                  className="bg-gray-600 rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
                                >
                                  <option value="">Select Material</option>
                                  {materials.filter(m => parseInt(m.availableQuantity) > 0).map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name} ({m.availableQuantity} {m.unit} available)
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={selectedProduct === product.id ? materialSelection.quantity : ''}
                                  onChange={(e) => { 
                                    setSelectedProduct(product.id); 
                                    setMaterialSelection({...materialSelection, quantity: e.target.value}); 
                                  }}
                                  className="bg-gray-600 rounded px-3 py-2 text-sm w-24"
                                  min="1"
                                />
                                <button
                                  onClick={() => selectMaterial(product.id)}
                                  disabled={selectedProduct !== product.id || !materialSelection.materialId || !materialSelection.quantity}
                                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded text-sm font-semibold"
                                >
                                  Add Material
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Start Manufacturing Button */}
                          {product.stage === '1' && productMaterials[product.id]?.length > 0 && (
                            <button
                              onClick={() => confirmManufacturing(product.id)}
                              className="mt-4 bg-yellow-600 hover:bg-yellow-500 px-6 py-3 rounded-lg font-semibold w-full text-lg"
                            >
                              🏭 Start Manufacturing
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Materials Overview */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">🧱 Available Materials</h2>
                  {materials.filter(m => parseInt(m.availableQuantity) > 0).length === 0 ? (
                    <p className="text-yellow-400">⚠️ No materials available. Go to Materials page to add materials.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="px-3 py-2 text-left">Material</th>
                            <th className="px-3 py-2 text-left">Category</th>
                            <th className="px-3 py-2 text-left">Available</th>
                            <th className="px-3 py-2 text-left">Vendor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materials.filter(m => parseInt(m.availableQuantity) > 0).map((m) => (
                            <tr key={m.id} className="border-b border-gray-700 hover:bg-gray-700">
                              <td className="px-3 py-2 font-medium">{m.name}</td>
                              <td className="px-3 py-2">{m.category}</td>
                              <td className="px-3 py-2 text-green-400 font-semibold">{m.availableQuantity} {m.unit}</td>
                              <td className="px-3 py-2">{getVendorName(m.vendorId)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* DISTRIBUTOR VIEW */}
            {activeTab === 'distributor' && (
              <>
                <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                  <p className="text-purple-300">
                    🚛 <strong>Distributor Actions:</strong> Pick up manufactured products for distribution.
                    Any distributor can distribute any product in the Manufacturing stage!
                  </p>
                </div>

                {/* Quick Action - Dropdown Selector */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">⚡ Quick Action - Start Distribution</h2>
                  
                  <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm font-medium mb-2">Select Product:</label>
                      <select
                        value={selectedDistProduct}
                        onChange={(e) => setSelectedDistProduct(e.target.value)}
                        className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="">-- Choose a product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.stage !== '2'}>
                            #{p.id} {p.name} - {getStageText(p.stage)} {p.stage === '2' ? '✓ Ready' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedDistProduct) {
                          startDistribution(selectedDistProduct)
                          setSelectedDistProduct('')
                        }
                      }}
                      disabled={!selectedDistProduct || products.find(p => p.id === selectedDistProduct)?.stage !== '2'}
                      className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-8 py-3 rounded-lg font-semibold text-lg"
                    >
                      🚛 Start Distribution
                    </button>
                  </div>
                  
                  {selectedDistProduct && products.find(p => p.id === selectedDistProduct)?.stage !== '2' && (
                    <div className="mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ This product is at <strong>{getStageText(products.find(p => p.id === selectedDistProduct)?.stage || '0')}</strong> stage. 
                        It needs to be at <strong>Manufacturing</strong> stage before distribution.
                        {products.find(p => p.id === selectedDistProduct)?.stage === '1' && (
                          <span className="block mt-1">→ Manufacturer needs to click &quot;Start Manufacturing&quot; first.</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Product Table */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">📦 All Products - Distribution Status</h2>
                  
                  {products.length === 0 ? (
                    <p className="text-gray-400">No products in the system yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="px-3 py-2 text-left">ID</th>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-left">Stage</th>
                            <th className="px-3 py-2 text-left">Manufacturer</th>
                            <th className="px-3 py-2 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr key={p.id} className={`border-b border-gray-700 ${p.stage === '2' ? 'bg-purple-900/20' : ''}`}>
                              <td className="px-3 py-2 font-bold">{p.id}</td>
                              <td className="px-3 py-2">
                                <div>
                                  <span className="font-medium">{p.name}</span>
                                  <p className="text-gray-500 text-xs">{p.description}</p>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded text-xs ${getStageColor(p.stage)}`}>
                                  {getStageText(p.stage)}
                                </span>
                              </td>
                              <td className="px-3 py-2">{getManufacturerName(p.manufacturerId)}</td>
                              <td className="px-3 py-2">
                                {p.stage === '2' ? (
                                  <button
                                    onClick={() => startDistribution(p.id)}
                                    className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded font-semibold text-sm"
                                  >
                                    🚛 Distribute
                                  </button>
                                ) : p.stage === '3' ? (
                                  <span className="text-purple-400 text-sm">📍 In Transit</span>
                                ) : parseInt(p.stage) < 2 ? (
                                  <span className="text-gray-500 text-sm">⏳ Not ready</span>
                                ) : (
                                  <span className="text-green-400 text-sm">✓ Completed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Ready for Distribution */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">✅ Ready for Distribution ({distributorProducts.length})</h2>
                  {distributorProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-lg">📦 No products ready for distribution.</p>
                      <p className="text-gray-500 text-sm mt-2">Products need to complete manufacturing first (Stage: Manufacturing).</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {distributorProducts.map((p) => (
                        <div key={p.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-purple-400 text-lg">#{p.id} {p.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">{p.description}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Manufactured by: <span className="text-yellow-400">{getManufacturerName(p.manufacturerId)}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => startDistribution(p.id)}
                            className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold text-lg whitespace-nowrap"
                          >
                            🚛 Start Distribution
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Currently In Distribution */}
                {distributorInProgress.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">📍 Currently In Distribution ({distributorInProgress.length})</h2>
                    <div className="grid gap-4">
                      {distributorInProgress.map((p) => (
                        <div key={p.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-blue-400 text-lg">#{p.id} {p.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                              Distributed by: <span className="text-purple-400">{getDistributorName(p.distributorId)}</span>
                            </p>
                          </div>
                          <span className="bg-blue-600 px-4 py-2 rounded-lg text-sm">🚚 In Transit to Retailer</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* RETAILER VIEW */}
            {activeTab === 'retailer' && (
              <>
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                  <p className="text-green-300">
                    🏪 <strong>Retailer Actions:</strong> Receive products from distribution and mark them as sold.
                    Any retailer can receive and sell products!
                  </p>
                </div>

                {/* Quick Action - Dropdown Selector */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">⚡ Quick Action - Receive / Sell Product</h2>
                  
                  <div className="flex gap-4 items-end flex-wrap">
                    <div className="flex-1 min-w-[250px]">
                      <label className="block text-sm font-medium mb-2">Select Product:</label>
                      <select
                        value={selectedRetailProduct}
                        onChange={(e) => setSelectedRetailProduct(e.target.value)}
                        className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white"
                      >
                        <option value="">-- Choose a product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.stage !== '3' && p.stage !== '4'}>
                            #{p.id} {p.name} - {getStageText(p.stage)} {p.stage === '3' ? '📦 Ready to Receive' : p.stage === '4' ? '💰 Ready to Sell' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedRetailProduct && products.find(p => p.id === selectedRetailProduct)?.stage === '3' && (
                      <button
                        onClick={() => {
                          receiveAtRetail(selectedRetailProduct)
                          setSelectedRetailProduct('')
                        }}
                        className="bg-green-600 hover:bg-green-500 px-8 py-3 rounded-lg font-semibold text-lg"
                      >
                        📦 Receive Product
                      </button>
                    )}
                    {selectedRetailProduct && products.find(p => p.id === selectedRetailProduct)?.stage === '4' && (
                      <button
                        onClick={() => {
                          markAsSold(selectedRetailProduct)
                          setSelectedRetailProduct('')
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-lg font-semibold text-lg"
                      >
                        💰 Mark as Sold
                      </button>
                    )}
                  </div>
                  
                  {selectedRetailProduct && products.find(p => p.id === selectedRetailProduct)?.stage !== '3' && products.find(p => p.id === selectedRetailProduct)?.stage !== '4' && (
                    <div className="mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ This product is at <strong>{getStageText(products.find(p => p.id === selectedRetailProduct)?.stage || '0')}</strong> stage. 
                        It needs to be at <strong>Distribution</strong> stage before you can receive it.
                      </p>
                    </div>
                  )}
                </div>

                {/* Product Table for Retailer */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">📦 All Products - Retail Status</h2>
                  
                  {products.length === 0 ? (
                    <p className="text-gray-400">No products in the system yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="px-3 py-2 text-left">ID</th>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-left">Stage</th>
                            <th className="px-3 py-2 text-left">Distributor</th>
                            <th className="px-3 py-2 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr key={p.id} className={`border-b border-gray-700 ${p.stage === '3' || p.stage === '4' ? 'bg-green-900/20' : ''}`}>
                              <td className="px-3 py-2 font-bold">{p.id}</td>
                              <td className="px-3 py-2">
                                <div>
                                  <span className="font-medium">{p.name}</span>
                                  <p className="text-gray-500 text-xs">{p.description}</p>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded text-xs ${getStageColor(p.stage)}`}>
                                  {getStageText(p.stage)}
                                </span>
                              </td>
                              <td className="px-3 py-2">{getDistributorName(p.distributorId)}</td>
                              <td className="px-3 py-2">
                                {p.stage === '3' ? (
                                  <button
                                    onClick={() => receiveAtRetail(p.id)}
                                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-semibold text-sm"
                                  >
                                    📦 Receive
                                  </button>
                                ) : p.stage === '4' ? (
                                  <button
                                    onClick={() => markAsSold(p.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded font-semibold text-sm"
                                  >
                                    💰 Sell
                                  </button>
                                ) : p.stage === '5' ? (
                                  <span className="text-emerald-400 text-sm">✓ Sold</span>
                                ) : (
                                  <span className="text-gray-500 text-sm">⏳ Not ready</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">⚡ Quick Actions - Retail</h2>
                  {retailerProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 text-lg">📦 No products available for retail.</p>
                      <p className="text-gray-500 text-sm mt-2">Products need to be in distribution first (Stage: Distribution).</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {retailerProducts.map((p) => (
                        <div key={p.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-green-400 text-lg">#{p.id} {p.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">{p.description}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {p.stage === '3' 
                                ? <span>Distributed by: <span className="text-purple-400">{getDistributorName(p.distributorId)}</span></span>
                                : <span className="text-green-400">📍 At your store - Ready to sell!</span>
                              }
                            </p>
                          </div>
                          {p.stage === '3' && (
                            <button
                              onClick={() => receiveAtRetail(p.id)}
                              className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold text-lg whitespace-nowrap"
                            >
                              📦 Receive Product
                            </button>
                          )}
                          {p.stage === '4' && (
                            <button
                              onClick={() => markAsSold(p.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-lg font-semibold text-lg whitespace-nowrap"
                            >
                              💰 Mark as Sold
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">📋 All Products Overview</h2>
                {products.length === 0 ? (
                  <p className="text-gray-400">No products yet. Admin needs to create products first.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="px-3 py-2 text-left">ID</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Stage</th>
                          <th className="px-3 py-2 text-left">Manufacturer</th>
                          <th className="px-3 py-2 text-left">Distributor</th>
                          <th className="px-3 py-2 text-left">Retailer</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700">
                            <td className="px-3 py-2 font-bold">{p.id}</td>
                            <td className="px-3 py-2">{p.name}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${getStageColor(p.stage)}`}>
                                {getStageText(p.stage)}
                              </span>
                            </td>
                            <td className="px-3 py-2">{getManufacturerName(p.manufacturerId)}</td>
                            <td className="px-3 py-2">{getDistributorName(p.distributorId)}</td>
                            <td className="px-3 py-2">{getRetailerName(p.retailerId)}</td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => router.push(`/track?id=${p.id}`)}
                                className="text-blue-400 hover:text-blue-300 text-xs"
                              >
                                Track →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Supply Chain Progress Visual */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📊 Supply Chain Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-gray-400">{products.filter(p => p.stage === '0').length}</p>
                  <p className="text-sm text-gray-400">Init</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-400">{products.filter(p => p.stage === '1').length}</p>
                  <p className="text-sm text-gray-400">Materials Ready</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">{products.filter(p => p.stage === '2').length}</p>
                  <p className="text-sm text-gray-400">Manufacturing</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-purple-400">{products.filter(p => p.stage === '3').length}</p>
                  <p className="text-sm text-gray-400">Distribution</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">{products.filter(p => p.stage === '4').length}</p>
                  <p className="text-sm text-gray-400">Retail</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{products.filter(p => p.stage === '5').length}</p>
                  <p className="text-sm text-gray-400">Sold</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
