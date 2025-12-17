export interface ApiConfig {
  id: string
  baseUrl: string
  authHeaders: Record<string, string> | null
  timeout: number
  userKey: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateApiConfigInput {
  baseUrl: string
  authHeaders?: Record<string, string>
  timeout?: number
}

export interface UpdateApiConfigInput {
  baseUrl?: string
  authHeaders?: Record<string, string>
  timeout?: number
}

