'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LEVEL_LABELS, PLANE_LABELS,
  type MemoryLevel, type MemoryPlane, type MemoryNode, type MemoryStatus,
} from '@/lib/memory/types';
import {
  FolderOpen, ChevronRight, FileText, ArrowUpCircle, Trash2, Eye,
  Layers, Globe, Shield, Archive, Zap
} from 'lucide-react';

const FOLDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  raw: Archive,
  wiki: FileText,
  canon: Globe,
  scratch: Zap,
  governance: Shield,
};

const STATUS_STYLES: Record<MemoryStatus, string> = {
  scratch: 'text-yellow-500/80',
  wiki: 'text-matrix',
  canon: 'text-purple-400',
  archived: 'text-muted-foreground/50',
};

interface ExplorerProps {
  onSelectNode?: (node: MemoryNode) => void;
}

function TreeNode({ node, depth = 0, onSelect }: {
  node: MemoryNode;
  depth?: number;
  onSelect?: (node: MemoryNode) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect?.(node);
        }}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors group',
          'hover:bg-matrix/5',
          node.status && `level-${node.level.toLowerCase()}`
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <ChevronRight className={cn(
            'w-3 h-3 text-muted-foreground/50 transition-transform duration-200',
            expanded && 'rotate-90'
          )} />
        ) : (
          <span className="w-3" />
        )}
        <span className={cn('w-2 h-2 rounded-full shrink-0', `level-dot-${node.level.toLowerCase()}`)} />
        <span className="text-xs text-foreground/90 truncate flex-1">{node.title}</span>
        <span className={cn('text-mono-xs', STATUS_STYLES[node.status])}>{node.level}</span>
      </button>
      {expanded && hasChildren && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
        >
          {node.children!.map(child => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

import { useState } from 'react';

export function MemoryExplorer({ onSelectNode }: ExplorerProps) {
  const { nodes, selectedNodeId, selectNode } = useMemoryStore();

  const grouped = nodes.reduce((acc, node) => {
    const key = `${node.level}-${node.category}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(node);
    return acc;
  }, {} as Record<string, MemoryNode[]>);

  const rootNodes = nodes.filter(n => !n.parentId);

  const handleSelect = (node: MemoryNode) => {
    selectNode(node.id);
    onSelectNode?.(node);
  };

  return (
    <GlassPanel variant="strong" className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight">Memory Explorer</h3>
        <span className="text-mono-xs text-muted-foreground">{nodes.length} nodes</span>
      </div>

      {/* Folder structure */}
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        {/* raw/ */}
        <div className="mb-3">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground/70">
            <Archive className="w-3.5 h-3.5" />
            <span className="text-premium tracking-wider">RAW/</span>
            <span className="text-mono-xs ml-auto">{nodes.filter(n => n.level === 'L0').length}</span>
          </div>
          {nodes.filter(n => n.level === 'L0').map(n => (
            <TreeNode key={n.id} node={n} onSelect={handleSelect} />
          ))}
          {nodes.filter(n => n.level === 'L0').length === 0 && (
            <p className="text-xs text-muted-foreground/40 pl-7 italic">No raw artifacts</p>
          )}
        </div>

        {/* wiki/ */}
        <div className="mb-3">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground/70">
            <FileText className="w-3.5 h-3.5" />
            <span className="text-premium tracking-wider">WIKI/</span>
            <span className="text-mono-xs ml-auto">{nodes.filter(n => n.level === 'L1').length}</span>
          </div>
          {nodes.filter(n => n.level === 'L1').map(n => (
            <TreeNode key={n.id} node={n} onSelect={handleSelect} />
          ))}
          {nodes.filter(n => n.level === 'L1').length === 0 && (
            <p className="text-xs text-muted-foreground/40 pl-7 italic">No wiki entries</p>
          )}
        </div>

        {/* canon/ */}
        <div className="mb-3">
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground/70">
            <Globe className="w-3.5 h-3.5" />
            <span className="text-premium tracking-wider">CANON/</span>
            <span className="text-mono-xs ml-auto">{nodes.filter(n => n.level === 'L2').length}</span>
          </div>
          {nodes.filter(n => n.level === 'L2').map(n => (
            <TreeNode key={n.id} node={n} onSelect={handleSelect} />
          ))}
          {nodes.filter(n => n.level === 'L2').length === 0 && (
            <p className="text-xs text-muted-foreground/40 pl-7 italic">No canonical knowledge</p>
          )}
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNodeId && (() => {
        const selected = nodes.find(n => n.id === selectedNodeId);
        if (!selected) return null;
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-glass-border space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold truncate flex-1">{selected.title}</h4>
              <span className={cn('text-mono-xs ml-2', `level-dot-${selected.level.toLowerCase()}`)}>
                {selected.level}
              </span>
            </div>
            {selected.content && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {selected.content}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-mono-xs text-muted-foreground/60">{PLANE_LABELS[selected.plane]}</span>
              <span className="text-mono-xs text-muted-foreground/30">|</span>
              <span className="text-mono-xs text-muted-foreground/60">{selected.category}</span>
              <span className="text-mono-xs text-muted-foreground/30">|</span>
              <span className={cn('text-mono-xs', STATUS_STYLES[selected.status])}>{selected.status}</span>
            </div>
          </motion.div>
        );
      })()}
    </GlassPanel>
  );
}
