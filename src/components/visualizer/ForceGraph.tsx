// ============================================================================
// FILE: src/components/visualizer/ForceGraph.tsx
// ============================================================================
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { GraphNode, GraphLink } from '@/types/graph';

// Dynamic import to avoid SSR issues with Canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
});

interface ForceGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  onNodeSelect?: (node: GraphNode) => void;
}

export default function ForceGraph({ nodes, links, onNodeSelect }: ForceGraphProps) {
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // FIX: Initialize with null
  const fgRef = useRef<any>(null);

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateDims);
    // Initial measurement
    updateDims();
    
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  // Auto-zoom when data changes
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-120); // Increase repulsion for space layout
      fgRef.current.d3Force('link').distance(50);
      setTimeout(() => {
         if(fgRef.current) fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [nodes]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black cursor-crosshair">
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.w}
        height={dimensions.h}
        graphData={{ nodes, links }}
        
        // Visuals
        backgroundColor="#000000"
        nodeRelSize={6}
        nodeColor={(node: any) => {
           if (node.type === 'claim') return '#ffffff';
           if (node.domain === 'research') return '#22d3ee'; // Cyan
           if (node.domain === 'medical') return '#34d399';  // Emerald
           if (node.domain === 'political') return '#fbbf24'; // Amber
           return '#818cf8';
        }}
        linkColor={() => '#333333'}
        linkWidth={1}
        
        // Interaction
        onNodeClick={(node: any) => {
           // Open URL if it's a document
           if (node.type === 'document') {
             // Check if ID is URL or fallback to label
             const url = node.id.startsWith('http') ? node.id : null;
             if (url) window.open(url, '_blank');
           }
           if (onNodeSelect) onNodeSelect(node);
        }}
        
        // Custom Label Rendering
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12/globalScale;
          const radius = node.type === 'claim' ? 4 : 2 + ((node.confidence || 0.5) * 3);
          
          // Draw Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.type === 'claim' ? '#fff' : (
             node.domain === 'research' ? '#22d3ee' : 
             node.domain === 'medical' ? '#34d399' : 
             node.domain === 'political' ? '#fbbf24' : '#818cf8'
          );
          ctx.fill();

          // Draw Text (only if zoomed in or it's a claim)
          if (globalScale > 1.2 || node.type === 'claim') {
             ctx.font = `${fontSize}px Sans-Serif`;
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
             ctx.fillText(label, node.x, node.y + radius + fontSize);
          }
        }}
      />
    </div>
  );
}
