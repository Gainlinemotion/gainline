let speedChart, accelChart;

function drawSpeedChart(labels, speeds) {
    if (speedChart) speedChart.destroy();

    speedChart = new Chart(speedChartCanvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                data: speeds,
                borderColor: "#4dabf7",
                tension: 0.3
            }]
        }
    });
}

function drawAccelChart(labels, ax, ay, az) {
    if (accelChart) accelChart.destroy();

    accelChart = new Chart(accelChartCanvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {label:"Ax", data:ax},
                {label:"Ay", data:ay},
                {label:"Az", data:az}
            ]
        }
    });
}
