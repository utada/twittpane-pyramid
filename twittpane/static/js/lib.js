String.prototype.linkify = function () {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function (m) {
          return '<a target="_blank" href="'+m+'" class="linkify">'+m+'</a>';
    });
};

String.prototype.linkuser = function () {
    return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
      var username = u.replace("@", "");
      return '<a target="_blank" href="http://twitter.com/'+username+'" class="linkuser">'+u+'</a>';
    });
};

String.prototype.linktag = function () {
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
    var tag = t.replace("#", "%23");
    return '<a target="_blank" href="http://search.twitter.com/search?q='+tag+'" class="linktag">'+t+'</a>';
  });
};

String.prototype.linktweet = function () {
  return '<a target="_blank" href="http://twitter.com/#!/'+user_str+'/status/'+this+'" class="linktweet">'+this+'</a>';
};

String.prototype.compressUrl = function () {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(m) {
    bitlyLib.shorten(m, function(json) {
      shorturl = json.data.url;
    });
  });
};

String.prototype.returnUrl = function () {
  return this.match(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g);
};

function getUrlVars() { 
  var vars = [], hash; 
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'); 
  for(var i = 0; i < hashes.length; i++) { 
    hash = hashes[i].split('='); 
    vars.push(hash[0]); 
    vars[hash[0]] = hash[1]; 
  }
  return vars;
}

function strip_tags(text){
  return text.replace(/<\/?[^>]+>/gi, '');
}

jQuery.fn.reverse = Array.prototype.reverse;
String.prototype.linkify = function () {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function (m) {
          return '<a target="_blank" href="'+m+'" class="linkify">'+m+'</a>';
    });
};
String.prototype.compressUrl = function () {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g, function(m) {
    bitlyLib.shorten(m, function(json) {
      shorturl = json.data.url;
    });
  });
};
String.prototype.returnUrl = function () {
  return this.match(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/g);
};
String.prototype.linkuser = function () {
    return this.replace(/[@]+[A-Za-z0-9-_]+/g, function (u) {
      var username = u.replace("@", "");
      return '<a target="_blank" href="http://twitter.com/'+username+'" class="linkuser">'+u+'</a>';
    });
};
/*
String.prototype.rtuser = function () {
  return this.replace(/^[@]+[A-Za-z0-9-_]+[:]/g, function (u) {
    return u.replace(":", "")
  });
}
*/
String.prototype.rtuser = function () {
  var u = this.match(/^[@]+[A-Za-z0-9-_]+[:]/);
  return u[0].replace(":", "").replace("@","");
};

/*
String.prototype.linktag = function () {
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function (t) {
    var tag = t.replace("#", "%23");
    return '<a target="_blank" href="http://search.twitter.com/search?q='+tag+'" class="linktag">'+t+'</a>';
  });
};
*/

/*
String.prototype.linktag = function () {
  return this.replace(/(?:#|\uFF03)([a-zA-Z0-9_\u3041-\u3094\u3099-\u309C\u30A1-\u30FA\u3400-\uD7FF\uFF10-\uFF19\uFF20-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9E]+)/g, function (t) {
    var tag = t.replace("#", "%23");
    return '<a target="_blank" href="http://search.twitter.com/search?q='+tag+'" class="linktag">'+t+'</a>';
  });
};
*/

/*
 *  set hash tags to linkable (support Japanese tags)
 */
String.prototype.linktag = function () {
  return this.replace(/#([\w一-龠ぁ-んァ-ヴー]+)/g, function (t) {
    var tag = t.replace("#", "%23");
    return '<a target="_blank" href="http://twitter.com/search?q='+tag+'" class="linktag">'+t+'</a>';
  });
};

String.prototype.linkword = function () {
  var tag = this.replace("#", "%23");
  var string = '<a target="_blank" href="http://search.twitter.com/search?q='+tag+'" class="linktag">'+this+'</a>';
  return string;
};

Number.prototype.leftZeroPad = function(numZeros) {
  var n = Math.abs(this);
  var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
  var zeroString = Math.pow(10,zeros).toString().substr(1);
  if( this < 0 ) {
    zeroString = '-' + zeroString;
  }
  return zeroString+n;
};

