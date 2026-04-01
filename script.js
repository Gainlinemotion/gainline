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
        let row = lines[i].trim();

        if (!row) continue;

        // REMOVE quotes + spaces
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

        // ACCEL (robust)
        if (cols.length >= 7) {
            const ax = parseFloat(cols[4].trim());
            const ay = parseFloat(cols[5].trim());
            const az = parseFloat(cols[6].trim());

            console.log("Accel raw:", cols[4], cols[5], cols[6]);
            console.log("Accel parsed:", ax, ay, az);

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

    console.log("FINAL ACCEL:", accelData);

    // DISTANCE
    const distance = calculateDistance(coordinates);

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = distance.toFixed(2) + " km";

    // SPEED GRAPH
    drawSpeedChart(speedLabels, speeds);

    // ACCEL GRAPH (FORCE DRAW IF DATA EXISTS)
    if (accelData.length > 0) {
        drawAccelChart(accelLabels, accelData);
    } else {
        console.log("⚠️ NO ACCEL DATA DETECTED");
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
    const canvas = document.getElementById("accelChart");

    if (!canvas) {
        console.log("❌ accelChart canvas not found");
        return;
    }

    const ctx = canvas.getContext("2d");

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

    console.log("✅ ACCEL GRAPH DRAWN");
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
