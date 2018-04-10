"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var user_1 = require("../controllers/user");
var auth_1 = require("../auth");
function defineUserRoutes(app) {
    var router = express.Router();
    var userCtrl = new user_1.default();
    // Users
    router.post('/login', userCtrl.login);
    router.get('/users', auth_1.Authenticate, auth_1.Authorize('admin'), userCtrl.getAll);
    router.get('/users/count', auth_1.Authenticate, auth_1.Authorize('admin'), userCtrl.count);
    router.post('/register', userCtrl.insert);
    router.get('/user/:id', auth_1.Authenticate, auth_1.Authorize('user'), userCtrl.get);
    router.put('/user/:id', auth_1.Authenticate, auth_1.Authorize('user'), userCtrl.update);
    router.delete('/user/:id', auth_1.Authenticate, auth_1.Authorize('admin'), userCtrl.delete);
    // Apply the routes to our application with the prefix /api
    app.use('/api', router);
}
exports.default = defineUserRoutes;
//# sourceMappingURL=user.js.map