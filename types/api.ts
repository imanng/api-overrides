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

export interface BaseApi {
  id: string
  key: string
  baseUrl: string
  pathPrefix: string | null
  authHeaders: Record<string, string> | null
  isDefault: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateBaseApiInput {
  key: string
  baseUrl: string
  pathPrefix?: string | null
  authHeaders?: Record<string, string>
  isDefault?: boolean
  order?: number
}

export interface UpdateBaseApiInput {
  key?: string
  baseUrl?: string
  pathPrefix?: string | null
  authHeaders?: Record<string, string>
  isDefault?: boolean
  order?: number
}

