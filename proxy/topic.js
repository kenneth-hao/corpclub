var models = require('../models');
var Topic = models.Topic;

var EventProxy = require('eventproxy');

exports.save = function(topic, callback) {
  var _topic = new Topic(topic);

  _topic.save(callback);
};

/**
 * 获取关键词能搜索到的主题数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  Topic.count(query, callback);
};

/**
 * 根据关键词，获取主题列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getTopicsByQuery = function (query, opt, callback) {
  query.deleted = false;
  Topic.find(query, {}, opt, function (err, topics) {
    if (err) {
      return callback(err);
    }
    if (topics.length === 0) {
      return callback(null, []);
    }

    return callback(null, topics);
  });
};

/**
 * 获取所有信息的主题
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - topic, 主题
 * - author, 主题作者
 * - replies, 主题的回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullTopic = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['topic'];
  proxy
    .assign(events, function (topic) {

      callback(null, '', topic);
    })
    .fail(callback);

  Topic.findOne({_id: id}, proxy.done('topic', function (topic) {
    if (!topic) {
      proxy.unbind();
      return callback(null, '此话题不存在或已被删除。');
    }
    return topic;
  }));
};