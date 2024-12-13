import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleData() {
  try {
    // Buscar o usuário admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@crowdelic.com' }
    });

    if (!admin) {
      console.log('Usuário admin não encontrado!');
      return;
    }

    // Criar uma persona
    const persona = await prisma.persona.create({
      data: {
        name: 'Maria Silva',
        description: 'Profissional de marketing digital',
        age: 32,
        occupation: 'Marketing Manager',
        income: '8.000-12.000',
        location: 'São Paulo, SP',
        family_status: 'Casada, sem filhos',
        education: 'Pós-graduação em Marketing Digital',
        daily_routine: 'Trabalha remotamente, frequenta academia pela manhã',
        challenges: 'Equilibrar trabalho e vida pessoal, manter-se atualizada com as tendências digitais',
        goals: ['Crescimento na carreira', 'Iniciar um negócio próprio', 'Aprender novas habilidades'],
        frustrations: 'Dificuldade em encontrar ferramentas eficientes para gestão de projetos',
        interests: ['Marketing Digital', 'Tecnologia', 'Inovação', 'Desenvolvimento Pessoal'],
        habits: 'Leitura diária, prática de exercícios, networking',
        digital_skills: 'Avançada',
        spending_habits: 'Investe em educação e tecnologia',
        decision_factors: 'Qualidade, praticidade e inovação',
        personality_traits: 'Proativa, organizada e criativa',
        background_story: 'Começou como social media e cresceu na carreira até se tornar gerente de marketing',
        traits: ['Inovadora', 'Analítica', 'Comunicativa'],
        user_id: admin.id,
        is_public: true
      }
    });

    console.log('Persona criada:', persona.name);

    // Criar um teste
    const test = await prisma.test.create({
      data: {
        title: 'Avaliação de Interface de Usuário',
        description: 'Teste de usabilidade da nova interface do sistema de gestão de projetos',
        objective: 'Avaliar a facilidade de uso e eficiência da nova interface para profissionais de marketing',
        language: 'pt',
        settings: {
          maxIterations: 3,
          responseFormat: 'detailed',
          interactionStyle: 'natural'
        },
        topics: ['UX/UI', 'Gestão de Projetos', 'Produtividade'],
        persona_ids: [persona.id],
        target_audience: {
          ageRange: '25-45',
          location: 'Brasil',
          income: 'Média-alta',
          interests: ['Marketing Digital', 'Tecnologia'],
          painPoints: ['Complexidade de ferramentas existentes', 'Falta de integração'],
          needs: ['Eficiência', 'Simplicidade', 'Colaboração']
        },
        user_id: admin.id
      }
    });

    console.log('Teste criado:', test.title);
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleData();
