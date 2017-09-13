/*--------------------------------------------------------------------
 playerDetails.js
----------------------------------------------------------------------*/

(function() {

  var global = APP.global;
  var fn = APP.fn;
  var ui = APP.ui;
  var parse = APP.parse;
  var utils = APP.utils;
  var views = APP.views;

  /**
   * ページ
   */
  var PageView = (function() {
    var constructor = function(el) {
      this.$topicPathCurrent = {};
      this.teamName = {};
      this.$title = {};
      this.init(el);
      return this;
    };
    var proto = constructor.prototype = new views.PageView();
    proto.init = function(el) {
      global.param = fn.setParam();
      this.setEl(el);
      this.onInstance();
      this.setEvents();
      this.setCustomEvents();
      return this;
    };
    proto.setEl = function(el) {
      views.PageView.prototype.setEl.apply(this, [el]);
      this.$topicPathCurrent = this.$el.find('.js-mainTopicPathCurrent');
      this.teamName = this.$el.find('.js-mainTeamName');
      this.$title = this.$el.find('.js-mainTitle');
      return this;
    };
    proto.onInstance = function() {
      views.PageView.prototype.onInstance.apply(this);
      if(location.href.indexOf('?') < 0) {
        utils.setParamAnchor(global.param);
      } else {
        this.getFeed();
      }
      return this;
    };
    proto.getFeed = function() {
      var that = this;
      $.ajax({
        type: 'get',
        url: '/common/data/player.json',
        dataType: 'json'
      }).done(function(data) {
        that.collection = data.profileData;
        that.onFeed();
      }).fail(function() {
        that.error();
      });
      return this;
    };
    proto.onFeed = function() {
      this.refineCollection();
      this.setChildViewInstance();
      return this;
    };
    proto.refineCollection = function() {
      var that = this;
      this.collection = $.grep(this.collection, function(v, i) {
        return global.param.team === v.teamId;
      });
      return this;
    };
    proto.setChildViewInstance = function() {

      /* サイドバー */
      this.sidebarView = new SidebarView();
      this.sidebarView.parentViewEl = this.$el;
      this.sidebarView.init({ el: '#SidebarView' });

      /* イメージギャラリー */
      var profileImageGalleryView = new ui.imageGallery();
      profileImageGalleryView.init({ el: '#ProfileImageGalleryView' });

      /* 切り替えコンテンツ */
      var playerAbilityView = new ui.switchView();
      playerAbilityView.init({
        el: '#PlayerAbilityView',
        isShowNum: 1
      });

      return this;
    };
    proto.setCustomEvents = function() {
      var that = this;
      this.$el.on('onRenderPlayerDetails', function(e) {
        that.onRenderPlayerDetals();
      });
      return this;
    };
    proto.onRenderPlayerDetails = function() {

      return this;
    };
    return constructor;
  })();

  /**
   * カルーセル
   */
  var carousel = (function() {
    var constructor = function() {
      this.$el = {};
      return this;
    };
    var proto = constructor.prototype;
    proto.init = function(args) {
      this.setEl(args.el);
      this.setEvents();
      return this;
    };
    proto.setEl = function(el) {
      this.$el = $(el);
      return this;
    };
    proto.setEvents = function() {
      var that = this;
      return this;
    };
    return constructor;
  })();

  /**
   * サイドバー
   */
  var SidebarView = (function() {
    var constructor = function() {
      return this;
    };
    var proto = constructor.prototype = new views.SidebarView();
    proto.onInstance = function() {
      this.$nav.find('[data-position="' + global.param.position + '"]').closest('li').addClass('current');
      views.SidebarView.prototype.onInstance.apply(this);
      return this;
    };
    proto.setEvents = function() {
      views.SidebarView.prototype.setEvents.apply(this);
      var that = this;
      this.$nav.find('a').on('click', function(e) {
        e.preventDefault();
        that.onClickNavAnchor(this);
      });
      return this;
    };
    proto.onClickNavAnchor = function(target) {
      global.param.position = $(target).data('position');
      utils.setParamAnchor(global.param);
      return this;
    };
    return constructor;
  })();

  /* インスタンス */
  $(window).load(function() {

    /* ページ */
    new PageView('#PageView');

  });

})();
