module.exports = function type(v){
    return {
        isError: function(){
            return toString.apply(v) === '[object Error]';
        },

        isArray: function(){
            return toString.apply(v) === '[object Array]';
        },
    
        isObject: function(){
            return !!v && Object.prototype.toString.call(v) === '[object Object]';
        },
        
        isPrimitive: function(){
            return self.isString(v) || self.isNumber(v) || self.isBoolean(v);
        },
        
        isFunction: function(){
            return toString.apply(v) === '[object Function]';
        },

        isDate: function(){
            return toString.apply(v) === '[object Date]';
        },
        
        isNumber: function(){
            return typeof v === 'number' && isFinite(v);
        },
        
        isString: function(){
            return typeof v === 'string';
        },
        
        isBoolean: function(){
            return typeof v === 'boolean';
        },

        isArrayBuffer: function(){
            return toString.apply(v) === '[object ArrayBuffer]';
        },

        isUint8Array: function(){
            return toString.apply(v) == '[object Uint8Array]';
        },
    };
}
