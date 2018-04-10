"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var message_1 = require("../controllers/message");
var auth_1 = require("../auth");
function defineMessageRoutes(app) {
    var router = express.Router();
    var messageCtrl = new message_1.default();
    // Users
    router.post('/message', auth_1.Authenticate, auth_1.Authorize('user'), messageCtrl.insert);
    router.put('/message/:id', auth_1.Authenticate, auth_1.Authorize('user'), messageCtrl.update);
    router.delete('/message/:id', auth_1.Authenticate, auth_1.Authorize('user'), messageCtrl.delete);
    // Apply the routes to our application with the prefix /api
    app.use('/api', router);
}
exports.default = defineMessageRoutes;
//# sourceMappingURL=message.js.map