const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;


app.use(bodyParser.json());


let tasks = [];

// функция для поиска задачи по ID
const findTaskById = (id) => tasks.find(task => task.id === id);
const findTaskIndexById = (id) => tasks.findIndex(task => task.id === id);


app.post('/tasks', (req, res) => {
    const { title, description, completed = false } = req.body;

    
    if (!title) {
        return res.status(400).json({
            error: 'Title is required'
        });
    }

    if (typeof completed !== 'boolean') {
        return res.status(400).json({
            error: 'Completed must be a boolean'
        });
    }

    
    const newTask = {
        id: uuidv4(),
        title,
        description: description || '',
        completed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);

    res.status(201).json({
        message: 'Task created successfully',
        task: newTask
    });
});


app.get('/tasks', (req, res) => {
    const { completed } = req.query;
    let filteredTasks = tasks;

    
    if (completed !== undefined) {
        const isCompleted = completed === 'true';
        filteredTasks = tasks.filter(task => task.completed === isCompleted);
    }

    res.json({
        tasks: filteredTasks,
        total: filteredTasks.length
    });
});


app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const task = findTaskById(id);

    if (!task) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    res.json({ task });
});


app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    
    const taskIndex = findTaskIndexById(id);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    
    const updatedTask = {
        ...tasks[taskIndex],
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        updatedAt: new Date().toISOString()
    };

    tasks[taskIndex] = updatedTask;

    res.json({
        message: 'Task updated successfully',
        task: updatedTask
    });
});


app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = findTaskIndexById(id);
    
    if (taskIndex === -1) {
        return res.status(404).json({
            error: 'Task not found'
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.json({
        message: 'Task deleted successfully',
        task: deletedTask
    });
});


app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// Запуск
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API documentation:`);
    console.log(`- POST /tasks - Create a new task`);
    console.log(`- GET /tasks - Get all tasks (optional ?completed=true/false)`);
    console.log(`- GET /tasks/:id - Get specific task`);
    console.log(`- PUT /tasks/:id - Update task`);
    console.log(`- DELETE /tasks/:id - Delete task`);
});
