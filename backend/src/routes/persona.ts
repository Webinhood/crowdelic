import express from 'express';
import { Persona } from '@crowdelic/shared';
import { verifyToken } from '../middleware/auth';
import { prisma } from '../config/database';

const router = express.Router();

// Get all personas
router.get('/', verifyToken, async (req, res) => {
  try {
    const personas = await prisma.persona.findMany({
      where: {
        user_id: (req as any).user.id,
        deleted_at: null
      }
    });

    res.json(personas.map(persona => ({
      ...persona,
      traits: persona.traits || []
    })));
  } catch (err) {
    console.error('Error getting personas:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get personas by IDs
router.get('/batch', verifyToken, async (req, res) => {
  try {
    const idsParam = req.query.ids;
    if (!idsParam) {
      return res.status(400).json({ error: 'IDs parameter is required' });
    }

    const ids = Array.isArray(idsParam) ? idsParam : [idsParam];
    console.log('Fetching personas for IDs:', ids);

    const personas = await prisma.persona.findMany({
      where: {
        id: { in: ids },
        deleted_at: null,
        OR: [
          { user_id: (req as any).user.id },
          { is_public: true }
        ]
      },
      select: {
        id: true,
        name: true,
        description: true,
        occupation: true,
        age: true,
        background_story: true,
        goals: true,
        interests: true,
        traits: true,
        education: true,
        income: true,
        location: true,
        family_status: true,
        daily_routine: true,
        challenges: true,
        frustrations: true,
        habits: true,
        digital_skills: true,
        spending_habits: true,
        decision_factors: true,
        personality_traits: true,
        created_at: true,
        updated_at: true,
        user_id: true,
        is_public: true
      }
    });

    console.log('Found personas:', personas);

    if (personas.length === 0) {
      return res.status(404).json({ error: 'No personas found' });
    }

    res.json(personas.map(persona => ({
      ...persona,
      traits: persona.traits || [],
      goals: persona.goals || [],
      interests: persona.interests || []
    })));
  } catch (err) {
    console.error('Error getting personas by IDs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single persona
router.get('/:id', verifyToken, async (req, res) => {
  try {
    // Primeiro, tenta buscar a persona diretamente associada ao usuário
    let persona = await prisma.persona.findFirst({
      where: {
        id: req.params.id,
        user_id: (req as any).user.id,
        deleted_at: null
      }
    });

    // Se não encontrar, verifica se a persona está associada a algum teste do usuário
    if (!persona) {
      persona = await prisma.persona.findFirst({
        where: {
          id: req.params.id,
          tests: {
            some: {
              user_id: (req as any).user.id,
              persona_ids: { has: req.params.id }
            }
          },
          deleted_at: null
        }
      });
    }

    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json({
      ...persona,
      traits: persona.traits || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new persona
router.post('/', verifyToken, async (req, res) => {
  console.log('POST /personas - Request body:', req.body);
  
  try {
    const { 
      name,
      description,
      age,
      occupation,
      income,
      location,
      family_status,
      education,
      daily_routine,
      challenges,
      goals,
      frustrations,
      interests,
      habits,
      digital_skills,
      spending_habits,
      decision_factors,
      personality_traits,
      background_story,
      traits
    } = req.body;

    console.log('Received fields:', {
      name,
      description,
      age,
      occupation,
      income,
      location,
      family_status,
      education,
      daily_routine,
      challenges,
      goals,
      frustrations,
      interests,
      habits,
      digital_skills,
      spending_habits,
      decision_factors,
      personality_traits,
      background_story,
      traits
    });

    // Validação básica
    if (!name || !description) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Name and description are required' 
      });
    }

    // Garantir que arrays sejam arrays vazios se não fornecidos
    const safeGoals = Array.isArray(goals) ? goals : [];
    const safeInterests = Array.isArray(interests) ? interests : [];
    const safeTraits = Array.isArray(traits) ? traits : [];

    console.log('Safe arrays:', {
      safeGoals,
      safeInterests,
      safeTraits
    });

    const persona = await prisma.persona.create({
      data: {
        name,
        description,
        age,
        occupation,
        income,
        location,
        family_status,
        education,
        daily_routine,
        challenges,
        goals: safeGoals,
        frustrations,
        interests: safeInterests,
        habits,
        digital_skills,
        spending_habits,
        decision_factors,
        personality_traits,
        background_story,
        traits: safeTraits,
        user_id: (req as any).user.id
      }
    });

    console.log('Created persona:', persona);

    res.json({
      ...persona,
      goals: persona.goals || [],
      interests: persona.interests || [],
      traits: persona.traits || []
    });
  } catch (err) {
    console.error('Error creating persona:', err);
    if (err instanceof Error) {
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
    }
    res.status(500).json({ 
      error: 'Server error',
      details: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

// Update persona
router.put('/:id', verifyToken, async (req, res) => {
  console.log('PUT /personas/:id - Starting update for ID:', req.params.id);
  console.log('User ID:', (req as any).user.id);
  console.log('Request body:', req.body);
  
  try {
    // First, verify if the persona exists and belongs to the user
    const existingPersona = await prisma.persona.findFirst({
      where: {
        id: req.params.id,
        user_id: (req as any).user.id,
        deleted_at: null
      }
    });

    if (!existingPersona) {
      console.log('Persona not found or does not belong to user');
      return res.status(404).json({ 
        error: 'Persona not found',
        details: 'The persona either does not exist or does not belong to you'
      });
    }

    const { 
      name,
      description,
      age,
      occupation,
      income,
      location,
      family_status,
      education,
      daily_routine,
      challenges,
      goals,
      frustrations,
      interests,
      habits,
      digital_skills,
      spending_habits,
      decision_factors,
      personality_traits,
      background_story,
      traits
    } = req.body;

    console.log('Description from request:', description);

    // Validação básica
    if (!name || !description) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Name and description are required' 
      });
    }

    // Validação da descrição
    if (!description) {
      console.log('Validation failed: Missing description');
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Description is required' 
      });
    }

    // Validação e sanitização dos dados
    const sanitizedData = {
      name: name.trim(),
      description: description.trim(),
      age: age === null ? null : parseInt(age.toString(), 10),
      occupation: occupation?.trim() || '',
      income: income?.trim() || '',
      location: location?.trim() || '',
      family_status: family_status?.trim() || '',
      education: education?.trim() || '',
      daily_routine: daily_routine?.trim() || '',
      challenges: challenges?.trim() || '',
      goals: Array.isArray(goals) ? goals.map(g => g.trim()).filter(Boolean) : [],
      frustrations: frustrations?.trim() || '',
      interests: Array.isArray(interests) ? interests.map(i => i.trim()).filter(Boolean) : [],
      habits: habits?.trim() || '',
      digital_skills: digital_skills?.trim() || '',
      spending_habits: spending_habits?.trim() || '',
      decision_factors: decision_factors?.trim() || '',
      personality_traits: personality_traits?.trim() || '',
      background_story: background_story?.trim() || '',
      traits: Array.isArray(traits) ? traits.map(t => t.trim()).filter(Boolean) : []
    };

    console.log('Sanitized data:', sanitizedData);

    const updatedPersona = await prisma.persona.update({
      where: {
        id: req.params.id
      },
      data: {
        name: sanitizedData.name,
        description: sanitizedData.description,
        age: sanitizedData.age,
        occupation: sanitizedData.occupation,
        income: sanitizedData.income,
        location: sanitizedData.location,
        family_status: sanitizedData.family_status,
        education: sanitizedData.education,
        daily_routine: sanitizedData.daily_routine,
        challenges: sanitizedData.challenges,
        goals: sanitizedData.goals,
        frustrations: sanitizedData.frustrations,
        interests: sanitizedData.interests,
        habits: sanitizedData.habits,
        digital_skills: sanitizedData.digital_skills,
        spending_habits: sanitizedData.spending_habits,
        decision_factors: sanitizedData.decision_factors,
        personality_traits: sanitizedData.personality_traits,
        background_story: sanitizedData.background_story,
        traits: sanitizedData.traits,
        updated_at: new Date()
      }
    });

    console.log('Updated persona:', updatedPersona);

    res.json({
      ...updatedPersona,
      goals: updatedPersona.goals || [],
      interests: updatedPersona.interests || [],
      traits: updatedPersona.traits || []
    });
  } catch (err) {
    console.error('Error updating persona:', err);
    if (err instanceof Error) {
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
    }
    res.status(500).json({ 
      error: 'Server error',
      details: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

// Delete persona
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedPersona = await prisma.persona.update({
      where: {
        id: req.params.id
      },
      data: {
        deleted_at: new Date()
      }
    });

    if (!deletedPersona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json({ message: 'Persona deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      console.error('Error details:', err.message);
      console.error('Error stack:', err.stack);
    }
    res.status(500).json({ 
      error: 'Server error',
      details: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
});

export const personaRouter = router;
