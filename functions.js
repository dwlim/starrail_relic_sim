function accumulate(numbers) {
    let accm = [];
    let total = 0;
    for (let n of numbers) {
        total += n;
        accm.push(total)
    }
    return accm;
}

function bisect_left(arr, target) {
    let n = arr.length;
    let l = 0;
    let r = n - 1;
    while (l <= r) {
        let m = Math.floor((l + r) / 2);
        if (arr[m] < target) {
            l = m + 1;
        } else if (arr[m] >= target) {
            r = m - 1;
        }
    }
    return l;
}

function wchoice(population, weights, accumulated) {
    let acm = (accumulated) ? weights : accumulate(weights);
    let rnd = Math.random() * acm[acm.length - 1];

    let idx = bisect_left(acm, rnd);

    return [idx, population[idx]];
}

function wsample(population, weights, k) {
    let sample = [];
    let indices = [];
    let index = 0;
    let choice = null;
    let acmwts = accumulate(weights);

    for (let i = 0; i < k; i++) {
        [index, choice] = wchoice(population, acmwts, true);
        sample.push(choice);
        indices.push(index);

        // The below updates the accumulated weights as if the member
        // at `index` has a weight of 0, eliminating it from future draws.
        // This portion could be optimized. See note below.
        let ndecr = weights[index];
        for (; index < acmwts.length; index++) {
            acmwts[index] -= ndecr;
        }
    }
    return [indices, sample];
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStandardDeviation (array) {
    const n = array.length;
    const mean = array.reduce((a, b) => a + b) / n;
    return [mean, Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)];
}