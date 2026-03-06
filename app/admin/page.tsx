'use client'
import { useState } from 'react'

export default function AdminPage() {
  const [code, setCode] = useState('')
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  )
  const [error, setError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const login = async () => {
    const res = await fetch('/api/admin-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    if (data.ok) {
      localStorage.setItem('admin_token', data.token)
      setToken(data.token)
      setError('')
    } else {
      setError('Invalid code. Try again.')
    }
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    const formData = new FormData()
    formData.append('pdf', file)
    const res = await fetch('/api/analyze', { method: 'POST', body: formData })
    const data = await res.json()
    setResult(data.result || data.error)
    setLoading(false)
  }

  if (!token) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-sm w-80">
        <h1 className="text-xl font-bold mb-4">Admin Access</h1>
        <p className="text-gray-500 text-sm mb-4">Enter your Google Authenticator code for Woodcraft</p>
        <input
          className="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest mb-3 font-mono"
          maxLength={6} value={code} onChange={e => setCode(e.target.value)}
          placeholder="000000" onKeyDown={e => e.key === 'Enter' && login()}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button onClick={login} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium">
          Verify
        </button>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin — Free Analysis</h1>
          <button onClick={() => { localStorage.removeItem('admin_token'); setToken(null) }}
            className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4" />
          <button onClick={analyze} disabled={!file || loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
            {loading ? 'Analyzing...' : 'Analyze Free'}
          </button>
          {result && <div className="mt-6 text-gray-700 whitespace-pre-wrap leading-relaxed">{result}</div>}
        </div>
      </div>
    </main>
  )
}
