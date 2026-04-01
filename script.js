console.log("script loaded");

let chart;
let map;
let polyline;

// FILE UPLOAD
document.getElementById("fileInput").addEventListener("change", function(event) {
    console.log("file selected");

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        processCSV(text);
    };

    reader.readAsText(file);
});

function processCSV(data) {
    const lines = data.split("\n");

    let maxSpeed = 0;
    let speeds = [];
    let speedLabels = [];

    let accelData = [];
    let accelLabels = [];

    let coordinates = [];

    let impactCount = 0;

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim().split(",");

        if (row.length < 7) continue;

        const time = row[0];
        const lat = parseFloat(row[1]);
        const lon = parseFloat(row[2]);
        const speed = parseFloat(row[3]);

        const ax = parseFloat(row[4]);
        const ay = parseFloat(row[5]);
        const az = parseFloat(row[6]);

        // SPEED
        if (!isNaN(speed)) {
            speeds.push(speed);
            speedLabels.push(time);

            if (speed > maxSpeed) {
                maxSpeed = speed;
            }
        }

        // ACCELERATION (magnitude)
        if (!isNaN(ax) && !isNaN(ay) && !isNaN(az)) {
            const accel = Math.sqrt(ax*ax + ay*ay + az*az);

            accelData.push(accel);
            accelLabels.push(time);

            // IMPACT DETECTION
            if (accel > 15) {
                impactCount++;
            }
        }

        // GPS
        if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lat, lon]);
        }
    }

    // DISTANCE
    const distance = calculateDistance(coordinates);

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = distance.toFixed(2) + " km";

    // DRAW
    drawChart(speedLabels, speeds);
    drawAccelChart(accelLabels, accelData);

    if (coordinates.length > 0) {
        drawMap(coordinates);
    }

    console.log("Impacts:", impactCount);
}
// MAP
function drawMap(coords) {
    if (!map) {
        map = L.map('map').setView(coords[0], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }

    if (polyline) {
        map.removeLayer(polyline);
    }

    polyline = L.polyline(coords, { color: 'blue' }).addTo(map);

    map.fitBounds(polyline.getBounds());
}
//Acceleration
function drawAccelChart(labels, data) {
    const ctx = document.getElementById("accelChart").getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Acceleration (m/s²)",
                data: data,
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true
        }
    });
}

// HAVERSINE DISTANCE
function calculateDistance(coords) {
    let total = 0;

    for (let i = 1; i < coords.length; i++) {
        const [lat1, lon1] = coords[i - 1];
        const [lat2, lon2] = coords[i];

        const R = 6371; // km

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c;

        total += d;
    }

    return total;
}
