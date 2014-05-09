chrome.extension.sendRequest({msg:"get_conf"}, function(response) {    
  console.log(response);
  var backgroundPage = chrome.extension.getBackgroundPage();
  var screen_name = response.screen_name;
  var to_screen_name = response.retweet_data.screen_name;
  var to_name = response.retweet_data.name;
  $('#clock').clock();
  $('#my_name').html(screen_name);
  $('#my_picture').html('<img src="'+response.profile_image_url+'">');
  $('#to_icon').html('<img src="'+response.retweet_data.icon+'">');
  $('#to_text').html(response.retweet_data.text);

  if (undefined === response.retweet_data.reply_intents_rt_name) {
    // RT
    $('#to_screen_name').html('@'+to_screen_name);
    $('textarea#reply').val('@'+screen_name+' ');
    $('#to_name').html(to_name);
  } else {
    // RT to official RT
    $('#to_name').html(TWITT.retweet_data.reply_intents_rt_name);
    $('#to_screen_name').html('@'+TWITT.retweet_data.reply_intents_rt_screen_name);
    $('textarea#reply').val('@'+TWITT.retweet_data.reply_intents_rt_screen_name+' @'+screen_name+' ');
  }
  if (response.retweet_data.share === "true") {
    $('textarea#reply').val('RT @'+screen_name+' '+response.retweet_data.text);
  }

  $('input#button').click(function(){
    console.log('click');
    var tweet = $('textarea#reply').val();
    TWITT.jsoauth = backgroundPage.TWITT.jsoauth;
    //console.log(response);
    //console.log(response.retweet_data.in_reply_to);
    TWITT.jsoauth.retweetStatuses(response.retweet_data.in_reply_to, function(data) {
      var json = JSON.parse(data.text);
      console.log(json);
      if (json.status === 403) {
        console.log(json);
        $('#to_reply').html(json.responseText);
        return;
      }
      if (json.status === 404) { // RTしようとしたtweetが削除済みのときとか
        console.log(json);
        $('div#to_reply').html(json.responseText);
        return;
      }

      // clear after post
      $('.container-fluid').fadeOut();
      $('.container-fluid.well').fadeOut();
      //$('form').hide();

      chrome.extension.sendRequest({msg: "retweet_on", body: response.retweet_data, json: json}, function(response) {});

      // close tweet window
      window.open('', '_self', ''); //bug fix
      window.close();

    });
  });
});
