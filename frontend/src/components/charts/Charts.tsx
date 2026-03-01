import { useMemo } from 'react';
import { clsx } from 'clsx';

// ============================================================
// RADAR CHART
// ============================================================
export interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
  className?: string;
}

export function RadarChart({ data, size = 280, className }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.36;
  const levels = 4;

  const points = useMemo(() => {
    const count = data.length;
    return data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = (d.value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 28) * Math.cos(angle),
        labelY: center + (radius + 28) * Math.sin(angle),
        label: d.label,
        value: d.value,
      };
    });
  }, [data, center, radius]);

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  const gridPolygons = useMemo(() => {
    return Array.from({ length: levels }, (_, level) => {
      const r = (radius * (level + 1)) / levels;
      return data
        .map((_, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        })
        .join(' ');
    });
  }, [data, center, radius, levels]);

  const axes = useMemo(() => {
    return data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      return { x2: center + radius * Math.cos(angle), y2: center + radius * Math.sin(angle) };
    });
  }, [data, center, radius]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={clsx('overflow-visible', className)}>
      {gridPolygons.map((poly, i) => (
        <polygon key={i} points={poly} fill="none" stroke="#2a2a2a" strokeWidth={0.5} />
      ))}
      {axes.map((axis, i) => (
        <line key={i} x1={center} y1={center} x2={axis.x2} y2={axis.y2} stroke="#2a2a2a" strokeWidth={0.5} />
      ))}
      <polygon points={polygonPoints} fill="rgba(215, 25, 33, 0.12)" stroke="#d71921" strokeWidth={1.5} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#d71921" />
      ))}
      {points.map((p, i) => (
        <text key={i} x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="central" fill="#737373" fontSize="10" fontFamily="'Space Mono', monospace">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// ============================================================
// LINE CHART
// ============================================================
export interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  color?: string;
  showArea?: boolean;
}

export function LineChart({ data, height = 200, className, color = '#d71921', showArea = true }: LineChartProps) {
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const { path, areaPath, points, yTicks, xLabels, width } = useMemo(() => {
    const w = 600;
    const innerW = w - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    if (!data.length) return { path: '', areaPath: '', points: [], yTicks: [], xLabels: [], width: w };

    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const minVal = 0;
    const range = maxVal - minVal || 1;

    const pts = data.map((d, i) => ({
      x: padding.left + (i / Math.max(data.length - 1, 1)) * innerW,
      y: padding.top + innerH - ((d.value - minVal) / range) * innerH,
      label: d.label,
      value: d.value,
    }));

    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const areaD = `${pathD} L${pts[pts.length - 1].x},${padding.top + innerH} L${pts[0].x},${padding.top + innerH} Z`;

    const tickCount = 4;
    const yTks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const val = minVal + (range * i) / tickCount;
      return { y: padding.top + innerH - (i / tickCount) * innerH, label: Math.round(val).toString() };
    });

    const step = Math.max(1, Math.floor(data.length / 5));
    const xLbls = data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map((d) => {
        const idx = data.indexOf(d);
        return { x: padding.left + (idx / Math.max(data.length - 1, 1)) * innerW, label: d.label };
      });

    return { path: pathD, areaPath: areaD, points: pts, yTicks: yTks, xLabels: xLbls, width: w };
  }, [data, height, padding]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={clsx('w-full', className)} preserveAspectRatio="xMidYMid meet">
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padding.left} y1={t.y} x2={width - padding.right} y2={t.y} stroke="#1a1a1a" strokeWidth={1} />
          <text x={padding.left - 8} y={t.y} textAnchor="end" dominantBaseline="central" fill="#525252" fontSize="10" fontFamily="'Space Mono', monospace">{t.label}</text>
        </g>
      ))}
      {xLabels.map((l, i) => (
        <text key={i} x={l.x} y={height - 6} textAnchor="middle" fill="#525252" fontSize="9" fontFamily="'Space Mono', monospace">{l.label}</text>
      ))}
      {showArea && <path d={areaPath} fill={color} opacity={0.06} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={color} />
      ))}
    </svg>
  );
}

// ============================================================
// ACTIVITY HEATMAP
// ============================================================
export interface HeatmapProps {
  data: { date: string; count: number }[];
  className?: string;
}

