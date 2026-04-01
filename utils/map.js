let map;
let polyline;

function drawMap(coords) {
    if (!coords.length) return;

    if (!map) {
        map = L.map('map').setView(coords[0], 15);

        L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ).addTo(map);
    }

    if (polyline) {
        map.removeLayer(polyline);
    }

    polyline = L.polyline(coords, {
        color: "#4dabf7",
        weight: 4
    }).addTo(map);

    map.fitBounds(polyline.getBounds());
}
