var nextOpacity = 1;
function openTab(pin) {
  chrome.extension.sendRequest({type: 'open_tab', pin: pin}, function(response) {});
}
function animateLoop() {
  if(nextOpacity == 1) {
    nextOpacity = 0.3;
  } else {
    nextOpacity = 1;
  }
  $("div.message-content.new_div").animate({opacity: nextOpacity}, 500, null, animateLoop);
}
function getAuthPin() {
  chrome.extension.sendRequest({type: 'check_pin'}, function(response) {
    var fullText = $('div#bd').text();
    console.log(fullText);
    if(fullText.match(/twittpane/i) && !fullText.match(/denied/i)) {
      var pin = $.trim($("#oauth_pin code").text());
      var session_user_name = $('span.name').text();
      console.log(session_user_name);
      $("<div class='message-content new_div'>").html("<h2>Please wait, authorizing twittpane...</h2>Your PIN number is: " +  pin).insertAfter("div#oauth_pin");
      animateLoop();

      chrome.extension.sendRequest({type: 'oauth_pin',pin: pin,session_user_name: session_user_name}, function(response) {
        $("div.message-content.new_div").css('opacity', 1);
        $("div.message-content.new_div").stop();

        if (pin) {
          $("div.message-content.new_div").html(
            "<h2>Congratulations, you've been successfully authenticated.</h2><div id='oauth_pin' style='font-size: 2.5em;'>Twittpane authorized!</div>");
          setTimeout(function() {
            openTab(pin);
          }, 3000);
        } else {
          $("div.message-content.new_div").html("<h2>Oops... Something went wrong. Please, try clicking Twittpane icon again.</h2>");
          return false;
        }

      });
    }
  });
}

getAuthPin();
