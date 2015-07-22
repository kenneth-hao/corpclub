var express = require('express');
var router = express.Router();
var cache = require('../common/cache');
var eventproxy = require('eventproxy');
var config = require('../config');
var renderHelper = require('../common/render_helper');
var ModelProxy = require('../proxy');
var TopicProxy = ModelProxy.Topic;

/* GET home page. */
router.get('/', function(req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;
  var tab = req.query.tab || 'all';

  var proxy = new eventproxy();
  proxy.fail(next);

  var query = {};
  // 取主题
  if (tab && tab !== 'all') {
    if (tab === 'good') {
      query.good = true;
    } else {
      query.tab = tab;
    }
  }

  var limit = config.list_topic_count;
  var options = { skip: (page-1)*limit, limit: limit, sort: '-top -last_reply_at' };

  TopicProxy.getTopicsByQuery(query, options, proxy.done('topics', function(topics) {
    return topics;
  }));

  var pages_cache_key = JSON.stringify(query) + 'pages';
  cache.get(pages_cache_key, proxy.done(function(pages) {
    if (pages) {
      proxy.emit('pages', pages);
    } else {
      TopicProxy.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        cache.set(pages_cache_key, pages, 60*1);
        proxy.emit('pages', pages);
      }));
    }
  }));

  var tabName = renderHelper.tabName(tab);
  proxy.all('topics', 'pages', function(topics, pages) {
    res.render('index', {
      topics: topics,
      current_page: page,
      list_topic_count: limit,
      pages: pages,
      tabs: config.tabs,
      tab: tab,
      pageTitle: tabName && (tabName + '版块'),
    });
  });
});

module.exports = router;
