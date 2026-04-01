console.log("script loaded");

let chart;
let map;
let polyline;

// FILE UPLOAD
document.getElementById("fileInput").addEventListener("change", function(event) {
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

        // SPEED DATA
        if (!isNaN(speed)) {
            speeds.push(speed);
            labels.push(time);

            if (speed > maxSpeed) {
                maxSpeed = speed;
            }
        }

        // GPS DATA
        if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lat, lon]);
        }
    }

    console.log("Speeds:", speeds);
    console.log("Coords:", coordinates);

    // UPDATE STATS
    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = (speeds.length * 0.01).toFixed(2) + " km";

    // DRAW GRAPH
    drawChart(labels, speeds);

    // DRAW MAP
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
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: "Time" }
                },
                y: {
                    title: { display: true, text: "Speed (m/s)" }
                }
            }
        }
    });
}

// MAP
function drawMap(coords) {

    if (!map) {
        map = L.map('map').setView(coords[0], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ''
        }).addTo(map);
    }

    if (polyline) {
        map.removeLayer(polyline);
    }

    polyline = L.polyline(coords, { color: 'blue' }).addTo(map);

    map.fitBounds(polyline.getBounds());
}
