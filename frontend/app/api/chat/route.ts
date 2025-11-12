import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://geouser:geopass@postgis:5432/geospatial",
});

// Initialize OpenAI (you'll need to set OPENAI_API_KEY env var)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

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

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          response:
            "⚠️ OpenAI API key não configurada. Configure OPENAI_API_KEY no ambiente.",
          sql: null,
          data: null,
        },
        { status: 200 }
      );
    }

    // Call OpenAI to generate SQL
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
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    const { sql, explanation } = JSON.parse(aiResponse);

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
