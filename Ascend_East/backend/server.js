const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.serialize(() => {
            // Drop old chats table to recreate as a Reddit clone, ignoring errors if missing
            db.run(`DROP TABLE IF EXISTS chats`);
            
            // Reddit-style Forum Posts
            db.run(`CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                body TEXT,
                user_id TEXT,
                upvotes INTEGER DEFAULT 1,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Comments for Posts
            db.run(`CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER,
                user_id TEXT,
                body TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES posts(id)
            )`);
            
            // Seed a sample post if empty
            db.get("SELECT COUNT(*) AS count FROM posts", (err, row) => {
                if (row && row.count === 0) {
                    const stmt = db.prepare("INSERT INTO posts (title, body, user_id, upvotes) VALUES (?, ?, ?, ?)");
                    stmt.run("How do you deal with exam week burnout?", "I've been studying for 3 days straight and I just feel completely exhausted and unmotivated. Anyone have tips to reset?", "Anonymous_1204", 45);
                    stmt.run("Just found out about the 5-4-3-2-1 technique", "And wow, it really helped me calm down before my public speaking presentation this morning.", "Anonymous_9491", 82);
                    stmt.finalize();
                }
            });
        });
    }
});


/* ============================
 * REDDIT-STYLE FORUM API
 * ============================ */

app.get('/api/posts', (req, res) => {
    db.all(`SELECT * FROM posts ORDER BY upvotes DESC, timestamp DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // We'll also fetch comment counts for each post
        const promises = rows.map(post => {
            return new Promise((resolve) => {
                db.get(`SELECT COUNT(*) as count FROM comments WHERE post_id = ?`, [post.id], (err, row) => {
                    post.comment_count = row ? row.count : 0;
                    resolve(post);
                });
            });
        });
        
        Promise.all(promises).then(posts => {
            res.json({ posts });
        });
    });
});

app.post('/api/posts', (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: "Title and body are required" });
    
    const userId = "Anonymous_" + Math.floor(Math.random() * 10000);
    
    db.run(
        `INSERT INTO posts (title, body, user_id) VALUES (?, ?, ?)`,
        [title, body, userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, title, body, user_id: userId, upvotes: 1 });
        }
    );
});

app.post('/api/posts/:id/upvote', (req, res) => {
    const postId = req.params.id;
    db.run(`UPDATE posts SET upvotes = upvotes + 1 WHERE id = ?`, [postId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Upvoted successfully" });
    });
});

app.post('/api/posts/:id/downvote', (req, res) => {
    const postId = req.params.id;
    db.run(`UPDATE posts SET upvotes = upvotes - 1 WHERE id = ?`, [postId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Downvoted successfully" });
    });
});

/* ============================
 * AI THERAPIST CHATBOT API
 * ============================ */
app.post('/api/ai/support', (req, res) => {
    const { query } = req.body;

    if (!query) return res.status(400).json({ error: "Query is required" });

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
    
    res.json({ 
        role: "Ascend AI Therapist", 
        response: reply
    });
});

// Start Server

app.listen(PORT, () => {
    console.log("Ascend East Backend Running on port " + PORT);
});
