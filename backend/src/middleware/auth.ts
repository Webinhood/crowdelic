import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key') as { id: string };
    
    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};
