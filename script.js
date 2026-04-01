console.log("script loaded");

let chart;
let accelChart;
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

        if (row.length < 4) continue;

        const time = row[0];
        const lat = parseFloat(row[1]);
        const lon = parseFloat(row[2]);
        const speed = parseFloat(row[3]);

        // SPEED
        if (!isNaN(speed)) {
            speeds.push(speed);
            speedLabels.push(time);

            if (speed > maxSpeed) {
                maxSpeed = speed;
            }
        }

        // GPS
        if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lat, lon]);
        }

        // ACCELERATION (only if exists)
        if (row.length >= 7) {
            const ax = parseFloat(row[4]);
            const ay = parseFloat(row[5]);
            const az = parseFloat(row[6]);

            if (!isNaN(ax) && !isNaN(ay) && !isNaN(az)) {
                const accel = Math.sqrt(ax * ax + ay * ay + az * az);

                accelData.push(accel);
                accelLabels.push(time);

                if (accel > 15) {
                    impactCount++;
                }
            }
        }
    }

    console.log("Speeds:", speeds);
    console.log("Coords:", coordinates);
    console.log("Accel:", accelData);
    console.log("Impacts:", impactCount);

    // DISTANCE
    const distance = calculateDistance(coordinates);

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = distance.toFixed(2) + " km";

    // DRAW CHARTS
    drawSpeedChart(speedLabels, speeds);

    if (accelData.length > 0) {
        drawAccelChart(accelLabels, accelData);
    } else {
        console.log("No acceleration data found");
    }

    // MAP
    if (coordinates.length > 0) {
        drawMap(coordinates);
    }
}

// SPEED GRAPH
function drawSpeedChart(labels, data) {
    const ctx = document.getElementById("speedChart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Speed (m/s)",
                data: data,
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });
}

// ACCEL GRAPH
function drawAccelChart(labels, data) {
    const ctx = document.getElementById("accelChart").getContext("2d");

    if (accelChart) accelChart.destroy();

    accelChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Acceleration (m/s²)",
                data: data,
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });
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

// DISTANCE (HAVERSINE)
function calculateDistance(coords) {
    let total = 0;

    for (let i = 1; i < coords.length; i++) {
        const [lat1, lon1] = coords[i - 1];
        const [lat2, lon2] = coords[i];

        const R = 6371;

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        total += R * c;
    }

    return total;
}
