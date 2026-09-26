import zlib from 'zlib'

/**
 * Checks if a string is garbage font glyph indices/binary PDF noise
 * (e.g. "D D ! ! # $ % & ' ( % $ $ ! ) % & * $ + , - / 0 % % 1 % % & # % -")
 */
export function isGarbageText(text: string | null | undefined): boolean {
  if (!text) return true
  const trimmed = text.trim()
  if (trimmed.length < 15) return true

  // Check 1: Excessive special symbol density (e.g. $, %, &, #, !, ", *, +, /)
  const specialSymbols = trimmed.match(/[$%&#!*+\\=~^`<>{}[\]|]/g) || []
  if (specialSymbols.length / trimmed.length > 0.08) {
    return true
  }

  // Check 2: Single-character isolated token ratio
  const tokens = trimmed.split(/\s+/).filter(Boolean)
  if (tokens.length >= 10) {
    const singleCharTokens = tokens.filter((t) => t.length === 1 && !/^[aAiI]$/.test(t))
    if (singleCharTokens.length / tokens.length > 0.4) {
      return true
    }
  }

  // Check 3: Letter and digit ratio (valid resumes are predominantly alphanumeric)
  const lettersAndDigits = trimmed.match(/[a-zA-Z0-9]/g) || []
  if (lettersAndDigits.length / trimmed.length < 0.45) {
    return true
  }

  return false
}

function cleanPdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      try {
        return String.fromCharCode(parseInt(oct, 8))
      } catch {
        return ''
      }
    })
}

function decodePdfHex(hex: string): string {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '')
  let res = ''
  for (let i = 0; i < clean.length; i += 2) {
    const byte = parseInt(clean.substring(i, i + 2), 16)
    if (!isNaN(byte) && byte >= 32 && byte <= 126) {
      res += String.fromCharCode(byte)
    } else if (byte === 10 || byte === 13 || byte === 9) {
      res += ' '
    }
  }
  return res
}

/**
 * Extracts text from PDF streams using BT...ET blocks and TJ/Tj operators.
 */
function extractFromPdfStreams(buffer: Buffer): string {
  const binary = buffer.toString('binary')
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  const chunks: string[] = []
  let match: RegExpExecArray | null

  while ((match = streamRegex.exec(binary)) !== null) {
    const rawStream = Buffer.from(match[1], 'binary')
    let text = ''

    try {
      text = zlib.inflateSync(rawStream).toString('latin1')
    } catch {
      try {
        text = zlib.inflateRawSync(rawStream).toString('latin1')
      } catch {
        text = match[1]
      }
    }

    if (text) {
      // 1. Text array operator: [(...) 10 (...) -20] TJ or [<hex> 10 <hex>] TJ
      const tjMatches = text.matchAll(/\[([\s\S]*?)\]\s*TJ/gi)
      for (const m of tjMatches) {
        const parts = m[1].matchAll(/\((.*?)(?<!\\)\)|<([0-9a-fA-F]+)>/g)
        const combined = Array.from(parts, (p) => {
          if (p[1] !== undefined) return cleanPdfString(p[1])
          if (p[2] !== undefined) return decodePdfHex(p[2])
          return ''
        }).join('')
        if (combined.trim()) chunks.push(combined)
      }

      // 2. Single string operators: (string) Tj or <hex> Tj
      const singleMatches = text.matchAll(/(?:\((.*?)(?<!\\)\)|<([0-9a-fA-F]+)>)\s*(?:Tj|'|")/gi)
      for (const m of singleMatches) {
        let cleaned = ''
        if (m[1] !== undefined) cleaned = cleanPdfString(m[1])
        else if (m[2] !== undefined) cleaned = decodePdfHex(m[2])
        if (cleaned.trim()) chunks.push(cleaned)
      }

      // 3. Plain text inside text blocks
      const btMatches = text.matchAll(/BT\s+([\s\S]*?)\s+ET/gi)
      for (const m of btMatches) {
        const innerStrings = m[1].matchAll(/\((.*?)(?<!\\)\)|<([0-9a-fA-F]+)>/g)
        for (const s of innerStrings) {
          let cleaned = ''
          if (s[1] !== undefined) cleaned = cleanPdfString(s[1])
          else if (s[2] !== undefined) cleaned = decodePdfHex(s[2])
          if (cleaned.trim()) chunks.push(cleaned)
        }
      }
    }
  }

  const result = chunks
    .join(' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()

  return isGarbageText(result) ? '' : result
}

/**
 * Scans raw PDF buffer for readable strings as a last-resort fallback.
 */
function scanReadableStrings(buffer: Buffer): string {
  const binary = buffer.toString('utf-8')
  const words = binary.match(/[A-Za-z0-9+#.'/-]{2,40}/g) || []
  const filtered = words.filter(
    (w) =>
      !/^(obj|endobj|stream|endstream|xref|trailer|startxref|catalog|pages|font|flatedecode|length|filter|type|annot)$/i.test(
        w
      )
  )
  const result = filtered.join(' ')
  return isGarbageText(result) ? '' : result
}

/**
 * High-precision multi-engine PDF Text Extractor.
 * Guaranteed to return human-readable text without glyph garbage.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const u8 = new Uint8Array(buffer)

  // Engine 1: pdf-parse v2 (Official PDFParse class with full CMap and Unicode font decoding)
  try {
    const pdfModule = (await import('pdf-parse')) as any
    if (pdfModule?.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: u8 })
      try {
        const parsed = await parser.getText()
        const text = parsed?.text?.trim()
        if (text && text.length > 30 && !isGarbageText(text)) {
          return text
        }
      } finally {
        if (typeof parser.destroy === 'function') {
          await parser.destroy()
        }
      }
    }

    const parseFn = typeof pdfModule === 'function' ? pdfModule : pdfModule?.default
    if (typeof parseFn === 'function') {
      const result = await parseFn(buffer)
      const text = result?.text?.trim()
      if (text && text.length > 30 && !isGarbageText(text)) {
        return text
      }
    }
  } catch (err) {
    console.warn('[pdf-extractor] Engine 1 (pdf-parse) failed:', err)
  }

  // Engine 2: Pure JS zlib stream parser
  try {
    const streamText = extractFromPdfStreams(buffer)
    if (streamText && streamText.length > 30 && !isGarbageText(streamText)) {
      return streamText
    }
  } catch (err) {
    console.warn('[pdf-extractor] Engine 2 (stream decompressor) failed:', err)
  }

  // Engine 3: Clean string buffer scanner
  try {
    const scanned = scanReadableStrings(buffer)
    if (scanned && scanned.length > 30 && !isGarbageText(scanned)) {
      return scanned
    }
  } catch (err) {
    console.warn('[pdf-extractor] Engine 3 (string scanner) failed:', err)
  }

  return ''
}
