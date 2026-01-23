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
  
  const [userRole, setUserRole] = useState<'none' | 'manufacturer' | 'distributor' | 'retailer'>('none')
  const [userRoleId, setUserRoleId] = useState<string>('0')
  const [userRoleInfo, setUserRoleInfo] = useState<any>(null)

  // Material selection form for manufacturer
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [materialSelection, setMaterialSelection] = useState({ materialId: '', quantity: '' })

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

      if (parseInt(manId) > 0) {
        setUserRole('manufacturer')
        setUserRoleId(manId)
        setUserRoleInfo(manData.find(m => m.id === manId))
      } else if (parseInt(disId) > 0) {
        setUserRole('distributor')
        setUserRoleId(disId)
      } else if (parseInt(retId) > 0) {
        setUserRole('retailer')
        setUserRoleId(retId)
      }
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error loading data')
      setLoading(false)
    }
  }

  // Manufacturer selects material for a product
  const selectMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !selectedProduct || !materialSelection.materialId) return

    try {
      await supplyChain.methods.manufacturerSelectMaterial(
        parseInt(selectedProduct),
        parseInt(materialSelection.materialId),
        parseInt(materialSelection.quantity)
      ).send({ from: currentAccount })
      
      setMaterialSelection({ materialId: '', quantity: '' })
      loadBlockchainData()
      alert('Material selected! Quantity deducted from inventory.')
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
      alert('Manufacturing started!')
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
      alert('Distribution started!')
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
      alert('Product received at retail!')
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
      alert('Product marked as sold!')
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
    if (userRole === 'manufacturer') return { text: 'Manufacturer', color: 'bg-yellow-600' }
    if (userRole === 'distributor') return { text: 'Distributor', color: 'bg-purple-600' }
    if (userRole === 'retailer') return { text: 'Retailer', color: 'bg-green-600' }
    return { text: 'No Role Assigned', color: 'bg-gray-600' }
  }

  const getMaterialName = (id: string) => materials.find(m => m.id === id)?.name || 'Unknown'
  const getMaterialUnit = (id: string) => materials.find(m => m.id === id)?.unit || ''
  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name || 'Unknown'
  const getManufacturerName = (id: string) => manufacturers.find(m => m.id === id)?.name || 'Not assigned'
  const getDistributorName = (id: string) => distributors.find(d => d.id === id)?.name || 'Not assigned'
  const getRetailerName = (id: string) => retailers.find(r => r.id === id)?.name || 'Not assigned'

  // Products that manufacturer can work on (Init or already assigned to this manufacturer)
  const manufacturerProducts = products.filter(p => 
    p.stage === '0' || // Init - can select materials
    (p.stage === '1' && p.manufacturerId === userRoleId) // MaterialsAssigned by this manufacturer
  )

  const distributorProducts = products.filter(p => p.stage === '2') // Manufacturing complete
  const retailerProducts = products.filter(p => 
    p.stage === '3' || // In distribution
    (p.stage === '4' && p.retailerId === userRoleId) // At this retailer
  )

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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Connected: <span className="text-blue-400">{currentAccount}</span></p>
              {userRoleInfo && <p className="text-gray-400 text-sm">{userRoleInfo.name} - {userRoleInfo.location}</p>}
            </div>
            <span className={`px-4 py-2 rounded-full font-semibold ${roleBadge.color}`}>
              {roleBadge.text}
            </span>
          </div>
        </div>

        {userRole === 'none' ? (
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
            {userRole === 'manufacturer' && (
              <>
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                  <p className="text-blue-300">
                    🏭 As a <strong>Manufacturer</strong>: Select materials for products, then start manufacturing.
                    Material quantities will auto-deduct from inventory.
                  </p>
                </div>

                {/* Products to work on */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">📦 Products Available</h2>
                  
                  {manufacturerProducts.length === 0 ? (
                    <p className="text-gray-400">No products available. Admin needs to create products first.</p>
                  ) : (
                    <div className="space-y-4">
                      {manufacturerProducts.map((product) => (
                        <div key={product.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold">{product.name}</h3>
                              <p className="text-gray-400 text-sm">{product.description}</p>
                              <p className="text-sm mt-1">Target Qty: <span className="text-green-400">{product.targetQuantity}</span></p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm ${getStageColor(product.stage)}`}>
                              {getStageText(product.stage)}
                            </span>
                          </div>

                          {/* Show already selected materials */}
                          {productMaterials[product.id]?.length > 0 && (
                            <div className="mb-4 bg-gray-800 rounded p-3">
                              <p className="text-sm font-semibold mb-2">Selected Materials:</p>
                              {productMaterials[product.id].map((pm, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{getMaterialName(pm.materialId)}</span>
                                  <span className="text-green-400">{pm.quantityUsed} {getMaterialUnit(pm.materialId)}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Material Selection Form - Only for Init or MaterialsAssigned stage */}
                          {(product.stage === '0' || product.stage === '1') && (
                            <div className="border-t border-gray-600 pt-4 mt-4">
                              <p className="text-sm font-semibold mb-3">➕ Add Material to this Product:</p>
                              <form onSubmit={(e) => { setSelectedProduct(product.id); selectMaterial(e); }} className="flex gap-2 flex-wrap">
                                <select
                                  value={selectedProduct === product.id ? materialSelection.materialId : ''}
                                  onChange={(e) => { setSelectedProduct(product.id); setMaterialSelection({...materialSelection, materialId: e.target.value}); }}
                                  className="bg-gray-600 rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
                                  required
                                >
                                  <option value="">Select Material</option>
                                  {materials.filter(m => parseInt(m.availableQuantity) > 0).map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name} (Available: {m.availableQuantity} {m.unit}) - {getVendorName(m.vendorId)}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  placeholder="Qty"
                                  value={selectedProduct === product.id ? materialSelection.quantity : ''}
                                  onChange={(e) => { setSelectedProduct(product.id); setMaterialSelection({...materialSelection, quantity: e.target.value}); }}
                                  className="bg-gray-600 rounded px-3 py-2 text-sm w-24"
                                  min="1"
                                  required
                                />
                                <button
                                  type="submit"
                                  onClick={() => setSelectedProduct(product.id)}
                                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-sm font-semibold"
                                >
                                  Add
                                </button>
                              </form>
                            </div>
                          )}

                          {/* Start Manufacturing Button - Only when materials are assigned */}
                          {product.stage === '1' && productMaterials[product.id]?.length > 0 && (
                            <button
                              onClick={() => confirmManufacturing(product.id)}
                              className="mt-4 bg-yellow-600 hover:bg-yellow-500 px-6 py-2 rounded-lg font-semibold w-full"
                            >
                              ✅ Confirm & Start Manufacturing
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
                    <p className="text-yellow-400">⚠️ No materials available. Vendors need to add materials first.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="px-3 py-2 text-left">Material</th>
                            <th className="px-3 py-2 text-left">Category</th>
                            <th className="px-3 py-2 text-left">Available</th>
                            <th className="px-3 py-2 text-left">Price/Unit</th>
                            <th className="px-3 py-2 text-left">Vendor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materials.filter(m => parseInt(m.availableQuantity) > 0).map((m) => (
                            <tr key={m.id} className="border-b border-gray-700">
                              <td className="px-3 py-2">{m.name}</td>
                              <td className="px-3 py-2">{m.category}</td>
                              <td className="px-3 py-2 text-green-400">{m.availableQuantity} {m.unit}</td>
                              <td className="px-3 py-2">${m.pricePerUnit}</td>
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
            {userRole === 'distributor' && (
              <>
                <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                  <p className="text-purple-300">
                    🚛 As a <strong>Distributor</strong>: Pick up manufactured products for distribution.
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">📦 Products Ready for Distribution</h2>
                  {distributorProducts.length === 0 ? (
                    <p className="text-gray-400">No products ready for distribution.</p>
                  ) : (
                    <div className="space-y-4">
                      {distributorProducts.map((p) => (
                        <div key={p.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold">{p.name}</h3>
                            <p className="text-sm text-gray-400">Manufactured by: {getManufacturerName(p.manufacturerId)}</p>
                          </div>
                          <button
                            onClick={() => startDistribution(p.id)}
                            className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold"
                          >
                            🚛 Start Distribution
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* RETAILER VIEW */}
            {userRole === 'retailer' && (
              <>
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                  <p className="text-green-300">
                    🏪 As a <strong>Retailer</strong>: Receive products and mark them as sold.
                  </p>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">📦 Products for Your Store</h2>
                  {retailerProducts.length === 0 ? (
                    <p className="text-gray-400">No products available.</p>
                  ) : (
                    <div className="space-y-4">
                      {retailerProducts.map((p) => (
                        <div key={p.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold">{p.name}</h3>
                            <p className="text-sm text-gray-400">
                              {p.stage === '3' ? `Distributed by: ${getDistributorName(p.distributorId)}` : 'At your store'}
                            </p>
                          </div>
                          {p.stage === '3' && (
                            <button
                              onClick={() => receiveAtRetail(p.id)}
                              className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-semibold"
                            >
                              📦 Receive at Store
                            </button>
                          )}
                          {p.stage === '4' && p.retailerId === userRoleId && (
                            <button
                              onClick={() => markAsSold(p.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-semibold"
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

            {/* All Products Overview */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📋 All Products Overview</h2>
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
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-700">
                        <td className="px-3 py-2">{p.id}</td>
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${getStageColor(p.stage)}`}>
                            {getStageText(p.stage)}
                          </span>
                        </td>
                        <td className="px-3 py-2">{getManufacturerName(p.manufacturerId)}</td>
                        <td className="px-3 py-2">{getDistributorName(p.distributorId)}</td>
                        <td className="px-3 py-2">{getRetailerName(p.retailerId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
