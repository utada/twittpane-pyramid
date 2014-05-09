
TWITT.initTab();

// close tab
chrome.tabs.onRemoved.addListener(function(tabid) {
  if (tabid === TWITT.conf.tabid) {
    TWITT.conf.tabid = null;
  }
});

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {  if (request.type === 'check_pin') {
    sendResponse({});
  }
  if (request.type === 'oauth_pin') {
    sendResponse({});
    var session_user = request.session_user_name;
    localStorage.session_user = session_user;
  }
  if (request.type === 'open_tab') {
    var pin = request.pin;
    JSOAUTH.getAccessToken(pin, function() {
      TWITT.jsoauth = JSOAUTH;
      TWITT.createTab();
    });
  }
  if (request.msg === "set_screen_name") {
    TWITT.conf.screen_name = request.body.screen_name;
    TWITT.conf.profile_image_url = request.body.profile_image_url;
    TWITT.conf.id_str = request.body.id_str;
  }
  if (request.msg === "get_conf") {
    sendResponse(TWITT.conf);
  }
  // apply new tweet in home_timeline when tweet via popup 
  if (request.msg === "send_tweet") {
    $(request.body).prependTo($('div#home_timeline')).fadeIn("slow",function(){
      $(this).css('background','#223'); // unread color
      TWITT.clickShowButton(this,'home_timeline');
    });
  }
  if (request.msg === "reply") {
    console.log(request.body);
    TWITT.conf.reply_data = request.body;
    TWITT.reply_intents(request.body);
  }
  if (request.msg === "retweet") {
    TWITT.conf.retweet_data = request.body;
    TWITT.retweet_intents(request.body);
  }
  if (request.msg === "destroy") {
    TWITT.conf.destroy_data = request.body;
    TWITT.destroy_intents(request.body);
  }
  if (request.msg === "undo_retweet") {
    TWITT.conf.undo_retweet_data = request.body;
    chrome.windows.create({'url':'undo_retweet.html', 'type':'popup', 'width':550, 'height':420}, function(window) {});
  }
  if (request.msg === "share_reply_tweet") {
    $(request.body).prependTo($('div#home_timeline')).fadeIn("slow",function(){
      $(this).css('background','#223'); // unread color
      TWITT.clickShowButton(this,'home_timeline');
    });
  }
  if (request.msg === "destroy_tweet") {
    $('#tw'+request.destroy_id).fadeOut();
  }
  if (request.msg === "destroy_retweet") {
    //console.log(request);

    // RTing following users tweet (it has current_user_retweet data.)
    // remove RT mark
    if (request.body.current_user_retweet_id) {
      $('#tw'+request.body.tweet_id+' .undo_retweet').fadeOut();
    }

  }

  // mark "retweet_on"
  if (request.msg === "retweet_on") {
    $('#tw'+request.body.in_reply_to+' .undo_retweet').show();
    $('#tw'+request.body.in_reply_to+' .undo_retweet').attr('current_user_retweet_id', request.json.id_str);

  }
});

