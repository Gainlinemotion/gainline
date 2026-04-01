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

    // 🔥 NEW STRUCTURE
    let axData = [];
    let ayData = [];
    let azData = [];
    let accelLabels = [];

    let coordinates = [];
    let impactCount = 0;

    for (let i = 1; i < lines.length; i++) {
        let row = lines[i].trim();
        if (!row) continue;

        row = row.replace(/"/g, "").trim();

        const cols = row.split(",");

        if (cols.length < 4) continue;

        const time = cols[0].trim();
        const lat = parseFloat(cols[1]);
        const lon = parseFloat(cols[2]);
        const speed = parseFloat(cols[3]);

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

        // ACCELERATION
        if (cols.length >= 7) {
            const ax = parseFloat(cols[4]);
            const ay = parseFloat(cols[5]);
            const az = parseFloat(cols[6]);

            console.log("Accel:", ax, ay, az);

            if (!isNaN(ax) && !isNaN(ay) && !isNaN(az)) {

                // 🔥 STORE EACH AXIS
                axData.push(ax);
                ayData.push(ay);
                azData.push(az);
                accelLabels.push(time);

                // 🔥 MAGNITUDE (for impacts)
                const accelMag = Math.sqrt(ax * ax + ay * ay + az * az);

                if (accelMag > 15) {
                    impactCount++;
                }
            }
        }
    }

    console.log("AX sample:", axData.slice(0, 5));

    // DISTANCE
    const distance = calculateDistance(coordinates);

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = distance.toFixed(2) + " km";

    // SPEED GRAPH
    drawSpeedChart(speedLabels, speeds);

    // ACCEL GRAPH
    if (axData.length > 0) {
        drawAccelChart(accelLabels, axData, ayData, azData);
    } else {
        console.log("❌ NO ACCEL DATA");
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

// 🔥 FIXED ACCEL GRAPH
function drawAccelChart(labels, ax, ay, az) {
    const ctx = document.getElementById("accelChart").getContext("2d");

    if (accelChart) accelChart.destroy();

    accelChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Ax",
                    data: ax,
                    borderWidth: 1
                },
                {
                    label: "Ay",
                    data: ay,
                    borderWidth: 1
                },
                {
                    label: "Az",
                    data: az,
                    borderWidth: 1
                }
            ]
        }
    });

    console.log("✅ ACCEL GRAPH WORKING");
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

// DISTANCE
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
