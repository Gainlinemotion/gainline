console.log("script loaded");

let speedChart;
let accelChart;
let map;
let polyline;

// =========================
// FILE UPLOAD
// =========================

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
// =========================
// SESSION STORAGE
// =========================

function getSessions() {
    const sessions = localStorage.getItem("gainline_sessions");
    return sessions ? JSON.parse(sessions) : [];
}

function saveSessions(sessions) {
    localStorage.setItem("gainline_sessions", JSON.stringify(sessions));
}

function addSession(session) {
    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);
}
// =========================
// PROCESS CSV
// =========================

function processCSV(data) {
    const lines = data.trim().split("\n");

    let speeds = [];
    let speedLabels = [];

    let axData = [];
    let ayData = [];
    let azData = [];
    let accelLabels = [];

    let coordinates = [];

    let maxSpeed = 0;

    for (let i = 1; i < lines.length; i++) {
        let row = lines[i].trim();
        if (!row) continue;

        row = row.replace(/"/g, "");
        const cols = row.split(",");

        if (cols.length < 4) continue;

        const time = cols[0];
        const lat = parseFloat(cols[1]);
        const lon = parseFloat(cols[2]);
        const speed = parseFloat(cols[3]);
       let ax = NaN, ay = NaN, az = NaN;

if (cols.length >= 7) {
    ax = parseFloat(cols[4]);
    ay = parseFloat(cols[5]);
    az = parseFloat(cols[6]);
}

        // SPEED
        if (!isNaN(speed)) {
            speeds.push(speed);
            speedLabels.push(time);
            if (speed > maxSpeed) maxSpeed = speed;
        }

        // GPS
        if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lat, lon]);
        }

        // ACCEL
        if (!isNaN(ax) && !isNaN(ay) && !isNaN(az)) {
            axData.push(ax);
            ayData.push(ay);
            azData.push(az);
            accelLabels.push(time);
        }
    }

    console.log("Coords:", coordinates.length);
    console.log("Accel sample:", axData.slice(0, 5));

    // DISTANCE
    const distance = calculateDistance(coordinates);

    // UPDATE UI
    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = distance.toFixed(2) + " km";

    // DRAW
    drawSpeedChart(speedLabels, speeds);
    drawAccelChart(accelLabels, axData, ayData, azData);
    drawMap(coordinates);
}

// =========================
// SPEED CHART
// =========================

function drawSpeedChart(labels, data) {
    if (speedChart) speedChart.destroy();

    speedChart = new Chart(document.getElementById("speedChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Speed (m/s)",
                data: data,
                borderColor: "#4dabf7",
                borderWidth: 2,
                tension: 0.3
            }]
        }
    });
}

// =========================
// ACCEL CHART
// =========================

function drawAccelChart(labels, ax, ay, az) {
    if (accelChart) accelChart.destroy();

    accelChart = new Chart(document.getElementById("accelChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Ax", data: ax, borderColor: "#4dabf7" },
                { label: "Ay", data: ay, borderColor: "#1c7ed6" },
                { label: "Az", data: az, borderColor: "#74c0fc" }
            ]
        }
    });
}

// =========================
// MAP (FIXED)
// =========================

function drawMap(coords) {
    console.log("coords count:", coords.length);

    if (!coords || coords.length === 0) {
        console.log("❌ No coordinates");
        return;
    }

    const cleanCoords = coords.filter(c =>
        Array.isArray(c) &&
        !isNaN(c[0]) &&
        !isNaN(c[1])
    );

    if (cleanCoords.length === 0) {
        console.log("❌ No valid coords");
        return;
    }

    if (!map) {
        map = L.map('map').setView(cleanCoords[0], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }

    if (polyline) {
        map.removeLayer(polyline);
    }

    polyline = L.polyline(cleanCoords, {
        color: "#4dabf7",
        weight: 4
    }).addTo(map);

    map.fitBounds(polyline.getBounds());

    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// =========================
// DISTANCE
// =========================

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
function renderSessions() {
    const container = document.getElementById("sessionList");
    container.innerHTML = "";

    const sessions = getSessions();

    sessions.reverse().forEach(session => {
        const div = document.createElement("div");
        div.className = "session-item";

        div.innerHTML = `
            <strong>${session.name}</strong><br>
            ${session.date}<br>
            Speed: ${session.stats.maxSpeed.toFixed(2)} m/s
        `;

        div.onclick = () => loadSession(session.id);

        container.appendChild(div);
    });
}
// =========================
// SAVE SESSION
// =========================

const session = {
    id: "session_" + Date.now(),
    name: "Session " + new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    data: {
        speedLabels,
        speeds,
        axData,
        ayData,
        azData,
        accelLabels,
        coordinates
    },
    stats: {
        maxSpeed,
        distance
    }
};

addSession(session);

console.log("✅ Session saved");
