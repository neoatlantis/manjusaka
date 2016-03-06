var $ = require('jquery');
var decryptor = require('./decryptor.js'),
    crypto = require('./crypto.js');

function verifyAnswerFactory(qaID, questionID){
    function callback(passed){
        if(passed){
            $('#' + qaID).data('decided', true).hide();
        }
    }
    return function verifyAnswer(){
        var answer = $('#' + qaID + ' input').val();
        console.log(
            'verifying question[' + questionID + '] with answer:',
            answer
        );
        decryptor.verifyAnswerAsync(
            questionID,
            answer,
            callback
        );
    }
}

function skipQuestionFactory(qaID){
    return function skipQuestion(){
        $('#' + qaID).data('decided', true).hide();
    }
}

function addOneQuestion(questionID, questionDesc){
    var qaID = 'qa-' + crypto.sha256hex(questionID);
    $('[name="answer-question-template"]')
    .clone()
    .appendTo('#qa')
    .data('decided', false)
    .attr('id', qaID)
    .show()
    .find('[name="desc"]')
        .text(questionDesc)
        .parent()
    .find('button[name="skip"]').click(skipQuestionFactory(qaID))
        .parent()
    .find('input')
        .on('change focusout', verifyAnswerFactory(qaID, questionID))
        .parent()
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
