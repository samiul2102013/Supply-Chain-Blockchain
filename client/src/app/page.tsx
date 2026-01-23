'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)

  const menuItems = [
    {
      path: '/roles',
      title: 'Manage Participants',
      description: 'Add vendors, manufacturers, distributors & retailers',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      hoverGradient: 'from-blue-600 to-cyan-600',
    },
    {
      path: '/materials',
      title: 'Material Inventory',
      description: 'Manage raw materials with quantity tracking',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-teal-500 to-green-500',
      hoverGradient: 'from-teal-600 to-green-600',
    },
    {
      path: '/addmed',
      title: 'Products & Orders',
      description: 'Create products and assign materials',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
      hoverGradient: 'from-green-600 to-emerald-600',
    },
    {
      path: '/supply',
      title: 'Supply Chain',
      description: 'Manufacturing, distribution & retail operations',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500',
      hoverGradient: 'from-orange-600 to-red-600',
    },
    {
      path: '/track',
      title: 'Track Products',
      description: 'Full traceability from vendor to consumer',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'from-purple-600 to-pink-600',
    },
  ]

  const workflowSteps = [
    { step: 1, title: 'Register Participants', desc: 'Admin adds vendors, manufacturers, distributors, retailers' },
    { step: 2, title: 'Add Materials', desc: 'Vendors supply raw materials with quantity & pricing' },
    { step: 3, title: 'Create Product', desc: 'Admin creates product orders' },
    { step: 4, title: 'Assign Materials', desc: 'Admin assigns materials to products (auto-deducts inventory)' },
    { step: 5, title: 'Manufacturing', desc: 'Manufacturer starts production' },
    { step: 6, title: 'Distribution', desc: 'Distributor picks up for delivery' },
    { step: 7, title: 'Retail & Sale', desc: 'Retailer receives and sells to consumer' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400">
                Supply Chain
              </span>
              <br />
              <span className="text-white">Blockchain DApp</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Full traceability from vendor materials to consumer purchase. 
              Every step recorded on the blockchain for transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white text-center mb-8">📋 Supply Chain Workflow</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {workflowSteps.map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <div className="bg-gray-800 rounded-lg p-3 text-center min-w-[140px]">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  {item.step}
                </div>
                <p className="text-white text-sm font-semibold">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
              {idx < workflowSteps.length - 1 && (
                <span className="text-gray-500 mx-1">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => router.push(item.path)}
              onMouseEnter={() => setHovered(item.path)}
              onMouseLeave={() => setHovered(null)}
              className={`
                relative overflow-hidden rounded-2xl p-6 cursor-pointer
                transform transition-all duration-300
                ${hovered === item.path ? 'scale-105 shadow-2xl' : 'scale-100 shadow-lg'}
                bg-gradient-to-br ${hovered === item.path ? item.hoverGradient : item.gradient}
              `}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="text-white/90 mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm">{item.description}</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-lg font-bold text-white mb-2">Immutable Records</h3>
            <p className="text-gray-400 text-sm">
              Every transaction is permanently recorded on the blockchain
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">Auto Inventory</h3>
            <p className="text-gray-400 text-sm">
              Material quantities automatically adjust when assigned to products
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-white mb-2">Full Traceability</h3>
            <p className="text-gray-400 text-sm">
              Track every material and product back to its vendor source
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div 
          onClick={() => router.push('/team')}
          className="relative overflow-hidden rounded-2xl p-8 cursor-pointer bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">👨‍💻 Meet Our Team</h3>
              <p className="text-white/80">The developers behind this blockchain supply chain system</p>
            </div>
            <div className="text-white/80">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">
            Built with Ethereum, Solidity, Next.js & Web3.js
          </p>
          <p className="text-gray-500 text-sm mt-2">
            IP Department • Batch 2021
          </p>
        </div>
      </footer>
    </div>
  )
}
