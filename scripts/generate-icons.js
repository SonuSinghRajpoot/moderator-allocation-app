import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create a simple SVG icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#grad1)"/>
  <circle cx="256" cy="200" r="60" fill="white" opacity="0.9"/>
  <rect x="180" y="280" width="152" height="8" rx="4" fill="white" opacity="0.9"/>
  <rect x="200" y="300" width="112" height="8" rx="4" fill="white" opacity="0.7"/>
  <rect x="220" y="320" width="72" height="8" rx="4" fill="white" opacity="0.5"/>
</svg>
`

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../assets')
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true })
}

// Write SVG icon
fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgIcon)

console.log('Generated placeholder icon at assets/icon.svg')
console.log('You should replace this with proper icons:')
console.log('- assets/icon.png (512x512 PNG for Linux)')
console.log('- assets/icon.ico (Windows icon)')
console.log('- assets/icon.icns (macOS icon)') 