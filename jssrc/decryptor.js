var crypto = require('./crypto.js');

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
