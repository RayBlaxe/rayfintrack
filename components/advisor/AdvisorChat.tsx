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
      content: 'Halo! Aku RayFin AI 🤖\nKirim transaksi ("Beli kopi 25rb bca") atau tanyakan kondisi keuanganmu. Aku punya akses data real-time!',
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
        content: 'Maaf, terjadi kesalahan. Coba lagi! 🙏',
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
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* Suggestions (shown only at start) */}
        {messages.length === 1 && (
          <div className="flex flex-col gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 text-sm hover:border-[#CCFF00]/40 hover:text-white/80 transition-all"
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
              className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
            >
              {/* Avatar */}
              <div className={cn(
                'h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs',
                msg.role === 'user'
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-[#1b3a4b] border border-white/10'
              )}>
                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-[#CCFF00]" />}
              </div>

              {/* Bubble */}
              <div className={cn('max-w-[80%]', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col gap-1')}>
                <div className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#21262D] text-white rounded-tr-sm'
                    : 'bg-[#161B22] border border-white/8 text-white/90 rounded-tl-sm'
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
                <span className="text-white/20 text-[10px] px-1">
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
            className="flex gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-[#1b3a4b] border border-white/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-[#CCFF00]" />
            </div>
            <div className="bg-[#161B22] border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-[#CCFF00] animate-spin" />
              <span className="text-white/40 text-sm">Sedang berpikir...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/8">
        <div className="flex items-end gap-3 bg-[#161B22] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-[#CCFF00]/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan atau transaksi..."
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none resize-none max-h-24 scrollbar-hide"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="h-8 w-8 rounded-full bg-[#CCFF00] flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            <Send className="h-3.5 w-3.5 text-black" />
          </button>
        </div>
      </div>
    </div>
  )
}
