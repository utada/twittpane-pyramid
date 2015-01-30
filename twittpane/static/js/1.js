(function() {
    $('p.source a').attr('target', '_blank');
    $('.word_menu').click(function() {
        return false;
    });
    $('.head_word_listdown_button').click(function() {
        return false;
    });
    $('.add_word_button').click(function() {
        return false;
    });
    var logo_html = '<div id="logo"><a href="' +
        TWITT.conf.extension_pub_url +
        '" target="_blank"><img src="' + TWITT.conf.home_icon +
        '" width="20" height="20"></a>';
    logo_html += '</div>';

    /*
    $('#logout').click(function() {
        TWITT.jsoauth.endSession(function(data) {
          var json = JSON.parse(data.text);
          TWITT.removeTab(backgroundPage.TWITT.conf.tabid);
        });
    });
    */

    /*
     * pick up list name (pane 1)
     */
    /*
    $('#head_tweets1').delegate('li.lists_list', 'click', function() {
      var pane_id = 1;
      var name = $(this).find('a').attr('list_name');

      // stop current search
      if (TWITT.conf.search_data["1"] !== undefined) {
        clearTimeout(TWITT.conf.search_data["1"].timer);
      }
      if (TWITT.conf.lists_data["1"] !== undefined) {
        clearTimeout(TWITT.conf.lists_data["1"].timer);
      }

      $('#tweets'+pane_id+' .tweet').remove();

      var params = {
        "name": name,
        "max_id_str": 0
      };

      if (TWITT.conf.lists_data["1"] != undefined) {
        TWITT.conf.lists_data["1"].max_id_str = undefined;
      }

      TWITT.list_timeline(params, pane_id);
      TWITT.change_list_words(pane_id, params.name);
    });
    */

    /*
     * pick up list name (pane 2)
     */
    /*
    $('#head_tweets2').delegate('li.lists_list', 'click', function() {
      var pane_id = 2;
      var name = $(this).find('a').attr('list_name');

      // stop current search
      if (TWITT.conf.search_data["2"] !== undefined) {
        clearTimeout(TWITT.conf.search_data["2"].timer);
      }
      if (TWITT.conf.lists_data["2"] !== undefined) {
        clearTimeout(TWITT.conf.lists_data["2"].timer);
      }

      $('#tweets'+pane_id+' .tweet').remove();

      var params = {
        "name": name,
        "max_id_str": 0
      };

      if (TWITT.conf.lists_data["2"] != undefined) {
        TWITT.conf.lists_data["2"].max_id_str = undefined;
      }

      console.log(params);
      TWITT.list_timeline(params, pane_id);
      TWITT.change_list_words(pane_id, params.name);
    });
    */

    /*
     * main
     */
    $.get(TWITT.urls.verify_credentials, function(data) {
        if (data === null) {
            window.location.replace(TWITT.urls.auth); // redirect to /api/auth
            return false;
        }
        //TWITT.conf = TWITT.set_conf(data);
        TWITT.set_conf(data);

        $.get(TWITT.urls.get_saved_searches, function(saved_searches) {
            console.log(saved_searches);
            TWITT.conf.saved_searches = saved_searches;
            var words = TWITT.get_words();
            /*
             * start searching
             */
            $('div.pane').delay(5000).each(function(i, e) {
                TWITT.search_pane(i, words); // set search dropdown menu
                var pane_id = $(this).attr('pane_id');
                //console.log(words[i]);
                TWITT.search_tweets(pane_id, words[i]);
                //var m = words[i].match(/^\((.*?)\)$/);
                /*
                if (m) {
                    // list name case
                    //console.log(m);
                    var params = {
                      'name': m[1],
                      'max_id_str': 0
                    };
                    //console.log(JSON.stringify(params));
                    //TWITT.list_timeline(params, pane_id);
                } else {
                }
                */
                TWITT.set_new_search(pane_id); // set search form event
            });
        });

        TWITT.init_timeline();
    });
    return;

    jsoauth.verifyCredentials(function(data) {
      var json = JSON.parse(data.text);
      var send_data = {
        'screen_name': json.screen_name,
        'profile_image_url': json.profile_image_url,
        'id_str' : json.id_str
      };

      // send screen_name to background listener
      chrome.extension.sendRequest({msg:"set_screen_name", body: send_data}, function(response) {});

      TWITT.get_saved_searches(function(){
        var ary_words = TWITT.get_words();
        var n = 0;
        /*
         * start searching
         */
        $('div.pane').delay(5000).each(function (e) {
          TWITT.search_pane(n+1, ary_words); // 検索のdropdown menuをセット
          var pane_id = $(this).attr('pane_id');
          //console.log(ary_words[n]);
          var m = ary_words[n].match(/^\((.*?)\)$/);
          if (m) {
            // list name case
            //console.log(m);
            var params = {
              'name': m[1],
              'max_id_str': 0
            };
            //console.log(JSON.stringify(params));
            TWITT.list_timeline(params, pane_id);
          } else {
            TWITT.search_tweets(pane_id, ary_words[n]);
          }
          n += 1;
          TWITT.set_new_search(pane_id); // set search form event
        });

        TWITT.init_timeline();
        TWITT.jsoauth.rateLimitStatus(function(data) {
          var json = JSON.parse(data.text);
          //console.log(json);
          $('#my_title').text(send_data.screen_name +
           ' (home_timeline api limit ' +
          json.resources.statuses['/statuses/home_timeline'].remaining + '/' +
          json.resources.statuses['/statuses/home_timeline'].limit + ')');
        });
      });

      /*
       * add lists to dropdown menu
       */
      TWITT.get_lists_all(function(json) {
        TWITT.set_lists(json);
        var s = TWITT.lists_list(json);
        TWITT.dropdown_append_lists(1, s);
        TWITT.dropdown_append_lists(2, s);
      });

    });

    $("#home_timeline").bottom(); // add event on scroll to bottom
    $("#home_timeline").bind("bottom", function() {
      TWITT.timeline_maxid(); // get old home_timeline
    });

}());
