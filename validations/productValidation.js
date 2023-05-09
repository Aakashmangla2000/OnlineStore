function validate(product) {
    let errors = []
    if (!product.name || typeof product.name !== 'string' || product.name.length > 50) {
        errors.push('Invalid product name');
    }
    if (!product.quantity || typeof product.quantity !== 'number' || product.quantity < 0) {
        errors.push('Invalid quantity');
    }
    if (!product.price || typeof product.price !== 'number' || product.price < 0) {
        errors.push('Invalid price');
    }
    if (!product.description || typeof product.description !== 'string') {
        errors.push('Invalid description');
    }
    return errors
}

function validateOnUpdate(product) {
    let errors = []
    if (product.name && (typeof product.name !== 'string' || product.name.length > 50)) {
        errors.push('Invalid product name');
    }
    if (product.quantity && (typeof product.quantity !== 'number' || product.quantity < 0)) {
        errors.push('Invalid quantity');
    }
    if (product.price && (typeof product.price !== 'number' || product.price < 0)) {
        errors.push('Invalid price');
    }
    if (product.description && (typeof product.description !== 'string')) {
        errors.push('Invalid description');
    }
    return errors
}

module.exports = {
    validate,
    validateOnUpdate
}