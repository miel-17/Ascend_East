import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    let reply = "I hear you, and it sounds like you're carrying a heavy emotional load. Can you tell me a little more about what’s going on?";
    const qLower = query.toLowerCase();

    if (qLower.includes("panic") || qLower.includes("anxious") || qLower.includes("anxiety")) {
        reply = "It's completely normal to feel overwhelmed. I want you to feel safe right now. Let's try to focus on taking slow, grounding breaths: Inhale for 4 seconds, hold for 4, and exhale for 4.";
    } else if (qLower.includes("alone") || qLower.includes("lonely")) {
        reply = "I'm so sorry you're feeling this way. Remeber that even when things feel isolating, you matter and are heard here. Consider dropping a message in the 24/7 Community Chats when you're ready.";
    } else if (qLower.includes("sad") || qLower.includes("cry")) {
        reply = "It's entirely okay to let those tears out. Feeling sad is a natural part of processing difficult things. I'm here to listen if you want to keep exploring these feelings.";
    } else if (qLower.includes("stress") || qLower.includes("exam") || qLower.includes("school")) {
        reply = "Academic pressure is incredibly taxing physically and mentally. It's okay if you feel like you aren't doing enough, but you must remember that your self-worth is not tied strictly to your grades.";
    }
    
    return NextResponse.json({ 
        role: "Ascend AI Therapist", 
        response: reply
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to process AI chat" }, { status: 500 });
  }
}
