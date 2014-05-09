chrome.extension.sendRequest({msg:"get_conf"}, function(response) {
  console.log(response);
  var backgroundPage = chrome.extension.getBackgroundPage();
  if (response.undo_retweet_data.current_user_retweet_id) {
    var destroy_id = response.undo_retweet_data.current_user_retweet_id;
  }

  var screen_name    = response.screen_name;
  var to_icon        = response.undo_retweet_data.icon;
  var to_screen_name = response.undo_retweet_data.screen_name;
  var to_name        = response.undo_retweet_data.name;
  $('#clock').clock();
  $('#my_name').html(screen_name);
  $('#my_picture').html('<img src="'+response.profile_image_url+'">');
  $('div#to_icon').html('<img src="'+to_icon+'">');
  $('div#to_text').html(response.undo_retweet_data.text);
  $('div#to_screen_name').html('@'+to_screen_name);
  $('div#to_name').html(to_name);
  $('input#button').click(function(){
    TWITT.jsoauth = backgroundPage.TWITT.jsoauth;
    TWITT.jsoauth.destroyStatuses(destroy_id, function(data) {
      var json = JSON.parse(data.text);
      console.log(json);
      if (json.status === 403) {
        console.log(json.status);
        $('div#to_destroy').html(json.responseText);
        $('form').hide();
        return;
      }
      $('div#to_destroy').fadeOut();
      $('form').hide();
      chrome.extension.sendRequest({msg:"destroy_retweet", "body": response.undo_retweet_data}, function(response) {
      });
    });
  });
});
