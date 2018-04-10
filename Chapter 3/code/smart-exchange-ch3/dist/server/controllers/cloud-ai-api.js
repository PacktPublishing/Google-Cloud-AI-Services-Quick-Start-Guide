"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var fs = require("fs");
var dotenv = require("dotenv");
var cloudinary = require("cloudinary");
var message_1 = require("../models/message");
dotenv.config();
var API_KEY = process.env.GCP_API_KEY;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
var VisionAPI = /** @class */ (function () {
    function VisionAPI() {
        var _this = this;
        this.respondErrorMessage = function (res, err) {
            return res.status(500).json(err);
        };
        this.uploadImage = function (req, res) {
            // console.log('req.file', req.file);
            var filePath = req.file.path;
            _this.base64_encode(filePath).then(function (BASE64_CONTENT) {
                var formData = JSON.stringify({
                    'requests': [
                        {
                            'image': {
                                'content': BASE64_CONTENT
                            },
                            'features': [
                                {
                                    'type': 'LABEL_DETECTION'
                                }, {
                                    'type': 'SAFE_SEARCH_DETECTION'
                                }
                            ]
                        }
                    ]
                });
                var options = {
                    method: 'POST',
                    url: 'https://vision.googleapis.com/v1/images:annotate',
                    qs: {
                        key: "" + API_KEY
                    },
                    body: formData
                };
                request(options, function (error, response, body) {
                    if (error) {
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                        return _this.respondErrorMessage(res, error);
                    }
                    var results = _this.getJSONObject(body);
                    if (!results) {
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                        return _this.respondErrorMessage(res, { 'message': 'Invalid Response from Google Cloud Vision API' });
                    }
                    results = results.responses;
                    var labelAnnotations = results[0].labelAnnotations;
                    var safeSearchAnnotations = results[0].safeSearchAnnotation;
                    if (safeSearchAnnotations.adult === 'POSSIBLE') {
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                        return res.status(400).json({
                            message: 'Adult Content is not allowed'
                        });
                    }
                    if (safeSearchAnnotations.medical === 'POSSIBLE') {
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                        return res.status(400).json({
                            message: 'Medical Content'
                        });
                    }
                    if (safeSearchAnnotations.violence === 'POSSIBLE') {
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                        return res.status(400).json({
                            message: 'Violence Content violence'
                        });
                    }
                    var msg = new message_1.default();
                    msg.thread = req.params.threadId;
                    msg.createdBy = req.user;
                    msg.lastUpdatedBy = req.user;
                    msg.labels = labelAnnotations;
                    msg.safeSearchProps = safeSearchAnnotations;
                    // Upload our image to cloudinary for external file hosting
                    // This is optional & you can use any service for the same
                    cloudinary.uploader.upload(filePath, function (result) {
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                        if (result.error) {
                            return res.status(400).json({
                                message: result.error.message
                            });
                        }
                        msg.cloudinaryProps = result;
                        msg.description = "<img style=\"max-width:80%; height:auto;\" src=\"" + result.secure_url + "\" alt=\"" + result.original_filename + "\">";
                        msg.save(function (err, msg) {
                            if (err) {
                                return _this.respondErrorMessage(res, err);
                            }
                            res.status(200).json(msg);
                        });
                    });
                });
            });
        };
        // Helpers
        // https://stackoverflow.com/a/24526156/1015046
        this.base64_encode = function (filePath) {
            return new Promise(function (res, rej) {
                try {
                    // read binary data
                    var bitmap = fs.readFileSync(filePath);
                    // convert binary data to base64 encoded string
                    var base64String = new Buffer(bitmap).toString('base64');
                    res(base64String);
                }
                catch (e) {
                    rej(e);
                }
            });
        };
        this.getJSONObject = function (jsonStr) {
            try {
                return JSON.parse(jsonStr);
            }
            catch (ex) {
                return false;
            }
        };
        this.deleteFile = function (filePath) {
            fs.unlink(filePath);
        };
    }
    return VisionAPI;
}());
exports.default = VisionAPI;
//# sourceMappingURL=cloud-ai-api.js.map