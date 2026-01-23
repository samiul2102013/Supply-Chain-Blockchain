'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { checkIsOwner, getContractOwner } from '@/lib/contractUtils'

interface Vendor {
  id: string
  addr: string
  name: string
  location: string
  contactInfo: string
  materialTypes: string
  registeredAt: string
  isActive: boolean
}

interface Manufacturer {
  id: string
  addr: string
  name: string
  location: string
  registeredAt: string
}

interface Distributor {
  id: string
  addr: string
  name: string
  location: string
  registeredAt: string
}

interface Retailer {
  id: string
  addr: string
  name: string
  location: string
  registeredAt: string
}

export default function ManageRoles() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [contractOwner, setContractOwner] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'vendors' | 'manufacturers' | 'distributors' | 'retailers'>('vendors')
  
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [retailers, setRetailers] = useState<Retailer[]>([])

  const [vendorForm, setVendorForm] = useState({
    address: '',
    name: '',
    location: '',
    contactInfo: '',
    materialTypes: ''
  })
  
  const [manufacturerForm, setManufacturerForm] = useState({
    address: '',
    name: '',
    location: ''
  })
  
  const [distributorForm, setDistributorForm] = useState({
    address: '',
    name: '',
    location: ''
  })
  
  const [retailerForm, setRetailerForm] = useState({
    address: '',
    name: '',
    location: ''
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

      const vendorCount = await contract.methods.vendorCtr().call()
      const vendorPromises = []
      for (let i = 1; i <= parseInt(vendorCount); i++) {
        vendorPromises.push(contract.methods.vendors(i).call())
      }
      const vendorData = await Promise.all(vendorPromises)
      setVendors(vendorData)

      const manCount = await contract.methods.manufacturerCtr().call()
      const manPromises = []
      for (let i = 1; i <= parseInt(manCount); i++) {
        manPromises.push(contract.methods.manufacturers(i).call())
      }
      const manData = await Promise.all(manPromises)
      setManufacturers(manData)

      const disCount = await contract.methods.distributorCtr().call()
      const disPromises = []
      for (let i = 1; i <= parseInt(disCount); i++) {
        disPromises.push(contract.methods.distributors(i).call())
      }
      const disData = await Promise.all(disPromises)
      setDistributors(disData)

      const retCount = await contract.methods.retailerCtr().call()
      const retPromises = []
      for (let i = 1; i <= parseInt(retCount); i++) {
        retPromises.push(contract.methods.retailers(i).call())
      }
      const retData = await Promise.all(retPromises)
      setRetailers(retData)

      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      const owner = await getContractOwner()
      if (owner) setContractOwner(owner)
      
      setLoading(false)
    } catch (err: any) {
      const errorMessage = err?.message || 'Error loading blockchain data'
      console.error('Error:', err)
      alert(errorMessage)
      setLoading(false)
    }
  }

  const addVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      await supplyChain.methods.addVendor(
        vendorForm.address,
        vendorForm.name,
        vendorForm.location,
        vendorForm.contactInfo,
        vendorForm.materialTypes
      ).send({ from: currentAccount })
      
      setVendorForm({ address: '', name: '', location: '', contactInfo: '', materialTypes: '' })
      loadBlockchainData()
      alert('Vendor added successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error adding vendor')
    }
  }

  const addManufacturer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      await supplyChain.methods.addManufacturer(
        manufacturerForm.address,
        manufacturerForm.name,
        manufacturerForm.location
      ).send({ from: currentAccount })
      
      setManufacturerForm({ address: '', name: '', location: '' })
      loadBlockchainData()
      alert('Manufacturer added successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error adding manufacturer')
    }
  }

  const addDistributor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      await supplyChain.methods.addDistributor(
        distributorForm.address,
        distributorForm.name,
        distributorForm.location
      ).send({ from: currentAccount })
      
      setDistributorForm({ address: '', name: '', location: '' })
      loadBlockchainData()
      alert('Distributor added successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error adding distributor')
    }
  }

  const addRetailer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplyChain || !isOwner) return

    try {
      await supplyChain.methods.addRetailer(
        retailerForm.address,
        retailerForm.name,
        retailerForm.location
      ).send({ from: currentAccount })
      
      setRetailerForm({ address: '', name: '', location: '' })
      loadBlockchainData()
      alert('Retailer added successfully!')
    } catch (err: any) {
      console.error(err)
      alert(err?.message || 'Error adding retailer')
    }
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp === '0') return 'N/A'
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString()
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
          <h1 className="text-3xl font-bold">Manage Participants</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            ← Back to Home
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-gray-300">Connected: <span className="text-blue-400">{currentAccount}</span></p>
          <p className="text-gray-300">Contract Owner: <span className="text-green-400">{contractOwner}</span></p>
          {isOwner && <span className="text-green-500 font-bold">(You are the Admin)</span>}
        </div>

        <div className="flex space-x-4 mb-6 overflow-x-auto">
          {(['vendors', 'manufacturers', 'distributors', 'retailers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tab} ({tab === 'vendors' ? vendors.length : tab === 'manufacturers' ? manufacturers.length : tab === 'distributors' ? distributors.length : retailers.length})
            </button>
          ))}
        </div>

        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {isOwner && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Add New Vendor</h2>
                <form onSubmit={addVendor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Wallet Address (0x...)"
                    value={vendorForm.address}
                    onChange={(e) => setVendorForm({...vendorForm, address: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Vendor Name"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({...vendorForm, name: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={vendorForm.location}
                    onChange={(e) => setVendorForm({...vendorForm, location: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contact Info"
                    value={vendorForm.contactInfo}
                    onChange={(e) => setVendorForm({...vendorForm, contactInfo: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Material Types (e.g., Chemicals, Electronics)"
                    value={vendorForm.materialTypes}
                    onChange={(e) => setVendorForm({...vendorForm, materialTypes: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white md:col-span-2"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold md:col-span-2"
                  >
                    Add Vendor
                  </button>
                </form>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Registered Vendors ({vendors.length})</h2>
              {vendors.length === 0 ? (
                <p className="text-gray-400">No vendors registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Location</th>
                        <th className="px-4 py-2 text-left">Material Types</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((v) => (
                        <tr key={v.id} className="border-b border-gray-700">
                          <td className="px-4 py-2">{v.id}</td>
                          <td className="px-4 py-2">{v.name}</td>
                          <td className="px-4 py-2">{v.location}</td>
                          <td className="px-4 py-2">{v.materialTypes}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded ${v.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                              {v.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-2">{formatDate(v.registeredAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'manufacturers' && (
          <div className="space-y-6">
            {isOwner && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Add New Manufacturer</h2>
                <form onSubmit={addManufacturer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Wallet Address (0x...)"
                    value={manufacturerForm.address}
                    onChange={(e) => setManufacturerForm({...manufacturerForm, address: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer Name"
                    value={manufacturerForm.name}
                    onChange={(e) => setManufacturerForm({...manufacturerForm, name: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={manufacturerForm.location}
                    onChange={(e) => setManufacturerForm({...manufacturerForm, location: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold md:col-span-3"
                  >
                    Add Manufacturer
                  </button>
                </form>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Registered Manufacturers ({manufacturers.length})</h2>
              {manufacturers.length === 0 ? (
                <p className="text-gray-400">No manufacturers registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Location</th>
                        <th className="px-4 py-2 text-left">Address</th>
                        <th className="px-4 py-2 text-left">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manufacturers.map((m) => (
                        <tr key={m.id} className="border-b border-gray-700">
                          <td className="px-4 py-2">{m.id}</td>
                          <td className="px-4 py-2">{m.name}</td>
                          <td className="px-4 py-2">{m.location}</td>
                          <td className="px-4 py-2 text-xs">{m.addr}</td>
                          <td className="px-4 py-2">{formatDate(m.registeredAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'distributors' && (
          <div className="space-y-6">
            {isOwner && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Add New Distributor</h2>
                <form onSubmit={addDistributor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Wallet Address (0x...)"
                    value={distributorForm.address}
                    onChange={(e) => setDistributorForm({...distributorForm, address: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Distributor Name"
                    value={distributorForm.name}
                    onChange={(e) => setDistributorForm({...distributorForm, name: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={distributorForm.location}
                    onChange={(e) => setDistributorForm({...distributorForm, location: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold md:col-span-3"
                  >
                    Add Distributor
                  </button>
                </form>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Registered Distributors ({distributors.length})</h2>
              {distributors.length === 0 ? (
                <p className="text-gray-400">No distributors registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Location</th>
                        <th className="px-4 py-2 text-left">Address</th>
                        <th className="px-4 py-2 text-left">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distributors.map((d) => (
                        <tr key={d.id} className="border-b border-gray-700">
                          <td className="px-4 py-2">{d.id}</td>
                          <td className="px-4 py-2">{d.name}</td>
                          <td className="px-4 py-2">{d.location}</td>
                          <td className="px-4 py-2 text-xs">{d.addr}</td>
                          <td className="px-4 py-2">{formatDate(d.registeredAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'retailers' && (
          <div className="space-y-6">
            {isOwner && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Add New Retailer</h2>
                <form onSubmit={addRetailer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Wallet Address (0x...)"
                    value={retailerForm.address}
                    onChange={(e) => setRetailerForm({...retailerForm, address: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Retailer Name"
                    value={retailerForm.name}
                    onChange={(e) => setRetailerForm({...retailerForm, name: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={retailerForm.location}
                    onChange={(e) => setRetailerForm({...retailerForm, location: e.target.value})}
                    className="bg-gray-700 rounded-lg px-4 py-2 text-white"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold md:col-span-3"
                  >
                    Add Retailer
                  </button>
                </form>
              </div>
            )}

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Registered Retailers ({retailers.length})</h2>
              {retailers.length === 0 ? (
                <p className="text-gray-400">No retailers registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Location</th>
                        <th className="px-4 py-2 text-left">Address</th>
                        <th className="px-4 py-2 text-left">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {retailers.map((r) => (
                        <tr key={r.id} className="border-b border-gray-700">
                          <td className="px-4 py-2">{r.id}</td>
                          <td className="px-4 py-2">{r.name}</td>
                          <td className="px-4 py-2">{r.location}</td>
                          <td className="px-4 py-2 text-xs">{r.addr}</td>
                          <td className="px-4 py-2">{formatDate(r.registeredAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {!isOwner && (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 mt-6">
            <p className="text-yellow-300">
              ⚠️ Only the contract owner can add new participants. Connect with the owner account to add vendors, manufacturers, distributors, or retailers.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
