"use client";

import { useState, useEffect, useRef } from "react";

interface Post {
  id: number;
  title: string;
  body: string;
  user_id: string;
  upvotes: number;
  comment_count: number;
}

interface AIMessage {
  text: string;
  type: 'user' | 'ai' | 'error';
}

export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'community' | 'ai' | 'tools' | 'professionals'>('home');

  // -- COMMUNITY STATE --
  const [posts, setPosts] = useState<Post[]>([]);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");

  // -- AI CHAT STATE --
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    { text: "Hello, I am the Ascend AI Therapist. I provide a secure, inclusive space to listen to your emotional state without judgment. What’s on your mind today?", type: 'ai' }
  ]);

  // -- EMERGENCY STATE --
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  // -- MOOD TRACKER STATE --
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<string | null>(null);

  // -- SYSTEM MODAL STATE --
  const [systemModal, setSystemModal] = useState<{ title: string, message: string } | null>(null);

  const aiChatBodyRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';


  useEffect(() => {
    if (currentView === 'community') {
      fetchPosts();
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'ai' && aiChatBodyRef.current) {
      aiChatBodyRef.current.scrollTop = aiChatBodyRef.current.scrollHeight;
    }
  }, [aiMessages, currentView]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error("Failed to fetch posts", e);
    }
  };

  const submitPost = async () => {
    if (!postTitle.trim() || !postBody.trim()) return;
    try {
      await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: postTitle, body: postBody })
      });
      setPostTitle("");
      setPostBody("");
      fetchPosts();
    } catch (e) {
      console.error("Submit error", e);
    }
  };

  const vote = async (id: number, type: 'upvote' | 'downvote') => {
    try {
      await fetch(`${API_URL}/posts/${id}/${type}`, { method: 'POST' });
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, upvotes: type === 'upvote' ? p.upvotes + 1 : p.upvotes - 1 } : p
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const submitAIChat = async () => {
    if (!aiInput.trim()) return;
    const query = aiInput.trim();
    setAiInput("");

    setAiMessages(prev => [...prev, { text: query, type: 'user' }]);

    try {
      const res = await fetch(`${API_URL}/ai/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();

      if (res.ok) {
        setAiMessages(prev => [...prev, { text: data.response, type: 'ai' }]);
      } else {
        setAiMessages(prev => [...prev, { text: data.message || "Failed.", type: 'error' }]);
      }
    } catch (err) {
      setAiMessages(prev => [...prev, { text: "Connection error.", type: 'error' }]);
    }
  };

  const getNavStyle = (tab: string) => {
    const isActive = currentView === tab;
    let color = 'var(--text-main)';
    if (isActive) {
      color = 'var(--text-main)';
    } else {
      color = 'var(--text-muted)';
    }
    return {
      color,
      cursor: 'pointer',
      fontWeight: isActive ? 500 : 400,
      transition: 'color 0.2s',
      textDecoration: isActive ? 'underline wavy 1.5px var(--text-main)' : 'none',
      textUnderlineOffset: '6px'
    };
  };

  const handleMoodSelect = (mood: string) => {
    setCurrentMood(mood);
    if (mood === 'anxious') setAffirmation("It is totally okay to feel anxious. Your feelings are valid, but they do not control your future.");
    else if (mood === 'stressed') setAffirmation("You have survived 100% of your bad days. Take a deep breath and tackle one thing at a time.");
    else if (mood === 'sad') setAffirmation("Healing is not linear. It's perfectly okay to rest and let yourself feel this heavily today.");
    else if (mood === 'good') setAffirmation("Hold on to this positive energy! You are doing incredibly well and we are proud of you.");
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>

      {/* Background Leaves & Blob SVGs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '110vw', height: '120vh', zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          url('data:image/svg+xml;utf8,<svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="%23E4EAD9" d="M43.7,-77.7C55,-69.1,61.4,-51.7,68.9,-36.8C76.4,-21.9,85.1,-9.5,84.4,2.5C83.7,14.5,73.6,26.1,62.7,33.5C51.8,40.9,40,44.1,28.8,50.4C17.6,56.7,6.9,66.1,-5.4,75.4C-17.7,84.7,-31.6,93.9,-44.2,91.3C-56.8,88.7,-68.1,74.3,-72.7,58.8C-77.3,43.3,-75.2,26.7,-73.4,11.5C-71.6,-3.7,-70.1,-17.5,-63.9,-27.9C-57.7,-38.3,-46.8,-45.3,-36.1,-54.6C-25.4,-63.9,-14.9,-75.5,-1.3,-72.8C12.3,-70.1,23.5,-73.1,32.4,-86.3Z" transform="translate(100 100)" /></svg>'),
          url('data:image/svg+xml;utf8,<svg width="500" height="500" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="%23E4EAD9" d="M38.1,-63C48.6,-53.4,55.8,-39.8,63.1,-25.5C70.4,-11.2,77.8,3.8,74.4,16.5C71,29.2,56.8,39.6,43.4,49.1C30,58.6,17.4,67.2,2.8,62.4C-11.8,57.6,-28.4,39.4,-41.8,24C-55.2,8.6,-65.4,-4,-66.3,-17.9C-67.2,-31.8,-58.8,-47,-46.3,-56.3C-33.8,-65.6,-17.2,-69,-1.3,-66.8C14.6,-64.6,27.6,-72.6,38.1,-63Z" transform="translate(100 100)" /></svg>')
        `,
        backgroundPosition: 'left center, right bottom',
        backgroundRepeat: 'no-repeat',
        opacity: 0.7
      }}></div>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', position: 'relative', zIndex: 10 }}>
        <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', fontFamily: 'Lora', fontSize: '2.5rem', fontWeight: 400, color: 'var(--accent-sage-dark)' }} onClick={() => setCurrentView('home')}>
          <img src="/logo.png" alt="Ascend East Logo" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          Ascend East
        </div>
        <div className="nav-wrapper">
          <nav style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
            <span style={getNavStyle('home')} onClick={() => setCurrentView('home')}>Home</span>
            <span style={getNavStyle('about')} onClick={() => setCurrentView('about')}>About</span>
            <span style={getNavStyle('community')} onClick={() => setCurrentView('community')}>Community Open Space</span>
            <span style={getNavStyle('tools')} onClick={() => setCurrentView('tools')}>Grounding & Tracking</span>
            <span style={getNavStyle('ai')} onClick={() => setCurrentView('ai')}>AI Therapist Support</span>
            <button className="emergency-btn" onClick={() => setEmergencyModalOpen(true)}>Get Help Now</button>
          </nav>
        </div>
      </header>

      <main style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', paddingTop: '2rem', position: 'relative', zIndex: 1 }}>

        {/* --- HOME VIEW --- */}
        {currentView === 'home' && (
          <div style={{ animation: 'fadeIn 0.5s ease', position: 'relative', zIndex: 1 }}>
            <section className="hero" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
              <h1 style={{ fontFamily: 'Lora', fontWeight: 400, color: 'var(--accent-sage-dark)', lineHeight: 1.15 }}>Moving Forward and <br />Rising Beyond.</h1>
              <p style={{ fontFamily: 'Inter', fontSize: '1.2rem', color: 'var(--text-main)', marginTop: '2rem' }}>A grounded, welcoming space crafted for college students. Discover intuitive tools and a supportive community designed to nurture your mental well-being securely.</p>
              <button className="cta-btn" onClick={() => setCurrentView('community')} style={{ marginTop: '3rem', background: '#819E87' }}>Enter the Sanctuary</button>
            </section>

            <div className="divider" style={{ marginBottom: '4rem' }}></div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', paddingBottom: '4rem' }}>
              <div className="sidebar-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setCurrentView('ai')} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{ color: 'var(--accent-sage)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="5" x2="12.01" y2="5"></line></svg>
                  Therapist AI
                </h3>
                <p style={{ fontSize: '1rem' }}>Receive unconditional, zero-judgment active listening specifically tuned for moments of high anxiety or stress.</p>
                <div style={{ marginTop: '1rem', color: 'var(--accent-sage)', fontWeight: 600, fontSize: '0.9rem' }}>Start Chatting &rarr;</div>
              </div>

              <div className="sidebar-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setCurrentView('community')} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{ color: 'var(--accent-terracotta)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  Open Forum
                </h3>
                <p style={{ fontSize: '1rem' }}>Share your struggles anonymously on the main feed. Tie your words to randomized handles and realize you are not alone.</p>
                <div style={{ marginTop: '1rem', color: 'var(--accent-terracotta)', fontWeight: 600, fontSize: '0.9rem' }}>Read Threads &rarr;</div>
              </div>

              <div className="sidebar-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setCurrentView('professionals')} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <h3 style={{ color: 'var(--accent-slate)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Daily Tracking & Grounding
                </h3>
                <p style={{ fontSize: '1rem' }}>Log your emotional states daily to receive psychological affirmations, and utilize our clinical grounding tools.</p>
                <div style={{ marginTop: '1rem', color: 'var(--accent-slate)', fontWeight: 600, fontSize: '0.9rem' }}>Use Tools &rarr;</div>
              </div>
            </div>
          </div>
        )}

        {/* --- ABOUT VIEW --- */}
        {currentView === 'about' && (
          <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '900px', margin: '0 auto', padding: '4rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Rise beyond, move forward, <span style={{ color: 'var(--accent-sage)' }}>find your Saturn.</span></h2>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>An initiative built for the students of the University of the East.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-terracotta)', marginBottom: '1.5rem' }}>The Mission</h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.8, marginBottom: '1rem' }}>
                  Mental health challenges, fueled by heavy workloads and academic pressure, make the transition to university life overwhelming. Ascend East was conceptualized to ensure that no student at the University of the East has to face these challenges alone.
                </p>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.8 }}>
                  We provide a web-based sanctuary where students can explore motivational content, access on-the-go mental health grounding tools, and connect with a transparent community. Ascend East bridges the gap between immediate self-help and professional care, transforming your digital device into a proactive partner in healing.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--accent-sage)', marginBottom: '1.5rem' }}>Behind the Design</h3>
                <ul style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: 1.8, listStyleType: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '1rem' }}><strong>Saturn:</strong> Inspired by SZA's <em>Saturn</em>, it represents discovering a place of peace, healing, and growth.</li>
                  <li style={{ marginBottom: '1rem' }}><strong>East Arrow:</strong> Symbolizing the choice to move forward. No matter your past, we guide you toward progress.</li>
                  <li style={{ marginBottom: '1rem' }}><strong>Semicolon:</strong> A universal representation of continuation and hope. It stands for choosing to keep going despite incredibly difficult thoughts.</li>
                  <li style={{ marginBottom: '1rem' }}><strong>The Circle:</strong> Representing wholeness, unity, and continuity. Healing and growth are ongoing processes within a safe, inclusive space.</li>
                  <li><strong>Human Face Structure:</strong> Symbolizing the students and individuals searching for self-discovery.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* --- COMMUNITY VIEW --- */}
        {currentView === 'community' && (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <section className="forum-section" style={{ paddingTop: '2rem' }}>
              <div className="forum-main">
                <div className="forum-header">
                  <h2>Community Open Space</h2>
                  <p>Share your struggles anonymously. You are not alone.</p>
                </div>

                <div className="create-post-box">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Title your post... (e.g., 'Feeling overwhelmed with midterms')"
                  />
                  <textarea
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder="Share what's on your mind. You are completely anonymous."
                  />
                  <button className="cta-btn" style={{ alignSelf: 'flex-end', padding: '0.7rem 1.5rem', fontSize: '0.95rem' }} onClick={submitPost}>
                    Post to Community
                  </button>
                </div>

                <div id="postsFeed">
                  {posts.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading community posts...</div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="post-card">
                        <div className="vote-column">
                          <button className="vote-btn" onClick={() => vote(post.id, 'upvote')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                          </button>
                          <span className="vote-score">{post.upvotes}</span>
                          <button className="vote-btn" onClick={() => vote(post.id, 'downvote')}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
                          </button>
                        </div>
                        <div className="post-content">
                          <div className="post-meta">
                            Posted by <span className="post-author">{post.user_id}</span> • Just now
                          </div>
                          <div className="post-title">{post.title}</div>
                          <div className="post-body">{post.body}</div>

                          <div className="post-footer">
                            <div className="post-action">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                              {post.comment_count} Comments
                            </div>
                            <div className="post-action">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                              Share
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="forum-sidebar">
                <div className="sidebar-card">
                  <h3 style={{ color: 'var(--accent-sage)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    About this Open Space
                  </h3>
                  <p>This is a 24/7 moderated sanctuary. Everything you post is tied to randomized anonymous handles, protecting your identity while enabling transparent connection.</p>
                </div>
                <div className="sidebar-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => setCurrentView('professionals')} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <h3 style={{ color: 'var(--accent-slate)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    Professionals On-site
                  </h3>
                  <p>We bridge the gap between you and immediate mental health experts. If the community isn't enough, professional care is accessible directly from Ascend East.</p>
                  <div style={{ marginTop: '1rem', color: 'var(--accent-slate)', fontWeight: 600, fontSize: '0.9rem' }}>Connect Now &rarr;</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- AI THERAPIST VIEW --- */}
        {currentView === 'ai' && (
          <div style={{ animation: 'fadeIn 0.5s ease', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <section style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem 0 3rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>

              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(140, 165, 140, 0.1)', color: 'var(--accent-sage)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="12" y1="5" x2="12.01" y2="5"></line></svg>
                </div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Ascend AI Therapist</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>A safe, inclusive environment designed to listen when you need it most.</p>
              </div>

              <div style={{
                flex: 1, background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}>

                <div ref={aiChatBodyRef} style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px' }}>
                  {aiMessages.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      gap: '1rem',
                    }}>
                      {msg.type === 'ai' && (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-sage)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                      )}

                      <div style={{
                        background: msg.type === 'user' ? 'var(--bg-secondary)' : (msg.type === 'error' ? 'rgba(200,90,90,0.1)' : 'rgba(140, 165, 140, 0.08)'),
                        color: msg.type === 'error' ? 'var(--emergency-bg)' : 'var(--text-main)',
                        padding: '1rem 1.25rem',
                        borderRadius: '16px',
                        borderTopRightRadius: msg.type === 'user' ? '4px' : '16px',
                        borderTopLeftRadius: msg.type === 'ai' ? '4px' : '16px',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        border: msg.type === 'user' ? '1px solid rgba(0,0,0,0.05)' : 'none'
                      }}>
                        {msg.text}
                      </div>

                      {msg.type === 'user' && (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--text-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', fontWeight: 'bold' }}>
                          ME
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', gap: '1rem', background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '50px', padding: '0.5rem 0.5rem 0.5rem 1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Describe how you're feeling..."
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1.05rem', fontFamily: 'Inter' }}
                      onKeyDown={(e) => e.key === 'Enter' && submitAIChat()}
                    />
                    <button
                      onClick={submitAIChat}
                      style={{ background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '50px', padding: '0.8rem 1.5rem', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-sage)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'var(--text-main)'}
                    >
                      Send to AI
                    </button>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.8rem' }}>
                    Ascend AI is an automated supportive companion and does not replace certified professional therapy.
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* --- GROUNDING & TRACKING VIEW --- */}
        {currentView === 'tools' && (
          <div style={{ animation: 'fadeIn 0.5s ease', flex: 1, padding: '2rem 0', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(131, 144, 152, 0.1)', color: 'var(--accent-slate)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Daily Wellness Tools</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Immediate self-help techniques and mood tracking to help you regain control.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Left Col: Mood Tracker */}
              <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-terracotta)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                  Personalized Mood Tracker
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>Log your emotional state truthfully. Establishing patterns is the first step toward organic growth.</p>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                  <button onClick={() => handleMoodSelect('good')} style={{ flex: 1, padding: '1rem', border: currentMood === 'good' ? '2px solid var(--accent-sage)' : '1px solid rgba(0,0,0,0.1)', background: currentMood === 'good' ? 'rgba(140, 165, 140, 0.1)' : 'transparent', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Good</div>
                  </button>
                  <button onClick={() => handleMoodSelect('stressed')} style={{ flex: 1, padding: '1rem', border: currentMood === 'stressed' ? '2px solid var(--accent-terracotta)' : '1px solid rgba(0,0,0,0.1)', background: currentMood === 'stressed' ? 'rgba(211, 142, 112, 0.1)' : 'transparent', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌪️</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Stressed</div>
                  </button>
                  <button onClick={() => handleMoodSelect('anxious')} style={{ flex: 1, padding: '1rem', border: currentMood === 'anxious' ? '2px solid var(--text-muted)' : '1px solid rgba(0,0,0,0.1)', background: currentMood === 'anxious' ? 'rgba(0,0,0,0.05)' : 'transparent', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💧</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Anxious</div>
                  </button>
                  <button onClick={() => handleMoodSelect('sad')} style={{ flex: 1, padding: '1rem', border: currentMood === 'sad' ? '2px solid var(--accent-slate)' : '1px solid rgba(0,0,0,0.1)', background: currentMood === 'sad' ? 'rgba(131, 144, 152, 0.1)' : 'transparent', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌧️</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Sad</div>
                  </button>
                </div>

                {affirmation && (
                  <div style={{ animation: 'fadeIn 0.5s ease', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-terracotta)', color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                    <strong>Immediate Affirmation:</strong> <br />
                    {affirmation}
                  </div>
                )}
              </div>

              {/* Right Col: Grounding Tools */}
              <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-sage)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  Grounding Tools
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>Immediate guidance for extreme stress, panic attacks, or emotional breakdowns. Use these techniques to regain physical focus.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '16px' }}>
                    <h4 style={{ color: 'var(--accent-sage)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>1. The 5-4-3-2-1 Sensory Method</h4>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>Look around the room right now and quietly name out loud:</p>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      <li><strong>5</strong> things you can strictly <strong>see</strong>.</li>
                      <li><strong>4</strong> things you can physically <strong>feel</strong>.</li>
                      <li><strong>3</strong> things you can <strong>hear</strong>.</li>
                      <li><strong>2</strong> things you can <strong>smell</strong>.</li>
                      <li><strong>1</strong> thing you can <strong>taste</strong>.</li>
                    </ul>
                  </div>

                  <div style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '16px' }}>
                    <h4 style={{ color: 'var(--accent-sage)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>2. Box Breathing Exercise</h4>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>Breathe to the rhythm of the square to manually slow your heart rate.</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                      <div className="breathing-circle"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PROFESSIONALS NETWORK VIEW --- */}
        {currentView === 'professionals' && (
          <div style={{ animation: 'fadeIn 0.5s ease', flex: 1, padding: '2rem 0', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(131, 144, 152, 0.1)', color: 'var(--accent-slate)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Professional Network</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Connect directly with licensed clinical psychologists securely from Ascend East.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

              {/* Profile Card 1 */}
              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-sage)', fontSize: '2rem', flexShrink: 0 }}>
                  JD
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Dr. Josephine Dela Cruz</h3>
                    <span style={{ background: 'rgba(140, 165, 140, 0.15)', color: 'var(--accent-sage-dark)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>Available Now</span>
                  </div>
                  <p style={{ color: 'var(--accent-slate)', fontWeight: 500, marginBottom: '0.5rem' }}>Lead Clinical Psychologist • University of the East Affiliated</p>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>Specializes in severe academic burnout, clinical depression, and transitioning stressors. Dr. Dela Cruz operates on an encrypted teletherapy platform ensuring total patient confidentiality.</p>
                </div>
                <button onClick={() => setSystemModal({ title: "Initializing Secure Connection", message: "This feature is currently in its prototype phase. In deployment, this portal will seamlessly boot into a HIPAA-compliant E2E encrypted teletherapy room directly with Dr. Dela Cruz." })} style={{ padding: '1rem 2rem', background: 'var(--text-main)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Initiate Secure Chat
                </button>
              </div>

              {/* Profile Card 2 */}
              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap', opacity: 0.8 }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-terracotta)', fontSize: '2rem', flexShrink: 0 }}>
                  MV
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Dr. Mark Vilar</h3>
                    <span style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>In a Session</span>
                  </div>
                  <p style={{ color: 'var(--accent-slate)', fontWeight: 500, marginBottom: '0.5rem' }}>Cognitive Behavioral Specialist</p>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>Focuses extensively on social anxiety, group therapy, and coping mechanisms for high-pressure academic standards.</p>
                </div>
                <button onClick={() => setSystemModal({ title: "Calendar Integration Required", message: "This scheduling feature will natively integrate with the University of the East's student appointment scheduling calendar upon full production release." })} style={{ padding: '1rem 2rem', background: 'transparent', border: '2px solid rgba(0,0,0,0.1)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Schedule for Later
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* --- EMERGENCY MODAL OVERLAY --- */}
      {emergencyModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '24px', maxWidth: '600px', width: '90%', borderTop: '8px solid var(--emergency-bg)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--emergency-bg)', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Immediate Crisis Support
              </h2>
              <button onClick={() => setEmergencyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2rem', lineHeight: 1.6 }}>If you are in immediate danger or experiencing a crisis, please do not wait. Reach out immediately to these professional 24/7 hotlines. <strong>You are not alone.</strong></p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>National Center for Mental Health (NCMH) Free Crisis Hotline</div>
                <div style={{ color: 'var(--emergency-bg)', fontSize: '1.2rem', fontWeight: 700 }}>1553 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>or</span> 0917-899-USAP (8727)</div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.3rem' }}>University of the East (UE) Guidance Office</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Please contact your local guidance counselor or proceed directly to the UE Clinic on campus for immediate medical dispatch.</div>
              </div>
            </div>

            <button onClick={() => setEmergencyModalOpen(false)} style={{ width: '100%', padding: '1rem', background: 'var(--text-main)', color: 'white', borderRadius: '12px', border: 'none', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer' }}>Close Window</button>
          </div>
        </div>
      )}

      {/* --- PROTOYPE SYSTEM MODAL LOGIC --- */}
      {systemModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '24px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', borderTop: '6px solid var(--accent-sage)' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-sage)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              {systemModal.title}
            </h3>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              {systemModal.message}
            </p>
            <button onClick={() => setSystemModal(null)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid rgba(0,0,0,0.05)', padding: '0.8rem 1.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', float: 'right' }}>
              Acknowledged
            </button>
          </div>
        </div>
      )}

      <footer style={{ marginTop: 'auto', position: 'relative', zIndex: 10, background: 'var(--bg-primary)' }}>
        <div className="logo" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem', color: 'var(--accent-sage-dark)' }}>
          <img src="/logo.png" alt="Ascend East Logo" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          Ascend East
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&copy; 2026 Built for Academic Implementation.</div>
      </footer>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1); opacity: 0.6; }
        }
        .breathing-circle {
          width: 60px; height: 60px; border-radius: 50%;
          background: var(--accent-sage);
          animation: breathe 8s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
