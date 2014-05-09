
var TWITT = {};

TWITT.base_url = 'https://api.twitter.com/1.1/';

TWITT.urls = {
    verify_credentials: '/api/verify_credentials',
    get_saved_searches: '/api/get_saved_searches',
    search: '/api/search'
};

TWITT.conf = {
    top_page: 'twitter.html',
    home_icon: './images/icon48.png',
    open_tweetarea_icon: './images/bird_32_blue.png',
    destroy_tweet_image: './images/delete.png',
    reply_image: './images/reply_hover.png',
    send_dm_image: './images/send_dm.png',
    thread_image: './images/thread.png',
    listdown_button_image: './images/117.png',
    destroy_saved_searches_image: './images/destroy_saved_searches.png',
    retweeted_image: './images/retweet_on.png',
    retweet_image: './images/retweet_hover.png',
    share_rt_image: './images/qt.png',
    shrink_url_image: './images/shrink.png',
    loader_image: './images/ajax-loader.gif',
    home_timeline_timer: '',
    profile_image_url: '',
    yfrog_xauth_upload_url: 'http://yfrog.com/api/xauth_upload',
    oauth_token: '',
    request_token_url: 'https://api.twitter.com/oauth/request_token',
    access_token_url: 'https://api.twitter.com/oauth/access_token',
    authorize_url: 'https://api.twitter.com/oauth/authorize',
    verify_credentials_url: TWITT.base_url + 'account/verify_credentials.json',
    rate_limit_status_url: TWITT.base_url + 'application/rate_limit_status.json',
    end_session_url: TWITT.base_url + 'account/end_session.json',
    friendships_exists_url: TWITT.base_url + 'friendships/exists.json',
    home_timeline_url: TWITT.base_url + 'statuses/home_timeline.json',
    saved_searches_url: TWITT.base_url + 'saved_searches/list.json',
    destroy_saved_searches_url: TWITT.base_url + 'saved_searches/destroy/:id.json',
    create_saved_searches_url: TWITT.base_url + 'saved_searches/create.json',
    update_statuses_url: TWITT.base_url + 'statuses/update.json',
    destroy_statuses_url: TWITT.base_url + 'statuses/destroy/:id.json',
    show_statuses_url: TWITT.base_url + 'statuses/show/:id.json',
    retweet_statuses_url: TWITT.base_url + 'statuses/retweet/:id.json',
    retweeted_by_me_url: TWITT.base_url + 'statuses/retweeted_by_me.json',
    lists_all_url: TWITT.base_url + 'lists/list.json',
    lists_statuses_url: TWITT.base_url + 'lists/statuses.json',
    search_url: 'https://api.twitter.com/1.1/search/tweets.json',
    expand_url: 'http://api.longurl.org/v2/expand',
    switch_word: false,
    home_limit: 800, // max display home_timeline
    home_timeline_get_count: 100, // number of records to retrieve in home_timeline (<= 200)
    search_list_max: 40, // search_listに表示できる最大数
    search_timeline_get_count: 20, // 一度にsearchで取得するtweet数
    mention_get_count: 20, // 一度にmentionで取得するtweet数
    //dm_get_count: 20,
    //home_max_id: 0, // home_timelineで指定するmax_id(必要なときのみ)
    oldestTimelineId: 0,
    limit: 100, // search display limit
    wordmaxlen: 5,
    saved_searches: [],
    search_data: {},
    lists_data: {},
    lists_word: [],
    session_user: null,
    urls: {
        // 自分のリスト(要認証)
        lists_url: TWITT.base_url + ':user/lists.json',
        lists_subscriptions_url: TWITT.base_url + ':user/lists/subscriptions.json',
        // 自分が追加されているリスト
        lists_memberships_url: TWITT.base_url + ':user/lists/memberships.json'
    },
    images: {
        listdown_button_image: './images/117.png',
        destroy_user_lists_image: './images/destroy_saved_searches.png'
    }
};

TWITT.removeTab = function(tabid) {
  localStorage.removeItem('oauth_token');
  localStorage.removeItem('oauth_token_secret');
  localStorage.removeItem('words');
  localStorage.removeItem('session_user');
  chrome.tabs.remove(tabid, function() {
  });
};

TWITT.get_words = function() {
    if (typeof $.cookie('words') !== 'undefined') {
        var words = JSON.parse($.cookie('words'));
    } else {
        var words = '';
    }
    console.log(words);
    console.log(words[0]);

    /*
    if (1 < JSON.parse(words).length) {
        for (var i = 0; i < JSON.parse(words).length; i++) {
            ary_words.push(decodeURIComponent(JSON.parse(words)[i]));
        }
    }
    */

    if (0 === words.length) {
        if (1 < TWITT.conf.saved_searches.length) {
            words = {
              0: TWITT.conf.saved_searches[0].name,
              1: TWITT.conf.saved_searches[1].name
            };
        }
        if (1 === TWITT.conf.saved_searches.length) {
            words = {
              0: TWITT.conf.saved_searches[0].name
            };
        }
        if (0 === TWITT.conf.saved_searches.length) {
        }
    }

    var words_json = JSON.stringify(words);
    $.cookie('words', words_json, {expires: 1});
    return words;
};

TWITT.tweet_intents = function() {
    chrome.windows.create({'url': 'tweet_box.html', 'type': 'popup', 'width': 600, 'height': 420},function(window) {
        //console.log("windowid="+this.id);
    });
}

TWITT.build_search_tweet_divs = function(json, pane_id, is_new) {
  var _this = this;
  //console.log(json);
  if (0 === json.length) {
    return;
  }
  var s = '',
      isReply = '',
      enable_destroy = '',
      enable_reply = '',
      enable_retweet = '';
  //$(json.results).reverse().each(function() {
  $(json).reverse().each(function() {
    var _that = this;
    //console.log(this);
    if (0 !== $('#tw' + this.id_str).length) {
      // 既に表示済みのtweetはskipする。
      // 古いtweetから順にloopされるのでbreakではなくcontinueさせる。
      return true; // continue
    }
    var dd = localDD(this.created_at);
    var dtspan = '<span class="dtime" id="dtime_of_' + this.id_str + '">';
    dtspan += '<a href="https://twitter.com/' + this.from_user + '/status/' + this.id_str + '" target="_blank">' + dd + '</a></span>';

    if (this.source != 'undefined' && this.source.indexOf('&lt;') != -1) {
      var htmlFrom = document.createElement('div');
      htmlFrom.innerHTML = this.source;
      from = htmlFrom.textContent;
    }
    // reply to me
    if (this.in_reply_to_user_id_str === TWITT.conf.id_str) {
      isReply = true;
    } else {
      isReply = false;
    }
    // my tweet
    if (this.from_user === TWITT.conf.screen_name) {
      enable_destroy = true;
      enable_reply = true;
      enable_retweet = false;
    } else {
      enable_destroy = false;
      enable_reply = true;
      enable_retweet = true;
    }

    // expand urls
    if (this.entities !== undefined) {
      _that.text = _this.expand_urls(this.entities, _that.text);
    }

    // thumbnail image
    if (this.entities !== undefined) {
      var thumbnail_html = _this.thumbnail_image(this.entities);
    }

    _that.text = _this.omiturl(_that.text.linkify().linkuser().linktag());

    s += '<div id="tw' + this.id_str + '" class="tweet" tweet_id="' + this.id_str + '" reply="' + isReply + '" destroy="' + enable_destroy + '" enable_reply="' + enable_reply + '" enable_retweet="' + enable_retweet + '">';

    s += '  <div class="container-fluid">';
    s += '    <div class="thumbnail">';
    s += '      <a href="https://twitter.com/' + this.user.screen_name + '" target="_blank"><img class="profile_image" width="48" height="48" src="' + this.user.profile_image_url + '"></a>';
    s += '    </div>';
    s += '    <div class="text-container">';
    s += '      <span class="text_container">';
    s += '        <span class="text">' + _that.text;
    s += '        </span><br>';

    if (thumbnail_html !== '') {
      s += thumbnail_html + '<br>';
    }

    s += '        <a href="https://twitter.com/' + this.user.screen_name + '" target="_blank" class="screen_name"><strong>' + this.user.name + '</strong></a> &nbsp;' + dtspan;
    s += '      </span>';
    //s += '      <div class="source">from '+ from;
    //s += '        <div class="reply_button_container">';
    //s += '          <span class="reply" id="reply_to_'+this.id+'" tweet_id="'+this.id+'" style="display:none;"><img src="'+TWITT.conf.reply_image+'" width="15" height="15" title="reply"></span>';
    //s += '          <span class="share_rt" id="share_rt_'+this.id+'" tweet_id="'+this.id+'" style="display:none;"><img src="'+TWITT.conf.share_rt_image+'" width="15" height="15" title="edit retweet"></span>';
    //s += '          <span class="retweet" id="retweet_'+this.id+'" tweet_id="'+this.id+'" style="display:none;"><img src="'+TWITT.conf.retweet_image+'" width="15" height="15" title="retweet"></span>';
    //s += '        </div>';
    //s += '      </div>';
    s += '    </div>'; // text-container
    s += '  </div>'; // .container-fluid
    s += '</div>';  // .tweet
  });
  this.display_search_tweets(s, pane_id);
};

