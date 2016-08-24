var Colu = require('colu'),
    express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    fs = require('fs'),
    Handlebars = require('handlebars'),
    util = require('./util/util.js');

var app = express();
var http = http.Server(app);
var io = socketio(http);

var settings = {
    network: 'testnet'
    //privateSeed: environment variable
};
var colu = new Colu(settings);
colu.init();
colu.on('connect', function () {
    app.get('/', function (req, res) {
        var html = Handlebars.compile(fs.readFileSync('./index.html', 'utf8'))();
        res.send(html);
    });
    io.on('connection', function (socket) {
        socket.on('/assets', function () {
            util.getAssets();
        });
        socket.on('/issue', function (assets) {
            util.issueAssets();
        });
        socket.on('/send', function (toAddress, assetId, amount) {
            util.sendAsset();
        });
    });
    http.listen(3000, function () {
        console.log('listening on *:3000');
    });

});






