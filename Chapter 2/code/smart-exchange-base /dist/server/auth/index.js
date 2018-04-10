"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jwt = require("jsonwebtoken");
// Setup role levels
var roles = {
    'user': ['user', 'admin'],
    'admin': ['admin']
};
function verifyJWTToken(token) {
    return new Promise(function (resolve, reject) {
        jwt.verify(token, process.env.SECRET_TOKEN, function (err, decodedToken) {
            if (err || !decodedToken) {
                return reject(err);
            }
            resolve(decodedToken);
        });
    });
}
function createJWToken(toJWToken) {
    return jwt.sign({
        data: toJWToken.user
    }, process.env.SECRET_TOKEN, {
        expiresIn: parseInt(process.env.TOKEN_MAXAGE),
        algorithm: 'HS256'
    });
}
exports.createJWToken = createJWToken;
function Authenticate(req, res, next) {
    var token = req.get('Authorization') ? req.get('Authorization').replace('Bearer ', '') : '';
    verifyJWTToken(token)
        .then(function (decodedToken) {
        req.user = decodedToken.data;
        // additional security check if the user exists in DB
        // if not kick them out!
        next();
    })
        .catch(function (err) {
        res.status(403)
            .json({ message: 'Invalid auth token provided.' });
    });
}
exports.Authenticate = Authenticate;
function Authorize(accessLevel) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                message: 'User Not Found'
            });
        }
        var role = req.user.role;
        var validRoles = roles[accessLevel];
        if (!validRoles) {
            return res.status(403).json({
                message: 'Invalid role'
            });
        }
        if (validRoles.indexOf(role) !== -1) {
            next();
        }
        else {
            return res.status(403).json({
                message: 'User with this role cannot access ' + req.originalUrl
            });
        }
    };
}
exports.Authorize = Authorize;
exports.default = {
    createJWToken: createJWToken,
    Authenticate: Authenticate,
    Authorize: Authorize
};
//# sourceMappingURL=index.js.map