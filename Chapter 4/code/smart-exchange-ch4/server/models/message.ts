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
	},
	cloudinaryProps: {
		type: Schema.Types.Mixed
	},
	// Related to Vision API
	labels: [{
		type: Schema.Types.Mixed,
		default: []
	}],
	safeSearchProps: {
		type: Schema.Types.Mixed
	},
	// Related to Video Intelligence API
	explicitVideoAnnotation: [{
		type: Schema.Types.Mixed,
		default: []
	}],
	segmentLabelAnnotations: [{
		type: Schema.Types.Mixed,
		default: []
	}]
});

const Message = mongoose.model('Message', messageSchema);

export default Message;