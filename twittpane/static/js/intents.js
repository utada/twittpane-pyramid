chrome.windows.getCurrent(function(windows) {
  console.log(this.id);
  windowid = this.id;
});


chrome.extension.sendRequest({msg:"get_conf"}, function(response) {
  var backgroundPage = chrome.extension.getBackgroundPage();
  var TWITT = backgroundPage.TWITT;
  var screen_name = response.screen_name;
  $('#clock').clock();
  $('#my_name').html(screen_name);
  $('#my_picture').html('<img src="'+response.profile_image_url+'">');
  $('input#button').click(function(){
    $('form').hide();
    var tweet = $('textarea#tweet').val();
    TWITT.jsoauth.updateStatuses(tweet, null, function(data) {
      var json = JSON.parse(data.text);
      var div = TWITT.generate_single_div(json);

      console.log(json);

      chrome.extension.sendRequest({msg: "send_tweet" ,body: div}, function(response) {
      });

      // close tweet window
      window.open('', '_self', ''); //bug fix
      window.close();

    });
  });
});
