'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface TeamMember {
  name: string
  id: string
  image: string
  role: string
  skills: string[]
}

const teamMembers: TeamMember[] = [
  {
    name: 'Rahul Ahmed',
    id: 'IP-2105018',
    image: '/team/Rahul.jpeg',
    role: 'Project Lead',
    skills: ['Smart Contracts', 'Solidity', 'Architecture']
  },
  {
    name: 'Ahmed Fahim',
    id: 'IP-2105065',
    image: '/team/Fahim.jpeg',
    role: 'Frontend Developer',
    skills: ['React', 'Next.js', 'UI/UX']
  },
  {
    name: 'Rifat Ahmed',
    id: 'IP-2105089',
    image: '/team/rifat.PNG',
    role: 'Blockchain Developer',
    skills: ['Web3.js', 'Ethereum', 'Testing']
  },
  {
    name: 'Md. Shamsuddin Iqbal',
    id: 'IP-2105070',
    image: '/team/samsu.jpeg',
    role: 'Full Stack Developer',
    skills: ['Node.js', 'TypeScript', 'APIs']
  }
]

export default function TeamPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">⛓️</span>
            <span className="font-medium">SupplyChain</span>
          </div>
          <div className="w-16"></div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 mb-6">
            <span>👨‍💻</span>
            <span>The Team</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
            Built by students,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              for the future
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Four passionate developers working together to bring blockchain technology to supply chain management.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]"
              >
                {/* Gradient orb */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative flex items-start gap-6">
                  {/* Image */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-white/10 group-hover:ring-white/20 transition-all">
                      <Image
                        src={member.image}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-purple-400 text-sm font-medium mb-1">
                      {member.role}
                    </p>
                    <p className="text-gray-500 text-xs font-mono mb-4">
                      {member.id}
                    </p>
                    
                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {member.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Info */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">About This Project</h2>
              <p className="text-gray-400 text-sm max-w-xl mx-auto">
                A decentralized supply chain management system that ensures complete transparency and traceability using blockchain technology.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '⛓️', label: 'Blockchain', value: 'Ethereum' },
                { icon: '📜', label: 'Contracts', value: 'Solidity' },
                { icon: '⚛️', label: 'Frontend', value: 'Next.js' },
                { icon: '🔗', label: 'Web3', value: 'Web3.js' },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-2xl bg-white/5">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* University Info */}
      <section className="py-16 px-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <span className="text-2xl">🎓</span>
            <div className="text-left">
              <p className="text-sm font-medium">IP Department</p>
              <p className="text-xs text-gray-500">Batch 2021</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 Supply Chain Blockchain DApp
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            Back to Application
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  )
}
