/**
 * JSON Repair Utility
 * Truncated AI yanıtlarından JSON kurtarmaya çalışır
 */

/**
 * Truncated JSON string'i onarmaya çalışır
 * - Açık bracket/brace'leri sayar
 * - Son tam objeye trim eder
 * - Kalan yapıları kapatır
 */
export function attemptJsonRepair(text: string): string | null {
  if (!text || text.trim().length === 0) return null;

  let cleaned = text.trim();

  // Markdown code fence'ları temizle
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)(?:```|$)/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  // Zaten geçerli JSON ise direkt dön
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Devam et - onarım gerekli
  }

  // Son tam array elemanına trim et
  // Pattern: array içindeki son tamamlanmış objeyi bul
  const lastCompleteObject = findLastCompleteArrayElement(cleaned);
  if (lastCompleteObject) {
    try {
      JSON.parse(lastCompleteObject);
      return lastCompleteObject;
    } catch {
      // Bu da başarısız, bracket kapatmayı dene
    }
  }

  // Brute force: açık yapıları kapat
  const repaired = closeOpenStructures(cleaned);
  if (repaired) {
    try {
      JSON.parse(repaired);
      return repaired;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * flap_suggestions array'indeki son tamamlanmış objeyi bulur
 */
function findLastCompleteArrayElement(text: string): string | null {
  // "flap_suggestions" array'ini bul
  const arrayStart = text.indexOf('"flap_suggestions"');
  if (arrayStart === -1) return null;

  // Array'in başlangıç bracket'ini bul
  const bracketStart = text.indexOf('[', arrayStart);
  if (bracketStart === -1) return null;

  // Son tamamlanmış objeyi bul: }, sonrası başka obje veya array sonu
  let lastGoodEnd = -1;
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = bracketStart + 1; i < text.length; i++) {
    const ch = text[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        // Tam bir obje kapandı
        lastGoodEnd = i;
      }
    }
  }

  if (lastGoodEnd === -1) return null;

  // Prefix (flap_suggestions öncesi) + tamamlanan objeler + kapatma
  const prefix = text.substring(0, bracketStart + 1);
  const objects = text.substring(bracketStart + 1, lastGoodEnd + 1);

  // Kalan açık yapıları kapat
  let result = prefix + objects + ']';

  // Root objeyi kapat
  const rootBraceCount = countChar(result, '{') - countChar(result, '}');
  for (let i = 0; i < rootBraceCount; i++) {
    result += '}';
  }

  return result;
}

/**
 * Açık bracket/brace'leri kapatır
 */
function closeOpenStructures(text: string): string | null {
  // Trailing comma'ları temizle
  let cleaned = text.replace(/,\s*$/, '');

  // Tamamlanmamış string'leri kapat
  const quoteCount = countChar(cleaned, '"') - countEscapedQuotes(cleaned);
  if (quoteCount % 2 !== 0) {
    cleaned += '"';
  }

  // Açık yapıları kapat (LIFO sırasında)
  const stack: string[] = [];
  let inStr = false;
  let esc = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (esc) { esc = false; continue; }
    if (ch === '\\' && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;

    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        stack.pop();
      }
    }
  }

  // Stack'i ters sırada kapat
  if (stack.length > 0) {
    cleaned += stack.reverse().join('');
    return cleaned;
  }

  return cleaned;
}

function countChar(text: string, char: string): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === char) count++;
  }
  return count;
}

function countEscapedQuotes(text: string): number {
  let count = 0;
  for (let i = 1; i < text.length; i++) {
    if (text[i] === '"' && text[i - 1] === '\\') count++;
  }
  return count;
}

/**
 * AI yanıtından JSON çıkarmaya çalışır
 * Markdown code fence'lar, ön/arka metin vs. temizler
 */
export function extractJson(text: string): string {
  if (!text) return '';

  let cleaned = text.trim();

  // Markdown code fence'ları temizle
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // İlk { veya [ ile başla
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  if (firstBrace === -1 && firstBracket === -1) return cleaned;

  let startIdx: number;
  if (firstBrace === -1) startIdx = firstBracket;
  else if (firstBracket === -1) startIdx = firstBrace;
  else startIdx = Math.min(firstBrace, firstBracket);

  // Son } veya ] ile bitir
  const lastBrace = cleaned.lastIndexOf('}');
  const lastBracket = cleaned.lastIndexOf(']');
  const endIdx = Math.max(lastBrace, lastBracket);

  if (endIdx <= startIdx) return cleaned;

  return cleaned.substring(startIdx, endIdx + 1);
}