/*
 * show searched timeline
 */
TWITT.display_search_tweets = function(divstr, parent_id) {
  var _this = this;
  var divs = $(divstr).filter(function() { return $(this).is('div'); });
  var delay_time = 3000;
  var parent = $('#tweets' + parent_id);
  if (0 === $(divs).length) {
    return;
  }
  //var cnt = $('#'+parent.prop('id')+' .tweet').length;
  //console.log(cnt);
  //console.log(parent_id);
  divs.each(function(i) {
    var _that = this;
    var id_str = $(this).prop('tweet_id');
    if (_this.check_already_displayed(id_str)) {
      // skip already displayed element
      console.log('skipping display');
      return true; // continue
    }
    // divの一件ずつの時間差表示 paneの先頭にdivを追加
    $(_that).hide().delay(i * delay_time).prependTo(parent).fadeIn('slow', function() {
      _this.removeOldDiv(parent); // remove old element
      //_this.replaceUrlLonger(this); // expand url
    });

    //$('.source a').prop("target","_blank");
    //hoverPictureUrl(this);
    //clickShowButton(this,parent_id);
    //console.log(test);
  });
  return $(divs).length;
};

TWITT.check_already_displayed = function(id_str) {
  // 既に表示済かチェック
  if (0 !== $('#home_timeline div#tw' + id_str).length) {
    //console.log($('#home_timeline div#tw'+id_str).length);
    return true;
  }
  return false;
};

TWITT.removeOldDiv = function(parent) {
  var parent_id = $(parent).prop('id');
  var limit = '';
  if ('home_timeline' === parent_id) {
    limit = TWITT.conf.home_limit;
  } else {
    limit = TWITT.conf.limit;
  }
  var cnt = $('#' + parent.prop('id') + ' .tweet').length;
  if (cnt > limit) {
    var remove_element_id = $('#' + parent.prop('id') + ' div.tweet').last().prop('id');
    //console.log('remove element_id '+remove_element_id);
    $('#' + remove_element_id).empty().remove();
  }
};

TWITT.get_saved_searches = function(callback) {
  TWITT.conf.saved_searches = [];
  TWITT.jsoauth.getSavedSearches(function(data) {
    var json = JSON.parse(data.text);
    //console.log(json);
    $(json).each(function(i) {
      TWITT.conf.saved_searches.push({id: this.id, name: this.name});
      if (i === json.length - 1) {
        callback();
      }
    });
  });
};

TWITT.get_lists_all = function(callback) {
  this.jsoauth.getListsAll(function(data) {
    callback(JSON.parse(data.text));
  });
};

TWITT.init_timeline = function() {
  var _this = this; // TWITT
  var params = {};
  params.count = this.conf.home_timeline_get_count;
  chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
    _this.jsoauth.homeTimeline(params, function(data) {
      var json = JSON.parse(data.text);
      $(json).reverse().each(function(i) {
        //console.log(this);
        if (this.user.screen_name === response.screen_name) {
          if (this.retweeted_status === undefined) {
            // 自分のツィート
            var div = _this.generate_single_div(this);
          } else {
            // 自分のRT
            var div = _this.generate_rt_div(this, true);
          }
        } else {
          if (this.retweeted_status === undefined) {
            // 他人のツィート
            var div = _this.generate_others_div(this);
          } else {
            // 他人のRT
            var div = _this.generate_rt_div(this, false);
          }
        }
        _this.disp_home(div);
        if (i === 0) {
          _this.oldestTimelineId = this.id_str;
        }
        if (i === json.length - 1) {
          _this.newestTimelineId = this.id_str;
          //console.log(this);
          //_this.readMoreButton();
          //console.log(_this.oldestTimelineId);
          setTimeout(function() {
            _this.update_timeline();
          },70000);
        }
      });
      TWITT.jsoauth.rateLimitStatus(function(data) {
        var json = JSON.parse(data.text);
        //console.log(json);
        chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
          $('#my_rate_limit').html(response.screen_name +
           ' (home_timeline api limit ' +
          json.resources.statuses['/statuses/home_timeline'].remaining + '/' +
          json.resources.statuses['/statuses/home_timeline'].limit + ')');
        });
      });
    });
  });
};

/*
 * display home_timeline divs
 */
TWITT.disp_home = function(div) {
  var id_str = $(div).attr('tweet_id');
  var _this = this;
  //console.log($(div));
  if (_this.check_already_displayed(id_str)) {
    // skip already displayed elements
    //console.log('this elem already displayed. skipping.. ');
    return true; // continue
  }

  $(div).prependTo($('#home_timeline')).fadeIn('slow', function() {
    var __this = this;
    if (0 < $(this).find('span.retweet_pretext').length) {
      // if elem is RTs
      var reply_data = {
        'icon': $(this).find('img.profile_image').val('src'),
        'text': $(this).find('.text')[0].innerText,
        'name': $(this).find('a.screen_name')[0].innerText,
        'rt_name': $(this).find('span.retweet_pretext').val('rt_name'),
        'rt_screen_name': $(this).find('span.retweet_pretext').val('rt_screen_name'),
        'time': $(this).find('span.dtime')[0].innerText
      };
      //console.log(reply_data);
    } else {
      // if normal tweets
      var reply_data = {
        'icon': $(this).find('img.profile_image').attr('src'),
        'text': $(this).find('.text')[0].innerText,
        'name': $(this).find('a.screen_name')[0].innerText,
        'time': $(this).find('span.dtime')
      };
    }
    $(this).css('background', '#223'); // unread color
    // 自分へのreply
    chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
      if (response.id_str === $(__this).attr('in_reply_to_user_id_str')) {
        $(__this).css('background', '#660033');
      }
    });

    _this.clickShowButton(this, 'home_timeline');
  });
};

/*
 *  replace shorten URL to longer one (only t.co domain atm)
 */
/*
TWITT.replaceUrlLonger = function(elem) {
  var _this = this;
  var url = $(elem).find('.text').text().returnUrl();
  if (url === null) {
    return;
  }
  for (var i = 0, len = url.length; i < len; i++) {
    var path = url[i].split('/');
    if (path[2] === "t.co") {
      _this.expandUrl(url[i], function(short_url, longer_url) {
        if (longer_url) {
          var string = longer_url.substr(0, 30)+'...';
          var t = $(elem).find('.text').html().replace('"'+short_url+'"', '"'+longer_url+'"');
          var t = t.replace(">"+short_url+"<", ">"+string+"<");
          $(elem).find('.text').html(t);
        }
      });
    }
  }
};
*/

/*
 * omitting long urls with dot
 */