export function ActivityHeatmap({ data, className }: HeatmapProps) {
  const cellSize = 11;
  const gap = 2;
  const weeks = 52;
  const days = 7;

  const { cells, maxCount } = useMemo(() => {
    const map = new Map(data.map((d) => [d.date, d.count]));
    const max = Math.max(...data.map((d) => d.count), 1);
    const today = new Date();
    const cells: { x: number; y: number; count: number; date: string }[] = [];

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - ((weeks - 1 - w) * 7 + (6 - d)));
        const dateStr = date.toISOString().split('T')[0];
        cells.push({ x: w * (cellSize + gap), y: d * (cellSize + gap), count: map.get(dateStr) || 0, date: dateStr });
      }
    }

    return { cells, maxCount: max };
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return '#1a1a1a';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return '#3d1012';
    if (intensity <= 0.5) return '#7a1a1e';
    if (intensity <= 0.75) return '#b5181d';
    return '#d71921';
  };

  const dayLabels = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <svg width={weeks * (cellSize + gap) + 24} height={days * (cellSize + gap) + 4} className="overflow-visible">
        {dayLabels.map((label, i) =>
          label ? (
            <text key={i} x={0} y={i * (cellSize + gap) + cellSize / 2} dominantBaseline="central" fill="#404040" fontSize="8" fontFamily="'Space Mono', monospace">{label}</text>
          ) : null
        )}
        <g transform="translate(20, 0)">
          {cells.map((cell, i) => (
            <rect key={i} x={cell.x} y={cell.y} width={cellSize} height={cellSize} fill={getColor(cell.count)} className="transition-colors duration-200">
              <title>{`${cell.date}: ${cell.count}`}</title>
            </rect>
          ))}
        </g>
      </svg>
      <div className="flex items-center gap-1 mt-3 justify-end">
        <span className="text-[9px] text-nothing-grey-500 font-mono mr-1">Less</span>
        {['#1a1a1a', '#3d1012', '#7a1a1e', '#b5181d', '#d71921'].map((c, i) => (
          <div key={i} className="w-[10px] h-[10px]" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[9px] text-nothing-grey-500 font-mono ml-1">More</span>
      </div>
    </div>
  );
}

// ============================================================
// DONUT CHART
// ============================================================
export interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  className?: string;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({ data, size = 200, thickness = 24, className, centerLabel, centerValue }: DonutChartProps) {
  const center = size / 2;
  const outerR = center - 10;
  const innerR = outerR - thickness;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const segments = useMemo(() => {
    let currentAngle = -90;
    return data.map((d) => {
      const percentage = total > 0 ? d.value / total : 0;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const largeArc = angle > 180 ? 1 : 0;

      const x1 = center + outerR * Math.cos(startRad);
      const y1 = center + outerR * Math.sin(startRad);
      const x2 = center + outerR * Math.cos(endRad);
      const y2 = center + outerR * Math.sin(endRad);
      const x3 = center + innerR * Math.cos(endRad);
      const y3 = center + innerR * Math.sin(endRad);
      const x4 = center + innerR * Math.cos(startRad);
      const y4 = center + innerR * Math.sin(startRad);

      const path = [`M${x1},${y1}`, `A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2}`, `L${x3},${y3}`, `A${innerR},${innerR} 0 ${largeArc} 0 ${x4},${y4}`, 'Z'].join(' ');
      return { path, color: d.color, label: d.label, percentage };
    });
  }, [data, center, outerR, innerR, total]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className}>
      {segments.map((seg, i) => (
        <path key={i} d={seg.path} fill={seg.color} className="transition-all duration-300 hover:opacity-70">
          <title>{`${seg.label}: ${Math.round(seg.percentage * 100)}%`}</title>
        </path>
      ))}
      {(centerLabel || centerValue) && (
        <>
          {centerValue && (
            <text x={center} y={center - 6} textAnchor="middle" fill="#fafafa" fontSize="22" fontWeight="700" fontFamily="'Space Mono', monospace">{centerValue}</text>
          )}
          {centerLabel && (
            <text x={center} y={center + 14} textAnchor="middle" fill="#525252" fontSize="10" fontFamily="'Space Mono', monospace">{centerLabel}</text>
          )}
        </>
      )}
    </svg>
  );
}
