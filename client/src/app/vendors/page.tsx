'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { checkIsOwner } from '@/lib/contractUtils'

interface Vendor {
  addr: string
  id: string
  name: string
  place: string
  contactInfo: string
  materialTypes: string
  registeredAt: string
}

interface VendorPerformance {
  totalOrders: string
  completedOrders: string
  totalQuantitySupplied: string
  lastActivityTimestamp: string
  rating: string
  isVerified: boolean
}

export default function VendorsPage() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorStats, setVendorStats] = useState<{ [key: string]: VendorPerformance }>({})
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'details'>('list')

  const [newVendor, setNewVendor] = useState({
    address: '',
    name: '',
    place: '',
    contactInfo: '',
    materialTypes: '',
  })

  const [ratingForm, setRatingForm] = useState({
    vendorId: '',
    rating: '30',
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

      const rmsCount = await contract.methods.rmsCtr().call()
      
      const vendorList: Vendor[] = []
      const stats: { [key: string]: VendorPerformance } = {}
      
      for (let i = 1; i <= parseInt(rmsCount); i++) {
        const vendor = await contract.methods.RMS(i).call()
        vendorList.push(vendor)
        
        const perf = await contract.methods.VendorStats(i).call()
        stats[i.toString()] = perf
      }

      setVendors(vendorList)
      setVendorStats(stats)
      
      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      alert(err?.message || 'Error loading data')
      setLoading(false)
    }
  }

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const receipt = await supplyChain.methods.addRMS(
        newVendor.address,
        newVendor.name,
        newVendor.place,
        newVendor.contactInfo,
        newVendor.materialTypes
      ).send({ from: currentAccount })
      
      if (receipt) {
        alert('Vendor registered successfully!')
        setNewVendor({ address: '', name: '', place: '', contactInfo: '', materialTypes: '' })
        loadBlockchainData()
        setActiveTab('list')
      }
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error registering vendor')
    }
  }

  const handleVerifyVendor = async (vendorId: string) => {
    try {
      const receipt = await supplyChain.methods.verifyVendor(vendorId).send({ from: currentAccount })
      if (receipt) {
        alert('Vendor verified successfully!')
        loadBlockchainData()
      }
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error verifying vendor')
    }
  }

  const handleRateVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const receipt = await supplyChain.methods.rateVendor(
        ratingForm.vendorId,
        ratingForm.rating
      ).send({ from: currentAccount })
      
      if (receipt) {
        alert('Vendor rated successfully!')
        loadBlockchainData()
      }
    } catch (err: any) {
      console.error('Error:', err)
      alert(err?.message || 'Error rating vendor')
    }
  }

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return 'N/A'
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  const formatRating = (rating: string) => {
    const r = parseInt(rating)
    return (r / 10).toFixed(1)
  }

  const getRatingStars = (rating: string) => {
    const r = parseInt(rating) / 10
    const fullStars = Math.floor(r)
    const hasHalf = r % 1 >= 0.5
    return { fullStars, hasHalf, emptyStars: 5 - fullStars - (hasHalf ? 1 : 0) }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Loading Vendor Data...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Vendor Management</h1>
                <p className="text-gray-600 text-sm">Manage Raw Material Suppliers with full transparency</p>
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

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Vendor List ({vendors.length})
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('add')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'add'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ➕ Add New Vendor
              </button>
            )}
            {selectedVendor && (
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  activeTab === 'details'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔍 Vendor Details
              </button>
            )}
          </div>
        </div>

        {/* Vendor List Tab */}
        {activeTab === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Vendors Registered</h3>
                <p className="text-gray-500">Add your first vendor to get started</p>
              </div>
            ) : (
              vendors.map((vendor, index) => {
                const stats = vendorStats[vendor.id] || {}
                const { fullStars, hasHalf, emptyStars } = getRatingStars(stats.rating || '30')
                
                return (
                  <div
                    key={vendor.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-l-4 border-blue-500 cursor-pointer"
                    onClick={() => {
                      setSelectedVendor(vendor)
                      setActiveTab('details')
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-2xl">
                          🏭
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{vendor.name}</h3>
                          <p className="text-sm text-gray-500">ID: #{vendor.id}</p>
                        </div>
                      </div>
                      {stats.isVerified && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-center">
                        <span className="mr-2">📍</span> {vendor.place || 'Location not set'}
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">📦</span> {vendor.materialTypes || 'General Materials'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        {Array(fullStars).fill(0).map((_, i) => (
                          <span key={`full-${i}`} className="text-yellow-400">★</span>
                        ))}
                        {hasHalf && <span className="text-yellow-400">☆</span>}
                        {Array(emptyStars).fill(0).map((_, i) => (
                          <span key={`empty-${i}`} className="text-gray-300">★</span>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({formatRating(stats.rating || '30')})</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {stats.totalOrders || 0} orders
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Add Vendor Tab */}
        {activeTab === 'add' && isOwner && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3">➕</span> Register New Vendor
            </h2>
            <form onSubmit={handleAddVendor} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ethereum Address *
                  </label>
                  <input
                    type="text"
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0x..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={newVendor.place}
                    onChange={(e) => setNewVendor({ ...newVendor, place: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, Country"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Info
                  </label>
                  <input
                    type="text"
                    value={newVendor.contactInfo}
                    onChange={(e) => setNewVendor({ ...newVendor, contactInfo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email or Phone"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Material Types Supplied
                  </label>
                  <input
                    type="text"
                    value={newVendor.materialTypes}
                    onChange={(e) => setNewVendor({ ...newVendor, materialTypes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Chemicals, Metals, Plastics"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
              >
                Register Vendor
              </button>
            </form>
          </div>
        )}

        {/* Vendor Details Tab */}
        {activeTab === 'details' && selectedVendor && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center text-4xl">
                    🏭
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{selectedVendor.name}</h2>
                    <p className="text-gray-500">Vendor ID: #{selectedVendor.id}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{selectedVendor.addr}</p>
                  </div>
                </div>
                {vendorStats[selectedVendor.id]?.isVerified ? (
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    ✓ Verified Supplier
                  </span>
                ) : (
                  isOwner && (
                    <button
                      onClick={() => handleVerifyVendor(selectedVendor.id)}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors"
                    >
                      Verify This Vendor
                    </button>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <p className="text-sm text-blue-600 font-semibold">Location</p>
                  <p className="text-lg font-bold text-gray-800">{selectedVendor.place || 'Not Set'}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <p className="text-sm text-green-600 font-semibold">Contact</p>
                  <p className="text-lg font-bold text-gray-800">{selectedVendor.contactInfo || 'Not Set'}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <p className="text-sm text-purple-600 font-semibold">Materials</p>
                  <p className="text-lg font-bold text-gray-800">{selectedVendor.materialTypes || 'General'}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                  <p className="text-sm text-orange-600 font-semibold">Registered</p>
                  <p className="text-lg font-bold text-gray-800">{formatTimestamp(selectedVendor.registeredAt)}</p>
                </div>
              </div>

              {/* Performance Stats */}
              <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border-2 border-blue-200 rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-blue-600">{vendorStats[selectedVendor.id]?.totalOrders || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Total Orders</p>
                </div>
                <div className="bg-white border-2 border-green-200 rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-green-600">{vendorStats[selectedVendor.id]?.completedOrders || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Completed</p>
                </div>
                <div className="bg-white border-2 border-purple-200 rounded-xl p-6 text-center">
                  <p className="text-4xl font-bold text-purple-600">{vendorStats[selectedVendor.id]?.totalQuantitySupplied || 0}</p>
                  <p className="text-sm text-gray-600 mt-2">Qty Supplied</p>
                </div>
                <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-yellow-600">
                    {formatRating(vendorStats[selectedVendor.id]?.rating || '30')}
                  </div>
                  <div className="flex justify-center mt-2">
                    {(() => {
                      const { fullStars, hasHalf, emptyStars } = getRatingStars(vendorStats[selectedVendor.id]?.rating || '30')
                      return (
                        <>
                          {Array(fullStars).fill(0).map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                          {hasHalf && <span className="text-yellow-400">☆</span>}
                          {Array(emptyStars).fill(0).map((_, i) => <span key={i} className="text-gray-300">★</span>)}
                        </>
                      )
                    })()}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Rating</p>
                </div>
              </div>

              {/* Rate Vendor Form (Owner Only) */}
              {isOwner && (
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Rate This Vendor</h4>
                  <form onSubmit={handleRateVendor} className="flex items-center space-x-4">
                    <input type="hidden" value={selectedVendor.id} />
                    <select
                      value={ratingForm.rating}
                      onChange={(e) => setRatingForm({ vendorId: selectedVendor.id, rating: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="10">1.0 ⭐</option>
                      <option value="15">1.5 ⭐</option>
                      <option value="20">2.0 ⭐⭐</option>
                      <option value="25">2.5 ⭐⭐</option>
                      <option value="30">3.0 ⭐⭐⭐</option>
                      <option value="35">3.5 ⭐⭐⭐</option>
                      <option value="40">4.0 ⭐⭐⭐⭐</option>
                      <option value="45">4.5 ⭐⭐⭐⭐</option>
                      <option value="50">5.0 ⭐⭐⭐⭐⭐</option>
                    </select>
                    <button
                      type="submit"
                      onClick={() => setRatingForm({ ...ratingForm, vendorId: selectedVendor.id })}
                      className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all"
                    >
                      Submit Rating
                    </button>
                  </form>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedVendor(null)
                setActiveTab('list')
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              ← Back to Vendor List
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
