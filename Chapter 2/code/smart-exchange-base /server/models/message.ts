import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const messageSchema = new Schema({
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

const Message = mongoose.model('Message', messageSchema);

export default Message;