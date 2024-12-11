INSERT INTO tests (
  title,
  description,
  objective,
  settings,
  topics,
  persona_ids,
  target_audience,
  content,
  language,
  user_id,
  status
) VALUES (
  'Lançamento de cartão para público jovem',
  'Somos um banco digital e estamos lançando um novo cartão para o público jovem e queremos entender  pontos de resistência e como podemos comunicar esse novo produto.',
  'Queremos entender  pontos de resistência em aderir cartões digitais e como podemos comunicar esse novo produto.',
  '{"maxIterations": 5, "responseFormat": "detailed", "interactionStyle": "natural"}'::jsonb,
  '["Pop", "Banco digital"]'::jsonb,
  '[]'::jsonb,
  '{
    "ageRange": "18-25",
    "location": "Sudeste",
    "income": "Classes A, B e C",
    "interests": ["Pop", "Banco digital"],
    "painPoints": ["Cultura de cartão físico"],
    "needs": ["Praticidade"]
  }'::jsonb,
  '{"type": "text", "description": "Somos um banco digital e estamos lançando um novo cartão para o público jovem e queremos entender  pontos de resistência e como podemos comunicar esse novo produto."}'::jsonb,
  'pt',
  (SELECT id FROM users LIMIT 1),
  'pending'
) RETURNING id;
