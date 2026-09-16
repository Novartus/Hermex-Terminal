import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { CorrelationMatrix } from '../engine/types';
import { cleanSymbol } from '../utils';

interface D3CorrelationChordProps {
  correlation: CorrelationMatrix | null;
}

export const D3CorrelationChord: React.FC<D3CorrelationChordProps> = ({ correlation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !correlation || correlation.symbols.length === 0) return;

    const renderChord = () => {
      if (!svgRef.current || !containerRef.current || !correlation) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const width = containerRef.current.clientWidth || 320;
      const height = 290;
      const outerRadius = Math.max(Math.min(width, height) * 0.5 - 34, 40);
      const innerRadius = Math.max(outerRadius - 12, 28);

      svg.attr('viewBox', `0 0 ${width} ${height}`);

      const symbols = correlation.symbols.map(cleanSymbol);
      const n = symbols.length;

      const matrix: number[][] = [];
      for (let i = 0; i < n; i++) {
        matrix[i] = [];
        for (let j = 0; j < n; j++) {
          if (i === j) {
            matrix[i][j] = 0;
          } else {
            const raw = correlation.matrix[i]?.[j] ?? 0;
            matrix[i][j] = Math.max(0, raw * 100);
          }
        }
      }

      const chord = d3.chord().padAngle(0.06).sortSubgroups(d3.descending);
      const chords = chord(matrix);

      const arc = d3.arc<d3.ChordGroup>().innerRadius(innerRadius).outerRadius(outerRadius);
      const ribbon = d3.ribbon<d3.Chord, d3.ChordSubgroup>().radius(innerRadius);

      const colorScale = d3.scaleOrdinal<string>()
        .domain(symbols)
        .range(['#10b981', '#6366f1', '#f59e0b', '#0f172a', '#ec4899', '#06b6d4', '#8b5cf6', '#3b82f6']);

      const g = svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      // Draw Outer Arcs
      const group = g
        .append('g')
        .selectAll('g')
        .data(chords.groups)
        .join('g');

      group
        .append('path')
        .attr('fill', (d) => colorScale(symbols[d.index]))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .attr('d', arc as any)
        .style('cursor', 'pointer')
        .on('mouseenter', (_, d) => setHoveredIndex(d.index))
        .on('mouseleave', () => setHoveredIndex(null));

      // Asset Labels
      group
        .append('text')
        .each((d: any) => {
          d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr('dy', '0.35em')
        .attr('transform', (d: any) => `
          rotate(${(d.angle * 180) / Math.PI - 90})
          translate(${outerRadius + 8})
          ${d.angle > Math.PI ? 'rotate(180)' : ''}
        `)
        .attr('text-anchor', (d: any) => (d.angle > Math.PI ? 'end' : 'start'))
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('font-family', 'Inter, system-ui, sans-serif')
        .attr('fill', '#0f172a')
        .text((d) => symbols[d.index]);

      // Draw Ribbons
      g.append('g')
        .attr('fill-opacity', 0.65)
        .selectAll('path')
        .data(chords)
        .join('path')
        .attr('d', ribbon as any)
        .attr('fill', (d) => colorScale(symbols[d.source.index]))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)
        .style('mix-blend-mode', 'multiply')
        .style('cursor', 'pointer')
        .style('opacity', (d) => {
          if (hoveredIndex === null) return 0.6;
          return d.source.index === hoveredIndex || d.target.index === hoveredIndex ? 0.95 : 0.1;
        });
    };

    renderChord();

    const resizeObserver = new ResizeObserver(() => {
      renderChord();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [correlation, hoveredIndex]);

  return (
    <div ref={containerRef} className="relative w-full max-w-full overflow-hidden flex flex-col items-center justify-center">
      <svg
        ref={svgRef}
        role="img"
        aria-label="D3.js interactive cross-asset correlation chord diagram"
        className="w-full h-[290px] max-w-full overflow-hidden block"
      >
        <title>Asset Correlation Chord Matrix</title>
        <desc>Multi-asset correlation chord diagram illustrating market interdependence and risk coupling vectors.</desc>
      </svg>
      <div className="text-[10px] text-slate-400 font-medium text-center mt-1">
        Hover outer arc nodes to isolate cross-market coupling vectors
      </div>
    </div>
  );
};
