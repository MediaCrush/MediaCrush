var BinaryFile=function(k,h,g){var d=k,e=h||0,b=0;this.getRawData=function(){return d};"string"==typeof k?(b=g||d.length,this.getByteAt=function(a){return d.charCodeAt(a+e)&255},this.getBytesAt=function(a,b){for(var f=[],c=0;c<b;c++)f[c]=d.charCodeAt(a+c+e)&255;return f}):"unknown"==typeof k&&(b=g||IEBinary_getLength(d),this.getByteAt=function(a){return IEBinary_getByteAt(d,a+e)},this.getBytesAt=function(a,b){return(new VBArray(IEBinary_getBytesAt(d,a+e,b))).toArray()});this.getLength=function(){return b};
this.getSByteAt=function(a){a=this.getByteAt(a);return 127<a?a-256:a};this.getShortAt=function(a,b){var f=b?(this.getByteAt(a)<<8)+this.getByteAt(a+1):(this.getByteAt(a+1)<<8)+this.getByteAt(a);0>f&&(f+=65536);return f};this.getSShortAt=function(a,b){var f=this.getShortAt(a,b);return 32767<f?f-65536:f};this.getLongAt=function(a,b){var f=this.getByteAt(a),c=this.getByteAt(a+1),d=this.getByteAt(a+2),e=this.getByteAt(a+3),f=b?(((f<<8)+c<<8)+d<<8)+e:(((e<<8)+d<<8)+c<<8)+f;0>f&&(f+=4294967296);return f};
this.getSLongAt=function(a,b){var d=this.getLongAt(a,b);return 2147483647<d?d-4294967296:d};this.getStringAt=function(a,b){for(var d=[],c=this.getBytesAt(a,b),e=0;e<b;e++)d[e]=String.fromCharCode(c[e]);return d.join("")};this.getCharAt=function(a){return String.fromCharCode(this.getByteAt(a))};this.toBase64=function(){return window.btoa(d)};this.fromBase64=function(a){d=window.atob(a)}},BinaryAjax=function(){function k(){var d=null;window.ActiveXObject?d=new ActiveXObject("Microsoft.XMLHTTP"):window.XMLHttpRequest&&
(d=new XMLHttpRequest);return d}function h(d,e,b){var a=k();a?(e&&("undefined"!=typeof a.onload?a.onload=function(){"200"==a.status?e(this):b&&b();a=null}:a.onreadystatechange=function(){4==a.readyState&&("200"==a.status?e(this):b&&b(),a=null)}),a.open("HEAD",d,!0),a.send(null)):b&&b()}function g(d,e,b,a,g,f){var c=k();if(c){var h=0;a&&!g&&(h=a[0]);var l=0;a&&(l=a[1]-a[0]+1);e&&("undefined"!=typeof c.onload?c.onload=function(){"200"==c.status||"206"==c.status||"0"==c.status?(c.binaryResponse=new BinaryFile(c.responseText,
h,l),c.fileSize=f||c.getResponseHeader("Content-Length"),e(c)):b&&b();c=null}:c.onreadystatechange=function(){if(4==c.readyState){if("200"==c.status||"206"==c.status||"0"==c.status){var a={status:c.status,binaryResponse:new BinaryFile("unknown"==typeof c.responseBody?c.responseBody:c.responseText,h,l),fileSize:f||c.getResponseHeader("Content-Length")};e(a)}else b&&b();c=null}});c.open("GET",d,!0);c.overrideMimeType&&c.overrideMimeType("text/plain; charset=x-user-defined");a&&g&&c.setRequestHeader("Range",
"bytes="+a[0]+"-"+a[1]);c.setRequestHeader("If-Modified-Since","Sat, 1 Jan 1970 00:00:00 GMT");c.send(null)}else b&&b()}return function(d,e,b,a){a?h(d,function(h){var f=parseInt(h.getResponseHeader("Content-Length"),10);h=h.getResponseHeader("Accept-Ranges");var c;c=a[0];0>a[0]&&(c+=f);g(d,e,b,[c,c+a[1]-1],"bytes"==h,f)}):g(d,e,b)}}();document.write("<script type='text/vbscript'>\r\nFunction IEBinary_getByteAt(strBinary, iOffset)\r\n\tIEBinary_getByteAt = AscB(MidB(strBinary, iOffset + 1, 1))\r\nEnd Function\r\nFunction IEBinary_getBytesAt(strBinary, iOffset, iLength)\r\n  Dim aBytes()\r\n  ReDim aBytes(iLength - 1)\r\n  For i = 0 To iLength - 1\r\n   aBytes(i) = IEBinary_getByteAt(strBinary, iOffset + i)\r\n  Next\r\n  IEBinary_getBytesAt = aBytes\r\nEnd Function\r\nFunction IEBinary_getLength(strBinary)\r\n\tIEBinary_getLength = LenB(strBinary)\r\nEnd Function\r\n\x3c/script>\r\n");
var ID3={};
(function(){function k(g,d){BinaryAjax(g,function(e){var b=e.binaryResponse;if("TAG"==b.getStringAt(0,3)){e=b.getStringAt(3,30).replace(/\0/g,"");var a=b.getStringAt(33,30).replace(/\0/g,""),k=b.getStringAt(63,30).replace(/\0/g,""),f=b.getStringAt(93,4).replace(/\0/g,"");if(0==b.getByteAt(125))var c=b.getStringAt(97,28).replace(/\0/g,""),m=b.getByteAt(126);else c="",m=0;b=b.getByteAt(127);e={title:e,artist:a,album:k,year:f,comment:c,track:m,genre:255>b?ID3.genres[b]:""}}else e={};h[g]=e;d&&d()},null,
[-128,128])}ID3.genres="Blues;Classic Rock;Country;Dance;Disco;Funk;Grunge;Hip-Hop;Jazz;Metal;New Age;Oldies;Other;Pop;R&B;Rap;Reggae;Rock;Techno;Industrial;Alternative;Ska;Death Metal;Pranks;Soundtrack;Euro-Techno;Ambient;Trip-Hop;Vocal;Jazz+Funk;Fusion;Trance;Classical;Instrumental;Acid;House;Game;Sound Clip;Gospel;Noise;AlternRock;Bass;Soul;Punk;Space;Meditative;Instrumental Pop;Instrumental Rock;Ethnic;Gothic;Darkwave;Techno-Industrial;Electronic;Pop-Folk;Eurodance;Dream;Southern Rock;Comedy;Cult;Gangsta;Top 40;Christian Rap;Pop/Funk;Jungle;Native American;Cabaret;New Wave;Psychadelic;Rave;Showtunes;Trailer;Lo-Fi;Tribal;Acid Punk;Acid Jazz;Polka;Retro;Musical;Rock & Roll;Hard Rock;Folk;Folk-Rock;National Folk;Swing;Fast Fusion;Bebob;Latin;Revival;Celtic;Bluegrass;Avantgarde;Gothic Rock;Progressive Rock;Psychedelic Rock;Symphonic Rock;Slow Rock;Big Band;Chorus;Easy Listening;Acoustic;Humour;Speech;Chanson;Opera;Chamber Music;Sonata;Symphony;Booty Bass;Primus;Porn Groove;Satire;Slow Jam;Club;Tango;Samba;Folklore;Ballad;Power Ballad;Rhythmic Soul;Freestyle;Duet;Punk Rock;Drum Solo;Acapella;Euro-House;Dance Hall".split(";");
var h=[];ID3.loadTags=function(g,d){h[g]?d&&d():k(g,d)};ID3.getAllTags=function(g){if(!h[g])return null;var d={},e;for(e in h[g])h[g].hasOwnProperty(e)&&(d[e]=h[g][e]);return d};ID3.getTag=function(g,d){return h[g]?h[g][d]:null}})();
