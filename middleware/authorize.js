const jwt = require("jsonwebtoken")

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'number') {
        roles = [roles];
    }

    return [
        (req, res, next) => {
            // const authHeader = req.headers['authorization']
            // const token = authHeader && authHeader.split(' ')[1]

            // if (token == null) return res.status(401).json({ message: "Need to login first!" })
            // jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
            //     if (err) return res.status(403).json({ message: 'Token not valid!' });
            //     req.user = user;
            // })
            const roleId = req.user.roleId
            if (roles.length && !roles.includes(roleId)) {
                return res.status(401).json({ message: 'Unauthorized action' });
            }
            next();
        }
    ];
}