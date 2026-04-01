let speedChart, accelChart, map, polyline;

// =========================
// FILE UPLOAD
// =========================

document.getElementById("fileInput").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => processCSV(ev.target.result);
    reader.readAsText(file);
});

// =========================
// PROCESS CSV
// =========================

function processCSV(data) {

    const lines = data.split("\n");

    let speeds=[], labels=[];
    let ax=[], ay=[], az=[], accelLabels=[];
    let coords=[];
    let maxSpeed = 0;

    for (let i=1;i<lines.length;i++) {
        const c = lines[i].split(",");

        let speed = parseFloat(c[3]);

        if (!isNaN(speed)) {
            speeds.push(speed);
            labels.push(c[0]);
            if (speed > maxSpeed) maxSpeed = speed;
        }

        let lat = parseFloat(c[1]);
        let lon = parseFloat(c[2]);

        if (!isNaN(lat)&&!isNaN(lon)) coords.push([lat,lon]);

        if (c.length>=7) {
            ax.push(parseFloat(c[4]));
            ay.push(parseFloat(c[5]));
            az.push(parseFloat(c[6]));
            accelLabels.push(c[0]);
        }
    }

    const distance = calculateDistance(coords);

    const avgSpeed = speeds.reduce((a,b)=>a+b,0)/speeds.length;

    // =========================
    // SPORT LOGIC
    // =========================

    const sport = document.getElementById("sportSelect").value;

    let analysis;

    if (sport === "rugby") {
        analysis = rugbyAnalysis(ax, ay, az);
    } else {
        analysis = genericAnalysis(ax, ay, az);
    }

    // =========================
    // UI UPDATE
    // =========================

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2);
    document.getElementById("distance").textContent = distance.toFixed(2);
    document.getElementById("avgSpeed").textContent = avgSpeed.toFixed(2);

    document.getElementById("impactCount").textContent = analysis.impacts;
    document.getElementById("peakAccel").textContent = analysis.peak.toFixed(2);

    drawSpeedChart(labels, speeds);
    drawAccelChart(accelLabels, ax, ay, az);
    drawMap(coords);
}

// =========================
// HELPERS
// =========================

function movingAverage(data, w) {
    return data.map((_,i)=>{
        let s = data.slice(Math.max(0,i-w),i+1);
        return s.reduce((a,b)=>a+b,0)/s.length;
    });
}

// charts + map same as before...
