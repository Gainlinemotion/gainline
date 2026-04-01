function calculateDistance(coords) {
    let total = 0;

    for (let i = 1; i < coords.length; i++) {
        const [lat1, lon1] = coords[i-1];
        const [lat2, lon2] = coords[i];

        const R = 6371;
        const dLat = (lat2-lat1)*Math.PI/180;
        const dLon = (lon2-lon1)*Math.PI/180;

        const a =
            Math.sin(dLat/2)**2 +
            Math.cos(lat1*Math.PI/180) *
            Math.cos(lat2*Math.PI/180) *
            Math.sin(dLon/2)**2;

        total += R * 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    return total;
}

function movingAverage(data, w=5) {
    return data.map((_,i)=>{
        let s = data.slice(Math.max(0,i-w), i+1);
        return s.reduce((a,b)=>a+b,0)/s.length;
    });
}
