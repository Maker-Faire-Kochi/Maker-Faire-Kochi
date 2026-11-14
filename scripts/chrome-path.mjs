/**
 * Which Chrome the browser scripts drive: CHROME_PATH if set, else Playwright's
 * Chrome for Testing (installed with `npx playwright-core install chromium`), else a
 * system Chrome. Newest Chrome for Testing wins.
 */
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const BUILDS = [
  'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  'chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  'chrome-linux64/chrome',
  'chrome-linux/chrome',
  'chrome-win64/chrome.exe',
  'chrome-win/chrome.exe',
]

export function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH
    || (process.platform === 'darwin' ? join(homedir(), 'Library/Caches/ms-playwright')
      : process.platform === 'win32' ? join(process.env.LOCALAPPDATA || '', 'ms-playwright')
        : join(homedir(), '.cache/ms-playwright'))
  try {
    const dirs = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort().reverse()
    for (const dir of dirs) {
      for (const build of BUILDS) {
        const found = join(cache, dir, build)
        if (existsSync(found)) return found
      }
    }
  }
  catch {}
  return process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome'
}
