import React, { useState, useEffect } from 'react'

type Props = {
  username: string
  onBack: () => void
  goHome: () => void
  initialFriend?: string
}

type Message = {
  _id: string
  sender: string
  receiver: string
  content: string
  timestamp: string
  read: boolean
}

type Conversation = {
  otherUsername: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function DMs({ username, onBack, goHome, initialFriend }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(initialFriend || null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [messageLoading, setMessageLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load conversations on component mount
  useEffect(() => {
    loadConversations()
  }, [username])

  // Load messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser)
    }
  }, [selectedUser])

  async function loadConversations() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(username)}`)
      if (!res.ok) throw new Error('Failed to load conversations')
      const data = await res.json()
      setConversations(data || [])
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(otherUsername: string) {
    setMessageLoading(true)
    try {
      const res = await fetch(
        `/api/messages/${encodeURIComponent(username)}/${encodeURIComponent(otherUsername)}`
      )
      if (!res.ok) throw new Error('Failed to load messages')
      const data = await res.json()
      setMessages(data || [])
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setMessageLoading(false)
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedUser) return

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: username,
          receiver: selectedUser,
          content: newMessage.trim()
        })
      })

      if (!res.ok) throw new Error('Failed to send message')
      
      setNewMessage('')
      // Reload messages and conversations
      await loadMessages(selectedUser)
      await loadConversations()
    } catch (err: any) {
      setError(err.message || 'Network error')
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="container">
      <div className="banner">
        <img src="/gatorbanner.png" alt="Swamp Study" onClick={goHome} />
        <button className="banner-home-btn" onClick={goHome}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Home
        </button>
      </div>

      <h2>Direct Messages</h2>
      <button className="btn" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

      {error && <div className="error">{error}</div>}

      <div style={{ display: 'flex', gap: '16px', height: '500px' }}>
        {/* Conversations List */}
        <div style={{ flex: '0 0 30%', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Conversations</h3>
          {loading && <p>Loading conversations...</p>}
          {!loading && conversations.length === 0 && (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No messages yet</p>
          )}
          {!loading && conversations.map((conv) => (
            <div
              key={conv.otherUsername}
              onClick={() => setSelectedUser(conv.otherUsername)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: selectedUser === conv.otherUsername ? '#e3f2fd' : '#f5f5f5',
                cursor: 'pointer',
                borderRadius: '4px',
                borderLeft: conv.unreadCount > 0 ? '3px solid #1976d2' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{conv.otherUsername}</strong>
                {conv.unreadCount > 0 && (
                  <span style={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.lastMessage}
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#999' }}>
                {formatTime(conv.lastMessageTime)}
              </p>
            </div>
          ))}
        </div>

        {/* Messages Thread */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          {!selectedUser ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ color: '#999', fontStyle: 'italic' }}>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              <h3 style={{ margin: '0 0 12px 0', paddingBottom: '12px', borderBottom: '1px solid #ddd' }}>
                {selectedUser}
              </h3>
              
              {/* Messages Display */}
              <div style={{
                flex: '1',
                overflowY: 'auto',
                marginBottom: '12px',
                padding: '8px',
                backgroundColor: '#fafafa',
                borderRadius: '4px'
              }}>
                {messageLoading && <p>Loading messages...</p>}
                {!messageLoading && messages.length === 0 && (
                  <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                    No messages yet. Start the conversation!
                  </p>
                )}
                {!messageLoading && messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: msg.sender === username ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: msg.sender === username ? '#1976d2' : '#e0e0e0',
                        color: msg.sender === username ? 'white' : 'black',
                        wordWrap: 'break-word'
                      }}
                    >
                      <p style={{ margin: '0 0 4px 0' }}>{msg.content}</p>
                      <p style={{
                        margin: '0',
                        fontSize: '11px',
                        opacity: 0.7,
                        textAlign: 'right'
                      }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  style={{
                    flex: '1',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: newMessage.trim() ? '#1976d2' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: newMessage.trim() ? 'pointer' : 'default',
                    fontWeight: 'bold'
                  }}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
