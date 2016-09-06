const validationErrorMessage = 'Validation error';
const validationErrorCode = 400
const nonNegativeIntegerRegex = /^\d+$/
const alphanumericNotEmptyRegex = /^[a-z0-9]+$/i
const statuses = require('body-parser/node_modules/http-errors/node_modules/statuses/codes.json')
const async = require('async')

var validations = {
    validateColuGeneratedString: function (key, value, optionalPrefix) {
        optionalPrefix = optionalPrefix || ''
        var errorCode, errorResponse
        if (!(typeof  value === 'string') || !alphanumericNotEmptyRegex.test(value)) {
            errorCode = validationErrorCode
            errorResponse = optionalPrefix + key + ' is not valid, use non empty alphanumeric string'
        }
        return errorCode ? {errorCode: errorCode, errorResponse: errorResponse} : undefined
    },
    validateNumber: function (key, value, minLimit, maxLimit, optionalPrefix) {
        optionalPrefix = optionalPrefix || ''
        var errorCode, errorResponse
        if (typeof value === 'symbol' || !nonNegativeIntegerRegex.test(value) || parseInt(value) > maxLimit || parseInt(value) < minLimit) {
            errorCode = validationErrorCode
            errorResponse = optionalPrefix + key + ' should be an integer between ' + minLimit + ' and ' + maxLimit
        }
        return errorCode ? {errorCode: errorCode, errorResponse: errorResponse} : undefined
    },
    validateArray: function (inputArray, optionalPrefix) {
        optionalPrefix = optionalPrefix || ''
        var errorCode, errorResponse
        if (!Array.isArray(inputArray) || inputArray.length === 0) {
            errorCode = validationErrorCode
            errorResponse = optionalPrefix + 'should be an array with properties in it'
        }
        return errorCode ? {errorCode: errorCode, errorResponse: errorResponse} : undefined
    },
    validateObject: function (value, optionalPrefix) {
        optionalPrefix = optionalPrefix || ''
        var errorCode, errorResponse
        if (!(Object.prototype.toString.call(value) === '[object Object]')) {
            errorCode = validationErrorCode
            errorResponse = optionalPrefix + 'should be an Object'
        }
        return errorCode ? {errorCode: errorCode, errorResponse: errorResponse} : undefined
    },
    validateIssueAssets: function (inputAssets) {
        var self = this
        var errorCodeAndResponse
        var inputAssetsReadyForAction = []
        var errorCodeAndResponse = self.validateArray(inputAssets);
        !errorCodeAndResponse && inputAssets.some(function validateAssetInput(asset, index) {
            if (errorCodeAndResponse) return true
            errorCodeAndResponse = self.validateObject(asset, 'input assets at ' + index + ', ')
            if (!errorCodeAndResponse) errorCodeAndResponse = self.validateNumber('amount', asset.amount, 0, Math.pow(2, 54) - 2, 'input assets at ' + index + ', ')
            //console.log('!!!',asset, errorCodeAndResponse)
            if (!errorCodeAndResponse) {
                inputAssetsReadyForAction.push({
                    amount: asset.amount,
                    metadata: {
                        assetName: asset.assetName
                    }
                })
            }

            if (errorCodeAndResponse) return true
        })
        return errorCodeAndResponse || inputAssetsReadyForAction
    },
    validateSendAsset: function (sendAssetProperties) {
        var errorCodeAndResponse = validations.validateObject(sendAssetProperties)
        if(!errorCodeAndResponse) {
            for (var key in sendAssetProperties) {
                if (errorCodeAndResponse) break
                var value = sendAssetProperties[key]
                switch (key) {
                    case 'toAddress':
                        errorCodeAndResponse = this.validateColuGeneratedString(key, value);
                        break
                    case 'assetId':
                        errorCodeAndResponse = this.validateColuGeneratedString(key, value);
                        break
                    case 'amount':
                        errorCodeAndResponse = this.validateNumber(key, value, 0, Math.pow(2, 54) - 2)
                        break
                    default:
                        break
                }
            }
        }
        return errorCodeAndResponse
    },
}

