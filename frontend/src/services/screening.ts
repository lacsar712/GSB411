import { api } from '../lib/api'
import { AxiosResponse } from 'axios'

export interface Preset {
    id?: number
    name: string
    payload: { filters: any }
    is_default?: boolean
}

export interface ScreeningFilters {
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

const convertFiltersToApi = (filters: ScreeningFilters) => ({
    basic_filters: {
        market_cap_min: filters.market_cap_min ? Number(filters.market_cap_min) * 100000000 : undefined,
        market_cap_max: filters.market_cap_max ? Number(filters.market_cap_max) * 100000000 : undefined,
        pe_min: filters.pe_min ? Number(filters.pe_min) : undefined,
        pe_max: filters.pe_max ? Number(filters.pe_max) : undefined,
        pb_min: filters.pb_min ? Number(filters.pb_min) : undefined,
        pb_max: filters.pb_max ? Number(filters.pb_max) : undefined,
    },
    factor_filters: {
        momentum_min: filters.momentum_min ? Number(filters.momentum_min) / 100 : undefined,
        momentum_max: filters.momentum_max ? Number(filters.momentum_max) / 100 : undefined,
        volatility_min: filters.volatility_min ? Number(filters.volatility_min) / 100 : undefined,
        volatility_max: filters.volatility_max ? Number(filters.volatility_max) / 100 : undefined,
        liquidity_min: filters.liquidity_min ? Number(filters.liquidity_min) * 10000 : undefined,
        liquidity_max: filters.liquidity_max ? Number(filters.liquidity_max) * 10000 : undefined,
    },
    technical_filters: {
        rsi_min: filters.rsi_min ? Number(filters.rsi_min) : undefined,
        rsi_max: filters.rsi_max ? Number(filters.rsi_max) : undefined,
        macd_positive: filters.macd_positive,
        kdj_positive: filters.kdj_positive,
    }
})

export const screeningApi = {
    runScreening: (filters: ScreeningFilters) => {
        return api.post('/screening/run', convertFiltersToApi(filters)) as Promise<AxiosResponse<{ items: ScreeningItem[] }>>
    },

    exportResults: (filters: ScreeningFilters, type: 'csv' | 'xlsx') => {
        return api.post('/screening/export', convertFiltersToApi(filters), { responseType: 'blob' })
    },

    getPresets: () => {
        return api.get('/screening/preset') as Promise<AxiosResponse<Preset[]>>
    },

    savePreset: (name: string, filters: ScreeningFilters) => {
        return api.post('/screening/preset', { name, payload: { filters } })
    },

    deletePreset: (name: string) => {
        return api.delete(`/screening/preset?name=${encodeURIComponent(name)}`)
    },

    setDefaultPreset: (name: string) => {
        return api.put(`/screening/preset/default?name=${encodeURIComponent(name)}`)
    },

    getDefaultPreset: () => {
        return api.get('/screening/preset/default') as Promise<AxiosResponse<Preset | null>>
    },
}
