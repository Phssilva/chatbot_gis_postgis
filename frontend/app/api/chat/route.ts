import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://geouser:geopass@postgis:5432/geospatial",
});

// Initialize AI clients
const AI_PROVIDER = process.env.AI_PROVIDER || "openai"; // "openai" or "gemini"

// OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Gemini client
const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Load schema and example queries
let dbSchema = "";
let exampleQueries = "";

try {
  const schemaPath = path.join(process.cwd(), "../database/db-schema.sql");
  const examplesPath = path.join(
    process.cwd(),
    "../database/example-queries.sql"
  );

  if (fs.existsSync(schemaPath)) {
    dbSchema = fs.readFileSync(schemaPath, "utf-8");
  }
  if (fs.existsSync(examplesPath)) {
    exampleQueries = fs.readFileSync(examplesPath, "utf-8");
  }
} catch (error) {
  console.error("Error loading database files:", error);
}

const SYSTEM_PROMPT = `You are a geospatial database assistant. You help users query a PostGIS database containing Brazilian geographic data.

DATABASE SCHEMA:
${dbSchema}

EXAMPLE QUERIES:
${exampleQueries}

INSTRUCTIONS:
1. Convert user questions in Portuguese to SQL queries
2. Use PostGIS spatial functions when appropriate
3. Always use the 'geo' schema (e.g., geo.estados, geo.rodovias, geo.cidades)
4. Return ONLY valid PostgreSQL/PostGIS SQL queries
5. For spatial queries, use appropriate SRID (4326 for WGS84)
6. Keep queries efficient and limit results when appropriate
7. Use meaningful column aliases in Portuguese

RESPONSE FORMAT:
Return a JSON object with:
{
  "sql": "SELECT ... FROM ...",
  "explanation": "Brief explanation in Portuguese of what the query does"
}`;

async function callOpenAI(message: string): Promise<{ sql: string; explanation: string }> {
  if (!openai) throw new Error("OpenAI not configured");
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const aiResponse = completion.choices[0].message.content;
  if (!aiResponse) throw new Error("No response from OpenAI");
  
  return JSON.parse(aiResponse);
}

async function callGemini(message: string): Promise<{ sql: string; explanation: string }> {
  if (!gemini) throw new Error("Gemini not configured");
  
  const model = gemini.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const prompt = `${SYSTEM_PROMPT}\n\nUser question: ${message}`;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text);
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if any AI provider is configured
    const hasOpenAI = !!openai;
    const hasGemini = !!gemini;
    
    if (!hasOpenAI && !hasGemini) {
      return NextResponse.json(
        {
          response:
            "⚠️ Nenhuma API de IA configurada. Configure OPENAI_API_KEY ou GEMINI_API_KEY no ambiente.",
          sql: null,
          data: null,
        },
        { status: 200 }
      );
    }

    // Call the appropriate AI provider
    let sql: string;
    let explanation: string;

    if (AI_PROVIDER === "gemini" && hasGemini) {
      const result = await callGemini(message);
      sql = result.sql;
      explanation = result.explanation;
    } else if (AI_PROVIDER === "openai" && hasOpenAI) {
      const result = await callOpenAI(message);
      sql = result.sql;
      explanation = result.explanation;
    } else {
      // Fallback to available provider
      if (hasGemini) {
        const result = await callGemini(message);
        sql = result.sql;
        explanation = result.explanation;
      } else {
        const result = await callOpenAI(message);
        sql = result.sql;
        explanation = result.explanation;
      }
    }

    // Execute the SQL query
    const result = await pool.query(sql);

    // Format response
    const response = `${explanation}\n\n📊 ${result.rows.length} resultado(s) encontrado(s).`;

    return NextResponse.json({
      response,
      sql,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error processing chat:", error);

    return NextResponse.json(
      {
        response: `Erro ao processar consulta: ${error.message}`,
        sql: null,
        data: null,
      },
      { status: 200 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    await pool.query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 500 }
    );
  }
}
