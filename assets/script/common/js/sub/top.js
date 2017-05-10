/*--------------------------------------------------------------------
 top.js
----------------------------------------------------------------------*/

(function() {

  var global = APP.global;
  var fn = APP.fn;
  var ui = APP.ui;
  var parse = APP.parse;
  var utils = APP.utils;
  var views = APP.views;

  /**
   * インスタンス
   */
  var setViewInstance = function() {

    /* ページ */
    new views.PageView('#PageView');

  };

  /* インスタンス */
  $(window).load(function() {
    setViewInstance();
  });

})();
