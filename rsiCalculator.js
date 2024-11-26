function calculateRSI(data) {
    let gains = 0, losses = 0;

    for (let i = 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    const avgGain = gains / data.length;
    const avgLoss = losses / data.length;
    const rs = avgGain / avgLoss;

    return 100 - (100 / (1 + rs));
}

module.exports = calculateRSI;
