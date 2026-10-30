import axios from 'axios'
import { env } from '@/config/env'

/** Normalised error thrown by every API call. */
export class ApiError extends Error {
  constructor({ message, status = 0, code = 'unknown_error', requestId = null, details = null }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}

function toApiError(error) {
  if (error instanceof ApiError) return error
  if (error.response) {
    const body = error.response.data?.error
    return new ApiError({
      status: error.response.status,
      code: body?.code ?? 'http_error',
      message: body?.message ?? `Request failed with status ${error.response.status}.`,
      requestId: body?.request_id ?? null,
      details: body?.details ?? null,
    })
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError({ code: 'client_timeout', message: 'The request took too long. Please try again.' })
  }
  if (axios.isCancel(error)) {
    return new ApiError({ code: 'cancelled', message: 'Request cancelled.' })
  }
  return new ApiError({
    code: 'network_error',
    message: "Can't reach the server. Check your connection and that the API is running.",
  })
}

export const http = axios.create({
  baseURL: `${env.apiBaseUrl}/api/v1`,
  timeout: 120_000, // extraction waits on an LLM
})

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
)
