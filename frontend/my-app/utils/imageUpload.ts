// Shared client-side guardrails for document image uploads.
//
// These limits mirror the server so users get an immediate, clear message
// instead of a confusing network/CORS error. The backend rejects oversized
// bodies at nginx (client_max_body_size 15M) and at multer (10M), so we cap
// below both. Compression keeps most phone photos well under the limit.

// Hard ceiling sent to the server. Kept under the 10 MB multer limit so a
// valid file never trips the backend size guard.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

// Above this we attempt to compress before giving up and rejecting.
const COMPRESS_THRESHOLD_BYTES = 2 * 1024 * 1024; // 2 MB

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Longest edge after compression. Document photos remain readable at this size
// while shrinking multi-MB phone captures dramatically.
const MAX_DIMENSION = 2000;

export class UploadValidationError extends Error {}

const formatMB = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Validate a selected file's type. Throws UploadValidationError with a
 * user-facing message when the type is not an accepted image.
 */
export function validateImageType(file: File): void {
	if (!ACCEPTED_TYPES.includes(file.type)) {
		throw new UploadValidationError(
			'Unsupported file type. Please upload a JPG, PNG, or WebP image.'
		);
	}
}

/**
 * Compress an image file via a canvas re-encode. Returns the original file
 * untouched if it is already small, if it is not a raster type we can decode,
 * or if compression fails for any reason (we never block an upload on a
 * best-effort optimization).
 */
export async function compressImage(file: File): Promise<File> {
	if (file.size <= COMPRESS_THRESHOLD_BYTES) return file;
	if (!file.type.startsWith('image/')) return file;

	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
		const width = Math.round(bitmap.width * scale);
		const height = Math.round(bitmap.height * scale);

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) return file;
		ctx.drawImage(bitmap, 0, 0, width, height);

		const blob: Blob | null = await new Promise((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', 0.82)
		);
		if (!blob || blob.size >= file.size) return file; // no gain — keep original

		const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
		return new File([blob], newName, { type: 'image/jpeg', lastModified: Date.now() });
	} catch {
		return file;
	}
}

/**
 * Full pre-upload pipeline: validate type, compress if large, then enforce the
 * size ceiling. Throws UploadValidationError (with a message safe to show the
 * user) when the file cannot be uploaded. Returns the file to send on success.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
	validateImageType(file);
	const prepared = await compressImage(file);
	if (prepared.size > MAX_UPLOAD_BYTES) {
		throw new UploadValidationError(
			`Image is too large (${formatMB(prepared.size)}). Please upload an image under ${formatMB(MAX_UPLOAD_BYTES)}.`
		);
	}
	return prepared;
}
