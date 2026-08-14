'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: 'Xin chào! 👋 Mình là trợ lý của **Bánh Mì Hieudeptrai**. Mình có thể giúp bạn:\n- Xem **thực đơn** & giá\n- Tư vấn món ăn\n- Hỗ trợ đặt hàng\n\nBạn cần giúp gì không? 🥖',
  },
]

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [hasNewMsg, setHasNewMsg] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  // Badge when new message and chat closed
  useEffect(() => {
    if (!open && messages.length > 1) {
      const last = messages[messages.length - 1]
      if (last.role === 'assistant') setHasNewMsg(true)
    }
  }, [messages, open])

  const handleOpen = () => {
    setOpen(true)
    setHasNewMsg(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendMessage = async (text: string) => {
    const content = text.trim()
    if (!content || isLoading) return

    setError(false)
    setInputValue('')

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setIsLoading(true)

    const assistantId = `a-${Date.now()}`
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        let errMessage = `HTTP ${res.status}`
        try {
          const errData = await res.json()
          if (errData?.error) errMessage = errData.error
        } catch { /* empty */ }
        throw new Error(errMessage)
      }
      if (!res.body) throw new Error('No body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk
        setMessages(prev =>
          prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
        )
      }

      // If nothing came through, show fallback
      if (!accumulated.trim()) {
        setMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: 'Xin lỗi, mình chưa nhận được phản hồi. Vui lòng thử lại!' }
            : m
          )
        )
      }
    } catch (err) {
      console.error('Chat error:', err)
      setError(true)
      setMessages(prev => prev.filter(m => m.id !== assistantId))
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="Mở chatbot"
        className={[
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300',
          'bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400',
          'hover:scale-110 active:scale-95',
        ].join(' ')}
      >
        {open ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {hasNewMsg && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </>
        )}
      </button>

      {/* ── Chat Window ── */}
      <div
        className={[
          'fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl border border-border/60',
          'bg-card/95 backdrop-blur-xl flex flex-col overflow-hidden',
          'transition-all duration-300 origin-bottom-right',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none',
        ].join(' ')}
        style={{ maxHeight: 'min(520px, calc(100vh - 8rem))' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight">Trợ Lý Bánh Mì</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <p className="text-xs text-white/80">Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.map((msg) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                  isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
                ].join(' ')}>
                  {isUser ? <User className="w-3.5 h-3.5" /> : '🥖'}
                </div>

                <div
                  className={[
                    'max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    isUser
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm',
                  ].join(' ')}
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {msg.content
                    ? msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <strong key={i}>{part.slice(2, -2)}</strong>
                          : part
                      )
                    : <span className="opacity-50 italic">Đang trả lời...</span>
                  }
                </div>
              </div>
            )
          })}

          {/* Loading dots (separate from message bubble) */}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 text-xs">
                🥖
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-center text-rose-500 bg-rose-50 dark:bg-rose-950/30 rounded-lg px-3 py-2">
              ⚠️ Có lỗi xảy ra. Vui lòng thử lại!
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {['Xem thực đơn 🥖', 'Giá cả?', 'Giờ mở cửa?', 'Cách đặt hàng?'].map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                disabled={isLoading}
                className="text-xs px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 px-3 py-3 border-t border-border shrink-0"
        >
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(inputValue)
              }
            }}
            placeholder="Nhập tin nhắn..."
            disabled={isLoading}
            className="flex-1 text-sm bg-muted rounded-xl px-3.5 py-2.5 outline-none placeholder:text-muted-foreground/60 disabled:opacity-50 focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 hover:opacity-90 disabled:opacity-40 transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>
      </div>
    </>
  )
}
