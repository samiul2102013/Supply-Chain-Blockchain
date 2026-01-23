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

interface ProductTimeline {
  createdAt: string
  materialsAssignedAt: string
  manufacturingStartedAt: string
  manufacturingCompletedAt: string
  distributionStartedAt: string
  retailReceivedAt: string
  soldAt: string
}

interface ProductMaterialUsage {
  materialId: string
  quantityUsed: string
  assignedAt: string
}

interface Material {
  id: string
  name: string
  category: string
  unit: string
  vendorId: string
}

interface Vendor {
  id: string
  name: string
  location: string
}

interface Manufacturer {
  id: string
  name: string
  location: string
}

interface Distributor {
  id: string
  name: string
  location: string
}

interface Retailer {
  id: string
  name: string
  location: string
}

export default function TrackPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [searchId, setSearchId] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [timeline, setTimeline] = useState<ProductTimeline | null>(null)
  const [productMaterials, setProductMaterials] = useState<ProductMaterialUsage[]>([])
  
  const [materials, setMaterials] = useState<Material[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    try {
      setLoading(true)
      const { contract } = await getContract()
      setSupplyChain(contract)

      // Load all reference data
      const vendorCount = await contract.methods.vendorCtr().call()
      const vendorPromises = []
      for (let i = 1; i <= parseInt(vendorCount); i++) {
        vendorPromises.push(contract.methods.vendors(i).call())
      }
      setVendors(await Promise.all(vendorPromises))

      const materialCount = await contract.methods.materialCtr().call()
      const materialPromises = []
      for (let i = 1; i <= parseInt(materialCount); i++) {
        materialPromises.push(contract.methods.materials(i).call())
      }
      setMaterials(await Promise.all(materialPromises))

      const manCount = await contract.methods.manufacturerCtr().call()
      const manPromises = []
      for (let i = 1; i <= parseInt(manCount); i++) {
        manPromises.push(contract.methods.manufacturers(i).call())
      }
      setManufacturers(await Promise.all(manPromises))

      const disCount = await contract.methods.distributorCtr().call()
      const disPromises = []
      for (let i = 1; i <= parseInt(disCount); i++) {
        disPromises.push(contract.methods.distributors(i).call())
      }
      setDistributors(await Promise.all(disPromises))

      const retCount = await contract.methods.retailerCtr().call()
      const retPromises = []
      for (let i = 1; i <= parseInt(retCount); i++) {
        retPromises.push(contract.methods.retailers(i).call())
      }
      setRetailers(await Promise.all(retPromises))
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error loading data')
      setLoading(false)
    }
  }

  const searchProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !searchId) return

    try {
      const productData = await supplyChain.methods.products(parseInt(searchId)).call()
      
      if (!productData || productData.id === '0') {
        alert('Product not found')
        setProduct(null)
        return
      }

      setProduct(productData)

      // Get timeline
      const timelineData = await supplyChain.methods.productTimelines(parseInt(searchId)).call()
      setTimeline(timelineData)

      // Get materials used
      const materialsData = await supplyChain.methods.getProductMaterials(parseInt(searchId)).call()
      setProductMaterials(materialsData)

    } catch (err: any) {
      console.error(err)
      alert('Product not found or error fetching data')
      setProduct(null)
    }
  }

  const getStageText = (stage: string) => {
    const stages = [
      'Product Created - Awaiting Materials',
      'Materials Assigned - Ready for Manufacturing',
      'Manufacturing in Progress',
      'In Distribution',
      'At Retail Store',
      'Sold to Consumer'
    ]
    return stages[parseInt(stage)] || 'Unknown'
  }

  const getStageColor = (stage: string) => {
    const colors = [
      'border-gray-500',
      'border-blue-500',
      'border-yellow-500',
      'border-purple-500',
      'border-green-500',
      'border-emerald-500'
    ]
    return colors[parseInt(stage)] || 'border-gray-500'
  }

  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name || 'Unknown'
  const getVendorLocation = (id: string) => vendors.find(v => v.id === id)?.location || ''
  const getMaterialName = (id: string) => materials.find(m => m.id === id)?.name || 'Unknown'
  const getMaterialUnit = (id: string) => materials.find(m => m.id === id)?.unit || ''
  const getMaterialVendorId = (id: string) => materials.find(m => m.id === id)?.vendorId || '0'
  const getManufacturerName = (id: string) => manufacturers.find(m => m.id === id)?.name || 'Not assigned'
  const getManufacturerLocation = (id: string) => manufacturers.find(m => m.id === id)?.location || ''
  const getDistributorName = (id: string) => distributors.find(d => d.id === id)?.name || 'Not assigned'
  const getDistributorLocation = (id: string) => distributors.find(d => d.id === id)?.location || ''
  const getRetailerName = (id: string) => retailers.find(r => r.id === id)?.name || 'Not assigned'
  const getRetailerLocation = (id: string) => retailers.find(r => r.id === id)?.location || ''

  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return null
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🔍 Track Product</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            ← Back to Home
          </button>
        </div>

        {/* Search Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Search Product</h2>
          <form onSubmit={searchProduct} className="flex gap-4">
            <input
              type="number"
              placeholder="Enter Product ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white"
              min="1"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold"
            >
              Track
            </button>
          </form>
        </div>

        {/* Product Details */}
        {product && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className={`bg-gray-800 rounded-lg p-6 border-l-4 ${getStageColor(product.stage)}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{product.name}</h2>
                  <p className="text-gray-400">{product.description}</p>
                </div>
                <span className="text-sm bg-gray-700 px-3 py-1 rounded">
                  ID: {product.id}
                </span>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold text-blue-400">
                  Status: {getStageText(product.stage)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Target Quantity</p>
                  <p className="font-semibold">{product.targetQuantity}</p>
                </div>
                <div>
                  <p className="text-gray-400">Created</p>
                  <p className="font-semibold">{formatDate(product.createdAt) || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Materials Used */}
            {productMaterials.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">📦 Materials Used</h3>
                <div className="space-y-3">
                  {productMaterials.map((pm, idx) => {
                    const vendorId = getMaterialVendorId(pm.materialId)
                    return (
                      <div key={idx} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{getMaterialName(pm.materialId)}</p>
                            <p className="text-sm text-gray-400">
                              Quantity: {pm.quantityUsed} {getMaterialUnit(pm.materialId)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Supplied by</p>
                            <p className="font-semibold text-blue-400">{getVendorName(vendorId)}</p>
                            <p className="text-xs text-gray-400">{getVendorLocation(vendorId)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Assigned: {formatDate(pm.assignedAt) || 'N/A'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Supply Chain Journey */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">🚚 Supply Chain Journey</h3>
              <div className="space-y-4">
                {/* Step 1: Created */}
                <TimelineStep
                  icon="📝"
                  title="Product Created"
                  date={formatDate(timeline?.createdAt || '0')}
                  description="Product order created by admin"
                  completed={true}
                />

                {/* Step 2: Materials Assigned */}
                <TimelineStep
                  icon="📦"
                  title="Materials Assigned"
                  date={formatDate(timeline?.materialsAssignedAt || '0')}
                  description={productMaterials.length > 0 
                    ? `${productMaterials.length} material(s) assigned from vendors` 
                    : 'Awaiting materials assignment'}
                  completed={parseInt(product.stage) >= 1}
                />

                {/* Step 3: Manufacturing */}
                <TimelineStep
                  icon="🏭"
                  title="Manufacturing"
                  date={formatDate(timeline?.manufacturingStartedAt || '0')}
                  description={product.manufacturerId !== '0' 
                    ? `By ${getManufacturerName(product.manufacturerId)} (${getManufacturerLocation(product.manufacturerId)})` 
                    : 'Awaiting manufacturing'}
                  completed={parseInt(product.stage) >= 2}
                />

                {/* Step 4: Distribution */}
                <TimelineStep
                  icon="🚛"
                  title="Distribution"
                  date={formatDate(timeline?.distributionStartedAt || '0')}
                  description={product.distributorId !== '0' 
                    ? `By ${getDistributorName(product.distributorId)} (${getDistributorLocation(product.distributorId)})` 
                    : 'Awaiting distribution'}
                  completed={parseInt(product.stage) >= 3}
                />

                {/* Step 5: Retail */}
                <TimelineStep
                  icon="🏪"
                  title="At Retail"
                  date={formatDate(timeline?.retailReceivedAt || '0')}
                  description={product.retailerId !== '0' 
                    ? `At ${getRetailerName(product.retailerId)} (${getRetailerLocation(product.retailerId)})` 
                    : 'Awaiting retail'}
                  completed={parseInt(product.stage) >= 4}
                />

                {/* Step 6: Sold */}
                <TimelineStep
                  icon="✅"
                  title="Sold"
                  date={formatDate(timeline?.soldAt || '0')}
                  description={parseInt(product.stage) >= 5 ? 'Sold to consumer' : 'Available for purchase'}
                  completed={parseInt(product.stage) >= 5}
                  isLast
                />
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-4">📱 Share This Product</h3>
              <div className="inline-block bg-white p-4 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    typeof window !== 'undefined' ? `${window.location.origin}/track?id=${product.id}` : ''
                  )}`}
                  alt="QR Code"
                  className="w-36 h-36"
                />
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Scan to view product tracking information
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Timeline Step Component
function TimelineStep({ 
  icon, 
  title, 
  date, 
  description, 
  completed,
  isLast = false 
}: { 
  icon: string
  title: string
  date: string | null
  description: string
  completed: boolean
  isLast?: boolean
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
          completed ? 'bg-green-600' : 'bg-gray-600'
        }`}>
          {icon}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-full min-h-[40px] ${
            completed ? 'bg-green-600' : 'bg-gray-600'
          }`} />
        )}
      </div>
      <div className="flex-1 pb-4">
        <h4 className={`font-semibold ${completed ? 'text-white' : 'text-gray-500'}`}>
          {title}
        </h4>
        <p className="text-sm text-gray-400">{description}</p>
        {date && (
          <p className="text-xs text-green-400 mt-1">📅 {date}</p>
        )}
      </div>
    </div>
  )
}
