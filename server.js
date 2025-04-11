const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the CORS middleware

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

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

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
