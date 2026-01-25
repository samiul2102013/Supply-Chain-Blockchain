'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)

  const menuItems = [
    {
      path: '/roles',
      title: 'Participants',
      description: 'Manage vendors, manufacturers, distributors & retailers',
      icon: '👥',
    },
    {
      path: '/materials',
      title: 'Materials',
      description: 'Track raw material inventory and quantities',
      icon: '📦',
    },
    {
      path: '/addmed',
      title: 'Products',
      description: 'Create products and assign materials',
      icon: '🏭',
    },
    {
      path: '/supply',
      title: 'Supply Chain',
      description: 'Manufacturing, distribution & retail',
      icon: '🚚',
    },
    {
      path: '/track',
      title: 'Track',
      description: 'Full product traceability with QR codes',
      icon: '🔍',
    },
    {
      path: '/team',
      title: 'Our Team',
      description: 'Meet the developers behind this project',
      icon: '👨‍💻',
    },
  ]

  const features = [
    { icon: '🔐', title: 'Immutable', desc: 'Blockchain secured records' },
    { icon: '📊', title: 'Transparent', desc: 'Real-time tracking' },
    { icon: '⚡', title: 'Automated', desc: 'Smart contract powered' },
  ]

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛓️</span>
            <span className="font-semibold text-lg">SupplyChain</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            {menuItems.slice(0, 5).map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="hover:text-white transition-colors"
              >
                {item.title}
              </button>
            ))}
          </div>
          <button 
            onClick={() => router.push('/team')}
            className="text-sm px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            Team
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Deployed on Sepolia Testnet
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6">
            Supply Chain
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              on Blockchain
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Complete traceability from raw materials to consumer. 
            Every transaction recorded immutably on Ethereum.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/track')}
              className="px-8 py-4 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-all hover:scale-105"
            >
              Track a Product
            </button>
            <button
              onClick={() => router.push('/roles')}
              className="px-8 py-4 rounded-full bg-white/10 border border-white/20 font-medium hover:bg-white/20 transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-12 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-medium">{f.title}</p>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Cards */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-4">
            Everything you need
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            A complete blockchain solution for supply chain management
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => router.push(item.path)}
                onMouseEnter={() => setHovered(item.path)}
                onMouseLeave={() => setHovered(null)}
                className={`
                  group relative p-6 rounded-2xl cursor-pointer
                  bg-white/[0.03] border border-white/10
                  hover:bg-white/[0.06] hover:border-white/20
                  transition-all duration-300
                  ${hovered === item.path ? 'scale-[1.02]' : ''}
                `}
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.description}
                </p>
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">
            How it works
          </h2>
          
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50 hidden md:block"></div>
            
            <div className="space-y-8">
              {[
                { step: 1, title: 'Register Participants', desc: 'Admin registers vendors, manufacturers, distributors, retailers' },
                { step: 2, title: 'Add Materials', desc: 'Vendors supply raw materials to the inventory' },
                { step: 3, title: 'Create Product', desc: 'Admin creates product orders with target quantities' },
                { step: 4, title: 'Select Materials', desc: 'Manufacturer selects materials (auto-deducts from inventory)' },
                { step: 5, title: 'Manufacturing', desc: 'Production begins with full material traceability' },
                { step: 6, title: 'Distribution', desc: 'Distributor handles logistics and delivery' },
                { step: 7, title: 'Retail & Sale', desc: 'Consumer purchase with complete history' },
              ].map((item, idx) => (
                <div key={item.step} className={`flex items-center gap-6 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                  <div className={`flex-1 ${idx % 2 === 1 ? 'md:text-right' : ''}`}>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-gray-400 mb-2">
                      Step {item.step}
                    </div>
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center font-medium text-sm shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-400 mb-8">
            Connect your MetaMask wallet and start tracking your supply chain today.
          </p>
          <button
            onClick={() => router.push('/roles')}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-medium hover:opacity-90 transition-all hover:scale-105"
          >
            Launch App →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">⛓️</span>
              <span className="font-medium">SupplyChain DApp</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="hover:text-white transition-colors"
                >
                  {item.title}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-500">
              IP Department • 2021
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-gray-600">
            Built with Ethereum, Solidity, Next.js & Web3.js
          </div>
        </div>
      </footer>
    </div>
  )
}
