import Message from '../models/message';
import BaseCtrl from './base';

export default class MessageCtrl extends BaseCtrl {
	model = Message;

	// Override insert method to 
	// add createdBy and lastUpdatedBy
	// from req.user
	insert = (req, res) => {
		let thread = req.body;
		thread.createdBy = req.user;
		thread.lastUpdatedBy = req.user;

		const obj = new this.model(thread);
		obj.save((err, message) => {
			if (err) {
				return this.respondErrorMessage(res, err);
			}
			res.status(200).json(message);
		});
	}

	// Override update method to 
	// add lastUpdatedBy
	// from req.user
	update = (req, res) => {
		let thread = req.body;
		thread.lastUpdatedBy = req.user;

		this.model.findOneAndUpdate({ _id: req.params.id }, thread, (err) => {
			if (err) { return this.respondErrorMessage(res, err); }
			res.sendStatus(200);
		});
	}
}