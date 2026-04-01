console.log("script loaded");

// =========================
// GLOBALS
// =========================
let speedChart;
let accelChart;
let map;
let polyline;

// =========================
// SESSION STORAGE
// =========================

function getSessions() {
    return JSON.parse(localStorage.getItem("gainline_sessions")) || [];
}

function saveSessions(sessions) {
    localStorage.setItem("gainline_sessions", JSON.stringify(sessions));
}

function deleteSession(id) {
    let sessions = getSessions();
    sessions = sessions.filter(s => s.id !== id);
    saveSessions(sessions);
    renderSessions();
}

function clearAllSessions() {
    if (confirm("Delete all sessions?")) {
        localStorage.removeItem("gainline_sessions");
        renderSessions();
    }
}

// =========================
// FILE UPLOAD
// =========================

document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => processCSV(e.target.result);
    reader.readAsText(file);
});

// =========================
// CSV PROCESSING
// =========================

function processCSV(data) {
    const lines = data.trim().split("\n");

    let speeds = [], speedLabels = [];
    let axData = [], ayData = [], azData = [], accelLabels = [];
    let coords = [];

    let maxSpeed = 0;

    for (let i = 1; i < lines.length; i++) {
        let cols = lines[i].replace(/"/g, "").split(",");

        if (cols.length < 4) continue;

        let time = cols[0];
        let lat = parseFloat(cols[1]);
        let lon = parseFloat(cols[2]);
        let speed = parseFloat(cols[3]);

        if (!isNaN(speed)) {
            speeds.push(speed);
            speedLabels.push(time);
            if (speed > maxSpeed) maxSpeed = speed;
        }

        if (!isNaN(lat) && !isNaN(lon)) coords.push([lat, lon]);

        if (cols.length >= 7) {
            let ax = parseFloat(cols[4]);
            let ay = parseFloat(cols[5]);
            let az = parseFloat(cols[6]);

            if (!isNaN(ax) && !isNaN(ay) && !isNaN(az)) {
                axData.push(ax);
                ayData.push(ay);
                azData.push(az);
                accelLabels.push(time);
            }
        }
    }

    // ===== FIXED STATS =====
    const distance = calculateDistance(coords);

    const avgSpeed = speeds.length
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : 0;

    const duration = speeds.length;

    // ===== PERFORMANCE =====
    let accelMag = [];

    for (let i = 0; i < axData.length; i++) {
        const mag = Math.sqrt(
            axData[i]**2 + ayData[i]**2 + azData[i]**2
        );
        accelMag.push(mag);
    }

    const smoothAccel = movingAverage(accelMag, 5);

    const peakAccel = smoothAccel.length
        ? Math.max(...smoothAccel)
        : 0;

    // REAL impact detection (not spam counting)
    let impactCount = 0;
    const THRESHOLD = 15;

    for (let i = 1; i < smoothAccel.length; i++) {
        if (
            smoothAccel[i] > THRESHOLD &&
            smoothAccel[i - 1] <= THRESHOLD
        ) {
            impactCount++;
        }
    }

    // ===== UI (UNCHANGED STYLE) =====
    document.getElementById("maxSpeed").textContent =
        maxSpeed.toFixed(2) + " m/s";

    document.getElementById("distance").textContent =
        distance.toFixed(2) + " km";

    // OPTIONAL (only if you already added these in HTML)
    if (document.getElementById("avgSpeed")) {
        document.getElementById("avgSpeed").textContent =
            avgSpeed.toFixed(2) + " m/s";
    }

    if (document.getElementById("impactCount")) {
        document.getElementById("impactCount").textContent = impactCount;
    }

    if (document.getElementById("peakAccel")) {
        document.getElementById("peakAccel").textContent =
            peakAccel.toFixed(2);
    }

    // ===== DRAW (UNCHANGED) =====
    drawSpeedChart(speedLabels, speeds);
    drawAccelChart(accelLabels, axData, ayData, azData);
    drawMap(coords);

    // ===== SAVE SESSION (UNCHANGED STYLE) =====
    const session = {
        id: Date.now(),
        name: "Session " + new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        data: {
            speedLabels,
            speeds,
            axData,
            ayData,
            azData,
            accelLabels,
            coords
        },
        stats: {
            maxSpeed,
            distance
        }
    };

    addSession(session);
    renderSessions();
}
    // =========================
    // VALIDATION
    // =========================
    if (!speeds.length || !coords.length) {
        alert("Invalid session data");
        return;
    }

    // =========================
    // BASIC STATS (FIXED)
    // =========================

    const distance = calculateDistance(coords);

    const avgSpeed = speeds.length
        ? speeds.reduce((a, b) => a + b, 0) / speeds.length
        : 0;

    const duration = speeds.length; // can improve later

    // =========================
    // PERFORMANCE METRICS
    // =========================

    let accelMag = [];

    for (let i = 0; i < axData.length; i++) {
        const mag = Math.sqrt(
            axData[i] ** 2 +
            ayData[i] ** 2 +
            azData[i] ** 2
        );
        accelMag.push(mag);
    }

    const smoothAccel = movingAverage(accelMag, 5);

    const peakAccel = smoothAccel.length
        ? Math.max(...smoothAccel)
        : 0;

    const IMPACT_THRESHOLD = 15;

    let impactCount = 0;

    for (let i = 1; i < smoothAccel.length; i++) {
        if (
            smoothAccel[i] > IMPACT_THRESHOLD &&
            smoothAccel[i - 1] <= IMPACT_THRESHOLD
        ) {
            impactCount++;
        }
    }

    // =========================
    // UI UPDATE
    // =========================

    updateStats(maxSpeed, distance, avgSpeed, duration, impactCount, peakAccel);

    drawSpeedChart(speedLabels, speeds);
    drawAccelChart(accelLabels, axData, ayData, azData);
    drawMap(coords);

    // =========================
    // SESSION NAMING
    // =========================

    let name = prompt("Name this session:");
    if (!name) name = "Session " + new Date().toLocaleTimeString();

    const session = {
        id: Date.now(),
        name,
        date: new Date().toLocaleDateString(),
        stats: {
            maxSpeed,
            distance,
            avgSpeed,
            duration,
            impactCount,
            peakAccel
        },
        data: {
            speedLabels,
            speeds,
            axData,
            ayData,
            azData,
            accelLabels,
            coords
        }
    };

    const sessions = getSessions();
    sessions.push(session);
    saveSessions(sessions);

    renderSessions();
}

