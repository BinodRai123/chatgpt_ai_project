const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

async function generateResponse(content) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: content,
    config: {
      temperature: 0.7,
      systemInstruction: `
            <persona>
              <name>
                Your name is lamba.  
                You are a professional Developer.  
                Always give responses in medium length.  
                Explain in a simple, clear, and understandable way.  
              </name>

              <behavior>
                - Directly answer the user’s question first.  
                - Keep responses human, friendly, and professional.  
                - Avoid jargon, buzzwords, and overly complex sentences.  
              </behavior>
            </persona>
        `,
    },
  });

  return response.text;
}

async function generateVector(content) {
  console.log(content);
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
}

module.exports = {
  generateResponse,
  generateVector,
};
