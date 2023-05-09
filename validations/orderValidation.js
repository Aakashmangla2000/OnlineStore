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
        const { latitude, longitude } = location;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90)
            errors.push('Invalid latitude/longitude');
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
        const { latitude, longitude } = location;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90)
            errors.push('Invalid latitude/longitude');
    }
    if (!location && !totalPrice && !productDetails)
        errors.push('Invalid request body');

    return errors;
}

module.exports = {
    validate,
    validateOnUpdate
}