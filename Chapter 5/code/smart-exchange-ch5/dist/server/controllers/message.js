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
var message_1 = require("../models/message");
var base_1 = require("./base");
var MessageCtrl = /** @class */ (function (_super) {
    __extends(MessageCtrl, _super);
    function MessageCtrl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.model = message_1.default;
        // Override insert method to 
        // add createdBy and lastUpdatedBy
        // from req.user
        _this.insert = function (req, res) {
            var thread = req.body;
            thread.createdBy = req.user;
            thread.lastUpdatedBy = req.user;
            var obj = new _this.model(thread);
            obj.save(function (err, message) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.status(200).json(message);
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
        return _this;
    }
    return MessageCtrl;
}(base_1.default));
exports.default = MessageCtrl;
//# sourceMappingURL=message.js.map