import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

interface TokenPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userRole?: string;
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Token mal formatado' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ message: 'Token mal formatado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as TokenPayload;
    
    // Buscar o usuário no banco para verificar se ainda existe e pegar o role atual
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    req.user = {
      id: user.id,  // Use o ID do banco em vez do token
      email: user.email
    };
    req.userRole = user.role;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
