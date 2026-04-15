'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Send, Headphones } from 'lucide-react'
import { BackHeader } from '@/components/layout/back-header'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
}

const QUICK_ACTION_KEYS = [
  'transferHelp',
  'kycHelp',
  'accountHelp',
  'otherHelp',
] as const

export default function ChatPage() {
  const router = useRouter()
  const t = useTranslations('home')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: t('chat.welcome'),
      sender: 'agent',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function addMessage(text: string, sender: 'user' | 'agent') {
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}-${Math.random()}`, text, sender, timestamp: new Date() },
    ])
  }

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed) return
    addMessage(trimmed, 'user')
    setInput('')

    // Mock auto-reply after 1.5s
    setTimeout(() => {
      addMessage(t('chat.offlineNotice'), 'agent')
    }, 1500)
  }

  function handleQuickAction(key: string) {
    const text = t(`chat.quickActions.${key}`)
    addMessage(text, 'user')

    setTimeout(() => {
      addMessage(t('chat.offlineNotice'), 'agent')
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full bg-muted">
      <BackHeader
        title={t('chat.title')}
        onBack={() => router.back()}
      />

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        {/* Agent header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{t('chat.agentName')}</span>
        </div>

        {/* Quick actions — shown if only welcome message */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {QUICK_ACTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleQuickAction(key)}
                className="px-3 py-2 rounded-full bg-white border border-border text-sm text-foreground hover:bg-secondary transition-colors"
              >
                {t(`chat.quickActions.${key}`)}
              </button>
            ))}
          </div>
        )}

        {/* Message bubbles */}
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={[
                  'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                  msg.sender === 'user'
                    ? 'bg-accent text-white rounded-br-md'
                    : 'bg-white text-foreground border border-border rounded-bl-md',
                ].join(' ')}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-border px-4 py-3 safe-bottom">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={t('chat.inputPlaceholder')}
            className="flex-1 h-11 px-4 rounded-full bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-accent flex items-center justify-center flex-shrink-0 disabled:opacity-50 active:scale-95 transition-transform"
            aria-label={t('chat.send')}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
