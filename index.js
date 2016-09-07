'use strict'
var Colu = require('colu'),
    express = require('express'),
    http = require('http'),
    fs = require('fs'),
    Handlebars = require('handlebars'),
    bodyParser = require('body-parser'),
    util = require('./util/util.js'),
    utilColuFunctions = util.processRequests.coluCalls,
    utilEncoder = util.processRequests.encoder;


var app = express();
var http = http.Server(app);

var settings = {
    network: 'testnet',
    privateSeed: process.env.COLU_SDK_PRIVATE_SEED
};
var colu = new Colu(settings);
colu.init();



colu.on('connect', function () {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}));
    app.get('/', function (req, res) {
        var html = Handlebars.compile(fs.readFileSync('./index.html', 'utf8'))();
        res.send(html);
    })

    function validateBody(req, res) {
        if (!(Object.prototype.toString.call(req.body) === '[object Object]')) {
            res.status(500).send({
                code: 500,
                message: 'no req.body',
                explanation: 'req.body is not defined properly'
            })
            return true
        }
    }

    function sendResponse(res, statusAndResponse) {
        res.status(statusAndResponse.code).send(statusAndResponse.response);
        return statusAndResponse
    }

    app.get('/assets', function (req, res, next) {
        utilColuFunctions.getAssets(colu, function(statusAndResponse){
            return sendResponse(res, statusAndResponse)
        });
    });

    app.put('/issue', function (req, res) {// this function assumes that client sends content-type 'application/json'
        if(!validateBody(req, res)) {
            utilColuFunctions.issueAssets(colu, req.body.assets, function (statusAndResponse) {
                return sendResponse(res, statusAndResponse)
            })
        }
    });

    app.post('/send', function (req, res) {
        if(!validateBody(req, res)) {
            utilColuFunctions.sendAsset(colu, {
                toAddress: req.body.toAddress,
                assetId: req.body.assetId,
                amount: req.body.amount
            }, function (statusAndResponse) {
                return sendResponse(res, statusAndResponse)
            })
        }
    });


    app.post('/encode', function (req, res) {
        if(!validateBody(req, res)) {
            utilEncoder.encodeNumber(req.body.number, function (statusAndResponse) {
                return sendResponse(res, statusAndResponse)
            })
        }
    });

    var port = process.env.PORT || 3001;
    http.listen(port, function () {
        console.log('listening on ' + port);
    });
})





