const raw = import.meta.env

export const env = {
  // `??` (not `||`) so an intentionally empty string means "same origin".
  apiBaseUrl: (raw.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, ''),
  maxUploadMb: Number(raw.VITE_MAX_UPLOAD_MB) || 10,
}
