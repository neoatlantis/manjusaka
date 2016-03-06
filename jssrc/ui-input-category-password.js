var $ = require('jquery'),
    decryptor = require('./decryptor.js');

var selBase = '#input-category-password';

$(selBase + ' input').on('change focusout', function(){
    var val = $(this).val().trim();
    if(!val) return;
    if(decryptor.testCategoryPassword(val)){
        var ackCount = decryptor.countCategoryPasswords();
        $(this).val('');
        $(selBase + ' [name="ack-count"]').text(ackCount);
        if(ackCount > 0) $(selBase + ' button').attr('disabled', false);
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
