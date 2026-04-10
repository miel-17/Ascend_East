import { NextRequest, NextResponse } from "next/server";

// Global transient state for serverless demo persistence
let posts = [
  { 
    id: 1, 
    title: "Just found out about the 5-4-3-2-1 technique", 
    body: "And wow, it really helped me calm down before my public speaking presentation this morning.", 
    user_id: "Anonymous_9491", 
    upvotes: 82, 
    timestamp: new Date().toISOString(), 
    comment_count: 0 
  },
  { 
    id: 2, 
    title: "How do you deal with exam week burnout?", 
    body: "I've been studying for 3 days straight and I just feel completely exhausted and unmotivated. Anyone have tips to reset?", 
    user_id: "Anonymous_1204", 
    upvotes: 45, 
    timestamp: new Date().toISOString(), 
    comment_count: 0 
  }
];

export async function GET() {
  // Sort posts by upvotes and timestamp
  const sortedPosts = [...posts].sort((a, b) => b.upvotes - a.upvotes || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json({ posts: sortedPosts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, body: postBody } = body;
    
    if (!title || !postBody) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }
    
    const userId = "Anonymous_" + Math.floor(Math.random() * 10000);
    const newPost = {
      id: Math.floor(Math.random() * 1000000),
      title,
      body: postBody,
      user_id: userId,
      upvotes: 1,
      timestamp: new Date().toISOString(),
      comment_count: 0
    };
    
    posts.push(newPost);
    return NextResponse.json(newPost);
  } catch (e) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
