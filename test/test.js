/* eslint-env mocha */
const validationErrorMessage = 'Validation error';
const validationErrorCode = 400
const Colu = require('colu')
const expect = require('chai').expect
const util = require('../util/util.js')
const alphanumericNotEmptyRegex = /^[a-z0-9]+$/i

describe('Test utilColuFunctions', function () {


    var colu
    const utilColuFunctions = util.processRequests.coluCalls
    const validations = util.validations

    describe('validateColuGeneratedString', function () {
        it('should return error 400 with message saying "<property> is not valid, use non empty alphanumeric string" when property isnt string or not only alphanumeric', function () {
            var key = 'some property'
            var optionalPrefix = ''
            var expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'some property is not valid, use non empty alphanumeric string'
            }
            var value
            var observedResponse

            value = true
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = false
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = 1
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = 0
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = undefined
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = null
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = {}
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = []
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = Symbol()
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = ''
            observedResponse = validations.validateColuGeneratedString(key, value, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = 'only1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZallowed.butCantHaveNonAlphanumbericCharacters'
            observedResponse = validations.validateColuGeneratedString(key, value, 'prefix ')
            expect(observedResponse.errorCode).to.be.equal(expectedResponse.errorCode)
            expect(observedResponse.errorResponse).to.be.equal('prefix ' + expectedResponse.errorResponse)
            value = 'only1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZallowed butCantHaveNonAlphanumbericCharacters'
            observedResponse = validations.validateColuGeneratedString(key, value, 'prefix ')
            expect(observedResponse.errorCode).to.be.equal(expectedResponse.errorCode)
            expect(observedResponse.errorResponse).to.be.equal('prefix ' + expectedResponse.errorResponse)

        })
        it('should return undefined when the property is a string with no spaces and not empty', function () {
            var key = 'some property'
            var value = 'only1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZallowed'
            var observedResponse = validations.validateColuGeneratedString(key, value, 'prefix ')
            expect(observedResponse).to.be.undefined
        })
    })
    describe('validateNumber', function () {
        it('should return error 400 saying "<property> should be an integer between <minLimit+1> and <maxLimit -1>" when its not an integer or not in that spectrum', function () {
            var key = 'some property'
            var minLimit = 0
            var maxLimit = Math.pow(2, 54) - 2
            var optionalPrefix = ''
            var expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'some property should be an integer between ' + minLimit + ' and ' + maxLimit
            }
            var value
            var observedResponse

            value = true
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = false
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = undefined
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = null
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = Symbol()
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = []
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = {}
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = 1.2
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = '1.2'
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = -1
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = '-1'
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = Math.pow(2, 54) - 1
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            value = (Math.pow(2, 54) - 1).toString()
            observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, 'prefix ')
            expect(observedResponse.errorCode).to.be.equal(expectedResponse.errorCode)
            expect(observedResponse.errorResponse).to.be.equal('prefix ' + expectedResponse.errorResponse)
        })
        it('should return undefined when the property is an integer between minLimit and maxLimit', function () {
            var key = 'some property'
            var minLimit = 0
            var maxLimit = Math.pow(2, 54) - 2
            var optionalPrefix = ''
            var value
            var observedResponse

            value = 0
            var observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.be.undefined
            value = '0'
            var observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.be.undefined
            value = Math.pow(2, 54) - 2
            var observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.be.undefined
            value = (Math.pow(2, 54) - 2).toString()
            var observedResponse = validations.validateNumber(key, value, minLimit, maxLimit, optionalPrefix)
            expect(observedResponse).to.be.undefined
        })
    })
    describe('validateArray', function () {
        it('should return error 400 saying "should be an array with properties in it" when array isnt array or has length 0', function () {
            var optionalPrefix = ''
            var expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'should be an array with properties in it'
            }
            var inputArray
            var observedResponse

            inputArray = true
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = false
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = 1
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = 0
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = undefined
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = null
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = Symbol()
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = 'string'
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = {}
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputArray = []
            observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
        })
        it('should return undefined if array has any property in it', function () {
            var optionalPrefix = ''
            var inputArray = [1]
            var observedResponse = validations.validateArray(inputArray, optionalPrefix)
            expect(observedResponse).to.be.undefined

        })
    })
    describe('validateObject', function () {
        it('should return error 400 saying "should be an Object" when input not an object', function () {
            var optionalPrefix = ''
            var expectedResponse = {errorCode: validationErrorCode, errorResponse: 'should be an Object'}
            var inputObject
            var observedResponse

            inputObject = true
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = false
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = 1
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = 0
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = undefined
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = null
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = 'string'
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = Symbol()
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
            inputObject = []
            observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.eql(expectedResponse)
        })
        it('should return undefined when input is an object', function () {
            var optionalPrefix = ''
            var inputObject = {}
            var observedResponse = validations.validateObject(inputObject, optionalPrefix)
            expect(observedResponse).to.be.undefined
        })
    })
    describe('validateIssueAssets', function () {
        var
            validAsset1 = {amount: 100}, validAsset2 = {amount: 100, assetName: 'achi'}, validAsset3 = {
                amount: 100,
                assetName: []
            },
            validAsset4 = {amount: 100, assetName: true}, validAsset5 = {
                amount: 100,
                assetName: null
            }, validAsset6 = {amount: 100, assetName: 1}
        it('should return error 400 if inputAssets is not valid according to "validateArray" or one of the inputAssets is not an object according to "validateObject or has no valid amount according to "validateNumber"', function () {
            var inputAssets
            var expectedResponse
            var observedResponse

            inputAssets = []
            expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'should be an array with properties in it'
            }
            observedResponse = validations.validateIssueAssets(inputAssets)
            expect(observedResponse).to.eql(expectedResponse)

            inputAssets = [validAsset2, true]
            expectedResponse = {errorCode: validationErrorCode, errorResponse: 'input assets at 1, should be an Object'}
            observedResponse = validations.validateIssueAssets(inputAssets)
            expect(observedResponse).to.eql(expectedResponse)

            inputAssets = [validAsset2, {}]
            expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'input assets at 1, amount should be an integer between ' + 0 + ' and ' + (Math.pow(2, 54) - 2)
            }
            observedResponse = validations.validateIssueAssets(inputAssets)
            expect(observedResponse).to.eql(expectedResponse)
            inputAssets = [validAsset2, {ammount: 2}]
            expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'input assets at 1, amount should be an integer between ' + 0 + ' and ' + (Math.pow(2, 54) - 2)
            }
            observedResponse = validations.validateIssueAssets(inputAssets)
            expect(observedResponse).to.eql(expectedResponse)
        })
        it('should return array of objects, each has amount and assetName(could be anything) if each property in the array is an object and has "amount" property', function () {
            var inputAssets
            var expectedResponse
            var observedResponse

            inputAssets = [validAsset1, validAsset2, validAsset3, validAsset4, validAsset5, validAsset6]
            expectedResponse = [
                {amount: validAsset1.amount, metadata: {assetName: undefined}},
                {amount: validAsset2.amount, metadata: {assetName: validAsset2.assetName}},
                {amount: validAsset3.amount, metadata: {assetName: validAsset3.assetName}},
                {amount: validAsset4.amount, metadata: {assetName: validAsset4.assetName}},
                {amount: validAsset5.amount, metadata: {assetName: validAsset5.assetName}},
                {amount: validAsset6.amount, metadata: {assetName: validAsset6.assetName}}
            ]
            observedResponse = validations.validateIssueAssets(inputAssets)
            //console.log('!!!', observedResponse)
            expect(observedResponse).to.eql(expectedResponse)
        })
    })
    describe('validateSendAsset', function () {
        var validToAddress = 'moWWfCtKjiaY9EvpPQQw845bb3sHM894Yv'
        var validAssetId = 'La34T2ggNEqZ3yYMYXVR9kdqSN6pKs5qggcaYD'
        var validAmount = 100
        it('should return error 400 if sendAssetProperties is not an object according to "validateObject" or toAddress or assetId are not valid according to "validateColuGeneratedString" or amount is not validaccording to "validateNumber"', function () {
            var sendAssetProperties
            var expectedResponse
            var observedResponse
            sendAssetProperties = []
            expectedResponse = {errorCode: validationErrorCode, errorResponse: 'should be an Object'}
            observedResponse = validations.validateSendAsset(sendAssetProperties)
            expect(observedResponse).to.eql(expectedResponse)

            sendAssetProperties = {toAddress: 2, assetId: validAssetId, amount: validAmount}
            expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'toAddress is not valid, use non empty alphanumeric string'
            }
            observedResponse = validations.validateSendAsset(sendAssetProperties)
            expect(observedResponse).to.eql(expectedResponse)
            sendAssetProperties = {toAddress: validToAddress, assetId: {}, amount: validAmount}
            expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'assetId is not valid, use non empty alphanumeric string'
            }
            observedResponse = validations.validateSendAsset(sendAssetProperties)
            expect(observedResponse).to.eql(expectedResponse)
            sendAssetProperties = {toAddress: validToAddress, assetId: validAssetId, amount: undefined}
            expectedResponse = {
                errorCode: validationErrorCode,
                errorResponse: 'amount should be an integer between ' + 0 + ' and ' + (Math.pow(2, 54) - 2)
            }
            observedResponse = validations.validateSendAsset(sendAssetProperties)
            expect(observedResponse).to.eql(expectedResponse)
        })
        it('should return undefined if sendAssetProperties is an object that contains properties toAddress, assetId & amount', function () {
            var sendAssetProperties = {toAddress: validToAddress, assetId: validAssetId, amount: validAmount}
            var observedResponse = validations.validateSendAsset(sendAssetProperties)
            expect(observedResponse).to.be.undefined
        })
    })

    describe('determineStatusAndResponse', function () {
        var sendResponse = function (statusAndResponse) {
            return statusAndResponse
        }
        it('should return error with the code specified in the error if it is a code that exist in codes.json of body-parser', function () {
            var err = {code: 400, message: validationErrorMessage, explanation: 'some explanation'}
            var whatIsReturned = utilColuFunctions.determineStatusAndResponse(err, ['not empty array'], sendResponse)
            var expectedResponse = {code: 400, response: err}
            expect(whatIsReturned).to.eql(expectedResponse)
        })
        it('should return error with code 500 if it is a code that doesnt exist in codes.json of body-parser', function () {
            var err = 'some problem occured!'
            var whatIsReturned = utilColuFunctions.determineStatusAndResponse(err, null, sendResponse)
            var expectedResponse = {code: 500, response: err}
            expect(whatIsReturned).to.eql(expectedResponse)
        })
        it('should return code 200 with the results as response', function () {
            var results = ['1234', '5678']
            var whatIsReturned = utilColuFunctions.determineStatusAndResponse(null, results, sendResponse)
            var expectedResponse = {code: 200, response: results}
            expect(whatIsReturned).to.eql(expectedResponse)
        })
    })


    before(function (done) {/// error something with 2000
        this.timeout(10000)
        var settings = {
            network: 'testnet',
            events: true,
            eventsSecure: true,
            privateSeed: process.env.COLU_SDK_PRIVATE_SEED
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
        it('should return distinct list of assets when colus getAssets function returns duplicate assets', function (done) {
            this.timeout(20000)
            colu.issueAsset({amount: 2}, function (err, firstAsset) {
                colu.issueAsset({amount: 2}, function (err, secondAsset) {
                    var to = [{
                        address: secondAsset.issueAddress,
                        assetId: firstAsset.assetId,
                        amount: 1
                    }]
                    var from = [firstAsset.issueAddress]
                    colu.sendAsset({from:from, to:to}, function (err, sentAsset) {
                        colu.getAssets(function(err, assets){
                            var assetsIdsWithDuplicates = []//reomve
                            assets.forEach(function(asset){
                                assetsIdsWithDuplicates.push(asset.assetId)
                            })
                            var assetsIdsWithoutDuplicates = Array.from(new Set(assetsIdsWithDuplicates))
                            expect(assetsIdsWithoutDuplicates.length).to.equal(assetsIdsWithDuplicates.length-1)
                            utilColuFunctions.getAssets(colu, function (statusAndResponse) {
                                var statusAndResponseUnique = Array.from(new Set(statusAndResponse.response))
                                expect(statusAndResponse).to.be.a('object')
                                expect(statusAndResponse.code).to.be.equal(200)
                                expect(statusAndResponse.response).to.be.a('array')
                                expect(statusAndResponse.response).to.eql(statusAndResponseUnique)
                                done()
                            })
                        })
                        
                    })
                })
            })
        })
    })

    describe('issueAssets', function () {
        var validAssetToIssue1 = {amount: 100, assetName: 'achi'}, validAssetToIssue2 = {
            amount: 100,
            assetName: 'yosi'
        }, validAssetToIssue3 = {amount: 100, assetName: 'micha'}
        it('should return error if not passing validation', function (done) {
            var inputAssets = [validAssetToIssue1, {}]
            utilColuFunctions.issueAssets(colu, inputAssets, function (statusAndResponse) {
                var expectedResponse = {
                    code: 400,
                    response: 'input assets at 1, amount should be an integer between 0 and ' + (Math.pow(2, 54) - 2)
                }
                expect(statusAndResponse).to.eql(expectedResponse)
                done()
            })
        })
        
        it('should return an array with assetsIds and same order as input and status 200 when all input assets are valid', function (done) {
            this.timeout(90000);
            var inputAssets = [validAssetToIssue1, validAssetToIssue2, validAssetToIssue3]
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
            this.timeout(120000);
            var inputAssetsReadyForAction = [{metadata: {assetName: 'a'}, amount: 100}, {
                metadata: {assetName: 'b'},
                amount: -1
            }, {metadata: {assetName: 'c'}, amount: 300}]
            validations.validateIssueAssets = function () {
                return inputAssetsReadyForAction
            }
            utilColuFunctions.issueAssets(colu, inputAssetsReadyForAction, function (statusAndResponse) {
                expect(statusAndResponse).to.be.a('object');
                //console.log('###', statusAndResponse)
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
        it('should return error if not passing validation', function (done) {
            this.timeout(20000)
            utilColuFunctions.sendAsset(colu, {
                toAddress: validAssetAddress,
                assetId: {},
                amount: 100
            }, function (statusAndResposen) {
                var expectedResponse = {code: 400, response: 'assetId is not valid, use non empty alphanumeric string'}
                expect(statusAndResposen).to.eql(expectedResponse)
                done()
            })
        })
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
                    expect(alphanumericNotEmptyRegex.test(statusAndResponse.response)).to.be.equal(true)
                    colu.coloredCoins.getStakeHolders(asset.assetId, function (err, assetHolders) {
                        var senderAddressAndAmount = {address: asset.issueAddress, amount: 0}
                        var receiverAddressAndAmount = {address: validAssetAddress, amount: 1}
                        //console.log(assetHolders.holders, senderAddressAndAmount, receiverAddressAndAmount)
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
                    utilColuFunctions.sendAsset(colu, {
                        toAddress: assetAddress,
                        assetId: firstIssuedAsset.assetId,
                        amount: 50
                    }, function (statusAndResponse) {
                        colu.coloredCoins.getStakeHolders(firstIssuedAsset.assetId, function (err, firstTimeAssetHolders) {
                            var senderAddressAndAmount = {address: firstIssuedAsset.issueAddress, amount: 50}
                            var receiverAddressAndAmount = {address: secondIssuedAsset.issueAddress, amount: 50}
                            expect(firstTimeAssetHolders.holders).to.include.deep(senderAddressAndAmount)
                            expect(firstTimeAssetHolders.holders).to.include.deep(receiverAddressAndAmount)
                            utilColuFunctions.sendAsset(colu, {
                                toAddress: validAssetAddress,
                                assetId: firstIssuedAsset.assetId,
                                amount: 75
                            }, function (statusAndResponse) {
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
                                    console.log(secondTimeAssetHolders.holders)
                                    expect(secondTimeAssetHolders.holders).to.include.deep(receiverAddressAndAmount)
                                    var assetTransferedCorrectly = JSON.stringify(secondTimeAssetHolders.holders).indexOf(JSON.stringify(senderAddressAndAmountOption1)) > -1 ||
                                        JSON.stringify(secondTimeAssetHolders.holders).indexOf(JSON.stringify(senderAddressAndAmountOption2)) > -1
                                    //console.log('JSONSTRINGIFY', JSON.stringify(secondTimeAssetHolders.holders), JSON.stringify(senderAddressAndAmountOption1), JSON.stringify(senderAddressAndAmountOption2))
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
    var utilEncoder = util.processRequests.encoder
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
    describe('encodeNumber', function () {
        it('should return error saying "number should be an integer between 0 and (2^53)-1" when its not in that range and pattern of success otherwise', function () {
            var number
            var expectedResponse = {
                code: validationErrorCode,
                response: 'number should be an integer between 0 and ' + Number.MAX_SAFE_INTEGER
            }
            number = -1
            utilEncoder.encodeNumber(number, function (statusAndResponse) {
                expect(statusAndResponse).to.eql(expectedResponse)
            })

            number = Number.Max_SAFE_INTEGER + 1
            utilEncoder.encodeNumber(number, function (statusAndResponse) {
                expect(statusAndResponse).to.eql(expectedResponse)
            })
            var number = 1232
            utilEncoder.encodeNumber(number, function (statusAndResponse) {
                expect(statusAndResponse).to.eql({code: 200, response: '404d00'})
            })

        })
    })
})


