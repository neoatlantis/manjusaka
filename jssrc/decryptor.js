var crypto = require('./crypto.js');

// Category Password Collector

var categoryPasswords = {};

module.exports.testCategoryPassword = function(password){
    var puzzle;
    for(var categoryID in hints.categories){
        puzzle = hints.categories[categoryID];
        if(crypto.verifyCategoryPassword(puzzle, password)){
            categoryPasswords[categoryID] = password;
            return true;
        }
    }
    return false;
}

module.exports.countCategoryPasswords = function(){
    return Object.keys(categoryPasswords).length;
}

// Question Answer Collector

var qaSeeds = {};

module.exports.listNecessaryQuestions = function(){
    var ret = {}, message;
    for(var i in messages){
        message = messages[i];
        if(!categoryPasswords[message.category]) continue;
        for(var j in message.questions){
            ret[message.questions[j]] = true;
        }
    }
    for(var i in ret){
        ret[i] = hints.qa[i];
    }
    return ret;
}

module.exports.verifyAnswerAsync = function(questionID, answer, callback){
    /* Verify answer to given question, callback(result) */
    var ciphertext = hints.qa[questionID].puzzle;
    crypto.decrypt(ciphertext, answer, true).then(
        function success(plaintext){
            console.debug("Answer is correct.");
            qaSeeds[questionID] = plaintext.data;
            callback(true);
        },
        function failure(){
            console.debug("Answer is wrong.", arguments);
            callback(false);
        }
    );
}

// Message Decryptor

var messageDisplayers = [];
module.exports.registerMessageDisplayer = function(f){
    messageDisplayers.push(f);
}
    

function decryptMessage(index){
    console.debug("Try to decrypt message No.", index);
    var message = messages[index];
    var ciphertext = message.ciphertext;
    var categoryPassword = categoryPasswords[message.category];
    var requiredQuestions = message.questions;
    var qaSeedsInfo = {}, questionID;
    for(var i in requiredQuestions){
        // gather all decrypted seeds in Question-Answer section for this
        // message
        questionID = requiredQuestions[i];
        qaSeedsInfo[questionID] = qaSeeds[questionID];
    }
    //console.log(categoryPassword, qaSeedsInfo);
    var key = crypto.deriveDecryptionPassword(categoryPassword, qaSeedsInfo);
    //console.log(ciphertext, key);
    crypto.decrypt(ciphertext, key, false).then(
        function success(plaintext){
            console.debug('Successfully decrypted one message.');
            messages[index].plaintext = true; // plaintext.data;
            for(var i in messageDisplayers){
                messageDisplayers[i](plaintext.data);
            }
        },
        function failure(e){
            console.error('Failed decrypting message.', e);
        }
    );
}

module.exports.reviewAndDecryptMessages = function(){
    /* Review which messages are now decryptable, if so, decrypt them */
    for(var i in messages){
        var message = messages[i], allQuestionsAnswered = true;
        if(message.plaintext) continue;
        if(!categoryPasswords[message.category]) continue;
        for(var j in message.questions){
            if(!qaSeeds[message.questions[j]]){
                allQuestionsAnswered = false;
                break;
            }
        }
        if(!allQuestionsAnswered) continue;

        decryptMessage(i);
    }
}
