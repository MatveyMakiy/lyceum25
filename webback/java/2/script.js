function printNumbersIntervalDelayed(from, to, delay = 500) {
    let promise = Promise.resolve();
    for (let i = from; i <= to; i++) {
        promise = promise.then(() => {
            console.log(i);
            if (i < to) {
                return new Promise(resolve => setTimeout(resolve, delay));
            }
        })
    }
    return promise;
}
printNumbersIntervalDelayed(1, 3, 1000)