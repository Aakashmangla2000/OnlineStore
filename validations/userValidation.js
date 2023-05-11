const validate = (firstName, lastName, phone, address, username, password) => {
    const errors = []
    if (!firstName || typeof firstName !== 'string' || firstName.length > 50) {
        errors.push('Invalid first name');
    }
    if (lastName && (typeof lastName !== 'string' || lastName.length > 50)) {
        errors.push('Invalid last name');
    }
    if (!phone || typeof phone !== 'string') {
        errors.push('Invalid phone number');
    }
    if (!address || typeof address !== 'string') {
        errors.push('Invalid address');
    }
    return validateUsernamePass(username, password, errors);
}

const validateUsernamePass = (username, password, errors = []) => {
    if (!username || typeof username !== 'string') {
        errors.push('Invalid username');
    }
    if (!password || typeof password !== 'string') {
        errors.push('Invalid password');
    }
    return errors;
}

const validatePasswords = (oldPassword, newPassword) => {
    const errors = []
    if (!oldPassword || typeof oldPassword !== 'string') {
        errors.push('Invalid oldPassword');
    }
    if (!newPassword || typeof newPassword !== 'string') {
        errors.push('Invalid newPassword');
    }
    return errors;
}

const updateUser = (firstName, lastName, phone, address) => {
    const errors = []
    if (firstName && (typeof firstName !== 'string' || firstName.length > 50)) {
        errors.push('Invalid first name');
    }
    if (lastName && (typeof lastName !== 'string' || lastName.length > 50)) {
        errors.push('Invalid last name');
    }
    if (phone && typeof phone !== 'string') {
        errors.push('Invalid phone number');
    }
    if (address && typeof address !== 'string') {
        errors.push('Invalid address');
    }
    return errors;
}

module.exports = {
    validate,
    validateUsernamePass,
    updateUser,
    validatePasswords
}