"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseCtrl = /** @class */ (function () {
    function BaseCtrl() {
        var _this = this;
        this.respondErrorMessage = function (res, err) {
            return res.status(500).json(err);
        };
        // Get all
        this.getAll = function (req, res) {
            _this.model.find({}, function (err, docs) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.status(200).json(docs);
            });
        };
        // Count all
        this.count = function (req, res) {
            _this.model.count(function (err, count) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.status(200).json(count);
            });
        };
        // Insert
        this.insert = function (req, res) {
            var obj = new _this.model(req.body);
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
        // Get by id
        this.get = function (req, res) {
            _this.model.findOne({ _id: req.params.id }, function (err, item) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.status(200).json(item);
            });
        };
        // Update by id
        this.update = function (req, res) {
            _this.model.findOneAndUpdate({ _id: req.params.id }, req.body, function (err) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.sendStatus(200);
            });
        };
        // Delete by id
        this.delete = function (req, res) {
            _this.model.findOneAndRemove({ _id: req.params.id }, function (err) {
                if (err) {
                    return _this.respondErrorMessage(res, err);
                }
                res.sendStatus(200);
            });
        };
    }
    return BaseCtrl;
}());
exports.default = BaseCtrl;
//# sourceMappingURL=base.js.map