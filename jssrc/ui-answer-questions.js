var $ = require('jquery');
var decryptor = require('./decryptor.js'),
    crypto = require('./crypto.js');

function verifyAnswer(){
}

function skipQuestion(){
}

function addOneQuestion(questionID, questionDesc){
    $('[name="answer-question-template"]')
    .clone()
    .appendTo('#qa')
    .attr('id', 'qa-' + crypto.sha256hex(questionID))
    .show()
    .find('[name="desc"]')
        .text(questionDesc)
        .on('change focusout', verifyAnswer)
        .parent()
    .find('button[name="skip"]').click(skipQuestion)
    ;
}


module.exports.show = function(){
    var questions = decryptor.listNecessaryQuestions();
    if(Object.keys(questions).length > 0){
        $('#qa').show();
        for(var questionID in questions){
            addOneQuestion(questionID, questions[questionID].q);
        }
    }
    // TODO try first decryption, since some messages may not need questions
}
