
var TWITT = {};

TWITT.base_url = 'https://api.twitter.com/1.1/';

TWITT.urls = {
    auth: '/api/auth',
    verify_credentials: '/api/verify_credentials',
    get_saved_searches: '/api/get_saved_searches',
    create_saved_search: '/api/create_saved_search',
    destroy_saved_search: '/api/destroy_saved_search',
    search: '/api/search',
    get_home_timeline: '/api/get_home_timeline'
};

TWITT.credentials = {};

TWITT.conf = {
    home_icon: '/static/images/icon48.png',
    open_tweetarea_icon: './images/bird_32_blue.png',
    destroy_tweet_image: './images/delete.png',
    reply_image: '/static/images/reply_hover.png',
    thread_image: './images/thread.png',
    listdown_button_image: './images/117.png',
    destroy_saved_searches_image: './images/destroy_saved_searches.png',
    retweeted_image: '/static/images/retweet_on.png',
    retweet_image: '/static/images/retweet_hover.png',
    shrink_url_image: './images/shrink.png',
    loader_image: './images/ajax-loader.gif',
    home_timeline_timer: '',
    profile_image_url: '',
    oauth_token: '',
    request_token_url: 'https://api.twitter.com/oauth/request_token',
    access_token_url: 'https://api.twitter.com/oauth/access_token',
    authorize_url: 'https://api.twitter.com/oauth/authorize',
    rate_limit_status_url: TWITT.base_url + 'application/rate_limit_status.json',
    end_session_url: TWITT.base_url + 'account/end_session.json',
    friendships_exists_url: TWITT.base_url + 'friendships/exists.json',
    home_timeline_url: TWITT.base_url + 'statuses/home_timeline.json',
    saved_searches_url: TWITT.base_url + 'saved_searches/list.json',
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

TWITT.get_words = function() {
    if (typeof $.cookie('words') !== 'undefined') {
        var words = JSON.parse($.cookie('words'));
    } else {
        var words = '';
    }
    console.log(words);
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
        enable_retweet = '',
        date_string = '';
    $(json).reverse().each(function() {
      var _that = this;
      //console.log(this);
      if (0 !== $('#tw' + this.id_str).length) {
        // 既に表示済みのtweetはskipする。
        // 古いtweetから順にloopされるのでbreakではなくcontinueさせる。
        return true; // continue
      }
      date_string = moment(this.created_at).format('lll');
      var dtspan = '<span class="dtime" id="dtime_of_' + this.id_str + '">';
      dtspan += '<a href="https://twitter.com/' + this.from_user + '/status/' + this.id_str + '" target="_blank">' +
      date_string + '</a></span>';

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
      //if (this.entities !== undefined) {
      if (this.extended_entities !== undefined) {
          var thumbnail_html = _this.thumbnail_image(this.extended_entities);
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
    $.each(divs, function(i) {
        var id_str = $(this).prop('tweet_id');
        // divの一件ずつの時間差表示 paneの先頭にdivを追加
        $(this).hide().delay(i * delay_time).prependTo(parent).fadeIn('slow', function() {
            _this.removeOldDiv(parent); // remove old element
        });
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
      TWITT.conf.saved_searches.push({id: this.id,
                                      id_str: this.id_str,
                                      name: this.name});
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
    var _this = this;
    var params = {};
    params.count = this.conf.home_timeline_get_count;
    //console.log(this.credentials);
    $.get(TWITT.urls.get_home_timeline, params).done(function(data) {
        //console.log(data);
        $(data).reverse().each(function(i) {
            var div = _this.createTweets(this);
            _this.disp_home(div);
            /*
            if (i === 0) {
                _this.oldestTimelineId = this.id_str;
            }
            */
            /*
            if (i === json.length - 1) {
                _this.newestTimelineId = this.id_str;
                setTimeout(function() {
                    _this.update_timeline();
                },70000);
            }
            */
        });
        /*
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
        */
    });
};

/*
 * display home_timeline divs
 */
TWITT.disp_home = function(div) {
    //console.log($(div));
    var id_str = $(div).attr('tweet_id');
    var _this = this;
    $(div).prependTo($('#home_timeline')).fadeIn('slow', function() { });
};

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
        /*
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
        */
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
    $('.navbar-search').on('submit', function() {
        var form_val = '#head_tweets' +
            pane_id + ' > ul > form > .search-query';
        var new_word = $(form_val).val();
        if (0 === new_word.length) {
            return;
        }
        // Save済み検索語と一致すれば、フォームクリアし
        // 検索せずに処理を返す
        //console.log(_this.conf.saved_searches);
        for (var i = 0, len = _this.conf.saved_searches.length; i < len; i++) {
            //console.log(_this.conf.saved_searches[i].name);
            if (_this.conf.saved_searches[i].name === new_word) {
                $(form_val).val('');
                return false; // prevent refreshing page
            }
        }
        // Create a new saved search for the authenticated user.
        // A user may only have 25 saved searches.
        //
        $.get(TWITT.urls.create_saved_search, {query: new_word}).done(function(data) {
            var json = JSON.parse(data);
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
        /*
        if (_this.conf.lists_data[pane_id] !== undefined) {
            clearTimeout(_this.conf.lists_data[pane_id].timer);
        }
        */

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

        // disable search timer
        if (_this.conf.search_data[pane_id] !== undefined) {
            clearTimeout(_this.conf.search_data[pane_id].timer);
        }
        /*
        if (_this.conf.lists_data[pane_id] !== undefined) {
            clearTimeout(_this.conf.lists_data[pane_id].timer);
        }
        */

        // remove contents of previous search
        //$(this).remove();
        $('#tweets' + pane_id + ' .tweet').remove();

        // new search word
        var new_word = $(this).attr('word');
        var new_word_list = _this.change_search_word(pane_id, new_word);
        $('#head_tweets' + pane_id).attr('word', new_word);

        // set search word on the top of dropdown menu in pane[n]
        $('#head_tweets' + pane_id + ' > ul > li.dropdown > a.dropdown-toggle').html(new_word.linkword() + '<b class=\"caret\"></b>');

        //console.log(_this.get_words());
        //var s = _this.dropdown_list(pane_id, _this.get_words());
        var s = _this.dropdown_list(pane_id, new_word_list);

        // set list name in dropdown menu
        $('#head_tweets1 > ul > li.dropdown > ul.dropdown-menu').html(s);
        $('#head_tweets2 > ul > li.dropdown > ul.dropdown-menu').html(s);

        // set lists
        //var html = _this.lists_list();
        //_this.dropdown_append_lists(1, html);
        //_this.dropdown_append_lists(2, html);

        // change search event
        _this.dropdown_click(1);
        _this.dropdown_click(2);
        _this.dropdown_destroy(1);
        _this.dropdown_destroy(2);

        //_this.conf.lists_data[pane_id] = undefined;
    });
};

TWITT.dropdown_destroy = function(obj, pane_id) {
    var _this = this,
        id_str = '',
        b = '#head_tweets' + pane_id + ' > ul > li.dropdown > ul > li > a > .close',
        del_word = $(obj).attr('word');
    for (var i = 0, len = this.conf.saved_searches.length; i < len; i++) {
        if (this.conf.saved_searches[i].name === del_word) {
            id_str = this.conf.saved_searches[i].id_str;
            break;
        }
    }
    if (id_str.length > 0) {
        // Destroys a saved search for the authenticating user.
        // The authenticating user must be the owner of saved
        // search id being destroyed.
        $.get(this.urls.destroy_saved_search, {'id': id_str}).
          done(function(data) {
            //console.log(data);
            $.each(data, function() {
                for (var i = 0; i < _this.conf.saved_searches.length; i++) {
                    if (_this.conf.saved_searches[i].id_str === id_str) {
                        _this.conf.saved_searches.splice(i, 1);
                    }
                }
                //if (_this.conf.search_list_max > _this.conf.saved_searches.length) {
                //  $('.add_word_button').show();
                //}
            });
        });
        $('#head_tweets1 > ul > li > ul > #saved_searches_' + id_str).fadeOut(function() { $(this).remove(); });
        $('#head_tweets2 > ul > li > ul > #saved_searches_' + id_str).fadeOut(function() { $(this).remove(); });
        //$('#saved_searches_'+id).fadeOut(function() { $(this).remove(); });
        //if (TWITT.conf.saved_searches.length < 3) {
        //  $('.word_menu').hide();
        //}
    }
};

TWITT.change_search_word = function(pane_id, word) {
    $('#head_searching_word' + pane_id).html(word.linkword());
    this.conf.search_data[pane_id] = {
        'word': word,
        'since_id': 0
    };
    this.search_tweets(pane_id, word);
    var words = { 0: this.conf.search_data[1].word,
                  1: this.conf.search_data[2].word};
    var words_json = JSON.stringify(words);
    $.cookie('words', words_json, {expires: 1});
    return words;
};



TWITT.set_conf = function(params) {
    Object.keys(params).forEach(function(key) {
        var keys = ['screen_name', 'id_str'];
        var value = params[key];
        if ($.inArray(key, keys) !== -1) {
            if ($.cookie(key) === undefined) {
                var r = $.cookie(key, params[key], {expires: 1});
            }
        }
    });
    this.credentials = params;
    //var conf = JSON.stringify(params);
    //$.cookie('conf', conf, {expires: 1});
    //return conf;
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
    //console.log(this.conf.search_data[pane_id]);
    var _this = this;
    var searchTimeout = {};
    if (this.conf.search_data[pane_id] === undefined) {
        this.conf.search_data[pane_id] = {
            'word': word
        };
    }
    if (this.conf.search_data[pane_id].max_id_str === undefined) {
        this.conf.search_data[pane_id].max_id_str = 0;
    }
    // send search request to pyramid
    params = {q: word,
              count: this.conf.search_timeline_get_count,
              since_id: this.conf.search_data[pane_id].max_id_str
    };
    console.log(params);
    $.get(this.urls.search, params).done(function(data) {
        console.log(data);
        // search success
        _this.conf.search_data[pane_id].max_id_str =
          data.search_metadata.max_id_str;
        var divs = '';
        $(data.statuses).reverse().each(function(i) {
            divs += _this.createTweets(this);
        });
        _this.display_search_tweets(divs, pane_id);

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
    if (entities.media == undefined) return;
    $.each(entities.media, function(k, v) {
        //console.log(this);
        html += '<a href="' + v.expanded_url + '" target="_blank"><img class="pic_thumb" src="' + v.media_url + '" width="25%"></img></a>';
    });
    return html;
};

TWITT.createTweets = function(data) {
    //console.log(data);
    if (data === undefined) {
      return;
    }
    var enable_destroy = false,
        enable_reply = true,
        enable_retweet = true,
        enable_dm = false,
        isReply = false,
        unread = false,
        s = '',
        text = '',
        id_str = '',
        screen_name = '',
        date_string = '',
        date_string_html = '',
        thumbnail_html = '',
        name = '',
        name_html = '',
        retweet_html = '';

    if (data.retweeted_status) {
        //console.log(data);
        screen_name = data.retweeted_status.user.screen_name;
        if (data.extended_entities !== undefined) {
            if (data.extended_entities.media !== undefined) {
                thumbnail_html = this.thumbnail_image(data.extended_entities);
            }
        } else if (data.entities !== undefined) {
            if (data.entities.media !== undefined) {
              // for search api results
              thumbnail_html = this.thumbnail_image(data.entities);
            }
        }
        name = data.retweeted_status.user.name;
        date_string = moment(data.retweeted_status.created_at).format('lll');
        id_str = data.retweeted_status.id_str;
        profile_image_url = data.retweeted_status.user.profile_image_url;
        text = this.expand_urls(data.retweeted_status.entities,
                 data.retweeted_status.text);
        name_html = '<span class="retweeted_image">' +
                    '<img src="' + TWITT.conf.retweeted_image +
                    '" width="15" height="15">' +
                    '</span>' +
                    '<span class="retweet_pretext" style="font-size:9px">' +
                    '<a href="http://twitter.com/' + data.user.screen_name +
                    '" target="_blank" class="screen_name">' +
                    data.user.name +
                    '</a> retweeted</span>';
        name_html += '<br>' +
                    '<a href="http://twitter.com/' + screen_name +
                    '" target="_blank" class="screen_name">' +
                    '<strong>' + name + '</strong></a>' +
                    '<a href="http://twitter.com/' + screen_name +
                    '" target="_blank" class="screen_name">' +
                    '<span class="screen_name_text" style="font-size:9px">' +
                    '@' + screen_name +
                    '</a>' +
                    '</span>';
        retweet_html = '<a href="https://twitter.com/intent/retweet?tweet_id=' +
                   id_str + '"><img src="' + TWITT.conf.retweet_image +
                  '" width="15" height="15" title="retweet">';
    } else {
        text = this.expand_urls(data.entities, data.text);
        // thumbnail image
        if (data.extended_entities !== undefined) {
            if (data.extended_entities.media !== undefined) {
                thumbnail_html = this.thumbnail_image(data.extended_entities);
            }
        } else if (data.entities !== undefined) {
            if (data.entities.media !== undefined) {
              // for search api results
              thumbnail_html = this.thumbnail_image(data.entities);
            }
        }
        screen_name = data.user.screen_name;
        name = data.user.name;
        date_string = moment(data.created_at).format('lll');
        id_str = data.id_str;
        profile_image_url = data.user.profile_image_url;
        name_html = '<a href="http://twitter.com/' + screen_name +
                    '" target="_blank" class="screen_name">' +
                    '<strong>' + name + '</strong></a>' +
                    '<a href="http://twitter.com/' + screen_name +
                    '" target="_blank" class="screen_name">' +
                    '<span class="screen_name_text" style="font-size:9px">' +
                    '@' + screen_name +
                    '</a>' +
                    '</span>';
        retweet_html = '<a href="https://twitter.com/intent/retweet?tweet_id=' +
                   id_str + '"><img src="' + TWITT.conf.retweet_image +
                  '" width="15" height="15" title="retweet">';
    }
    text = this.omiturl(text.linkify().linkuser().linktag());
    date_string_html = '<span class="dtime"><a href="https://twitter.com/' +
                        screen_name + '/status/' +
                        id_str +
                       '" target="_blank">' + date_string + '</a></span>';

    /*
     * html
     */
    s += '<div id="tw' + id_str + '" class="tweet" tweet_id="' + id_str +
         '" reply="' + isReply + '" destroy="' + enable_destroy +
         '" enable_reply="' +
          enable_reply + '" enable_retweet="' + enable_retweet + '">';

    s += '<div class="container-fluid">' +
         '<div class="thumbnail">' +
         '<a href="http://twitter.com/' + screen_name +
         '" class="profile_icon" target="_blank">' +
         '<img class="profile_image" width="48" height="48" src="' +
          profile_image_url + '"></a>' +
         '  </div>';

    s += '<div class="text-container">' + name_html + '<br>' +
         '<span class="text_container"><span class="text">' +
          text + '</span><br>';

    if (thumbnail_html !== '') {
        s += thumbnail_html + '<br>';
    }

    s += date_string_html;

    s += '<div class="reply_button_container">';
    s += '<a href="https://twitter.com/intent/tweet?in_reply_to=' +
          id_str + '"><img src="' + TWITT.conf.reply_image +
         '" width="15" height="15" title="reply">';

    s += retweet_html;


    s += '</div>'; // reply_button_container
    s += '</div>'; // text-container
    s += '</div>'; // .container-fluid
    s += '</div>'; // .t
    return s;
};

