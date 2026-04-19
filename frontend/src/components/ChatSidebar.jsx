import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, AlertCircle, Sparkles } from 'lucide-react'
import axios from 'axios'
import './ChatSidebar.css'

export default function ChatSidebar({ onDataExtracted, isLoading, setIsLoading, formData }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Log interaction details here (e.g., "Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure") or ask for help.',
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [hasError, setHasError] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getHistory = () =>
    messages
      .filter(m => m.id !== 'welcome')
      .slice(-8)
      .map(m => ({ role: m.role, content: m.content }))

  const sendMessage = async (text) => {
    const userMsg = (text || input).trim()
    if (!userMsg || isLoading) return

    setInput('')
    setHasError(false)

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
    }])

    setIsLoading(true)

    try {
      const res = await axios.post('http://localhost:8000/api/extract', {
        message: userMsg,
        conversation_history: getHistory(),
      })

      const data = res.data
      const aiText = onDataExtracted(data)

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiText || buildDefaultReply(data),
        timestamp: new Date(),
      }])
    } catch (err) {
      setHasError(true)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Could not reach the backend. Please ensure FastAPI is running on port 8000.',
        timestamp: new Date(),
        isError: true,
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const buildDefaultReply = (data) => {
    const parts = []
    if (data.doctor_name) parts.push(`Dr. ${data.doctor_name}`)
    if (data.hospital) parts.push(data.hospital)
    if (data.sentiment) parts.push(`${data.sentiment} sentiment`)
    return `Got it! Interaction logged${parts.length ? ` — ${parts.join(', ')}` : ''}. The form has been updated.`
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-sidebar">
      {/* Sidebar header */}
      <div className="sidebar-header">
        <div className="sidebar-header-icon">
          <Bot size={16} />
        </div>
        <div>
          <div className="sidebar-header-title">AI Assistant</div>
          <div className="sidebar-header-sub">Log Interaction details here via chat</div>
        </div>
        <div className="sidebar-status-dot" />
      </div>

      {/* Messages */}
      <div className="sidebar-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble-wrap ${msg.role === 'user' ? 'user-wrap' : 'ai-wrap'} fade-in`}>
            {msg.role === 'assistant' && (
              <div className="bubble-avatar">
                <Bot size={12} />
              </div>
            )}
            <div className={`chat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'} ${msg.isError ? 'bubble-error' : ''}`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="bubble-avatar bubble-avatar-user">
                <User size={12} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble-wrap ai-wrap fade-in">
            <div className="bubble-avatar"><Bot size={12} /></div>
            <div className="chat-bubble bubble-ai">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area — matches Figma bottom bar */}
      <div className="sidebar-input-area">
        {hasError && (
          <div className="sidebar-error">
            <AlertCircle size={12} />
            Backend not connected — start FastAPI on port 8000
          </div>
        )}
        <div className="sidebar-input-row">
          <input
            ref={inputRef}
            type="text"
            className="sidebar-input"
            placeholder="Describe Interaction..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={isLoading}
          />
          <button
            className="sidebar-log-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <div className="btn-spinner" />
            ) : (
              <>
                <Sparkles size={13} />
                Log
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
