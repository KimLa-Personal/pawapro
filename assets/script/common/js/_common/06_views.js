(function(app, window, decument, undefined) {

  /**
   * ページ
   */
  app.views.PageView = (function() {
    var constructor = function(el) {
      this.$el = {};
      this.$anchor = {};
      this.isAnimate = false;
      this.scrollSpeed = 500;
      this.init(el);
      return this;
    };
    var proto = constructor.prototype;
    proto.init = function(el) {
      this.setEl(el);
      this.setEvents();
      return this;
    };
    proto.setEl = function(el) {
      this.$el = $(el);
      this.$anchor = this.$el.find('a[href^="#"]');
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
        return false;
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
      return this;
    };
    proto.smoothScroll = function(href) {
      this.isAnimate = true;
      var $target = $(href === '#' || href === '' ? 'html' : href);
      if($target.length > 0) {
        var position = $target.offset().top;
        $('html, body').animate({
          scrollTop: position
        }, this.scrollSpeed, 'swing');
      }
      return this;
    };
    proto.onScroll = function(scrollTop) {
      this.isAnimate = true;
      return this;
    };
    proto.onResize = function() {
      return this;
    };
    return constructor;
  })();

})(App, window, document);