const deepMerge = (target, source) => {
    const isObject = (obj) => obj && typeof obj === 'object' && !Array.isArray(obj);

    if (!isObject(target) || !isObject(source)) {
        return source;
    }

    Object.keys(source).forEach(key => {
        const targetValue = target[key];
        const sourceValue = source[key];

        if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
            target[key] = sourceValue;
        } else if (isObject(targetValue) && isObject(sourceValue)) {
            target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
        } else {
            target[key] = sourceValue;
        }
    });

    return target;
};

const storeWedding = { demoGuestName: "Demo" };
const urlData = { demoGuestName: "Familia" };
console.log(deepMerge(storeWedding, urlData));

const appConfigWedding = { rsvp: { showAdults: false } };
const cloudData = { rsvp: { showAdults: true } };
console.log(deepMerge(appConfigWedding, cloudData));
