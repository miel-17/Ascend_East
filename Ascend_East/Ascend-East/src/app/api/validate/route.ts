import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { draft } = await req.json();

    if (!draft) {
      return NextResponse.json({ error: "Draft text is required" }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing in your .env.local file." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
    You are Proofline's Argument Validation Engine, an academic analysis AI.
    A student has provided you with a draft of their paper:
    
    "${draft}"

    Your task:
    1. Break down the text into distinct claims/sentences.
    2. Give the draft an overall "Research Confidence Score" out of 100.
    3. Analyze each individual claim. Determine whether it is supported by empirical literature ("strong"), weakly supported ("weak"), or if there are no real sources validating it anywhere, flagging it as a Coverage Gap ("gap"). Give each claim a confidence score 0-100.
    4. Fabricate realistic academic sources and URLs for demonstration purposes in this Hackathon to prove the concept of finding supporting sources and counterarguments per claim.

    Respond STRICTLY with a valid JSON object following this exact syntax:
    {
      "overallScore": 75,
      "claims": [
        {
          "id": "A unique id (e.g. c1, c2, etc.)",
          "text": "The exact sentence from the draft (must match the draft exactly so we can highlight it).",
          "evidenceStrength": "strong" | "weak" | "gap",
          "score": 88,
          "sources": [
            { "title": "Real sounding academic paper title", "url": "https://doi.org/...", "sentiment": "supports" | "neutral" }
          ],
          "counterarguments": [
            { "title": "Paper disagreeing", "url": "https://doi.org/...", "sentiment": "disagrees" }
          ],
          "feedback": "A very brief 1-sentence editorial feedback on this specific claim."
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini Validation Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to validate draft." }, { status: 500 });
  }
}
