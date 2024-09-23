const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
const osUtils = require('os-utils');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));

function getMetrics() {
    return new Promise((resolve) => {
        const tempCommand = "vcgencmd measure_temp";
        const exec = require('child_process').exec;
        exec(tempCommand, (error, stdout) => {
            let temp = stdout.trim().replace('temp=', '').replace("'C", '');
            if (error) {
                temp = 'N/A';
            }

            // Get CPU usage
            osUtils.cpuUsage((cpuUsage) => {
                
                const totalMemory = os.totalmem();
                const freeMemory = os.freemem();
                const ramUsage = ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2);

                
                const uptimeInSeconds = os.uptime();
                const uptimeInMinutes = (uptimeInSeconds / 60).toFixed(2);

                resolve({
                    temp: temp,
                    cpuUsage: (cpuUsage * 100).toFixed(2),
                    ramUsage: ramUsage,
                    uptime: uptimeInMinutes
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
    }, 1000); 

    socket.on('disconnect', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
