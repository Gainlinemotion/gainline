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
let chart;
let map;
let polyline;

function processCSV(data) {
    const lines = data.split("\n");

    let maxSpeed = 0;
    let speeds = [];
    let labels = [];
    let coordinates = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");

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

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = (speeds.length * 0.01).toFixed(2) + " km";

    drawChart(labels, speeds);
    drawMap(coordinates);
}
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
    // Fake distance for now (we’ll fix later)
    totalDistance = lines.length * 0.01;

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = totalDistance.toFixed(2) + " km";
}
