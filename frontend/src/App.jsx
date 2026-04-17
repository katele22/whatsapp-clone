import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import './App.css'

const socket = io()

function App() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
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

  async function register() {
    if (!username.trim() || !password.trim()) return alert('Enter username and password')
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })
    const data = await res.json()
    if (!res.ok) return alert(data.error || 'Registration failed')
    alert('Account created! Please log in.')
    setMode('login')
  }

  async function login() {
    if (!username.trim() || !password.trim()) return alert('Enter username and password')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    })
    const data = await res.json()
    if (!res.ok) return alert(data.error || 'Login failed')

    const jwt = data.token
    setToken(jwt)

    // Tell socket server who we are
    socket.emit('login', username.trim())
    setLoggedin(true)

    // Load message history using the JWT
    const inboxRes = await fetch(`/api/messages/inbox/${username.trim()}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
    const history = await inboxRes.json()
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
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setMode('login')} disabled={mode === 'login'}>Login</button>
          <button onClick={() => setMode('register')} disabled={mode === 'register'}>Register</button>
        </div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (mode === 'login' ? login() : register())}
          placeholder="Password"
        />
        {mode === 'login'
          ? <button onClick={login}>Login</button>
          : <button onClick={register}>Register</button>
        }
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Simple Chat, I am {username}</h2>
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
