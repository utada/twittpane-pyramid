chrome.extension.sendRequest({msg:"get_conf"}, function(response) {
  var backgroundPage = chrome.extension.getBackgroundPage();
  var destroy_id     = response.destroy_data.destroy_id;
  var screen_name    = response.screen_name;
  var to_icon        = response.destroy_data.icon;
  var to_screen_name = response.destroy_data.screen_name;
  var to_name        = response.destroy_data.name;
  $('#clock').clock();
  $('#my_name').html(screen_name);
  $('#my_picture').html('<img src="'+response.profile_image_url+'">');
  $('#to_icon').html('<img src="'+to_icon+'">');
  $('#to_text').html(response.destroy_data.text);
  $('#to_screen_name').html('@'+screen_name);
  $('#to_name').html(to_name);
  $('input#button').click(function(){
    TWITT.jsoauth = backgroundPage.TWITT.jsoauth;
    TWITT.jsoauth.destroyStatuses(destroy_id, function(data) {
      var json = JSON.parse(data.text);
      console.log(json);
      if (json.status === 403) {
        console.log(json.status);
        $('#to_destroy').html(json.responseText);
        $('form').hide();
        return;
      }

      // postå„Ç…ï\é¶Çè¡Ç∑
      $('.container-fluid').fadeOut();
      $('.container-fluid.well').fadeOut();

      chrome.extension.sendRequest({msg:"destroy_tweet","destroy_id":destroy_id}, function(response) {
      });

      // close tweet window
      window.open('', '_self', ''); //bug fix
      window.close();

    });
  });
});
