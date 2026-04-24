'use client'
import { useEffect, useState } from 'react'
import { useBusEvent } from '@/lib/hooks/useBusEvent'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

interface ToastItem {
  id:         string
  message:    string
  type:       'info' | 'success' | 'warn' | 'error'
  durationMs: number
}

const ICON = {
  info:    <Info      className="w-3.5 h-3.5 text-blue-400"   />,
  success: <CheckCircle className="w-3.5 h-3.5 text-slate-300" />,
  warn:    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />,
  error:   <XCircle   className="w-3.5 h-3.5 text-red-400"   />,
}
const BG = {
  info:    'border-blue-500/20   bg-blue-500/10',
  success: 'border-slate-700  bg-slate-800',
  warn:    'border-yellow-500/20 bg-yellow-500/10',
  error:   'border-red-500/20    bg-red-500/10',
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useBusEvent('infraconnect:toast', ({ message, type, durationMs = 3500 }: any) => {
    const id = crypto.randomUUID()
    setToasts((prev: any) => [...prev.slice(-4), { id, message, type, durationMs } as any])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), durationMs)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-14 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-sm border text-xs font-mono
                      shadow-xl pointer-events-auto max-w-xs ${BG[t.type]}`}
        >
          {ICON[t.type]}
          <span className="text-gray-200 flex-1">{t.message}</span>
          <button
            aria-label="Close toast"
            onClick={() => setToasts(prev => prev.filter(i => i.id !== t.id))}
            className="text-gray-600 hover:text-gray-400 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
