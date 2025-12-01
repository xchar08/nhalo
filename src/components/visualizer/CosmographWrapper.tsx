// ============================================================================
// FILE: src/components/visualizer/CosmographWrapper.tsx
// ============================================================================
'use client';

import { useRef, useEffect } from 'react';
import { Cosmograph, CosmographInputConfig } from '@cosmograph/cosmograph';
import { GraphData, GraphNode, GraphLink } from '@/types/graph';

interface CosmographWrapperProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
}

export function CosmographWrapper({ data, onNodeClick }: CosmographWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Cosmograph<GraphNode, GraphLink> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (graphRef.current) graphRef.current.remove();

    const config: CosmographInputConfig<GraphNode, GraphLink> = {
      backgroundColor: '#000000',
      nodeColor: (n) => {
        if (n.type === 'claim') return '#ffffff';
        if (n.domain === 'research') return '#22d3ee'; 
        if (n.domain === 'medical') return '#34d399';
        if (n.domain === 'political') return '#fbbf24';
        return '#818cf8';
      },
      nodeSize: (n) => (n.type === 'claim' ? 10 : 4 + (15 - 4) * (n.confidence || 0.5)),
      linkWidth: 0.5,
      linkColor: '#555555',
      simulationGravity: 0.15,
      simulationRepulsion: 1.2,
      
      // CLICK HANDLER
      onClick: (n) => {
        if (n && n.type === 'document') {
          // In our retrieval logic, we used the URL as the ID for deduplication
          // So n.id *should* be the URL.
          const url = n.id;
          if (url && url.startsWith('http')) {
            window.open(url, '_blank');
          }
        }
        if (onNodeClick && n) onNodeClick(n);
      }
    };

    const instance = new Cosmograph<GraphNode, GraphLink>(containerRef.current, config);
    graphRef.current = instance;

    if (data.nodes.length > 0) instance.setData(data.nodes, data.links);

    return () => {
      instance.remove();
      graphRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (graphRef.current && data.nodes.length > 0) {
      graphRef.current.pause();
      graphRef.current.setData(data.nodes, data.links);
      graphRef.current.restart();
    }
  }, [data]);

  return <div ref={containerRef} className="w-full h-full relative bg-black cursor-pointer" />;
}
