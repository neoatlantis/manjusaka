var $ = require('./jquery.js'),
    decryptor = require('./decryptor.js');

var selBase = '#input-category-password';

$(selBase + ' input').on('change focusout', function(){
    var val = $(this).val().trim();
    $(this).removeClass('incorrect');
    if(!val) return;
    if(decryptor.testCategoryPassword(val)){
        var ackCount = decryptor.countCategoryPasswords();
        $(this).val('');
        $(selBase + ' [name="ack-count"]').text(ackCount);
        if(ackCount > 0) $(selBase + ' button').attr('disabled', false);
    } else {
        $(this).addClass('incorrect');
    }
}).keypress(function(e){
    $(this).removeClass('incorrect');
    if(!$(this).val().trim() && 13 == e.keyCode){
        $(this).parent().find('button').click();
    }
});

$(selBase + ' button').click(function(){
    require('./ui-answer-questions.js').show();
    module.exports.hide();
});


module.exports.hide = function(){
    $(selBase).hide();
}

module.exports.show = function(){
    $(selBase).show();
}
