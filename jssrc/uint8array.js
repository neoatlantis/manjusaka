/* Utilities dealing with Uint8Array */

function concat(ary){
    var i, j, count=0;
    for(i=0; i<ary.length; i++) count += ary[i].length;
    var concat = new Uint8Array(count), pointer = 0;
    for(i=0; i<ary.length; i++){
        for(j=0; j<ary[i].length; j++){
            concat[pointer] = ary[i][j];
            pointer += 1;
        }
    }
    return concat; 
}

function equal(a, b){
    if(a.length != b.length) return false;
    for(var i=0; i<a.length; i++)
        if(a[i] != b[i]) return false;
    return true;
}

function fill(ary, withByte){
    for(var i=0; i<ary.length; i++) ary[i] = withByte;
    return ary;
}

function xor(a, b){
    if(a.length != b.length) throw Error('xor-unequal-length-buffer');
    var product = new Uint8Array(a.length);
    for(var i=0; i<product.length; i++)
        product[i] = a[i] ^ b[i];
    return product;
}

module.exports = {
    concat: concat,
    equal: equal,
    fill: fill,
    xor: xor,
}
