let speedChart;
let accelChart;
let map;
let polyline;

// =========================
// FILE UPLOAD
// =========================

document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;

        const data = parseCSV(text);

        console.log("PARSED DATA:", data.slice(0, 10));

        plotSpeed(data);
        plotAcceleration(data);
        plotMap(data);
    };

    reader.readAsText(file);
});

// =========================
// CSV PARSER
// =========================

function parseCSV(text) {
    const rows = text.trim().split("\n");

    return rows.slice(1).map(row => {
        const cols = row.split(",");

        return {
            time: parseFloat(cols[0]),
            lat: parseFloat(cols[1]),
            lon: parseFloat(cols[2]),
            speed: parseFloat(cols[3]),
            ax: parseFloat(cols[4]),
            ay: parseFloat(cols[5]),
            az: parseFloat(cols[6])
        };
    }).filter(d => !isNaN(d.time));
}

// =========================
// SPEED GRAPH
// =========================

function plotSpeed(data) {
    const labels = data.map(d => d.time);
    const speed = data.map(d => d.speed);

    if (speedChart) speedChart.destroy();

    speedChart = new Chart(document.getElementById("speedChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Speed (m/s)",
                data: speed,
                borderWidth: 2
            }]
        }
    });
}

// =========================
// ACCELERATION GRAPH
// =========================

function plotAcceleration(data) {
    const labels = data.map(d => d.time);

    const ax = data.map(d => d.ax);
    const ay = data.map(d => d.ay);
    const az = data.map(d => d.az);

    console.log("AX SAMPLE:", ax.slice(0, 5));

    if (accelChart) accelChart.destroy();

    accelChart = new Chart(document.getElementById("accelChart"), {
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
}

// =========================
// MAP
// =========================

function plotMap(data) {
    const coords = data.map(d => [d.lat, d.lon]);

    if (!map) {
        map = L.map('map').setView(coords[0], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: ''
        }).addTo(map);
    }

    if (polyline) {
        map.removeLayer(polyline);
    }

    polyline = L.polyline(coords).addTo(map);

    map.fitBounds(polyline.getBounds());
}
