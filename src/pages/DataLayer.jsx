import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import FootprintChart from '@/components/dataLayer/FootprintChart';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainNav from '@/components/navigation/MainNav';

const SYMBOLS = ['ES', 'NQ', 'CL', 'GC', 'RTY'];
const TIMEFRAMES = ['1 Minute', '5 Minute', '15 Minute', '30 Minute', '1 Hour'];

export default function DataLayer() {
  const [symbol, setSymbol] = useState('ES');
  const [timeframe, setTimeframe] = useState('5 Minute');
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const tickerMap = { ES: 'ES=F', NQ: 'NQ=F', CL: 'CL=F', GC: 'GC=F', RTY: 'RTY=F' };
      const intervalMap = { '1 Minute': '1m', '5 Minute': '5m', '15 Minute': '15m', '30 Minute': '30m', '1 Hour': '60m' };
      const rangeMap = { '1 Minute': '1d', '5 Minute': '5d', '15 Minute': '5d', '30 Minute': '1mo', '1 Hour': '1mo' };

      const res = await base44.functions.invoke('fetchYahooHistory', {
        symbol: tickerMap[symbol],
        interval: intervalMap[timeframe],
        range: rangeMap[timeframe],
      });

      const chart = res.data?.chart?.result?.[0];
      if (chart) {
        const timestamps = chart.timestamp || [];
        const q = chart.indicators?.quote?.[0] || {};
        const raw = timestamps.map((ts, i) => ({
          timestamp: ts * 1000,
          open: q.open?.[i],
          high: q.high?.[i],
          low: q.low?.[i],
          close: q.close?.[i],
          volume: q.volume?.[i],
        })).filter(c => c.open && c.high && c.low && c.close);
        setCandles(raw);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [symbol, timeframe]);

  return (
    <div className="bg-black min-h-screen flex">
      <MainNav />
      <div className="ml-16 flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 bg-gray-950">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-28 h-8 bg-gray-900 border-gray-700 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {SYMBOLS.map(s => <SelectItem key={s} value={s} className="text-white text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32 h-8 bg-gray-900 border-gray-700 text-white text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {TIMEFRAMES.map(t => <SelectItem key={t} value={t} className="text-white text-xs">{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button size="sm" variant="ghost" onClick={fetchData} disabled={loading} className="h-8 text-gray-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <span className="text-gray-600 text-xs ml-2">Drag to pan • Scroll to zoom columns</span>
        </div>

        {/* Chart */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : candles.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">No data</div>
          ) : (
            <FootprintChart candles={candles} />
          )}
        </div>
      </div>
    </div>
  );
}