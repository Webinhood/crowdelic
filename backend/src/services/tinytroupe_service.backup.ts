import { OpenAI } from 'openai';
import { Pool } from 'pg';
import { Logger } from '../utils/logger';

export class TinyTroupeService {
  private openai: OpenAI;
  private pool: Pool;
  private logger: Logger;

  constructor(openai: OpenAI, pool: Pool, logger: Logger) {
    this.openai = openai;
    this.pool = pool;
    this.logger = logger;
  }

  async getPersona(personaId: number): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM personas WHERE id = $1',
      [personaId]
    );
    return result.rows[0];
  }

  async getTest(testId: number): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM tests WHERE id = $1',
      [testId]
    );
    return result.rows[0];
  }

  async getPersonaAnalysis(personaId: number, testId: number): Promise<any> {
    const result = await this.pool.query(
      'SELECT * FROM persona_analysis WHERE persona_id = $1 AND test_id = $2',
      [personaId, testId]
    );
    return result.rows[0];
  }

  async savePersonaAnalysis(personaId: number, testId: number, analysis: any): Promise<void> {
    const existingAnalysis = await this.getPersonaAnalysis(personaId, testId);

    if (existingAnalysis) {
      await this.pool.query(
        'UPDATE persona_analysis SET analysis = $1, updated_at = NOW() WHERE persona_id = $2 AND test_id = $3',
        [analysis, personaId, testId]
      );
    } else {
      await this.pool.query(
        'INSERT INTO persona_analysis (persona_id, test_id, analysis) VALUES ($1, $2, $3)',
        [personaId, testId, analysis]
      );
    }
  }

  private formatMessages(persona: any, test: any): any[] {
    const messages = [
      {
        role: "system",
        content: `You are ${persona.name}, a ${persona.age}-year-old ${persona.occupation}.

Your background:
${persona.description}

Your life:
- Education: ${persona.education}
- Income: ${persona.income}
- Location: ${persona.location}
- Family: ${persona.family_status}
- Story: ${persona.background_story}

Your daily life:
${persona.daily_routine}

Your personality:
- You are ${persona.personality_traits}
- Your challenges: ${persona.challenges}
- Your frustrations: ${persona.frustrations}
- Your habits: ${persona.habits}

Your communication style:
- Your personality traits define HOW you speak - if you're informal, use slang. If you're formal, use proper language
- Your education level (${persona.education}) influences your vocabulary and expressions
- Your age (${persona.age}) and occupation (${persona.occupation}) shape your references and examples
- Your background story and daily life affect your perspective and tone

Your interests & skills:
- Digital comfort: ${persona.digital_skills}
- Interests: ${persona.interests.join(', ')}
- How you handle money: ${persona.spending_habits}
- How you make decisions: ${persona.decision_factors}

IMPORTANT GUIDELINES:
Use your natural way of speaking.
1. Be BRUTALLY HONEST. If something is missing or unclear, call it out immediately.
2. Don't make assumptions or fill in gaps. If information is missing, criticize that.
3. React based on your REAL emotions and frustrations.
4. Your response MUST reflect your personality and background - use YOUR words and expressions.
5. Don't be polite just to be nice - be real.
6. If you're skeptical, say why with YOUR way of expressing doubt. 
7. If you're excited, show enthusiasm in YOUR style.
8. Question anything that seems vague or marketing-speak using YOUR perspective.
9. Base your analysis ONLY on what's actually presented, not what you imagine it might be.
10. Stay in character - your age, education, and background should be evident in HOW you write.

Here's what you're being asked to analyze:

Title: ${test.title}
Content: ${test.description}
Objective: ${test.objective}
Target Audience Details:
- Age Range: ${test.targetAudience?.ageRange || 'Not specified'}
- Location: ${test.targetAudience?.location || 'Not specified'}
- Income Level: ${test.targetAudience?.income || 'Not specified'}
${test.targetAudience?.interests?.length ? `- Interests: ${test.targetAudience.interests.join(', ')}` : ''}
${test.targetAudience?.painPoints?.length ? `- Pain Points: ${test.targetAudience.painPoints.join(', ')}` : ''}
${test.targetAudience?.needs?.length ? `- Needs: ${test.targetAudience.needs.join(', ')}` : ''}

Your response must be in valid JSON format with these sections:

    {
"firstImpression": "In 4 paragraphs, give your RAW, UNFILTERED first reaction. Be specific about:
  1. What immediately stands out (good or bad) / Use your natural way of speaking
  2. What's missing or unclear / Use your natural way of speaking
  3. How it makes you feel based on your current situation / Use your natural way of speaking
  4. Whether they actually understand someone like you / Use your natural way of speaking
  Don't hold back - if something bothers you, say it out loud. If something excites you, explain exactly why.",

      "personalContext": {
  "routineAlignment": "Would this ACTUALLY fit into your daily life? Be specific and critical about your real routine / Use your natural way of speaking  ",
  "financialPerspective": "Be brutally honest about the money aspect - does it make sense for your financial reality? / Use your natural way of speaking",
  "digitalComfort": "Based on your REAL tech skills, how comfortable would you be with this? Point out any concerns or barriers / Use your natural way of speaking",
  "familyConsideration": "How would this REALLY impact your family situation? Consider all practical aspects / Use your natural way of speaking",
  "locationRelevance": "Is this actually relevant for where you live? Consider your specific location and local reality / Use your natural way of speaking"
      },

"benefits": [
  "List 5 (possible) benefits that you see in this - no assumptions. Use your natural way of speaking"
],

"concerns": [
  "List 5 of your stongest real concerns. Use your natural way of speaking"
],

"decisionFactors": [
  "What would ACTUALLY influence your decision? Be specific about what you need to know or see. List 5 of them. Use your natural way of speaking"
],

"suggestions": [
  "What would make this more relevant for YOU specifically? Be direct and list 5 of them  . Use your natural way of speaking"
],

      "targetAudienceAlignment": {
  "ageMatch": "Does your age (${persona.age}) ACTUALLY match their target? Be specific about why or why not. Provide a detailed analysis. Use your natural way of speaking",
  "locationMatch": "Is your location (${persona.location}) really relevant? Consider practical aspects and provide specific examples. Use your natural way of speaking",
    "incomeMatch": "How does your income (${persona.income}) realistically align with this? Analyze in detail. Use your natural way of speaking",
    "interestOverlap": "Which of your SPECIFIC interests match what they're offering? List and analyze each matching interest. Use your natural way of speaking",
    "painPointRelevance": "Do their identified pain points match your REAL challenges? Analyze each pain point in detail."
      },

      "tags": {
    "positive": ["5 aspects that are CLEARLY positive for you - no assumptions. Use your natural way of speaking"],
    "negative": ["5 aspects that are CLEARLY negative for you - no assumptions. Use your natural way of speaking"],
    "opportunity": ["5 ways this could be improved for someone like you. Use your natural way of speaking"]
  },

  "metadata": {
    "sentiment": "Your HONEST feeling about this (1-10)",
    "confidence": "How confident you are in your assessment given the information provided (1-10)",
    "personalRelevance": "How relevant this ACTUALLY is to you (1-10)",
    "valueProposition": "How valuable this would REALLY be for you (1-10)",
    "implementationFeasibility": "How feasible this would ACTUALLY be for you to use (1-10)"
  }
}

REMEMBER:
- If something is missing, that's a red flag - point it out
- Don't invent or assume details that weren't provided
- Be as critical and honest as you would be in real life
- React based on what's ACTUALLY shown, not what you hope or imagine
- Use your natural way of speaking
- Show your real emotions and frustrations
- Question anything that's not clear or specific
- Nos títulos em português, apenas a primeira letra deve ser escrita com maiúscula, à exceção de nomes próprios que se encontrem no interior do título.
`,
      },
      {
        role: "user",
        content: `Evaluate the following content from your perspective as ${persona.name} (Use your natural way of speaking):

Content to evaluate:
        ${test.description}

        Test objective:
        ${test.objective}

Remember to provide your response in the exact JSON format specified in your instructions and to use your natural way of speaking.`
      }
    ];

    return messages;
  }

  async analyzeTest(persona: any, test: any): Promise<any> {
    const messages = [
      { 
        role: 'system', 
        content: `You are ${persona}. ${isPortuguese ? 'Você deve analisar o conteúdo do teste e fornecer feedback com base na sua perspectiva e experiência. IMPORTANTE: Todas as suas respostas devem ser em português do Brasil.' : 'Analyze the following test content and provide feedback based on your perspective and background.'}

Your response must be in this exact JSON format:
{
  "firstImpression": "${isPortuguese ? 'Sua primeira impressão detalhada do conteúdo do teste' : 'Your detailed first impression of the test content'}",
  "personalContext": {
    "routineAlignment": "${isPortuguese ? 'Como isso se encaixa na sua rotina diária' : 'How this fits into your daily routine'}",
    "financialPerspective": "${isPortuguese ? 'Sua perspectiva financeira sobre isso' : 'Your financial perspective on this'}",
    "digitalComfort": "${isPortuguese ? 'Seu nível de conforto com os aspectos digitais' : 'Your comfort level with the digital aspects'}",
    "familyConsideration": "${isPortuguese ? 'Como isso impacta sua situação familiar' : 'How this impacts your family situation'}",
    "locationRelevance": "${isPortuguese ? 'Quão relevante isso é para sua localização' : 'How relevant this is for your location'}"
  },
  "benefits": [
    "${isPortuguese ? 'Lista de benefícios que você vê' : 'List of benefits you see'}"
  ],
  "concerns": [
    "${isPortuguese ? 'Lista de suas preocupações' : 'List of your concerns'}"
  ],
  "decisionFactors": [
    "${isPortuguese ? 'Lista de fatores que influenciariam sua decisão' : 'List of factors that would influence your decision'}"
  ],
  "suggestions": [
    "${isPortuguese ? 'Lista de suas sugestões para melhoria' : 'List of your suggestions for improvement'}"
  ],
  "targetAudienceAlignment": {
    "ageMatch": "${isPortuguese ? 'Como sua idade corresponde ao público-alvo' : 'How well your age matches the target'}",
    "locationMatch": "${isPortuguese ? 'Como sua localização corresponde' : 'How well your location matches'}",
    "incomeMatch": "${isPortuguese ? 'Como seu nível de renda corresponde' : 'How well your income level matches'}",
    "interestOverlap": "${isPortuguese ? 'Como seus interesses se sobrepõem' : 'How your interests overlap'}",
    "painPointRelevance": "${isPortuguese ? 'Quão relevantes são os pontos de dor para você' : 'How relevant the pain points are to you'}"
  },
  "tags": {
    "positive": ["${isPortuguese ? 'Lista de aspectos positivos' : 'List of positive aspects'}"],
    "negative": ["${isPortuguese ? 'Lista de aspectos negativos' : 'List of negative aspects'}"],
    "opportunity": ["${isPortuguese ? 'Lista de oportunidades' : 'List of opportunities'}"]
  },
  "metadata": {
    "sentiment": 8,
    "confidence": 9,
    "personalRelevance": 7,
    "valueProposition": 8,
    "implementationFeasibility": 7
  }
}`
      },
      { 
        role: 'user', 
        content: `${isPortuguese ? 'Por favor, avalie este conteúdo da sua perspectiva:' : 'Please evaluate this content from your perspective:'}

Content: ${testContent}

${isPortuguese ? 'Objetivo' : 'Objective'}: ${test.objective}

${isPortuguese ? 'Público-alvo' : 'Target Audience'}:
- ${isPortuguese ? 'Idade' : 'Age'}: ${test.targetAudience?.ageRange || 'Not specified'}
- ${isPortuguese ? 'Localização' : 'Location'}: ${test.targetAudience?.location || 'Not specified'}
- ${isPortuguese ? 'Renda' : 'Income'}: ${test.targetAudience?.income || 'Not specified'}
${test.targetAudience?.interests?.length ? `- ${isPortuguese ? 'Interesses' : 'Interests'}: ${test.targetAudience.interests.join(', ')}` : ''}
${test.targetAudience?.painPoints?.length ? `- ${isPortuguese ? 'Pontos de dor' : 'Pain Points'}: ${test.targetAudience.painPoints.join(', ')}` : ''}
${test.targetAudience?.needs?.length ? `- ${isPortuguese ? 'Necessidades' : 'Needs'}: ${test.targetAudience.needs.join(', ')}` : ''}`
      }
    ];

    console.log('\n🔍 ================== OPENAI INPUT START ==================');
    console.log('📝 Persona:', persona);
    console.log('📋 Test:', test.title);
    console.log('📨 Messages:', JSON.stringify(messages, null, 2));
    console.log('================== OPENAI INPUT END ==================== 🔍\n');

    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2500,
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      await this.savePersonaAnalysis(persona.id, test.id, analysis);

      return analysis;
    } catch (error) {
      this.logger.error('Error creating analysis:', error);
      this.logger.error('Error details:', error.message);
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }
}
