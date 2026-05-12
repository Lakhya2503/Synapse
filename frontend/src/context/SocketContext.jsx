import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { ChatEventEnum } from "../utils/constant";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    // Only connect if authenticated and has token
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket - no auth");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // If socket already exists, don't create a new one
    if (socketRef.current?.connected) {
      console.log("🔌 Socket already connected");
      return;
    }

    console.log("🔌 Creating new socket connection");

    // Create new socket connection with improved reliability
    const newSocket = io(import.meta.env.VITE_SOCKET_URI, {
      auth: { token },
      transports: ["websocket", "polling"], // Fallback to polling if websocket fails
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on(ChatEventEnum.CONNECTED_EVENT, () => {
      console.log("🤝 Backend handshake complete");
    });

    // Handle user online/offline status
    newSocket.on("user_online", ({ userId }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    newSocket.on("user_offline", ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    newSocket.on("user_status_changed", ({ userId, status }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("🚨 Socket connect error:", err.message);
      setIsConnected(false);
    });

    // Error handler
    newSocket.on("error", (error) => {
      console.error("🚨 Socket error:", error);
    });

    // Reconnection handlers
    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    newSocket.on("reconnect_attempt", () => {
      console.log("🔄 Attempting to reconnect...");
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("🚨 Reconnection error:", error.message);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("🚨 Reconnection failed");
      setIsConnected(false);
    });

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up socket");
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isAuthenticated]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    emit: (event, data) => {
      if (socketRef.current?.connected) {
        return socketRef.current.emit(event, data);
      } else {
        console.warn("Socket not connected, cannot emit:", event);
        return false;
      }
    },
    on: (event, callback) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
        return () => socketRef.current?.off(event, callback);
      }
      return () => {};
    },
    off: (event, callback) => {
      if (socketRef.current) {
        socketRef.current.off(event, callback);
      }
    },
    isUserOnline: (userId) => onlineUsers.has(userId),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
