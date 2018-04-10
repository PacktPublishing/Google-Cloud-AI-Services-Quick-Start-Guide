"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var thread_1 = require("../controllers/thread");
var auth_1 = require("../auth");
function defineThreadRoutes(app) {
    var router = express.Router();
    var threadCtrl = new thread_1.default();
    // Users
    router.get('/threads', threadCtrl.getAll);
    router.get('/threads/count', threadCtrl.count);
    router.post('/thread', auth_1.Authenticate, auth_1.Authorize('user'), threadCtrl.insert);
    router.get('/thread/:id', threadCtrl.get);
    router.put('/thread/:id', auth_1.Authenticate, auth_1.Authorize('user'), threadCtrl.update);
    router.delete('/thread/:id', auth_1.Authenticate, auth_1.Authorize('user'), threadCtrl.delete);
    // Apply the routes to our application with the prefix /api
    app.use('/api', router);
}
exports.default = defineThreadRoutes;
//# sourceMappingURL=thread.js.map