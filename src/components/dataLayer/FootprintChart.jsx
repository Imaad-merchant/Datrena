import { useRef, useEffect, useState, useCallback } from 'react';

const CANDLE_WIDTH = 80;
const PRICE_TICK = 0.25;
const ROW_HEIGHT = 14;
const HEADER_H = 40;
const FOOTER_H = 50;
const PRICE_AXIS_W = 70;

function generateFootprintData(candles) {
  return candles.map(c => {
    const range = Math.abs(c.high - c.low);
    const ticks = Math.max(4, Math.round(range / PRICE_TICK));
    const rows = [];
    for (let i = 0; i <= ticks; i++) {
      const price = parseFloat((c.low + i * PRICE_TICK).toFixed(2));
      const bid = Math.floor(Math.random() * 300) + 1;
      const ask = Math.floor(Math.random() * 300) + 1;
      rows.push({ price, bid, ask });
    }
    rows.sort((a, b) => b.price - a.price);
    const delta = rows.reduce((s, r) => s + r.ask - r.bid, 0);
    const volume = rows.reduce((s, r) => s + r.bid + r.ask, 0);
    return { ...c, rows, delta, volume };
  });
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FootprintChart({ candles }) {
  const canvasRef = useRef(null);
  const [pan, setPan] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const panStart = useRef(0);
  const [crosshair, setCrosshair] = useState(null);
  const [colW, setColW] = useState(CANDLE_WIDTH);

  const data = useRef([]);
  useEffect(() => {
    if (candles?.length) data.current = generateFootprintData(candles);
  }, [candles]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.current.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, W, H);

    const d = data.current;
    const visibleStart = Math.max(0, Math.floor(-pan / colW));
    const visibleEnd = Math.min(d.length, visibleStart + Math.ceil((W - PRICE_AXIS_W) / colW) + 1);
    const visible = d.slice(visibleStart, visibleEnd);

    if (!visible.length) return;

    const allPrices = visible.flatMap(c => c.rows.map(r => r.price));
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const priceRange = maxP - minP || 1;
    const chartH = H - HEADER_H - FOOTER_H;
    const priceToY = p => HEADER_H + chartH - ((p - minP) / priceRange) * chartH;

    // Draw price grid lines
    const tickStep = Math.ceil((maxP - minP) / 10 / PRICE_TICK) * PRICE_TICK;
    for (let p = minP; p <= maxP; p = parseFloat((p + tickStep).toFixed(2))) {
      const y = priceToY(p);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W - PRICE_AXIS_W, y);
      ctx.stroke();
      ctx.fillStyle = '#555';
      ctx.font = '10px monospace';
      ctx.fillText(p.toFixed(2), W - PRICE_AXIS_W + 4, y + 4);
    }

    // Draw candles + footprint
    visible.forEach((c, i) => {
      const idx = visibleStart + i;
      const x = idx * colW + pan;
      if (x + colW < 0 || x > W - PRICE_AXIS_W) return;

      const isUp = c.close >= c.open;
      const candleColor = isUp ? '#26a69a' : '#ef5350';

      // Wick
      const wickX = x + colW / 2;
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wickX, priceToY(c.high));
      ctx.lineTo(wickX, priceToY(c.low));
      ctx.stroke();

      // Candle body
      const bodyTop = priceToY(Math.max(c.open, c.close));
      const bodyBot = priceToY(Math.min(c.open, c.close));
      const bodyH = Math.max(2, bodyBot - bodyTop);
      ctx.fillStyle = candleColor + '55';
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1;
      ctx.fillRect(x + 2, bodyTop, colW - 4, bodyH);
      ctx.strokeRect(x + 2, bodyTop, colW - 4, bodyH);

      // Bid x Ask rows
      const maxVol = Math.max(...c.rows.map(r => r.bid + r.ask));
      c.rows.forEach(row => {
        const ry = priceToY(row.price);
        const rowH = ROW_HEIGHT;
        const volRatio = (row.bid + row.ask) / maxVol;
        const bidAsk = row.ask - row.bid;

        // Background heat
        const heat = Math.floor(volRatio * 120);
        ctx.fillStyle = bidAsk > 0 ? `rgba(38,166,154,${volRatio * 0.35})` : `rgba(239,83,80,${volRatio * 0.35})`;
        ctx.fillRect(x + 1, ry - rowH / 2, colW - 2, rowH);

        // Text
        ctx.font = `${Math.min(9, colW / 10)}px monospace`;
        ctx.fillStyle = bidAsk > 0 ? '#26a69a' : '#ef5350';
        const label = `${row.bid}x${row.ask}`;
        ctx.fillText(label, x + 2, ry + 3);
      });

      // Delta below
      ctx.font = '10px monospace';
      ctx.fillStyle = c.delta >= 0 ? '#26a69a' : '#ef5350';
      ctx.fillText(c.delta > 0 ? `+${c.delta}` : `${c.delta}`, x + 2, H - FOOTER_H + 14);

      // Volume
      ctx.fillStyle = '#555';
      ctx.fillText(c.volume, x + 2, H - FOOTER_H + 28);

      // Time header
      ctx.fillStyle = '#666';
      ctx.font = '9px monospace';
      ctx.fillText(formatTime(c.timestamp), x + 2, HEADER_H - 22);
      ctx.fillText(formatDate(c.timestamp), x + 2, HEADER_H - 10);
    });

    // Footer labels
    ctx.fillStyle = '#444';
    ctx.font = '9px monospace';
    ctx.fillText('Delta', W - PRICE_AXIS_W - 50, H - FOOTER_H + 14);
    ctx.fillText('Volume', W - PRICE_AXIS_W - 50, H - FOOTER_H + 28);

    // Crosshair
    if (crosshair) {
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(crosshair.x, 0);
      ctx.lineTo(crosshair.x, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, crosshair.y);
      ctx.lineTo(W, crosshair.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      const hovPrice = minP + ((chartH - (crosshair.y - HEADER_H)) / chartH) * priceRange;
      ctx.fillStyle = '#333';
      ctx.fillRect(W - PRICE_AXIS_W, crosshair.y - 9, PRICE_AXIS_W, 16);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(hovPrice.toFixed(2), W - PRICE_AXIS_W + 4, crosshair.y + 4);
    }
  }, [pan, crosshair, colW]);

  useEffect(() => { draw(); }, [draw]);

  const onMouseDown = e => {
    setDragging(true);
    dragStart.current = e.clientX;
    panStart.current = pan;
  };
  const onMouseMove = e => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) setCrosshair({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    if (dragging) setPan(panStart.current + (e.clientX - dragStart.current));
  };
  const onMouseUp = () => setDragging(false);
  const onWheel = e => {
    e.preventDefault();
    setColW(w => Math.max(40, Math.min(160, w - e.deltaY * 0.1)));
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth - 300}
      height={window.innerHeight - 160}
      className="cursor-crosshair block"
      style={{ background: '#0d0d0d' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { onMouseUp(); setCrosshair(null); }}
      onWheel={onWheel}
    />
  );
}