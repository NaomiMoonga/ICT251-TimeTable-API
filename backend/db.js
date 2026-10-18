const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const databasePath =
    process.env.DB_FILE && path.isAbsolute(process.env.DB_FILE)
        ? process.env.DB_FILE
        : path.join(__dirname, process.env.DB_FILE || "timetable.db");

// Create the directory for the database if it does not exist.
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

// Create the timetable table if it does not already exist.
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");
db.exec(schema);

// Add sample records only if the table is empty.
const count = db.prepare("SELECT COUNT(*) AS count FROM timetable").get();

if (count.count === 0) {
    const insert = db.prepare(`
        INSERT INTO timetable
        (course_code, course_name, day_of_week, start_time, end_time, room, learning_goal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const records = [
        ["ICT251", "Web Technologies", "Monday", "08:00", "10:00", "Lab 1", "Understand Node.js and Express"],
        ["MSM111", "Mathematics", "Monday", "10:00", "12:00", "Room 2", "Practise mathematical problems"],
        ["PHY101", "Physics", "Tuesday", "08:00", "10:00", "Room 3", "Understand physics principles"],
        ["ICT281", "Statistics", "Tuesday", "10:00", "12:00", "Room 4", "Practise statistical calculations"],
        ["ICT251", "Web Technologies", "Wednesday", "08:00", "10:00", "Lab 1", "Practise API development"],
        ["ICT202", "Programming", "Wednesday", "10:00", "12:00", "Lab 2", "Improve programming skills"],
        ["MSM112", "Calculus", "Thursday", "08:00", "10:00", "Room 2", "Practise differentiation"],
        ["ICT251", "Web Technologies", "Thursday", "10:00", "12:00", "Lab 1", "Build a CRUD application"],
        ["ICT203", "Database Systems", "Friday", "08:00", "10:00", "Lab 2", "Understand database design"],
        ["ICT204", "Computer Architecture", "Friday", "10:00", "12:00", "Room 5", "Study computer components"]
    ];

    const insertMany = db.transaction((items) => {
        for (const item of items) {
            insert.run(...item);
        }
    });

    insertMany(records);
}

module.exports = db;