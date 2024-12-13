import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function makeAdmin(email: string, password: string) {
  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin',
          role: 'admin'
        }
      });
      console.log('Admin user created:', user);
    } else {
      // Update existing user to admin with new password
      user = await prisma.user.update({
        where: { email },
        data: { 
          role: 'admin',
          password: hashedPassword
        }
      });
      console.log('User updated to admin:', user);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin('admin@crowdelic.com', '680dbf11cd98d587ba3afc5f142a186dJ2lB0Q==!@#$');
