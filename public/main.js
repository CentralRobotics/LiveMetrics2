const socket = io();

// Get meter and text elements
const elements = {
    cpuMeter: document.getElementById('cpuMeter').getContext('2d'),
    tempMeter: document.getElementById('tempMeter').getContext('2d'),
    ramMeter: document.getElementById('ramMeter').getContext('2d'),
    uptimeMeter: document.getElementById('uptimeMeter').getContext('2d'),
    cpuText: document.getElementById('cpuText'),
    tempText: document.getElementById('tempText'),
    ramText: document.getElementById('ramText'),
    uptimeText: document.getElementById('uptimeText'),
    pulseBox: document.getElementById('pulseBox'),
    rebootButton: document.getElementById('rebootButton'),
    refreshMetricsButton: document.getElementById('refreshMetricsButton')
};

// Helper function to create a circular meter chart
const createMeter = (context, backgroundColor) => new Chart(context, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [0, 100],
            backgroundColor: [backgroundColor, '#2f2f2f'],
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        cutout: '80%',
        rotation: -90,
        circumference: 180,
        plugins: { tooltip: { enabled: true } }
    }
});

// Initialize meters
const charts = {
    cpu: createMeter(elements.cpuMeter, '#4CAF50'),
    temp: createMeter(elements.tempMeter, '#ff5722'),
    ram: createMeter(elements.ramMeter, '#2196F3'),
    uptime: new Chart(elements.uptimeMeter, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [1, 120], // Max uptime is 120 minutes
                backgroundColor: ['#FFEB3B', '#2f2f2f'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            cutout: '80%',
            rotation: -90,
            circumference: 180,
            plugins: { tooltip: { enabled: true } }
        }
    })
};

// Handle updates from the server
socket.on('update_metrics', (data) => {
    // Update pulse effect
    updatePulse('#5eff5e', 500);

    // Update CPU, temperature, RAM, and uptime meters and texts
    updateMeter(charts.cpu, elements.cpuText, data.cpuUsage, '%');
    updateMeter(charts.temp, elements.tempText, (data.temp / 80) * 100, `°C`, data.temp);
    updateMeter(charts.ram, elements.ramText, data.ramUsage, '%', data.ramUsage, 90, 'blink');
    updateMeter(charts.uptime, elements.uptimeText, data.uptime, ' min', data.uptime, 503, 'blink', 25);
});

// Handle disconnection event
socket.on('disconnect', () => {
    toggleConnection(false);
});

// Handle reconnection event
socket.on('connect', () => {
    console.log('Reconnected!');
    toggleConnection(true);
});

// Update the pulse box and document styling based on connection state
const toggleConnection = (isConnected) => {
    elements.pulseBox.style.backgroundColor = isConnected ? '#ff00f7' : 'red';
    document.body.style.background = isConnected
        ? 'linear-gradient(156deg, rgba(2,0,36,1) 0%, rgba(65,3,3,1) 100%)'
        : '#0d0d0d';
    elements.refreshMetricsButton.disabled = !isConnected;
    elements.rebootButton.disabled = !isConnected;
};

// Function to update pulse with a background flash effect
const updatePulse = (color, duration) => {
    elements.pulseBox.style.backgroundColor = color;
    setTimeout(() => elements.pulseBox.style.backgroundColor = '#2f2f2f', duration);
};

// Function to update a meter chart and its corresponding text
const updateMeter = (chart, textElement, value, unit, rawValue = value, threshold = null, animation = null, extra = 100 - value) => {
    chart.data.datasets[0].data = [value, extra];
    chart.update();
    textElement.textContent = `${rawValue}${unit}`;

    // Apply blinking animation if value exceeds the threshold
    if (threshold && rawValue > threshold) {
        textElement.style.animationName = animation;
        textElement.style.animationDuration = '0.2s';
        textElement.style.animationIterationCount = 'infinite';
    } else {
        textElement.style.animationName = 'none';
    }
};

// Event listeners for buttons
elements.rebootButton.addEventListener('click', () => {
    if (confirm('Are you sure you want to reboot Pi?')) {
        socket.emit('reboot_pi');
        disableButtons();
    }
});

elements.refreshMetricsButton.addEventListener('click', () => window.location.reload());

// Disable buttons
const disableButtons = () => {
    elements.refreshMetricsButton.disabled = true;
    elements.rebootButton.disabled = true;
};

// Header hover effect
const header = document.getElementById('metricsTextHeader');
header.classList.add('active');
setTimeout(() => header.classList.remove('active'), 2000);
