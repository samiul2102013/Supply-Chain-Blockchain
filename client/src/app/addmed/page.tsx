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
}

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

interface ProductMaterialUsage {
  materialId: string
  quantityUsed: string
  assignedAt: string
}

interface Vendor {
  id: string
  name: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'create' | 'assign'>('products')
  
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [productMaterials, setProductMaterials] = useState<{[key: string]: ProductMaterialUsage[]}>({})

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    targetQuantity: ''
  })

  const [assignForm, setAssignForm] = useState({
    productId: '',
    materialId: '',
    quantity: ''
  })

  const [selectedProductForView, setSelectedProductForView] = useState<string | null>(null)

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

      // Load product materials for each product
      const prodMaterials: {[key: string]: ProductMaterialUsage[]} = {}
      for (let i = 1; i <= parseInt(productCount); i++) {
        const count = await contract.methods.getProductMaterialsCount(i).call()
        if (parseInt(count) > 0) {
          const mats = await contract.methods.getProductMaterials(i).call()
          prodMaterials[i.toString()] = mats
        } else {
          prodMaterials[i.toString()] = []
        }
      }
      setProductMaterials(prodMaterials)

      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error loading data')
      setLoading(false)
    }
  }

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      await supplyChain.methods.createProduct(
        newProduct.name,
        newProduct.description,
        parseInt(newProduct.targetQuantity)
      ).send({ from: currentAccount })
      
      setNewProduct({ name: '', description: '', targetQuantity: '' })
      loadBlockchainData()
      alert('Product created successfully! Now assign materials to it.')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error creating product')
    }
  }

  const assignMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      const material = materials.find(m => m.id === assignForm.materialId)
      if (material && parseInt(assignForm.quantity) > parseInt(material.availableQuantity)) {
        alert(`Not enough ${material.name} available. Only ${material.availableQuantity} ${material.unit} in stock.`)
        return
      }

      await supplyChain.methods.assignMaterialToProduct(
        parseInt(assignForm.productId),
        parseInt(assignForm.materialId),
        parseInt(assignForm.quantity)
      ).send({ from: currentAccount })
      
      setAssignForm({ productId: '', materialId: '', quantity: '' })
      loadBlockchainData()
      alert('Material assigned to product successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error assigning material')
    }
  }

  const getStageText = (stage: string) => {
    const stages = [
      'Init - Awaiting Materials',
      'Materials Assigned',
      'Manufacturing',
      'Distribution',
      'Retail',
      'Sold'
    ]
    return stages[parseInt(stage)] || 'Unknown'
  }

  const getStageColor = (stage: string) => {
    const colors = ['bg-gray-600', 'bg-blue-600', 'bg-yellow-600', 'bg-purple-600', 'bg-green-600', 'bg-emerald-600']
    return colors[parseInt(stage)] || 'bg-gray-600'
  }

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    return material ? material.name : 'Unknown'
  }

  const getMaterialUnit = (materialId: string) => {
    const material = materials.find(m => m.id === materialId)
    return material ? material.unit : ''
  }

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId)
    return vendor ? vendor.name : 'Unknown'
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return 'N/A'
    return new Date(parseInt(timestamp) * 1000).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🏭 Products & Orders</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            ← Back to Home
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Total Products</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Awaiting Materials</p>
            <p className="text-2xl font-bold text-yellow-500">{products.filter(p => p.stage === '0').length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">In Manufacturing</p>
            <p className="text-2xl font-bold text-blue-500">{products.filter(p => p.stage === '2').length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400">Available Materials</p>
            <p className="text-2xl font-bold">{materials.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {(['products', 'create', 'assign'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab === 'create' ? 'Create Product' : tab === 'assign' ? 'Assign Materials' : 'All Products'}
            </button>
          ))}
        </div>

        {/* Products List Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400 mb-4">No products created yet.</p>
                {isOwner && (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg"
                  >
                    Create First Product
                  </button>
                )}
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      <p className="text-gray-400">{product.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStageColor(product.stage)}`}>
                      {getStageText(product.stage)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-400">Product ID</p>
                      <p className="font-semibold">{product.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Target Quantity</p>
                      <p className="font-semibold">{product.targetQuantity}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Created</p>
                      <p className="font-semibold">{formatDate(product.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Materials Assigned</p>
                      <p className="font-semibold">{productMaterials[product.id]?.length || 0}</p>
                    </div>
                  </div>

                  {/* Show assigned materials */}
                  {productMaterials[product.id] && productMaterials[product.id].length > 0 && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <button
                        onClick={() => setSelectedProductForView(selectedProductForView === product.id ? null : product.id)}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
                      >
                        {selectedProductForView === product.id ? '▼ Hide' : '▶ Show'} Assigned Materials
                      </button>
                      
                      {selectedProductForView === product.id && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-600">
                                <th className="px-3 py-2 text-left">Material</th>
                                <th className="px-3 py-2 text-left">Quantity Used</th>
                                <th className="px-3 py-2 text-left">Vendor</th>
                                <th className="px-3 py-2 text-left">Assigned At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productMaterials[product.id].map((pm, idx) => {
                                const mat = materials.find(m => m.id === pm.materialId)
                                return (
                                  <tr key={idx} className="border-b border-gray-700">
                                    <td className="px-3 py-2">{getMaterialName(pm.materialId)}</td>
                                    <td className="px-3 py-2">{pm.quantityUsed} {getMaterialUnit(pm.materialId)}</td>
                                    <td className="px-3 py-2">{mat ? getVendorName(mat.vendorId) : 'N/A'}</td>
                                    <td className="px-3 py-2">{formatDate(pm.assignedAt)}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Product Tab */}
        {activeTab === 'create' && isOwner && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Create New Product</h2>
            <form onSubmit={createProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="bg-gray-700 rounded-lg px-4 py-2 text-white md:col-span-2"
                required
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="bg-gray-700 rounded-lg px-4 py-2 text-white md:col-span-2"
                rows={3}
                required
              />
              <input
                type="number"
                placeholder="Target Quantity"
                value={newProduct.targetQuantity}
                onChange={(e) => setNewProduct({...newProduct, targetQuantity: e.target.value})}
                className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                min="1"
                required
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-semibold"
              >
                Create Product
              </button>
            </form>
          </div>
        )}

        {/* Assign Materials Tab */}
        {activeTab === 'assign' && isOwner && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Assign Materials to Product</h2>
            
            {products.filter(p => p.stage === '0' || p.stage === '1').length === 0 ? (
              <div className="text-yellow-400">
                ⚠️ No products available for material assignment. Products must be in &quot;Init&quot; or &quot;Materials Assigned&quot; stage.
              </div>
            ) : materials.length === 0 ? (
              <div className="text-yellow-400">
                ⚠️ No materials available. Please add materials first.
                <button
                  onClick={() => router.push('/materials')}
                  className="ml-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
                >
                  Go to Materials
                </button>
              </div>
            ) : (
              <form onSubmit={assignMaterial} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={assignForm.productId}
                    onChange={(e) => setAssignForm({...assignForm, productId: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select Product</option>
                    {products.filter(p => p.stage === '0' || p.stage === '1').map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} - {p.name} ({getStageText(p.stage)})
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={assignForm.materialId}
                    onChange={(e) => setAssignForm({...assignForm, materialId: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  >
                    <option value="">Select Material</option>
                    {materials.filter(m => parseInt(m.availableQuantity) > 0).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Available: {m.availableQuantity} {m.unit})
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    placeholder="Quantity to Use"
                    value={assignForm.quantity}
                    onChange={(e) => setAssignForm({...assignForm, quantity: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    min="1"
                    required
                  />
                </div>
                
                {assignForm.materialId && (
                  <div className="text-sm text-gray-400">
                    Available: {materials.find(m => m.id === assignForm.materialId)?.availableQuantity || 0} {getMaterialUnit(assignForm.materialId)}
                  </div>
                )}
                
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold"
                >
                  Assign Material to Product
                </button>
              </form>
            )}

            {/* Quick view of available materials */}
            <div className="mt-8 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-semibold mb-4">Available Materials</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Material</th>
                      <th className="px-3 py-2 text-left">Category</th>
                      <th className="px-3 py-2 text-left">Available</th>
                      <th className="px-3 py-2 text-left">Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m) => (
                      <tr key={m.id} className="border-b border-gray-700">
                        <td className="px-3 py-2">{m.id}</td>
                        <td className="px-3 py-2">{m.name}</td>
                        <td className="px-3 py-2">{m.category}</td>
                        <td className={`px-3 py-2 ${parseInt(m.availableQuantity) < 10 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {m.availableQuantity} {m.unit}
                        </td>
                        <td className="px-3 py-2">{getVendorName(m.vendorId)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!isOwner && (activeTab === 'create' || activeTab === 'assign') && (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-300">
              ⚠️ Only the contract owner can create products and assign materials.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

