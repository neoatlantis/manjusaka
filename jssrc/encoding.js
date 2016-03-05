function ArrayBufferToUTF16(src){
    if(!0 == src.byteLength % 2) throw new Error('decoding-error');

    var src = new Uint16Array(src), i = 0, code, low, high,
        s = '';
    while(i < src.length){
        code = src[i];
        if(
            (code >= 0x0000 && code <= 0xD7FF) ||
            (code >= 0xE000 && code <= 0xFFFF)
        ){
            s += String.fromCharCode(code);
            i += 1;
        } else if(code >= 0xD800 && code <= 0xDBFF){
            high = code;
            low = src[i+1];
            i += 2;
            if(low >= 0xDC00 && low <= 0xDFFF){
                s += String.fromCharCode(high) + String.fromCharCode(low);
            } else
                throw new Error('decoding-error');
        } else
            throw new Error('decoding-error');
    };

    return s;
};

//////////////////////////////////////////////////////////////////////////////

function encoding(src, format){
    var self = this;

    var buffer = null;

    var tableB64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        tableHEX = "0123456789abcdef";

    var type = require('./type.js')(src);
    
    if(type.isUint8Array())
        buffer = src.buffer;
    else if(type.isArrayBuffer())
        buffer = src;
    else if(type.isArray()){
        var copy = new Uint8Array(src.length);
        for(var i=0; i<copy.length; i++) copy[i] = src[i] & 0xFF;
        buffer = copy.buffer;
    } else if(type.isString()){
        if(!format) format = '';
        switch(format.toLowerCase()){
            case 'hex': 
                if(!/^[0-9a-f]+$/i.test(src) || 0 != src.length % 2)
                    throw Error('invalid-encoding-choosen');
                src = src.toLowerCase();

                var cbuf = new Uint8Array(src.length / 2);
                for(var i=0; i<cbuf.length; i++)
                    cbuf[i] = tableHEX.indexOf(src[2*i]) * 16
                        + tableHEX.indexOf(src[2*i+1]);

                buffer = cbuf.buffer;
                break;
            case 'base64':
                if (/(=[^=]+|={3,})$/.test(src))
                    throw Error('invalid-encoding-choosen');
                src = src.replace(/=/g, "");
                var n = src.length & 3;
                if(1 == n) throw Error('invalid-encoding-choosen');

                var i=0, j=0, len=Math.ceil(src.length / 4);
                var cbuf = new Uint8Array(len * 3);
                var a, b, c, d;
                for (i=0; i<len; i++) {
                    a = tableB64.indexOf(src[j++] || "A");
                    b = tableB64.indexOf(src[j++] || "A");
                    c = tableB64.indexOf(src[j++] || "A");
                    d = tableB64.indexOf(src[j++] || "A");
                    if ((a | b | c | d) < 0)
                        throw Error('invalid-encoding-choosen');
                    cbuf[i*3] = ((a << 2) | (b >> 4)) & 255;
                    cbuf[i*3+1] = ((b << 4) | (c >> 2)) & 255;
                    cbuf[i*3+2] = ((c << 6) | d) & 255;
                };
                buffer = cbuf.buffer.slice(0, cbuf.length + n - 4);
                break;
            case 'ascii':
                // each unit in the string is treated as a one-byte char
                var cbuf = new Uint8Array(src.length);
                for(var i=0; i<cbuf.length; i++)
                    cbuf[i] = src.charCodeAt(i) & 0xFF;
                buffer = cbuf.buffer;
                break;
            default:
                var cbuf = new Uint16Array(src.length);
                for(var i=0; i<src.length; i++) cbuf[i] = src.charCodeAt(i);
                buffer = cbuf.buffer;
                break;
        };
    } else
        throw Error('unknown-encoding');

    this.toUint8Array = function(){
        return new Uint8Array(buffer);
    };

    this.toArrayBuffer = function(){
        return buffer;
    };

    this.toUTF16 = function(){
        return ArrayBufferToUTF16(buffer);
    };

    this.toBase64 = function(){
        var view = new Uint8Array(buffer);
        var i=0, j=0, k=0, len=view.length / 3;
        var b64 = '';

        var a, b, c;
        for(i=0; i<len; ++i) {
            a = view[j++];
            b = view[j++];
            c = view[j++];
            b64 += tableB64[a >> 2] + tableB64[((a << 4) & 63) | (b >> 4)]
                 + (isNaN(b) ? "=" : tableB64[((b << 2) & 63) | (c >> 6)])
                 + (isNaN(b + c) ? "=" : tableB64[c & 63]);
        };
        return b64;
    };

    this.toHEX = function(){
        var view = new Uint8Array(buffer), s = '';
        for(var i=0; i<view.length; i++){
            if(view[i] < 16)
                s += '0' + view[i].toString(16);
            else
                s += view[i].toString(16);
        };
        return s;
    };

    this.toASCII = function(){
        var view = new Uint8Array(buffer), s = '';
        for(var i=0; i<view.length; i++)
            s += String.fromCharCode(view[i]);
        return s;
    };

    this.toArray = function(){
        var view = new Uint8Array(buffer), ret = new Array(view.length);
        for(var i=0; i<ret.length; i++) ret[i] = view[i];
        return ret;
    };

    return this;
};



module.exports = function(a,b){
    return new encoding(a,b);
}
