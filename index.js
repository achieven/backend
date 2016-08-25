var Colu = require('colu'),
    express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    fs = require('fs'),
    Handlebars = require('handlebars'),
    bodyParser = require('body-parser'),
    request = require('request'),
    util = require('./util/util.js');

var app = express();
var http = http.Server(app);
var io = socketio(http);

var settings = {
    network: 'testnet',
    privateSeed: null
};
var colu = new Colu(settings);
colu.init();
colu.on('connect', function () {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}));
    app.get('/', function (req, res) {
        var html = Handlebars.compile(fs.readFileSync('./index.html', 'utf8'))();
        res.send(html);
    });
    var sendResponseToClient = function (res, status, response) {   
        res.status(status).send(response);
    }
    app.get('/assets', function (req, res) {
        colu.getAssets(function () {// case of success
            var response = [];
            arguments[1] && arguments[1].forEach(function (asset) {
                response.push(asset.assetId);
                console.log('address: ',asset.address, ' assetId: ', asset.assetId);
                console.log(asset);
            })
            sendResponseToClient(res, 200, response);
        })
    });
    app.put('/issue', function (req, res) {// this function assumes that client sends content-type 'application/json'
        var assets = req.body;
        var response = [];
        assets && assets.forEach(function (asset) {
            colu.issueAsset(asset, function () {
                if (arguments[0] && !arguments[0].code) {// case of err without code
                    sendResponseToClient(res, 400, arguments[0])
                }
                else if (arguments[0] && arguments[0].code != 200) {//case of other status
                    sendResponseToClient(res, arguments[0].code, arguments[0])
                }
                else {//case of success
                    response.push(arguments[1].assetId);
                    if (response.length === assets.length) {
                        //socket.emit('/issue', response);
                        sendResponseToClient(res, 200, response);
                    }
                }
            })
        });
    });

    app.post('/send', function (req, res) {
        console.log(req.body);
        var from = [];
        colu.getAssets(function () {// case of success
            arguments[1] && arguments[1].forEach(function (asset) {
                from.push(asset.address);
            });
            var to = [
                {
                    address: req.body.toAddress,
                    assetId: req.body.assetId,
                    amount: req.body.amount
                }
            ];
            colu.sendAsset({
                from: [from[0]],
                to: to
            }, function(){
                if(arguments[0]){//case of error
                    sendResponseToClient(res, 400, arguments[0])
                }
                else {
                    sendResponseToClient(res, 200, arguments[1].financeTxid);
                }
            })
        });
    });

    app.post('/encode', function(req,res){
        var number = parseInt(req.body.number);
        if(number >= 0 && number <=10000000000000000){
            var encodedNumber = util.encode.encodeNumber(number);
            sendResponseToClient(res, 200, encodedNumber);
        }
        else {
            sendResponseToClient(res, 400, 'please supply an integer between 0 and 10000000000000000');
        }

    });

    var port = process.env.PORT || 3000;
    http.listen(port, function () {
        console.log('listening on ' + port);
    });

});

// io.on('connection', function (socket) {
//     socket.on('/assets', function () {
//         util.getAssets(colu, socket, function(){
//            
//         });
//     });
//     socket.on('/issue', function (assets) {
//         util.issueAssets(colu, socket, assets, function(){
//            
//         });
//     });
//     socket.on('/send', function (toAddress, assetId, amount) {
//         util.sendAsset(colu, socket, toAddress, assetId, amount, function(){
//            
//         });
//     });
// });







