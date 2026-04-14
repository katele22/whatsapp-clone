import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import './App.css'

const socket = io()

function App() {
  const [username, setUsername] = useState('')
  const [loggedin, setLoggedin] = useState(false)
  const [to, setTo] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, `${data.from}: ${data.message}`])
    })
    return () => {
      socket.off('receive_message')
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function login() {
    if (!username.trim()) return alert('Enter username')
    socket.emit('login', username.trim())
    setLoggedin(true)

    // Load message history from DB
    const res = await fetch(`/api/messages/inbox/${username.trim()}`)
    const history = await res.json()
    const formatted = history.map((msg) =>
      msg.from === username.trim()
        ? `You -> ${msg.to}: ${msg.message}`
        : `${msg.from}: ${msg.message}`
    )
    setMessages(formatted)
  }

  function sendMessage() {
    if (!to || !messageInput) return
    socket.emit('send_message', { to, message: messageInput })
    setMessages((prev) => [...prev, `You -> ${to}: ${messageInput}`])
    setMessageInput('')
  }

  if (!loggedin) {
    return (
      <div className="container">
        <h2>Simple Chat</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          placeholder="Your name"
        />
        <button onClick={login}>Login</button>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Simple Chat</h2>
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Send to (username)"
      />
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default App
