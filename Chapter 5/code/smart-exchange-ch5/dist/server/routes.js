"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var user_1 = require("./routes/user");
var thread_1 = require("./routes/thread");
var message_1 = require("./routes/message");
var cloud_ai_api_1 = require("./routes/cloud-ai-api");
function setRoutes(app) {
    var router = express.Router();
    user_1.default(app);
    thread_1.default(app);
    message_1.default(app);
    cloud_ai_api_1.default(app);
}
exports.default = setRoutes;
//# sourceMappingURL=routes.js.map