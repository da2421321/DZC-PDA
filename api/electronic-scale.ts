import request, { type ApiResponse } from '@/request/index'

export interface FactoryOption {
    id?: string | number
    name?: string
    value?: string | number
    label?: string
    factoryId?: string | number
    factoryName?: string
    factoryCode?: string | number
    code?: string | number
    [key: string]: unknown
}

export type FactoryOptionsPayload = FactoryOption[] | {
    records?: FactoryOption[]
    rows?: FactoryOption[]
    list?: FactoryOption[]
    options?: FactoryOption[]
}

export type FactoryOptionsResponse = ApiResponse<FactoryOptionsPayload>

export function getFactoryOptions() {
    return request<FactoryOptionsResponse>({
        url: '/electronic-scale/slot-config/factory-options',
        method: 'get'
    })
}
