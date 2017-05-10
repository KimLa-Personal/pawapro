/*--------------------------------------------------------------------
 common.js
----------------------------------------------------------------------*/

(function(window, undefined) {

  var App = {
    global: {},
    fn: {},
    ui: {},
    parse: {},
    utils: {},
    views: {}
  };
  window.APP = App;

})(window);

(function(App, window, decument, undefined) {


/* global
------------------------------------------------------------*/

  App.global = {

    /* レスポンシブのSP判定幅 */
    responsiveBreakPoint: 768

  };


/* fn
------------------------------------------------------------*/

  App.fn = {

    /**
     * デバイス判定
     */
    isMediaSp: function() {
      return ($(window).width() > App.global.responsiveBreakPoint) ? false : true;
    },

    /**
     * パラメータを分解して返す
     */
    setParam: function() {
      var param = {};
      var url = location.href;
      var init = function() {
        checkParam();
        return this;
      };
      var checkParam = function() {
        if(url.indexOf('?') < 0) {
          param = JSON.parse($('#paramDefault').html());
        } else {
          getParam();
        }
        return this;
      };
      var getParam = function() {
        url = url.split('?');
        var params = url[1].split('&');
        var paramArray = [];
        for(var i=0; i<params.length; i++) {
          var title = params[i].split('=');
          paramArray[title[0]] = title[1];
        }
        param = $.extend({}, paramArray);
        return this;
      };
      init();
      return param;
    },

    /**
     * データをソート
     */
    setSortData: function(data, sortKeyword, sortOrder) {
      var isOrderTypeDescend = (sortOrder === undefined || sortOrder === 'descend') ? true : false;
      var init = function() {
        if(sortKeyword !== undefined) {
          sortData();
        }
        return this;
      };
      var sortData = function() {
        data.sort(function(a, b) {
          var sortMatch = 0;
          var sortUnMatch = 0;
          if(isOrderTypeDescend) {
            sortUnMatch = a[sortKeyword] < b[sortKeyword];
            sortMatch = a[sortKeyword] > b[sortKeyword];
          } else {
            sortUnMatch = a[sortKeyword] > b[sortKeyword];
            sortMatch = a[sortKeyword] < b[sortKeyword];
          }
          if(sortUnMatch) return -1;
          if(sortMatch) return 1;
        });
      };
      init();
      return data;
    }

  };


/* ui
------------------------------------------------------------*/

  App.ui = {

  };


/* parse
------------------------------------------------------------*/

  App.parse = {

    /**
     * 文字列を年月日のフォーマットに変換
     */
    timeFormat: function(num) {
      var str = String(num) || undefined;
      var date = {
        year: 1990, month: 01, day: 01,
        hour: '00', minute: '00',
        second: '00', millisecond: '000'
      };
      var init = function() {
        parseFormat();
        joinString();
        return this;
      };
      var parseFormat = function() {
        var format = 'yyyymmddHHMMSSFFF';
        var set = format.indexOf('yyyy');
        if(set > -1) { date.year = str.substr(set, 4); }
        set = format.indexOf('mm');
        if(set > -1) { date.month = Number(str.substr(set, 2)) - 1; }
        set = format.indexOf('dd');
        if(set > -1) { date.day = str.substr(set, 2); }
        set = format.indexOf('HH');
        if(set > -1) { date.hour = str.substr(set, 2); }
        set = format.indexOf('MM');
        if(set > -1) { date.minute = str.substr(set, 2); }
        set = format.indexOf('SS');
        if(set > -1) { date.second = str.substr(set, 2); }
        return this;
      };
      var joinString = function() {
        var newData = new Date(date.year, date.month, date.day, date.hour, date.minute, date.second, date.millisecond);
        str = newData.getFullYear() + '年' + (newData.getMonth() + 1) + '月' + newData.getDate() + '日';
        return this;
      };
      init();
      return str;
    },

    /**
     * ステータス値によってステータス属性を変換
     */
    statusType: function(num, type) {
      num = Number(num);
      var isLarge = (type === undefined || type) ? true : false;
      var statusStr = '';
      var init = function() {
        parseNum();
        return this;
      };
      var parseNum = function() {
        var setStatusStrArray = ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
        if(num >= 90) {
          statusStr = setStatusStrArray[0];
        } else if(num < 90 && num >= 80) {
          statusStr = setStatusStrArray[1];
        } else if(num < 80 && num >= 70) {
          statusStr = setStatusStrArray[2];
        } else if(num < 70 && num >= 60) {
          statusStr = setStatusStrArray[3];
        } else if(num < 60 && num >= 50) {
          statusStr = setStatusStrArray[4];
        } else if(num < 50 && num >= 40) {
          statusStr = setStatusStrArray[5];
        } else if(num < 40 && num >= 30) {
          statusStr = setStatusStrArray[6];
        } else if(num < 30) {
          statusStr = setStatusStrArray[7];
        }
        return this;
      };
      init();
      return (isLarge) ? statusStr.toUpperCase() : statusStr.toLowerCase();
    }

  };


/* utils
------------------------------------------------------------*/

  App.utils = {

    /**
     * 現在のパラメータ候補をパラメータに変換して遷移
     */
    setParamAnchor: function(params, href) {
      var param = '';
      var url = href || location.href;
      var init = function() {
        checkHref();
        parseParam();
        transitionsHref();
        return this;
      };
      var checkHref = function() {
        if(url.indexOf('?') > -1) {
          url = url.slice(0, url.indexOf('?'));
        }
        return this;
      };
      var parseParam = function() {
        $.each(params, function(k, v) {
          param += k + '=' + v + '&';
        });
        param = param.slice(0, -1);
        return this;
      };
      var transitionsHref = function(k, v) {
        location.href = url += '?' + param;
        return this;
      };
      init();
      return this;
    }

  };


/* views
------------------------------------------------------------*/

  App.views = {

    /**
     * ページ
     */
    PageView: (function() {
      var constructor = function(el) {
        this.$el = {};
        this.$anchor = {};
        this.$sidebarOpenTrigger = {};
        this.$btnPagetop = {};
        this.scrollSpeed = 500;
        this.isAnimate = false;
        this.init(el);
        return this;
      };
      var proto = constructor.prototype;
      proto.init = function(el) {
        this.setEl(el);
        this.onInstance();
        this.setChildViewInstance();
        this.setEvents();
        this.setCustomEvents();
        return this;
      };
      proto.setEl = function(el) {
        this.$el = $(el);
        this.$anchor = this.$el.find('a[href^="#"]');
        this.$sidebarOpenTrigger = this.$el.find('.js-triggerOpenSidebar');
        this.$btnPagetop = this.$el.find('.js-btnPagetop');
        return this;
      };
      proto.onInstance = function() {
        if(!App.fn.isMediaSp()) {
          this.$btnPagetop.hide();
        }
        return this;
      };
      proto.setChildViewInstance = function() {
        return this;
      };
      proto.setEvents = function() {
        var that = this;
        this.$anchor.on('click', function(e) {
          e.preventDefault();
          if(!that.isAnimate) {
            that.smoothScroll($(this).attr('href'));
            that.isAnimate = false;
          }
        });
        $(window).on('scroll', function() {
          if(!that.isAnimate) {
            that.onScroll($(window).scrollTop());
            that.isAnimate = false;
          }
        });
        $(window).on('resize', function() {
          that.onResize();
        });
        if(this.$sidebarOpenTrigger.length > 0) {
          this.$sidebarOpenTrigger.on('click', function() {
            that.sidebarView.onClickTrigger();
          });
        }
        return this;
      };
      proto.smoothScroll = function(href) {
        this.isAnimate = true;
        var $target = $(href === '#' || href === '' ? 'html' : href);
        var position = $target.offset().top;
        $('html, body').animate({
          scrollTop: position
        }, this.scrollSpeed, 'swing');
        return this;
      };
      proto.onScroll = function(scrollTop) {
        this.isAnimate = true;
        if(!App.fn.isMediaSp()) {
          if(scrollTop > $(window).height() * 1.5) {
            this.$btnPagetop.fadeIn();
          } else {
            this.$btnPagetop.fadeOut();
          }
        }
        return this;
      };
      proto.onResize = function() {
        if(App.fn.isMediaSp()) {
          this.$btnPagetop.show();
        }
        return this;
      };
      proto.setCustomEvents = function() {
        return this;
      };
      return constructor;
    })(),

    /**
     * サイドバー
     */
    SidebarView: (function() {
      var constructor = function() {
        this.$el = {};
        this.$nav = {};
        this.openWrapScrollTop = 0;
        this.isShow = false;
        return this;
      };
      var proto = constructor.prototype;
      proto.init = function(args) {
        this.setEl(args.el);
        this.onInstance();
        this.setEvents();
        return this;
      };
      proto.setEl = function(el) {
        this.$el = $(el);
        this.$nav = this.$el.find('.js-sidebarNav');
        return this;
      };
      proto.onInstance = function() {
        if(App.fn.isMediaSp()) {
          this.$el.hide();
          this.$el.css({ opacity: 1 });
        }
        return this;
      };
      proto.setEvents = function() {
        var that = this;
        this.$el.on('click', function() {
          if(App.fn.isMediaSp()) {
            that.closeEl();
          }
        });
        this.$nav.on('click', function(e) {
          e.stopPropagation();
        });
        return this;
      };
      proto.onClickTrigger = function() {
        if(this.isShow) {
          this.closeEl();
        } else {
          this.openEl();
        }
        return this;
      };
      proto.openEl = function() {
        this.openWrapScrollTop = $(window).scrollTop();
        this.$el.fadeIn();
        this.parentViewEl.css({
          position: 'fixed',
          top: -this.openWrapScrollTop
        });
        this.isShow = true;
        return this;
      };
      proto.closeEl = function() {
        this.$el.fadeOut();
        this.parentViewEl.css({
          position: 'relative',
          top: 'auto'
        });
        $(window).scrollTop(this.openWrapScrollTop);
        this.isShow = false;
        return this;
      };
      proto.onResize = function() {
        if(!App.fn.isMediaSp()) {
          this.$el.show();
        } else {
          this.slideWidth = Math.floor(this.$el.outerWidth());
          this.$el.hide();
          this.$el.css({ opacity: 1 });
        }
        return this;
      };
      return constructor;
    })()

  };

})(APP, window, document);
