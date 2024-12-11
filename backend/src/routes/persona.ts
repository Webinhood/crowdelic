import express from 'express';
import { Persona } from '@crowdelic/shared';
import { auth } from '../middleware/auth';
import { pool } from '../config/database';

const router = express.Router();

// Get all personas
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM personas WHERE user_id = $1',
      [(req as any).user.id]
    );

    const personas = result.rows.map(persona => ({
      ...persona,
      traits: persona.traits || []
    }));

    res.json(personas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get personas by IDs
router.get('/batch', auth, async (req, res) => {
  try {
    const ids = Array.isArray(req.query.ids) ? req.query.ids : [req.query.ids];
    
    if (!ids || !ids.length) {
      return res.status(400).json({ error: 'IDs array is required' });
    }

    console.log('Fetching personas for IDs:', ids);

    const result = await pool.query(
      `SELECT DISTINCT p.* 
       FROM personas p
       LEFT JOIN tests t ON t.persona_ids @> ARRAY[p.id::text]
       WHERE p.id = ANY($1::uuid[])
       AND (p.user_id = $2 OR t.user_id = $2)`,
      [ids, (req as any).user.id]
    );

    console.log('Found personas:', result.rows);

    const personas = result.rows.map(persona => ({
      ...persona,
      traits: persona.traits || []
    }));

    res.json(personas);
  } catch (err) {
    console.error('Error fetching personas:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single persona
router.get('/:id', auth, async (req, res) => {
  try {
    // Primeiro, tenta buscar a persona diretamente associada ao usuário
    let result = await pool.query(
      'SELECT * FROM personas WHERE id = $1 AND user_id = $2',
      [req.params.id, (req as any).user.id]
    );

    // Se não encontrar, verifica se a persona está associada a algum teste do usuário
    if (result.rows.length === 0) {
      result = await pool.query(
        `SELECT DISTINCT p.* 
         FROM personas p
         INNER JOIN tests t ON t.persona_ids @> ARRAY[p.id::text]
         WHERE p.id = $1 AND t.user_id = $2`,
        [req.params.id, (req as any).user.id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    const persona = {
      ...result.rows[0],
      traits: result.rows[0].traits || []
    };

    res.json(persona);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new persona
router.post('/', auth, async (req, res) => {
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

    const result = await pool.query(
      `INSERT INTO personas (
        name, description, age, occupation, income, location, family_status,
        education, daily_routine, challenges, goals, frustrations,
        interests, habits, digital_skills, spending_habits,
        decision_factors, personality_traits, background_story,
        traits, user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text[],
        $12, $13::text[], $14, $15, $16, $17, $18, $19,
        $20::text[], $21
      ) RETURNING *`,
      [
        name, description, age, occupation, income, location, family_status,
        education, daily_routine, challenges,
        safeGoals, frustrations, safeInterests,
        habits, digital_skills, spending_habits,
        decision_factors, personality_traits, background_story,
        safeTraits, (req as any).user.id
      ]
    );

    console.log('Query result:', result.rows[0]);

    const persona = {
      ...result.rows[0],
      goals: result.rows[0].goals || [],
      interests: result.rows[0].interests || [],
      traits: result.rows[0].traits || []
    };

    res.json(persona);
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
router.put('/:id', auth, async (req, res) => {
  console.log('PUT /personas/:id - Starting update for ID:', req.params.id);
  console.log('User ID:', (req as any).user.id);
  console.log('Request body:', req.body);
  
  try {
    // First, verify if the persona exists and belongs to the user
    const existingPersona = await pool.query(
      'SELECT * FROM personas WHERE id = $1 AND user_id = $2',
      [req.params.id, (req as any).user.id]
    );

    if (existingPersona.rows.length === 0) {
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

    const result = await pool.query(
      `UPDATE personas SET
        name = $1,
        description = $2,
        age = $3,
        occupation = $4,
        income = $5,
        location = $6,
        family_status = $7,
        education = $8,
        daily_routine = $9,
        challenges = $10,
        goals = $11::text[],
        frustrations = $12,
        interests = $13::text[],
        habits = $14,
        digital_skills = $15,
        spending_habits = $16,
        decision_factors = $17,
        personality_traits = $18,
        background_story = $19,
        traits = $20::text[],
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $21 AND user_id = $22
      RETURNING *`,
      [
        sanitizedData.name,
        sanitizedData.description,
        sanitizedData.age,
        sanitizedData.occupation,
        sanitizedData.income,
        sanitizedData.location,
        sanitizedData.family_status,
        sanitizedData.education,
        sanitizedData.daily_routine,
        sanitizedData.challenges,
        sanitizedData.goals,
        sanitizedData.frustrations,
        sanitizedData.interests,
        sanitizedData.habits,
        sanitizedData.digital_skills,
        sanitizedData.spending_habits,
        sanitizedData.decision_factors,
        sanitizedData.personality_traits,
        sanitizedData.background_story,
        sanitizedData.traits,
        req.params.id,
        (req as any).user.id
      ]
    );

    if (result.rows.length === 0) {
      console.log('Update failed: No rows affected');
      return res.status(500).json({ 
        error: 'Update failed',
        details: 'No rows were affected by the update'
      });
    }

    const updatedPersona = {
      ...result.rows[0],
      goals: result.rows[0].goals || [],
      interests: result.rows[0].interests || [],
      traits: result.rows[0].traits || []
    };

    console.log('Successfully updated persona:', updatedPersona);
    res.json(updatedPersona);
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
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM personas WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, (req as any).user.id]
    );

    if (result.rows.length === 0) {
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
