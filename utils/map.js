let map;
let polyline;
let heatLayer;

function drawMap(coords) {
    if (!coords || coords.length === 0) return;

    const clean = coords.filter(c => !isNaN(c[0]) && !isNaN(c[1]));
    if (!clean.length) return;

    // INIT MAP
    if (!map) {
        map = L.map('map').setView(clean[0], 15);

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { maxZoom: 19 }
        ).addTo(map);
    }

    // REMOVE OLD LAYERS
    if (polyline) map.removeLayer(polyline);
    if (heatLayer) map.removeLayer(heatLayer);

    // DRAW ROUTE
    polyline = L.polyline(clean, {
        color: "#4dabf7",
        weight: 3,
        opacity: 0.7
    }).addTo(map);

    // 🔥 CREATE HEAT DATA
    const heatData = clean.map(c => [c[0], c[1], 0.5]);

    // 🔥 DRAW HEATMAP
    heatLayer = L.heatLayer(heatData, {
        radius: 20,
        blur: 15,
        maxZoom: 17
    }).addTo(map);

    map.fitBounds(polyline.getBounds());

    setTimeout(() => map.invalidateSize(), 100);
}
