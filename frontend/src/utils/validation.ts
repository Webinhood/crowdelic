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
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(100, 'O título não pode exceder 100 caracteres')
    .required('O título é obrigatório')
    .test('unique-title', 'Este título já está em uso', async function (value) {
      if (!value) return true;
      const excludeId = this.parent.id;
      const exists = await checkTitleExists(value, excludeId);
      return !exists;
    }),
  description: Yup.string()
    .min(10, 'A descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'A descrição não pode exceder 1000 caracteres')
    .required('A descrição é obrigatória'),
  objective: Yup.string()
    .min(10, 'O objetivo deve ter pelo menos 10 caracteres')
    .max(500, 'O objetivo não pode exceder 500 caracteres')
    .required('O objetivo é obrigatório'),
  settings: Yup.object().shape({
    max_iterations: Yup.number()
      .min(1, 'O número de iterações deve ser pelo menos 1')
      .max(10, 'O número de iterações não pode exceder 10')
      .required('O número de iterações é obrigatório'),
    response_format: Yup.string()
      .oneOf(['detailed', 'summary', 'structured'], 'Formato de resposta inválido')
      .required('O formato de resposta é obrigatório'),
    interaction_style: Yup.string()
      .oneOf(['natural', 'formal', 'casual'], 'Estilo de interação inválido')
      .required('O estilo de interação é obrigatório')
  }),
  topics: Yup.array()
    .of(Yup.string())
    .min(1, 'Pelo menos um tópico é necessário')
    .required('Tópicos são obrigatórios'),
  persona_ids: Yup.array()
    .of(Yup.string())
    .min(1, 'Pelo menos uma persona é necessária')
    .required('Personas são obrigatórias'),
  target_audience: Yup.object().shape({
    age_range: Yup.string()
      .required('A faixa etária é obrigatória'),
    location: Yup.string()
      .required('A localização é obrigatória'),
    income: Yup.string()
      .required('A renda é obrigatória'),
    interests: Yup.array()
      .of(Yup.string())
      .min(1, 'Pelo menos um interesse é necessário')
      .required('Interesses são obrigatórios'),
    pain_points: Yup.array()
      .of(Yup.string())
      .min(1, 'Pelo menos um ponto de dor é necessário')
      .required('Pontos de dor são obrigatórios'),
    needs: Yup.array()
      .of(Yup.string())
      .min(1, 'Pelo menos uma necessidade é necessária')
      .required('Necessidades são obrigatórias')
  }),
  language: Yup.string()
    .oneOf(['pt', 'en'], 'Idioma inválido')
    .required('Idioma é obrigatório')
});
