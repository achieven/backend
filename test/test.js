/* eslint-env mocha */
var validationErrorMessage = 'Validation error';
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
        it('should return an error 400 saying "input assets at <index>,  amount should be an integer" when amount is not an integer or a string that represents an integer', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: 1.2}], function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount should be an integer')
                utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: "1.2"}], function (statusAndResponse) {
                    expect(statusAndResponse).to.be.a('object');
                    expect(statusAndResponse.code).to.be.equal(400);
                    expect(statusAndResponse.response).to.be.a('object');
                    expect(statusAndResponse.response.code).to.be.equal(400);
                    expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                    expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount should be an integer')
                    done()
                })
            })
        })
        it('should return an error 400 saying "input assets at <index>,  amount should be an integer between 1 and (2^54)-2" when amount is not between 1 and (2^54)-2', function (done) {
            this.timeout(20000)
            utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: -1}], function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                expect(statusAndResponse.code).to.be.equal(400);
                expect(statusAndResponse.response).to.be.a('object');
                expect(statusAndResponse.response.code).to.be.equal(400);
                expect(statusAndResponse.response.message).to.equal(validationErrorMessage)
                expect(statusAndResponse.response.explanation).to.equal('input assets at 1, amount should be an integer between 1 and (2^54)-2')
                utilColuFunctions.issueAssets(colu, [correctAssetToIssue, {amount: Math.pow(2, 54)-1}], function (statusAndResponse) {
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
        it('should return success when amount is an integer between 1 and (2^54)-2', function(done){
            this.timeout(20000)
            var inputAssets = [{assetName: 'a', amount: Math.pow(2,54)-2}]
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
                    if (index!=1) {
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
    
    describe('sendAsset', function(){
        it('should return error 400 if one of the fields does not match the pattern its supposed to be', function(done){
            done()
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
    describe('encodeFullNumber', function () {
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
        it('should return correct result for the examples in the task description', function () {
            var numbers = [1, 1200032, 1232, 1002000000, 928867423145164, 132300400000];
            var expectedHexes = ['01', '6124fa00', '404d00', '403ea6', 'c34ccccccccccc', '6142ffc5'];
            numbers.forEach(function (number, index) {
                var expectedHex = expectedHexes[index];
                var observedHex = utilEncoder.encodeFullNumber(number)
                expect(observedHex).to.equal(expectedHex);
            })
        })
    })
})


// else {
//     expect(parseInt(currEncodedNumber, 16)).to.equal(parseInt(prevEncodedNumber, 16)+parseInt(20, 16))
// }



