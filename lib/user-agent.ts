/** Classificação leve de User-Agent (sem dependências externas) */

export type ParsedUA = {
  browser: string
  os: string
  deviceType: string
}

export function parseUserAgent(ua: string | null): ParsedUA {
  if (!ua || ua.length < 4) {
    return { browser: "Outros", os: "Outros", deviceType: "Outros" }
  }
  const u = ua

  let browser = "Outros"
  if (/Firefox|FxiOS/i.test(u)) browser = "Firefox"
  else if (/Edg\//i.test(u)) browser = "Outros"
  else if (/Chrome|CriOS|CrMo|Chromium/i.test(u)) browser = "Chrome"
  else if (/Safari/i.test(u)) browser = "Safari"

  let os = "Outros"
  if (/Windows NT 10|Windows NT 11/i.test(u)) os = "Windows 10/11"
  else if (/Windows/i.test(u)) os = "Windows"
  else if (/Mac OS X|macOS|Macintosh/i.test(u) && !/like Mac/i.test(u)) os = "macOS"
  else if (/Android/i.test(u)) os = "Android"
  else if (/iPhone|iPad|iPod/i.test(u)) os = "iOS"

  let deviceType = "Outros"
  if (/Android/i.test(u)) deviceType = "Android"
  else if (/iPhone|iPad|iPod/i.test(u)) deviceType = "iOS"
  else if (/Windows/i.test(u)) deviceType = "Windows"
  else if (/Mac OS X|macOS|Macintosh/i.test(u) && !/like Mac/i.test(u)) deviceType = "macOS"

  return { browser, os, deviceType }
}
