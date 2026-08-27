/** Per-portfolio Cloudinary binding. Mirrors the `cloudinary_configs` row
 *  but is decoupled from the DB type so the uploader stays framework-agnostic. */
export interface CloudinaryConfig {
  cloudName: string
  uploadPreset: string
  /** Optional default folder uploads are placed into. */
  defaultFolder?: string | null
}

/** Subset of the Cloudinary upload API response we persist as media metadata. */
export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  width: number | null
  height: number | null
  format: string | null
  bytes: number | null
}

export interface CloudinaryUploadOptions {
  /** Overrides the config's defaultFolder for this single upload. */
  folder?: string
  /** Abort signal so callers can cancel an in-flight upload. */
  signal?: AbortSignal
  /** Reports real upload progress (0-100) as bytes are sent. */
  onProgress?: (percent: number) => void
}

export interface CloudinaryUploader {
  upload: (
    file: File,
    options?: CloudinaryUploadOptions,
  ) => Promise<CloudinaryUploadResult>
}
