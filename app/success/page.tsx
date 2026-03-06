'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const analyze = useCallback(async (f: File) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('pdf', f)
      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data.result)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (file) analyze(file)
  }, [file, analyze])

  if (!sessionId) {
    return <div className="text-center py-20 text-gray-500">Invalid session.</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h1>
        <p className="text-gray-600">Now upload your blood test PDF to get your explanation.</p>
      </div>

      {!result && (
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center cursor-pointer bg-white hover:bg-indigo-50 transition-colors mb-6"
        >
          <input {...getInputProps()} />
          {loading ? (
            <div>
              <div className="text-indigo-500 text-4xl mb-3 animate-pulse">🔬</div>
              <p className="text-indigo-600 font-medium">Analyzing your results...</p>
              <p className="text-gray-400 text-sm mt-1">This takes about 15 seconds</p>
            </div>
          ) : file ? (
            <div>
              <div className="text-indigo-500 text-4xl mb-3">📄</div>
              <p className="text-indigo-600 font-medium">{file.name}</p>
            </div>
          ) : (
            <div>
              <div className="text-gray-400 text-4xl mb-3">📤</div>
              <p className="text-gray-600 font-medium">Drop your blood test PDF here</p>
              <p className="text-gray-400 text-sm mt-1">or click to browse</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">{error}</div>
      )}

      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Results Explained</h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</div>
          <p className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-100">
            This is not medical advice. Always discuss your results with your doctor.
          </p>
        </div>
      )}
    </div>
  )
}

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  )
}
