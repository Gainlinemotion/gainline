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
    let labels = [];
    let coordinates = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim().split(",");

        if (row.length < 4) continue;

        const time = row[0];
        const lat = parseFloat(row[1]);
        const lon = parseFloat(row[2]);
        const speed = parseFloat(row[3]);

        if (!isNaN(speed)) {
            speeds.push(speed);
            labels.push(time);

            if (speed > maxSpeed) {
                maxSpeed = speed;
            }
        }

        if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lat, lon]);
        }
    }

    console.log("Parsed speeds:", speeds);
    console.log("Parsed coords:", coordinates);

    // REAL DISTANCE
    const distance = calculateDistance(coordinates);

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = distance.toFixed(2) + " km";

    drawChart(labels, speeds);

    if (coordinates.length > 0) {
        drawMap(coordinates);
    }
}

// GRAPH
function drawChart(labels, data) {
    const ctx = document.getElementById("speedChart").getContext("2d");

    if (chart) {
        chart.destroy();
    }

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
        },
        options: {
            responsive: true
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
