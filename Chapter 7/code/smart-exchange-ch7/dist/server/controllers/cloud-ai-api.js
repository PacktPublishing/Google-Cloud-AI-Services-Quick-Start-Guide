"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var fs = require("fs");
var dotenv = require("dotenv");
var cloudinary = require("cloudinary");
var message_1 = require("../models/message");
dotenv.config();
var API_KEY = process.env.GCP_API_KEY;
// Setup Video Intelligence Client
var video = require('@google-cloud/video-intelligence').v1;
var client = new video.VideoIntelligenceServiceClient({
    credentials: JSON.parse(process.env.GCP_SK_CREDENTIALS)
});
// Setup Cloud Speech Client
var speech = require('@google-cloud/speech');
var speechClient = new speech.SpeechClient({
    credentials: JSON.parse(process.env.GCP_SK_CREDENTIALS)
});
// Setup Natural Language API
var language = require('@google-cloud/language');
var nlpClient = new language.LanguageServiceClient({
    credentials: JSON.parse(process.env.GCP_SK_CREDENTIALS)
});
// Setup Translation API
var Translate = require('@google-cloud/translate');
var translateClient = new Translate({
    credentials: JSON.parse(process.env.GCP_SK_CREDENTIALS)
});
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
var CloudAIAPI = /** @class */ (function () {
    function CloudAIAPI() {
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
        this.uploadVideo = function (req, res) {
            // console.log('req.file', req.file);
            var filePath = req.file.path;
            _this.base64_encode(filePath).then(function (BASE64_CONTENT) {
                var request = {
                    inputContent: BASE64_CONTENT,
                    features: ['EXPLICIT_CONTENT_DETECTION', 'LABEL_DETECTION']
                };
                client
                    .annotateVideo(request)
                    .then(function (results) {
                    var operation = results[0];
                    console.log('Waiting for operation to complete...');
                    return operation.promise();
                })
                    .then(function (results) {
                    // Gets annotations for video
                    var annotations = results[0].annotationResults[0];
                    var explicitContentResults = annotations.explicitAnnotation;
                    var segmentLabelAnnotations = annotations.segmentLabelAnnotations;
                    // console.log(JSON.stringify(annotations, null, 4));
                    var isExplicit = false;
                    var explictLabels = [];
                    if (explicitContentResults) {
                        explicitContentResults.frames.forEach(function (result) {
                            var o = {};
                            // console.log('result', JSON.stringify(result, null, 4));
                            o.timeOffset = result.timeOffset;
                            o.pornographyLikelihood = result.pornographyLikelihood;
                            explictLabels.push(JSON.parse(JSON.stringify(o)));
                            if (result.pornographyLikelihood > 2)
                                isExplicit = true;
                        });
                    }
                    var segmentLabels = [];
                    if (segmentLabelAnnotations) {
                        segmentLabelAnnotations.forEach(function (label) {
                            var o = {};
                            // console.log('label', JSON.stringify(label, null, 4));
                            o.entity = label.entity;
                            o.categoryEntities = label.categoryEntities;
                            o.segments = label.segments; // array
                            segmentLabels.push(JSON.parse(JSON.stringify(o)));
                        });
                    }
                    if (isExplicit) {
                        _this.deleteFile(filePath);
                        return res.status(400).json({
                            message: 'Adult Content is not allowed'
                        });
                    }
                    // Upload our video to cloudinary for external file hosting
                    // This is optional & you can use any service for the same
                    cloudinary.v2.uploader.upload(filePath, {
                        resource_type: 'video'
                    }, function (error, result) {
                        // console.log('result: ', result);
                        // console.log('error', error);
                        if (error) {
                            return res.status(400).json({
                                message: error.message
                            });
                        }
                        var msg = {};
                        msg.thread = req.params.threadId;
                        msg.createdBy = req.user;
                        msg.lastUpdatedBy = req.user;
                        msg.explicitVideoAnnotation = explictLabels;
                        msg.segmentLabelAnnotations = segmentLabels;
                        msg.cloudinaryProps = result;
                        msg.description = "<div align=\"center\" class=\"embed-responsive embed-responsive-16by9\">\n\t\t\t\t\t\t\t<video loop class=\"embed-responsive-item\" controls>\n\t\t\t\t\t\t\t\t<source src=\"" + result.secure_url + "\">\n\t\t\t\t\t\t\t\tYour browser does not support the video tag.\n\t\t\t\t\t\t\t</video>\n\t\t\t\t\t\t</div>";
                        // console.log('msg', JSON.stringify(msg, null, 4));
                        var message = new message_1.default(msg);
                        message.save(function (err, msg) {
                            if (err) {
                                console.log(err);
                                return _this.respondErrorMessage(res, err);
                            }
                            res.status(200).json(msg);
                        });
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                    });
                })
                    .catch(function (err) {
                    console.error('ERROR:', err);
                    return res.status(500).json(err);
                });
            });
        };
        this.uploadAudio = function (req, res) {
            var filePath = req.file.path;
            _this.base64_encode(filePath).then(function (BASE64_CONTENT) {
                var config = {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 44100,
                    languageCode: 'en-us',
                };
                var audio = {
                    content: BASE64_CONTENT
                };
                var request = {
                    config: config,
                    audio: audio,
                };
                speechClient
                    .recognize(request)
                    .then(function (data) {
                    // console.log('data', JSON.stringify(data, null, 4));
                    var transcriptions = [];
                    var response = data[0];
                    response.results.forEach(function (result) {
                        var o = {};
                        // You can get other alternatives as well
                        o.transcript = result.alternatives[0].transcript;
                        o.words = result.alternatives[0].words;
                        o.confidence = result.alternatives[0].confidence;
                        transcriptions.push(o);
                    });
                    // Upload our audio to cloudinary for external file hosting
                    // This is optional & you can use any service for the same
                    cloudinary.v2.uploader.upload(filePath, {
                        resource_type: 'auto'
                    }, function (error, result) {
                        // console.log('result: ', result);
                        // console.log('error', error);
                        if (error) {
                            return res.status(400).json({
                                message: error.message
                            });
                        }
                        var msg = {};
                        msg.thread = req.params.threadId;
                        msg.createdBy = req.user;
                        msg.lastUpdatedBy = req.user;
                        msg.transcriptions = transcriptions;
                        msg.cloudinaryProps = result;
                        msg.description = "<div align=\"center\" class=\"embed-responsive-16by9\">\n\t\t\t\t\t\t\t<audio class=\"embed-responsive-item\" controls>\n\t\t\t\t\t\t\t\t<source src=\"" + result.secure_url + "\">\n\t\t\t\t\t\t\t\tYour browser does not support the audio tag.\n\t\t\t\t\t\t\t</audio>\n\t\t\t\t\t\t</div>";
                        console.log('msg', JSON.stringify(msg, null, 4));
                        var message = new message_1.default(msg);
                        message.save(function (err, msg) {
                            if (err) {
                                console.log(err);
                                return _this.respondErrorMessage(res, err);
                            }
                            res.status(200).json(msg);
                        });
                        // Delete the local file so we don't clutter
                        _this.deleteFile(filePath);
                    });
                })
                    .catch(function (err) {
                    console.error('ERROR:', err);
                    return res.status(500).json(err);
                });
            });
        };
        this.postMessage = function (req, res) {
            var msg = req.body;
            msg.createdBy = req.user;
            msg.lastUpdatedBy = req.user;
            var request = {
                encodingType: 'UTF8',
                document: {
                    content: msg.description,
                    type: 'PLAIN_TEXT'
                },
                features: {
                    extractSyntax: true,
                    extractEntities: true,
                    extractDocumentSentiment: true,
                    extractEntitySentiment: true,
                    classifyText: true
                }
            };
            nlpClient.annotateText(request)
                .then(function (results) {
                var result = results[0];
                // console.log(JSON.stringify(results, null, 4));
                msg.nlpCategories = result.categories;
                msg.nlpTokens = result.tokens;
                msg.nlpEntities = result.entities;
                msg.nlpDocumentSentiment = result.documentSentiment;
                msg.nlpLanguage = result.language;
                msg.nlpSentences = result.sentences;
                var message = new message_1.default(msg);
                message.save(function (err, msg) {
                    if (err) {
                        console.log(err);
                        return _this.respondErrorMessage(res, err);
                    }
                    res.status(200).json(msg);
                });
            })
                .catch(function (err) {
                console.error('ERROR:', err);
                return res.status(500).json(err);
            });
        };
        this.SupportedLanguagesCache = [];
        this.getSupportedLanguages = function (req, res) {
            if (_this.SupportedLanguagesCache.length > 0) {
                return res.status(200).json(_this.SupportedLanguagesCache);
            }
            else {
                translateClient
                    .getLanguages()
                    .then(function (results) {
                    var languages = results[0];
                    _this.SupportedLanguagesCache = languages;
                    return res.status(200).json(languages);
                })
                    .catch(function (err) {
                    console.error('ERROR:', err);
                    return res.status(500).json(err);
                });
            }
        };
        this.translateMessage = function (req, res) {
            var message = req.body;
            // let msgId = message._id;
            // delete message._id;
            var targetLang = req.params.target;
            translateClient
                .translate(message.description, targetLang)
                .then(function (results) {
                var translations = results[0];
                translations = Array.isArray(translations)
                    ? translations
                    : [translations];
                // console.log('Translations:');
                translations.forEach(function (translation, i) {
                    message.translations[targetLang] = translation;
                    // console.log(`${message.description[i]} => (${targetLang}) ${translation}`);
                });
                // console.log(JSON.stringify(message, null, 4));
                message_1.default.findOneAndUpdate({
                    _id: message._id
                }, message, function (err) {
                    if (err) {
                        return _this.respondErrorMessage(res, err);
                    }
                    return res.json(message);
                });
            })
                .catch(function (err) {
                console.error('ERROR:', err);
                return res.status(500).json(err);
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
    return CloudAIAPI;
}());
exports.default = CloudAIAPI;
//# sourceMappingURL=cloud-ai-api.js.map