// =========================
// HELPERS
// =========================

function movingAverage(data, window) {
    return data.map((_, i) => {
        let start = Math.max(0, i - window);
        let subset = data.slice(start, i + 1);
        return subset.reduce((a, b) => a + b, 0) / subset.length;
    });
}

function updateStats(maxSpeed, distance, avgSpeed, duration, impactCount, peakAccel) {
    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = distance.toFixed(2) + " km";
    document.getElementById("avgSpeed").textContent = avgSpeed.toFixed(2) + " m/s";
    document.getElementById("duration").textContent = duration + " pts";

    document.getElementById("impactCount").textContent = impactCount;
    document.getElementById("peakAccel").textContent = peakAccel.toFixed(2);
}

// =========================
// SESSION UI
// =========================

function renderSessions() {
    const container = document.getElementById("sessionList");
    container.innerHTML = "";

    const sessions = getSessions().reverse();

    sessions.forEach(session => {
        const div = document.createElement("div");
        div.className = "session-card";

        div.innerHTML = `
            <div class="session-info">
                <strong>${session.name}</strong>
                <span>${session.date}</span>
            </div>

            <div class="session-stats">
                <span>${session.stats.distance.toFixed(2)} km</span>
                <span>${session.stats.maxSpeed.toFixed(2)} m/s</span>
            </div>

            <button class="delete-btn">✕</button>
        `;

        div.onclick = () => loadSession(session.id);

        div.querySelector(".delete-btn").onclick = (e) => {
            e.stopPropagation();
            deleteSession(session.id);
        };

        container.appendChild(div);
    });
}

// =========================
// LOAD SESSION
// =========================

function loadSession(id) {
    const session = getSessions().find(s => s.id === id);
    if (!session) return;

    const d = session.data;

    drawSpeedChart(d.speedLabels, d.speeds);
    drawAccelChart(d.accelLabels, d.axData, d.ayData, d.azData);
    drawMap(d.coords);

    updateStats(
        session.stats.maxSpeed,
        session.stats.distance,
        session.stats.avgSpeed,
        session.stats.duration,
        session.stats.impactCount,
        session.stats.peakAccel
    );
}

// =========================
// CHARTS
// =========================

function drawSpeedChart(labels, data) {
    if (speedChart) speedChart.destroy();

    speedChart = new Chart(document.getElementById("speedChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                data,
                borderColor: "#4dabf7",
                tension: 0.3
            }]
        }
    });
}

function drawAccelChart(labels, ax, ay, az) {
    if (accelChart) accelChart.destroy();

    accelChart = new Chart(document.getElementById("accelChart"), {
        type: "line",
        data: {
            labels,
            datasets: [
                { label: "Ax", data: ax, borderColor: "#4dabf7" },
                { label: "Ay", data: ay, borderColor: "#1c7ed6" },
                { label: "Az", data: az, borderColor: "#74c0fc" }
            ]
        }
    });
}

// =========================
// MAP
// =========================

function drawMap(coords) {
    if (!coords.length) return;

    if (!map) {
        map = L.map('map').setView(coords[0], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    }

    if (polyline) map.removeLayer(polyline);

    polyline = L.polyline(coords, {
        color: "#4dabf7",
        weight: 4
    }).addTo(map);

    map.fitBounds(polyline.getBounds());

    setTimeout(() => map.invalidateSize(), 100);
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

        total += R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    return total;
}

// =========================
// INIT
// =========================

renderSessions();

renderSessions();
