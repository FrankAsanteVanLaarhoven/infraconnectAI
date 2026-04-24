'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useMemoryStore } from '@/store/memory-store';
import { GlassPanel } from '@/components/glass/GlassPanel';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LEVEL_LABELS, PLANE_LABELS,
  type MemoryLevel, type MemoryPlane, type MemoryNode, type MemoryStatus, type MemoryCategory,
} from '@/lib/memory/types';
import {
  FolderOpen, ChevronRight, FileText, ArrowUpCircle, Trash2,
  Archive, Zap, Globe, Shield,
  Plus, Search, Save, X, Tag, Clock, AlertTriangle,
  Link2, GitBranch, Heart, Eye, Check, Pencil,
  FolderCog, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

/* ================================================================
   CONSTANTS & HELPERS
   ================================================================ */

const LEVEL_OPTIONS: MemoryLevel[] = ['L0', 'L1', 'L2'];
const PLANE_OPTIONS: MemoryPlane[] = ['execution', 'memory', 'governance'];
const STATUS_OPTIONS: MemoryStatus[] = ['scratch', 'wiki', 'canon', 'archived'];
const CATEGORY_OPTIONS: MemoryCategory[] = [
  'docs', 'code', 'telemetry', 'chats',
  'entities', 'concepts', 'decisions', 'projects',
  'standards', 'playbooks', 'patterns',
];

const FOLDER_CONFIG: Record<string, {
  level: MemoryLevel;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  raw: { level: 'L0', label: 'RAW', icon: Archive },
  wiki: { level: 'L1', label: 'WIKI', icon: FileText },
  canon: { level: 'L2', label: 'CANON', icon: Globe },
  governance: { level: 'L2', label: 'GOVERNANCE', icon: Shield },
};

const STATUS_STYLES: Record<MemoryStatus, string> = {
  scratch: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  wiki: 'border-l1/40 bg-l1/10 text-l1',
  canon: 'border-l2/40 bg-l2/10 text-l2',
  archived: 'border-muted-foreground/30 bg-muted-foreground/5 text-muted-foreground',
};

const LEVEL_BADGE_STYLES: Record<MemoryLevel, string> = {
  L0: 'border-l0/40 bg-l0/10 text-l0',
  L1: 'border-l1/40 bg-l1/10 text-l1',
  L2: 'border-l2/40 bg-l2/10 text-l2',
};

const PLANE_BADGE_STYLES: Record<MemoryPlane, string> = {
  execution: 'border-execution/40 bg-execution/10 text-execution',
  memory: 'border-matrix/40 bg-matrix/10 text-matrix',
  governance: 'border-governance/40 bg-governance/10 text-governance',
};

function healthColor(score: number): string {
  if (score >= 0.8) return 'bg-slate-800';
  if (score >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
}

function healthGlow(score: number): string {
  if (score >= 0.8) return 'shadow-[0_0_6px_oklch(0.72_0.22_155)]';
  if (score >= 0.5) return 'shadow-[0_0_6px_oklch(0.75_0.18_85)]';
  return 'shadow-[0_0_6px_oklch(0.65_0.22_25)]';
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ================================================================
   INTERFACE
   ================================================================ */

interface ExplorerProps {
  onSelectNode?: (node: MemoryNode) => void;
}

/* ================================================================
   FOLDER ROW — expandable level folder
   ================================================================ */

function FolderRow({
  config,
  count,
  expanded,
  onToggle,
}: {
  config: typeof FOLDER_CONFIG[string];
  count: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = config.icon;
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground/80 hover:text-foreground/90 hover:bg-matrix/5 rounded-md transition-colors"
    >
      <motion.div
        animate={{ rotate: expanded ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronRight className="w-3 h-3" />
      </motion.div>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-premium tracking-wider flex-1 text-left">{config.label}/</span>
      <Badge variant="outline" className="text-mono-xs px-1.5 py-0 h-5 min-w-5 justify-center">
        {count}
      </Badge>
    </button>
  );
}

/* ================================================================
   TREE NODE — individual node row in folder tree
   ================================================================ */

function TreeNode({
  node,
  isSelected,
  onSelect,
}: {
  node: MemoryNode;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      layout
      className={cn(
        'w-full flex items-center gap-2 pl-8 pr-2 py-1.5 rounded-md text-left transition-all duration-200 group',
        'hover:bg-matrix/8',
        isSelected
          ? 'bg-matrix/12 ring-1 ring-matrix/25 text-foreground'
          : 'text-foreground/75'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-sm shrink-0', `level-dot-${node.level.toLowerCase()}`)} />
      <span className="text-xs truncate flex-1">{node.title}</span>
      {/* tiny health bar */}
      <div className="w-10 h-1.5 rounded-sm bg-muted-foreground/10 overflow-hidden shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${node.healthScore * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={cn('h-full rounded-sm', healthColor(node.healthScore), healthGlow(node.healthScore))}
        />
      </div>
      <span className={cn('text-mono-xs shrink-0', `level-dot-${node.level.toLowerCase()}`)}>
        {node.level}
      </span>
    </motion.button>
  );
}

/* ================================================================
   HEALTH BAR — full width animated bar
   ================================================================ */

function HealthBar({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' }) {
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2">
      <div className={cn('rounded-sm bg-muted-foreground/10 overflow-hidden', size === 'sm' ? 'w-16 h-1.5' : 'w-full h-2')}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={cn('h-full rounded-sm', healthColor(score), healthGlow(score))}
        />
      </div>
      <span className={cn('text-mono-xs tabular-nums', healthColor(score).replace('bg-', 'text-'))}>
        {pct}%
      </span>
    </div>
  );
}

/* ================================================================
   TAG CHIPS — editable tags
   ================================================================ */

function TagChips({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(() => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  }, [input, tags, onChange]);

  const removeTag = useCallback((tag: string) => {
    onChange(tags.filter(t => t !== tag));
  }, [tags, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {tags.map(tag => (
            <motion.span
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-mono-xs border border-glass-border bg-matrix/5 text-foreground/80 group"
            >
              <Tag className="w-2.5 h-2.5 text-matrix/60" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                title={`Remove ${tag} tag`}
                aria-label={`Remove ${tag} tag`}
                className="ml-0.5 text-muted-foreground/50 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); addTag(); }
          }}
          placeholder="Add tag…"
          className="h-7 text-xs bg-transparent border-glass-border"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addTag}
          className="h-7 px-2 text-matrix shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ================================================================
   CREATE NODE DIALOG
   ================================================================ */

function CreateNodeDialog({
  parentId,
  defaultLevel,
  onSuccess,
}: {
  parentId?: string | null;
  defaultLevel?: MemoryLevel;
  onSuccess: (node: MemoryNode) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<MemoryLevel>(defaultLevel ?? 'L1');
  const [plane, setPlane] = useState<MemoryPlane>('memory');
  const [category, setCategory] = useState<MemoryCategory>('docs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          level,
          plane,
          category,
          status: level === 'L0' ? 'scratch' : level === 'L1' ? 'wiki' : 'canon',
          parentId: parentId ?? null,
          tags: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newNode: MemoryNode = {
          id: data.id,
          title: title.trim(),
          content: '',
          level,
          plane,
          category,
          status: level === 'L0' ? 'scratch' : level === 'L1' ? 'wiki' : 'canon',
          parentId: parentId ?? null,
          tags: [],
          healthScore: 1.0,
          conflictCount: 0,
          referenceCount: 0,
          lastValidated: null,
          expiresAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        useMemoryStore.getState().addNode(newNode);
        toast.success('Node created', { description: `"${title.trim()}" added to ${LEVEL_LABELS[level]}` });
        onSuccess(newNode);
        setOpen(false);
        setTitle('');
        setLevel(defaultLevel ?? 'L1');
        setPlane('memory');
        setCategory('docs');
      } else {
        toast.error('Create failed', { description: 'Could not create node' });
      }
    } catch {
      toast.error('Error', { description: 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-matrix hover:text-matrix/80 hover:bg-matrix/10">
          <Plus className="w-4 h-4" />
          <span className="text-xs ml-1">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-glass-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold tracking-tight flex items-center gap-2">
            <FolderCog className="w-4 h-4 text-matrix" />
            Create Memory Node
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter node title…"
              className="h-8 text-sm bg-transparent border-glass-border"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Level</label>
              <Select value={level} onValueChange={(v) => setLevel(v as MemoryLevel)}>
                <SelectTrigger className="h-8 text-xs border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVEL_OPTIONS.map(l => (
                    <SelectItem key={l} value={l} className="text-xs">{l} — {LEVEL_LABELS[l]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Plane</label>
              <Select value={plane} onValueChange={(v) => setPlane(v as MemoryPlane)}>
                <SelectTrigger className="h-8 text-xs border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANE_OPTIONS.map(p => (
                    <SelectItem key={p} value={p} className="text-xs">{PLANE_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as MemoryCategory)}>
                <SelectTrigger className="h-8 text-xs border-glass-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(c => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {parentId && (
            <p className="text-mono-xs text-muted-foreground/60">
              Parent: {useMemoryStore.getState().nodes.find(n => n.id === parentId)?.title ?? parentId}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting}
              className="text-xs bg-matrix/20 text-matrix hover:bg-matrix/30 border border-matrix/30"
            >
              {isSubmitting ? (
                <motion.div className="w-3 h-3 border-2 border-matrix/30 border-t-matrix rounded-sm animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 mr-1" />
              )}
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ================================================================
   NODE DETAIL PANEL
   ================================================================ */

function NodeDetailPanel({
  node,
  onUpdated,
  onDeleted,
}: {
  node: MemoryNode;
  onUpdated: (updated: MemoryNode) => void;
  onDeleted: () => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const [editContent, setEditContent] = useState(node.content);
  const [editTags, setEditTags] = useState<string[]>([...node.tags]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  // Sync edits when node changes
  useEffect(() => {
    setEditTitle(node.title);
    setEditContent(node.content);
    setEditTags([...node.tags]);
  }, [node.id, node.title, node.content, node.tags]);

  const hasChanges = editTitle !== node.title || editContent !== node.content ||
    JSON.stringify(editTags) !== JSON.stringify(node.tags);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/memory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: node.id,
          title: editTitle,
          content: editContent,
          tags: editTags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const updated: MemoryNode = { ...node, title: editTitle, content: editContent, tags: editTags, updatedAt: new Date().toISOString() };
        useMemoryStore.getState().updateNode(node.id, updated);
        onUpdated(updated);
        toast.success('Saved', { description: `"${editTitle}" updated` });
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromote = async () => {
    const promoteMap: Record<MemoryStatus, { level: MemoryLevel; status: MemoryStatus } | null> = {
      scratch: { level: 'L1', status: 'wiki' },
      wiki: { level: 'L2', status: 'canon' },
      canon: null,
      archived: null,
    };
    const next = promoteMap[node.status];
    if (!next) {
      toast.info('Already at highest level', { description: 'This node cannot be promoted further' });
      return;
    }
    setIsPromoting(true);
    try {
      const res = await fetch('/api/memory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: node.id,
          level: next.level,
          status: next.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        useMemoryStore.getState().promoteNode(node.id, next.level, next.status);
        const updated: MemoryNode = { ...node, level: next.level, status: next.status, lastValidated: new Date().toISOString(), updatedAt: new Date().toISOString() };
        onUpdated(updated);
        toast.success('Promoted', { description: `→ ${next.level} / ${next.status}` });
      }
    } catch {
      toast.error('Promote failed');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/memory?id=${node.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        useMemoryStore.getState().removeNode(node.id);
        onDeleted();
        toast.success('Deleted', { description: `"${node.title}" removed` });
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  const canPromote = node.status === 'scratch' || node.status === 'wiki';

  return (
    <div className="space-y-5 h-full flex flex-col">
      {/* Title */}
      <div className="flex items-start gap-2">
        {isEditingTitle ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-sm font-semibold h-8 bg-transparent border-glass-border"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
                if (e.key === 'Escape') { setEditTitle(node.title); setIsEditingTitle(false); }
              }}
              onBlur={() => setIsEditingTitle(false)}
            />
            <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)} className="h-7 px-1.5 text-matrix shrink-0">
              <Check className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="flex-1 text-left group/title flex items-center gap-2 min-w-0"
          >
            <h3 className="text-sm font-semibold truncate">{editTitle}</h3>
            <Pencil className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Badges row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline" className={cn('text-mono-xs', LEVEL_BADGE_STYLES[node.level])}>
          {node.level} — {LEVEL_LABELS[node.level]}
        </Badge>
        <Badge variant="outline" className={cn('text-mono-xs', PLANE_BADGE_STYLES[node.plane])}>
          {PLANE_LABELS[node.plane]}
        </Badge>
        <Badge variant="outline" className={cn('text-mono-xs', STATUS_STYLES[node.status])}>
          {node.status}
        </Badge>
        {node.category && (
          <Badge variant="outline" className="text-mono-xs border-glass-border">
            {node.category}
          </Badge>
        )}
      </div>

      {/* Health Score */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Heart className="w-3 h-3" />
          Health Score
        </label>
        <HealthBar score={node.healthScore} />
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          Content
        </label>
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="Add content to this memory node…"
          className="text-xs leading-relaxed min-h-[100px] max-h-[240px] bg-transparent border-glass-border resize-y"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3 h-3" />
          Tags
        </label>
        <TagChips tags={editTags} onChange={setEditTags} />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <MetaItem icon={<Clock className="w-3 h-3" />} label="Created" value={formatDate(node.createdAt)} />
        <MetaItem icon={<Clock className="w-3 h-3" />} label="Updated" value={formatDate(node.updatedAt)} />
        <MetaItem icon={<Eye className="w-3 h-3" />} label="Validated" value={formatDate(node.lastValidated)} />
        <MetaItem icon={<Clock className="w-3 h-3" />} label="Expires" value={formatDate(node.expiresAt)} />
        <MetaItem icon={<AlertTriangle className="w-3 h-3" />} label="Conflicts" value={String(node.conflictCount)} />
        <MetaItem icon={<Link2 className="w-3 h-3" />} label="References" value={String(node.referenceCount)} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-glass-border">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            'text-xs border',
            hasChanges
              ? 'bg-matrix/15 text-matrix hover:bg-matrix/25 border-matrix/30'
              : 'text-muted-foreground border-glass-border'
          )}
        >
          {isSaving ? (
            <motion.div className="w-3 h-3 border-2 border-matrix/30 border-t-matrix rounded-sm animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1" />
          )}
          Save
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={handlePromote}
          disabled={!canPromote || isPromoting}
          className={cn(
            'text-xs border',
            canPromote
              ? 'text-amber-500 hover:bg-amber-500/10 border-amber-500/20'
              : 'text-muted-foreground border-glass-border'
          )}
        >
          {isPromoting ? (
            <motion.div className="w-3 h-3 border-2 border-amber-500/30 border-t-amber-500 rounded-sm animate-spin" />
          ) : (
            <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
          )}
          Promote
        </Button>

        <CreateNodeDialog
          parentId={node.id}
          defaultLevel={node.level}
          onSuccess={(newNode) => {
            useMemoryStore.getState().selectNode(newNode.id);
          }}
        />

        <div className="flex-1" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/10 border border-red-400/15"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass-strong border-glass-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm">Delete &ldquo;{node.title}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                This will permanently remove this memory node. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-mono-xs">
      <span className="text-muted-foreground/50">{icon}</span>
      <span className="text-muted-foreground/60">{label}</span>
      <span className="text-foreground/70 tabular-nums">{value}</span>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT — MemoryExplorer
   ================================================================ */

export function MemoryExplorer({ onSelectNode }: ExplorerProps) {
  const { nodes, selectedNodeId, selectNode } = useMemoryStore();

  const [levelFilter, setLevelFilter] = useState<'all' | MemoryLevel>('all');
  const [planeFilter, setPlaneFilter] = useState<'all' | MemoryPlane>('all');
  const [kindFilter, setKindFilter] = useState<'all' | MemoryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter nodes orthogonally
  const filteredNodes = useMemo(() => {
    let result = nodes;
    if (levelFilter !== 'all') {
      result = result.filter(n => n.level === levelFilter);
    }
    if (planeFilter !== 'all') {
      result = result.filter(n => n.plane === planeFilter);
    }
    if (kindFilter !== 'all') {
      result = result.filter(n => n.category === kindFilter);
    }
    // local search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [nodes, levelFilter, planeFilter, kindFilter, searchQuery]);

  const handleSelect = useCallback((node: MemoryNode) => {
    selectNode(node.id);
    onSelectNode?.(node);
  }, [selectNode, onSelectNode]);

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  return (
    <GlassPanel variant="strong" padding="none" className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold tracking-tight text-gradient-matrix flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-matrix" />
          Memory Explorer
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-mono-xs text-muted-foreground tabular-nums">{filteredNodes.length} nodes</span>
          <CreateNodeDialog
            onSuccess={(newNode) => {
              handleSelect(newNode);
            }}
          />
        </div>
      </div>

      {/* Orthogonal Filters & Search */}
      <div className="flex flex-col gap-2 px-4 pb-3 border-b border-glass-border">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as any)}>
            <SelectTrigger className="h-7 text-xs border-glass-border w-[100px] shrink-0">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Levels</SelectItem>
              {LEVEL_OPTIONS.map(l => (
                <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={planeFilter} onValueChange={(v) => setPlaneFilter(v as any)}>
            <SelectTrigger className="h-7 text-xs border-glass-border w-[120px] shrink-0">
              <SelectValue placeholder="All Planes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Planes</SelectItem>
              {PLANE_OPTIONS.map(p => (
                <SelectItem key={p} value={p} className="text-xs">{PLANE_LABELS[p]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as any)}>
            <SelectTrigger className="h-7 text-xs border-glass-border w-[120px] shrink-0">
              <SelectValue placeholder="All Kinds" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Kinds</SelectItem>
              {CATEGORY_OPTIONS.map(c => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative mt-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nodes by title, content, category, or tags…"
            className="h-7 pl-7 text-xs bg-transparent border-glass-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              title="Clear search"
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main content: list + detail */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* LEFT: Node list */}
        <div className="w-full lg:w-[40%] border-r border-glass-border/50 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto max-h-[320px] lg:max-h-none p-2 space-y-0.5">
            {filteredNodes.length > 0 ? (
              filteredNodes.map(n => (
                <TreeNode
                  key={n.id}
                  node={n}
                  isSelected={n.id === selectedNodeId}
                  onSelect={() => handleSelect(n)}
                />
              ))
            ) : (
              <p className="text-xs text-muted-foreground/40 italic py-4 text-center">
                {searchQuery ? 'No matches' : 'No nodes found in this filter'}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Node detail panel */}
        <div className="w-full lg:w-[60%] flex flex-col min-h-0 overflow-y-auto max-h-[400px] lg:max-h-none">
          <div className="p-4">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <NodeDetailPanel
                    node={selectedNode}
                    onUpdated={(updated) => {
                      onSelectNode?.(updated);
                    }}
                    onDeleted={() => {
                      selectNode(null);
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="w-12 h-12 rounded-sm glass-subtle flex items-center justify-center mb-3">
                    <FolderOpen className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <p className="text-xs text-muted-foreground/50">Select a node to view details</p>
                  <p className="text-mono-xs text-muted-foreground/30 mt-1">or create a new one with +</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

/* ================================================================
   LEVEL FILTER BUTTON — small toggle for L0/L1/L2
   ================================================================ */
function LevelFilterButton({
  children,
  active,
  onClick,
  level,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  level?: MemoryLevel;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2 py-0.5 rounded-md text-mono-xs font-medium transition-all duration-200 border',
        active
          ? level
            ? cn('border-current', LEVEL_BADGE_STYLES[level])
            : 'border-matrix bg-matrix/10 text-matrix'
          : 'border-glass-border text-muted-foreground/60 hover:text-muted-foreground/90 hover:border-muted-foreground/30'
      )}
    >
      {children}
    </button>
  );
}
