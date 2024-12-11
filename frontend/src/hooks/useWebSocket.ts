import { useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const useWebSocket = (testId: string) => {
  console.log('[useWebSocket] Hook called with testId:', testId);
  const socketRef = useRef<Socket>();

  useEffect(() => {
    console.log('[useWebSocket] Effect running, current socket:', socketRef.current?.id);
    
    // Cleanup any existing socket before creating a new one
    if (socketRef.current) {
      console.log('[useWebSocket] Cleaning up existing socket');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = undefined;
    }

    // Create new socket instance
    console.log('[useWebSocket] Creating new socket connection');
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
      withCredentials: true,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketRef.current = socket;

    // Setup connection event handlers
    socket.on('connect', () => {
      console.log('[useWebSocket] Socket connected successfully:', socket.id);
      console.log('[useWebSocket] Joining test room:', testId);
      socket.emit('joinTest', testId);
    });

    socket.on('disconnect', (reason) => {
      console.log('[useWebSocket] Socket disconnected. Reason:', reason);
    });

    socket.on('error', (error) => {
      console.error('[useWebSocket] Socket error:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('[useWebSocket] Connection error:', error.message);
      // Tentar reconectar após erro de conexão
      setTimeout(() => {
        console.log('[useWebSocket] Attempting to reconnect...');
        socket.connect();
      }, 2000);
    });

    // Iniciar a conexão
    console.log('[useWebSocket] Initiating socket connection...');
    socket.connect();

    // Cleanup on unmount
    return () => {
      console.log('[useWebSocket] Cleaning up socket connection');
      if (socket.connected) {
        console.log('[useWebSocket] Leaving test room:', testId);
        socket.emit('leaveTest', testId);
      }
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = undefined;
    };
  }, [testId]);

  const onTestMessage = useCallback((callback: (message: any) => void) => {
    if (!socketRef.current) {
      console.warn('[useWebSocket] Socket not initialized when setting up testMessage listener');
      return () => {};
    }
    
    console.log('[useWebSocket] Setting up test_message listener');
    
    const messageHandler = (message: any) => {
      console.log('[useWebSocket] Test message received:', message);
      callback(message);
    };
    
    socketRef.current.on('testMessage', messageHandler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('testMessage', messageHandler);
      }
    };
  }, []);

  const onTestError = useCallback((callback: (error: Error) => void) => {
    if (!socketRef.current) {
      console.warn('Socket not initialized');
      return () => {};
    }

    console.log('Setting up test_error listener');
    const errorHandler = (error: any) => {
      console.log('Received test_error:', error);
      callback(error);
    };

    socketRef.current.on('testError', errorHandler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('testError', errorHandler);
      }
    };
  }, []);

  const onTestComplete = useCallback((callback: (results: any) => void) => {
    if (!socketRef.current) {
      console.warn('Socket not initialized');
      return () => {};
    }

    console.log('Setting up test_complete listener');
    const completeHandler = (results: any) => {
      console.log('Received test_complete:', results);
      callback(results);
    };

    socketRef.current.on('testComplete', completeHandler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('testComplete', completeHandler);
      }
    };
  }, []);

  const onTestUpdate = useCallback((callback: (update: any) => void) => {
    if (!socketRef.current) {
      console.warn('[useWebSocket] Socket not initialized');
      return () => {};
    }
    
    console.log('[useWebSocket] Setting up test_update listener');
    const updateHandler = (update: any) => {
      console.log('[useWebSocket] Test update received:', update);
      callback(update);
    };

    socketRef.current.on('testUpdate', updateHandler);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('testUpdate', updateHandler);
      }
    };
  }, []);

  return {
    onTestMessage,
    onTestError,
    onTestComplete,
    onTestUpdate
  };
};
