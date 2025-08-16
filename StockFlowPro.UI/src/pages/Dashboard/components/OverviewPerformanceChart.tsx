import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Download, RefreshCw } from 'lucide-react';

interface Point {
  month: string;
  view: number;
  completion: number;
}

interface ChartProps {
  data?: Point[];
  isLoading?: boolean;
  error?: string | null;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  theme?: 'light' | 'dark';
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'png' | 'svg') => void;
  className?: string;
}

// Mock data
const MOCK_DATA: Point[] = [
  { month: 'Jan', view: 12, completion: 8 },
  { month: 'Feb', view: 19, completion: 12 },
  { month: 'Mar', view: 27, completion: 18 },
  { month: 'Apr', view: 25, completion: 20 },
  { month: 'May', view: 35, completion: 28 },
  { month: 'Jun', view: 42, completion: 35 },
  { month: 'Jul', view: 45, completion: 38 },
  { month: 'Aug', view: 38, completion: 30 },
  { month: 'Sep', view: 48, completion: 40 },
  { month: 'Oct', view: 52, completion: 45 },
  { month: 'Nov', view: 47, completion: 41 },
  { month: 'Dec', view: 55, completion: 48 }
];

const CHART_PADDING = { top: 20, right: 40, bottom: 30, left: 40 };
const CHART_HEIGHT = 250;

// Utility functions
const getPath = (data: number[], width: number, height: number, maxY: number): string => {
  const innerW = Math.max(0, width - CHART_PADDING.left - CHART_PADDING.right);
  const innerH = Math.max(0, height - CHART_PADDING.top - CHART_PADDING.bottom);
  const stepX = innerW / Math.max(data.length - 1, 1);

  return data
    .map((value, index) => {
      const x = CHART_PADDING.left + index * stepX;
      const y = CHART_PADDING.top + innerH - (value / maxY) * innerH;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
};

const getArea = (data: number[], width: number, height: number, maxY: number): string => {
  const innerW = Math.max(0, width - CHART_PADDING.left - CHART_PADDING.right);
  const innerH = Math.max(0, height - CHART_PADDING.top - CHART_PADDING.bottom);
  const stepX = innerW / Math.max(data.length - 1, 1);

  const baseline = CHART_PADDING.top + innerH;
  const points = data
    .map((value, index) => {
      const x = CHART_PADDING.left + index * stepX;
      const y = CHART_PADDING.top + innerH - (value / maxY) * innerH;
      return `${x} ${y}`;
    })
    .join(' L ');

  return `M ${CHART_PADDING.left} ${baseline} L ${points} L ${CHART_PADDING.left + (data.length - 1) * stepX} ${baseline} Z`;
};

const LegendDot: React.FC<{ color: string }> = ({ color }) => (
  <span className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }}></span>
);

