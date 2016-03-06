var $ = require('jquery'),
    decryptor = require('./decryptor.js');

var inited = false;
function init(){
    if(inited) return;
    $('#results').show();
    inited = true;
}

decryptor.registerMessageDisplayer(function(message){
    init();
    
    $('<div>')
    .appendTo('#results')
    .text(message)
    ;
});
