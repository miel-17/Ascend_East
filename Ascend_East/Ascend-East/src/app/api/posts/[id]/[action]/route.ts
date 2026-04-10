import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string, action: string } }) {
  // Since we are deploying to serverless without a persistent database, 
  // we mock the upvote/downvote response to ensure the frontend works.
  // The frontend handles optimistic UI updates, so this simply confirms success.
  
  if (params.action !== 'upvote' && params.action !== 'downvote') {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ 
    message: `${params.action}d successfully` 
  });
}
