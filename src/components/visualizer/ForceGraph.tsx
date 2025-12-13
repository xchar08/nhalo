// ============================================================================
// FILE: src/components/visualizer/ForceGraph.tsx
// ============================================================================
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphNode, GraphLink } from '@/types/graph';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeSelect?: (node: GraphNode) => void;
}

export default function ForceGraph({ nodes, links, onNodeSelect }: ForceGraphProps) {
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fgRef = useRef<any>(null);

  useEffect(() => {
    const updateDims = () => {
      if (!containerRef.current) return;
      setDimensions({
        w: containerRef.current.offsetWidth,
        h: containerRef.current.offsetHeight,
      });
    };
    window.addEventListener('resize', updateDims);
    updateDims();
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.d3Force('charge')?.strength(-140);
    fgRef.current.d3Force('link')?.distance(55);
    setTimeout(() => fgRef.current?.zoomToFit(450, 60), 450);
  }, [nodes, links]);

  const nodeColor = (node: GraphNode) => {
    if (node.type === 'claim') return '#ffffff';
    if (node.domain === 'research') return '#22d3ee';
    if (node.domain === 'medical') return '#34d399';
    if (node.domain === 'political') return '#fbbf24';
    if (node.domain === 'branch') return '#a78bfa';
    if (node.domain === 'external') return '#818cf8';
    return '#818cf8';
  };

  return (
    <div ref={containerRef} className="w-full h-full">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={{ nodes, links }}
        nodeColor={(n: any) => nodeColor(n as GraphNode)}
        linkColor={() => '#333333'}
        linkWidth={1}
        onNodeClick={(n: any) => {
          const node = n as GraphNode;

          // Open URL if it's a document, but still select it (so Dive Deeper modal can open)
          if (node.type === 'document') {
            const url =
              node.seedUrl ||
              (node.meta?.url ? String(node.meta.url) : null) ||
              (node.id.startsWith('http') ? node.id : null);

            if (url) window.open(url, '_blank');
          }

          onNodeSelect?.(node);
        }}
        nodeCanvasObject={(n: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const node = n as GraphNode & { x: number; y: number };
          const label = node.label || '';
          const fontSize = 12 / globalScale;
          const radius = node.type === 'claim' ? 4 : 2 + ((node.confidence || 0.5) * 3);

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = nodeColor(node);
          ctx.fill();

          if (globalScale > 1.2 || node.type === 'claim') {
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillText(label, node.x, node.y + radius + fontSize);
          }
        }}
      />
    </div>
  );
}
