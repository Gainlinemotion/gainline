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
    let totalDistance = 0;

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",");

        if (row.length < 3) continue;

        const speed = parseFloat(row[2]);

        if (!isNaN(speed)) {
            if (speed > maxSpeed) {
                maxSpeed = speed;
            }
        }
    }

    // Fake distance for now (we’ll fix later)
    totalDistance = lines.length * 0.01;

    document.getElementById("maxSpeed").textContent = maxSpeed.toFixed(2) + " m/s";
    document.getElementById("distance").textContent = totalDistance.toFixed(2) + " km";
}
