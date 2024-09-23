import express from 'express';
import http from 'http';
import { Server as SocketIo } from 'socket.io';
import os from 'os';
import osUtils from 'os-utils';
import { exec } from 'child_process';
import ora from 'ora'; 
import chalk from 'chalk'; 

const app = express();
const server = http.createServer(app);
const io = new SocketIo(server);

app.use(express.static(new URL('./public', import.meta.url).pathname));

const loadingAnimation = () => {
    const frames = ['🌱', '🚀', '💻', '⚙️', '🌍'];
    let i = 0;
    const spinner = ora('Initializing...').start();

    const interval = setInterval(() => {
        spinner.text = `${frames[i++ % frames.length]} Initializing...`;
    }, 200);

    return { interval, spinner };
};

function getMetrics() {
    return new Promise((resolve) => {
        const tempCommand = "vcgencmd measure_temp";
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
    console.log(chalk.green('Client connected'));

    const interval = setInterval(async () => {
        const metrics = await getMetrics();
        socket.emit('update_metrics', metrics);
    }, 1000); 

    socket.on('disconnect', () => {
        clearInterval(interval);
        console.log(chalk.red('Client disconnected'));
    });
});

const PORT = 5000;

const { interval, spinner } = loadingAnimation();

setTimeout(() => {
    server.listen(PORT, () => {
        clearInterval(interval); // Stop loading animation
        spinner.succeed(chalk.green(`Server running on port ${PORT}`));
        console.log(chalk.cyan('--- System Metrics Monitoring Started ---'));
    });
}, 1000); 
