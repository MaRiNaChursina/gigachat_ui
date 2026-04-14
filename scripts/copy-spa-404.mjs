import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const index = path.join(dist, 'index.html')
const notFound = path.join(dist, '404.html')

if (!fs.existsSync(index)) {
  console.error('Нет dist/index.html — сначала выполните сборку (npm run build).')
  process.exit(1)
}

fs.copyFileSync(index, notFound)
console.log('Скопировано dist/index.html → dist/404.html (для GitHub Pages + SPA).')
