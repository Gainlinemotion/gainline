function rugbyAnalysis(ax, ay, az) {
    let mag = [];

    for (let i = 0; i < ax.length; i++) {
        mag.push(Math.sqrt(ax[i]**2 + ay[i]**2 + az[i]**2));
    }

    const smooth = movingAverage(mag);

    let impacts = 0;
    const THRESHOLD = 15;

    for (let i = 1; i < smooth.length; i++) {
        if (smooth[i] > THRESHOLD && smooth[i-1] <= THRESHOLD) {
            impacts++;
        }
    }

    return {
        impacts,
        peak: Math.max(...smooth)
    };
}
