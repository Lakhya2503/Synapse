import { createContext, useContext, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"
import { useAuth } from "../context/AuthContext"
import { ChatEventEnum } from "../utils/constant"

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider")
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { token } = useAuth()

  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    /* ---------- No token → disconnect ---------- */
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setSocket(null)
      setIsConnected(false)
      return
    }

    /* ---------- Reconnect on token change ---------- */
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    /* ---------- Create socket ---------- */
    const newSocket = io(import.meta.env.VITE_SOCKET_URI, {
      auth: { token },
      transports: ["websocket"], // stable + easier debugging
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    /* ---------- Events ---------- */
    newSocket.on("connect", () => {
      //  ("✅ Socket connected:", newSocket.id)
      setIsConnected(true)
    })

    newSocket.on(ChatEventEnum.CONNECTED_EVENT, () => {
      //  ("🤝 Backend handshake complete")
    })

    newSocket.on("disconnect", (reason) => {
      //  ("❌ Socket disconnected:", reason)
      setIsConnected(false)
    })

    newSocket.on("connect_error", (err) => {
      console.error("🚨 Socket connect error:", err.message)
    })

    /* ---------- Cleanup ---------- */
    return () => {
      newSocket.off()
      newSocket.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
