const socket = io();

const cpuMeter = document.getElementById('cpuMeter').getContext('2d');
const tempMeter = document.getElementById('tempMeter').getContext('2d');
const ramMeter = document.getElementById('ramMeter').getContext('2d');
const uptimeMeter = document.getElementById('uptimeMeter').getContext('2d');
const cpuText = document.getElementById('cpuText');
const tempText = document.getElementById('tempText');
const ramText = document.getElementById('ramText');
const uptimeText = document.getElementById('uptimeText');
const pulseBox = document.getElementById('pulseBox');
const rebootButton = document.getElementById('rebootButton');
const refreshMetricsButton = document.getElementById('refreshMetricsButton');


// Create circular progress meters using Chart.js
const cpuChart = new Chart(cpuMeter, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [0, 100],
            backgroundColor: ['#4CAF50', '#2f2f2f'],
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        cutout: '80%',
        rotation: -90,
        circumference: 180,
        plugins: {
            tooltip: { enabled: true }
        }
    }
});

const tempChart = new Chart(tempMeter, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [0, 100],
            backgroundColor: ['#ff5722', '#2f2f2f'],
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        cutout: '80%',
        rotation: -90,
        circumference: 180,
        plugins: {
            tooltip: { enabled: true }
        }
    }
});

const ramChart = new Chart(ramMeter, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [0, 100],
            backgroundColor: ['#2196F3', '#2f2f2f'],
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        cutout: '80%',
        rotation: -90,
        circumference: 180,
        plugins: {
            tooltip: { enabled: true }
        }
    }
});

const uptimeChart = new Chart(uptimeMeter, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [0, 120], // Max uptime is 120 minutes (2 hours)
            backgroundColor: ['#FFEB3B', '#2f2f2f'],
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        cutout: '80%',
        rotation: -90,
        circumference: 180,
        plugins: {
            tooltip: { enabled: true }
        }
    }
});

var blinkInterval; 
var blinkInterval2; 
socket.on('update_metrics', function (data) {
    clearInterval(blinkInterval);
    clearInterval(blinkInterval2);
    pulseBox.style.backgroundColor = '#5eff5e';
    setTimeout(() => pulseBox.style.backgroundColor = '#2f2f2f', 500);

    // Update CPU meter
    cpuChart.data.datasets[0].data = [data.cpuUsage, 100 - data.cpuUsage];
    cpuChart.update();
    cpuText.textContent = `${data.cpuUsage}%`;

    // Update Temperature meter
    let tempPercentage = (data.temp / 80) * 100;
    tempChart.data.datasets[0].data = [tempPercentage, 100 - tempPercentage];
    tempChart.update();
    tempText.textContent = `${data.temp}°C`;

    // Update RAM meter
    ramChart.data.datasets[0].data = [data.ramUsage, 100 - data.ramUsage];
    ramChart.update();
    ramText.textContent = `${data.ramUsage}%`;

    // Update Uptime meter
    uptimeChart.data.datasets[0].data = [data.uptime, 120]; // 2 hours max
    uptimeChart.update();
    uptimeText.textContent = `${data.uptime} min`;
});

socket.on('disconnect', function () {
    blinkInterval2 = setInterval(function() { 
        pulseBox.style.backgroundColor = 'red';
        setTimeout(() => pulseBox.style.backgroundColor = '#1a1919', 200);
    }, 400);
    document.body.style.background = '#0d0d0d'
    refreshMetricsButton.disabled = true; 
    rebootButton.disabled = true;
});

blinkInterval = setInterval(function() { 
    pulseBox.style.backgroundColor = '#ffe600';
    setTimeout(() => pulseBox.style.backgroundColor = '#1a1919', 200);
}, 400);

socket.on('connect', function () {
    console.log('Reconnected!')
    setTimeout(() => pulseBox.style.backgroundColor = '#ff00f7', 100);
    document.body.style.background = 'linear-gradient(156deg, rgba(2,0,36,1) 0%, rgba(65,3,3,1) 100%)'
    refreshMetricsButton.disabled = false; 
    rebootButton.disabled = false;
});



const header = document.getElementById('metricsTextHeader');

    // Function to activate hover effect
    function activateHover() {
        header.classList.add('active');
        console.log('active')
    }

    // Function to deactivate hover effect
    function deactivateHover() {
        header.classList.remove('active');
        console.log('not active')
    }
    activateHover()
    setTimeout(deactivateHover, 2000);





    
        rebootButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reboot Pi?')) {
                socket.emit('reboot_pi');
                refreshMetricsButton.disabled = true; 
                rebootButton.disabled = true;
            }
        });


        refreshMetricsButton.addEventListener('click', () => {
           window.location.reload();
        });