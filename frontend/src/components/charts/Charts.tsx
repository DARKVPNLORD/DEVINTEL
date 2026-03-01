import { useMemo } from 'react';
import { clsx } from 'clsx';

// ============================================================
// RADAR CHART (SVG)
// ============================================================
export interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
  className?: string;
}

export function RadarChart({ data, size = 280, className }: RadarChartProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const levels = 5;

  const points = useMemo(() => {
    const count = data.length;
    return data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = (d.value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 24) * Math.cos(angle),
        labelY: center + (radius + 24) * Math.sin(angle),
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
      return {
        x2: center + radius * Math.cos(angle),
        y2: center + radius * Math.sin(angle),
      };
    });
  }, [data, center, radius]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={clsx('overflow-visible', className)}
    >
      {/* Grid polygons */}
      {gridPolygons.map((poly, i) => (
        <polygon
          key={i}
          points={poly}
          fill="none"
          stroke="currentColor"
          className="text-surface-200 dark:text-surface-700"
          strokeWidth={0.5}
        />
      ))}

      {/* Axes */}
      {axes.map((axis, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={axis.x2}
          y2={axis.y2}
          stroke="currentColor"
          className="text-surface-200 dark:text-surface-700"
          strokeWidth={0.5}
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        className="fill-brand-500/20 stroke-brand-500"
        strokeWidth={2}
      />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} className="fill-brand-500" />
      ))}

      {/* Labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-surface-600 dark:fill-surface-400 text-[10px] font-medium"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// ============================================================
// LINE CHART (SVG)
// ============================================================
export interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  className?: string;
  color?: string;
  showArea?: boolean;
}

export function LineChart({
  data,
  height = 200,
  className,
  color = '#6366f1',
  showArea = true,
}: LineChartProps) {
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

    const tickCount = 5;
    const yTks = Array.from({ length: tickCount + 1 }, (_, i) => {
      const val = minVal + (range * i) / tickCount;
      return {
        y: padding.top + innerH - (i / tickCount) * innerH,
        label: Math.round(val).toString(),
      };
    });

    const step = Math.max(1, Math.floor(data.length / 6));
    const xLbls = data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map((d, _, arr) => {
        const idx = data.indexOf(d);
        return {
          x: padding.left + (idx / Math.max(data.length - 1, 1)) * innerW,
          label: d.label,
        };
      });

    return { path: pathD, areaPath: areaD, points: pts, yTicks: yTks, xLabels: xLbls, width: w };
  }, [data, height, padding]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={clsx('w-full', className)} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={t.y}
            x2={width - padding.right}
            y2={t.y}
            stroke="currentColor"
            className="text-surface-100 dark:text-surface-800"
            strokeWidth={1}
          />
          <text
            x={padding.left - 8}
            y={t.y}
            textAnchor="end"
            dominantBaseline="central"
            className="fill-surface-400 dark:fill-surface-500 text-[10px]"
          >
            {t.label}
          </text>
        </g>
      ))}

      {/* X labels */}
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={height - 6}
          textAnchor="middle"
          className="fill-surface-400 dark:fill-surface-500 text-[10px]"
        >
          {l.label}
        </text>
      ))}

      {/* Area */}
      {showArea && <path d={areaPath} fill={color} opacity={0.1} />}

      {/* Line */}
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </svg>
  );
}

// ============================================================
// ACTIVITY HEATMAP (SVG)
// ============================================================
export interface HeatmapProps {
  data: { date: string; count: number }[];
  className?: string;
}

export function ActivityHeatmap({ data, className }: HeatmapProps) {
  const cellSize = 12;
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
        cells.push({
          x: w * (cellSize + gap),
          y: d * (cellSize + gap),
          count: map.get(dateStr) || 0,
          date: dateStr,
        });
      }
    }

    return { cells, maxCount: max };
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'fill-surface-100 dark:fill-surface-800';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return 'fill-brand-200 dark:fill-brand-900';
    if (intensity <= 0.5) return 'fill-brand-400 dark:fill-brand-700';
    if (intensity <= 0.75) return 'fill-brand-500 dark:fill-brand-500';
    return 'fill-brand-600 dark:fill-brand-400';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className={clsx('overflow-x-auto', className)}>
      <svg
        width={weeks * (cellSize + gap) + 30}
        height={days * (cellSize + gap) + 6}
        className="overflow-visible"
      >
        {/* Day labels */}
        {dayLabels.map((label, i) =>
          label ? (
            <text
              key={i}
              x={0}
              y={i * (cellSize + gap) + cellSize / 2}
              dominantBaseline="central"
              className="fill-surface-400 dark:fill-surface-500 text-[9px]"
            >
              {label}
            </text>
          ) : null
        )}

        <g transform="translate(28, 0)">
          {cells.map((cell, i) => (
            <rect
              key={i}
              x={cell.x}
              y={cell.y}
              width={cellSize}
              height={cellSize}
              rx={2}
              className={clsx(getColor(cell.count), 'transition-colors')}
            >
              <title>{`${cell.date}: ${cell.count} contributions`}</title>
            </rect>
          ))}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[10px] text-surface-400 mr-1">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((level, i) => (
          <div
            key={i}
            className={clsx(
              'w-3 h-3 rounded-sm',
              level === 0
                ? 'bg-surface-100 dark:bg-surface-800'
                : level <= 0.25
                ? 'bg-brand-200 dark:bg-brand-900'
                : level <= 0.5
                ? 'bg-brand-400 dark:bg-brand-700'
                : level <= 0.75
                ? 'bg-brand-500 dark:bg-brand-500'
                : 'bg-brand-600 dark:bg-brand-400'
            )}
          />
        ))}
        <span className="text-[10px] text-surface-400 ml-1">More</span>
      </div>
    </div>
  );
}

// ============================================================
// DONUT / RING CHART (SVG)
// ============================================================
export interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  className?: string;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  data,
  size = 200,
  thickness = 30,
  className,
  centerLabel,
  centerValue,
}: DonutChartProps) {
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

      const path = [
        `M${x1},${y1}`,
        `A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2}`,
        `L${x3},${y3}`,
        `A${innerR},${innerR} 0 ${largeArc} 0 ${x4},${y4}`,
        'Z',
      ].join(' ');

      return { path, color: d.color, label: d.label, percentage };
    });
  }, [data, center, outerR, innerR, total]);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className}>
      {segments.map((seg, i) => (
        <path key={i} d={seg.path} fill={seg.color} className="transition-all hover:opacity-80">
          <title>{`${seg.label}: ${Math.round(seg.percentage * 100)}%`}</title>
        </path>
      ))}

      {(centerLabel || centerValue) && (
        <>
          {centerValue && (
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              className="fill-surface-900 dark:fill-white text-2xl font-bold"
            >
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              className="fill-surface-500 text-xs"
            >
              {centerLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
