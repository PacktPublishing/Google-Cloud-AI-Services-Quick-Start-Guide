import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import _ from 'lodash';

// Setup role levels
var roles = {
	'user': ['user', 'admin'],
	'admin': ['admin']
};

function verifyJWTToken(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, process.env.SECRET_TOKEN, (err, decodedToken) => {
			if (err || !decodedToken) {
				return reject(err)
			}

			resolve(decodedToken)
		});
	})
}

export function createJWToken(toJWToken) {
	return jwt.sign({
		data: toJWToken.user
	}, process.env.SECRET_TOKEN, {
			expiresIn: parseInt(process.env.TOKEN_MAXAGE),
			algorithm: 'HS256'
		});
}

export function Authenticate(req, res, next) {
	let token = req.get('Authorization') ? req.get('Authorization').replace('Bearer ', '') : '';

	verifyJWTToken(token)
		.then((decodedToken: any) => {
			req.user = decodedToken.data;
			// additional security check if the user exists in DB
			// if not kick them out!
			next()
		})
		.catch((err) => {
			res.status(403)
				.json({ message: 'Invalid auth token provided.' })
		});
}

export function Authorize(accessLevel: string) {
	return (req, res, next) => {
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
		} else {
			return res.status(403).json({
				message: 'User with this role cannot access ' + req.originalUrl
			});
		}
	}
}


export default {
	createJWToken,
	Authenticate,
	Authorize
}
