const Database = require('better-sqlite3');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const databasePath = path.join(
    __dirname,
    process.env.DB_FILE || 'timetable.db'
);

const db = new Database(databasePath);

const schema = fs.readFileSync(
    path.join(__dirname, 'schema.sql'),
    'utf8'
);

db.exec(schema);

const result = db.prepare(
    'SELECT COUNT(*) AS total FROM timetable'
).get();

if (result.total === 0) {
    const insert = db.prepare(`
        INSERT INTO timetable
        (course_code, course_name, day_of_week, start_time, end_time, room, learning_goal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleRecords = [
        ['ICT251', 'Web Technologies', 'Monday', '08:00', '10:00', 'Lab 1', 'Practise building web applications'],
        ['MSM111', 'Mathematics I', 'Monday', '10:00', '12:00', 'Room 2', 'Practise mathematical problems'],
        ['MSM112', 'Calculus', 'Tuesday', '08:00', '10:00', 'Room 3', 'Understand differentiation and integration'],
        ['PHY101', 'Physics I', 'Tuesday', '10:00', '12:00', 'Lab 2', 'Review physics concepts'],
        ['ICT251', 'Web Technologies', 'Wednesday', '14:00', '16:00', 'Lab 1', 'Practise Node.js programming'],
        ['MSM111', 'Mathematics I', 'Thursday', '08:00', '10:00', 'Room 2', 'Revise for mathematics tests'],
        ['ICT252', 'Database Systems', 'Thursday', '10:00', '12:00', 'Lab 3', 'Practise database queries'],
        ['PHY101', 'Physics I', 'Friday', '08:00', '10:00', 'Lab 2', 'Review lecture notes'],
        ['ICT253', 'Computer Architecture', 'Friday', '10:00', '12:00', 'Room 4', 'Revise computer architecture'],
        ['STUDY01', 'Independent Study', 'Saturday', '09:00', '11:00', 'Library', 'Complete weekly study goals']
    ];

    const insertMany = db.transaction((records) => {
        for (const record of records) {
            insert.run(...record);
        }
    });

    insertMany(sampleRecords);
}

module.exports = db;