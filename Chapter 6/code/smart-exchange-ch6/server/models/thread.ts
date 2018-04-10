import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const threadSchema = new Schema({
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
	lastUpdateAt:{
		type: Date,
		default: Date.now
	},
	lastUpdatedBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
});

const Thread = mongoose.model('Thread', threadSchema);

export default Thread;