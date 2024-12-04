const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for habits
let habits = [];

// Add Habit (POST /habits)
app.post('/habits', (req, res) => {
    const { name, dailyGoal } = req.body;

    if (!name || !dailyGoal) {
        return res.status(400).json({ message: 'Name and daily goal are required.' });
    }

    const newHabit = {
        id: habits.length + 1, // Incremental ID
        name,
        dailyGoal,
        progress: [] // Tracks daily completion
    };

    habits.push(newHabit);
    res.status(201).json({ message: 'Habit added successfully.', habit: newHabit });
});

// Update Habit Progress (PUT /habits/:id)
app.put('/habits/:id', (req, res) => {
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
        return res.status(400).json({ message: 'Date is required.' });
    }

    const habit = habits.find((h) => h.id === parseInt(id));

    if (!habit) {
        return res.status(404).json({ message: 'Habit not found.' });
    }

    const existingProgress = habit.progress.find((p) => p.date === date);

    if (existingProgress) {
        existingProgress.completed = true; // Mark as complete
    } else {
        habit.progress.push({ date, completed: true });
    }

    res.status(200).json({ message: 'Habit marked as complete.', habit });
});

// Get All Habits (GET /habits)
app.get('/habits', (req, res) => {
    res.status(200).json(habits);
});

// Get Weekly Report (GET /habits/report)
app.get('/habits/report', (req, res) => {
    const today = new Date();
    const report = habits.map((habit) => {
        const last7Days = habit.progress.filter((p) => {
            const progressDate = new Date(p.date);
            return today - progressDate <= 7 * 24 * 60 * 60 * 1000; // Last 7 days
        });

        const completionRate =
            (last7Days.filter((p) => p.completed).length / 7) * 100;

        return {
            name: habit.name,
            completionRate: `${completionRate.toFixed(2)}%`
        };
    });

    res.status(200).json(report);
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
