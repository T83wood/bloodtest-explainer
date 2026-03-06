import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const uint8 = new Uint8Array(buffer)
  const doc = await pdfjsLib.getDocument({ data: uint8 }).promise
  const pages: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item: any) => (item as any).str || '').join(' '))
  }
  return pages.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('pdf') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = (await extractPdfText(buffer)).trim()

    if (!text || text.length < 50) {
      return NextResponse.json({
        error: 'Could not read PDF. Please ensure it is a text-based PDF, not a scanned image.'
      }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `You are a friendly medical translator. A patient uploaded their blood test results and needs plain English explanations.

Analyze the lab results and provide:

1. **Overall Summary** — 2-3 sentences on what these results mean overall.

2. **Each Result Explained** — For each marker: what it measures, whether normal/off, what it means.

3. **Discuss with Your Doctor** — Values outside normal range to specifically ask about.

4. **What Looks Healthy** — Reassure them on normal values.

Use simple language. No jargon. Be warm but honest. Never diagnose. Always advise discussing with their doctor.

BLOOD TEST RESULTS:
${text.slice(0, 8000)}`
      }]
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
