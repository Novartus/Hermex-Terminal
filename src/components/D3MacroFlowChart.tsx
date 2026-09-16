import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface D3MacroFlowChartProps {
  data?: { time: number; value: number; volume: number }[];
}

export const D3MacroFlowChart: React.FC<D3MacroFlowChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const renderChart = () => {
      if (!svgRef.current || !containerRef.current) return;

      const sampleData = data || Array.from({ length: 32 }, (_, i) => ({
        time: i,
        value: 100 + Math.sin(i * 0.4) * 25 + Math.cos(i * 0.8) * 12 + (i * 1.8),
        volume: 40 + Math.random() * 80,
      }));

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width = containerRef.current.clientWidth || 320;
      const height = 190;
      const margin = { top: 15, right: 15, bottom: 25, left: 30 };

      const innerWidth = Math.max(width - margin.left - margin.right, 50);
      const innerHeight = Math.max(height - margin.top - margin.bottom, 50);

      svg.attr('viewBox', `0 0 ${width} ${height}`);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3
        .scaleLinear()
        .domain(d3.extent(sampleData, (d) => d.time) as [number, number])
        .range([0, innerWidth]);

      const yMin = (d3.min(sampleData, (d) => d.value) || 90) * 0.96;
      const yMax = (d3.max(sampleData, (d) => d.value) || 150) * 1.04;
      const y = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

      // Gradient definitions
      const defs = svg.append('defs');

      const areaGradient = defs
        .append('linearGradient')
        .attr('id', 'd3-area-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      areaGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#10b981')
        .attr('stop-opacity', 0.22);

      areaGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0.0);

      // Subtle Grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(y)
            .ticks(4)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', '#f1f5f9')
        .attr('stroke-dasharray', '3,3');

      svg.selectAll('.domain').remove();

      // Area Generator
      const area = d3
        .area<{ time: number; value: number }>()
        .x((d) => x(d.time))
        .y0(innerHeight)
        .y1((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(sampleData)
        .attr('fill', 'url(#d3-area-gradient)')
        .attr('d', area);

      // Main Trend Line
      const line = d3
        .line<{ time: number; value: number }>()
        .x((d) => x(d.time))
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(sampleData)
        .attr('fill', 'none')
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Glowing endpoint pulse
      const lastPoint = sampleData[sampleData.length - 1];
      g.append('circle')
        .attr('cx', x(lastPoint.time))
        .attr('cy', y(lastPoint.value))
        .attr('r', 4)
        .attr('fill', '#10b981')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Clean Subtle X-Axis
      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(
          d3
            .axisBottom(x)
            .ticks(4)
            .tickFormat((d) => `T-${32 - Number(d)}m`)
        )
        .selectAll('text')
        .attr('fill', '#94a3b8')
        .attr('font-size', '10px')
        .attr('font-family', 'sans-serif');

      g.selectAll('.domain').remove();
      g.selectAll('.tick line').attr('stroke', '#e2e8f0');
    };

    renderChart();

    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [data]);

  return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden">
      <svg
        ref={svgRef}
        role="img"
        aria-label="D3.js dynamic macro liquidity flow wave and volatility curve chart"
        className="w-full h-[190px] max-w-full overflow-hidden block"
      >
        <title>Macro Liquidity Flow Dynamics Chart</title>
        <desc>Real-time visual stream chart showing financial order flow trends and volatility over a rolling 30-minute interval.</desc>
      </svg>
    </div>
  );
};
