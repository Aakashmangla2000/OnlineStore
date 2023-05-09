module.exports = (req, res, next) => {
    try {
        const userId = req.session.userId
        if (userId === undefined) {
            throw 'User not logged in!';
        } else {
            next();
        }
    } catch (err) {
        res.status(401).json({
            message: err
        });
    }
};