TWITT.omiturl = function(text) {
  var url = text.returnUrl();
  if (url === null) {
    return text;
  }
  for (var i = 0, len = url.length; i < len; i++) {
    if (url[i].length <= 30) {
      continue;
    }
    var string = url[i].substr(0, 30) + '...';
    var text1 = text;
    text = text.replace('>' + url[i] + '<', '>' + string + '<');
  }
  return text;
/*
RT <a target="_blank" href="http://twitter.com/JENNARO_" class="linkuser">@JENNARO_</a>: Hahahahaha <a target="_blank" href="http://search.twitter.com/search?q=%23Reallythough" class="linktag">#Reallythough</a> <a target="_blank" href="http://twitter.com/KaradiseCity" class="linkuser">@KaradiseCity</a> <a target="_blank" href="http://twitter.com/jaquiekray_" class="linkuser">@jaquiekray_</a> <a target="_blank" href="http://twitter.com/JENNARO_/status/223267877627760640/photo/1" class="linkify">http://twitter.com/JENNARO_/status/223267877627760640/photo/1</a> twittpane.js:510

["http://twitter.com/JENNARO_",
"http://search.twitter.com/search?q=%23Reallythough",
"http://twitter.com/KaradiseCity",
"http://twitter.com/jaquiekray_",
"http://twitter.com/JENNARO_/status/223267877627760640/photo/1",
"http://twitter.com/JENNARO_/status/223267877627760640/photo/1"]
*/
};

TWITT.clickShowButton = function(elem, parent_id) {
  $(elem).click(function() {
    var _this = this;
    $(this).find('.reply').show();
    if ('true' === $(this.outerHTML).attr('enable_retweet')) {
      $(this).find('.share_rt').show();
      $(this).find('.retweet').show();
    }
    if ('true' === $(this.outerHTML).attr('destroy')) {
      $(this).find('.destroy_tweet').show();
      /*
      $(this).find('.destroy_tweet').click(function() {
        var destroy_id =
        $($(this)[0].outerHTML).attr('tweet_id');
        jqDialog.confirm("Are you sure want to delete this tweet?",
          function() {
            twitterapi.destroyStatuses(destroy_id,function(json) {
              //log(json);
            });
            $('#tw'+destroy_id).fadeOut(function() { $(this).remove(); });
            timeline.delTimelineById(destroy_id);
          },
          function() {}
        );
      });
      */
    }
    setTimeout(function() {
      $(_this).find('.reply').fadeOut();
      $(_this).find('.share_rt').fadeOut();
      $(_this).find('.retweet').fadeOut();
      $(_this).find('.destroy_tweet').fadeOut();
    },5000);
    if ('home_timeline' === parent_id) {
      //timeline.markAsRead(this);
    } else if ('mention_timeline' === parent_id) {
      //mention.markAsRead(this);
    } else if ('dm_timeline' === parent_id) {
      //dm.markAsRead(this);
    }
  });
};

/*
TWITT.readMoreButton = function() {
  var _this = this; // TWITT
  var div = "";
  if (('#home_timeline div.tweet').length > 200) {
    div = '<div id="nomore_to_read">.</div>';
    $('#home_timeline').append(div);
    return false;
  }
  if ($('#home_timeline div#read_more').length) {
    $('#home_timeline div#read_more').remove();
  }
  div = '<div id="read_more"><a href="#" id="read_more_text">>read more</a></div>';
  $('#home_timeline').append(div);
  $('#home_timeline div#read_more').click(function() {
    $(this).remove();
    var loader = '<div id="read_more"><img id="read_more_loader" src="'+TWITT.conf.loader_image+'" width="15" height="15"/></div>';
    $('#home_timeline').append(loader);

    _this.timeline_maxid();
  });
};
*/

/*
 * get older home_timeline
 */
TWITT.timeline_maxid = function() {
  if (this.oldestTimelineId === 0) {
    return false;
  }
  var a = new BigNumber(this.oldestTimelineId);
  //console.log(this.oldestTimelineId);
  var _this = this;
  var params = {
    count: TWITT.conf.home_timeline_get_count,
    max_id: a.subtract(1) // subtract from big number
  };
  chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
    //console.log(params);
    TWITT.jsoauth.homeTimeline(params, function(data) {
      var json = JSON.parse(data.text);
      $(json).each(function(i) {
        var div = '';
        if (this.user.screen_name === response.screen_name) {
          if (this.retweeted_status === undefined) {
            // 自分のツィート
            div = _this.generate_single_div(this);
          } else {
            div = _this.generate_rt_div(this, true);
          }
        } else {
          if (this.retweeted_status === undefined) {
            // 他人のツィート
            div = _this.generate_others_div(this);
          } else {
            // 他人のRT
            div = _this.generate_rt_div(this, false);
          }
        }
        _this.disp_append_home(div);
        if (i === json.length - 1) {
          //console.log(this);
          _this.oldestTimelineId = this.id_str;
          //_this.readMoreButton();
          //console.log(_this.oldestTimelineId);
        }
      });
      TWITT.jsoauth.rateLimitStatus(function(data) {
        var json = JSON.parse(data.text);
        //console.log(json);
        chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
          //console.log(response);
          $('#my_rate_limit').html(response.screen_name +
           ' (home_timeline api limit ' +
          json.resources.statuses['/statuses/home_timeline'].remaining + '/' +
          json.resources.statuses['/statuses/home_timeline'].limit + ')');
          console.log(json.resources.statuses['/statuses/home_timeline'].remaining);
        });
      });
    });
  });
};

/*
 * displays appended home_timeline elems
 */
TWITT.disp_append_home = function(div) {
  var id_str = $(div).attr('tweet_id');
  var _this = this; // TWITT
  var div = $(div);
  var home = $('#home_timeline');
  if (this.check_already_displayed(id_str)) {
    // skip already showed element
    console.log('this elem already displayed. skipping.. ');
    return true; // continue
  }
  div.appendTo(home).fadeIn('slow', function() {
    /*
    if (0 < $(this).find('span.retweet_pretext').length) {
      // 公式RTの場合
      var reply_data = {
        'icon': $(this).find('img.profile_image').attr('src'),
        'text': $(this).find('.text')[0].innerText,
        'name': $(this).find('a.screen_name')[0].innerText,
        'rt_name': $(this).find('span.retweet_pretext').attr('rt_name'),
        'rt_screen_name': $(this).find('span.retweet_pretext').attr('rt_screen_name'),
        'time': $(this).find('span.dtime')[0].innerText
      };
    } else {
      // 公式RT以外の、普通のツィート
      var reply_data = {
        'icon': $(this).find('img.profile_image').attr('src'),
        'text': $(this).find('.text')[0].innerText,
        'name': $(this).find('a.screen_name')[0].innerText,
        'time': $(this).find('span.dtime')
      };
    }
    */
    $(this).css('background', '#223'); // unread color
    // 自分へのreply
    if ('true' === $(this).attr('reply')) {
      $(this).css('background', '#660033');
    }
    _this.clickShowButton(this, 'home_timeline');

    // 短縮URLの拡張
    //_this.replaceUrlLonger(this);

  });
};

// home_timeline上のreplyボタンを押した時
TWITT.onClickReply = function(obj) {
  console.log($(obj));
  if (0 < obj.find('span.retweet_pretext').length) {
    // 公式RTの場合
    var data = {
      'in_reply_to': obj.attr('tweet_id'),
      'icon': obj.find('img.profile_image').attr('src'),
      'text': obj.find('.text').text(),
      'name': obj.find('a.screen_name').text(),
      'rt_name': obj.find('span.retweet_pretext').attr('rt_name'),
      'rt_screen_name': obj.find('span.retweet_pretext').attr('rt_screen_name')
    };
  } else {
    // 普通のツィート
    var data = {
      'in_reply_to': obj.attr('tweet_id'),
      'icon': obj.find('img.profile_image').attr('src'),
      'text': obj.find('.text').text(),
      'name': obj.find('a.screen_name').text()
    };
  }
  data.screen_name = $('#tw' + data.in_reply_to + ' a.screen_name').attr('name'),
  console.log(data);
  chrome.extension.sendRequest({msg: 'reply', body: data}, function(response) {});
};

