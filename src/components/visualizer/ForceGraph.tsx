// ============================================================================
// FILE: src/components/visualizer/ForceGraph.tsx
// ============================================================================
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphNode, GraphLink } from '@/types/graph';

// Dynamic import for force-graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeSelect?: (node: GraphNode) => void;
}

function getNodeUrl(node: GraphNode): string | null {
  const url =
    node.seedUrl ||
    (node.meta?.url ? String(node.meta.url) : null) ||
    (typeof node.id === 'string' && node.id.startsWith('http') ? node.id : null);

  return url && url.startsWith('http') ? url : null;
}

function escHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function tooltipHtmlForNode(node: GraphNode) {
  const url = getNodeUrl(node) || '';
  const title =
    (node.meta?.title ? String(node.meta.title) : '') ||
    node.label ||
    (node.type === 'document' ? 'Source' : 'Node');

  const snippet = node.meta?.snippet ? String(node.meta.snippet) : '';
  const snip = snippet.length > 240 ? `${snippet.slice(0, 240)}…` : snippet;

  if (!title && !url && !snip) return '';

  return `
    <div style="
      max-width: 360px;
      padding: 10px 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(0,0,0,0.92);
      color: rgba(255,255,255,0.92);
      border-radius: 10px;
      font-size: 12px;
      line-height: 1.25;
    ">
      <div style="font-weight: 700; margin-bottom: 6px;">${escHtml(title)}</div>
      ${
        url
          ? `<div style="opacity: 0.85; font-size: 11px; margin-bottom: 8px; word-break: break-all;">${escHtml(url)}</div>`
          : ''
      }
      ${
        snip
          ? `<div style="opacity: 0.9;">${escHtml(snip)}</div>`
          : ''
      }
      ${
        node.type === 'document'
          ? `<div style="opacity: 0.6; font-size: 10px; margin-top: 10px;">Shift+Click or Right‑Click to open</div>`
          : ''
      }
    </div>
  `;
}

// CHANGED BACK TO DEFAULT EXPORT
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
    if (node.domain === 'research') return '#22d3ee'; // cyan
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
        nodeLabel={(n: any) => tooltipHtmlForNode(n as GraphNode)}
        onNodeClick={(n: any, event: MouseEvent) => {
          const node = n as GraphNode;
          onNodeSelect?.(node);

          if (event?.shiftKey && node.type === 'document') {
            const url = getNodeUrl(node);
            if (url) window.open(url, '_blank');
          }
        }}
        onNodeRightClick={(n: any) => {
          const node = n as GraphNode;
          if (node.type !== 'document') return;
          const url = getNodeUrl(node);
          if (url) window.open(url, '_blank');
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