var processRequests = {
    coluCalls: {
        determineStatusAndResponse: function (err, results, sendResponse) {
            if (err) return sendResponse({code: err.code in statuses ? err.code : 500, response: err})
            return sendResponse({code: 200, response: results})
        },
        getAssets: function (colu, sendResponse) {//not distinct!!
            var self = this
            async.waterfall(
                [
                    function (callback) {
                        var assetsIdsSet = new Set()
                        colu.getAssets(function (err, assets) {// case of success
                            if (err) return callback(err)
                            var assetsIds = [];
                            assets && assets.forEach(function (asset) {
                                var assetId = asset.assetId
                                if(!assetsIdsSet.has(assetId)){
                                    assetsIdsSet.add(assetId)
                                    assetsIds.push(assetId)
                                }
                            });
                            return callback(null, assetsIds);

                        });
                    }
                ],
                function (err, results) {
                    return self.determineStatusAndResponse(err, results, sendResponse)
                }
            )
        },
        issueAssets: function (colu, inputAssets, sendResponse) {
            var response = validations.validateIssueAssets(inputAssets);
            if (response.errorCode) return sendResponse({code: response.errorCode, response: response.errorResponse})
            var inputAssetsReadyForAction = response;
            //console.log(inputAssetsReadyForAction)
            var issueAssetsAndPrepareResponse = []
            //console.log('$$$', inputAssetsReadyForAction)
            inputAssetsReadyForAction.forEach(function (assetToIssue, index) {
                var issueAndGetAssetMetadata = function (callback) {
                    colu.issueAsset(assetToIssue, function (err, assetObject) {
                        //if(!err) console.log('%%%', assetObject.issueAddress,assetObject.assetId)
                        if (err) return callback(err)
                        colu.coloredCoins.getAssetMetadata(assetObject.assetId, assetObject.txid + ':0', function (err, assetData) {
                            if (err) return callback(err)
                            var assetId = assetData.assetId
                            
                            return callback(null, assetId)
                        })
                    })
                }
                issueAssetsAndPrepareResponse.push(issueAndGetAssetMetadata)
            })
            var finishedAll = function (err, results) {
                //console.log(results)
                var response = []
                var code = 200
                results.forEach(function (result) {
                    if (result.value) {
                        response.push(result.value)
                    }
                    else {
                        code = result.error && result.error.code in statuses ? result.error.code : result.error && result.error.message && result.error.message.status in statuses ? result.error.message.status : 500
                        response.push(result.error)
                    }
                })
                return sendResponse({code: code, response: response})
            }
            async.parallel(
                async.reflectAll(issueAssetsAndPrepareResponse),
                finishedAll
            )
        },
        sendAsset: function (colu, addressAssetIdAndAmount, sendResponse) {
            var self = this
            var errorCodeAndResponse = validations.validateSendAsset(addressAssetIdAndAmount);
            if (errorCodeAndResponse) return sendResponse({
                code: errorCodeAndResponse.errorCode,
                response: errorCodeAndResponse.errorResponse
            })

            async.waterfall(
                [
                    function (callback) {
                        var localWalletAddresses = new Set()
                        colu.getAssets(function (err, assets) {
                            // if (!Array.isArray(inputAssets) || inputAssets.length === 0 ) {
                            //     return callback({
                            //         code: 500,
                            //         response: 'Should have from as array of addresses or sendutxo as array of utxos.'
                            //     })
                            // }
                            if (err) return callback(err)
                            assets.forEach(function (asset) {
                                localWalletAddresses.add(asset.address)
                            })
                            callback(null, localWalletAddresses)
                        })
                    },
                    function (localWalletAddresses, callback) {
                        colu.coloredCoins.getStakeHolders(addressAssetIdAndAmount.assetId, function (err, assetHolders) {
                            var assetsIdsAndAmounts = []
                            var from = [];
                            if (err) return callback(err)
                            else {
                                // if (!assetHolders || assetHolders.length === 0) {
                                //     return callback({
                                //         code: 500,
                                //         response: 'Should have from as array of addresses or sendutxo as array of utxos.'
                                //     })
                                // }
                                var sumAllAmountsOfAssetInWallet = 0
                                assetHolders.holders.forEach(function (assetHolder) {
                                    if (localWalletAddresses.has(assetHolder.address)) {
                                        sumAllAmountsOfAssetInWallet += assetHolder.amount
                                        from.push(assetHolder.address)
                                    }
                                })
                                // if (sumAllAmountsOfAssetInWallet < addressAssetIdAndAmount.amount) {
                                //     return callback({
                                //         code: 500, response: {
                                //             code: 20004,
                                //             status: 500,
                                //             name: 'NotEnoughAssetsError',
                                //             message: 'Not enough assets to cover transfer transaction',
                                //             asset: addressAssetIdAndAmount.assetId
                                //         }
                                //     })
                                // }
                                callback(null, from)
                            }
                        })
                    },
                    function (from, callback) {
                        colu.coloredCoins.getAddressInfo(addressAssetIdAndAmount.toAddress, function (err, addressInfo) {
                            //console.log(err, addressInfo)
                            if (err) return callback(err)
                            if (!Array.isArray(addressInfo.utxos) || addressInfo.utxos.length === 0)
                                return callback({code: 500, response: 'toAddress does not exist'})
                            callback(null, from)
                        })
                    },
                    function (from, callback) {
                        var to = [{address: addressAssetIdAndAmount.toAddress, assetId: addressAssetIdAndAmount.assetId, amount: addressAssetIdAndAmount.amount}]
                        var args = {from: from, to: to};
                        colu.sendAsset(args, function (err, sentAsset) {
                            if (err) return callback(err)
                            //test:
                            // colu.getAssets(function (err, assets) {
                            //     console.log('asset in wallet: ')
                            //     assets.forEach(function (asset) {
                            //         console.log(asset.address, asset.amount, asset.assetId)
                            //     })
                            //     colu.coloredCoins.getStakeHolders(body.assetId, function (err, assetHolders) {
                            //         console.log('asset everywhere: ')
                            //         assetHolders.holders.forEach(function (assetHolder) {
                            //             console.log(assetHolder.address, assetHolder.amount)
                            //         })
                            //     })
                            // })
                            return callback(null, sentAsset.financeTxid)//or txid, need to see what;s the difference!
                        })
                    }
                ], function (err, results) {
                    return self.determineStatusAndResponse(err, results, sendResponse)
                    //console.log(err, financeTxid)
                    // if (err) return sendResponse({code: err.code in statuses ? err.code : 500, response: err})
                    // sendResponse({code: 200, response: results})

                }
            )
        },
    },

    encoder: {
        signMantisExponentTable: {
            '0-31': {
                signBitsBinaryRepresentation: '000', mantisBits: 5, exponentBits: 0
            }
            ,
            '2': {
                signBitsBinaryRepresentation: '001', mantisBits: 9, exponentBits: 4
            }
            ,
            '5': {
                signBitsBinaryRepresentation: '010', mantisBits: 17, exponentBits: 4
            }
            ,
            '7': {
                signBitsBinaryRepresentation: '011', mantisBits: 25, exponentBits: 4
            }
            ,
            '10': {
                signBitsBinaryRepresentation: '100', mantisBits: 34, exponentBits: 3
            }
            ,
            '12': {
                signBitsBinaryRepresentation: '101', mantisBits: 42, exponentBits: 3
            }
            ,
            '16': {
                signBitsBinaryRepresentation: '11', mantisBits: 54, exponentBits: 0
            }
        },
        calculateMantisExponentDecimal: function (number) {
            if (number <= 31) {
                return {mantisDecimal: number, exponentDecimal: 0};
            }
            var exponentDecimal = 0;
            var mantisDecimal = number;
            while (mantisDecimal % 10 === 0) {
                mantisDecimal /= 10;
                exponentDecimal++;
            }
            return {mantisDecimal: mantisDecimal, exponentDecimal: exponentDecimal};
        },
        significantDigitsInTable: function (mantisDecimal, number) {
            if (mantisDecimal <= 31 && number <= 31) {
                return '0-31';
            }
            else if (mantisDecimal.toString().length === 1) {
                return '2';
            }
            else {
                var significantDigits = mantisDecimal.toString().length;
                while (!this.signMantisExponentTable[significantDigits] && significantDigits <= 17) {
                    significantDigits++;
                }
                return significantDigits.toString();
            }
        },
        appendZerosToPrefix: function (number, bits) {
            if (bits === 0) {
                return '';
            }
            var numberString = number.toString();
            var numberCurrentBits = numberString.length;
            while (numberString.length < bits) {
                numberString = '0'.concat(numberString);
            }
            return numberString;
        },
        bin2hex: function (fullBinaryReperesentation) {
            var binarySeperatedToQuadrupvars = fullBinaryReperesentation.match(/.{1,4}/g);
            var fullHexRepresentation = '';
            binarySeperatedToQuadrupvars.forEach(function (quadruplet, index) {
                fullHexRepresentation += parseInt(quadruplet, 2).toString(16);

            });
            return fullHexRepresentation;
        },
        encodeFullNumber: function (number) {
            var mantisAndExponentDecimal = this.calculateMantisExponentDecimal(number);
            var mantisDecimal = mantisAndExponentDecimal.mantisDecimal;
            var exponentDecimal = mantisAndExponentDecimal.exponentDecimal;

            var mantisBinaryWithoutZeros = mantisDecimal.toString(2);
            var exponentBinaryWithNumberOfBits = exponentDecimal.toString(2);
            var significantDigits = this.significantDigitsInTable(mantisDecimal, number).toString();

            var mantisBits = this.signMantisExponentTable[significantDigits].mantisBits;
            var exponentBits = this.signMantisExponentTable[significantDigits].exponentBits;
            var signBinaryRepresentation = this.signMantisExponentTable[significantDigits].signBitsBinaryRepresentation;
            var mantisBinaryRepresenation = this.appendZerosToPrefix(mantisBinaryWithoutZeros, mantisBits);
            var exponentBinaryRepresenatation = this.appendZerosToPrefix(exponentBinaryWithNumberOfBits, exponentBits);

            var fullBinaryReperesentation = signBinaryRepresentation += mantisBinaryRepresenation += exponentBinaryRepresenatation;
            var fullHexRepresentation = this.bin2hex(fullBinaryReperesentation);
            return fullHexRepresentation
        },
        encodeNumber: function (number, sendResponse) {
            var errorCodeAndResponse = validations.validateNumber('number', number, 0, Number.MAX_SAFE_INTEGER)
            if(!errorCodeAndResponse){
                var response = this.encodeFullNumber(parseInt(number))
                return sendResponse({code: 200, response: response})
            }
            return sendResponse({code: errorCodeAndResponse.errorCode, response: errorCodeAndResponse.errorResponse})
        },
    }
}
module.exports.processRequests = processRequests
module.exports.validations = validations


