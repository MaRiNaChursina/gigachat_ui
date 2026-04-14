import { chromium } from 'playwright'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const htmlPath = path.join(root, 'docs', 'bundle-stats.html')
const outPath = path.join(root, 'docs', 'bundle-analysis.png')

if (!fs.existsSync(htmlPath)) {
  console.error('Сначала выполните: npm run analyze')
  process.exit(1)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load', timeout: 60_000 })
await page.screenshot({ path: outPath, fullPage: true })
await browser.close()
console.log('Saved', outPath)
