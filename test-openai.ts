import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "system",
        content: "Você é um assistente especializado em avaliar produtos e serviços."
      }, {
        role: "user",
        content: "Avalie este produto: Netflix"
      }],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    console.log('=== RESPOSTA BRUTA DA OPENAI ===');
    console.log(completion.choices[0].message.content);
    console.log('=== FIM DA RESPOSTA BRUTA ===');

  } catch (error) {
    console.error('Erro:', error);
  }
}

testOpenAI();
