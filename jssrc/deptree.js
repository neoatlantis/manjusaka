/*
 * Dependency Tree: Compiler, Parser, and Reader
 */

var type = require('./type.js');
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');
var deptreeEncryptKey = require('./deptree.encrypt.js');


function hash(str){
}

function encrypt(plaintext, key){
}

function decrypt(ciphertext, key){

}



function compileDeptree(deptree, idCompiler){
    /*
     * Translate nodes of a dependency tree, by replacing node's original ID
     * with compiled representations.
     */
    function translate(node){
        if(type(node).isString()){
            if(undefined === map[node]){
                throw Error('[' + node + '] is not defined.');
            }
            return idCompiler(node);
        }
        if(type(node).isArray()){
            if(node.length < 2){
                throw Error(
                    'The node of a dependency tree cannot be empty array.');
            }
            if(node[0] != 'with-all-of' && node[0] != 'with-one-of'){
                throw Error(
                    'Array-style dependency must begin with either' + 
                    '`with-all-of` or `with-one-of` as logic specification.'
                );
            }
            for(var i=1; i<node.length; i++){
                node[i] = translate(node[i]);
            }
            return node;
        }
        throw Error('Unexpected element was found in dependency tree.');
    }
    return translate(deptree);
}


function DependencyTreeCompiler(){
    var self = this;

    var compiledIDs = {},
        credentials = {};

    var idcount = 0;
        
    function compileID(id){
        /*
         * Register a new human assigned(orignal) ID, and generate a random
         * credential for that.
         */
        if(undefined === compiledIDs[id]){
            compiledIDs[id] = (idcount++);
            credentials[compiledIDs[id]] = newRandomCredential();
        }
        return compiledIDs[id];
    }

    function newRandomCredential(){
    }

    function encryptWithDepTree(plaindata, deptree){
        /*
         * Returns a tree-type data structure with decrypt hints, each hint
         * must be decrypted with known credential.
         */
    }


    this.addBlindPassword = function(id, key){
        var nid = compileID(id);
        credentials[nid] = key; // replace default random credential with user
                                // specified input.
        return {
            id: nid,
            type: 'blind',
            check: hash(credentials[nid]),
        }
    }

    this.addCategory = function(id, deptree){
        var nid = compileID(id),
            dep = compileDeptree(deptree, compileID);
        var depDecryptKey = newRandomCredential(),
            depDecryptHint = encryptWithDepTree(depDecryptKey, dep);
        return {
            id: nid,
            type: 'category',
            keyHint: encrypt(credentials[nid], depDecryptKey),
            depTree: dep,
            depHint: depDecryptHint,
            check: hash(credentials[nid]),
        }
    }


    return this;
}










