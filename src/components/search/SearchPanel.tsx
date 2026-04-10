'use client';

import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel, GlassCard } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ArrowUp, Hash, Filter, Loader2, Sparkles } from 'lucide-react';
import { LEVEL_LABELS } from '@/lib/memory/types';
import type { MemoryNode } from '@/lib/memory/types';
import { useState, useEffect, useCallback } from 'react';

export function SearchPanel() {
  const {
    searchQuery, setSearchQuery, searchResults, setSearchResults,
    isSearching, setIsSearching, selectNode, openPanel
  } = useMemoryStore();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'L0' | 'L1' | 'L2'>('all');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch('/api/memory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'search', query, filter }),
      });
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [filter, setSearchResults, setIsSearching]);

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  const handleResultClick = (node: MemoryNode) => {
    selectNode(node.id);
    openPanel('explorer');
  };

  const filteredResults = filter === 'all'
    ? searchResults
    : searchResults.filter(n => n.level === filter);

  return (
    <GlassPanel variant="strong" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-tight">Hybrid Search</h3>
        <div className="flex items-center gap-1">
          {['all', 'L0', 'L1', 'L2'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={cn(
                'px-2 py-0.5 text-mono-xs rounded-md transition-all duration-200',
                filter === f
                  ? 'bg-matrix/15 text-matrix'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === 'all' ? 'ALL' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Search input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="BM25 + Semantic hybrid search..."
          className="w-full h-9 pl-9 pr-3 glass rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:glass-glow transition-all font-mono"
        />
        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-matrix animate-spin" />}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto max-h-[400px] space-y-1.5">
        <AnimatePresence mode="popLayout">
          {filteredResults.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleResultClick(node)}
              className="glass-subtle rounded-lg p-3 cursor-pointer hover:glass-hover transition-all duration-200 group"
            >
              <div className="flex items-start gap-2">
                <span className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', `level-dot-${node.level.toLowerCase()}`)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium group-hover:text-matrix transition-colors truncate">
                    {node.title}
                  </div>
                  {node.content && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-2">
                      {node.content.slice(0, 120)}...
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-mono-xs text-muted-foreground/50">{node.level}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span className="text-mono-xs text-muted-foreground/50">{node.category}</span>
                    {node.healthScore > 0 && (
                      <>
                        <span className="text-muted-foreground/30">·</span>
                        <span className={cn(
                          'text-mono-xs',
                          node.healthScore >= 0.8 ? 'text-matrix' : node.healthScore >= 0.5 ? 'text-yellow-500' : 'text-destructive'
                        )}>
                          {(node.healthScore * 100).toFixed(0)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!isSearching && searchQuery.length >= 2 && filteredResults.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground/50">No results found</p>
          </div>
        )}

        {searchQuery.length < 2 && (
          <div className="text-center py-8">
            <Sparkles className="w-6 h-6 text-matrix/30 mx-auto mb-2 animate-breathe" />
            <p className="text-xs text-muted-foreground/50">
              Hybrid BM25 + Semantic search
            </p>
            <p className="text-mono-xs text-muted-foreground/30 mt-1">
              Type 2+ characters to search
            </p>
          </div>
        )}
      </div>

      {/* Result count */}
      {searchQuery.length >= 2 && !isSearching && (
        <div className="mt-3 pt-2 border-t border-glass-border flex items-center justify-between">
          <span className="text-mono-xs text-muted-foreground/50">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
          </span>
          <span className="text-mono-xs text-muted-foreground/30">RRF ranked</span>
        </div>
      )}
    </GlassPanel>
  );
}
