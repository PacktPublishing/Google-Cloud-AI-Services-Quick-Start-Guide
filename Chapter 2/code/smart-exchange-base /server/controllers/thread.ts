import Thread from '../models/thread';
import Message from '../models/message';
import BaseCtrl from './base';

export default class ThreadCtrl extends BaseCtrl {
  model = Thread;

  // Override insert method to 
  // add createdBy and lastUpdatedBy
  // from req.user
  insert = (req, res) => {
    let thread = req.body;
    thread.createdBy = req.user;
    thread.lastUpdatedBy = req.user;

    const obj = new this.model(thread);
    obj.save((err, item) => {
      // 11000 is the code for duplicate key error
      if (err && err.code === 11000) {
        res.sendStatus(400);
      }
      if (err) {
        return this.respondErrorMessage(res, err);
      }
      res.status(200).json(item);
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

  getAll = (req, res) => {
    this.model.find({})
    .populate('createdBy lastUpdatedBy', 'name email')
    .sort('-lastUpdatedBy')
    .lean()
    .exec((err, docs) => {
      if (err) { return this.respondErrorMessage(res, err); }
      res.status(200).json(docs);
    });
  }

  get = (req, res) => {
    this
      .model
      .findOne({ _id: req.params.id })
      .populate('createdBy lastUpdatedBy', 'name email')
      .lean()
      .exec((err, thread) => {
        if (err) { return this.respondErrorMessage(res, err); }
        Message.find({ thread: thread._id })
          .populate('createdBy lastUpdatedBy', 'name email')
          .lean()
          .exec((err, messages) => {
            if (err) { return this.respondErrorMessage(res, err); }
            thread.messages = messages;
            return res.status(200).json(thread);
          })
      });
  }

}