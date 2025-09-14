// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone');

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding
const chatgptIndex = pc.index('chatgpt-project');


async function createMemory({vector, metadata, messageId}){
    console.log(metadata.text)
    await chatgptIndex.upsert([ {
        id: messageId,
        values: vector,
        metadata: metadata
    } ])
}

async function  queryMemory({ queryVector, limit = 5, metadata }){
    const data = await chatgptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
        includeMetadata: true,
    })

    return data.matches;
}


module.exports = {
    createMemory,
    queryMemory
}