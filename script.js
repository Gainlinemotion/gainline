<!DOCTYPE html>
<html>
<head>
    <title>Gainline</title>

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- Leaflet -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
</head>

<body>

<header>
    Gainline Dashboard
</header>

<div class="container">

    <!-- Upload -->
    <div class="card">
        <div class="label">Upload Session</div>
        <input type="file" id="fileInput">
    </div>

    <!-- Stats -->
    <div class="card">
        <div class="label">Distance</div>
        <div class="stat" id="distance">--</div>
    </div>

    <div class="card">
        <div class="label">Max Speed</div>
        <div class="stat" id="maxSpeed">--</div>
    </div>

    <!-- Graph -->
    <div class="card">
        <div class="label">Speed Graph</div>
        <canvas id="speedChart"></canvas>
    </div>

    <!-- Map -->
    <div class="card">
        <div class="label">Route Map</div>
        <div id="map" style="height: 300px;"></div>
    </div>

</div>

<script src="script.js"></script>

</body>
</html>        const time = row[0];
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

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = (speeds.length * 0.01).toFixed(2) + " km";

    drawChart(labels, speeds);

    if (coordinates.length > 0) {
        drawMap(coordinates);
    }
}

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
function calculateDistance(coords) {
    let total = 0;

    for (let i = 1; i < coords.length; i++) {
        const [lat1, lon1] = coords[i - 1];
        const [lat2, lon2] = coords[i];

        const R = 6371; // Earth radius (km)

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c;

        total += d;
    }

    return total;
}
}
