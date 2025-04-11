document.getElementById('linkForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const urlInput = document.getElementById('urlInput').value;
    const uniqueId = Date.now(); // Use timestamp as a unique identifier
    const trackingLink = `${urlInput}?trackId=${uniqueId}`;

    document.getElementById('trackingLink').textContent = trackingLink;
});

document.getElementById('trackingLink').addEventListener('click', async function (event) {
    event.preventDefault();

    const logEntries = document.getElementById('logEntries');
    const timestamp = new Date().toLocaleString();

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

            // Create log entry
            const logEntry = document.createElement('li');
            logEntry.textContent = `Link clicked at ${timestamp} | IP: ${ip} | Location: ${location} | Latitude: ${latitude}, Longitude: ${longitude}`;
            logEntries.appendChild(logEntry);
        }, (error) => {
            console.error('Geolocation error:', error);
            const logEntry = document.createElement('li');
            logEntry.textContent = `Link clicked at ${timestamp} | Unable to fetch accurate location`;
            logEntries.appendChild(logEntry);
        });
    } catch (error) {
        console.error('Error fetching IP/location data:', error);
        const logEntry = document.createElement('li');
        logEntry.textContent = `Link clicked at ${timestamp} | Unable to fetch IP/location data`;
        logEntries.appendChild(logEntry);
    }

    // Simulate navigation to the link
    window.open(event.target.textContent, '_blank');
});
