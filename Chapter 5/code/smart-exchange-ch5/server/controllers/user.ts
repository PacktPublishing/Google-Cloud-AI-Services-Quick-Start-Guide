import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

import { createJWToken } from '../auth';

import User from '../models/user';
import Thread from '../models/thread';
import Message from '../models/message';
import BaseCtrl from './base';

export default class UserCtrl extends BaseCtrl {
  model = User;

  login = (req, res) => {
    this.model.findOne({ email: req.body.email }, (err, user) => {
      if (!user) {
        return res.sendStatus(401);
      }
      user.comparePassword(req.body.password, (error, isMatch) => {
        if (!isMatch) {
          return res.sendStatus(403);
        }

        const token = createJWToken({
          user: user
        });
        res.status(200).json({
          token: token,
          user: user.toJSON()
        });
      });
    });
  }

  delete = (req, res) => {
    this.model.findOneAndRemove({ _id: req.params.id }, (err) => {
      if (err) { return this.respondErrorMessage(res, err); }
      // Also delete the associated threads and messages
      Message.findOneAndRemove({
        createdBy: req.params.id
      }, (err) => {
        if (err) { return this.respondErrorMessage(res, err); }
        Thread.findOneAndRemove({
          createdBy: req.params.id
        }, (err) => {
          if (err) { return this.respondErrorMessage(res, err); }
          res.sendStatus(200);
        });
      });
    });
  }
}