// async.each(
//     inputAssets,
//     function(assetToIssue, callback){
//         colu.issueAsset(assetToIssue, function (err, returnedAsset) {
//             assetObject = returnedAsset
//             if (err) {
//                 return callback(err)
//             }
//             colu.coloredCoins.getAssetMetadata(assetObject.assetId, assetObject.txid + ':0', function (err, assetData) {
//                 if (err) {
//                     return callback(err)
//                 }
//                 assetsFinishedWholeExecution++
//                 var assetName = assetData.metadataOfIssuence.data.assetName
//                 var assetId = assetData.assetId
//                 assetsNamesAndIds[assetName] = assetId
//                 console.log(assetName, assetId)
//                 if(assetsFinishedWholeExecution === inputAssets.length){
//                     return callback(null, {a: assetsNamesAndIds})
//                 }
//                 return callback()
//             })
//         })
//     },
//     function (err) {
//         if(err){
//             var code = err.code in statuses ? err.code : 500
//             var response = err
//             return sendResponse({code: code, response: response})
//         }
//         var assetsNamesOrdered = []
//         var assetsIdsOrdered = []
//         inputAssets.forEach(function (asset) {
//             var assetName = asset.metadata.assetName;
//             if (assetsNamesAndIds.hasOwnProperty(assetName)) {
//                 assetsNamesOrdered.push(assetName)
//                 assetsIdsOrdered.push(assetsNamesAndIds[assetName])
//             }
//         })
//         console.log(assetsIdsOrdered, assetsNamesOrdered)
//         sendResponse({code: 200, response: assetsIdsOrdered})
//
//     }
// )
/*                inputAssets.forEach(function (asset) {

 // pubsub.subscribe('error in one request', function (msg, data) {
 //     pubsub.publish('send response', data)// no need for sync cause subscriber is one thread because its javascript
 //
 // })
 //primitives : cannot read property transfer of undefined
 //[]: "Missing param: cc_args, cc_args = []"
 //new Set/Map/{} : amount is required
 //{amount: undefined/null} amount is required
 //{amount: 1.2} amount is not a type of int32
 //{amount: -1/2^54} Internal server error

 var assetToIssue = {
 amount: asset.amount,
 //metadata: {assetName: asset.assetName}
 }
 console.log('@@@', assetToIssue)
 // add when time is out (sometimes it just does it very very slow)
 //try {
 colu.issueAsset(assetToIssue, function (err, assetObject) {
 console.log('^^^', err, assetToIssue.amount)
 if (err) {
 var code = err.code in statuses ? err.code : 500
 var response = assetsIds.length > 0 ? assetsIds.concat([err]) : err
 // pubsub.publish('error in one request', {code: code, response: response})
 throw new Error(JSON.stringify({code: code, response: response}))
 }
 else {
 // pubsub.subscribe('error in one process', function (msg, data) {
 //     pubsub.publish('send response', data)// no need for sync cause subscriber is synced
 // })
 //colu.coloredCoins.getAssetData({assetId: assetObject.assetId, addresses: [assetObject.issueAddress], numConfirmations: 0}, function(err, assetData){
 //colu.coloredCoins.getAssetData({assetId: 'La2zHZhasEtZDdpdHRFFhVm1AF2Abr2kPB3dwN', issueAddress: 'n2NwG7cCNA2YwG3i72RQDoanL92KqrwYA4', numConfirmations: 0}, function(err, assetData){
 //try {
 colu.coloredCoins.getAssetMetadata(assetObject.assetId, assetObject.txid + ':0', function (err, assetData) {
 //colu.coloredCoins.getAssetMetadata('La2zHZhasEtZDdpdHRFFhVm1AF2Abr2kPB3dwN', 'd8a104390440a731e726f83d4ce606e201795d24a03bdedcb6206afdd188238e:1', function(err, assetData){//THIS IS WORKING!!
 assetsIssuedAndGotData++
 //amount = 0:  Cannot read property 'metadata' of undefined
 //amount = 1.0:   Cannot read property 'data' of undefined (also happens in full integers at the moment)
 // console.log('###',assetData.assetData[0].metadata)
 // colu.coloredCoins.getAssetMetadata(assetData.assetData[0].metadata.assetId, assetData.assetData[0].metadata.issuanceTxid+':0', function(err, assetData){
 console.log('$$$', err, assetData)
 // });

 if (err) {// couldnt retrieve one of the assets data
 // var code = err.code in statuses ? err.code : 500
 // var response = assetsIds.length > 0 ? assetsIds.concat([err]) : err
 // pubsub.publish('error in one request', {code: code, response: response})
 //throw new Error(JSON.stringify({code: code, response: response}))
 }
 else {
 var assetName = assetData.metadataOfIssuence.data.assetName//edge case when there is amount 0 then assetData.assetData[0] is undefined
 var assetId = assetData.assetId
 assetsNamesAndIds.set(assetName, assetId)

 console.log('%%%', assetsNamesAndIds)
 if (assetsIssuedAndGotData === inputAssets.length) {//no errors were found, we finished and need to order the map as inserted
 var assetsNamesOrdered = []
 var assetsIdsOrdered = []
 inputAssets.forEach(function (asset) {
 var assetName = asset.assetName;
 if (assetsNamesAndIds.has(assetName)) {
 assetsNamesOrdered.push(assetName)
 assetsIdsOrdered.push(assetsNamesAndIds.get(assetName))
 }
 })
 pubsub.publish('send response', {
 code: 200,
 response: assetsIdsOrdered,
 names: assetsNamesOrdered
 })
 //sendResponse({code: 200, response: assetsIdsOrdered, names: assetsNamesOrdered})
 }
 }
 })
 //}
 // catch (err) {
 //     console.log('ERR', err)
 //     var status = err.code in statuses ? err.code : 500
 //     var response = assetsIds.length > 0 ? assetsIds.concat([err]) : err
 //     pubsub.publish('error in one process', {code: status, response: response})
 //     //throw new Error({code: status, response: response})
 //     //console.log('counght error!!!!', e)
 //     //pubsub.publish('error in one process', {code: e.status, response: e.response})
 //     return
 // }
 }

 })
 //}
 //
 //
 // catch (err) {
 //     console.log('ERR', err)
 //     var status = err.code in statuses ? err.code : 500
 //     var response = assetsIds.length > 0 ? assetsIds.concat([err]) : err
 //     pubsub.publish('error in one process', {code: status, response: response})
 //     //throw new Error({code: status, response: response})
 //     //console.log('counght error!!!!', e)
 //     pubsub.publish('error in one process', {code: e.status, response: e.response})
 //     return
 // }
 }*/

//}

// catch (err) {
//     console.log('!!!', err)
//     err = JSON.parse(err.message)
//     var code = err.code in statuses ? err.code : 500
//     var response = assetsIds.length > 0 ? assetsIds.concat([err]) : err
//     //pubsub.publish('error in one process', {code: status, response: response})
//     //throw new Error({code: status, response: response})
//     //console.log('counght error!!!!', e)
//     try {
//         pubsub.publish('send response', {code: code, response: response})
//     }
//     finally {
//         // return
//     }
//
// }
 
