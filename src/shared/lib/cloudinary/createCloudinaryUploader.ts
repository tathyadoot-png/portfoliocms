import type {
  CloudinaryConfig,
  CloudinaryUploader,
  CloudinaryUploadOptions,
  CloudinaryUploadResult,
} from './types'

interface CloudinaryRawResponse {
  public_id: string
  secure_url: string
  width?: number
  height?: number
  format?: string
  bytes?: number
  error?: { message: string }
}

/**
 * Factory that builds an unsigned, browser-direct Cloudinary uploader bound to
 * one portfolio's credentials. No api_secret and no server-side signing are
 * involved (V1 decision) — the browser POSTs straight to Cloudinary using an
 * unsigned upload preset.
 *
 * Credentials are injected per active portfolio; nothing is hardcoded. Uses
 * XMLHttpRequest (rather than fetch) solely to report real upload progress.
 */
export function createCloudinaryUploader(
  config: CloudinaryConfig,
): CloudinaryUploader {
  const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`

  return {
    upload(
      file: File,
      options: CloudinaryUploadOptions = {},
    ): Promise<CloudinaryUploadResult> {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', config.uploadPreset)

      const folder = options.folder ?? config.defaultFolder
      if (folder) {
        formData.append('folder', folder)
      }

      return new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', endpoint)

        if (options.signal) {
          if (options.signal.aborted) {
            reject(new DOMException('Upload aborted', 'AbortError'))
            return
          }
          options.signal.addEventListener('abort', () => xhr.abort())
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && options.onProgress) {
            options.onProgress(Math.round((event.loaded / event.total) * 100))
          }
        }

        xhr.onabort = () => {
          reject(new DOMException('Upload aborted', 'AbortError'))
        }

        xhr.onerror = () => {
          reject(new Error('Cloudinary upload failed: network error'))
        }

        xhr.onload = () => {
          let raw: CloudinaryRawResponse
          try {
            raw = JSON.parse(xhr.responseText) as CloudinaryRawResponse
          } catch {
            reject(new Error(`Cloudinary upload failed (${xhr.status})`))
            return
          }

          if (xhr.status < 200 || xhr.status >= 300 || raw.error) {
            reject(
              new Error(
                raw.error?.message ?? `Cloudinary upload failed (${xhr.status})`,
              ),
            )
            return
          }

          resolve({
            publicId: raw.public_id,
            secureUrl: raw.secure_url,
            width: raw.width ?? null,
            height: raw.height ?? null,
            format: raw.format ?? null,
            bytes: raw.bytes ?? null,
          })
        }

        xhr.send(formData)
      })
    },
  }
}
