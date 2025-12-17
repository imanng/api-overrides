export interface Override {
  id: string
  method: string
  path: string
  headers: Record<string, string> | null
  body: any | null
  status: number
  responseBody: any
  ipAddress: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateOverrideInput {
  method: string
  path: string
  headers?: Record<string, string>
  body?: any
  status?: number
  responseBody: any
}

export interface UpdateOverrideInput {
  method?: string
  path?: string
  headers?: Record<string, string>
  body?: any
  status?: number
  responseBody?: any
}

