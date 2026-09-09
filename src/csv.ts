export interface Card {
  a: string
  b: string
}

/**
 * Parse CSV text into A/B cards.
 * Handles quoted fields (commas and newlines inside quotes, "" escapes).
 * First column becomes `a`, second becomes `b`; extra columns are ignored.
 * Rows where both fields are blank are dropped.
 */
export function parseCsv(text: string): Card[] {
  const cards: Card[] = []
  for (const row of splitCsv(text)) {
    const a = (row[0] ?? '').trim()
    const b = (row[1] ?? '').trim()
    if (a === '' && b === '') continue
    cards.push({ a, b })
  }
  return cards
}

/**
 * Normalize an answer for comparison: trim, lowercase, collapse whitespace.
 */
export function normalizeAnswer(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function splitCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += ch
    }
  }

  row.push(field)
  rows.push(row)
  return rows
}