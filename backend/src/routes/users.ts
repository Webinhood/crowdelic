import express from 'express';
import { prisma } from '../config/database';
import { verifyToken } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Middleware para verificar se o usuário é admin
const isAdmin = (req: any, res: any, next: any) => {
  try {
    if (!req.userRole || req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar este recurso.' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    res.status(500).json({ message: 'Erro ao verificar permissões do usuário.' });
  }
};

// Listar todos os usuários (apenas admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
});

// Criar novo usuário (apenas admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
});

// Atualizar usuário (apenas admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar se o email já está em uso por outro usuário
    if (email !== userExists.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Email já está em uso por outro usuário.' });
      }
    }

    const updateData: any = {
      name,
      email,
      role,
    };

    // Só atualiza a senha se ela foi fornecida
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
});

// Excluir usuário (apenas admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id }
    });

    if (!userExists) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Não permitir que o admin exclua a si mesmo
    if (id === req.user.id) {
      return res.status(400).json({ message: 'Não é possível excluir seu próprio usuário.' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
});

export const usersRouter = router;
