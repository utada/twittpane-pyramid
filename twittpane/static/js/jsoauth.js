var JSOAUTH = {};

/* ----------------- REST API ------------------ */
JSOAUTH.verifyCredentials = function(callback) {
  JSOAUTH.oauth.get(TWITT.conf.verify_credentials_url,
		function(data) {
      callback(data);
		},
    function(data) {
      console.dir(data);
    }
	);
};

JSOAUTH.getSavedSearches = function(callback) {
  JSOAUTH.oauth.get(TWITT.conf.saved_searches_url,
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.getListsAll = function(callback) {
  JSOAUTH.oauth.get(TWITT.conf.lists_all_url,
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.rateLimitStatus = function(callback) {
  JSOAUTH.oauth.get(TWITT.conf.rate_limit_status_url,
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.homeTimeline = function(params, callback) {
  var param_string = '?';
  if (undefined !== params.since_id) {
    param_string += 'since_id='+params.since_id;
  }
  /*
  if ('0' === params.since_id || 0 === params.since_id) {
    delete parameters.since_id;
  }
  */
  /*
  if ('0' === params.max_id || 0 === params.max_id) {
    //parameters.max_id;
  }
  */
  if (undefined !== params.max_id) {
    if (param_string !== '?') {
      param_string += '&';
    }
    param_string += 'max_id='+params.max_id;
  }
  if (param_string !== '?') {
    param_string += '&count=' + TWITT.conf.home_timeline_get_count;
  } else {
    param_string += 'count=' + TWITT.conf.home_timeline_get_count;
  }
  //param_string += '&include_rts=1';
  param_string += '&include_entities=true';
  //console.log('param_string='+param_string);
  JSOAUTH.oauth.get(TWITT.conf.home_timeline_url+param_string,
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.createSavedSearches = function(query, callback) {
  JSOAUTH.oauth.post(TWITT.conf.create_saved_searches_url,
    {'query': query},
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.destroySavedSearches = function(id, callback) {
  JSOAUTH.oauth.post(TWITT.conf.destroy_saved_searches_url.replace(":id",id),
    {},
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.searchTweets = function(word, rpp, since_id, callback) {
  var url = TWITT.conf.search_url+'?q='+encodeURIComponent(word)+"&rpp="+rpp+"&since_id="+since_id+"&include_entities=true";
  JSOAUTH.oauth.get(url,
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.endSession = function(callback) {
  JSOAUTH.oauth.post(TWITT.conf.end_session_url,
    {},
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.updateStatuses = function(tweet, in_reply_to_status_id_str, callback) {
  if (in_reply_to_status_id_str === null) {
    params = {
      status: tweet,
      include_entities: "true"
    }
  } else {
    params = {
      status: tweet,
      in_reply_to_status_id: in_reply_to_status_id_str.toString(),
      include_entities: "true"
    }
  }
  JSOAUTH.oauth.post(TWITT.conf.update_statuses_url,
    params,
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.retweetStatuses = function(id, callback) {
  JSOAUTH.oauth.post(TWITT.conf.retweet_statuses_url.replace(":id", id),
    {},
		function(data) {
      console.log(data);
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.destroyStatuses = function(id, callback) {
  JSOAUTH.oauth.post(TWITT.conf.destroy_statuses_url.replace(":id",id),
    {},
		function(data) {
      callback(data);
		},
    function(data) { console.dir(data); }
	);
};

JSOAUTH.list_status = function(params, callback) {
  var s = '?slug='+params.name+'&owner_screen_name='+params.screen_name+'&per_page=40&include_rts=1&include_entities=true';
  if (undefined !== params.since_id_str) {
    s += '&since_id='+params.since_id_str;
  }
  /*
  if (0 !== params.max_id_str) {
    s += '&max_id='+params.max_id_str;
  }
  */

  this.oauth.get(TWITT.conf.lists_statuses_url+s,
		function(data) { callback(data); },
    function(data) { console.dir(data); }
	);

};

