'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User, Trash2, Cloud, CloudCheck } from 'lucide-react'
import { ChatMessage } from '@/types'
import { TransactionDraftCard } from './TransactionDraftCard'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Beli bensin supra 30rb cash',
  'Servis motor dan ganti oli 85rb BCA',
  'Berapa saldo kas dan tabungan saya?',
  'Bagaimana kondisi keuangan bulan ini?',
]

const STORAGE_KEY = 'rayfin_ai_chat_v1'

const INITIAL_WELCOME: ChatMessage = {
  id: '0',
  role: 'assistant',
  type: 'TEXT',
  content: 'Halo! Aku RayFin AI 🤖\nKirim transaksi ("Beli bensin supra 30rb cash") atau tanyakan kondisi keuanganmu. Riwayat chat ini tersinkronisasi otomatis ke akun cloud kamu!',
  timestamp: new Date(),
}

export function AdvisorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 1. Load history from Cloud API (with localStorage auto-migration)
  useEffect(() => {
    let active = true

    async function loadCloudHistory() {
      try {
        const res = await fetch('/api/advisor/chat')
        const data = await res.json()

        if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          if (active) {
            const restored = data.messages.map((m: any) => ({
              id: m.id ? String(m.id) : Date.now().toString(),
              role: m.role,
              type: m.type || 'TEXT',
              content: m.content || '',
              draft: m.draft || undefined,
              saved: m.saved || false,
              timestamp: new Date(m.created_at || m.timestamp || Date.now()),
            }))
            setMessages(restored)
          }
        } else {
          // Check if local storage has old messages to migrate
          const localSaved = localStorage.getItem(STORAGE_KEY)
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved)
              if (Array.isArray(parsed) && parsed.length > 0) {
                if (active) setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
                // Send bulk migration to cloud
                fetch('/api/advisor/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ bulk: true, messages: parsed }),
                }).then(() => {
                  localStorage.removeItem(STORAGE_KEY)
                })
              }
            } catch {}
          }
        }
      } catch (e) {
        console.warn('Gagal memuat chat cloud:', e)
      } finally {
        if (active) setIsSyncing(false)
      }
    }

    loadCloudHistory()

    return () => {
      active = false
    }
  }, [])

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 2. Auto-grow textarea with reactive effect
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

  async function handleResetChat() {
    if (!confirm('Hapus seluruh riwayat percakapan AI Advisor di akun cloud ini?')) return
    const fresh = [{ ...INITIAL_WELCOME, timestamp: new Date() }]
    setMessages(fresh)
    localStorage.removeItem(STORAGE_KEY)
    try {
      await fetch('/api/advisor/chat', { method: 'DELETE' })
    } catch (e) {
      console.error('Failed to clear cloud chat:', e)
    }
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

  async function persistToCloud(msg: ChatMessage) {
    try {
      await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
    } catch (e) {
      console.warn('Gagal sync pesan ke cloud:', e)
    }
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
    persistToCloud(userMsg)

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
      persistToCloud(aiMsg)
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
    <div className="flex flex-col h-[calc(100vh-140px)] max-h-[850px] bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Chat header */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              RayFin Advisor
              <span className="inline-flex items-center gap-1 text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <Cloud className="h-2.5 w-2.5" />
                <span>Cloud Sync</span>
              </span>
            </h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Tersinkronisasi per-akun secara otomatis</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Hapus riwayat chat"
          className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-2.5 max-w-[85%]',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            <div
              className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              )}
            >
              {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>

            <div className="space-y-2">
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-tl-xs border border-slate-200/50 dark:border-slate-700/50'
                )}
              >
                {msg.content}
              </div>

              {/* Render TransactionDraftCard if message has draft */}
              {msg.type === 'TRANSACTION' && msg.draft && (
                <TransactionDraftCard
                  draft={msg.draft}
                  onSaved={() => {
                    setMessages(prev =>
                      prev.map(m => m.id === msg.id ? { ...m, saved: true } : m)
                    )
                  }}
                  saved={msg.saved}
                />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto">
            <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl rounded-tl-xs px-4 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400">RayFin AI sedang berpikir...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => send(s)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-2xl p-1.5 focus-within:border-emerald-600 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Tulis transaksi atau pertanyaanmu..."
            className="flex-1 bg-transparent border-0 resize-none py-1.5 px-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none max-h-32"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors shrink-0 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
