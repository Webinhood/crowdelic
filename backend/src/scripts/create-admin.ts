import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminData = {
      name: 'Admin',
      email: 'admin@crowdelic.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    };

    const admin = await prisma.user.upsert({
      where: { email: adminData.email },
      update: {},
      create: adminData,
    });

    console.log('Admin user created:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
