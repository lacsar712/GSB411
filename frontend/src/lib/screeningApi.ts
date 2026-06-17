import { api } from './api'
import { AxiosResponse } from 'axios'

export interface ScreeningItem {
    symbol: string
    name: string
    market: string
    industry?: string
    market_cap?: number
    pe_ratio?: number
    pb_ratio?: number
    momentum?: number
    rsi?: number
}

export interface Preset {
    id?: number
    name: string
    payload: { filters: any }
    is_default?: boolean
}

export interface Filters {
    market_cap_min: string
    market_cap_max: string
    pe_min: string
    pe_max: string
    pb_min: string
    pb_max: string
    momentum_min: string
    momentum_max: string
    volatility_min: string
    volatility_max: string
    liquidity_min: string
    liquidity_max: string
    rsi_min: string
    rsi_max: string
    macd_positive: boolean
    kdj_positive: boolean
}

function buildApiPayload(currentFilters: Filters) {
    return {
        basic_filters: {
            market_cap_min: currentFilters.market_cap_min ? Number(currentFilters.market_cap_min) * 100000000 : undefined,
            market_cap_max: currentFilters.market_cap_max ? Number(currentFilters.market_cap_max) * 100000000 : undefined,
            pe_min: currentFilters.pe_min ? Number(currentFilters.pe_min) : undefined,
            pe_max: currentFilters.pe_max ? Number(currentFilters.pe_max) : undefined,
            pb_min: currentFilters.pb_min ? Number(currentFilters.pb_min) : undefined,
            pb_max: currentFilters.pb_max ? Number(currentFilters.pb_max) : undefined,
        },
        factor_filters: {
            momentum_min: currentFilters.momentum_min ? Number(currentFilters.momentum_min) / 100 : undefined,
            momentum_max: currentFilters.momentum_max ? Number(currentFilters.momentum_max) / 100 : undefined,
            volatility_min: currentFilters.volatility_min ? Number(currentFilters.volatility_min) / 100 : undefined,
            volatility_max: currentFilters.volatility_max ? Number(currentFilters.volatility_max) / 100 : undefined,
            liquidity_min: currentFilters.liquidity_min ? Number(currentFilters.liquidity_min) * 10000 : undefined,
            liquidity_max: currentFilters.liquidity_max ? Number(currentFilters.liquidity_max) * 10000 : undefined,
        },
        technical_filters: {
            rsi_min: currentFilters.rsi_min ? Number(currentFilters.rsi_min) : undefined,
            rsi_max: currentFilters.rsi_max ? Number(currentFilters.rsi_max) : undefined,
            macd_positive: currentFilters.macd_positive,
            kdj_positive: currentFilters.kdj_positive,
        }
    }
}

export async function runScreening(filters: Filters): Promise<ScreeningItem[]> {
    const res = await api.post('/screening/run', buildApiPayload(filters))
    return res.data.items
}

export async function loadPresets(): Promise<Preset[]> {
    const res: AxiosResponse<Preset[]> = await api.get('/screening/preset')
    return res.data
}

export async function savePreset(name: string, filters: Filters): Promise<void> {
    await api.post('/screening/preset', { name, payload: { filters } })
}

export async function deletePreset(name: string): Promise<void> {
    await api.delete(`/screening/preset?name=${encodeURIComponent(name)}`)
}

export async function getDefaultPreset(): Promise<Preset | null> {
    const res = await api.get('/screening/preset/default')
    return res.data
}

export async function setDefaultPreset(name: string): Promise<void> {
    await api.put(`/screening/preset/default?name=${encodeURIComponent(name)}`)
}

export async function unsetDefaultPreset(): Promise<void> {
    await api.delete('/screening/preset/default')
}

export async function exportResults(filters: Filters, type: 'csv' | 'xlsx'): Promise<void> {
    const res = await api.post('/screening/export', {
        file_type: type,
        ...buildApiPayload(filters)
    }, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `screening_result.${type}`)
    document.body.appendChild(link)
    link.click()
}
