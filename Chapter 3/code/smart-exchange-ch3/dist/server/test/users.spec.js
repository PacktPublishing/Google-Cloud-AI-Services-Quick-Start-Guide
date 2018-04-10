"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var chaiHttp = require("chai-http");
process.env.NODE_ENV = 'test';
var app_1 = require("../app");
var user_1 = require("../models/user");
var should = chai.use(chaiHttp).should();
describe('Users', function () {
    beforeEach(function (done) {
        user_1.default.remove({}, function (err) {
            done();
        });
    });
    describe('Backend tests for users', function () {
        it('should get all the users', function (done) {
            chai.request(app_1.app)
                .get('/api/users')
                .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
                done();
            });
        });
        it('should get users count', function (done) {
            chai.request(app_1.app)
                .get('/api/users/count')
                .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('number');
                res.body.should.be.eql(0);
                done();
            });
        });
        it('should create new user', function (done) {
            var user = new user_1.default({ username: 'Dave', email: 'dave@example.com', role: 'user' });
            chai.request(app_1.app)
                .post('/api/user')
                .send(user)
                .end(function (err, res) {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.a.property('username');
                res.body.should.have.a.property('email');
                res.body.should.have.a.property('role');
                done();
            });
        });
        it('should get a user by its id', function (done) {
            var user = new user_1.default({ username: 'User', email: 'user@example.com', role: 'user' });
            user.save(function (error, newUser) {
                chai.request(app_1.app)
                    .get("/api/user/" + newUser.id)
                    .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('username');
                    res.body.should.have.property('email');
                    res.body.should.have.property('role');
                    res.body.should.have.property('_id').eql(newUser.id);
                    done();
                });
            });
        });
        it('should update a user by its id', function (done) {
            var user = new user_1.default({ username: 'User', email: 'user@example.com', role: 'user' });
            user.save(function (error, newUser) {
                chai.request(app_1.app)
                    .put("/api/user/" + newUser.id)
                    .send({ username: 'User 2' })
                    .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
            });
        });
        it('should delete a user by its id', function (done) {
            var user = new user_1.default({ username: 'User', email: 'user@example.com', role: 'user' });
            user.save(function (error, newUser) {
                chai.request(app_1.app)
                    .delete("/api/user/" + newUser.id)
                    .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
            });
        });
    });
});
//# sourceMappingURL=users.spec.js.map