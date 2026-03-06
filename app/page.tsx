'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
    setResult(null)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)

    try {
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      })
      const { url } = await checkoutRes.json()
      window.location.href = url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Understand Your Blood Test</h1>
          <p className="text-xl text-gray-600 mb-2">Upload your lab results. Get a plain English explanation in seconds.</p>
          <p className="text-gray-500">No medical jargon. No Googling each value. Just clear answers.</p>
        </div>

        <div className="flex justify-center mb-8">
          <span className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            $4.99 per scan — one time, no subscription
          </span>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive ? 'border-indigo-400 bg-indigo-50' :
            file ? 'border-green-400 bg-green-50' :
            'border-gray-300 bg-white hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div>
              <div className="text-green-600 text-5xl mb-3">✓</div>
              <p className="text-green-700 font-medium">{file.name}</p>
              <p className="text-gray-500 text-sm mt-1">Click to change file</p>
            </div>
          ) : (
            <div>
              <div className="text-gray-400 text-5xl mb-3">📄</div>
              <p className="text-gray-600 font-medium">Drop your blood test PDF here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
            </div>
          )}
        </div>

        {file && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors mb-4"
          >
            {loading ? 'Redirecting to payment...' : 'Analyze My Blood Test — $4.99'}
          </button>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
        )}

        {result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Results Explained</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</div>
            <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
              This is not medical advice. Always discuss your results with your doctor.
            </p>
          </div>
        )}

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: '📤', title: 'Upload', desc: 'Drop your PDF lab report' },
            { icon: '🔬', title: 'Analyze', desc: 'AI reads every marker' },
            { icon: '💬', title: 'Understand', desc: 'Plain English explanation' },
          ].map((step) => (
            <div key={step.title} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-2">{step.icon}</div>
              <div className="font-semibold text-gray-900">{step.title}</div>
              <div className="text-gray-500 text-sm mt-1">{step.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          Your PDF is analyzed and immediately deleted. We never store your health data.
        </div>
      </div>
    </main>
  )
}
