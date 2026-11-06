'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User, Trash2 } from 'lucide-react'
import { ChatMessage } from '@/types'
import { TransactionDraftCard } from './TransactionDraftCard'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Berapa saldo BCA saya?',
  'Boleh beli gadget 3 juta sekarang?',
  'Bagaimana kondisi keuangan bulan ini?',
]

const STORAGE_KEY = 'rayfin_ai_chat_v1'

const INITIAL_WELCOME: ChatMessage = {
  id: '0',
  role: 'assistant',
  type: 'TEXT',
  content: 'Halo! Aku RayFin AI 🤖\nKirim transaksi ("Beli kopi 25rb bca") atau tanyakan kondisi keuanganmu. Aku punya akses data finansial real-time!',
  timestamp: new Date(),
}

export function AdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 1. Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const restored = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
          setMessages(restored)
        }
      }
    } catch (e) {
      console.warn('Gagal memuat riwayat chat:', e)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // 2. Persist history to localStorage
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } catch (e) {
      console.warn('Gagal menyimpan riwayat chat:', e)
    }
  }, [messages, isHydrated])

  // 3. Auto-grow textarea with reactive effect
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      const newHeight = Math.min(Math.max(inputRef.current.scrollHeight, 36), 120)
      inputRef.current.style.height = `${newHeight}px`
    }
  }, [input])

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
  }

  function handleResetChat() {
    if (!confirm('Hapus seluruh riwayat percakapan AI Advisor?')) return
    const fresh = [{ ...INITIAL_WELCOME, timestamp: new Date() }]
    setMessages(fresh)
    localStorage.removeItem(STORAGE_KEY)
  }

  function buildContextHistory(allMsgs: ChatMessage[]) {
    return allMsgs.slice(-10).map(m => {
      if (m.role === 'assistant' && m.type === 'TRANSACTION' && m.draft) {
        const isSaved = m.saved ? 'TELAH DISIMPAN KE BUKU KAS' : 'SELESAI DITAMPILKAN'
        const amt = m.draft.amount?.toLocaleString('id-ID') ?? '0'
        return {
          role: 'assistant',
          content: `[SISTEM: Transaksi "${m.draft.description}" (${m.draft.flow_type}) Rp ${amt} ${isSaved}. Jangan proses ulang transaksi ini.] ${m.content || ''}`,
        }
      }
      return {
        role: m.role,
        content: m.content || '',
      }
    })
  }

  async function send(text = input.trim()) {
    if (!text || loading) return
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = '36px'
    }

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
      const history = buildContextHistory(messages)

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
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Top Bar with Reset Chat */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
        <span>Riwayat Tersimpan Otomatis</span>
        <button
          onClick={handleResetChat}
          className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1 rounded-md"
          title="Reset Riwayat Chat"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Hapus Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
        {/* Suggestions (shown only when 1 message) */}
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
                  {msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime())
                    ? msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    : ''}
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

      {/* Auto-Grow Input with Mobile Safe Area */}
      <div className="flex-shrink-0 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-md">
        <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 shadow-xs transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pertanyaan atau catat transaksi..."
            rows={1}
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none max-h-[120px] overflow-y-auto py-1 leading-5"
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim() || loading}
            aria-label="Kirim pesan"
            className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all shadow-xs cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
