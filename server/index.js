const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create HTTP server for Express
const server = http.createServer(app);

// Create WebSocket server on the same HTTP server
const wss = new WebSocket.Server({ server });

// An array to store the form submissions
let formResponses = [];

// WebSocket connection handling
wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    // Handle WebSocket messages
    ws.on('message', (message) => {
        console.log('Received WebSocket message:', message);
    });

    // Handle WebSocket connection closure
    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });
});

// Endpoint to handle form submission (POST request)
app.post('/submit-form', (req, res) => {
    const { name = '', answer = '', wager = '' } = req.body || {};
    console.log({ name, answer, wager });

    // Save the form submission to the array
    formResponses.push({ name, answer, wager });

    console.log(`Received form submission: Name: ${name}, Answer: ${answer}, Wager: ${wager}`);

    // Respond to the client with a success message
    res.json({ message: 'Form submitted successfully!', data: { name, answer, wager } });

    // Optionally, broadcast the new submission to all WebSocket clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ name, answer, wager }));
        }
    });
});

// Endpoint to view all form submissions
app.get('/view-submissions', (res) => {
    res.json({ submissions: formResponses });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});