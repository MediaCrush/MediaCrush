// BinaryReader
// Refactored by Vjeux <vjeuxx@gmail.com>
// http://blog.vjeux.com/2010/javascript/javascript-binary-reader.html

// Original
//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/classes/binary-parser [rev. #1]

BinaryReader=function(a){this._buffer=a;this._pos=0};
BinaryReader.prototype={readInt8:function(){return this._decodeInt(8,!0)},readUInt8:function(){return this._decodeInt(8,!1)},readInt16:function(){return this._decodeInt(16,!0)},readUInt16:function(){return this._decodeInt(16,!1)},readInt32:function(){return this._decodeInt(32,!0)},readUInt32:function(){return this._decodeInt(32,!1)},readFloat:function(){return this._decodeFloat(23,8)},readDouble:function(){return this._decodeFloat(52,11)},readChar:function(){return this.readString(1)},readString:function(a){this._checkSize(8*
a);var b=this._buffer.substr(this._pos,a);this._pos+=a;return b},seek:function(a){this._pos=a;this._checkSize(0)},getPosition:function(){return this._pos},getSize:function(){return this._buffer.length},_decodeFloat:function(a,b){var c=a+b+1,e=c>>3;this._checkSize(c);var c=Math.pow(2,b-1)-1,f=this._readBits(a+b,1,e),g=this._readBits(a,b,e),d=0,h=2,m=0;do for(var n=this._readByte(++m,e),l=a%8||8,k=1<<l;k>>=1;)n&k&&(d+=1/h),h*=2;while(a-=l);this._pos+=e;return g==(c<<1)+1?d?NaN:f?-Infinity:Infinity:
(1+-2*f)*(g||d?g?Math.pow(2,g-c)*(1+d):Math.pow(2,-c+1)*d:0)},_decodeInt:function(a,b){var c=this._readBits(0,a,a/8),e=Math.pow(2,a);this._pos+=a/8;return b&&c>=e/2?c-e:c},_shl:function(a,b){for(++b;--b;a=1073741824==((a%=2147483648)&1073741824)?2*a:2*(a-1073741824)+2147483648);return a},_readByte:function(a,b){return this._buffer.charCodeAt(this._pos+b-a-1)&255},_readBits:function(a,b,c){var e=(a+b)%8,f=a%8,g=c-(a>>3)-1;a=c+(-(a+b)>>3);var d=g-a;b=this._readByte(g,c)>>f&(1<<(d?8-f:b))-1;for(d&&e&&
(b+=(this._readByte(a++,c)&(1<<e)-1)<<(d--<<3)-f);d;)b+=this._shl(this._readByte(a++,c),(d--<<3)-f);return b},_checkSize:function(a){if(!(this._pos+Math.ceil(a/8)<this._buffer.length))throw Error("Index out of bound");}};
