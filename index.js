var Colu = require('colu'),
    express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    fs = require('fs'),
    Handlebars = require('handlebars'),
    bodyParser = require('body-parser'),
    request = require('request'),
    async = require('async'),
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
    };
    var sendErrorToClient = function (err, res) {
        if (err.code) {
            sendResponseToClient(res, err.code, err);
        }
        else {
            sendResponseToClient(res, 500, err);
        }
    };
    app.get('/assets', function (req, res) {
        colu.getAssets(function (err, assets) {// case of success
            if (err) {
                sendErrorToClient(err, res);
            }
            else {
                var response = [];
                assets && assets.forEach(function (asset) {
                    response.push(asset.assetId);
                });
                sendResponseToClient(res, 200, response);
            }
        })
    });
    app.put('/issue', function (req, res) {// this function assumes that client sends content-type 'application/json'
        var inputAssets = req.body;
        var assetsIds = [];
        var errors = [];
        inputAssets.forEach(function (asset) {//doesn't maintain order of insertion, only solution to this so far is making it synchronous - not good
            assetToIssue = {
                amount: asset.amount,
                metadata: {
                    assetName: asset.assetName
                }
            }
            colu.issueAsset(assetToIssue, function (err, assetObject) {
                if (err) {
                    //sendErrorToClient(err, res);
                    errors.push(err);
                }
                else {
                    assetsIds.push(assetObject.assetId);
                    if (assetsIds.length + errors.length === inputAssets.length) {
                        var assetNamesAndIds = []
                        assetsIds.forEach(function(assetId){
                            var getAssetDataErrors = 0;
                            colu.coloredCoins.getAssetData({assetId: assetId}, function(err, assetData){// this is to maitain the order
                                if(err){
                                    getAssetDataErrors++;
                                    errors.push(err)
                                }
                                else{
                                    assetNamesAndIds.push({assetId: assetData.assetId, assetName: assetData.assetData[0].metadata.metadataOfIssuence.data.assetName});
                                    if(assetNamesAndIds.length + getAssetDataErrors === assetsIds.length){
                                        console.log(assetNamesAndIds)
                                        var response = [];
                                        inputAssets.forEach(function(asset){
                                            assetNamesAndIds.forEach(function(assetNameAndId){//change to object??
                                                if(asset.assetName === assetNameAndId.assetName){
                                                    response.push(asset.assetName);
                                                }
                                            });
                                        });
                                        console.log(response);
                                        
                                    }
                                }
                            })
                        })

                    }
                }
            })
        })
    });
// function issueAsset(index) {
//     colu.issueAsset(assets[index], function (err, assetObject) {
//         if (err) {
//             errs.push(err);
//         }
//         else {
//             console.log(assetObject)
//             response.push(assetObject.assetId);
//         }
//         if(index === assets.length-1){
//             if(errs.length > 0){
//                 console.log(errs)
//                 sendErrorToClient(errs, res);
//             }
//             else {
//                 sendResponseToClient(res, 200, response);
//             }
//         }
//         else {
//             index++;
//             issueAsset(index);
//         }
//     });
// }

    app.post('/send', function (req, res) {
        colu.getAssets(function (err, assets) {
            var from = [];
            if (err) {
                sendErrorToClient(err, sendResponseToClient, res);
            }
            else {
                assets && assets.forEach(function (asset) {
                    from.push(asset.address);
                });
            }
            var to = [
                {
                    address: req.body.toAddress,
                    assetId: req.body.assetId,
                    amount: req.body.amount
                }
            ];
            var args = {from: from, to: to};
            colu.sendAsset(args, function (err, financeTxid) {
                if (err) {
                    sendErrorToClient(err, res);
                }
                else {
                    sendResponseToClient(res, 200, financeTxid);
                }
            })
        });
    });


    app.post('/encode', function (req, res) {
        var number = parseInt(req.body.number);
        if (number >= 0 && number <= 10000000000000000) {
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

})
;

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







