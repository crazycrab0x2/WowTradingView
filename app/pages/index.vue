<template>
  <div class="flex flex-col h-lvh w-full bg-[#0c0c0d] overflow-hidden">
    <div
      class="flex flex-row h-150 overflow-hidden shrink-0 border-b border-b-[#9598a188]"
    >
      <div
        v-if="!isChartReady"
        class="absolute w-full h-full inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0c0d]"
      >
        <div class="text-white text-3xl font-bold mb-8">Welcome to Wow TradingView</div>
        <div class="loading-effect mb-20 mt-10 w-40 h-40 relative">
          <div class="ring" aria-hidden></div>
          <div class="glow" aria-hidden></div>
          <img
            src="/wow.png"
            alt="Loading"
            class="wow-img w-40 h-40 rounded-full object-cover z-20"
          />
          <div class="particles" aria-hidden>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        <div class="text-white text-lg font-semibold">Loading Chart Data...</div>
        <div class="text-[#9598a1] text-sm mt-2">Please wait while chart ready</div>
      </div>
      <!-- Loading Overlay -->
      <div
        class="relative w-full bg-[#0c0c0d] h-full"
        @contextmenu.prevent="showContextMenu"
      >
        <div ref="chartContainer" class="w-full h-full" />

        <div
          class="absolute top-0 left-0 z-10 font-[monospace] p-2 rounded-br-3 text-[14px] pointer-events-none"
        >
          <div
            v-if="overlay.ohlc"
            :class="overlay.ohlc.o > overlay.ohlc.c ? 'text-[#27a2a0]' : 'text-[#e3545b]'"
            class="bg-[#0f1a1f] w-fit px-1 flex gap-3"
          >
            <span class="mr-1">O: {{ overlay.ohlc.o.toFixed(3) }}</span>
            <span class="mr-1">H: {{ overlay.ohlc.h.toFixed(3) }}</span>
            <span class="mr-1">L: {{ overlay.ohlc.l.toFixed(3) }}</span>
            <span class="mr-1">C: {{ overlay.ohlc.c.toFixed(3) }}</span>
          </div>
          <div
            v-if="overlay.percent"
            class="bg-[#0f1a1f] w-fit px-1 text-white flex gap-2"
          >
            <span class="mr-1">Upper: {{ overlay.percent.upper.toFixed(2) }}%</span>
            <span class="mr-1">Body: {{ overlay.percent.body.toFixed(2) }}%</span>
            <span class="mr-1">Lower: {{ overlay.percent.lower.toFixed(2) }}%</span>
          </div>
          <div
            v-if="overlay.bb"
            class="bg-[#0f1a1f] w-fit px-1 whitespace-nowrap text-[#2962ff]"
          >
            <span class="">BB</span> {{ overlay.bb }}
          </div>
          <div
            v-if="overlay.vwap"
            class="bg-[#0f1a1f] w-fit px-1 whitespace-nowrap text-[#9598a1]"
          >
            <span class="">VWAP</span> {{ overlay.vwap }}
          </div>
          <div
            v-if="overlay.vwma"
            class="bg-[#0f1a1f] w-fit px-1 whitespace-nowrap text-[#f23645]"
          >
            <span class="">VWMA</span> {{ overlay.vwma }}
          </div>
          <div
            v-if="overlay.bbPct"
            class="bg-[#0f1a1f] w-fit px-1 whitespace-nowrap text-[#2962ff]"
          >
            <span class="">BB%B</span> {{ overlay.bbPct }}
          </div>
          <div
            v-if="overlay.cci"
            class="bg-[#0f1a1f] w-fit px-1 whitespace-nowrap text-[#ff9800]"
          >
            <span class="">CCI</span> {{ overlay.cci }}
          </div>
        </div>
        <div
          v-if="selection.visible"
          class="absolute pointer-events-none z-5"
          :class="selection.percentChange >= 0 ? 'bg-[#27a2a044]' : 'bg-[#e3545b44]'"
          :style="selectionRectStyle"
        >
          <div
            class="absolute -translate-y-[90%] -translate-x-[50%] left-[50%] selection-label py-2 px-4"
            :class="selection.percentChange >= 0 ? 'bg-[#27a2a0]' : 'bg-[#e3545b]'"
          >
            <div>{{ selection.duration }}</div>
            <div>
              {{ selection.percentChange >= 0 ? "+" : ""
              }}{{ selection.percentChange.toFixed(2) }}%
            </div>
          </div>
        </div>
        <UButton
          :icon="isSingleVWAP ? `i-heroicons-eye-slash` : `i-heroicons-eye`"
          color="primary"
          variant="solid"
          size="sm"
          class="absolute top-4 right-16 z-10 cursor-pointer"
          @click="changeVwap"
        >
          VWAP Band
        </UButton>
        <UButton
          icon="i-heroicons-calendar"
          color="primary"
          variant="solid"
          size="md"
          class="absolute bottom-8 left-3 z-10 cursor-pointer"
          @click="showCalendarPicker = true"
        />
        <UButton
          icon="i-heroicons-arrow-right"
          color="primary"
          variant="solid"
          size="md"
          class="absolute bottom-8 right-20 z-10 cursor-pointer"
          @click="moveToLatest"
        />
        <div
          v-if="showCalendarPicker"
          class="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-10"
        >
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-white">Select Timestamp</h3>
                <UButton
                  icon="i-heroicons-x-mark"
                  color="primary"
                  variant="ghost"
                  size="xs"
                  @click="showCalendarPicker = false"
                />
              </div>
            </template>
            <div class="p-4">
              <input
                v-model="selectedDateTime"
                type="datetime-local"
                class="w-full px-3 py-2 bg-[#1a1a1a] border-[#2b2b43] rounded-[1.5] text-[#ffffff] text-[14px]"
              />
              <UButton @click="jumpToSelectedTime" class="mt-4 cursor-pointer"
                >Go</UButton
              >
            </div>
          </UCard>
        </div>
        <!-- Context Menu -->
        <div
          v-if="contextMenu.visible"
          class="absolute z-20 bg-[#1a1a1a] border border-[#2b2b43] rounded-lg shadow-lg min-w-32"
          :style="{
            left: contextMenu.x + 'px',
            top: contextMenu.y + 'px',
          }"
          @click.stop
        >
          <button
            class="w-full text-left px-4 py-2 text-white hover:bg-[#2b2b43] rounded-md text-sm flex items-center gap-2"
            @click="handleResetChart"
          >
            <span class="text-[#9598a1]">↻</span>
            Reset View
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import candleData from "~/assets/candleData/candles.json";
import type {
  UTCTimestamp,
  Selection,
  ContextMenu,
  Overlay,
  Candle,
  ISeriesApiCandlestick,
  IPriceLine,
  ISeriesApiLine,
} from "../types.js";

