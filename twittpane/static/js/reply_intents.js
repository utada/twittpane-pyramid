chrome.extension.sendRequest({msg:"get_conf"}, function(response) {
  var backgroundPage = chrome.extension.getBackgroundPage();
  var screen_name = response.screen_name;
  var to_icon = response.icon;
  var to_name = response.reply_data.name;
  var to_screen_name = response.reply_data.screen_name;
  $('#clock').clock();
  $('#my_name').html(screen_name);
  $('#my_picture').html('<img src="'+response.profile_image_url+'">');
  $('div#to_icon').html('<img src="'+response.reply_data.icon+'">');
  $('div#to_text').html(response.reply_data.text);
  // reply
  $('div#to_screen_name').html('@'+to_screen_name);
  $('div#to_name').html(to_name);
  if (response.reply_data.share === "true") {
    // edit reply
    $('textarea#reply').val('RT @'+to_screen_name+' '+response.reply_data.text);
  } else {
    $('textarea#reply').val('@'+to_screen_name+' ');
  }
  $('input#button').click(function(){
    var tweet = $('textarea#reply').val();
    TWITT.jsoauth = backgroundPage.TWITT.jsoauth;
    TWITT.jsoauth.updateStatuses(tweet, response.reply_data.in_reply_to, function(data) {
      var json = JSON.parse(data.text);
      console.log(json);
      var div = TWITT.generate_reply_div(json);

      // fadeout after post
      $('.container-fluid').fadeOut();

      chrome.extension.sendRequest({msg: "send_tweet",body: div}, function(response) {
      });

      // close tweet window
      window.open('', '_self', ''); //bug fix
      window.close();

    });
  });
});

