type PixelArea = {
  x: number
  y: number
  width: number
  height: number
}

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error('图片加载失败'))
  image.src = src
})

export const cropImageToFile = async (params: {
  imageSrc: string
  cropArea: PixelArea
  fileName: string
  mimeType?: string
}) => {
  const image = await loadImage(params.imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.floor(params.cropArea.width))
  canvas.height = Math.max(1, Math.floor(params.cropArea.height))

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('裁剪失败')
  }

  context.drawImage(
    image,
    params.cropArea.x,
    params.cropArea.y,
    params.cropArea.width,
    params.cropArea.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  const mimeType = params.mimeType ?? 'image/png'
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('裁剪失败'))
        return
      }
      resolve(result)
    }, mimeType)
  })

  return new File([blob], params.fileName, { type: mimeType })
}
