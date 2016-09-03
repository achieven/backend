'use strict'
var Colu = require('colu'),
    express = require('express'),
    http = require('http'),
    socketio = require('socket.io'),
    fs = require('fs'),
    Handlebars = require('handlebars'),
    bodyParser = require('body-parser'),
    request = require('request'),
    util = require('./util/util.js'),
    utilColuFunctions = util.coluCalls,
    utilEncoder = util.encoder;
var async = require('async')


var app = express();
var http = http.Server(app);
var io = socketio(http);

var settings = {
    network: 'testnet',
    privateSeed: undefined//process.env.COLU_SDK_PRIVATE_SEED
};
console.log('privateSeed:', settings.privateSeed)
var colu = new Colu(settings);
colu.init();


colu.on('connect', function () {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({extended: true}));
    app.get('/', function (req, res) {// remove before sending
        
        var html = Handlebars.compile(fs.readFileSync('./index.html', 'utf8'))();
        res.send(html);
    });

    app.get('/assets', function (req, res, next) {
        // next('blah blah')
        utilColuFunctions.getAssets(colu, function (statusAndResponse) {
            res.status(statusAndResponse.code).send(statusAndResponse.response);
        });
    });

    app.put('/issue', function (req, res) {// this function assumes that client sends content-type 'application/json'
        if (!(Object.prototype.toString.call(req.body) === '[object Object]')) {
            res.status(500).send({
                code: 500,
                message: 'no req.body',
                explanation: 'req.body is not defined properly'
            })
        }
        // console.log('***',res)
        // res.send('aaa')
        //console.log('###',res)
        else utilColuFunctions.issueAssets(colu, req.body.assets, function (statusAndResponse) {
            res.status(statusAndResponse.code).send(statusAndResponse.response);
        })
    });

    app.post('/send', function (req, res) {
        if (!(Object.prototype.toString.call(req.body) === '[object Object]')) {
            res.status(500).send({
                code: 500,
                message: 'no req.body',
                explanation: 'req.body is not defined properly'
            })
        }
        else utilColuFunctions.sendAsset(colu, {toAddress: req.body.toAddress, assetId: req.body.assetId, amount: req.body.amount} , function (statusAndResponse) {
            res.status(statusAndResponse.code).send(statusAndResponse.response);
        })
    });


    app.post('/encode', function (req, res) {
        if (!(Object.prototype.toString.call(req.body) === '[object Object]')) {
            res.status(500).send({
                code: 500,
                message: 'no req.body',
                explanation: 'req.body is not defined properly'
            })
        }
        util.encoder.encodeNumber(req.body, function (statusAndResponse) {
            res.status(statusAndResponse.code).send(statusAndResponse.response);
        })
        // util.encoder.encodeNumber(req.body)
        // var number = parseInt(req.body.number);
        // if (number >= 0 && number <= 10000000000000000) {
        //     var encodedNumber = util.encoder.encodeNumber(number);
        //     res.status(200).send(encodedNumber);
        // }
        // else {
        //     res.status(400).send('please supply an integer between 0 and 10000000000000000');
        // }

    });

    var port = process.env.PORT || 3001;
    http.listen(port, function () {
        console.log('listening on ' + port);
    });

})
;

io.on('connection', function (socket) {
    socket.on('/assets', function () {
        util.getAssets(colu, socket, function(){
           
        });
    });
    socket.on('/issue', function (assets) {
        util.issueAssets(colu, socket, assets, function(){
           
        });
    });
    socket.on('/send', function (toAddress, assetId, amount) {
        util.sendAsset(colu, socket, toAddress, assetId, amount, function(){
           
        });
    });
});


// var allFunctions = []
// for(let i=0; i<20;i++){
//     var func = function(callback){
//         for(var j = 0;j< 100000000;j++){}
//         if (Math.random() > 0.5){
//             console.log('success in ' + i)
//             return
//         }
//         callback('error in '+i)
//       
//     }
//     allFunctions.push(func)
// }
//
// var callback = function(err){
//     if(err) {
//         console.log(err)
//         return
//     }
//     console.log('both are finished')
// }
//
//     async.parallel(allFunctions, callback)




