var util = require('../util/util.js');
var assert = require('assert');
var Colu = require('colu');
var settings = {
    network: 'testnet'
    //privateSeed: environment variable
};
var colu = new Colu(settings);
colu.init();
colu.on('connect', function(){
    console.log('asdasfdasdfafsa')
})
// describe('getAssets', function () {
//     it('should return empty array when no assets', function () {
//         assert.equal(util.getAssets(), 1);
//     });
// });
// describe('issueAssets', function () {
//     var response = util.issueAssets(colu, [
//         {
//             assetName: 'achi',
//             amount: 100
//         }
//     ]);
//     assert.equal(response.length, 2)
//
// });
// describe('sendAsset', function () {
//     it('blah blah blah', function () {
//         assert.equal(util.sendAsset(), 3);
//     });
// });







