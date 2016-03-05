/* Interfaces to OpenPGP.js */

var openpgp = require('./openpgp.min.js'),
    u8ary = require('./uint8array.js');

var sha256 = openpgp.crypto.hash.sha256;

module.exports.decrypt = function decrypt(ciphertext, password){
    return openpgp.decrypt({
        message: openpgp.message.readArmored(ciphertext),
        password: password,
    });
}

var hmac = function hmac(message, key){
    var blocksize = 64;
    
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


console.log(hmac(new Uint8Array(1), new Uint8Array(1)))
