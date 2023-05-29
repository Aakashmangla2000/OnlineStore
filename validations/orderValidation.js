function validate(totalPrice, productDetails, location) {
    let errors = []
    if (!totalPrice || typeof totalPrice !== 'number' || totalPrice < 0) {
        errors.push('Invalid totalPrice');
    }
    if (!productDetails || !Array.isArray(productDetails) || productDetails.length < 1) {
        errors.push('Invalid productDetails');
    }
    if (!location) {
        errors.push('Invalid geography location');
    }
    else {
        const { lat, lon } = location;
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || lon < -180 || lon > 180 || lat < -90 || lat > 90)
            errors.push('Invalid lat/lon');
    }
    return errors;
}


function validateOnUpdate(totalPrice, productDetails, location) {
    let errors = []
    if (totalPrice && (typeof totalPrice !== 'number' || totalPrice < 0)) {
        errors.push('Invalid totalPrice');
    }
    if (productDetails && (!Array.isArray(productDetails) || productDetails.length < 1)) {
        errors.push('Invalid productDetails');
    }
    if (location) {
        const { lat, lon } = location;
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || lon < -180 || lon > 180 || lat < -90 || lat > 90)
            errors.push('Invalid lat/lon');
    }
    if (!location && !totalPrice && !productDetails)
        errors.push('Invalid request body');

    return errors;
}

module.exports = {
    validate,
    validateOnUpdate
}