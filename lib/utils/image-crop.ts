export interface CroppedAreaPixels {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Takes a blob URL (from URL.createObjectURL) and a
 * pixel crop area (from react-easy-crop's
 * onCropComplete callback) and returns a Promise<Blob>
 * of the cropped PNG image.
 *
 * Browser-only. Never call from server actions or SSR.
 * crossOrigin='anonymous' is set to prevent canvas
 * tainting if the image src is ever an external URL.
 */
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: CroppedAreaPixels
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  )
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Canvas produced empty blob'))
        }
      },
      'image/png'
    )
  })
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}