const isSingleVWAP = ref(true);
const isChartReady = ref(false);

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: ReturnType<
  typeof import("lightweight-charts")["createChart"]
> | null = null;
let crosshairHandlerRef: ((param: unknown) => void) | null = null;
let mouseClickHandlerRef: ((param: unknown) => void) | null = null;
const UTC_PLUS_1_OFFSET = 3600;

const overlay = ref<Overlay>({
  visible: false,
  ohlc: null,
  percent: null,
  bb: null,
  vwap: null,
  vwma: null,
  bbPct: null,
  cci: null,
});

const contextMenu = ref<ContextMenu>({
  visible: false,
  x: 0,
  y: 0,
});

const selection = ref<Selection>({
  visible: false,
  isDragging: false,
  startTime: null,
  endTime: null,
  startPrice: null,
  endPrice: null,
  percentChange: 0,
  duration: "",
  rectStartX: 0,
  rectStartY: 0,
  rectEndX: 0,
  rectEndY: 0,
});

const showCalendarPicker = ref(false);
const selectedDateTime = ref("");

const selectionRectStyle = computed(() => {
  if (!selection.value.visible) return {};

  const left = Math.min(selection.value.rectStartX, selection.value.rectEndX);
  const top = Math.min(selection.value.rectStartY, selection.value.rectEndY);
  const width = Math.abs(selection.value.rectEndX - selection.value.rectStartX);
  const height = Math.abs(selection.value.rectEndY - selection.value.rectStartY);

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
});

let isShiftPressed = false;
let candlestickSeriesRef: ISeriesApiCandlestick | null = null;
let bbPctBSeriesRef: ISeriesApiLine | null = null;
let cciSeriesRef: ISeriesApiLine | null = null;
let vwapUpper2SeriesRef: ISeriesApiLine | null = null;
let vwapLower2SeriesRef: ISeriesApiLine | null = null;
let vwapUpper1SeriesRef: ISeriesApiLine | null = null;
let vwapLower1SeriesRef: ISeriesApiLine | null = null;
let selectionStartPriceLine: IPriceLine | null = null;
let selectionEndPriceLine: IPriceLine | null = null;
let crosshairPriceLine: IPriceLine | null = null;
let crosshairBBPctBLine: IPriceLine | null = null;
let crosshairCCILine: IPriceLine | null = null;
let bbPctBLine003: IPriceLine | null = null;
let bbPctBLine097: IPriceLine | null = null;
let cciLineUp: IPriceLine | null = null;
let cciLineDown: IPriceLine | null = null;
let clickHandlerRef: (() => void) | null = null;

const rawCandles = candleData as Candle[];

const bars = rawCandles.map((c) => ({
  time: (Math.floor(c.time / 1000) + UTC_PLUS_1_OFFSET) as UTCTimestamp,
  open: c.open,
  high: c.high,
  low: c.low,
  close: c.close,
}));

const changeVwap = () => {
  isSingleVWAP.value = !isSingleVWAP.value;
  if (vwapUpper2SeriesRef && vwapLower2SeriesRef) {
    if (isSingleVWAP.value) {
      vwapUpper2SeriesRef.setData(vwapMiddle);
      vwapLower2SeriesRef.setData(vwapMiddle);
    } else {
      vwapUpper2SeriesRef.setData(vwapUpper2);
      vwapLower2SeriesRef.setData(vwapLower2);
    }
  }
  if (vwapUpper1SeriesRef && vwapLower1SeriesRef) {
    if (isSingleVWAP.value) {
      vwapUpper1SeriesRef.setData(vwapMiddle);
      vwapLower1SeriesRef.setData(vwapMiddle);
    } else {
      vwapUpper1SeriesRef.setData(vwapUpper1);
      vwapLower1SeriesRef.setData(vwapLower1);
    }
  }
};

const BB_PERIOD = 20;
const BB_MULT = 2;

const sma = (values: number[], period: number): (number | null)[] => {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += values[j]!;
    out.push(sum / period);
  }
  return out;
};

const std = (
  values: number[],
  period: number,
  smaArr: (number | null)[]
): (number | null)[] => {
  const out: (number | null)[] = [];
  for (let i = 0; i < values.length; i++) {
    const m = smaArr[i];
    if (m == null || i < period - 1) {
      out.push(null);
      continue;
    }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) sumSq += (values[j]! - m) ** 2;
    out.push(Math.sqrt(sumSq / period));
  }
  return out;
};

const closes = rawCandles.map((c) => c.close);
const bbSma = sma(closes, BB_PERIOD);
const bbStd = std(closes, BB_PERIOD, bbSma);

const bbMiddle: { time: UTCTimestamp; value: number }[] = [];
const bbUpper: { time: UTCTimestamp; value: number }[] = [];
const bbLower: { time: UTCTimestamp; value: number }[] = [];
const bbPctB: { time: UTCTimestamp; value: number }[] = [];

