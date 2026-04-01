function rugbyAnalysis(ax, ay, az) {

    let accelMag = [];

    for (let i = 0; i < ax.length; i++) {
        const mag = Math.sqrt(ax[i]**2 + ay[i]**2 + az[i]**2);
        accelMag.push(mag);
    }

    const smooth = movingAverage(accelMag, 5);

    const peak = Math.max(...smooth);

    let impacts = 0;
    const THRESHOLD = 15;

    for (let i = 1; i < smooth.length; i++) {
        if (smooth[i] > THRESHOLD && smooth[i-1] <= THRESHOLD) {
            impacts++;
        }
    }

    return { impacts, peak };
}
