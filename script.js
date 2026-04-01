const speedChartCanvas = document.getElementById("speedChart");
const accelChartCanvas = document.getElementById("accelChart");

// =========================
// SESSION STORAGE
// =========================

function getSessions() {
    return JSON.parse(localStorage.getItem("sessions")) || [];
}

function saveSessions(s) {
    localStorage.setItem("sessions", JSON.stringify(s));
}

function clearSessions() {
    localStorage.removeItem("sessions");
    renderSessions();
}

// =========================
// CSV PROCESS
// =========================

document.getElementById("fileInput").addEventListener("change", e => {
    const reader = new FileReader();
    reader.onload = ev => processCSV(ev.target.result);
    reader.readAsText(e.target.files[0]);
});

function processCSV(data) {

    const lines = data.split("\n");

    let speeds=[], labels=[];
    let ax=[], ay=[], az=[];
    let coords=[];
    let maxSpeed=0;

    for (let i=1;i<lines.length;i++) {
        const c = lines[i].split(",");

        let speed = parseFloat(c[3]);
        if (!isNaN(speed)) {
            speeds.push(speed);
            labels.push(c[0]);
            if (speed>maxSpeed) maxSpeed=speed;
        }

        let lat=parseFloat(c[1]);
        let lon=parseFloat(c[2]);
        if (!isNaN(lat)&&!isNaN(lon)) coords.push([lat,lon]);

        if (c.length>=7) {
            ax.push(parseFloat(c[4]));
            ay.push(parseFloat(c[5]));
            az.push(parseFloat(c[6]));
        }
    }

    const distance = calculateDistance(coords);
    const avgSpeed = speeds.reduce((a,b)=>a+b,0)/speeds.length;

    const sport = document.getElementById("sportSelect").value;

    let analysis = sport==="rugby"
        ? rugbyAnalysis(ax,ay,az)
        : genericAnalysis();

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2);
    document.getElementById("avgSpeed").textContent = avgSpeed.toFixed(2);
    document.getElementById("distance").textContent = distance.toFixed(2);

    document.getElementById("impactCount").textContent = analysis.impacts;
    document.getElementById("peakAccel").textContent = analysis.peak.toFixed(2);

    drawSpeedChart(labels, speeds);
    drawAccelChart(labels, ax, ay, az);
    drawMap(coords);

    const sessions = getSessions();
    sessions.push({maxSpeed, distance});
    saveSessions(sessions);

    renderSessions();
}

// =========================
// SESSIONS UI
// =========================

function renderSessions() {
    const list = document.getElementById("sessionList");
    list.innerHTML="";

    getSessions().forEach((s,i)=>{
        const div = document.createElement("div");
        div.className="session";
        div.textContent = `Session ${i+1} - ${s.maxSpeed.toFixed(2)} m/s`;

        const btn = document.createElement("button");
        btn.textContent="X";

        btn.onclick=(e)=>{
            e.stopPropagation();
            let arr=getSessions();
            arr.splice(i,1);
            saveSessions(arr);
            renderSessions();
        };

        div.appendChild(btn);
        list.appendChild(div);
    });
}

renderSessions();
