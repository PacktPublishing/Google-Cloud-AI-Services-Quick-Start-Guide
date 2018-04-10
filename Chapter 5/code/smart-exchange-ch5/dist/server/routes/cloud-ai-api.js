"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var multer = require("multer");
var UPLOAD_PATH = __dirname + '/../uploads';
var upload = multer({ dest: UPLOAD_PATH + "/" });
var auth_1 = require("../auth");
var cloud_ai_api_1 = require("../controllers/cloud-ai-api");
function defineCloudAIAPIRoutes(app) {
    var router = express.Router();
    var cloudAIAPI = new cloud_ai_api_1.default();
    // Upload Single Images
    router.post('/upload-image/:threadId', auth_1.Authenticate, auth_1.Authorize('user'), upload.single('image-reply'), cloudAIAPI.uploadImage);
    // Upload Single Video
    router.post('/upload-video/:threadId', auth_1.Authenticate, auth_1.Authorize('user'), upload.single('video-reply'), cloudAIAPI.uploadVideo);
    // Upload Single Audio
    router.post('/upload-audio/:threadId', auth_1.Authenticate, auth_1.Authorize('user'), upload.single('audio-reply'), cloudAIAPI.uploadAudio);
    // Apply the routes to our application with the prefix /api
    app.use('/api', router);
}
exports.default = defineCloudAIAPIRoutes;
//# sourceMappingURL=cloud-ai-api.js.map