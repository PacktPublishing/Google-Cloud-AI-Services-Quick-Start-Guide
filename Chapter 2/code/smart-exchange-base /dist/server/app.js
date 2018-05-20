"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var bodyParser = require("body-parser");
var dotenv = require("dotenv");
var morgan = require("morgan");
var mongoose = require("mongoose");
var path = require("path");
var cors = require("cors");
var compression = require("compression");
var helmet = require("helmet");
var routes_1 = require("./routes");
var app = express();
exports.app = app;
dotenv.load({ path: '.env' });
app.set('port', (process.env.PORT || 3000));
// Protect the headers
app.use(helmet());
// Add CORS Headers
app.use(cors());
// Compress and spit out the content
app.use(compression());
// Serve docs
app.use('/docs', express.static(path.join(__dirname, '../docs')));
// Serve NG app
app.use('/', express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var mongodbURI;
if (process.env.NODE_ENV === 'test') {
    mongodbURI = process.env.MONGODB_TEST_URI;
}
else {
    mongodbURI = process.env.MONGODB_URI;
    app.use(morgan('dev'));
}
mongoose.Promise = global.Promise;
var mongodb = mongoose.connect(mongodbURI, {
    autoReconnect: true,
    keepAlive: true,
    connectTimeoutMS: 300000,
    socketTimeoutMS: 300000
});
mongodb
    .then(function (db) {
    console.log('Connected to MongoDB');
    routes_1.default(app);
    app.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    if (!module.parent) {
        app.listen(app.get('port'), function () {
            console.log('Smart Exchange listening on port ' + app.get('port'));
        });
    }
})
    .catch(function (err) {
    console.error(err);
});
//# sourceMappingURL=app.js.map