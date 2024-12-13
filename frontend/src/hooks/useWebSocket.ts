import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 1000;

export const useWebSocket = (testId: string) => {
  const socketRef = useRef<Socket>();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const testIdRef = useRef(testId);
  
  useEffect(() => {
    testIdRef.current = testId;
  }, [testId]);

  // Função para criar socket com configurações otimizadas
  const createSocket = useCallback(() => {
    if (!testIdRef.current) return null;

    return io(SOCKET_URL, {
      transports: ['websocket'],
      query: { testId: testIdRef.current },
      reconnection: true,
      reconnectionAttempts: RECONNECTION_ATTEMPTS,
      reconnectionDelay: RECONNECTION_DELAY,
      timeout: 10000
    });
  }, []);

  useEffect(() => {
    let socket: Socket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      if (connectionAttempts >= RECONNECTION_ATTEMPTS) {
        console.warn('[useWebSocket] Max reconnection attempts reached');
        return;
      }

      if (socketRef.current?.connected) {
        console.log('[useWebSocket] Already connected');
        return;
      }

      // Limpa conexão anterior
      if (socketRef.current) {
        console.log('[useWebSocket] Cleaning up previous connection');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = undefined;
      }

      socket = createSocket();
      if (!socket) {
        console.warn('[useWebSocket] Failed to create socket');
        return;
      }

      // Log all incoming events
      socket.onAny((eventName, ...args) => {
        console.log(`[useWebSocket] Received event: ${eventName}`, args);
      });

      socket.on('connect', () => {
        console.log('[useWebSocket] Connected successfully. Socket ID:', socket?.id);
        setIsConnected(true);
        setConnectionAttempts(0);

        // Join test room after connection
        if (testIdRef.current) {
          console.log('[useWebSocket] Joining test room:', testIdRef.current);
          socket?.emit('joinTest', testIdRef.current);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('[useWebSocket] Disconnected. Reason:', reason);
        setIsConnected(false);
        
        // Tenta reconectar
        setConnectionAttempts(prev => prev + 1);
        reconnectTimer = setTimeout(() => {
          connect();
        }, RECONNECTION_DELAY);
      });

      socket.on('error', (error) => {
        console.error('[useWebSocket] Socket error:', error);
      });

      socket.on('connect_error', (error) => {
        console.error('[useWebSocket] Connection error:', error);
        setConnectionAttempts(prev => prev + 1);
      });

      socketRef.current = socket;
    };

    console.log('[useWebSocket] Setting up socket connection for testId:', testIdRef.current);
    connect();

    return () => {
      console.log('[useWebSocket] Cleaning up socket connection');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (socketRef.current) {
        if (testIdRef.current) {
          console.log('[useWebSocket] Leaving test room:', testIdRef.current);
          socketRef.current.emit('leaveTest', testIdRef.current);
        }
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = undefined;
      }
      setIsConnected(false);
      setConnectionAttempts(0);
    };
  }, [createSocket]);

  const onTestMessage = useCallback((callback: (message: any) => void) => {
    console.log('[useWebSocket] Registering testMessage handler');
    if (socketRef.current) {
      socketRef.current.on('testMessage', (...args) => {
        console.log('[useWebSocket] Received testMessage:', args);
        callback(...args);
      });
    }
  }, []);

  const onTestError = useCallback((callback: (error: any) => void) => {
    console.log('[useWebSocket] Registering testError handler');
    if (socketRef.current) {
      socketRef.current.on('testError', (...args) => {
        console.log('[useWebSocket] Received testError:', args);
        callback(...args);
      });
    }
  }, []);

  const onTestUpdate = useCallback((callback: (update: any) => void) => {
    console.log('[useWebSocket] Registering testUpdate handler');
    if (socketRef.current) {
      socketRef.current.on('testUpdate', (...args) => {
        console.log('[useWebSocket] Received testUpdate:', args);
        callback(...args);
      });
    }
  }, []);

  const onTestComplete = useCallback((callback: (results: any) => void) => {
    console.log('[useWebSocket] Registering testComplete handler');
    if (socketRef.current) {
      socketRef.current.on('testComplete', (...args) => {
        console.log('[useWebSocket] Received testComplete:', args);
        callback(...args);
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('[useWebSocket] Manual disconnect called');
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = undefined;
      setIsConnected(false);
      setConnectionAttempts(0);
    }
  }, []);

  return {
    isConnected,
    onTestMessage,
    onTestError,
    onTestUpdate,
    onTestComplete,
    disconnect,
  };
};
