/* eslint-env mocha */
var validationErrorMessage = 'Validation error';
var validationErrorCode = 400
var Colu = require('colu')
var testUtils = require('colu/test/test-utils.js')
var expect = require('chai').expect
var util = require('../util/util.js')

describe('Test utilColuFunctions', function () {

    var colu
    var utilColuFunctions = util.coluCalls

    before(function (done) {/// error something with 2000
        this.timeout(10000)
        var settings = {
            network: 'testnet',
            events: true,
            eventsSecure: true
        }
        colu = new Colu(settings)
        colu.on('connect', done)
        colu.init()
    })
    describe('getAssets', function () {
        it('Should return an empty list of assets when no assets have been issued, with status 200', function (done) {
            this.timeout(5000)
            utilColuFunctions.getAssets(colu, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(200);
                expect(statusAndResponse.response).to.be.a('array');
                expect(statusAndResponse.response.length).to.be.equal(0);
                done()
            })
        })
        it('Should return the list of assets ids when they were issued, with status 200', function (done) {
            this.timeout(20000)
            colu.issueAsset({amount: 1}, function (err, firstAsset) {
                colu.issueAsset({amount: 1}, function (err, secondAsset) {
                    utilColuFunctions.getAssets(colu, function (statusAndResponse) {
                        expect(statusAndResponse).to.be.a('object');
                        expect(statusAndResponse.code).to.be.equal(200);
                        expect(statusAndResponse.response).to.be.a('array');
                        expect(statusAndResponse.response.length).to.be.equal(2);
                        expect(statusAndResponse.response).to.include(firstAsset.assetId);
                        expect(statusAndResponse.response).to.include(secondAsset.assetId);
                        done()
                    })
                })
            })
        })
    });

    describe('issueAssets', function () {
        var correctAssetToIssue = {amount: 100, assetName: 'achi'}
        it('should return error 400 saying "input assets is not an array" when it is not an array', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, undefined, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets is not an array')
                utilColuFunctions.issueAssets(colu, null, function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(400);
                    expect(statusAndResponse.response).to.be.a('object');
                    expect(statusAndResponse.response.code).to.be.equal(400);
                    expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                    expect(statusAndResponse.response.explanation).to.equal('input assets is not an array')
                    utilColuFunctions.issueAssets(colu, {}, function (statusAndResponse) {
                        expect(statusAndResponse).to.be.a('object');
                        expect(statusAndResponse.code).to.be.equal(400);
                        expect(statusAndResponse.response).to.be.a('object');
                        expect(statusAndResponse.response.code).to.be.equal(400);
                        expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                        expect(statusAndResponse.response.explanation).to.equal('input assets is not an array')
                        utilColuFunctions.issueAssets(colu, true, function (statusAndResponse) {
                            expect(statusAndResponse).to.be.a('object');
                            expect(statusAndResponse.code).to.be.equal(400);
                            expect(statusAndResponse.response).to.be.a('object');
                            expect(statusAndResponse.response.code).to.be.equal(400);
                            expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                            expect(statusAndResponse.response.explanation).to.equal('input assets is not an array')
                            utilColuFunctions.issueAssets(colu, 'hello', function (statusAndResponse) {
                                expect(statusAndResponse).to.be.a('object');
                                expect(statusAndResponse.code).to.be.equal(400);
                                expect(statusAndResponse.response).to.be.a('object');
                                expect(statusAndResponse.response.code).to.be.equal(400);
                                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                                expect(statusAndResponse.response.explanation).to.equal('input assets is not an array')
                                utilColuFunctions.issueAssets(colu, Symbol(), function (statusAndResponse) {
                                    expect(statusAndResponse).to.be.a('object');
                                    expect(statusAndResponse.code).to.be.equal(400);
                                    expect(statusAndResponse.response).to.be.a('object');
                                    expect(statusAndResponse.response.code).to.be.equal(400);
                                    expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                                    expect(statusAndResponse.response.explanation).to.equal('input assets is not an array')
                                    done()
                                })
                            })
                        })
                    })
                })
            })
        })
        it('should return error 400 saying "input assets has length of 0, there is nothing to issue" when array is with length 0', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, [], function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets has length of 0, there is nothing to issue')
                done()
            })
        })
        it('should return error 400 saying "input assets at <index> is not an object" when one of the assets to be issued is not a json', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, [correctAssetToIssue, 1], function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets at 1 is not an Object')
                done()
            })
        })
        it('should return an error 400 saying "input assets at <index> amount is not specified" when amount is not declared', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {ammountIsWrittenWithOneM: 100}], function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount is not specified')
                done()
            })
        })
        it('should return an error 400 saying "input assets at <index>,  amount should be an integer between 1 and (2^54)-2" when amount is not an integer or a string that represents an integer', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: 1.2}], function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount should be an integer between 1 and (2^54)-2')
                utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: "1.2"}], function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(400);
                    expect(statusAndResponse.response).to.be.a('object');
                    expect(statusAndResponse.response.code).to.be.equal(400);
                    expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                    expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount should be an integer between 1 and (2^54)-2')
                    done()
                })
            })
        })
        it('should return an error 400 saying "input assets at <index>,  amount should be an integer between 1 and (2^54)-2" when amount is not between 1 and (2^54)-2', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: 0}], function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount should be an integer between 1 and (2^54)-2')
                utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: Math.pow(2, 54) - 1}], function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(400);
                    expect(statusAndResponse.response).to.be.a('object');
                    expect(statusAndResponse.response.code).to.be.equal(400);
                    expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                    expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount should be an integer between 1 and (2^54)-2')
                    done()
                })
            })
        })
        it('should return success when amount is an integer between 1 and (2^54)-2', function (done) {
            this.timeout(60000)
            var inputAssets = [{assetName: 'a', amount: Math.pow(2, 54) - 2}]
            utilColuFunctions.issueAssets(colu, inputAssets, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(200);
                expect(statusAndResponse.response).to.be.a('array');
                expect(statusAndResponse.response.length).to.be.equal(1)
                expect(statusAndResponse.response[0]).to.be.a('string')
                expect(statusAndResponse.response[0].length).to.be.equal(38)
                expect(statusAndResponse.response[0].indexOf(' ')).to.be.equal(-1)
                done()
            })
        })

        it('should return an array with different assetsIds and same order as input and status 200 when amount is declared and names are different', function (done) {
            this.timeout(90000);
            var inputAssets = [{assetName: 'a', amount: 100}, {assetName: 'b', amount: 100}, {
                assetName: 'c',
                amount: 100
            }]
            utilColuFunctions.issueAssets(colu, inputAssets, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(200);
                expect(statusAndResponse.response).to.be.a('array');
                expect(statusAndResponse.response.length).to.be.equal(3);
                var finishedGettingAssetData = 0
                statusAndResponse.response.forEach(function (assetId, index) {
                    colu.coloredCoins.getAssetData({assetId: assetId}, function (err, assetData) {
                        finishedGettingAssetData++
                        if (!err) {
                            expect(assetData.assetData[0].metadata.metadataOfIssuence.data.assetName).to.be.equal(inputAssets[index].assetName)
                        }
                        if (finishedGettingAssetData === inputAssets.length) {
                            done()
                        }
                    })
                })

            })
        })
        it('should return an array with distinct assetsIds and same order as input and status 200 when amount is declared and names are same or not declared', function (done) {// not doing anything!!!!
            this.timeout(100000);
            var inputAssets = [{assetName: 'a', amount: 100}, {assetName: 'a', amount: 200}, {
                assetName: 'a',
                amount: 300
            }]
            utilColuFunctions.issueAssets(colu, inputAssets, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(200);
                expect(statusAndResponse.response).to.be.a('array');
                expect(statusAndResponse.response.length).to.be.equal(3);
                var finishedGettingAssetData = 0
                statusAndResponse.response.forEach(function (assetId, index) {
                    colu.coloredCoins.getAssetData({assetId: assetId}, function (err, assetData) {
                        finishedGettingAssetData++
                        if (!err) {
                            expect(assetData.assetData[0].metadata.metadataOfIssuence.data.assetName).to.be.equal(inputAssets[index].assetName)
                        }
                        if (finishedGettingAssetData === inputAssets.length) {
                            done()
                        }
                    })
                })
            })
        })
        it('should return an array with errors and assets ids with same order as input when some have errors', function (done) {
            this.timeout(100000);
            var inputAssetsReadyForAction = [{metadata: {assetName: 'a'}, amount: 100}, {
                metadata: {assetName: 'b'},
                amount: -1
            }, {metadata: {assetName: 'c'}, amount: 300}]
            utilColuFunctions.validateIssueAssets = function () {
                return {
                    inputAssetsReadyForAction: inputAssetsReadyForAction
                }
            }
            utilColuFunctions.issueAssets(colu, inputAssetsReadyForAction, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(500);
                expect(statusAndResponse.response).to.be.a('array');
                expect(statusAndResponse.response.length).to.be.equal(3);
                var finishedGettingAssetData = 0
                statusAndResponse.response.forEach(function (responseOfIssuingAsset, index) {
                    if (index != 1) {
                        colu.coloredCoins.getAssetData({assetId: responseOfIssuingAsset}, function (err, assetData) {
                            finishedGettingAssetData++
                            expect(assetData.assetData[0].metadata.metadataOfIssuence.data.assetName).to.be.equal(inputAssetsReadyForAction[index].metadata.assetName)
                            if (finishedGettingAssetData === inputAssetsReadyForAction.length) {
                                done()
                            }
                        })
                    }
                    else {
                        finishedGettingAssetData++
                        expect(responseOfIssuingAsset.message).to.be.equal('Internal server error')
                        expect(responseOfIssuingAsset.status).to.be.equal(500)
                    }
                })
            })
        })
    })

    describe('sendAsset', function () {
        var validAssetAddress = "moWWfCtKjiaY9EvpPQQw845bb3sHM894Yv"
        var validAssetId = "La5wHsg3dKDP7mrU2visoVDNjSiM6fc45rNsSC"
        it('should return error 400 if one of the string fields (toAddress,assetId) is not a string', function (done) {
            this.timeout(10000)
            utilColuFunctions.sendAsset(colu, {
                toAddress: "abcd",
                assetId: false,
                amount: 1
            }, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                //add more checks
                done()
            })
        })
        //more validations
        it('should return error of "Should have from as array of addresses or sendutxo as array of utxos" if no assets are associated with the wallet', function (done) {
            this.timeout(20000)
            utilColuFunctions.sendAsset(colu, {
                toAddress: validAssetAddress,
                assetId: validAssetId,
                amount: 1
            }, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(500);
                expect(statusAndResponse.response).to.be.a('string');
                expect(statusAndResponse.response).to.be.equal("Should have from as array of addresses or sendutxo as array of utxos.");
                done()
            })
        })
        it('should return error of "Should have from as array of addresses or sendutxo as array of utxos" if there is no one that holds that assetId', function (done) {
            this.timeout(20000)
            colu.issueAsset({amount: 1}, function (err, asset) {
                utilColuFunctions.sendAsset(colu, {
                    toAddress: validAssetAddress,
                    assetId: 'noOneHoldsThisAssetIdCauseItDoesntExistPigsWillFlyInTheSkyBeforeThisAssetIdWillExist',
                    amount: 1
                }, function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(500);
                    expect(statusAndResponse.response).to.be.a('string');
                    expect(statusAndResponse.response).to.be.equal("Should have from as array of addresses or sendutxo as array of utxos.");
                    done()
                })
            })
        })
        it('should return error of "Not enough assets to cover transfer transaction" if the wallet doesnt have enough of the asset', function (done) {
            this.timeout(20000)
            colu.issueAsset({amount: 1}, function (err, asset) {
                utilColuFunctions.sendAsset(colu, {
                    toAddress: validAssetAddress,
                    assetId: asset.assetId,
                    amount: 2
                }, function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(500);
                    expect(statusAndResponse.response.code).to.be.equal(20004);
                    expect(statusAndResponse.response.status).to.be.equal(500);
                    expect(statusAndResponse.response.name).to.be.equal('NotEnoughAssetsError')
                    expect(statusAndResponse.response.message).to.be.equal('Not enough assets to cover transfer transaction')
                    expect(statusAndResponse.response.asset).to.be.equal(asset.assetId);
                    done()
                })
            })
        })
        it('should return error of "toAddress does not exist" if there is no such address anywhere', function (done) {
            this.timeout(20000)
            colu.issueAsset({amount: 1}, function (err, asset) {
                utilColuFunctions.sendAsset(colu, {
                    toAddress: 'noOneHoldsThisAddressCauseItDoesntExistPigsWillFlyInTheSkyBeforeThisAddressWillExist',
                    assetId: asset.assetId,
                    amount: 1
                }, function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(500);
                    expect(statusAndResponse.response.code).to.be.equal(500)
                    expect(statusAndResponse.response.response).to.be.equal('toAddress does not exist')
                    done()
                })
            })
        })
        it('should return success and transfer the amount of the asset from the wallet to the address specified', function (done) {
            this.timeout(30000)
            colu.issueAsset({amount: 1}, function (err, asset) {
                utilColuFunctions.sendAsset(colu, {
                    toAddress: validAssetAddress,
                    assetId: asset.assetId,
                    amount: 1
                }, function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(200);
                    expect(statusAndResponse.response).to.be.a('string')
                    expect(statusAndResponse.response.length).to.be.equal(64)
                    var lettersAndNumbersOnly = new RegExp(/^[0-9a-zA-Z]+$/)
                    expect(lettersAndNumbersOnly.test(statusAndResponse.response)).to.be.equal(true)
                    colu.coloredCoins.getStakeHolders(asset.assetId, function (err, assetHolders) {
                        var senderAddressAndAmount = {address: asset.issueAddress, amount: 0}
                        var receiverAddressAndAmount = {address: validAssetAddress, amount: 1}
                        console.log(assetHolders.holders, senderAddressAndAmount, receiverAddressAndAmount)
                        //expect(assetHolders.holders).to.include.deep(senderAddressAndAmount)
                        expect(assetHolders.holders).to.include.deep(receiverAddressAndAmount)
                        done()
                    })

                })
            })
        })
        it('should return success and transfer the asset from a group of addresses in the wallet if more than one address in the wallet holds this asset and all together they have enough', function (done) {
            this.timeout(50000)
            colu.issueAsset({amount: 100}, function (err, firstIssuedAsset) {
                colu.issueAsset({amount: 100}, function (err, secondIssuedAsset) {
                    var assetAddress = secondIssuedAsset.issueAddress
                    utilColuFunctions.sendAsset(colu, {toAddress: assetAddress, assetId: firstIssuedAsset.assetId, amount: 50}, function (statusAndResponse) {
                        colu.coloredCoins.getStakeHolders(firstIssuedAsset.assetId, function (err, firstTimeAssetHolders) {
                            var senderAddressAndAmount = {address: firstIssuedAsset.issueAddress, amount: 50}
                            var receiverAddressAndAmount = {address: secondIssuedAsset.issueAddress, amount: 50}
                            expect(firstTimeAssetHolders.holders).to.include.deep(senderAddressAndAmount)
                            expect(firstTimeAssetHolders.holders).to.include.deep(receiverAddressAndAmount)
                            utilColuFunctions.sendAsset(colu, {toAddress: validAssetAddress, assetId: firstIssuedAsset.assetId, amount: 75}, function (statusAndResponse) {
                                colu.coloredCoins.getStakeHolders(firstIssuedAsset.assetId, function (err, secondTimeAssetHolders) {
                                    var senderAddressAndAmountOption1 = {
                                        address: firstIssuedAsset.issueAddress,
                                        amount: 25
                                    }
                                    var senderAddressAndAmountOption2 = {
                                        address: secondIssuedAsset.issueAddress,
                                        amount: 25
                                    }
                                    var receiverAddressAndAmount = {address: validAssetAddress, amount: 75}
                                    expect(secondTimeAssetHolders.holders).to.include.deep(receiverAddressAndAmount)
                                    var assetTransferedCorrectly = JSON.stringify(secondTimeAssetHolders.holders).indexOf(JSON.stringify(senderAddressAndAmountOption1)) > -1 ||
                                        JSON.stringify(secondTimeAssetHolders.holders).indexOf(JSON.stringify(senderAddressAndAmountOption2)) > -1
                                    console.log('JSONSTRINGIFY',JSON.stringify(secondTimeAssetHolders.holders), JSON.stringify(senderAddressAndAmountOption1), JSON.stringify(senderAddressAndAmountOption2))
                                    expect(assetTransferedCorrectly).to.be.true
                                    done()
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})


describe('utilEncoder', function () {
    var utilEncoder = util.encoder
    describe('calculateMantisExponentDecimal', function () {
        it('should return the number itself and exponent 0 for numbers that dont divide in 10', function () {
            var number = 1234;
            var numberExponent = 0;
            var numberMantis = number / Math.pow(10, numberExponent);
            var mantisExponentDecimal = utilEncoder.calculateMantisExponentDecimal(number);
            var mantisDecimal = mantisExponentDecimal.mantisDecimal;
            var exponentDecimal = mantisExponentDecimal.exponentDecimal;
            expect(mantisDecimal).to.equal(numberMantis);
            expect(exponentDecimal).to.equal(numberExponent);
        });
        it('should return correct mantis and the correct exponent when number does divide in 10', function () {
            var number = 123400010000;
            var numberExponent = 4;
            var numberMantis = number / Math.pow(10, numberExponent);
            var mantisExponentDecimal = utilEncoder.calculateMantisExponentDecimal(123400010000);
            var mantisDecimal = mantisExponentDecimal.mantisDecimal;
            var exponentDecimal = mantisExponentDecimal.exponentDecimal;
            expect(mantisDecimal).to.equal(numberMantis);
            expect(exponentDecimal).to.equal(numberExponent);
        });
        it('should return the mantis as the number itself and exponent 0 when number <= 31, even if divides in 10', function () {
            var number = 10;
            var numberExponent = 0;
            var numberMantis = number / Math.pow(10, numberExponent);
            var mantisExponentDecimal = utilEncoder.calculateMantisExponentDecimal(number);
            var mantisDecimal = mantisExponentDecimal.mantisDecimal;
            var exponentDecimal = mantisExponentDecimal.exponentDecimal;
            expect(mantisDecimal).to.equal(numberMantis);
            expect(exponentDecimal).to.equal(numberExponent);
        });
        it('should return mantis 0 and exponent 0 when number is 0', function () {
            var number = 0;
            var numberExponent = 0;
            var numberMantis = number / Math.pow(10, numberExponent);
            var mantisExponentDecimal = utilEncoder.calculateMantisExponentDecimal(number);
            var mantisDecimal = mantisExponentDecimal.mantisDecimal;
            var exponentDecimal = mantisExponentDecimal.exponentDecimal;
            expect(mantisDecimal).to.equal(numberMantis);
            expect(exponentDecimal).to.equal(numberExponent);
        });
        it('should return mantis 1 and exponent 16 when number is 10^16 (highest available)', function () {
            var number = 10000000000000000;
            var numberExponent = 16;
            var numberMantis = number / Math.pow(10, numberExponent);
            var mantisExponentDecimal = utilEncoder.calculateMantisExponentDecimal(number);
            var mantisDecimal = mantisExponentDecimal.mantisDecimal;
            var exponentDecimal = mantisExponentDecimal.exponentDecimal;
            expect(mantisDecimal).to.equal(1);
            expect(exponentDecimal).to.equal(16);
        });
    });

    describe('significantDigitsInTable', function () {
        it('should return 0-31 when number <= 31', function () {
            var number = 20;
            var significantDigitsInTable = utilEncoder.significantDigitsInTable(number, number);
            expect(significantDigitsInTable).to.equal('0-31');
        });
        it('should return 2 when number of significant digits is 1 and number > 31', function () {
            var number = 1000000;
            var mantis = number / Math.pow(10, 6);
            var significantDigitsInTable = utilEncoder.significantDigitsInTable(mantis, number);
            expect(significantDigitsInTable).to.equal('2');
        });
        it('should return the number of significant digits when number of significant digits is an exact key in the table', function () {
            var number = 12345670000;
            var mantis = number / Math.pow(10, 4);
            var significantDigitsInTable = utilEncoder.significantDigitsInTable(mantis, number);
            expect(significantDigitsInTable).to.equal('7');
        });
        it('should return the first key in the table that is bigger than number of significant digits when number of significant digits is not an exact key in the table', function () {
            var number = 123456780000;
            var mantis = number / Math.pow(10, 4);
            var significantDigitsInTable = utilEncoder.significantDigitsInTable(mantis, number);
            expect(significantDigitsInTable).to.equal('10');
        });
    });

    describe('appendZerosToPrefix', function () {
        it('should return empty string when required bits is 0', function () {
            var number = '11111';
            var bits = 0;
            var numberWithAppendedPrefix = utilEncoder.appendZerosToPrefix(number, bits);
            expect(numberWithAppendedPrefix).to.equal('');
        });
        it('should not append any zeros in prefix when binary number length is exactly number of required bits', function () {
            var number = '11000011010011111';
            var bits = number.length;
            var numberWithAppendedPrefix = utilEncoder.appendZerosToPrefix(number, bits);
            expect(numberWithAppendedPrefix).to.equal(number);
        });
        it('should append zeros to prefix until number length equals number of required bits', function () {
            var number = '111111';
            var bits = 9;
            var expectedPrefix = '';
            while (expectedPrefix.length < bits - number.length) {
                expectedPrefix += '0';
            }
            var numberWithAppendedPrefix = utilEncoder.appendZerosToPrefix(number, bits);
            expect(numberWithAppendedPrefix).to.equal(expectedPrefix + number);
        });
    });
    describe('bin2hex', function () {
        it('should return a hex with 2 digits when binary is length of 8 or smaller', function () {
            var binaryNumber = '00011111';
            var expectedHex = '1f';
            var observedHex = utilEncoder.bin2hex(binaryNumber);
            expect(observedHex).to.equal(expectedHex);
        });
        it('should return correct result also with big numbers', function () {
            var binaryNumber = '11000011010011001100110011001100110011001100110011001100';
            var expectedHex = 'c34ccccccccccc';
            var observedHex = utilEncoder.bin2hex(binaryNumber);
            expect(observedHex).to.equal(expectedHex);
        });
    });
    describe.only('encodeFullNumber', function () {
        it('should return hex that is bigger in 2^exponentBits (in hex) than previous when number of bytes is not changing and exponent is 0', function () {
            var prevEncodedNumber = utilEncoder.encodeFullNumber(991);
            for (var i = 992; i < 2010; i++) {
                if (i % 10 != 0) {
                    if (i % 10 != 1) {
                        var currEncodedNumber = utilEncoder.encodeFullNumber(i);
                        expect(parseInt(currEncodedNumber, 16)).to.equal(parseInt(prevEncodedNumber, 16) + Math.pow(2, 4))
                    }
                    else {
                        var currEncodedNumber = utilEncoder.encodeFullNumber(i);
                        expect(parseInt(currEncodedNumber, 16)).to.equal(parseInt(prevEncodedNumber, 16) + Math.pow(2, 5))
                    }
                    prevEncodedNumber = utilEncoder.encodeFullNumber(i)
                }
            }
            prevEncodedNumber = utilEncoder.encodeFullNumber(99999999991);
            for (var i = 99999999992; i < 100000002010; i++) {
                if (i % 10 != 0) {
                    if (i % 10 != 1) {
                        var currEncodedNumber = utilEncoder.encodeFullNumber(i);
                        expect(parseInt(currEncodedNumber, 16)).to.equal(parseInt(prevEncodedNumber, 16) + Math.pow(2, 3))
                    }
                    else {
                        var currEncodedNumber = utilEncoder.encodeFullNumber(i);
                        expect(parseInt(currEncodedNumber, 16)).to.equal(parseInt(prevEncodedNumber, 16) + Math.pow(2, 4))
                    }
                    prevEncodedNumber = utilEncoder.encodeFullNumber(i)
                }
            }
        });
        it('should return computed numbers as I manually calculated when number of bytes is changing', function () {
            var numbers = [0, 32, 101, 100001, 10000001, 10000000001, 1000000000001];
            var expectedHexes = ['00', '2200', '400650', '60186a10', '8004c4b408', 'a012a05f2008', 'c000e8d4a51001']
            numbers.forEach(function (number, index) {
                var expectedHex = expectedHexes[index];
                var observedHex = utilEncoder.encodeFullNumber(number)
                expect(observedHex).to.equal(expectedHex);
            })
        })
        it('should increase the hex by 1 when mantis is same and exponent increases by 1', function () {
            var numbers = [];
            var expectedHexes = [];
            for (var i = 0; i < 14; i++) {
                numbers.push(32 * Math.pow(10, i))
                expectedHexes.push('220' + i.toString(16))
            }
            numbers.forEach(function (number, index) {
                var expectedHex = expectedHexes[index];
                var observedHex = utilEncoder.encodeFullNumber(number)
                expect(observedHex).to.equal(expectedHex);
            })
        })
        it('should return numbers between 0 and 31 as their simple hex representation', function () {
            var numbers = [];
            var expectedHexes = [];
            for (var i = 0; i < 32; i++) {
                numbers.push(i);
                if (i < 16) expectedHexes.push('0' + i.toString(16))
                else expectedHexes.push(i.toString(16))
            }
            numbers.forEach(function (number, index) {
                var expectedHex = expectedHexes[index];
                var observedHex = utilEncoder.encodeFullNumber(number)
                expect(observedHex).to.equal(expectedHex);
            })
        })
        it('should return correct result for the examples in the task description and the highest number that can be encoded', function () {
            var numbers = [1, 1200032, 1232, 1002000000, 928867423145164, 132300400000, Number.MAX_SAFE_INTEGER];
            var expectedHexes = ['01', '6124fa00', '404d00', '403ea6', 'c34ccccccccccc', '6142ffc5', 'dfffffffffffff'];
            numbers.forEach(function (number, index) {
                var expectedHex = expectedHexes[index];
                var observedHex = utilEncoder.encodeFullNumber(number)
                expect(observedHex).to.equal(expectedHex);
            })
        })
    })
    describe('encodeNumber', function(){
        it('should return error saying "number should be an integer between 0 and (2^53)-1" when its not in that range and pattern of success otherwise', function(){
            var number = -1
            utilEncoder.encodeNumber(number, function (statusAndResponse){
                expect(statusAndResponse).to.eql({
                    code: validationErrorCode,
                    response: {
                        code: validationErrorCode,
                        message: validationErrorMessage,
                        explanation: 'number should be an integer between 0 and (2^53)-1 (Number.MAX_SAFE_INTEGER)'
                    }
                })
            })
            
            var number = Number.Max_SAFE_INTEGER+1
            utilEncoder.encodeNumber(number, function(statusAndResponse){
                expect(statusAndResponse).to.eql({
                    code: validationErrorCode,
                    response: {
                        code: validationErrorCode,
                        message: validationErrorMessage,
                        explanation: 'number should be an integer between 0 and (2^53)-1 (Number.MAX_SAFE_INTEGER)'
                    }
                })
            })
            var number = 1232
            utilEncoder.encodeNumber(number, function(statusAndResponse){
                expect(statusAndResponse).to.eql({code: 200, response: '404d00'})
            })
            
        })
    })
})


// else {
//     expect(parseInt(currEncodedNumber, 16)).to.equal(parseInt(prevEncodedNumber, 16)+parseInt(20, 16))
// }



