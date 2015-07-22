var express = require('express');
var router = express.Router();

var EventProxy = require('eventproxy');

var ModelProxy = require('../proxy');
var TopicProxy = ModelProxy.Topic;

var config = require('../config');

router.get('/create', function(req, res, next) {
  res.render('topic/edit', {
    tabs: config.tabs,
  });
});

router.post('/create', function(req, res, next) {
  TopicProxy.save(req.body.topic, function(err, topic) {
    if (err) return next(err);

    res.redirect('/topic/' + topic.id);
  });
});

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
router.get('/:tid', function(req, res, next) {
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.render404('此话题不存在或已被删除。');
  }

  var events = ['topic'];
  var ep = EventProxy.create(events, function(topic) {
    res.render('topic/index', {
      topic: topic,
    });
  });
  ep.fail(next);

  TopicProxy.getFullTopic(topic_id, ep.done(function (message, topic) {
    if (message) {
      ep.unbind();
      return res.renderError(message);
    }
    topic.visit_count += 1;
    topic.save();

    ep.emit('topic', topic);
  }));
});

module.exports = router;
