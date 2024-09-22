
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
const osUtils = require('os-utils');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (HTML, CSS, etc.)
app.use(express.static(__dirname + '/public'));

// Function to get system metrics
function getMetrics() {
    return new Promise((resolve) => {
        // Get CPU temperature (using a shell command)
        const tempCommand = "vcgencmd measure_temp";
        const exec = require('child_process').exec;
        exec(tempCommand, (error, stdout) => {
            let temp = stdout.trim().replace('temp=', '').replace("'C", '');
            if (error) {
                temp = 'N/A';
            }

            // Get CPU usage
            osUtils.cpuUsage((cpuUsage) => {
                // Get time awake
                const timeAwake = os.uptime();

                resolve({
                    temp: temp,
                    cpuUsage: (cpuUsage * 100).toFixed(2),
                    timeAwake: timeAwake
                });
            });
        });
    });
}

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    const interval = setInterval(async () => {
        const metrics = await getMetrics();
        socket.emit('update_metrics', metrics);
    }, 1000); // Update every second

    socket.on('disconnect', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

// Start the server
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
