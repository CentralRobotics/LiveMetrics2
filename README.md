# LiveMetrics2 
**LiveMetrics2** is an open-source, real-time metrics monitoring tool for robotics computer systems, specifically designed for use with **FRC DriverStation**. It offers a customizable interface, making it an adaptable solution for various robotics applications.


## Features 
- Intuitive User Interface
    - Tailored to work seamlessly with FRC DriverStation.
    - Streamlined layout for easy monitoring during competitions.
- Open Source and Customizable
    - Built with flexibility in mind, allowing users to modify and extend functionality as needed.
- Incredibly lightweight 



## Status Light 
The Status Light, located in the top-right corner of the interface, provides at-a-glance information about the system’s connection status

- **Connecting**: Displays a solid purple light.
- **Normal Operation**: A green pulse every 1 second.
- **Connection Lost**: Rapid red blinking to indicate a lost connection.

## Compatibility 
LiveMetrics2 currently supports the following systems:

- **Debian/Ubuntu-based systems** (fully supported)
- **MacOS** (partial support)

## Installation
1. Clone the repository
```
git clone https://github.com/yourusername/LiveMetrics2.git
```
2. Navigate to the project directory and run the installation script:
```
cd LiveMetrics2
npm i 
```

## Automatic Startup on Boot
1. Create a systemd service file:
```
sudo nano /etc/systemd/system/livemetrics2.service
```

2. Add the following content to the file:
```
[Unit]
Description=LiveMetrics2 Service
After=network.target

[Service]
ExecStart=/path/to/LiveMetrics2/livemetrics2
WorkingDirectory=/path/to/LiveMetrics2
Restart=always
User=your-username

[Install]
WantedBy=multi-user.target
```
Make sure to replace /path/to/LiveMetrics2 with the actual path to the LiveMetrics2 directory and your-username with your username.

3. Reload the systemd daemon to apply the changes:
```
sudo systemctl daemon-reload
```
4. Enable the service so that it starts at boot:
```
sudo systemctl enable livemetrics2
```

5. Start the service manually for the first time:
```
sudo systemctl start livemetrics2
```
## Contribution
Contributions are welcome! Feel free to open issues or submit pull requests to improve the project. For major changes, please open an issue first to discuss what you would like to change.

## License 
This project is licensed under the MIT License.

 
## Credits 
LiveMetrics2 is developed and maintained by **blxdbny**, on behalf of **CentralRobotics**. Special thanks to the FRC and robotics communities for their support and feedback.

