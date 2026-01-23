'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface TeamMember {
  name: string
  id: string
  image: string
  role: string
  contribution: string
}

const teamMembers: TeamMember[] = [
  {
    name: 'Rahul Ahmed',
    id: 'IP-2105018',
    image: '/team/Rahul.jpeg',
    role: 'Project Lead & Backend Developer',
    contribution: 'Smart Contract Development, System Architecture'
  },
  {
    name: 'Ahmed Fahim',
    id: 'IP-2105065',
    image: '/team/Fahim.jpeg',
    role: 'Frontend Developer',
    contribution: 'UI/UX Design, React Components'
  },
  {
    name: 'Rifat Ahmed',
    id: 'IP-2105089',
    image: '/team/rifat.PNG',
    role: 'Blockchain Developer',
    contribution: 'Web3 Integration, Contract Testing'
  },
  {
    name: 'Md. Shamsuddin Iqbal',
    id: 'IP-2105070',
    image: '/team/samsu.jpeg',
    role: 'Full Stack Developer',
    contribution: 'Database Design, API Integration'
  }
]

export default function TeamPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <button
            onClick={() => router.push('/')}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-blue-400 text-sm font-medium">👨‍💻 Development Team</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Meet Our Team
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The talented individuals behind the Supply Chain Blockchain Management System
            </p>
          </div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 h-full border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                {/* Profile Image */}
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-50"></div>
                  <div className="relative w-36 h-36 mx-auto rounded-full overflow-hidden border-4 border-gray-700 group-hover:border-blue-500/50 transition-colors">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 144px, 144px"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {member.name}
                  </h3>
                  <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1 mb-3">
                    <span className="text-blue-400 text-sm font-mono">{member.id}</span>
                  </div>
                  <p className="text-purple-400 font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-gray-400 text-sm">{member.contribution}</p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-8 h-8 border border-blue-500/20 rounded-lg rotate-12 group-hover:rotate-45 transition-transform"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 border border-purple-500/20 rounded-full group-hover:scale-150 transition-transform"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Project Info Section */}
        <div className="mt-20">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  About This Project
                </h2>
                <p className="text-gray-400 max-w-3xl mx-auto">
                  A blockchain-based supply chain management system built with Solidity, Hardhat, Next.js, and Web3.js. 
                  This decentralized application enables transparent tracking of products from raw materials to final sale.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-3xl mb-2">⛓️</div>
                  <p className="text-gray-300 font-semibold">Blockchain</p>
                  <p className="text-gray-500 text-sm">Ethereum / Solidity</p>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-3xl mb-2">⚛️</div>
                  <p className="text-gray-300 font-semibold">Frontend</p>
                  <p className="text-gray-500 text-sm">Next.js / React</p>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-3xl mb-2">🔧</div>
                  <p className="text-gray-300 font-semibold">Tools</p>
                  <p className="text-gray-500 text-sm">Hardhat / Ganache</p>
                </div>
                <div className="text-center p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-3xl mb-2">🦊</div>
                  <p className="text-gray-300 font-semibold">Wallet</p>
                  <p className="text-gray-500 text-sm">MetaMask</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <span className="text-2xl">🎓</span>
            <span>IP Department • Batch 2021</span>
            <span className="text-2xl">🎓</span>
          </div>
        </div>
      </div>
    </div>
  )
}
