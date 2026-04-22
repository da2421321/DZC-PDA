import request, { type ApiResponse } from '@/request/index'

export interface SlotOption {
    id?: string | number
    name?: string
    value?: string | number
    label?: string
    text?: string
    title?: string
    factoryId?: string | number
    factoryName?: string
    factoryCode?: string | number
    lineId?: string | number
    lineName?: string
    lineCode?: string | number
    productionLineId?: string | number
    productionLineName?: string
    productionLineCode?: string | number
    prodLineId?: string | number
    prodLineName?: string
    prodLineCode?: string | number
    code?: string | number
    key?: string | number
    [key: string]: unknown
}

export type FactoryOption = SlotOption

export type LineOption = SlotOption

export interface LineOptionsParams {
    factoryId?: string | number
    [key: string]: string | number | undefined
}

export interface BoundDeviceSlotsParams {
    factoryId?: string | number
    lineId?: string | number
    [key: string]: string | number | undefined
}

export interface BindByPositionParams {
    position: string
    deviceMac: string
}

export interface UnbindScaleParams {
    slotId: string
}

export interface BoundDeviceSlot {
    id: string
    code: string
    index: number
    side: string
    varietyId: string
    varietyName: string
    equipmentId: string
    deviceCode: string
    deviceMac: string
    deviceStatus: string
    isOnline: boolean
    bindTime: string
    [key: string]: unknown
}

export type SlotOptionsPayload = SlotOption[] | {
    data?: SlotOptionsPayload
    records?: SlotOption[]
    rows?: SlotOption[]
    list?: SlotOption[]
    options?: SlotOption[]
}

export type FactoryOptionsPayload = SlotOptionsPayload

export type LineOptionsPayload = SlotOptionsPayload

export interface BoundDeviceSlotsPayload {
    total: string | number
    rows: BoundDeviceSlot[]
    [key: string]: unknown
}

export type FactoryOptionsResponse = ApiResponse<FactoryOptionsPayload>

export type LineOptionsResponse = ApiResponse<LineOptionsPayload>

export type BoundDeviceSlotsResponse = ApiResponse<BoundDeviceSlotsPayload> & Partial<BoundDeviceSlotsPayload>

export type BindByPositionResponse = ApiResponse<unknown>

export type UnbindScaleResponse = ApiResponse<unknown>

export function getFactoryOptions() {
    return request<FactoryOptionsResponse>({
        url: '/electronic-scale/slot-config/factory-options',
        method: 'get'
    })
}

export function getLineOptions(params: LineOptionsParams = {}) {
    return request<LineOptionsResponse>({
        url: '/electronic-scale/slot-config/line-options',
        method: 'get',
        data: params
    })
}

export function bindScaleByPosition(data: BindByPositionParams) {
    return request<BindByPositionResponse>({
        url: '/electronic-scale/scale-binding/bind-by-position',
        method: 'put',
        data
    })
}

export function unbindScale(data: UnbindScaleParams) {
    return request<UnbindScaleResponse>({
        url: '/electronic-scale/scale-binding/bind',
        method: 'put',
        data
    })
}

export function getSlotsWithBoundDevices(params: BoundDeviceSlotsParams = {}) {
    return request<BoundDeviceSlotsResponse>({
        url: '/electronic-scale/slot-config/slots-with-bound-devices',
        method: 'get',
        data: params
    })
}