// 引用付き返信
TWITT.onClickShareReply = function(obj) {
  //console.log(obj);
  var in_reply_to = obj.attr('tweet_id');
  var data = {
    'in_reply_to': in_reply_to,
    'screen_name': $('#tw' + in_reply_to + ' a.screen_name').attr('name'),
    'icon': obj.find('img.profile_image').attr('src'),
    'text': obj.find('.text')[0].innerText,
    'name': obj.find('a.screen_name')[0].innerText,
    'share': 'true'
  };
  chrome.extension.sendRequest({msg: 'reply', body: data}, function(response) {});
};

// home_timeline上のretweetボタンを押した時
TWITT.onClickRetweet = function(obj) {
  console.log(obj);
  if (0 < obj.find('span.retweet_pretext').length) {
    // 公式RTの場合
    var data = {
      'in_reply_to': obj.attr('tweet_id'),
      'icon': obj.find('img.profile_image').attr('src'),
      'text': obj.find('.text')[0].innerText,
      'name': obj.find('a.screen_name')[0].innerText,
      'rt_name': obj.find('span.retweet_pretext').attr('rt_name'),
      'rt_screen_name': obj.find('span.retweet_pretext').attr('rt_screen_name')
    };
  } else {
    // 普通のツィート
    var data = {
      'in_reply_to': obj.attr('tweet_id'),
      'icon': obj.find('img.profile_image').attr('src'),
      'text': obj.find('.text')[0].innerText,
      'name': obj.find('a.screen_name')[0].innerText
    };
  }
  data.screen_name = $('#tw' + data.in_reply_to + ' a.screen_name').attr('name'),
  chrome.extension.sendRequest({msg: 'retweet', body: data}, function(response) { });
};

// Tweetの削除
TWITT.onClickDestroy = function(obj) {
  var destroy_id = obj.attr('tweet_id');
  var screen_name = $('#tw' + destroy_id + ' a.screen_name').attr('name');
  // 自分がRTしたもの
  var data = {
    'destroy_id': destroy_id,
    'icon': obj.find('img.profile_image').attr('src'),
    'text': obj.find('.text')[0].innerText,
    'screen_name': screen_name,
    'name': obj.find('a.screen_name')[0].innerText
  };
  chrome.extension.sendRequest({msg: 'destroy', body: data}, function(response) { });
};

// Undo retweet
TWITT.onClickUndoRetweet = function(obj) {
  var tweet_id = obj.attr('tweet_id');
  var screen_name = $('#tw' + tweet_id + ' a.screen_name').attr('name');
  console.log(obj);
  var data = {
    'tweet_id': tweet_id,
    'icon': obj.find('img.profile_image').attr('src'),
    'text': obj.find('.text').text(),
    'screen_name': screen_name,
    'name': obj.find('a.screen_name')[0].innerText
  };
  console.log(data);
  chrome.extension.sendRequest({msg: 'undo_retweet', body: data}, function(response) { });
};

// replyウィンドウ開く
TWITT.reply_intents = function() {
  chrome.windows.create({'url': 'reply_box.html', 'type': 'popup', 'width': 600, 'height': 500},function(window) {
  });
};

// retweetウィンドウ開く
TWITT.retweet_intents = function(data) {
  chrome.windows.create({'url': 'retweet_box.html', 'type': 'popup', 'width': 600, 'height': 420},function(window) {
  });
};

TWITT.destroy_intents = function(data) {
  chrome.windows.create({'url': 'destroy_box.html', 'type': 'popup', 'width': 600, 'height': 420},function(window) {
  });
};

/*
 * update Home_timeline
 *
 */
TWITT.update_timeline = function() {
  //console.log('update newest id='+this.newestTimelineId);
  if (this.newestTimelineId === 0) {
    return false;
  }
  var _this = this,
      params = {
        'count': _this.conf.home_timeline_get_count,
        'since_id': _this.newestTimelineId
      };
  chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
    TWITT.jsoauth.homeTimeline(params, function(data) {
      var json = '';
      try {
        json = JSON.parse(data.text);
        //console.log(json);
      } catch (e) {
        console.log(e);
      }
      if (json.length === 0) {
        setTimeout(function() {
          _this.update_timeline();
        },70000);
        return;
      }
      $(json).reverse().each(function(i) {
        var div = '';
        if (this.user.screen_name === response.screen_name) {
          if (this.retweeted_status === undefined) {
            div = _this.generate_single_div(this);
          } else {
            div = _this.generate_rt_div(this, true);
          }
        } else {
          if (this.retweeted_status === undefined) {
            // 他人のツィート
            div = _this.generate_others_div(this);
          } else {
            // 他人のRT
            div = _this.generate_rt_div(this, false);
          }
        }
        _this.disp_home(div);
        if (i === 0) {
          _this.newestTimelineId = this.id_str;
        }
        if (i === json.length - 1) {
          //console.log(this);
          //console.log(_this.newestTimelineId);
          setTimeout(function() {
            _this.update_timeline();
          },70000);
        }
      });
    });
  });
  setTimeout(function() {
    TWITT.jsoauth.rateLimitStatus(function(data) {
      var json = JSON.parse(data.text);
      //console.log(json);
      chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
        $('div#my_title').html(response.screen_name +
         ' (home_timeline api limit ' +
        json.resources.statuses['/statuses/home_timeline'].remaining + '/' +
        json.resources.statuses['/statuses/home_timeline'].limit + ')');
      });
  });
  },3000);
};

/*
TWITT.search = function(word, rpp, since_id, callback) {
  var message = {
    method: "GET",
    type: 'json'
  };
  var url = TWITT.conf.search_url+'?q='+encodeURIComponent(word)+"&rpp="+rpp+"&since_id="+since_id+"&include_entities=true";
  this._ajax(url, message, function(json) {
    callback(json);
  });
};
*/

TWITT._ajax = function(url, message, callback) {
  var data = '';
  if (message.method === 'POST') {
    var split_url = [];
    split_url = url.split('?');
    url = split_url[0];
    data = split_url[1];
  }
  if (undefined === message.async) {
    message.async = true;
  }
  $.ajax({
    url: url,
    data: data,
    type: message.method,
    dataType: message.type,
    async: message.async,
    cache: true, // URL末尾のタイムスタンプはいらないよ
    beforeSend: function(xhr ) {
      xhr.setRequestHeader('If-Modified-Since', 'Thu, 01 Jun 1970 00:00:00 GMT');
    },
    success: function(d,status,xhr) {
      callback(d, status, xhr);
    },
    error: function(e) {
      callback(e);
    },
    timeout: 1000 * 50
  });
};

/*
 * initialize search pane
 */
TWITT.search_pane = function(i, words) {
    var pane_id = i + 1;
    var word = words[i];
    $('#head_tweets' + pane_id).attr('word', word);

    // pane[n]のdropdownの先頭に現在の検索(リスト)文字列をセット
    /*
    var m = word.match(/^\((.*?)\)$/);
    if (m) {
        // ()で囲まれた文字列ならば、""で囲むように変更
        word = '"' + m[1] + '"';
    }
    */
    $('#head_tweets' + pane_id +
      ' > ul > li.dropdown > a.dropdown-toggle'). html(
      word.linkword() + '<b class=\"caret\"></b>');

    var s = this.dropdown_list(pane_id, words);

    // set dropdrown list names
    $('#head_tweets' + pane_id +
      ' > ul > li.dropdown > ul.dropdown-menu').html(s);

    // bootstrap-dropdown.js 有効化
    $('#head_tweets' + pane_id +
      ' > ul > li.dropdown > a.dropdown-toggle').dropdown();

    // change search event
    this.dropdown_click(pane_id);
};

/*
 * event for new search word
 */
