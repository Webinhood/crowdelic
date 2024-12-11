-- Insert admin user
INSERT INTO users (id, name, email, password, company, role)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Admin User',
  'admin@crowdelic.com',
  '$2b$10$rQJvhWZGXTFNgUZHDFEZPOgF3qR6JK5X5vJ5P5P5P5P5P5P5P5', -- hash for 'admin123'
  'Crowdelic',
  'admin'
);

-- Insert persona for young digital native
INSERT INTO personas (
  id,
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
  traits,
  user_id
)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'Marina Silva',
  'Jovem profissional iniciante em tecnologia, nativa digital e adepta de soluções financeiras modernas',
  25,
  'Desenvolvedora Junior',
  'R$ 4.500 mensais',
  'São Paulo, SP',
  'Solteira, mora sozinha',
  'Graduada em Ciência da Computação',
  'Trabalha remotamente, frequenta academia pela manhã, costuma pedir delivery para refeições e usa muito serviços por assinatura',
  'Gerenciar gastos com entretenimento e delivery, construir histórico de crédito',
  ARRAY['Construir reserva financeira', 'Viajar internacionalmente', 'Investir em educação continuada'],
  'Burocracia bancária tradicional, taxas escondidas e atendimento pouco digital',
  ARRAY['Tecnologia', 'Viagens', 'Música', 'Séries', 'Gastronomia'],
  'Uso intenso de apps, compras online frequentes, prefere soluções 100% digitais',
  'Avançada, early adopter de novas tecnologias',
  'Gasta principalmente com alimentação (delivery), entretenimento digital, cursos online e academia',
  'Praticidade, benefícios digitais, cashback, interface intuitiva do app',
  'Dinâmica, independente, conectada, consciente financeiramente',
  'Cresceu usando smartphones e redes sociais, sempre preferiu soluções digitais para suas necessidades financeiras',
  ARRAY['Digital native', 'Tech-savvy', 'Independente', 'Moderna'],
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- Insert test for digital credit card
INSERT INTO tests (
  id,
  title,
  description,
  objective,
  language,
  status,
  settings,
  topics,
  persona_ids,
  target_audience,
  user_id
)
VALUES (
  'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'Lançamento Cartão Digital Next Gen',
  'Avaliação da proposta de valor e comunicação do novo cartão de crédito digital focado no público jovem',
  'Validar o apelo da proposta de valor, benefícios e comunicação do cartão de crédito digital para jovens profissionais',
  'pt',
  'pending',
  '{"maxIterations": 5, "responseFormat": "detailed", "interactionStyle": "natural"}',
  ARRAY['Cartão de Crédito', 'Digital Banking', 'Benefícios', 'Cashback', 'Experiência Digital'],
  ARRAY['b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'],
  '{
    "ageRange": "20-35",
    "location": "Brasil",
    "income": "3000-8000",
    "interests": ["tecnologia", "lifestyle digital", "investimentos"],
    "painPoints": ["burocracia bancária", "taxas altas", "atendimento tradicional"],
    "needs": ["praticidade", "benefícios digitais", "controle financeiro"]
  }',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);
