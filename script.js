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

function processCSV(data) {
    const lines = data.split("\n");

    let maxSpeed = 0;
    let speeds = [];
    let labels = [];

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");

        if (row.length < 4) continue;

        const time = row[0];
        const speed = parseFloat(row[3]);

        if (!isNaN(speed)) {
            speeds.push(speed);
            labels.push(time);

            if (speed > maxSpeed) {
                maxSpeed = speed;
            }
        }
    }

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = (speeds.length * 0.01).toFixed(2) + " km";

    drawChart(labels, speeds);
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
                fill: false,
                tension: 0.2
            }]
        },
        options: {
            responsive: true
        }
    });
}

    // Fake distance for now (we’ll fix later)
    totalDistance = lines.length * 0.01;

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = totalDistance.toFixed(2) + " km";
}