TWITT.set_new_search = function(pane_id) {
    var _this = this;
    $('#head_tweets' + pane_id + ' > ul > .navbar-search')
      .live('submit', function() {
        var form_val = '#head_tweets' +
            pane_id + ' > ul > form > .search-query';
        var new_word = $(form_val).val();
        if (0 === new_word.length) {
            return;
        }

        // Save済み検索語と一致すれば、フォームクリアし
        // 検索せずに処理を返す
        for (var i = 0, len = _this.conf.saved_searches.length; i < len; i++) {
            // if (decodeURIComponent(_this.conf.saved_searches[i].name) === new_word) {
            if (_this.conf.saved_searches[i].name === new_word) {
                $(form_val).val('');
                return false; // prevent refreshing page
            }
        }

        //_this.jsoauth.createSavedSearches(new_word, function(data) {
        $.get(TWITT.urls.create_saved_searches, new_word).done(function(data) {
          var json = JSON.parse(data.text);
          console.log(json);
          $(json).each(function() {
              console.log(this);
              _this.conf.saved_searches.push({id: this.id, name: this.name});
              //if (_this.conf.search_list_max < _this.conf.saved_searches.length) {
                //$('.add_word_button').hide();
              //}

              // dropdownのリストをセット
              var s = _this.dropdown_list(pane_id, _this.get_words());
              s += '<li class="divider"></li>';
              s += _this.lists_list();
              $('#head_tweets1 > ul > li.dropdown > ul.dropdown-menu').html(s);
              $('#head_tweets2 > ul > li.dropdown > ul.dropdown-menu').html(s);

              // change searchイベント
              _this.dropdown_click(1);
              _this.dropdown_click(2);
              _this.dropdown_destroy(1);
              _this.dropdown_destroy(2);
          });
          $(form_val).val('');
      });

      /* disable current search timer */
      if (_this.conf.search_data[pane_id] !== undefined) {
        clearTimeout(_this.conf.search_data[pane_id].timer);
      }
      // disable list_timeline timer
      if (_this.conf.lists_data[pane_id] !== undefined) {
        clearTimeout(_this.conf.lists_data[pane_id].timer);
      }

      $('#tweets' + pane_id + ' .tweet').remove();

      // 新しい語で検索開始
      _this.change_search_word(pane_id, new_word);

      // pane[n]のdropdownの先頭に現在の検索文字列をセット
      $('#head_tweets' + pane_id + ' > ul > li.dropdown > a.dropdown-toggle').html(new_word.linkword() + '<b class=\"caret\"></b>');

      return false; // prevent refreshing page
    });
};

TWITT.dropdown_list = function(pane_id, words) {
    var s = '';
    var ary_words = $.map(words, function(val, i) {
        return val;
    });
    if (2 >= this.conf.saved_searches.length) {
        return 'display-none';
    }
    for (var i = 0, len = this.conf.saved_searches.length; i < len; i++) {
        if (-1 === $.inArray(decodeURIComponent(
           this.conf.saved_searches[i].name), ary_words)) {
            s += '<li class="saved_searches_list" id="saved_searches_' +
                  this.conf.saved_searches[i].id + '">';
            s += '  <a href="#" word="' +
                  decodeURIComponent(this.conf.saved_searches[i].name) +
                 '">' + decodeURIComponent(this.conf.saved_searches[i].name);
            s += '    <span class="close">&times;</span>';
            s += '  </a>';
            s += '</li>';
        }
    }
    return s;
};

TWITT.set_lists = function(json) {
  var i = 0;
  $(json).each(function() {
    TWITT.conf.lists_word[i] = {
      'name': this.name,
      'id': this.id,
      'mode': this.mode,
      'uri': this.uri
    };
    i++;
  });
};

/*
 * lists name for dropdown menu
 */
TWITT.lists_list = function() {
  var s = '';
  var _this = this;
  var i = 0;

  $(_this.conf.lists_word).each(function() {
    if (this.mode !== 'public') {
      return true;
    }
    // exclude active list name
    if (_this.conf.lists_data[1] && this.name === _this.conf.lists_data[1].name) {
      return true;
    }
    if (_this.conf.lists_data[2] && this.name === _this.conf.lists_data[2].name) {
      return true;
    }

    s += '<li class="lists_list" id="lists_' + this.id + '">';
    s += '  <a href="#" list_name="' + decodeURIComponent(this.name) + '">' + '"' + decodeURIComponent(this.name) + '"' + '</a>';
    s += '</li>';
    i++;
  });
  return s;
};

TWITT.dropdown_append_lists = function(pane_id, html) {
  var divider = '<li class="divider"></li>';
  $('#head_tweets' + pane_id + ' > ul > li.dropdown > ul.dropdown-menu').append(divider);
  $('#head_tweets' + pane_id + ' > ul > li.dropdown > ul.dropdown-menu').append(html);
};

TWITT.dropdown_click = function(pane_id) {

  var _this = this;
  var b = '#head_tweets' + pane_id + ' > ul > li.dropdown > ul > li.saved_searches_list > a';

  $(b).click(function(event) {

    // click del mark in dropdown menu
    if (event.target.nodeName === 'SPAN') {
      _this.dropdown_destroy(this, pane_id);
      return false; // to prevent dropdown_menu close
    }

    // previous search word
    var old_word = $('#head_tweets' + pane_id).attr('word');
    /*
    console.log(old_word);
    console.log(pane_id);
    console.log(_this.conf.search_data);
    */

    // disable search timer
    if (_this.conf.search_data[pane_id] !== undefined) {
      clearTimeout(_this.conf.search_data[pane_id].timer);
    }
    if (_this.conf.lists_data[pane_id] !== undefined) {
      clearTimeout(_this.conf.lists_data[pane_id].timer);
    }

    $('#tweets' + pane_id + ' .tweet').remove();

    // new search word
    var new_word = $(this).attr('word');
    //console.log(new_word);

    // remove contents of previous search
    $(this).remove();

    _this.change_search_word(pane_id, new_word);

    $('#head_tweets' + pane_id).attr('word', new_word);
    // set search word on the top of dropdown menu in pane[n]
    $('#head_tweets' + pane_id + ' > ul > li.dropdown > a.dropdown-toggle').html(new_word.linkword() + '<b class=\"caret\"></b>');

    //console.log(_this.get_words());
    var s = _this.dropdown_list(pane_id, _this.get_words());

    // set list name in dropdown menu
    $('#head_tweets1 > ul > li.dropdown > ul.dropdown-menu').html(s);
    $('#head_tweets2 > ul > li.dropdown > ul.dropdown-menu').html(s);

    // set lists
    var html = _this.lists_list();
    _this.dropdown_append_lists(1, html);
    _this.dropdown_append_lists(2, html);

    // change search event
    _this.dropdown_click(1);
    _this.dropdown_click(2);
    _this.dropdown_destroy(1);
    _this.dropdown_destroy(2);

    _this.conf.lists_data[pane_id] = undefined;
  });
};

TWITT.dropdown_destroy = function(obj, pane_id) {

  var id = '',
      b = '#head_tweets' + pane_id + ' > ul > li.dropdown > ul > li > a > .close',
      del_word = $(obj).attr('word');

  //console.log(del_word);

  for (var i = 0, len = TWITT.conf.saved_searches.length; i < len; i++) {
    if (TWITT.conf.saved_searches[i].name === del_word) {
      id = TWITT.conf.saved_searches[i].id;
      break;
    }
  }

  if (id > 0) {
    TWITT.jsoauth.destroySavedSearches(id, function(data) {
      var json = JSON.parse(data.text);
      //console.log(json);
      $(json).each(function() {
        for (var i = 0; i < TWITT.conf.saved_searches.length; i++) {
          if (TWITT.conf.saved_searches[i].id === id) {
            TWITT.conf.saved_searches.splice(i, 1);
          }
        }
        //if (TWITT.conf.search_list_max > TWITT.conf.saved_searches.length) {
        //  $('.add_word_button').show();
        //}
      });
    });
    $('#head_tweets1 > ul > li > ul > #saved_searches_' + id).fadeOut(function() { $(this).remove(); });
    $('#head_tweets2 > ul > li > ul > #saved_searches_' + id).fadeOut(function() { $(this).remove(); });
    //$('#saved_searches_'+id).fadeOut(function() { $(this).remove(); });
    //if (TWITT.conf.saved_searches.length < 3) {
    //  $('.word_menu').hide();
    //}
  }
};

