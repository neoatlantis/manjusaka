/* Interfaces to OpenPGP.js */

var openpgp = require('./openpgp.min.js'),
    u8ary = require('./uint8array.js'),
    type = require('./type.js'),
    encoding = require('./encoding.js');

var sha256 = openpgp.crypto.hash.sha256;

module.exports.sha256hex = function(i){
    return encoding(sha256(i)).toHEX();
}

module.exports.decrypt = function(ciphertext, password){
    return openpgp.decrypt({
        message: openpgp.message.readArmored(ciphertext),
        password: password,
    });
}

var hmac = function(message, key){
    var blocksize = 64;
    key = u8ary.copy(key);
    
    if(key.length > blocksize){
        key = sha256(key);
    } else {
        key = u8ary.concat([
            key,
            u8ary.fill(new Uint8Array(blocksize - key.length), 0)
        ]);
    }

    var o_key_pad = u8ary.xor(
        u8ary.fill(new Uint8Array(blocksize), 0x5c),
        key
    );
    var i_key_pad = u8ary.xor(
        u8ary.fill(new Uint8Array(blocksize), 0x36),
        key
    );
   
    return sha256(u8ary.concat([
        o_key_pad,
        sha256(u8ary.concat([
            i_key_pad,
            message,
        ])),
    ]));
}
module.exports.hmac = hmac;
//console.log(hmac(new Uint8Array(1), new Uint8Array(1)))




var verifyCategoryPassword = function(hint, password){
    var pwdhash = encoding(sha256(password)).toHEX().toLowerCase();
    return pwdhash.slice(0, hint.length) == hint;
}
module.exports.verifyCategoryPassword = verifyCategoryPassword;
//console.log(verifyCategoryPassword('9834876dcfb05cb1', 'aaa'));


var deriveDecryptionPassword = function(
    categoryPassword,
    questionSeedInfo
){
    /* questionSeedInfo: {question-id1: seed1, question-id2: seed2} */
    if(!questionSeedInfo) questionSeedInfo = {};
    categoryPassword = encoding(categoryPassword, 'ascii').toUint8Array();

    var questionIDs = Object.keys(questionSeedInfo);
    questionIDs.sort();

    var questionSeeds = [];
    for(var i in questionIDs){
        questionSeeds.push(questionSeedInfo[questionIDs[i]]);
    }

    var hmacs = [];
    for(var i in questionSeeds){
        hmacs.push(hmac(categoryPassword, questionSeeds[i]));
    }

    var finalKey = encoding(hmac(
        categoryPassword,
        u8ary.concat(hmacs)
    )).toHEX().toLowerCase();
    return finalKey;
}
module.exports.deriveDecryptionPassword = deriveDecryptionPassword;
//console.log(deriveDecryptionPassword('test', {question: new Uint8Array(4)}));

