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
