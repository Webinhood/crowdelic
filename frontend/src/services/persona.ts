import api, { API_URL } from './api';

export interface Persona {
  id: string;
  name: string;
  description: string;
  background?: string;
  goals: string[];
  interests: string[];
  traits: string[];
  age: number;
  occupation: string;
  education: string;
  income: string;
  location: string;
  family_status: string;
  daily_routine: string;
  challenges: string;
  frustrations: string;
  habits: string;
  digital_skills: string;
  spending_habits: string;
  decision_factors: string;
  personality_traits: string;
  background_story: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface CreatePersonaData {
  name: string;
  description: string;
  age: number;
  occupation: string;
  income: string;
  location: string;
  family_status: string;
  education: string;
  daily_routine: string;
  challenges: string;
  goals: string[];
  frustrations: string;
  interests: string[];
  traits: string[];
  habits: string;
  digital_skills: string;
  spending_habits: string;
  decision_factors: string;
  personality_traits: string;
  background_story: string;
}

export const getPersonas = async (): Promise<Persona[]> => {
  const response = await api.get('/personas');
  return response.data;
};

export const getPersona = async (id: string): Promise<Persona> => {
  const response = await api.get(`/personas/${id}`);
  return response.data;
};

export const getPersonasById = async (id: string): Promise<Persona> => {
  const response = await api.get(`/personas/${id}`);
  if (!response.data) {
    throw new Error('Failed to fetch persona');
  }
  return response.data;
};

export const getPersonasByIds = async (ids: string[]): Promise<Persona[]> => {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('ids', id));
  
  const response = await api.get('/personas/batch', { params });
  if (!response.data) {
    throw new Error('Failed to fetch personas');
  }
  return response.data;
};

export const createPersona = async (data: CreatePersonaData): Promise<Persona> => {
  console.log('API createPersona called with:', data);
  try {
    const response = await api.post('/personas', data);
    console.log('API createPersona response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API createPersona error:', error);
    throw error;
  }
};

export const updatePersona = async (id: string, data: CreatePersonaData): Promise<Persona> => {
  console.log('API updatePersona called with:', { id, data });
  try {
    const response = await api.put(`/personas/${id}`, data);
    console.log('API updatePersona response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API updatePersona error:', error);
    throw error;
  }
};

export const deletePersona = async (id: string): Promise<void> => {
  await api.delete(`/personas/${id}`);
};
