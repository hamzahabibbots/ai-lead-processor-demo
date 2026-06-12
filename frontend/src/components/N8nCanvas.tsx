import React, { useRef, useState } from 'react';
import { type N8nNode, N8N_NODES, N8N_EDGES } from '../mockData';

interface N8nCanvasProps {
  activeNodeId: string | null;
  onSelectNode: (node: N8nNode) => void;
  runningNodeId: string | null;
  executedNodeIds: string[];
  simulationActive: boolean;
}

export const N8nCanvas: React.FC<N8nCanvasProps> = ({
  activeNodeId,
  onSelectNode,
  runningNodeId,
  executedNodeIds,
  simulationActive,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pan = { x: 0, y: 0 };
  const [zoom] = useState(0.85); // slightly zoomed out to fit all nodes nicely


  // Compute curved paths for connections
  const getBezierPath = (startX: number, startY: number, endX: number, endY: number) => {
    // Horizontal spacing control points
    const controlOffset = Math.max(80, Math.abs(endX - startX) * 0.5);
    return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
  };

  // Determine if a connection line is part of the executed path
  const isConnectionActive = (fromId: string, toId: string) => {
    if (!simulationActive) return false;
    const fromIndex = executedNodeIds.indexOf(fromId);
    const toIndex = executedNodeIds.indexOf(toId);
    return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
  };

  const isConnectionRunning = (fromId: string, toId: string) => {
    if (!simulationActive || !runningNodeId) return false;
    const fromIndex = executedNodeIds.indexOf(fromId);
    const runningIndex = executedNodeIds.indexOf(runningNodeId);
    return fromIndex !== -1 && runningIndex !== -1 && fromIndex === runningIndex - 1 && toId === runningNodeId;
  };

  return (
    <div
      ref={containerRef}
      className="n8n-canvas-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
        backgroundColor: '#FAF9F6',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        cursor: 'grab',
      }}
    >
      {/* Grid Pattern Background */}
      <div
        className="n8n-grid-bg"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(#D1CBC0 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          pointerEvents: 'none',
        }}
      />

      {/* SVG Canvas for Connectors */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {N8N_EDGES.map((edge, idx) => {
            const fromNode = N8N_NODES.find((n) => n.id === edge.from);
            const toNode = N8N_NODES.find((n) => n.id === edge.to);

            if (!fromNode || !toNode) return null;

            // In n8n, output terminals are on the right, inputs on the left
            const startX = fromNode.x + 160; // Right edge of node
            const startY = fromNode.y + 40;  // Center Y of node
            const endX = toNode.x;           // Left edge of node
            const endY = toNode.y + 40;    // Center Y of node

            const path = getBezierPath(startX, startY, endX, endY);
            const active = isConnectionActive(edge.from, edge.to);
            const running = isConnectionRunning(edge.from, edge.to);

            return (
              <g key={`edge-${idx}`}>
                {/* Background line */}
                <path
                  d={path}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                {/* Main line */}
                <path
                  d={path}
                  fill="none"
                  stroke={active ? 'var(--accent)' : 'var(--input-border)'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
                  }}
                />
                {/* Pulsing signal dot when connection is running */}
                {running && (
                  <circle r="5" fill="var(--warning)">
                    <animateMotion dur="1s" repeatCount="indefinite" path={path} />
                  </circle>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Nodes Container */}
      <div
        className="n8n-nodes-wrapper"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          pointerEvents: 'auto',
        }}
      >
        {N8N_NODES.map((node) => {
          const isSelected = activeNodeId === node.id;
          const isRunning = runningNodeId === node.id;
          const hasExecuted = executedNodeIds.includes(node.id);

          // Node styling based on type and status
          let borderStyle = '1px solid var(--border)';
          let glowStyle = 'var(--shadow-card)';
          let bgStyle = 'var(--surface)';

          if (isRunning) {
            borderStyle = '2px solid var(--warning)';
            bgStyle = 'var(--accent-light)';
          } else if (isSelected) {
            borderStyle = '2px solid var(--accent)';
          } else if (hasExecuted) {
            borderStyle = '1px solid var(--success)';
            bgStyle = 'var(--accent-light)';
          }

          // Node icons/logos mapping or styles
          let nodeTypeColor = 'var(--text-muted)';
          if (node.type === 'trigger') nodeTypeColor = 'var(--warning)';
          else if (node.type === 'router') nodeTypeColor = 'var(--sidebar-bg)';
          else if (node.type === 'llm') nodeTypeColor = 'var(--accent)';
          else if (node.type === 'crm') nodeTypeColor = 'var(--accent)';
          else if (node.type === 'vector') nodeTypeColor = 'var(--accent)';
          else if (node.type === 'guardrails') nodeTypeColor = 'var(--accent)';
          else if (node.type === 'output') nodeTypeColor = 'var(--success)';

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node)}
              className={`n8n-node-card ${isSelected ? 'selected' : ''} ${isRunning ? 'running' : ''} ${hasExecuted ? 'executed' : ''}`}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '160px',
                height: '80px',
                backgroundColor: bgStyle,
                border: borderStyle,
                borderRadius: '12px',
                boxShadow: glowStyle,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '10px',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.2s ease',
                zIndex: isSelected || isRunning ? 10 : 2,
              }}
            >
              {/* Top part: Icon and Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    backgroundColor: `${nodeTypeColor}15`,
                    border: `1px solid ${nodeTypeColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}
                >
                  {node.icon}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '110px',
                  }}
                >
                  {node.name}
                </div>
              </div>

              {/* Bottom part: Status indicator */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                }}
              >
                <span style={{ color: nodeTypeColor, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px', fontSize: '8px' }}>
                  {node.type}
                </span>

                {/* Status dot or icon */}
                {isRunning ? (
                  <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 'bold' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--warning)',
                      }}
                    />
                    RUNNING
                  </span>
                ) : hasExecuted ? (
                  <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 'bold' }}>
                    ✓ SUCCESS
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>READY</span>
                )}
              </div>

              {/* Input & Output connector points (aesthetic only) */}
              <div
                style={{
                  position: 'absolute',
                  left: '-5px',
                  top: 'calc(50% - 4px)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: '-5px',
                  top: 'calc(50% - 4px)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
