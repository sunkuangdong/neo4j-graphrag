import 'dotenv/config'
import { Neo4jGraph } from '@langchain/community/graphs/neo4j_graph'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, END, START } from '@langchain/langgraph'
import { HumanMessage } from '@langchain/core/messages'

const graph = new Neo4jGraph({
    url: 'bolt://localhost:7687',
    username: 'neo4j',
    password: '12345678',
})

const llm = new ChatOpenAI({
    model: process.env.MODEL_NAME ?? 'gpt-4.1-mini',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    },
})

const state = {
    messages: {
        value:
            (left, right) => left.concat(Array.isArray(right) ? right : [right]),
        default: () => []
    },
    cypher: null,
    context: null,
    answer: null,
}

function userQuery(state) {
    const last = state.messages[state.messages.length - 1]
    return last.content
}

async function generateCypher(state) {
    const prompt = `
      You are a professional Neo4j Cypher generator.
      Follow the schema below strictly. Return only raw Cypher code — no explanation, no punctuation outside the query, no markdown.

      Nodes:
      - Product: bubble tea products
      - Ingredient: ingredients
      - Type: milk tea categories
      - Method: preparation methods
      - People: target audiences

      Relationship directions (must be exact):
      - (Product)-[:BELONGS_TO]->(Type)
      - (Product)-[:CONTAINS]->(Ingredient)
      - (Product)-[:SUITABLE_FOR]->(People)
      - (Ingredient)-[:USES]->(Method)

      Rules:
      1. Never reverse relationship direction
      2. For multi-hop queries, use multiple MATCH clauses; do not connect paths incorrectly
      3. Return only the final executable Cypher statement
      4. Use exact entity names from the graph (case-sensitive):
         Products: Pearl Milk Tea
         Types: Taiwanese Milk Tea, Hong Kong Milk Tea
         Ingredients: Tapioca Pearls, Taro Balls, Fructose, Black Tea, Milk
         Methods: Boiling, Brewing
         People: Young Adults, Students, Dessert Lovers

      User question: ${userQuery(state)}
    `
    const res = await llm.invoke([new HumanMessage(prompt)])
    return { cypher: res.content }
}

async function executeGraphQuery(state) {
    const result = await graph.query(state.cypher)
    return { context: JSON.stringify(result) }
}

async function generateAnswer(state) {
    const prompt = `
        You are a bubble tea expert. Answer the user's question using only the retrieval results below.
        If results are empty or insufficient, briefly say the answer cannot be derived from the graph — do not invent facts.
        Requirements:
        - List facts directly; do not infer ingredients not present in the graph (e.g. water, ice, additives).
        Retrieval results: ${state.context}
        User question: ${userQuery(state)}
    `
    const res = await llm.invoke([new HumanMessage(prompt)])
    return { answer: res.content }
}

const workflow = new StateGraph({ channels: state })
    .addNode("generateCypher", generateCypher)
    .addNode("executeGraph", executeGraphQuery)
    .addNode("generateAnswer", generateAnswer)
    .addEdge(START, "generateCypher")
    .addEdge("generateCypher", "executeGraph")
    .addEdge("executeGraph", "generateAnswer")
    .addEdge("generateAnswer", END)
const app = workflow.compile()

async function printWorkflowMermaid() {
    const drawable = await app.getGraphAsync()
    const mermaid = drawable.drawMermaid({ withStyles: true })
    console.log('--- LangGraph Workflow (Mermaid) ---')
    console.log(mermaid)
    console.log('-----------------------------------------------------------')
}

async function runGraphRAG(question) {
    const res = await app.invoke({
        messages: [new HumanMessage(question)],
    })

    console.log('======================================')
    console.log('Question:', question)
    console.log('Generated Cypher:', res.cypher)
    console.log('Retrieval results:', res.context)
    console.log('Final answer:', res.answer)
    console.log('======================================')
}

(async () => {
    try {
        await printWorkflowMermaid()
        await Promise.all([
            runGraphRAG('What ingredients does our Pearl Milk Tea contain?'),
            runGraphRAG('What ingredients are used in Taiwanese milk tea drinks?'),
            runGraphRAG('Who is Pearl Milk Tea suitable for?'),
        ])
    } finally {
        await graph.close()
    }
})().catch(console.error)