TWITT.change_search_word = function(pane_id, word) {
  $('#head_searching_word' + pane_id).html(word.linkword());
  var ary_words = [];

  for (var i = 0; i < JSON.parse(localStorage.words).length; i++) {
    ary_words.push(JSON.parse(localStorage.words)[i]);
  }

  this.conf.search_data[pane_id] = {
    'word': word,
    'since_id': 0
  };
  console.log(this.conf.search_data);

  ary_words[pane_id - 1] = word;
  localStorage.words = JSON.stringify(ary_words);
  this.search_tweets(pane_id, word);

  return false;
};

TWITT.change_list_words = function(pane_id, name) {
  var ary_words = [];
  for (var i = 0; i < JSON.parse(localStorage.words).length; i++) {
    ary_words.push(JSON.parse(localStorage.words)[i]);
  }

  ary_words[pane_id - 1] = encodeURIComponent(name);
  localStorage.words = JSON.stringify(ary_words);

  // pane[n]のdropdownの先頭に表示中のリスト名をセット (""で囲む)
  $('#head_tweets' + pane_id + ' > ul > li.dropdown > a.dropdown-toggle').html('"' + name.linkword() + '"<b class=\"caret\"></b>');

  // ()で囲みsearch_wordと区別
  ary_words[pane_id - 1] = '(' + encodeURIComponent(name) + ')';
  localStorage.words = JSON.stringify(ary_words);

  // set dropdown menu
  // search words in dropdown
  var s = this.dropdown_list(pane_id, this.get_words());
  s += '<li class="divider"></li>';
  // list words in dropdown
  s += this.lists_list();
  $('#head_tweets1 > ul > li.dropdown > ul.dropdown-menu').html(s);
  $('#head_tweets2 > ul > li.dropdown > ul.dropdown-menu').html(s);

  // クリックイベント
  this.dropdown_click(pane_id);
  this.dropdown_destroy(pane_id);

  return false;
};

TWITT.search_tweets = function(pane_id, word) {
    //console.log('pane_id=' + pane_id);
    //console.log(TWITT.conf.search_data[pane_id]);
    var _this = this;
    var searchTimeout = {};

    if (TWITT.conf.search_data[pane_id] === undefined) {
        TWITT.conf.search_data[pane_id] = {
            'word': word
        };
    }

    if (TWITT.conf.search_data[pane_id].max_id_str === undefined) {
        TWITT.conf.search_data[pane_id].max_id_str = 0;
    }

    // send search request to pyramid
    params = {q: word,
              count: TWITT.conf.search_timeline_get_count,
              since_id: TWITT.conf.search_data[pane_id].max_id_str
    };
    //console.log(params);

    $.get(TWITT.urls.search, params).done(function(data) {
        //console.log(data);
        // search success
        if (TWITT.conf.search_data[pane_id] === undefined) {
          // initial search
          TWITT.conf.search_data[pane_id] = {
            'word': word
          };
        } else {
          TWITT.conf.search_data[pane_id].max_id_str =
            data.search_metadata.max_id_str;
        }
        TWITT.conf.search_data[pane_id].since_id =
          data.search_metadata.max_id_str;
        _this.build_search_tweet_divs(data.statuses, pane_id, true);
        // search error
        /*
        if (undefined !== json.status) {
          //console.log(json);
          $('#errmsg' + pane_id).hide(function() { $(this).remove(); });
          var errdiv = '<div class="tweet" id="errmsg' + pane_id + '"><span class="errmsg">Server status:' + json.status + ' ' + json.statusText + '</span></div>';
          //$(errdiv).hide().prependTo(_this).fadeIn("slow");
          //$(errdiv).hide().prependTo($('#tweets'+pane_id)).fadeIn("slow");
          _this.display_search_tweets(errdiv, pane_id);
        }
        */
    });
    this.conf.search_data[pane_id].timer = setTimeout(function() {
        _this.search_tweets(pane_id, word);
    }, 70000);
    return false;
};

/*
 * get list_timeline
 */
TWITT.list_timeline = function(params, pane_id) {
  var _this = this;
  var string = '';
  var cnt = 0;
  var delay = 70000;

  this.conf.lists_data[pane_id] = {
    'name': encodeURIComponent(params.name)
  };

  chrome.extension.sendRequest({msg: 'get_conf'}, function(response) {
    //console.log(response);
    params.screen_name = response.screen_name;

    //console.log(JSON.stringify(params.max_id_str));
    if (params.max_id_str !== 0) {
      var a = new BigNumber(params.max_id_str);
      params.since_id_str = a.add(1); // sum 1 to last max_id_str
      //console.log(JSON.stringify(params.since_id_str));
    }

    _this.jsoauth.list_status(params, function(data) {
      //console.log(data);
      var json = JSON.parse(data.text);
      if (json.length > 0) {
        //console.log(json);
        //_this.conf.lists_data[pane_id].max_id_str = $(json)[0].id_str;
        params.max_id_str = $(json)[0].id_str;

        $(json).reverse().each(function(i) {
          string += _this.generate_others_div(this);
        });

        _this.display_search_tweets(string, pane_id);

        // extends dalay time if length of json is too long to display
        if ((json.length * 3000) > 70000) {
          delay = json.length * 3000;
        }
      }

      //console.log('delay_time='+delay);
      _this.conf.lists_data[pane_id].timer = setTimeout(function() {
        _this.list_timeline(params, pane_id);
      }, delay);

    });

  });
};

/*
 * my Tweet
 *
 */
TWITT.generate_single_div = function(json) {
  if (json === undefined) {
    return;
  }
  var enable_destroy = true,
      enable_reply = true,
      enable_retweet = false,
      enable_dm = false,
      unread = false,
      s = '',
      isReply = false,
      dd = localDD(json.created_at);

  // expand urls
  json.text = this.expand_urls(json.entities, json.text);

  // thumbnail image
  var thumbnail_html = this.thumbnail_image(json.entities);

  json.text = this.omiturl(json.text.linkify().linkuser().linktag());

  s += '<div id="tw' + json.id_str + '" in_reply_to_user_id_str=' + json.in_reply_to_user_id_str + ' class="tweet" tweet_id="' + json.id_str + '" reply="' + isReply + '" destroy="' + enable_destroy + '" enable_reply="' + enable_reply + '" enable_retweet="' + enable_retweet + '" enable_dm="' + enable_dm + '" in_reply_to_status_id_str="' + json.in_reply_to_status_id + '" unread="' + unread + '">';

  s += '  <div class="container-fluid">';
  s += '    <div class="thumbnail">';
  s += '      <a href="http://twitter.com/' + json.user.screen_name + '" class="profile_icon" target="_blank"><img class="profile_image" width="48" height="48" src="' + json.user.profile_image_url + '"></a>';
  s += '    </div>';

  s += '    <div class="text-container">';
  s += '      <div class="text_container">';
  s += '        <span class="text">' + json.text + '</span><br>';

  if (thumbnail_html !== '') {
    s += thumbnail_html + '<br>';
  }

  s += '        <span class="dtime" id="' + json.id_str + '">';
  s += '          <a href="http://twitter.com/' + json.user.screen_name + '" target="_blank" class="screen_name" name="' + json.user.screen_name + '"><strong>' + json.user.name + '</strong></a>';
  s += '          <a href="https://twitter.com/' + json.user_screen_name + '/status/' + json.id_str + '" target="_blank">' + dd + '</a>';
  s += '        </span>';

  s += '        <span class="reply_button_container">';
  s += '          <span class="reply" id="reply_to_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.reply_image + '" width="15" height="15" title="reply"></span>';
  s += '          <span class="share_rt" id="share_rt_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.share_rt_image + '" width="15" height="15" title="edit retweet"></span>';
  s += '          <span class="retweet" id="retweet_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.retweet_image + '" width="15" height="15" title="retweet"></span>';
  s += '          <span class="destroy_tweet" id="destroy_tweet_id_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.destroy_tweet_image + '" width="10" height="10" title="delete"></span>';
  s += '        </span>'; // .reply_button_container
  s += '      </div>'; // text_container
  s += '    </div>'; // text-container
  s += '  </div>'; // .container-fluid
  s += '</div>';

  return s;
};

/*
 * other's tweet
 *
 */
