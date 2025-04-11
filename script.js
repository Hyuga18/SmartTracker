document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('linkForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const urlInput = document.getElementById('urlInput').value;
        const aliasInput = document.getElementById('aliasInput').value;
        const expiryInput = document.getElementById('expiryInput').value;

        const uniqueId = aliasInput || Date.now(); // Use alias if provided, otherwise use timestamp
        const trackingLink = `${urlInput}?trackId=${uniqueId}`;

        if (expiryInput) {
            const expiryTime = new Date(expiryInput).getTime();
            const currentTime = Date.now();
            if (expiryTime <= currentTime) {
                alert('Expiration time must be in the future.');
                return;
            }
            localStorage.setItem(`expiry_${uniqueId}`, expiryTime); // Store expiration time
        }

        document.getElementById('trackingLink').textContent = trackingLink;

        generateQRCode(trackingLink); // Generate QR code
    });

    function showSpinner() {
        document.getElementById('spinner').style.display = 'block';
    }

    function hideSpinner() {
        document.getElementById('spinner').style.display = 'none';
    }

    function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = isError ? 'error' : '';
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Initialize the map
    const map = L.map('map').setView([0, 0], 2); // Default view (world map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Update the click event to plot locations on the map and add flag icons
    document.getElementById('trackingLink').addEventListener('click', async function (event) {
        event.preventDefault();

        const trackingLink = event.target.textContent;
        const urlParams = new URLSearchParams(trackingLink.split('?')[1]);
        const trackId = urlParams.get('trackId');

        const expiryTime = localStorage.getItem(`expiry_${trackId}`);
        if (expiryTime && Date.now() > expiryTime) {
            alert('This link has expired.');
            event.preventDefault();
            return;
        }

        const logEntries = document.getElementById('logEntries');
        const timestamp = new Date().toLocaleString();
        const userAgent = navigator.userAgent; // Get browser and device info

        showSpinner();

        try {
            // Get accurate location using Geolocation API
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Fetch IP and additional location data
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const ip = data.ip;
                const location = `${data.city}, ${data.region}, ${data.country_name}`;
                const countryCode = data.country.toLowerCase(); // ISO 3166-1 alpha-2 code

                // Add marker to the map
                L.marker([latitude, longitude]).addTo(map)
                    .bindPopup(`<b>IP:</b> ${ip}<br><b>Location:</b> ${location}`)
                    .openPopup();

                // Create log entry with flag icon
                const logEntry = document.createElement('li');
                logEntry.innerHTML = `<img src="https://flagcdn.com/w40/${countryCode}.png" alt="${data.country_name} flag"> Link clicked at ${timestamp} | IP: ${ip} | Location: ${location} | Latitude: ${latitude}, Longitude: ${longitude} | Device: ${userAgent}`;
                logEntries.appendChild(logEntry);

                // Simulate email notification
                sendEmailNotification(ip, location, latitude, longitude, userAgent, timestamp);
                showNotification('Log entry added successfully!');
            }, (error) => {
                console.error('Geolocation error:', error);
                const logEntry = document.createElement('li');
                logEntry.textContent = `Link clicked at ${timestamp} | Unable to fetch accurate location | Device: ${userAgent}`;
                logEntries.appendChild(logEntry);

                showNotification('Failed to fetch location.', true);
            });
        } catch (error) {
            console.error('Error fetching IP/location data:', error);
            showNotification('Failed to fetch IP/location data.', true);
        } finally {
            hideSpinner();
        }

        // Simulate navigation to the link
        window.open(event.target.textContent, '_blank');
    });

    // Simulate sending an email notification via the backend
    function sendEmailNotification(ip, location, latitude, longitude, userAgent, timestamp) {
        const subject = 'Link Tracker Notification';
        const text = `New link click:
        - IP: ${ip}
        - Location: ${location}
        - Coordinates: ${latitude}, ${longitude}
        - User Agent: ${userAgent}
        - Time: ${timestamp}`;
    
        fetch('http://localhost:3000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: '2058972@aup.edu.ph', // Who should receive these
                subject: subject,
                text: text
            })
        })
        .then(response => response.json())
        .then(data => console.log('Email sent:', data))
        .catch(error => console.error('Error:', error));
    }

    // Copy tracking link to clipboard
    document.getElementById('copyLinkButton').addEventListener('click', function () {
        const trackingLink = document.getElementById('trackingLink').textContent;
        if (trackingLink) {
            navigator.clipboard.writeText(trackingLink).then(() => {
                showNotification('Tracking link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy link:', err);
                showNotification('Failed to copy link.', true);
            });
        } else {
            showNotification('No tracking link to copy.', true);
        }
    });

    // Clear the log list
    document.getElementById('clearLogButton').addEventListener('click', function () {
        const logEntries = document.getElementById('logEntries');
        logEntries.innerHTML = '';
        showNotification('Log cleared successfully!');
    });

    // Generate QR code
    function generateQRCode(data) {
        if (!data || typeof data !== 'string' || data.trim() === '') {
            console.error('Invalid data provided for QR code generation.');
            return;
        }
        const qrCodeContainer = document.getElementById('qrcode');
        if (!qrCodeContainer) {
            console.error('Element with ID "qrcode" not found.');
            return;
        }
        qrCodeContainer.innerHTML = ''; // Clear any existing QR code
        QRCode.toCanvas(qrCodeContainer, data, function (error) {
            if (error) console.error(error);
            console.log('QR Code generated successfully!');
        });
    }
});

// Email sending functionality
async function sendEmailNotification(to, subject, text) {
    try {
        const response = await fetch('http://localhost:3000/send-email', { // Ensure this matches the server's address and port
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to send email: ${errorData.error}`);
        }

        const result = await response.json();
        console.log('Email sent:', result.messageId);
    } catch (error) {
        console.error('Failed to fetch:', error.message);
        console.error('Ensure the server is running and accessible at http://localhost:3000');
    }
}