for (let i = BB_PERIOD - 1; i < bars.length; i++) {
  const bar = bars[i];
  if (!bar) continue;
  const mid = bbSma[i];
  const s = bbStd[i];
  if (mid == null || s == null) continue;
  const t = bar.time;
  const upper = mid + BB_MULT * s;
  const lower = mid - BB_MULT * s;
  const range = upper - lower;
  const pctB = range !== 0 ? (closes[i]! - lower) / range : 0;
  bbMiddle.push({ time: t, value: mid });
  bbUpper.push({ time: t, value: upper });
  bbLower.push({ time: t, value: lower });
  bbPctB.push({ time: t, value: pctB });
}

const CCI_PERIOD = 20;
const getCCI = (candles: Candle[], period = 20): number | null => {
  if (candles.length < period) {
    return null;
  }
  const typicalPrices = candles.map(
    (candle) => (candle.high + candle.low + candle.close) / 3
  );
  const tpSlice = typicalPrices.slice(-period);
  const sma = tpSlice.reduce((sum, val) => sum + val, 0) / period;
  const meanDeviation =
    tpSlice.reduce((sum, val) => sum + Math.abs(val - sma), 0) / period;
  const currentTP = tpSlice[tpSlice.length - 1] || 0;
  if (meanDeviation === 0) return null;
  const cci = Number(((currentTP - sma) / (0.015 * meanDeviation)).toFixed(2));
  return cci;
};

const cciData: { time: UTCTimestamp; value: number }[] = [];

for (let i = CCI_PERIOD - 1; i < rawCandles.length; i++) {
  const bar = bars[i];
  if (!bar) continue;
  const candlesUpToNow = rawCandles.slice(0, i + 1);
  const cci = getCCI(candlesUpToNow, CCI_PERIOD);
  if (cci == null) continue;
  cciData.push({ time: bar.time, value: cci });
}

const getVWAP = (
  candles: Candle[]
): {
  middle: number;
  lower1: number;
  upper1: number;
  lower2: number;
  upper2: number;
} | null => {
  if (candles.length < 2) return null;
  const interval = candles[1]!.time - candles[0]!.time;
  const timeOfDay = candles[candles.length - 1]!.time % (24 * 60 * 60 * 1000);
  const count = Math.floor(timeOfDay / interval);
  const targetCandles = candles.slice(-count - 1);

  let pvSum = 0;
  let volumeSum = 0;
  for (let i = 0; i < targetCandles.length; i++) {
    const c = targetCandles[i]!;
    const typicalPrice = (c.high + c.low + c.close) / 3;
    pvSum += typicalPrice * c.volume;
    volumeSum += c.volume;
  }
  if (volumeSum === 0) return null;
  const vwap = pvSum / volumeSum;

  let varianceSum = 0;
  for (let i = 0; i < targetCandles.length; i++) {
    const c = targetCandles[i]!;
    varianceSum += c.volume * (c.close - vwap) ** 2;
  }
  const variance = varianceSum / volumeSum;
  const stdDev = Math.sqrt(variance);

  return {
    middle: Number(vwap.toFixed(3)),
    lower1: Number((vwap - stdDev).toFixed(3)),
    upper1: Number((vwap + stdDev).toFixed(3)),
    lower2: Number((vwap - stdDev * 2).toFixed(3)),
    upper2: Number((vwap + stdDev * 2).toFixed(3)),
  };
};

const getVWMA = (candles: Candle[], period = 20): number | null => {
  if (!candles || candles.length === 0) return null;
  if (candles.length <= period + 1) return null;
  const slice = candles.slice(-period);
  let weightedSum = 0;
  let volumeSum = 0;
  for (const c of slice) {
    weightedSum += c.close * c.volume;
    volumeSum += c.volume;
  }
  if (volumeSum === 0) return null;
  return Number((weightedSum / volumeSum).toFixed(3));
};

const VWMA_PERIOD = 20;
const vwmaData: { time: UTCTimestamp; value: number }[] = [];

for (let i = VWMA_PERIOD + 1; i < rawCandles.length; i++) {
  const bar = bars[i];
  if (!bar) continue;
  const candlesUpToNow = rawCandles.slice(0, i + 1);
  const v = getVWMA(candlesUpToNow, VWMA_PERIOD);
  if (v == null) continue;
  vwmaData.push({ time: bar.time, value: v });
}

const vwapMiddle: { time: UTCTimestamp; value: number }[] = [];
const vwapUpper1: { time: UTCTimestamp; value: number }[] = [];
const vwapLower1: { time: UTCTimestamp; value: number }[] = [];
const vwapUpper2: { time: UTCTimestamp; value: number }[] = [];
const vwapLower2: { time: UTCTimestamp; value: number }[] = [];

for (let i = 0; i < rawCandles.length; i++) {
  const bar = bars[i];
  if (!bar) continue;
  const candlesUpToNow = rawCandles.slice(0, i + 1);
  const v = getVWAP(candlesUpToNow);
  if (!v) continue;
  vwapMiddle.push({ time: bar.time, value: v.middle });
  vwapUpper1.push({ time: bar.time, value: v.upper1 });
  vwapLower1.push({ time: bar.time, value: v.lower1 });
  vwapUpper2.push({ time: bar.time, value: v.upper2 });
  vwapLower2.push({ time: bar.time, value: v.lower2 });
}

const localTimeStringToUTCTimestamp = (localTimeStr: string): UTCTimestamp => {
  const [datePart, timePart] = localTimeStr.split(", ");
  if (!datePart || !timePart) return 0 as UTCTimestamp;
  const [m, d, y] = datePart.split("/").map(Number);
  const [h, min, s] = timePart.split(":").map(Number);
  const date = new Date(
    y || 0,
    (m || 1) - 1,
    d || 1,
    h || 0,
    Number(min) - (Number(min) % 5) || 0,
    0
  );
  const utcSeconds = Math.floor(date.getTime() / 1000);
  return (utcSeconds + UTC_PLUS_1_OFFSET) as UTCTimestamp;
};

