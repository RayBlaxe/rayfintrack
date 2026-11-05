'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User } from 'lucide-react'
import { ChatMessage } from '@/types'
import { TransactionDraftCard } from './TransactionDraftCard'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Berapa saldo BCA saya?',
  'Boleh beli gadget 3 juta sekarang?',
  'Bagaimana kondisi keuangan bulan ini?',
]

export function AdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      type: 'TEXT',
      content: 'Halo! Aku RayFin AI 🤖\nKirim transaksi ("Beli kopi 25rb bca") atau tanyakan kondisi keuanganmu. Aku punya akses data finansial real-time!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text = input.trim()) {
    if (!text || loading) return
    setInput('')

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'TEXT',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages
        .filter(m => m.type === 'TEXT')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await res.json()

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: data.type ?? 'TEXT',
        content: data.content ?? '',
        draft: data.draft,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'TEXT',
        content: 'Maaf, terjadi kesalahan koneksi. Coba lagi! 🙏',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* Suggestions (shown only at start) */}
        {messages.length === 1 && (
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="text-left px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 text-sm font-semibold hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 shadow-2xs transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {/* Avatar */}
              <div className={cn(
                'h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs shadow-2xs',
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div className={cn('max-w-[85%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                <div className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xs',
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs font-medium'
                    : 'bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                )}
                >
                  {msg.content && (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {msg.type === 'TRANSACTION' && msg.draft && (
                    <TransactionDraftCard
                      draft={msg.draft}
                      saved={msg.saved}
                      onSaved={() => {
                        setMessages(prev => prev.map(m =>
                          m.id === msg.id ? { ...m, saved: true } : m
                        ))
                      }}
                    />
                  )}
                </div>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] px-1 font-mono">
                  {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-800 dark:text-emerald-300">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 shadow-xs">
              <Loader2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sedang menganalisis data...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-transparent backdrop-blur-xs">
        <div className="flex items-end gap-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 shadow-xs transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan atau catat transaksi..."
            rows={1}
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none max-h-24 scrollbar-hide py-1"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            aria-label="Kirim pesan"
            className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all shadow-xs"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