const OverviewPerformanceChart: React.FC<ChartProps> = ({
  data = MOCK_DATA,
  isLoading = false,
  error = null,
  showLegend = true,
  showTooltip = true,
  animate = true,
  theme = 'light',
  onRefresh,
  onExport,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [showView, setShowView] = useState(true);
  const [showCompletion, setShowCompletion] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [width, setWidth] = useState(800);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [isChartVisible, setIsChartVisible] = useState(false);

  // Animation timing for staggered effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChartVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced CSS animations
  const chartAnimationStyles = `
    .chart-container {
      animation: slideInUp 0.6s ease-out forwards;
    }
    
    .chart-header {
      animation: fadeInDown 0.8s ease-out 0.2s both;
    }
    
    .chart-legend-item {
      animation: fadeInLeft 0.6s ease-out both;
      transition: all 0.3s ease;
    }
    
    .chart-legend-item:nth-child(1) { animation-delay: 0.3s; }
    .chart-legend-item:nth-child(2) { animation-delay: 0.4s; }
    
    .chart-export-btn {
      animation: fadeInRight 0.6s ease-out 0.5s both;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .chart-export-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .chart-main {
      animation: scaleIn 0.8s ease-out 0.6s both;
    }
    
    .chart-donut {
      animation: slideInRight 0.8s ease-out 0.8s both;
    }
    
    .chart-point {
      animation: popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
      transform-origin: center;
    }
    
    .chart-line {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawLine 2s ease-out 1s both;
    }
    
    .chart-area {
      opacity: 0;
      animation: fadeInArea 1.5s ease-out 1.2s both;
    }
    
    .chart-grid-line {
      opacity: 0;
      animation: fadeInGrid 0.8s ease-out both;
    }
    
    .chart-x-label {
      opacity: 0;
      transform: translateY(10px);
      animation: slideUpLabel 0.6s ease-out both;
    }
    
    .chart-tooltip {
      animation: tooltipBounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .floating-animation {
      animation: float 3s ease-in-out infinite;
    }
    
    .pulse-on-hover:hover {
      animation: pulse 0.6s ease-in-out;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes popIn {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes drawLine {
      to {
        stroke-dashoffset: 0;
      }
    }
    
    @keyframes fadeInArea {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes fadeInGrid {
      from {
        opacity: 0;
      }
      to {
        opacity: 0.5;
      }
    }
    
    @keyframes slideUpLabel {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes tooltipBounce {
      0% {
        opacity: 0;
        transform: translateX(-50%) scale(0.8);
      }
      50% {
        transform: translateX(-50%) scale(1.05);
      }
      100% {
        opacity: 1;
        transform: translateX(-50%) scale(1);
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-5px);
      }
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
  `;

  // Data validation
  const validatedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return MOCK_DATA;
    return data.filter(d => 
      d && typeof d === 'object' && 
      typeof d.view === 'number' && 
      typeof d.completion === 'number'
    );
  }, [data]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newWidth } = entry.contentRect;
        setWidth(Math.max(300, newWidth - 48)); // Account for padding
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Export handler
  const handleExport = (format: 'csv' | 'png' | 'svg') => {
    setExportDropdownOpen(false);
    if (onExport) {
      onExport(format);
      return;
    }

    // Built-in export functionality
    if (format === 'csv') {
      const headers = ['Month', 'Views', 'Completions'];
      const csvData = [
        headers.join(','),
        ...validatedData.map(d => `${d.month},${d.view},${d.completion}`)
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guide-performance-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'png' && svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = width;
      canvas.height = CHART_HEIGHT;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `guide-performance-${new Date().toISOString().split('T')[0]}.png`;
        a.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    } else if (format === 'svg' && svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guide-performance-${new Date().toISOString().split('T')[0]}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'e':
            e.preventDefault();
            setExportDropdownOpen(!exportDropdownOpen);
            break;
          case 'r':
            e.preventDefault();
            onRefresh?.();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [exportDropdownOpen, onRefresh]);

  // Theme-aware colors
  const themeColors = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      background: isDark ? 'bg-gray-800' : 'bg-white',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      text: isDark ? 'text-white' : 'text-gray-900',
      textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
      textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
      grid: isDark ? '#374151' : '#e5e7eb',
      primary: '#2563eb',
      secondary: isDark ? '#9ca3af' : '#9ca3af',
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    };
  }, [theme]);

  const maxY = useMemo(() => {
    const vals: number[] = [];
    if (showView) vals.push(...validatedData.map((d) => d.view));
    if (showCompletion) vals.push(...validatedData.map((d) => d.completion));
    const raw = Math.max(10, Math.max(0, ...vals));
    const rounded = Math.ceil(raw / 10) * 10;
    return Math.max(20, rounded);
  }, [showView, showCompletion, validatedData]);

  const lineView = useMemo(
    () => getPath(validatedData.map((d) => d.view), width, CHART_HEIGHT, maxY),
    [validatedData, width, maxY]
  );
  const areaView = useMemo(
    () => getArea(validatedData.map((d) => d.view), width, CHART_HEIGHT, maxY),
    [validatedData, width, maxY]
  );
  const lineCompletion = useMemo(
    () => getPath(validatedData.map((d) => d.completion), width, CHART_HEIGHT, maxY),
    [validatedData, width, maxY]
  );

  const innerW = Math.max(0, width - CHART_PADDING.left - CHART_PADDING.right);
  const stepX = innerW / Math.max(validatedData.length - 1, 1);

  const handleMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left - CHART_PADDING.left;
    const idx = Math.round(x / stepX);
    setHoverIndex(Math.max(0, Math.min(validatedData.length - 1, idx)));
    setHoverX(CHART_PADDING.left + idx * stepX);
  };

  const handleLeave = () => {
    setHoverIndex(null);
    setHoverX(null);
  };

  // Grid lines for Y-axis
  const gridLines: React.ReactNode[] = [];
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const y = CHART_PADDING.top + (i / ySteps) * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);
    const value = Math.round(maxY - (i / ySteps) * maxY);
    gridLines.push(
      <g key={`grid-${i}`}>
        <line x1={CHART_PADDING.left} y1={y} x2={width - CHART_PADDING.right} y2={y} stroke={themeColors.grid} strokeOpacity={0.5} />
        <text x={CHART_PADDING.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill={themeColors.textMuted}>
          {value}
        </text>
      </g>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`${themeColors.background} rounded-2xl shadow-lg ${themeColors.border} border p-6 ${className}`} ref={containerRef}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Loading chart data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${themeColors.background} rounded-2xl shadow-lg ${themeColors.border} border p-6 ${className}`} ref={containerRef}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <div className="w-6 h-6 border-2 border-red-300 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-xs font-bold">!</span>
              </div>
            </div>
            <h3 className={`text-lg font-medium ${themeColors.text} mb-1`}>Failed to load chart</h3>
            <p className={`text-sm ${themeColors.textMuted} mb-4`}>{error}</p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate donut stats
  const totalViews = validatedData.reduce((sum, d) => sum + d.view, 0);
  const totalCompletions = validatedData.reduce((sum, d) => sum + d.completion, 0);
  const completionRate = totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0;
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDasharray = `${(completionRate / 100) * circumference} ${circumference}`;

  return (
    <>
      {/* Enhanced Animation Styles */}
      <style>{chartAnimationStyles}</style>
      
      <div className={`${themeColors.background} rounded-2xl shadow-lg ${themeColors.border} border p-6 ${className} chart-container ${animate && isChartVisible ? 'floating-animation' : ''}`} ref={containerRef}>
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4 chart-header">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-semibold ${themeColors.text}`}>Guide Performance</h3>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className={`p-1 ${themeColors.textMuted} hover:${themeColors.textSecondary} transition-all duration-300 pulse-on-hover`}
                  title="Refresh data (Ctrl+R)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
            {showLegend && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <button
                  className={`flex items-center gap-2 transition-all duration-300 chart-legend-item ${
                    showView ? themeColors.text : themeColors.textMuted
                  } ${themeColors.hover} hover:scale-105`}
                  onClick={() => setShowView((v) => !v)}
                >
                  <LegendDot color={themeColors.primary} />
                  <span>View Count</span>
                </button>
                <button
                  className={`flex items-center gap-2 transition-all duration-300 chart-legend-item ${
                    showCompletion ? themeColors.text : themeColors.textMuted
                  } ${themeColors.hover} hover:scale-105`}
                  onClick={() => setShowCompletion((v) => !v)}
                >
                  <LegendDot color={themeColors.secondary} />
                  <span>Completion Count</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="relative">
              <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${themeColors.border} border ${themeColors.textSecondary} ${themeColors.hover} transition-all duration-300 chart-export-btn hover:shadow-lg`}
              title="Export chart (Ctrl+E)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Export</span>
            </button>
            
            {exportDropdownOpen && (
              <div className={`absolute right-0 top-full mt-1 ${themeColors.background} ${themeColors.border} border rounded-lg shadow-lg z-10 min-w-[120px]`}>
                <button
                  onClick={() => handleExport('png')}
                  className={`block w-full px-3 py-2 text-left text-sm ${themeColors.textSecondary} ${themeColors.hover}`}
                >
                  PNG Image
                </button>
                <button
                  onClick={() => handleExport('svg')}
                  className={`block w-full px-3 py-2 text-left text-sm ${themeColors.textSecondary} ${themeColors.hover}`}
                >
                  SVG Vector
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className={`block w-full px-3 py-2 text-left text-sm ${themeColors.textSecondary} ${themeColors.hover}`}
                >
                  CSV Data
                </button>
              </div>
            )}
          </div>
          
          <span className={`hidden sm:inline text-xs ${themeColors.textMuted}`}>Sort by</span>
          <button className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${themeColors.border} border ${themeColors.textSecondary} ${themeColors.hover}`}>
            <span className="text-sm">Monthly</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Chart and Donut Side by Side */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Chart Area */}
        <div className="flex-1 min-w-0 max-w-none lg:max-w-[calc(100%-200px)] overflow-hidden chart-main" ref={chartRef}>
          <div
            className="relative w-full"
            onMouseMove={showTooltip ? handleMove : undefined}
            onMouseLeave={showTooltip ? handleLeave : undefined}
          >
            <svg 
              ref={svgRef} 
              width={width} 
              height={CHART_HEIGHT} 
              className={`block ${animate ? 'transition-all duration-300' : ''}`}
            >
              {/* Grid */}
              {gridLines.map((line, index) => (
                <g key={`grid-wrapper-${index}`} className="chart-grid-line" style={{ animationDelay: `${index * 0.1}s` }}>
                  {line}
                </g>
              ))}
              {/* Y Axis line */}
              <line x1={CHART_PADDING.left} y1={CHART_PADDING.top} x2={CHART_PADDING.left} y2={CHART_HEIGHT - CHART_PADDING.bottom} stroke={themeColors.grid} className="chart-grid-line" />

              {/* Areas/Lines */}
              {showView && (
                <>
                  <defs>
                    <linearGradient id="viewArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={themeColors.primary} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={themeColors.primary} stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <path d={areaView} fill="url(#viewArea)" className={animate ? 'chart-area' : ''} />
                  <path d={lineView} fill="none" stroke={themeColors.primary} strokeWidth={2} strokeLinecap="round" className={animate ? 'chart-line' : 'transition-all duration-500'} />
                </>
              )}

              {showCompletion && (
                <path d={lineCompletion} fill="none" stroke={themeColors.secondary} strokeOpacity={0.7} strokeWidth={2} strokeLinecap="round" className={animate ? 'chart-line' : 'transition-all duration-500'} style={{ animationDelay: '1.5s' }} />
              )}

              {/* Hover line */}
              {showTooltip && hoverX != null && (
                <line x1={hoverX} y1={CHART_PADDING.top} x2={hoverX} y2={CHART_HEIGHT - CHART_PADDING.bottom} stroke={themeColors.grid} className="transition-all duration-200" />
              )}

              {/* Series points */}
              {showView &&
                validatedData.map((d, i) => {
                  const x = CHART_PADDING.left + i * stepX;
                  const y = CHART_PADDING.top + (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom) - (d.view / maxY) * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);
                  return <circle key={`vpt-${i}`} cx={x} cy={y} r={2.5} fill={theme === 'dark' ? '#1f2937' : '#fff'} stroke={themeColors.primary} strokeWidth={1.5} className={animate ? 'chart-point hover:scale-125 transition-transform duration-200' : 'transition-all duration-300'} style={{ animationDelay: `${1.5 + i * 0.1}s` }} />;
                })}
              {showCompletion &&
                validatedData.map((d, i) => {
                  const x = CHART_PADDING.left + i * stepX;
                  const y = CHART_PADDING.top + (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom) - (d.completion / maxY) * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);
                  return <circle key={`cpt-${i}`} cx={x} cy={y} r={2} fill={theme === 'dark' ? '#1f2937' : '#fff'} stroke={themeColors.secondary} strokeWidth={1.2} opacity={0.9} className={animate ? 'chart-point hover:scale-125 transition-transform duration-200' : 'transition-all duration-300'} style={{ animationDelay: `${1.7 + i * 0.1}s` }} />;
                })}

              {/* X Labels */}
              {validatedData.map((d, i) => {
                const x = CHART_PADDING.left + i * stepX;
                return (
                  <text key={`xlabel-${i}`} x={x} y={CHART_HEIGHT - 8} textAnchor="middle" fontSize="11" fill={themeColors.textMuted} className="chart-x-label" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                    {d.month}
                  </text>
                );
              })}
            </svg>

            {/* Tooltip */}
            {showTooltip && hoverIndex !== null && (
              <div className={`absolute pointer-events-none z-10 ${themeColors.background} ${themeColors.border} border rounded-lg shadow-lg p-3 text-sm chart-tooltip`}
                   style={{
                     left: CHART_PADDING.left + hoverIndex * stepX - 50,
                     top: -80,
                     transform: 'translateX(-50%)'
                   }}>
                <div className={`font-medium ${themeColors.text} mb-1`}>
                  {validatedData[hoverIndex].month}
                </div>
                <div className="space-y-1">
                  {showView && (
                    <div className="flex items-center gap-2">
                      <LegendDot color={themeColors.primary} />
                      <span className={themeColors.textMuted}>Views: {validatedData[hoverIndex].view}</span>
                    </div>
                  )}
                  {showCompletion && (
                    <div className="flex items-center gap-2">
                      <LegendDot color={themeColors.secondary} />
                      <span className={themeColors.textMuted}>Completions: {validatedData[hoverIndex].completion}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart Section */}
        <div className="flex-shrink-0 w-full lg:w-48 lg:min-w-[192px] flex flex-col items-center chart-donut">
          <h4 className={`text-sm font-medium ${themeColors.text} mb-3 chart-header`}>Total View Performance</h4>
          <div className="relative w-28 h-28 hover:scale-105 transition-transform duration-300">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                strokeWidth="8"
                fill="none"
                className="chart-grid-line"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={themeColors.primary}
                strokeWidth="8"
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeLinecap="round"
                className={animate ? 'transition-all duration-1000 ease-out' : ''}
                style={{
                  strokeDashoffset: 0,
                  strokeDasharray: animate ? strokeDasharray : `${(completionRate / 100) * (2 * Math.PI * 40)} ${2 * Math.PI * 40}`,
                  animation: animate ? 'drawLine 2s ease-out 2s both' : 'none'
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pulse-on-hover">
              <span className={`text-xl font-bold ${themeColors.text} transition-all duration-300`}>{completionRate}%</span>
              <span className={`text-xs ${themeColors.textMuted} transition-all duration-300`}>Complete</span>
            </div>
          </div>
          <div className="mt-4 text-center chart-header" style={{ animationDelay: '1s' }}>
            <div className={`text-xs ${themeColors.textMuted}`}>
              {totalCompletions.toLocaleString()} of {totalViews.toLocaleString()} guides completed
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

// Default export to match the index.ts import pattern
export default OverviewPerformanceChart;
