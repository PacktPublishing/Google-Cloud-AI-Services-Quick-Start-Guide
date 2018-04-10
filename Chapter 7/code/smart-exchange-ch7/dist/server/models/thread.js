"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var threadSchema = new Schema({
    title: String,
    description: String,
    tags: [{
            type: Schema.Types.Mixed,
            default: []
        }],
    isPinned: {
        type: Boolean,
        default: false
    },
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
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
var Thread = mongoose.model('Thread', threadSchema);
exports.default = Thread;
//# sourceMappingURL=thread.js.map