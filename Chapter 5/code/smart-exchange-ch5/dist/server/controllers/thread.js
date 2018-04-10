"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var thread_1 = require("../models/thread");
var message_1 = require("../models/message");
var base_1 = require("./base");
var ThreadCtrl = /** @class */ (function (_super) {
    __extends(ThreadCtrl, _super);
    function ThreadCtrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.model = thread_1.default;
        // Override insert method to 
        // add createdBy and lastUpdatedBy
        // from req.user
        _this.insert = function (req, res) {
            var thread = req.body;
            thread.createdBy = req.user;
            thread.lastUpdatedBy = req.user;
            var obj = new _this.model(thread);
            obj.save(function (err, item) {
                // 11000 is the code for duplicate key error
                if (err && err.code === 11000) {
                    res.sendStatus(400);
                }
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.status(200).json(item);
            });
        };
        // Override update method to 
        // add lastUpdatedBy
        // from req.user
        _this.update = function (req, res) {
            var thread = req.body;
            thread.lastUpdatedBy = req.user;
            _this.model.findOneAndUpdate({ _id: req.params.id }, thread, function (err) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.sendStatus(200);
            });
        };
        _this.getAll = function (req, res) {
            _this.model.find({})
                .populate('createdBy lastUpdatedBy', 'name email')
                .sort('-lastUpdatedBy')
                .lean()
                .exec(function (err, docs) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.status(200).json(docs);
            });
        };
        _this.get = function (req, res) {
            _this
                .model
                .findOne({ _id: req.params.id })
                .populate('createdBy lastUpdatedBy', 'name email')
                .lean()
                .exec(function (err, thread) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                message_1.default.find({ thread: thread._id })
                    .populate('createdBy lastUpdatedBy', 'name email')
                    .lean()
                    .exec(function (err, messages) {
                    if (err) {
                        return _this.respondErrorMessage(res, err);
                    }
                    thread.messages = messages;
                    return res.status(200).json(thread);
                });
            });
        };
        return _this;
    }
    return ThreadCtrl;
}(base_1.default));
exports.default = ThreadCtrl;
//# sourceMappingURL=thread.js.map