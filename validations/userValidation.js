const validate = (firstName, lastName, phone, address, username, password) => {
    if (!firstName || typeof firstName !== 'string' || firstName.length > 50) {
        return 'Invalid first name';
    }
    if (lastName && (typeof lastName !== 'string' || lastName.length > 50)) {
        return 'Invalid last name';
    }
    if (!phone || typeof phone !== 'string') {
        return 'Invalid phone number';
    }
    if (!address || typeof address !== 'string') {
        return 'Invalid address';
    }
    return validateUsernamePass(username, password);
}

const validateUsernamePass = (username, password) => {
    if (!username || typeof username !== 'string') {
        return 'Invalid username';
    }
    if (!password || typeof password !== 'string') {
        return 'Invalid password';
    }
    return null;
}

const validatePasswords = (oldPassword, newPassword) => {
    if (!oldPassword || typeof oldPassword !== 'string') {
        return 'Invalid oldPassword';
    }
    if (!newPassword || typeof newPassword !== 'string') {
        return 'Invalid newPassword';
    }
    return null;
}

const updateUser = (firstName, lastName, phone, address) => {
    if (firstName && (typeof firstName !== 'string' || firstName.length > 50)) {
        return 'Invalid first name';
    }
    if (lastName && (typeof lastName !== 'string' || lastName.length > 50)) {
        return 'Invalid last name';
    }
    if (phone && typeof phone !== 'string') {
        return 'Invalid phone number';
    }
    if (address && typeof address !== 'string') {
        return 'Invalid address';
    }
    return null
}

module.exports = {
    validate,
    validateUsernamePass,
    updateUser
}