require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.get('/', (req, res) => {
    res.send(`
        <h1>Student Timetable API</h1>
        <p>Your API is running successfully.</p>
        <p><a href="/api/timetable">View all timetable records</a></p>
        <p><a href="/api/timetable/1">View timetable record 1</a></p>
    `);
});

app.use(cors());
app.use(express.json());

// Find a record by ID
function findRecord(id) {
    return db.prepare('SELECT * FROM timetable WHERE id = ?').get(id);
}

// GET all records
app.get('/api/timetable', (req, res) => {
    res.json(db.prepare('SELECT * FROM timetable ORDER BY id').all());
});

// GET one record
app.get('/api/timetable/:id', (req, res) => {
    const record = findRecord(Number(req.params.id));
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
});

// POST: Create a record
app.post('/api/timetable', (req, res) => {
    const { course_code, course_name, day_of_week, start_time, end_time, room, learning_goal } = req.body;

    if (!course_code || !course_name || !day_of_week || !start_time || !end_time) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const result = db.prepare(`
        INSERT INTO timetable
        (course_code, course_name, day_of_week, start_time, end_time, room, learning_goal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(course_code, course_name, day_of_week, start_time, end_time, room || null, learning_goal || null);

    res.status(201).json(findRecord(result.lastInsertRowid));
});

// PUT: Update a record
app.put('/api/timetable/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!findRecord(id)) return res.status(404).json({ error: 'Record not found' });

    const { course_code, course_name, day_of_week, start_time, end_time, room, learning_goal } = req.body;

    if (!course_code || !course_name || !day_of_week || !start_time || !end_time) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    db.prepare(`
        UPDATE timetable SET course_code=?, course_name=?, day_of_week=?,
        start_time=?, end_time=?, room=?, learning_goal=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
    `).run(course_code, course_name, day_of_week, start_time, end_time, room || null, learning_goal || null, id);

    res.json(findRecord(id));
});

// DELETE: Remove a record
app.delete('/api/timetable/:id', (req, res) => {
    const result = db.prepare('DELETE FROM timetable WHERE id = ?').run(Number(req.params.id));
    if (!result.changes) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));