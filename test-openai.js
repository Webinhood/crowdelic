import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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'
});

async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "Você é um assistente especializado em avaliar produtos e serviços."
      }, {
        role: "user",
        content: "Avalie este produto: Netflix"
      }],
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "product_evaluation",
          description: "Schema for product evaluation response",
          schema: {
            type: "object",
            properties: {
              firstImpression: { type: "string" },
              personalContext: {
                type: "object",
                properties: {
                  routineAlignment: { type: "string" },
                  financialPerspective: { type: "string" },
                  digitalComfort: { type: "string" },
                  familyConsideration: { type: "string" },
                  locationRelevance: { type: "string" }
                },
                required: [
                  "routineAlignment",
                  "financialPerspective",
                  "digitalComfort",
                  "familyConsideration",
                  "locationRelevance"
                ],
                additionalProperties: false
              },
              benefits: { 
                type: "array",
                items: { type: "string" }
              },
              concerns: {
                type: "array",
                items: { type: "string" }
              },
              decisionFactors: {
                type: "array",
                items: { type: "string" }
              },
              suggestions: {
                type: "array",
                items: { type: "string" }
              },
              targetAudienceAlignment: {
                type: "object",
                properties: {
                  ageMatch: { type: "string" },
                  locationMatch: { type: "string" },
                  incomeMatch: { type: "string" },
                  interestOverlap: { type: "string" },
                  painPointRelevance: { type: "string" }
                },
                required: [
                  "ageMatch",
                  "locationMatch",
                  "incomeMatch",
                  "interestOverlap",
                  "painPointRelevance"
                ],
                additionalProperties: false
              },
              tags: {
                type: "object",
                properties: {
                  positive: {
                    type: "array",
                    items: { type: "string" }
                  },
                  negative: {
                    type: "array",
                    items: { type: "string" }
                  },
                  opportunity: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["positive", "negative", "opportunity"],
                additionalProperties: false
              }
            },
            required: [
              "firstImpression",
              "personalContext",
              "benefits",
              "concerns",
              "decisionFactors",
              "suggestions",
              "targetAudienceAlignment",
              "tags"
            ],
            additionalProperties: false
          }
        }
      }
    });

    console.log('=== RESPOSTA BRUTA DA OPENAI ===');
    console.log(completion.choices[0].message.content);
    console.log('=== FIM DA RESPOSTA BRUTA ===');

  } catch (error) {
    console.error('Erro:', error);
  }
}

testOpenAI();
