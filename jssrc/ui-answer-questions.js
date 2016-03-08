var $ = require('./jquery.js');
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


function onInputKeypressFactory(qaID){
    var rootSel = '#' + qaID, inputSel = rootSel + ' input';
    return function(e){
        $(inputSel)
        .removeClass('incorrect')
        ;
    }
}

function verifyAnswerFactory(qaID, questionID){
    var rootSel = '#' + qaID, inputSel = rootSel + ' input';
    function callback(passed){
        $(inputSel).attr('disabled', false);
        if(passed){
            $(rootSel).data('decided', true).hide();
            reviewAnswerState();
        } else {
            $(inputSel).addClass('incorrect');
        }
    }
    return function verifyAnswer(){
        if($(rootSel).data('decided')) return;
        var answer = $(inputSel).attr('disabled', true).val();
        console.debug(
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
        reviewAnswerState();
    }
}

function addOneQuestion(questionID, questionDesc, questionExample){
    var qaID = 'qa-' + crypto.sha256hex(questionID);
    $('[name="answer-question-template"]')
    .clone()
    .attr('name', '')
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
        .on('keypress', onInputKeypressFactory(qaID))
        .on('change', verifyAnswerFactory(qaID, questionID))
        .attr('placeholder', (questionExample?questionExample:''))
        .parent()
    ;
}


var init = false;
module.exports.show = function(){
    if(init) return;
    
    var questions = decryptor.listNecessaryQuestions();
    console.debug('Following questions required:', questions);
    if(Object.keys(questions).length > 0){
        $('#qa').show();
        for(var questionID in questions){
            console.debug('Display question:', questionID);
            addOneQuestion(
                questionID, 
                questions[questionID].q,
                questions[questionID].eg
            );
        }
    }
    // try first decryption, since some messages may not need questions
    reviewAnswerState();

    init = true;
}