TWITT.generate_others_div = function(json) {
  console.log(json);
  if (json === undefined) {
    return;
  }
  var isReply = false,
      enable_destroy = false,
      enable_reply = true,
      enable_dm = false,
      unread = false;

  if (json.retweeted === true) {
    var enable_retweet = false;
  } else {
    var enable_retweet = true;
  }

  // expand urls
  json.text = this.expand_urls(json.entities, json.text);

  // thumbnail image
  var thumbnail_html = this.thumbnail_image(json.entities);

  json.text = this.omiturl(json.text.linkify().linkuser().linktag());

  var name = '<a href="http://twitter.com/' + json.user.screen_name + '" target="_blank" class="screen_name" name="' + json.user.screen_name + '"><strong>' + json.user.name + '</strong></a>';
  var dd = localDD(json.created_at);
  var dtspan = '<span class="dtime" id="' + json.id_str + '">';
  dtspan += '<a href="https://twitter.com/' + json.user_screen_name + '/status/' + json.id_str + '" target="_blank">' + dd + '</a></span>';

  // html --------------------
  var s = '';

  s += '<div id="tw' + json.id_str + '" in_reply_to_user_id_str=' + json.in_reply_to_user_id_str + ' class="tweet" tweet_id="' + json.id_str + '" reply="' + isReply + '" destroy="' + enable_destroy + '" enable_reply="' + enable_reply + '" enable_retweet="' + enable_retweet + '" enable_dm="' + enable_dm + '" in_reply_to_status_id_str="' + json.in_reply_to_status_id + '" unread="' + unread + '">';

  s += '  <div class="container-fluid">';
  s += '    <div class="thumbnail">';
  s += '      <a href="http://twitter.com/' + json.user.screen_name + '" class="profile_icon" target="_blank"><img class="profile_image" width="48" height="48" src="' + json.user.profile_image_url + '"></a>';
  s += '    </div>';

  s += '    <div class="text-container">';
  s += '      <div class="text_container"><span class="text">' + json.text + '</span><br>';

  if (thumbnail_html !== '') {
    s += thumbnail_html + '<br>';
  }

  s += name + ' &nbsp;' + dtspan;

  s += '        <span class="reply_button_container">';
  s += '          <span class="reply" id="reply_to_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.reply_image + '" width="15" height="15" title="reply"></span>';
  s += '          <span class="share_rt" id="share_rt_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.share_rt_image + '" width="15" height="15" title="edit retweet"></span>';
  s += '          <span class="retweet" id="retweet_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.retweet_image + '" width="15" height="15" title="retweet"></span>';
  s += '          <span class="destroy_tweet" id="destroy_tweet_id_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.destroy_tweet_image + '" width="10" height="10" title="delete"></span>';

  if (json.retweeted === true) {
    s += '        <span class="undo_retweet" id="undo_retweet_id_' + json.id_str + '" tweet_id="' + json.id_str + '">';
    if (json.retweeted_status) {
      // 他人がRT済みのもの
      s += '        <a href="https://twitter.com/' + json.retweeted_status.user.screen_name + '/status/' + json.retweeted_status.id_str + '" target="_blank"><img src="' + TWITT.conf.retweeted_image + '" width="15" height="15" title="retweeted by me"></a>';
    } else {
      // 自分しかRTしていないもの
      // json.retweeted_status end pointがない
      s += '        <a href="https://twitter.com/' + json.user.screen_name + '/status/' + json.id_str + '" target="_blank"><img src="' + TWITT.conf.retweeted_image + '" width="15" height="15" title="retweeted by me"></a>';
    }
    // 自身がretweet済み
    s += '        </span>';
  } else {
    // 他人がRTしたものは、ボタンをdisplay:noneにしておく。
    s += '        <span class="undo_retweet" id="undo_retweet_id_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.retweeted_image + '" width="15" height="15" title="retweeted by me"></span>';
  }

  s += '        </span>'; // .reply_button_container
  s += '      </div>';  // text_container
  s += '    </div>'; /* .text-container */
  s += '  </div>'; /* .container-fluid */
  s += '</div>';

  return s;
};

TWITT.generate_rt_div = function(json, myself) {
  console.log(json);
  if (json === undefined) {
    return;
  }
  var enable_destroy = false,
      enable_reply = true,
      enable_retweet = true,
      enable_dm = false,
      isReply = false,
      unread = false,
      s = '',
      text = '';

  // RTed by myself
  if (json.retweeted === true) {
    enable_reply = false;
    enable_retweet = false;
    enable_destroy = true;
  }

  var dd = localDD(json.retweeted_status.created_at);
  var dtspan = '<span class="dtime"><a href="https://twitter.com/' + json.retweeted_status.user.screen_name + '/status/' + json.retweeted_status.id_str + '" target="_blank">' + dd + '</a></span>';

  // expand urls
  text = this.expand_urls(json.entities, json.retweeted_status.text);

  // thumbnail image
  //var thumbnail_html = this.thumbnail_image(json.entities);
  var thumbnail_html = this.thumbnail_image(json.retweeted_status.entities);

  text = this.omiturl(text.linkify().linkuser().linktag());

  var name = '<a href="http://twitter.com/' + json.retweeted_status.user.screen_name + '" target="_blank" class="screen_name" name="' + json.retweeted_status.user.screen_name + '"><strong>' + json.retweeted_status.user.name + '</strong></a> ';
  name += dtspan + '<br>';

  name += '<img src="' + TWITT.conf.retweeted_image + '" width="12" height="12">';
  name += '<span class="retweet_pretext" style="font-size:9px" screen_name="' + json.user.screen_name + '" rt_name="' + json.retweeted_status.user.name + '" rt_screen_name="' + json.retweeted_status.user.screen_name + '" rt_id="' + json.retweeted_status.id_str + '" user="' + json.user.screen_name + '"> retweeted by <a href="http://twitter.com/' + json.user.screen_name + '" target="_blank" class="screen_name">' + json.user.name + '</a></span>';

  // html ------------
  s += '<div id="tw' + json.retweeted_status.id_str + '" class="tweet" tweet_id="' + json.retweeted_status.id_str + '" reply="' + isReply + '" destroy="' + enable_destroy + '" enable_reply="' + enable_reply + '" enable_retweet="' + enable_retweet + '" enable_dm="' + enable_dm + '" in_reply_to_status_id_str="' + json.retweeted_status.in_reply_to_status_id + '" unread="' + unread + '">';

  s += '  <div class="container-fluid">';
  s += '    <div class="thumbnail">';
  s += '      <a href="http://twitter.com/' + json.retweeted_status.user.screen_name + '" class="profile_icon" target="_blank"><img class="profile_image" width="48" height="48" src="' + json.retweeted_status.user.profile_image_url + '"></a>';
  s += '    </div>';

  s += '    <div class="text-container">';
  s += '      <span class="text_container"><span class="text">' + text + '</span><br>';

  if (thumbnail_html !== '') {
    s += thumbnail_html + '<br>';
  }

  s += name;

  s += '        <div class="reply_button_container">';
  s += '          <span class="reply" id="reply_to_' + json.retweeted_status.id_str + '" tweet_id="' + json.retweeted_status.id_str + '" style="display:none;"><img src="' + TWITT.conf.reply_image + '" width="15" height="15" title="reply"></span>';
  s += '          <span class="share_rt" id="share_rt_' + json.retweeted_status.id_str + '" tweet_id="' + json.retweeted_status.id_str + '" style="display:none;"><img src="' + TWITT.conf.share_rt_image + '" width="15" height="15" title="edit retweet"></span>';
  s += '          <span class="retweet" tweet_id="' + json.retweeted_status.id_str + '" style="display:none;"><img src="' + TWITT.conf.retweet_image + '" width="15" height="15" title="retweet"></span>';

  if (json.retweeted === true) {
    // 自身がretweet済み
    s += '        <span class="undo_retweet" tweet_id="' + json.retweeted_status.id_str + '">';
    s += '          <a href="https://twitter.com/' + json.retweeted_status.user.screen_name + '/status/' + json.retweeted_status.id_str + '" target="_blank"><img src="' + TWITT.conf.retweeted_image + '" width="15" height="15" title="retweeted by me"></a>';
    s += '        </span>';
  } else {
    // 他人がRTしたものは、ボタンをdisplay:noneにしておく。
    s += '        <span class="undo_retweet" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.retweeted_image + '" width="15" height="15" title="retweeted by me"></span>';
  }

  s += '     </div>'; // reply_button_container
  s += '    </div>'; // text-container
  s += '  </div>'; // .container-fluid
  s += '</div>'; // .t

  return s;
};

