import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadImage(buffer, { folder, sortOrder = 0, mimeType } = {}) {
  if (mimeType && !ALLOWED_TYPES.includes(mimeType)) {
    throw new Error('Only JPEG, PNG, and WebP images are allowed')
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1920, crop: 'limit', quality: 'auto', fetch_format: 'webp' },
        ],
        eager: [
          { width: 400, height: 300, crop: 'fill', quality: 'auto', fetch_format: 'webp' },
        ],
        eager_async: false,
      },
      (error, result) => {
        if (error) return reject(error)
        resolve({
          ...result,
          thumbnail_url: result.eager?.[0]?.secure_url,
        })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('[cloudinary/delete]', err)
  }
}
