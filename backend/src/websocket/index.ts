import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Test } from '../types';

interface SocketConnection {
  socketId: string;
  userId?: string;
  lastActivity: number;
}

class WebSocketService {
  private io: Server;
  private testRooms: Map<string, Set<SocketConnection>> = new Map();
  private readonly INACTIVE_TIMEOUT = 1800000; // 30 minutes

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'http://localhost:5173',
          'http://localhost:3000'
        ],
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['*']
      },
      pingTimeout: 20000,
      pingInterval: 10000,
      transports: ['websocket'],
      allowUpgrades: false,
      path: '/socket.io/'
    });

    // Start cleanup interval
    setInterval(() => this.cleanupInactiveConnections(), 300000); // Run every 5 minutes

    this.io.on('connection', (socket) => {
      console.log('[WebSocket] New client connected:', socket.id);

      // Send immediate acknowledgment
      socket.emit('connected', { id: socket.id });

      socket.on('authenticate', (userId: string) => {
        console.log('[WebSocket] Authenticating user:', userId, 'for socket:', socket.id);
        const connection = this.findConnection(socket.id);
        if (connection) {
          connection.userId = userId;
          this.updateActivity(socket.id);
        }
      });

      socket.on('joinTest', (testId: string) => {
        console.log(`[WebSocket] Socket ${socket.id} joining test ${testId}`);
        socket.join(`test:${testId}`);
        
        // Track connection in test room
        if (!this.testRooms.has(testId)) {
          this.testRooms.set(testId, new Set());
        }
        
        const connection: SocketConnection = {
          socketId: socket.id,
          lastActivity: Date.now()
        };
        
        this.testRooms.get(testId)?.add(connection);
      });

      socket.on('leaveTest', (testId: string) => {
        console.log(`[WebSocket] Socket ${socket.id} leaving test ${testId}`);
        socket.leave(`test:${testId}`);
        
        // Remove connection from test room
        const connections = this.testRooms.get(testId);
        if (connections) {
          const connection = Array.from(connections).find(c => c.socketId === socket.id);
          if (connection) {
            connections.delete(connection);
          }
          if (connections.size === 0) {
            this.testRooms.delete(testId);
          }
        }
      });

      socket.on('disconnect', () => {
        console.log('[WebSocket] Client disconnected:', socket.id);
        this.handleDisconnect(socket.id);
      });

      // Handle errors
      socket.on('error', (error: Error) => {
        console.error(`[WebSocket] Socket error for ${socket.id}:`, error);
        this.handleDisconnect(socket.id);
      });
    });
  }

  private updateActivity(socketId: string) {
    for (const connections of this.testRooms.values()) {
      for (const connection of connections) {
        if (connection.socketId === socketId) {
          connection.lastActivity = Date.now();
        }
      }
    }
  }

  private findConnection(socketId: string): SocketConnection | undefined {
    for (const connections of this.testRooms.values()) {
      for (const connection of connections) {
        if (connection.socketId === socketId) {
          return connection;
        }
      }
    }
    return undefined;
  }

  private handleDisconnect(socketId: string) {
    for (const [testId, connections] of this.testRooms.entries()) {
      const connection = Array.from(connections).find(c => c.socketId === socketId);
      if (connection) {
        connections.delete(connection);
        if (connections.size === 0) {
          this.testRooms.delete(testId);
        }
      }
    }
  }

  private cleanupInactiveConnections() {
    const now = Date.now();
    for (const [testId, connections] of this.testRooms.entries()) {
      for (const connection of Array.from(connections)) {
        if (now - connection.lastActivity > this.INACTIVE_TIMEOUT) {
          console.log(`[WebSocket] Cleaning up inactive connection: ${connection.socketId} from test: ${testId}`);
          const socket = this.io.sockets.sockets.get(connection.socketId);
          if (socket) {
            socket.disconnect(true);
          }
          connections.delete(connection);
        }
      }
      if (connections.size === 0) {
        this.testRooms.delete(testId);
      }
    }
  }

  // Public methods for emitting events
  sendTestMessage(testId: string, message: any) {
    console.log('[WebSocket] Sending test message:', message);
    this.updateActivity(testId);
    this.io.to(`test:${testId}`).emit('testMessage', message);
  }

  sendTestError(testId: string, error: any) {
    console.log('[WebSocket] Sending test error:', error);
    this.updateActivity(testId);
    this.io.to(`test:${testId}`).emit('testError', error);
  }

  sendTestComplete(testId: string, results: any) {
    console.log('[WebSocket] Sending test complete:', results);
    this.updateActivity(testId);
    this.io.to(`test:${testId}`).emit('testComplete', results);
  }

  // Notify all clients in a test room
  notifyClients(testId: string, event: string, data: any) {
    console.log(`[WebSocket] Notifying clients in test ${testId}:`, { event, data });
    this.updateActivity(testId);
    this.io.to(`test:${testId}`).emit(event, data);
  }

  // Get active connections count for a test
  getActiveConnectionCount(testId?: string): number {
    if (testId) {
      return this.testRooms.get(testId)?.size || 0;
    }
    let total = 0;
    for (const connections of this.testRooms.values()) {
      total += connections.size;
    }
    return total;
  }

  // Send message to specific user
  sendToUser(userId: string, data: any) {
    for (const connections of this.testRooms.values()) {
      for (const connection of connections) {
        if (connection.userId === userId) {
          const socket = this.io.sockets.sockets.get(connection.socketId);
          if (socket) {
            socket.emit('message', data);
          }
        }
      }
    }
  }

  // Cleanup all connections
  async cleanup() {
    for (const connections of this.testRooms.values()) {
      for (const connection of connections) {
        const socket = this.io.sockets.sockets.get(connection.socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }
    this.testRooms.clear();
  }
}

export default WebSocketService;
