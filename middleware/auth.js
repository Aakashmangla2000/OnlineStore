const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (token == null) return res.status(401).json({ message: "Need to login first!" })
        jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Token not valid!' });
            req.user = user;
            next();
        })
    } catch (err) {
        res.status(401).json({
            message: err
        });
    }
};