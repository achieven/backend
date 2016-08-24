var Colu = require('colu');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var Handlebars = require('handlebars');


var settings = {
    network: 'testnet'
    //privateSeed: environment variable
};
var colu = new Colu(settings);
colu.init();
colu.on('connect', function () {
    console.log('colu connected');
    app.get('/', function (req, res) {
        var html = Handlebars.compile(fs.readFileSync('./index.html', 'utf8'))();
        res.send(html);
    });
    io.on('connection', function (socket) {
        console.log('a user connected');
        socket.on('/assets', function () {
            console.log('assets server');
        });
        socket.on('/issue', function (assets) {
            console.log('issue server');
        });
        socket.on('/send', function (toAddress, assetId, amount) {
            console.log('send server');
        });
    });
    http.listen(3000, function () {
        console.log('listening on *:3000');
    });
    
});

//
//
// io.of('/start').on('connection', function (socket){
//     console.log(socket);
//     socket.on('/assets', function(){
//         console.log('assets server');
//     });
//     socket.on('/issue', function(assets){
//         console.log('issue server');
//     });
//     socket.on('/send', function(toAddress, assetId, amount){
//         console.log('send server');
//     });
// });
// var colu = new Colu(settings);//assuming for now it is synchronous
// colu.on('connect', function(){
//     console.log('colu connected');
//    
//     // app.listen(3000, function(){
//     //     console.log('listening on port 3000');
//     // });
//     app.use(express.static(__dirname + '/'));
//     app.get('/', function(req,res){
//         var html = Handlebars.compile(fs.readFileSync('./index.html', 'utf8'))();
//         res.send(html);
//     });
//    
// });
// colu.init();