/*
TWITT.generate_rt_by_me_div = function(json) {
  console.log(json);
  if (json === undefined) {
    return;
  }
  var enable_destroy = true,
      enable_reply = false,
      enable_retweet = false,
      enable_dm = false,
      isReply = false,
      unread = false,
      divstr = '',
      dd = localDD(json.created_at),
      dtspan = '<span class="dtime" id="'+json.id_str+'">'+dd+'</span>';

  //var name = '<span class="retweet_pretext" style="font-size:9px" screen_name="'+json.retweeted_status.user.screen_name+'" rt_name="'+json.retweeted_status.user.name+'" rt_screen_name="'+json.retweeted_status.user.screen_name+'" rt_id="'+json.retweeted_status.id_str+'">retweeted by <a href="http://twitter.com/' + json.retweeted_status.user.screen_name + '" target="_blank" class="screen_name">'+json.retweeted_status.user.name+'</a></span>';

  var text = json.retweeted_status.text.linkify().linkuser().linktag();
  var name = '<a href="http://twitter.com/' + json.retweeted_status.user.screen_name + '" target="_blank" class="screen_name" name="'+json.retweeted_status.user.screen_name+'">'+json.retweeted_status.user.name+'</a> &nbsp' + dtspan+'<br>';

  name += '<img src="'+TWITT.conf.retweeted_image+'" width="12" height="12">';
  name += '<span class="retweet_pretext" style="font-size:9px" screen_name="'+json.user.screen_name+'" rt_name="'+json.retweeted_status.user.name+'" rt_screen_name="'+json.retweeted_status.user.screen_name+'" rt_id="'+json.retweeted_status.id_str+'"> retweeted by <a href="http://twitter.com/' + json.user.screen_name + '" target="_blank" class="screen_name">'+json.user.name+'</a></span>';

  divstr += '<div id="tw' + json.id_str + '" class="tweet" tweet_id="'+json.id_str+'" reply="'+isReply+'" destroy="'+enable_destroy+'" enable_reply="'+enable_reply+'" enable_retweet="'+enable_retweet+'" enable_dm="'+enable_dm+'" in_reply_to_status_id_str="'+json.in_reply_to_status_id+'" unread="'+unread+'">';

  divstr += '<a href="http://twitter.com/' +json.retweeted_status.user.screen_name+'" class="profile_icon" target="_blank"><img class="profile_image" width="48" height="48" src="' + json.retweeted_status.user.profile_image_url + '"></a>';
  divstr += '<p class="text_container"><span class="text">'+text+'</span><br>'+name+' &nbsp;' + dtspan;
  divstr += '<div class="source">from '+json.source;

  divstr +='<div class="reply_button_container">';
  divstr += '<span class="reply" id="reply_to_'+json.id_str+'" tweet_id="'+json.id_str+'" style="display:none;"><img src="'+TWITT.conf.reply_image+'" width="15" height="15" title="reply"></span>';

  divstr += '<span class="share_rt" id="share_rt_'+json.id_str+'" tweet_id="'+json.id_str+'" style="display:none;"><img src="'+TWITT.conf.share_rt_image+'" width="15" height="15" title="edit retweet"></span>';
  divstr += '<span class="retweet" id="retweet_'+json.id_str+'" tweet_id="'+json.id_str+'" style="display:none;"><img src="'+TWITT.conf.retweet_image+'" width="15" height="15" title="retweet"></span>';
  divstr += '<span class="destroy_tweet" id="destroy_tweet_id_'+json.id_str+'" tweet_id="'+json.id_str+'" style="display:none;"><img src="'+TWITT.conf.destroy_tweet_image+'" width="10" height="10" title="delete"></span>';
  divstr += '</div></div></div>';
  return divstr;
};
*/

/*
 * self reply tweet
 */
TWITT.generate_reply_div = function(json) {
  console.log(json);
  if (json === undefined) {
    return;
  }
  var enable_destroy = true,
      enable_reply = true,
      enable_retweet = false,
      enable_dm = false,
      isReply = false,
      unread = false,
      s = '',
      dd = localDD(json.created_at);

  // expand urls
  json.text = this.expand_urls(json.entities, json.text);

  // thumbnail image
  var thumbnail_html = this.thumbnail_image(json.entities);

  json.text = this.omiturl(json.text.linkify().linkuser().linktag());

  s += '<div id="tw' + json.id_str + '" class="tweet" tweet_id="' + json.id_str + '" reply="' + isReply + '" destroy="' + enable_destroy + '" enable_reply="' + enable_reply + '" enable_retweet="' + enable_retweet + '" enable_dm="' + enable_dm + '" in_reply_to_status_id_str="' + json.in_reply_to_status_id + '" unread="' + unread + '">';

  s += '  <div class="container-fluid">';
  s += '    <div class="thumbnail">';
  s += '      <a href="http://twitter.com/' + json.user.screen_name + '" class="profile_icon" target="_blank"><img class="profile_image" width="48" height="48" src="' + json.user.profile_image_url + '"></a>';
  s += '    </div>';

  s += '    <div class="text-container">';
  s += '      <div class="text_container">';
  s += '        <span class="text">' + json.text + '</span><br>';

  if (thumbnail_html !== '') {
    s += thumbnail_html + '<br>';
  }

  s += '        <span class="dtime" id="' + json.id_str + '">';
  s += '          <a href="http://twitter.com/' + json.user.screen_name + '" target="_blank" class="screen_name" name="' + json.user.screen_name + '"><strong>' + json.user.name + '</strong></a>';
  s += '          <a href="https://twitter.com/' + json.user_screen_name + '/status/' + json.id_str + '" target="_blank">' + dd + '</a>';
  s += '        </span>';

  s += '        <span class="reply_button_container">';
  s += '          <span class="reply" id="reply_to_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.reply_image + '" width="15" height="15" title="reply"></span>';
  s += '          <span class="share_rt" id="share_rt_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.share_rt_image + '" width="15" height="15" title="edit retweet"></span>';
  s += '          <span class="retweet" id="retweet_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.retweet_image + '" width="15" height="15" title="retweet"></span>';
  s += '          <span class="destroy_tweet" id="destroy_tweet_id_' + json.id_str + '" tweet_id="' + json.id_str + '" style="display:none;"><img src="' + TWITT.conf.destroy_tweet_image + '" width="10" height="10" title="delete"></span>';
  s += '        </span>'; // .reply_button_container
  s += '      </div>'; // .text_container
  s += '    </div>'; // text-container
  s += '  </div>'; // .container-fluid
  s += '</div>';

  return s;
};

/*
 * replace urls to expanded_url by entities data
 */
TWITT.expand_urls = function(entities, text) {
  $(entities.urls).each(function() {
    text = text.replace(this.url, this.expanded_url);
  });
  $(entities.media).each(function() {
    text = text.replace(this.url, this.expanded_url);
  });
  return text;
};

TWITT.thumbnail_image = function(entities) {
  var html = '';

  $(entities.urls).each(function() {
    $(this).thumbs();
    if (this.thumbnail_url) {
      html += '<a href="' + this.expanded_url + '" target="_blank"><img class="pic_thumb" src="' + this.thumbnail_url + '" width="25%"></img></a>';
    }
  });

  // pic.twitter
  $(entities.media).each(function() {
    $(this).thumbs();
    if (this.thumbnail_url) {
      html += '<a href="' + this.expanded_url + '" target="_blank"><img class="pic_thumb" src="' + this.thumbnail_url + '" width="25%"></img></a>';
    }
  });

  return html;
};

