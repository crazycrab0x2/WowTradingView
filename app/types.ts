export type UTCTimestamp = import("lightweight-charts").UTCTimestamp;

export type ISeriesApiCandlestick = import("lightweight-charts").ISeriesApi<"Candlestick">;

export type IPriceLine = import("lightweight-charts").IPriceLine;

export type ISeriesApiLine = import("lightweight-charts").ISeriesApi<"Line">;

export type Selection = {
    visible: boolean;
    isDragging: boolean;
    startTime: UTCTimestamp | null;
    endTime: UTCTimestamp | null;
    startPrice: number | null;
    endPrice: number | null;
    percentChange: number;
    duration: string;
    rectStartX: number;
    rectStartY: number;
    rectEndX: number;
    rectEndY: number;
}
export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export type Overlay = {
    visible: boolean;
    ohlc: { o: number; h: number; l: number; c: number } | null;
    percent: { upper: number, body: number, lower: number } | null;
    bb: string | null;
    vwap: string | null;
    vwma: string | null;
    bbPct: string | null;
    cci: string | null;
}

export type ContextMenu = {
    visible: boolean;
    x: number;
    y: number;
}