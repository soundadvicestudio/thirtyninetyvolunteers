import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
for (const size of sizes) {
  await sharp('public/logo.png')
    .resize(size, size, {
      fit: 'contain',
      background: { r: 41, g: 57, b: 148, alpha: 1 },
    })
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)
  console.log(`Generated ${size}x${size}`)
}

// Apple touch icon (180x180)
await sharp('public/logo.png')
  .resize(180, 180, {
    fit: 'contain',
    background: { r: 41, g: 57, b: 148, alpha: 1 },
  })
  .png()
  .toFile('public/icons/apple-touch-icon.png')
console.log('Generated apple-touch-icon 180x180')
