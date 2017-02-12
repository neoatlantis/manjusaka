
var nacl = require('tweetnacl'),
    type = require('./type.js'),
    encoding = require('./encoding.js');
nacl.util = require('tweetnacl-util');


module.exports.randomKey = function(){
    return nacl.util.encodeBase64(nacl.randomBytes(16));
}

module.exports.hash = function hash(i){
    if(type(i).isString()){
        i = nacl.util.decodeUTF8(i);
        return nacl.util.encodeBase64(
            nacl.hash(i)
        );
    }
    var sub = '';
    for(var k=0; k<i.length; k++){
        sub += hash(i[k]);
    }
    return hash(sub);
}

module.exports.decrypt = function(ciphertext, password, binaryOutput){
    binaryOutput = Boolean(binaryOutput);
    return openpgp.decrypt({
        message: openpgp.message.readArmored(ciphertext),
        password: password,
        format: (binaryOutput?'binary':undefined),
    });
}

var hmac = function(message, key){
    var blocksize = 64;
    key = u8ary.copy(key);
    
    if(key.length > blocksize){
        key = sha256(key);
    }
    if(key.length < blocksize){
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
    try{
        var pwdhash = encoding(sha256(password)).toHEX().toLowerCase();
        return pwdhash.slice(0, hint.length) == hint;
    } catch(e){
        console.error(e);
        return false;
    }
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

