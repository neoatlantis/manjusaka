var $ = require('jquery');
var decryptor = require('./decryptor.js'),
    crypto = require('./crypto.js');

function reviewAnswerState(){
    /* Review if currently all questions are decided, and process any related
     * tasks, e.g. ask decryptor to review its state. */
    var allAnswered = true;
    $('#qa .answer-question').each(function(){
        if(!$(this).data('decided')) allAnswered = false;
    });
    if(allAnswered){
        $('#qa').hide();
    }
    decryptor.reviewAndDecryptMessages();
}



function verifyAnswerFactory(qaID, questionID){
    function callback(passed){
        if(passed){
            $('#' + qaID).data('decided', true).hide();
            reviewAnswerState();
        }
    }
    return function verifyAnswer(){
        if($('#' + qaID).data('decided')) return;
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
    .addClass('answer-question')
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
    // try first decryption, since some messages may not need questions
    reviewAnswerState();
}
