var type = require('./type.js');
var crypto = require('./crypto.js');


function encrypt(plaintext, key){
}



module.exports = function getDeptreeEncryptKey(deptreeNode, credentials, plain){
    if(undefined == plain) plain = crypto.randomKey();
    var hint;
    
    if(type(deptreeNode).isString()){
        /* Encrypt `plain` using the credential associated with this node */
        hint = encrypt(plain, credentials[deptreeNode]);
        return {h: hint, n: deptreeNode};

    } else if(type(deptreeNode).isArray()){
        var subKeys = [], subHints = [], subResult;
        var subplain = crypto.randomKey();
        for(var i=1; i<deptreeNode.length; i++){
            if(deptreeNode[0] == 'with-all-of'){
                subResult = getDeptreeEncryptKey(
                    deptreeNode[i],
                    credentials
                );
            } else {
                subResult = getDeptreeEncryptKey(
                    deptreeNode[i],
                    credentials,
                    subplain
                );
            }
            subKeys.push(subResult.h);
            subHints.push(subResult.n);
        }
        if(deptreeNode[0] == 'with-all-of'){
            var combinedKey = crypto.hash(subKeys);
            hint = encrypt(plain, combinedKey);
            return {h: hint, n: ['with-all-of'].concat(subHints)};
        } else if(deptreeNode[0] == 'with-one-of'){
            hint = encrypt(plain, subplain);
            return {h: hint, n: ['with-one-of'].concat(subHints)};
        }
    }
}
