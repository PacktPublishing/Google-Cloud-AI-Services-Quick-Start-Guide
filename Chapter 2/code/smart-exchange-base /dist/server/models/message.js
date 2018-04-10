"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var messageSchema = new Schema({
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: Number,
        default: 0
    },
    thread: {
        type: Schema.Types.ObjectId,
        ref: 'Thread'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdateAt: {
        type: Date,
        default: Date.now
    },
    lastUpdatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});
var Message = mongoose.model('Message', messageSchema);
exports.default = Message;
//# sourceMappingURL=message.js.map