const jumpToTimestamp = (
  timestamp: UTCTimestamp,
  showRange?: { start: UTCTimestamp; end: UTCTimestamp }
) => {
  if (!chartInstance) return;
  selection.value.visible = false;
  const timeScale = chartInstance.timeScale();
  const priceScale = chartInstance.priceScale("right", 0);
  const bbScale = chartInstance.priceScale("right", 1);
  const cciScale = chartInstance.priceScale("right", 2);

  const currentRange = timeScale.getVisibleRange();
  if (!currentRange) return;

  let targetFrom: number;
  let targetTo: number;

  if (showRange) {
    targetFrom = showRange.start as number;
    targetTo = showRange.end as number;
  } else {
    const padding = 2 * 60 * 60; // 2 hours in seconds
    targetFrom = (timestamp as number) - padding;
    targetTo = (timestamp as number) + padding;
  }

  const startFrom = currentRange.from as number;
  const startTo = currentRange.to as number;
  const duration = 500; // Animation duration in milliseconds
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased =
      progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const currentFrom = startFrom + (targetFrom - startFrom) * eased;
    const currentTo = startTo + (targetTo - startTo) * eased;

    timeScale.setVisibleRange({
      from: currentFrom as UTCTimestamp,
      to: currentTo as UTCTimestamp,
    });

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
  timeScale.resetTimeScale();
  priceScale.applyOptions({
    autoScale: true,
  });
  bbScale.applyOptions({
    autoScale: true,
  });
  cciScale.applyOptions({
    autoScale: true,
  });
};

const moveToLatest = () => {
  if (!chartInstance || bars.length === 0) return;

  const timeScale = chartInstance.timeScale();
  const priceScale = chartInstance.priceScale("right", 0);
  const bbScale = chartInstance.priceScale("right", 1);
  const cciScale = chartInstance.priceScale("right", 2);
  const currentRange = timeScale.getVisibleRange();

  if (!currentRange) {
    timeScale.resetTimeScale();
    return;
  }

  const fullRange = timeScale.getVisibleLogicalRange();
  if (!fullRange) {
    timeScale.resetTimeScale();
    return;
  }

  const totalTimeRange = (currentRange.to as number) - (currentRange.from as number);
  const lastBarTime = bars[bars.length - 1]?.time as number;
  const targetTo = lastBarTime;
  const targetFrom = targetTo - totalTimeRange;

  timeScale.setVisibleRange({
    from: targetFrom as UTCTimestamp,
    to: targetTo as UTCTimestamp,
  });

  timeScale.resetTimeScale();

  priceScale.applyOptions({
    autoScale: true,
  });

  bbScale.applyOptions({
    autoScale: true,
  });
  cciScale.applyOptions({
    autoScale: true,
  });
};

const datetimeLocalToUTCTimestamp = (datetimeLocal: string): UTCTimestamp | null => {
  if (!datetimeLocal) return null;
  const date = new Date(datetimeLocal);
  if (isNaN(date.getTime())) return null;
  const utcSeconds = Math.floor(date.getTime() / 1000);
  return (utcSeconds + UTC_PLUS_1_OFFSET) as UTCTimestamp;
};

const jumpToSelectedTime = () => {
  if (!selectedDateTime.value) return;
  const timestamp = datetimeLocalToUTCTimestamp(selectedDateTime.value);
  if (!timestamp) return;
  jumpToTimestamp(timestamp);
  showCalendarPicker.value = false;
};

