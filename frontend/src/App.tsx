import { useEffect, useState } from 'react'
import { Moon, Sun, Shield, Zap, Code2, ArrowRight, Sparkles, Lock, Users, Search, X, Copy, Check } from 'lucide-react'
import { connect, disconnect, isConnected, getLocalStorage, request } from '@stacks/connect'
import { Cl, Pc } from '@stacks/transactions'

import './index.css'


// Contract Configuration - network-aware
const CONTRACTS = {
  testnet: {
    address: import.meta.env.VITE_TESTNET_CONTRACT_ADDRESS || 'ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT',
    name: 'template-access-nft-v2'
  },
  mainnet: {
    address: import.meta.env.VITE_MAINNET_CONTRACT_ADDRESS || 'SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV',
    name: 'template-access-nft-v2'
  }
}

const MINT_PRICE = 100000 // 0.1 STX in microstacks


// Types
interface Template {
  id: number
  name: string
  category: string
  difficulty: string
  description: string
  features: string[]
  preview: string
  code?: string
}


function App() {
  // Theme - uses CSS media query, no localStorage needed
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  // Auth state - pure React state, no localStorage
  const [isLoading, setIsLoading] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet')

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  // Minting state
  const [mintingId, setMintingId] = useState<number | null>(null)
  const [ownedTemplates, setOwnedTemplates] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

  const categories = ['DeFi', 'NFT', 'DAO', 'Gaming', 'Security', 'Utility', 'Social', 'Identity']

  // Initialize app - check existing session and load templates
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true)
      document.documentElement.dataset.theme = theme

      // Minimum loading time for smooth UX (prevents flash)
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 800))

      // Check for existing wallet session using @stacks/connect v8 API
      let restoredAddress: string | null = null
      if (isConnected()) {
        try {
          const storage = getLocalStorage() as any
          // v8 format: storage.addresses.stx is an array
          if (storage?.addresses?.stx?.length > 0) {
            restoredAddress = storage.addresses.stx[0].address
            if (restoredAddress) {
              setUserAddress(restoredAddress)
            }
          }
        } catch (e) {
          // Storage read failed - user will need to reconnect
        }
      }

      // Load templates and wait for minimum time
      await Promise.all([loadTemplates(), minLoadTime])

      // Check on-chain ownership if user was restored
      if (restoredAddress) {
        checkOwnershipForAddress(restoredAddress)
      }

      setIsLoading(false)
    }

    initApp()
  }, [])





  // Update theme in DOM when it changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // Filter templates
  useEffect(() => {
    let filtered = [...templates]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.features.some(f => f.toLowerCase().includes(query))
      )
    }

    // Handle "Owned" as special filter - shows only user's minted templates
    if (selectedCategory === 'Owned') {
      filtered = filtered.filter(t => ownedTemplates.has(t.id))
    } else if (selectedCategory) {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    setFilteredTemplates(filtered)
  }, [templates, searchQuery, selectedCategory, ownedTemplates])


  const loadTemplates = async () => {
    try {
      const res = await fetch('/templates.json')
      const data = await res.json()
      setTemplates(data)
      setFilteredTemplates(data)
    } catch (e) {
      console.error('Failed to load templates:', e)
    }
  }

  // Check on-chain ownership for a user by querying has-access for each template
  const checkOwnershipForAddress = async (address: string) => {

    const contract = CONTRACTS[network]
    if (!contract.address) return

    const owned = new Set<number>()
    const apiUrl = network === 'mainnet'
      ? 'https://api.hiro.so'
      : 'https://api.testnet.hiro.so'

    // Check ownership for templates 1-50 in parallel batches
    const checkTemplate = async (templateId: number): Promise<boolean> => {
      try {
        const response = await fetch(
          `${apiUrl}/v2/contracts/call-read/${contract.address}/${contract.name}/has-access`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: address,
              arguments: [
                Cl.serialize(Cl.principal(address)),
                Cl.serialize(Cl.uint(templateId))
              ]
            })
          }
        )
        const data = await response.json()
        // Result is a boolean in Clarity Value format
        return data.result === '0x03' // true in CV hex
      } catch {
        return false
      }
    }

    // Check templates in batches of 10 to avoid overwhelming the API
    for (let batch = 0; batch < 5; batch++) {
      const promises = []
      for (let i = 1; i <= 10; i++) {
        const templateId = batch * 10 + i
        if (templateId <= 50) {
          promises.push(
            checkTemplate(templateId).then(hasAccess => {
              if (hasAccess) owned.add(templateId)
            })
          )
        }
      }
      await Promise.all(promises)
    }

    setOwnedTemplates(owned)
    console.log('Owned templates:', Array.from(owned))
  }


  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleConnect = async () => {
    try {
      setIsLoading(true)

      // connect() is an alias for request('getAddresses', {forceWalletSelect: true})
      // It automatically caches the user's address in local storage per v8 docs
      await connect()

      // After connect(), use isConnected() and getLocalStorage() to get address
      if (isConnected()) {
        const storage = getLocalStorage() as any
        if (storage?.addresses?.stx?.length > 0) {
          const address = storage.addresses.stx[0].address
          setUserAddress(address)
          // Check on-chain ownership for the newly connected user
          checkOwnershipForAddress(address)
        }
      }
    } catch (error) {
      console.error('Connection error:', error)
    } finally {
      setIsLoading(false)
    }
  }



  const handleDisconnect = () => {
    disconnect()
    setUserAddress(null)
    setOwnedTemplates(new Set())
  }

  const handleMint = async (templateId: number) => {
    if (!userAddress) return

    const contract = CONTRACTS[network]
    if (!contract.address) {
      console.error('No contract address configured for', network)
      return
    }

    setMintingId(templateId)
    try {
      // Build post-condition to show STX transfer in wallet
      // This tells the wallet the user will send exactly MINT_PRICE STX
      const postConditions = [
        Pc.principal(userAddress)
          .willSendEq(MINT_PRICE)
          .ustx()
      ]

      // Real contract call using @stacks/connect request API
      const result = await request('stx_callContract', {
        contract: `${contract.address}.${contract.name}`,
        functionName: 'mint',
        functionArgs: [Cl.uint(templateId)],
        postConditions,
      } as any)

      console.log('Mint result:', result)

      // Only mark as owned if transaction was successful
      const txResult = result as any
      if (txResult && txResult.txid) {
        console.log('Transaction broadcast successful:', txResult.txid)
        // Optimistically add after successful broadcast
        setOwnedTemplates(prev => new Set([...prev, templateId]))
      } else {
        console.log('Transaction may have been cancelled:', result)
      }
    } catch (error) {
      console.error('Mint error:', error)
      // Don't add to owned templates on error
    } finally {
      setMintingId(null)
    }
  }






  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-foreground/60">Connecting wallet...</p>
        </div>
      </div>
    )
  }

  // Landing page (not connected)
  if (!userAddress) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="Clarity Hub" className="w-10 h-10" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">Clarity Hub</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">v1.0</span>
                  </div>
                  <p className="text-xs text-foreground/60">Premium Smart Contract Templates</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-primary" />
                    <span>0.1 STX per NFT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    <span>SIP-009 Compliant</span>
                  </div>
                </div>
                <button onClick={toggleTheme} className="p-2 rounded-lg border border-border hover:bg-card transition-colors">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4">
          <div className="py-20 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Sparkles size={16} />
              Premium Smart Contract Templates
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Build on Bitcoin with<br />Clarity 4
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto mb-8">
              Access production-ready smart contract templates. Mint an NFT for just 0.1 STX to unlock full code.
            </p>
            <button onClick={handleConnect} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg">
              Connect Wallet to Start <ArrowRight size={20} />
            </button>
          </div>

          <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Audited</h3>
              <p className="text-foreground/70">Best practices with Clarity 4 security features.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Production Ready</h3>
              <p className="text-foreground/70">Deploy immediately or customize to your needs.</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="text-primary" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">In-Browser Editor</h3>
              <p className="text-foreground/70">Edit contracts with syntax highlighting.</p>
            </div>
          </div>

          <div className="py-16">
            <h2 className="text-3xl font-bold text-center mb-12">Template Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <div key={cat} className="bg-card border border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                  <span className="font-semibold">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="py-16 text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl mb-16">
            <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
            <p className="text-lg text-foreground/70 mb-8">Connect your wallet to browse templates.</p>
            <button onClick={handleConnect} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90">
              Connect Wallet <ArrowRight size={20} />
            </button>
          </div>
        </main>

        <footer className="border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-foreground/60">
            <p>Built with Clarity 4 • Secured by Bitcoin</p>
          </div>
        </footer>
      </div>
    )
  }

  // Template Detail Modal
  if (selectedTemplate) {
    const isOwned = ownedTemplates.has(selectedTemplate.id)
    const fullCode = selectedTemplate.code || getFullContractCode(selectedTemplate)

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
                <span className={`px-2 py-1 rounded text-xs font-medium ${selectedTemplate.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                  selectedTemplate.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                  {selectedTemplate.difficulty}
                </span>
              </div>
              <p className="text-foreground/70">{selectedTemplate.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTemplate.features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    <Sparkles size={12} /> {f}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => setSelectedTemplate(null)} className="p-2 hover:bg-background rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {isOwned ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Full Contract Code</h3>
                  <button
                    onClick={() => copyToClipboard(fullCode)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm hover:bg-primary/20"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
                <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                  {fullCode}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12">
                <Lock size={48} className="mx-auto mb-4 text-foreground/40" />
                <h3 className="text-xl font-bold mb-2">Unlock Full Code</h3>
                <p className="text-foreground/70 mb-6">Mint an access NFT to view the complete contract</p>
                <div className="bg-background rounded-lg p-4 mb-6">
                  <p className="font-mono text-sm text-foreground/60">{selectedTemplate.preview}</p>
                </div>
                <button
                  onClick={() => handleMint(selectedTemplate.id)}
                  disabled={mintingId === selectedTemplate.id}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {mintingId === selectedTemplate.id ? 'Minting...' : 'Mint Access NFT (0.1 STX)'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main App - Template Grid
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.svg" alt="Clarity Hub" className="w-10 h-10" />
              <div>
                <span className="text-xl font-bold">Clarity Hub</span>
                <p className="text-xs text-foreground/60">Premium Smart Contract Templates</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1 bg-background rounded-lg p-1.5 border border-border">
                <button
                  onClick={() => setNetwork('testnet')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${network === 'testnet' ? 'bg-primary text-primary-foreground' : 'text-foreground/60 hover:text-foreground'
                    }`}
                >
                  Testnet
                </button>
                <button
                  onClick={() => setNetwork('mainnet')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${network === 'mainnet' ? 'bg-primary text-primary-foreground' : 'text-foreground/60 hover:text-foreground'
                    }`}
                >
                  Mainnet
                </button>
              </div>

              <span className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </span>

              <button onClick={handleDisconnect} className="text-sm text-foreground/60 hover:text-foreground">
                Disconnect
              </button>

              <button onClick={toggleTheme} className="p-2.5 rounded-lg border border-border hover:bg-card transition-colors">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-10">
          <div className="flex gap-3 overflow-x-auto pb-3">

            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors font-medium ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:border-primary'
                }`}
            >
              All
            </button>
            {ownedTemplates.size > 0 && (
              <button
                onClick={() => setSelectedCategory('Owned')}
                className={`px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 font-medium ${selectedCategory === 'Owned' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:border-primary'
                  }`}
              >
                Owned
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                  {ownedTemplates.size}
                </span>
              </button>
            )}
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-lg whitespace-nowrap transition-colors font-medium ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card border border-border hover:border-primary'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {filteredTemplates.map(template => {
            const isOwned = ownedTemplates.has(template.id)
            return (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold mb-1">{template.name}</h3>
                    <p className="text-sm text-foreground/60">{template.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${template.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                    template.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                    {template.difficulty}
                  </span>
                </div>

                <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{template.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {template.features.slice(0, 2).map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      <Sparkles size={10} /> {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {isOwned ? (
                    <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                      <Check size={16} /> Owned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-foreground/60 text-sm">
                      <Lock size={16} /> Locked
                    </span>
                  )}
                  <span className="text-sm text-primary font-medium">View Details →</span>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <p className="text-foreground/60">No templates found.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// Generate full contract code for template
function getFullContractCode(template: Template): string {
  const codes: Record<number, string> = {
    1: `;; Vesting Wallet - Clarity 4
;; Linear vesting with cliff using stacks-block-time

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_OWNER (err u1))
(define-constant ERR_CLIFF (err u2))
(define-constant ERR_NO_VESTING (err u3))

(define-map vestings principal {
  total: uint, claimed: uint, start: uint, cliff: uint, duration: uint
})

(define-public (create-vesting (beneficiary principal) (amount uint) (cliff uint) (duration uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_OWNER)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set vestings beneficiary {
      total: amount, claimed: u0, start: stacks-block-time, cliff: cliff, duration: duration
    })
    (ok true)))

(define-public (claim)
  (let ((v (unwrap! (map-get? vestings tx-sender) ERR_NO_VESTING))
        (elapsed (- stacks-block-time (get start v))))
    (asserts! (>= elapsed (get cliff v)) ERR_CLIFF)
    (let ((vested (if (>= elapsed (get duration v)) (get total v) (/ (* (get total v) elapsed) (get duration v))))
          (claimable (- vested (get claimed v))))
      (map-set vestings tx-sender (merge v { claimed: vested }))
      (as-contract (stx-transfer? claimable tx-sender tx-sender)))))

(define-read-only (get-vesting (user principal)) (map-get? vestings user))`,

    2: `;; Escrow Contract - Clarity 4
;; Secure escrow with restrict-assets?

(define-constant ERR_UNAUTHORIZED (err u1))
(define-constant ERR_INVALID (err u2))

(define-data-var counter uint u0)
(define-map escrows uint { buyer: principal, seller: principal, amount: uint, state: (string-ascii 10), deadline: uint })

(define-public (create-escrow (seller principal) (amount uint) (deadline uint))
  (let ((id (+ (var-get counter) u1)))
    (unwrap! (restrict-assets? tx-sender ((with-stx amount))
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (map-set escrows id { buyer: tx-sender, seller: seller, amount: amount, state: "pending", deadline: (+ stacks-block-time deadline) })
      (var-set counter id)
      (ok id)) ERR_INVALID)))

(define-public (release (id uint))
  (let ((e (unwrap! (map-get? escrows id) ERR_INVALID)))
    (asserts! (is-eq tx-sender (get buyer e)) ERR_UNAUTHORIZED)
    (map-set escrows id (merge e { state: "released" }))
    (as-contract (stx-transfer? (get amount e) tx-sender (get seller e)))))

(define-public (refund (id uint))
  (let ((e (unwrap! (map-get? escrows id) ERR_INVALID)))
    (asserts! (or (is-eq tx-sender (get seller e)) (> stacks-block-time (get deadline e))) ERR_UNAUTHORIZED)
    (map-set escrows id (merge e { state: "refunded" }))
    (as-contract (stx-transfer? (get amount e) tx-sender (get buyer e)))))

(define-read-only (get-escrow (id uint)) (map-get? escrows id))`,

    3: `;; Multi-Sig Wallet - Clarity 4
;; M-of-N approval system

(define-constant ERR_NOT_SIGNER (err u1))
(define-constant ERR_ALREADY (err u2))
(define-constant ERR_THRESHOLD (err u3))
(define-constant REQUIRED u2)

(define-data-var tx-counter uint u0)
(define-map signers principal bool)
(define-map txs uint { to: principal, amount: uint, approvals: uint, executed: bool })
(define-map approvals { tx: uint, signer: principal } bool)

(define-public (submit (to principal) (amount uint))
  (let ((id (+ (var-get tx-counter) u1)))
    (asserts! (default-to false (map-get? signers tx-sender)) ERR_NOT_SIGNER)
    (map-set txs id { to: to, amount: amount, approvals: u0, executed: false })
    (var-set tx-counter id)
    (ok id)))

(define-public (approve (id uint))
  (let ((tx (unwrap! (map-get? txs id) ERR_THRESHOLD)))
    (asserts! (default-to false (map-get? signers tx-sender)) ERR_NOT_SIGNER)
    (asserts! (not (default-to false (map-get? approvals { tx: id, signer: tx-sender }))) ERR_ALREADY)
    (map-set approvals { tx: id, signer: tx-sender } true)
    (map-set txs id (merge tx { approvals: (+ (get approvals tx) u1) }))
    (ok true)))

(define-public (execute (id uint))
  (let ((tx (unwrap! (map-get? txs id) ERR_THRESHOLD)))
    (asserts! (>= (get approvals tx) REQUIRED) ERR_THRESHOLD)
    (asserts! (not (get executed tx)) ERR_ALREADY)
    (map-set txs id (merge tx { executed: true }))
    (as-contract (stx-transfer? (get amount tx) tx-sender (get to tx)))))`,
  }

  if (codes[template.id]) return codes[template.id]

  // Generic template
  return `;; ${template.name} - Clarity 4
;; ${template.description}
;; Category: ${template.category} | Difficulty: ${template.difficulty}
;; Features: ${template.features.join(', ')}

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u1))

(define-data-var counter uint u0)
(define-map records principal { data: uint, timestamp: uint })

(define-public (execute (param uint))
  (begin
    ${template.features.includes('restrict-assets?') ?
      `(unwrap! (restrict-assets? tx-sender ((with-stx param))
      (map-set records tx-sender { data: param, timestamp: stacks-block-time })
      (ok true)) ERR_UNAUTHORIZED)` :
      `(map-set records tx-sender { data: param, timestamp: stacks-block-time })
    (ok true)`}))

(define-read-only (get-record (user principal)) (map-get? records user))
${template.features.includes('stacks-block-time') ? `(define-read-only (get-time) stacks-block-time)` : ''}`
}

export default App
