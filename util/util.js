var validationErrorMessage = 'Validation error';
var validationErrorCode = 400
var integerRegex = /^\+?(0|[1-9]\d*)$/
var statuses = require('body-parser/node_modules/http-errors/node_modules/statuses/codes.json')
var pubsub = require('pubsub-js')
var async = require('async')
var Util = {
    coluCalls: {
        validateIssueAssets: function (inputAssets) {
            var errorCode
            var errorResponse
            var inputAssetsReadyForAction = []
            if (!Array.isArray(inputAssets)) {
                errorCode = validationErrorCode
                errorResponse = {
                    code: validationErrorCode,
                    message: validationErrorMessage,
                    explanation: 'input assets is not an array'
                }
            }
            else if (inputAssets.length === 0) {
                errorCode = validationErrorCode
                errorResponse = {
                    code: validationErrorCode,
                    message: validationErrorMessage,
                    explanation: 'input assets has length of 0, there is nothing to issue'
                }
            }
            !errorCode && inputAssets.some(function validateAssetInput(asset, index) {
                if (!(Object.prototype.toString.call(asset) === '[object Object]')) {
                    errorCode = validationErrorCode
                    errorResponse = {
                        code: validationErrorCode,
                        message: validationErrorMessage,
                        explanation: 'input assets at ' + index + ' is not an Object'
                    }
                }
                else if (!asset.hasOwnProperty('amount')) {
                    errorCode = validationErrorCode
                    errorResponse = {
                        code: validationErrorCode,
                        message: validationErrorMessage,
                        explanation: 'input assets at ' + index + ', amount is not specified'
                    }
                }
                else if (!integerRegex.test(asset.amount) || parseInt(asset.amount) >= Math.pow(2, 54) - 1 || parseInt(asset.amount) <= 0) {
                    errorCode = validationErrorCode
                    errorResponse = {
                        code: validationErrorCode,
                        message: validationErrorMessage,
                        explanation: 'input assets at ' + index + ', amount should be an integer between 1 and (2^54)-2'
                    }
                }
                else {
                    inputAssetsReadyForAction.push({
                        amount: asset.amount,
                        metadata: {
                            assetName: asset.assetName
                        }
                    })
                }
                if (errorCode) return true
            })
            return {
                errorCode: errorCode,
                errorResponse: errorResponse,
                inputAssetsReadyForAction: inputAssetsReadyForAction
            };
        },
        validateSendAsset: function (body) {
            var errorCode
            var errorResponse
            for (var key in body) {
                if (errorCode) break
                var value = body[key]
                switch (key) {
                    case 'toAddress':
                        if (!(typeof  value === 'string')) {
                            errorCode = validationErrorCode
                            errorResponse = {
                                code: validationErrorCode,
                                message: validationErrorMessage,
                                explanation: key + ' is not a string'
                            }
                        }
                        else if (value.length === 0) {
                            errorCode = validationErrorCode
                            errorResponse = {
                                code: validationErrorCode,
                                message: validationErrorMessage,
                                explanation: key + ' has length of 0'
                            }
                        }
                        else if (value.indexOf(' ') >= 0) {
                            errorCode = validationErrorCode
                            errorResponse = {
                                code: validationErrorCode,
                                message: validationErrorMessage,
                                explanation: key + ' has spaces in it, cannot be a valid address'
                            }
                        }
                        break
                    case 'assetId':
                        if (!(typeof  value === 'string')) {
                            errorCode = validationErrorCode
                            errorResponse = {
                                code: validationErrorCode,
                                message: validationErrorMessage,
                                explanation: key + ' is not a string'
                            }
                        }
                        else if (value.length === 0) {
                            errorCode = validationErrorCode
                            errorResponse = {
                                code: validationErrorCode,
                                message: validationErrorMessage,
                                explanation: key + ' has length of 0'
                            }
                        }
                        else if (value.indexOf(' ') >= 0) {
                            errorCode = validationErrorCode
                            errorResponse = {
                                code: validationErrorCode,
                                message: validationErrorMessage,
                                explanation: key + ' has spaces in it, cannot be a valid assetId'
                            }
                        }
                        break
                    case 'amount':
                        if (!integerRegex.test(value) || parseInt(value) >= Math.pow(2, 54) - 1 || parseInt(value) <= 0) {
                            errorCode = validationErrorCode
                            errorResponse = {
                                code: validationErrorCode,
                                message: validationErrorMessage,
                                explanation: key + ' should be an integer between 1 and (2^54)-2'
                            }
                        }
                        break
                    default:
                        break
                }
            }
            return {errorCode: errorCode, errorResponse: errorResponse};
        },
        returnResponse: function(err, results, sendResponse){
            if (err) return sendResponse( {code: err.code in statuses ? err.code : 500, response: err})
            return sendResponse({code: 200, response: results})
        },
        getAssets: function (colu, sendResponse) {
            var self = this
            async.waterfall(
                [
                    function (callback) {
                        colu.getAssets(function (err, assets) {// case of success
                            if (err) return callback({code: err.code in statuses ? err.code : 500, response: err})
                            var assetsIds = [];
                            assets && assets.forEach(function (asset) {
                                assetsIds.push(asset.assetId);
                            });
                            return callback(null, assetsIds);

                        });
                    }
                ],
                function(err, results){
                    return self.returnResponse(err, results, sendResponse)
                }
                
            )

        },
        issueAssets: function (colu, inputAssets, sendResponse) {
            var response = this.validateIssueAssets(inputAssets);
            var errorCode = response.errorCode;
            var errorResponse = response.errorResponse;
            var inputAssetsReadyForAction = response.inputAssetsReadyForAction;
            if (errorCode) return sendResponse({code: errorCode, response: errorResponse})
            console.log(inputAssetsReadyForAction)
            var allFunctions = []
            inputAssetsReadyForAction.forEach(function (assetToIssue) {
                var issueAndGetAssetMetadata = function (callback) {
                    colu.issueAsset(assetToIssue, function (err, assetObject) {
                        console.log('$$$', assetObject)
                        if (err) return callback(err)
                        colu.coloredCoins.getAssetMetadata(assetObject.assetId, assetObject.txid + ':0', function (err, assetData) {
                            if (err) return callback(err)
                            console.log('%%%', assetData)
                            var assetName = assetData.metadataOfIssuence.data.assetName
                            var assetId = assetData.assetId
                            //console.log(assetName, assetId)
                            return callback(null, assetId)
                        })
                    })
                }
                allFunctions.push(issueAndGetAssetMetadata)
            })
            var finishedAll = function (err, results) {
                console.log(results)
                var response = []
                var status = 200
                results.forEach(function (result) {
                    if (result.value) {
                        response.push(result.value)
                    }
                    else {
                        status = result.error && result.error.code in statuses ? result.error.code : result.error && result.error.message && result.error.message.status in statuses ? result.error.message.status : 500
                        response.push(result.error)
                    }
                })
                return sendResponse({code: status, response: response})
            }

            async.parallel(
                async.reflectAll(allFunctions),
                finishedAll
            )
        },
        sendAsset: function (colu, body, sendResponse) {
            var self = this
            var errorCodeAndResponse = this.validateSendAsset(body);
            var errorCode = errorCodeAndResponse.errorCode;
            var errorResponse = errorCodeAndResponse.errorResponse;
            if (errorCode) return sendResponse({code: errorCode, response: errorResponse})

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
                        colu.coloredCoins.getStakeHolders(body.assetId, function (err, assetHolders) {
                            //console.log('###',assetHolders)
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
                                // if (sumAllAmountsOfAssetInWallet < body.amount) {
                                //     return callback({
                                //         code: 500, response: {
                                //             code: 20004,
                                //             status: 500,
                                //             name: 'NotEnoughAssetsError',
                                //             message: 'Not enough assets to cover transfer transaction',
                                //             asset: body.assetId
                                //         }
                                //     })
                                // }
                                callback(null, from)
                            }
                        })
                    },
                    function (from, callback) {
                        colu.coloredCoins.getAddressInfo(body.toAddress, function (err, addressInfo) {
                            //console.log(err, addressInfo)
                            if (err) return callback(err)
                            if (!Array.isArray(addressInfo.utxos) || addressInfo.utxos.length === 0)
                                return callback({code: 500, response: 'toAddress does not exist'})
                            callback(null, from)
                        })
                    },
                    function (from, callback) {
                        var to = [{address: body.toAddress, assetId: body.assetId, amount: body.amount}]
                        var args = {from: from, to: to};
                        colu.sendAsset(args, function (err, sentAsset) {
                            if (err) return callback(err)
                            //test:
                            colu.getAssets(function (err, assets) {
                                console.log('asset in wallet: ')
                                assets.forEach(function (asset) {
                                    console.log(asset.address, asset.amount, asset.assetId)
                                })
                                colu.coloredCoins.getStakeHolders(body.assetId, function (err, assetHolders) {
                                    console.log('asset everywhere: ')
                                    assetHolders.holders.forEach(function (assetHolder) {
                                        console.log(assetHolder.address, assetHolder.amount)
                                    })
                                })
                            })
                            return callback(null, sentAsset.financeTxid)//or txid, need to see what;s the difference!
                        })
                    }
                ], function (err, results) {
                    return self.returnResponse(err, results, sendResponse)
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
                while (!this.signMantisExponentTable[significantDigits] && significantDigits <=17) {
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
            if (!integerRegex.test(number) || parseInt(number) > Number.MAX_SAFE_INTEGER) {
                return sendResponse({
                    code: validationErrorCode,
                    response: {
                        code: validationErrorCode,
                        message: validationErrorMessage,
                        explanation: 'number should be an integer between 0 and (2^53)-1 (Number.MAX_SAFE_INTEGER)'
                    }
                })
            }
            var response = this.encodeFullNumber(parseInt(number))
            if(response.code) return sendResponse(response)
            return sendResponse({code: 200, response: response})
        },
    }
}
module.exports = Util;


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
 