const showContextMenu = (event: MouseEvent) => {
  if (!chartContainer.value) return;
  const rect = chartContainer.value.getBoundingClientRect();
  contextMenu.value = {
    visible: true,
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const handleResetChart = () => {
  if (!chartInstance) return;

  const timeScale = chartInstance.timeScale();
  timeScale.resetTimeScale();

  timeScale.applyOptions({
    timeVisible: true,
    secondsVisible: false,
  });

  const mainPriceScale = chartInstance.priceScale("right", 0);
  mainPriceScale.applyOptions({
    autoScale: true,
  });

  const bbPctBPriceScale = chartInstance.priceScale("right", 1);
  bbPctBPriceScale.applyOptions({
    autoScale: true,
  });

  const cciPriceScale = chartInstance.priceScale("right", 2);
  cciPriceScale.applyOptions({
    autoScale: true,
  });

  contextMenu.value.visible = false;
};

const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return ``;
};

const updateSelectionDisplay = () => {
  if (
    !selection.value.startTime ||
    !selection.value.endTime ||
    selection.value.startPrice === null ||
    selection.value.endPrice === null
  ) {
    return;
  }

  const timeDiff =
    (selection.value.endTime as number) - (selection.value.startTime as number);
  selection.value.duration = formatDuration(timeDiff);

  const percentChange =
    ((selection.value.endPrice - selection.value.startPrice) /
      selection.value.startPrice) *
    20 *
    100;
  selection.value.percentChange = percentChange;
};

const findClosestBar = (
  time: import("lightweight-charts").Time
): { time: UTCTimestamp; close: number; open: number } | null => {
  let closestBar: { time: UTCTimestamp; close: number; open: number } | null = null;
  let minDiff = Infinity;

  // Convert time to number for comparison
  let timeNum: number;
  if (typeof time === "number") {
    timeNum = time;
  } else if (typeof time === "string") {
    timeNum = parseInt(time);
  } else {
    // BusinessDay - convert to timestamp
    const date = new Date(time.year, time.month - 1, time.day);
    timeNum = Math.floor(date.getTime() / 1000);
  }

  for (const bar of bars) {
    const diff = Math.abs((bar.time as number) - timeNum);
    if (diff < minDiff) {
      minDiff = diff;
      closestBar = { time: bar.time, close: bar.close, open: bar.open };
    }
  }

  return closestBar;
};

const handleKeyboardDown = (event: KeyboardEvent) => {
  if (event.key === "Shift" || event.shiftKey) {
    isShiftPressed = true;
  }
};

const handleKeyboardUp = (event: KeyboardEvent) => {
  if (event.key === "Shift") {
    isShiftPressed = false;
  }
};

const handleMouseDown = (event: MouseEvent) => {
  if (selection.value.visible && !selection.value.isDragging) {
    if (!candlestickSeriesRef) return;
    if (selectionStartPriceLine) {
      candlestickSeriesRef.removePriceLine(selectionStartPriceLine);
    }
    if (selectionEndPriceLine) {
      candlestickSeriesRef.removePriceLine(selectionEndPriceLine);
    }
    selection.value = {
      visible: false,
      isDragging: false,
      startTime: null,
      endTime: null,
      startPrice: null,
      endPrice: null,
      percentChange: 0,
      duration: "",
      rectStartX: 0,
      rectStartY: 0,
      rectEndX: 0,
      rectEndY: 0,
    };
  }
};

onMounted(async () => {
  if (!chartContainer.value) return;

  const {
    createChart,
    CandlestickSeries,
    LineSeries,
    createSeriesMarkers,
  } = await import("lightweight-charts");

  chartInstance = createChart(chartContainer.value, {
    layout: {
      background: { color: "#0F1A1Faa" },
      textColor: "#ffffff",
    },
    grid: {
      vertLines: { color: "#152025" },
      horzLines: { color: "#152025" },
    },
    width: chartContainer.value.clientWidth,
    height: 600,
    timeScale: {
      rightOffset: 10,
      timeVisible: true,
      secondsVisible: false,
    },
    rightPriceScale: {
      borderColor: "#2b2b43",
      scaleMargins: {
        top: 0.05,
        bottom: 0.05,
      },
    },
    crosshair: {
      vertLine: { visible: true, labelVisible: true },
      horzLine: { visible: false, labelVisible: false }, // Disable default, use custom price line
    },
  });

  const noPriceLine = { priceLineVisible: false, lastValueVisible: false };

  const candlestickSeries = chartInstance.addSeries(CandlestickSeries, {
    upColor: "#27A2A0",
    downColor: "#E3545B",
    borderDownColor: "#E3545B",
    borderUpColor: "#27A2A0",
    wickDownColor: "#E3545B",
    wickUpColor: "#27A2A0",
    priceLineVisible: false,
    lastValueVisible: true,
  });
  candlestickSeries.setData(bars);
  candlestickSeriesRef = candlestickSeries;

  chartInstance.panes()[0]?.setHeight(400);

  const bbUpperSeries = chartInstance.addSeries(LineSeries, {
    color: "#2962FF",
    lineWidth: 1,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  bbUpperSeries.setData(bbUpper);

  const bbMiddleSeries = chartInstance.addSeries(LineSeries, {
    color: "#2962FF",
    lineWidth: 1,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  bbMiddleSeries.setData(bbMiddle);

  const bbLowerSeries = chartInstance.addSeries(LineSeries, {
    color: "#2962FF",
    lineWidth: 1,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  bbLowerSeries.setData(bbLower);

  const vwapMiddleSeries = chartInstance.addSeries(LineSeries, {
    color: "#ffffff",
    lineWidth: 1,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  vwapMiddleSeries.setData(vwapMiddle);

  const vwapUpper2Series = chartInstance.addSeries(LineSeries, {
    color: "#9598A1aa",
    lineWidth: 1,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  vwapUpper2Series.setData(isSingleVWAP.value ? vwapMiddle : vwapUpper2);
  vwapUpper2SeriesRef = vwapUpper2Series;

  const vwapLower2Series = chartInstance.addSeries(LineSeries, {
    color: "#9598A1aa",
    lineWidth: 1,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  vwapLower2Series.setData(isSingleVWAP.value ? vwapMiddle : vwapLower2);
  vwapLower2SeriesRef = vwapLower2Series;

  const vwapUpper1Series = chartInstance.addSeries(LineSeries, {
    color: "#9598A1aa",
    lineWidth: 1,
    lineStyle: 2,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  vwapUpper1Series.setData(isSingleVWAP.value ? vwapMiddle : vwapUpper1);
  vwapUpper1SeriesRef = vwapUpper1Series;

  const vwapLower1Series = chartInstance.addSeries(LineSeries, {
    color: "#9598A1aa",
    lineWidth: 1,
    lineStyle: 2,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  vwapLower1Series.setData(isSingleVWAP.value ? vwapMiddle : vwapLower1);
  vwapLower1SeriesRef = vwapLower1Series;

  const vwmaSeries = chartInstance.addSeries(LineSeries, {
    color: "#F23645",
    lineWidth: 1,
    ...noPriceLine,
    crosshairMarkerVisible: false,
  });
  vwmaSeries.setData(vwmaData);

  const bbPctBSeries = chartInstance.addSeries(
    LineSeries,
    {
      color: "#22AB94",
      lineWidth: 1,
      ...noPriceLine,
      crosshairMarkerVisible: false,
    },
    1
  );
  bbPctBSeries.setData(bbPctB);
  bbPctBSeriesRef = bbPctBSeries;

  chartInstance.priceScale("right", 1).applyOptions({
    visible: true,
    borderVisible: true,
    scaleMargins: { top: 0.05, bottom: 0.05 },
    ticksVisible: false,
  });

  bbPctBLine003 = bbPctBSeries.createPriceLine({
    price: 0.03,
    color: "#9598A1",
    lineWidth: 1,
    lineStyle: 1,
    axisLabelVisible: true,
  });

  bbPctBLine097 = bbPctBSeries.createPriceLine({
    price: 0.97,
    color: "#9598A1",
    lineWidth: 1,
    lineStyle: 1,
    axisLabelVisible: true,
  });

  const cciSeries = chartInstance.addSeries(
    LineSeries,
    {
      color: "#FF9800",
      lineWidth: 1,
      ...noPriceLine,
      crosshairMarkerVisible: false,
    },
    2
  );
  cciSeries.setData(cciData);
  cciSeriesRef = cciSeries;

  chartInstance.priceScale("right", 2).applyOptions({
    visible: true,
    borderVisible: true,
    scaleMargins: { top: 0.05, bottom: 0.05 },
    ticksVisible: false,
  });

  cciLineUp = cciSeries.createPriceLine({
    price: 100,
    color: "#9598A1",
    lineWidth: 1,
    lineStyle: 1,
    axisLabelVisible: true,
  });

  cciLineDown = cciSeries.createPriceLine({
    price: -100,
    color: "#9598A1",
    lineWidth: 1,
    lineStyle: 1,
    axisLabelVisible: true,
  });

  chartInstance.timeScale();

  // Set all pane heights together after everything is initialized
  // Total chart height is 600px, so we distribute: 600px (main) + 100px (BB%B) + 100px (CCI) = 600px
  const setAllPaneHeights = () => {
    if (!chartInstance) return;
    const panes = chartInstance.panes();
    if (panes && panes.length >= 3) {
      // Set in reverse order (2, 1, 0) to ensure proper distribution
      panes[2]?.setHeight(100);
      panes[1]?.setHeight(100);
      panes[0]?.setHeight(400);
    }
  };

  // Set heights immediately
  setAllPaneHeights();

  const crosshairHandler = (param: unknown) => {
    if (!chartInstance || !chartContainer.value || !candlestickSeriesRef) return;
    const p = param as {
      point?: { x: number; y: number };
      seriesData?: Map<
        unknown,
        { open?: number; high?: number; low?: number; close?: number; value?: number }
      >;
      paneIndex: number;
    };
    if (!p.point || !p.seriesData) {
      if (crosshairPriceLine) {
        candlestickSeriesRef.removePriceLine(crosshairPriceLine);
        crosshairPriceLine = null;
      }
      if (crosshairBBPctBLine && bbPctBSeriesRef) {
        bbPctBSeriesRef.removePriceLine(crosshairBBPctBLine);
        crosshairBBPctBLine = null;
      }
      if (crosshairCCILine && cciSeriesRef) {
        cciSeriesRef.removePriceLine(crosshairCCILine);
        crosshairCCILine = null;
      }
      overlay.value = {
        visible: false,
        ohlc: null,
        percent: null,
        bb: null,
        vwap: null,
        vwma: null,
        bbPct: null,
        cci: null,
      };
      return;
    }
    const rect = chartContainer.value.getBoundingClientRect();

    const x = p.point.x - rect.left;
    const y = p.point.y - rect.top;

    const timeScale = chartInstance.timeScale();
    const time = timeScale.coordinateToTime(x);

    let rawPrice: number | null = null;
    const paneIndex = p.paneIndex ?? 0;

    if (paneIndex === 0 && candlestickSeriesRef) {
      rawPrice = candlestickSeriesRef.coordinateToPrice(y);
    } else if (paneIndex === 1 && bbPctBSeriesRef) {
      rawPrice = bbPctBSeriesRef.coordinateToPrice(y);
    } else if (paneIndex === 2 && cciSeriesRef) {
      rawPrice = cciSeriesRef.coordinateToPrice(y);
    }

    if (time === null || rawPrice === null) return;

    if (paneIndex === 0 && candlestickSeriesRef) {
      if (crosshairPriceLine) {
        candlestickSeriesRef.removePriceLine(crosshairPriceLine);
      }
      if (crosshairBBPctBLine && bbPctBSeriesRef) {
        bbPctBSeriesRef.removePriceLine(crosshairBBPctBLine);
        crosshairBBPctBLine = null;
      }
      if (crosshairCCILine && cciSeriesRef) {
        cciSeriesRef.removePriceLine(crosshairCCILine);
        crosshairCCILine = null;
      }
      crosshairPriceLine = candlestickSeriesRef.createPriceLine({
        price: rawPrice,
        color: "#9598A1",
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
      });
    } else if (paneIndex === 1 && bbPctBSeriesRef) {
      if (crosshairBBPctBLine) {
        bbPctBSeriesRef.removePriceLine(crosshairBBPctBLine);
      }
      if (crosshairPriceLine && candlestickSeriesRef) {
        candlestickSeriesRef.removePriceLine(crosshairPriceLine);
        crosshairPriceLine = null;
      }
      if (crosshairCCILine && cciSeriesRef) {
        cciSeriesRef.removePriceLine(crosshairCCILine);
        crosshairCCILine = null;
      }
      crosshairBBPctBLine = bbPctBSeriesRef.createPriceLine({
        price: rawPrice,
        color: "#9598A1",
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
      });
    } else if (paneIndex === 2 && cciSeriesRef) {
      if (crosshairCCILine) {
        cciSeriesRef.removePriceLine(crosshairCCILine);
      }
      if (crosshairPriceLine && candlestickSeriesRef) {
        candlestickSeriesRef.removePriceLine(crosshairPriceLine);
        crosshairPriceLine = null;
      }
      if (crosshairBBPctBLine && bbPctBSeriesRef) {
        bbPctBSeriesRef.removePriceLine(crosshairBBPctBLine);
        crosshairBBPctBLine = null;
      }
      crosshairCCILine = cciSeriesRef.createPriceLine({
        price: rawPrice,
        color: "#9598A1",
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
      });
    }

    const closestBar = findClosestBar(time);
    if (!closestBar) return;

    if (selection.value.isDragging && p.paneIndex == 0) {
      overlay.value = {
        visible: false,
        ohlc: null,
        percent: null,
        bb: null,
        vwap: null,
        vwma: null,
        bbPct: null,
        cci: null,
      };
      selection.value = {
        ...selection.value,
        endTime: closestBar.time,
        endPrice: rawPrice,
        rectEndX: p.point.x,
        rectEndY: p.point.y,
      };
      updateSelectionDisplay();
    } else {
      const seriesData = p.seriesData;
      const ohlcRaw = seriesData.get(candlestickSeries) as
        | { open: number; high: number; low: number; close: number }
        | undefined;
      const ohlc =
        ohlcRaw && typeof ohlcRaw.open === "number"
          ? { o: ohlcRaw.open, h: ohlcRaw.high, l: ohlcRaw.low, c: ohlcRaw.close }
          : null;
      const percent =
        ohlcRaw && typeof ohlcRaw.open === "number"
          ? {
              upper:
                ((ohlcRaw.high - Math.max(ohlcRaw.close, ohlcRaw.open)) /
                  (ohlcRaw.high - ohlcRaw.low)) *
                100,
              body:
                (Math.abs(ohlcRaw.open - ohlcRaw.close) / (ohlcRaw.high - ohlcRaw.low)) *
                100,
              lower:
                ((Math.min(ohlcRaw.close, ohlcRaw.open) - ohlcRaw.low) /
                  (ohlcRaw.high - ohlcRaw.low)) *
                100,
            }
          : null;
      const fmt = (n: number) => n.toFixed(3);
      const getVal = (series: unknown) =>
        (seriesData.get(series) as { value?: number } | undefined)?.value;
      const bbU = getVal(bbUpperSeries);
      const bbM = getVal(bbMiddleSeries);
      const bbL = getVal(bbLowerSeries);
      const bb =
        typeof bbU === "number" && typeof bbM === "number" && typeof bbL === "number"
          ? `${fmt(bbU)}, ${fmt(bbM)}, ${fmt(bbL)}`
          : null;
      const vwapUpper2 = getVal(vwapUpper2Series);
      const vwapMiddle = getVal(vwapMiddleSeries);
      const vwapLower2 = getVal(vwapLower2Series);
      const vwapUpper1 = getVal(vwapUpper1Series);
      const vwapLower1 = getVal(vwapLower1Series);
      const vwap =
        typeof vwapMiddle === "number"
          ? (() => {
              const parts: string[] = [fmt(vwapMiddle)];
              if (
                !isSingleVWAP.value &&
                typeof vwapUpper2 === "number" &&
                typeof vwapUpper1 === "number" &&
                typeof vwapLower1 === "number" &&
                typeof vwapLower2 === "number"
              )
                parts.push(
                  `${fmt(vwapUpper2)}, ${fmt(vwapUpper1)}, ${fmt(vwapLower1)}, ${fmt(
                    vwapLower2
                  )}`
                );
              return parts.join(", ");
            })()
          : null;
      const vwmaValue = getVal(vwmaSeries);
      const vwma = typeof vwmaValue === "number" ? `${fmt(vwmaValue)}` : null;
      const bbPctValue = getVal(bbPctBSeries);
      const bbPct = typeof bbPctValue === "number" ? `${bbPctValue.toFixed(2)}` : null;
      const cciValue = getVal(cciSeries);
      const cci = typeof cciValue === "number" ? `${cciValue.toFixed(2)}` : null;
      overlay.value = { visible: true, ohlc, percent, bb, vwap, vwma, bbPct, cci };
    }
  };
  crosshairHandlerRef = crosshairHandler;
  chartInstance.subscribeCrosshairMove(crosshairHandler);

  const mouseClickHandler = (param: unknown) => {
    if (!chartInstance || !chartContainer.value || !candlestickSeriesRef) return;
    const p = param as {
      point: { x: number; y: number };
      seriesData: Map<
        unknown,
        { open?: number; high?: number; low?: number; close?: number; value?: number }
      >;
      time?: number;
      paneIndex: number;
    };
    if (p.paneIndex != 0) return;
    const rect = chartContainer.value.getBoundingClientRect();

    const x = p.point.x - rect.left;
    const y = p.point.y - rect.top;

    const timeScale = chartInstance.timeScale();
    const time = timeScale.coordinateToTime(x);
    const rawPrice = candlestickSeriesRef.coordinateToPrice(y);

    if (time === null || rawPrice === null) return;

    const closestBar = findClosestBar(time);
    if (!closestBar) return;

    if (isShiftPressed) {
      if (selection.value.isDragging) {
        selection.value = {
          ...selection.value,
          isDragging: false,
          endTime: closestBar.time,
          endPrice: rawPrice,
          rectEndX: p.point.x,
          rectEndY: p.point.y,
        };
        selectionEndPriceLine = candlestickSeriesRef.createPriceLine({
          price: rawPrice,
          color: "#ffffff00",
          lineWidth: 1,
          lineStyle: 3,
          axisLabelVisible: true,
        });
      } else {
        selection.value = {
          ...selection.value,
          visible: true,
          isDragging: true,
          startTime: closestBar.time,
          endTime: closestBar.time,
          startPrice: rawPrice,
          endPrice: rawPrice,
          rectStartX: p.point.x,
          rectStartY: p.point.y,
          rectEndX: p.point.x,
          rectEndY: p.point.y,
        };
        if (selectionStartPriceLine) {
          candlestickSeriesRef.removePriceLine(selectionStartPriceLine);
        }
        if (selectionEndPriceLine) {
          candlestickSeriesRef.removePriceLine(selectionEndPriceLine);
        }
        selectionStartPriceLine = candlestickSeriesRef.createPriceLine({
          price: rawPrice,
          color: "#ffffff00",
          lineWidth: 1,
          lineStyle: 3,
          axisLabelVisible: true,
        });
      }
    } else {
      if (selection.value.isDragging) {
        selection.value = {
          ...selection.value,
          isDragging: false,
          endTime: closestBar.time,
          endPrice: rawPrice,
          rectEndX: p.point.x,
          rectEndY: p.point.y,
        };
        selectionEndPriceLine = candlestickSeriesRef.createPriceLine({
          price: rawPrice,
          color: "#ffffff00",
          lineWidth: 1,
          lineStyle: 3,
          axisLabelVisible: true,
        });
      } else {
        selection.value = {
          visible: false,
          isDragging: false,
          startTime: null,
          endTime: null,
          startPrice: null,
          endPrice: null,
          percentChange: 0,
          duration: "",
          rectStartX: 0,
          rectStartY: 0,
          rectEndX: 0,
          rectEndY: 0,
        };
        if (selectionStartPriceLine) {
          candlestickSeriesRef.removePriceLine(selectionStartPriceLine);
        }
        if (selectionEndPriceLine) {
          candlestickSeriesRef.removePriceLine(selectionEndPriceLine);
        }
      }
    }
  };
  mouseClickHandlerRef = mouseClickHandler;
  chartInstance.subscribeClick(mouseClickHandlerRef);

  window.addEventListener("keydown", handleKeyboardDown);
  window.addEventListener("keyup", handleKeyboardUp);

  if (chartContainer.value) {
    chartContainer.value.addEventListener("mousedown", handleMouseDown);
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (contextMenu.value.visible) {
      contextMenu.value.visible = false;
    }
  };
  window.addEventListener("click", handleClickOutside);

  clickHandlerRef = () => {
    window.removeEventListener("keydown", handleKeyboardDown);
    window.removeEventListener("keyup", handleKeyboardUp);
    window.removeEventListener("click", handleClickOutside);
    if (chartContainer.value) {
      chartContainer.value.removeEventListener("mousedown", handleMouseDown);
    }
  };

  // Mark chart as ready after initialization
  // Use requestAnimationFrame to ensure chart is visually rendered
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      isChartReady.value = true;
    });
  });
});

onUnmounted(() => {
  if (chartInstance) {
    if (crosshairHandlerRef) chartInstance.unsubscribeCrosshairMove(crosshairHandlerRef);
    if (mouseClickHandlerRef)
      chartInstance.unsubscribeCrosshairMove(mouseClickHandlerRef);
    if (candlestickSeriesRef && crosshairPriceLine) {
      candlestickSeriesRef.removePriceLine(crosshairPriceLine);
    }
    if (bbPctBSeriesRef && crosshairBBPctBLine) {
      bbPctBSeriesRef.removePriceLine(crosshairBBPctBLine);
    }
    if (bbPctBSeriesRef && bbPctBLine003) {
      bbPctBSeriesRef.removePriceLine(bbPctBLine003);
    }
    if (bbPctBSeriesRef && bbPctBLine097) {
      bbPctBSeriesRef.removePriceLine(bbPctBLine097);
    }
    if (cciSeriesRef && crosshairCCILine) {
      cciSeriesRef.removePriceLine(crosshairCCILine);
    }
    if (cciSeriesRef && cciLineUp) {
      cciSeriesRef.removePriceLine(cciLineUp);
    }
    if (cciSeriesRef && cciLineDown) {
      cciSeriesRef.removePriceLine(cciLineDown);
    }
    chartInstance.remove();
    chartInstance = null;
  }
  if (clickHandlerRef) {
    clickHandlerRef();
  }
});
</script>

<style scoped>
.loading-effect {
  width: 100%;
  height: 100%;
  max-width: 10rem; /* matches w-40 */
  max-height: 10rem;
  position: relative;
  display: inline-block;
}
.loading-effect .ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #14ffe9, #ffeb3b, #ff00e0, #14ffe9);
  filter: blur(10px);
  opacity: 0.9;
  animation: rotate 6s linear infinite;
  z-index: 2;
}
.loading-effect .ring::after {
  content: "";
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.85));
  z-index: 4;
}
.loading-effect .glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 0, 224, 0.12), 0 0 60px rgba(20, 255, 233, 0.06);
  filter: blur(18px);
  z-index: 1;
  animation: pulse 2.2s ease-in-out infinite;
}
.wow-img {
  position: relative;
  z-index: 6;
  border-radius: 50%;
  display: block;
}
.loading-effect .particles span {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.3)
  );
  box-shadow: 0 0 12px rgba(255, 200, 255, 0.7);
  opacity: 0.85;
}
.loading-effect .particles span:nth-child(1) {
  left: -8%;
  top: 40%;
  animation: floatA 3s ease-in-out infinite;
}
.loading-effect .particles span:nth-child(2) {
  right: -6%;
  top: 20%;
  animation: floatB 4s ease-in-out infinite;
}
.loading-effect .particles span:nth-child(3) {
  left: 10%;
  bottom: -6%;
  animation: floatC 3.6s ease-in-out infinite;
}
.loading-effect .particles span:nth-child(4) {
  right: 18%;
  bottom: -12%;
  animation: floatD 4.2s ease-in-out infinite;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(0.98);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.04);
    opacity: 1;
  }
}
@keyframes floatA {
  0% {
    transform: translateY(0) translateX(0) scale(1);
  }
  50% {
    transform: translateY(-8px) translateX(6px) scale(0.9);
  }
  100% {
    transform: translateY(0) translateX(0) scale(1);
  }
}
@keyframes floatB {
  0% {
    transform: translateY(0) translateX(0) scale(1);
  }
  50% {
    transform: translateY(-12px) translateX(-10px) scale(0.85);
  }
  100% {
    transform: translateY(0) translateX(0) scale(1);
  }
}
@keyframes floatC {
  0% {
    transform: translateY(0) translateX(0) scale(1);
  }
  50% {
    transform: translateY(-6px) translateX(8px) scale(0.95);
  }
  100% {
    transform: translateY(0) translateX(0) scale(1);
  }
}
@keyframes floatD {
  0% {
    transform: translateY(0) translateX(0) scale(1);
  }
  50% {
    transform: translateY(-10px) translateX(-6px) scale(0.9);
  }
  100% {
    transform: translateY(0) translateX(0) scale(1);
  }
}
</style>
