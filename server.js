const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the CORS middleware
const os = require('os'); // Import the os module
const path = require('path'); // Import the path module

const app = express();

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Function to get local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '127.0.0.1';
}

// Root route handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Replace with your SMTP server
            port: 587, // Replace with your SMTP port
            secure: false, // Use true for 465, false for other ports
            auth: {
                user: 'jobga1234@gmail.com', // Replace with your email
                pass: 'ypfm zucj ipeh wzxj', // Replace with your email password
            },
        });

        const info = await transporter.sendMail({
            from: '"Meinard Ga" <2058972@aup.edu.ph>', // Replace with your sender info
            to,
            subject,
            text,
        });

        res.status(200).send({ message: 'Email sent', messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error.message); // Log the error
        res.status(500).send({ error: 'Failed to send email', details: error.message });
    }
});

const PORT = 3000;
const localIP = getLocalIpAddress();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${localIP}:${PORT}`);
});
