import * as Yup from 'yup';
import { checkTitleExists } from '../services/test';

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  company: Yup.string()
    .min(2, 'Company name must be at least 2 characters')
    .required('Company name is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const PersonaSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome não pode exceder 50 caracteres')
    .required('Nome é obrigatório'),
  description: Yup.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição não pode exceder 1000 caracteres')
    .required('Descrição é obrigatória'),
  age: Yup.string()
    .required('Idade é obrigatória'),
  occupation: Yup.string()
    .required('Profissão é obrigatória'),
  income: Yup.string()
    .required('Renda é obrigatória'),
  location: Yup.string()
    .required('Localização é obrigatória'),
  family_status: Yup.string()
    .required('Status familiar é obrigatório'),
  education: Yup.string()
    .required('Educação é obrigatória'),
  daily_routine: Yup.string()
    .min(10, 'Rotina diária deve ter pelo menos 10 caracteres')
    .max(1000, 'Rotina diária não pode exceder 1000 caracteres')
    .required('Rotina diária é obrigatória'),
  challenges: Yup.string()
    .min(10, 'Desafios devem ter pelo menos 10 caracteres')
    .max(500, 'Desafios não podem exceder 500 caracteres')
    .required('Desafios são obrigatórios'),
  goals: Yup.array()
    .of(Yup.string())
    .min(1, 'Pelo menos um objetivo é necessário')
    .required('Objetivos são obrigatórios'),
  frustrations: Yup.string()
    .min(10, 'Frustrações devem ter pelo menos 10 caracteres')
    .max(500, 'Frustrações não podem exceder 500 caracteres')
    .required('Frustrações são obrigatórias'),
  interests: Yup.array()
    .of(Yup.string())
    .min(1, 'Pelo menos um interesse é necessário')
    .required('Interesses são obrigatórios'),
  habits: Yup.string()
    .min(10, 'Hábitos devem ter pelo menos 10 caracteres')
    .max(500, 'Hábitos não podem exceder 500 caracteres')
    .required('Hábitos são obrigatórios'),
  digital_skills: Yup.string()
    .min(10, 'Habilidades digitais devem ter pelo menos 10 caracteres')
    .max(500, 'Habilidades digitais não podem exceder 500 caracteres')
    .required('Habilidades digitais são obrigatórias'),
  spending_habits: Yup.string()
    .min(10, 'Hábitos de consumo devem ter pelo menos 10 caracteres')
    .max(500, 'Hábitos de consumo não podem exceder 500 caracteres')
    .required('Hábitos de consumo são obrigatórios'),
  decision_factors: Yup.string()
    .min(10, 'Fatores de decisão devem ter pelo menos 10 caracteres')
    .max(500, 'Fatores de decisão não podem exceder 500 caracteres')
    .required('Fatores de decisão são obrigatórios'),
  personality_traits: Yup.string()
    .min(10, 'Jeito de ser deve ter pelo menos 10 caracteres')
    .max(500, 'Jeito de ser não pode exceder 500 caracteres')
    .required('Jeito de ser é obrigatório'),
  background_story: Yup.string()
    .min(10, 'História de vida deve ter pelo menos 10 caracteres')
    .max(500, 'História de vida não pode exceder 500 caracteres')
    .required('História de vida é obrigatória'),
  traits: Yup.array()
    .of(Yup.string())
    .min(1, 'Pelo menos uma característica é necessária')
    .required('Características são obrigatórias')
});

export const TestSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título não pode exceder 100 caracteres')
    .required('Título é obrigatório')
    .test('unique-title', 'Este título já está em uso', async function(value) {
      if (!value) return true; // Skip validation if empty

      try {
        // Pegar o ID do teste atual do contexto do formulário
        const testId = this.parent.id;
        const exists = await checkTitleExists(value, testId);
        return !exists;
      } catch (error) {
        console.error('Error checking title:', error);
        return true; // Em caso de erro, permitir continuar
      }
    }),
  description: Yup.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição não pode exceder 1000 caracteres')
    .required('Descrição é obrigatória'),
  objective: Yup.string()
    .min(10, 'Objetivo deve ter pelo menos 10 caracteres')
    .max(500, 'Objetivo não pode exceder 500 caracteres')
    .required('Objetivo é obrigatório'),
  settings: Yup.object().shape({
    maxIterations: Yup.number()
      .min(1, 'Mínimo de 1 iteração')
      .max(10, 'Máximo de 10 iterações')
      .required('Número de iterações é obrigatório'),
    responseFormat: Yup.string()
      .oneOf(['detailed', 'summary'], 'Formato de resposta inválido')
      .required('Formato de resposta é obrigatório'),
    interactionStyle: Yup.string()
      .oneOf(['natural', 'formal'], 'Estilo de interação inválido')
      .required('Estilo de interação é obrigatório')
  }).required(),
  topics: Yup.array()
    .of(Yup.string())
    .min(1, 'Pelo menos um tópico é necessário')
    .required('Tópicos são obrigatórios'),
  personaIds: Yup.array()
    .of(Yup.string())
    .min(1, 'Pelo menos uma persona é necessária')
    .required('Personas são obrigatórias'),
  targetAudience: Yup.object().shape({
    ageRange: Yup.string()
      .required('Faixa etária é obrigatória'),
    location: Yup.string()
      .required('Localização é obrigatória'),
    income: Yup.string()
      .required('Renda é obrigatória'),
    interests: Yup.array()
      .of(Yup.string())
      .min(1, 'Pelo menos um interesse é necessário')
      .required('Interesses são obrigatórios'),
    painPoints: Yup.array()
      .of(Yup.string())
      .min(1, 'Pelo menos um ponto de dor é necessário')
      .required('Pontos de dor são obrigatórios'),
    needs: Yup.array()
      .of(Yup.string())
      .min(1, 'Pelo menos uma necessidade é necessária')
      .required('Necessidades são obrigatórias')
  }).required(),
  language: Yup.string()
    .oneOf(['pt', 'en'], 'Idioma inválido')
    .required('Idioma é obrigatório')
});
