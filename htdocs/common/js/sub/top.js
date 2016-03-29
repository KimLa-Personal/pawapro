/*--------------------------------------------------------------------
 sub/top.js
 ----------------------------------------------------------------------*/
 (function() {

 	var global = APP.global;
 	var api = APP.api;
 	var fn = APP.fn;
 	var ui = APP.ui;
 	var utils = APP.utils;
 	var views = APP.views;

 	/**
 	 * 初期処理
 	 */
 	var pageInit = function() {

 		/* トップ */
 		var topView = new TopView();
 		topView.init('#TopView');

 	};

 	/**
 	 * トップ
 	 */
 	var TopView = (function() {
 		var constructor = function() {
 			return this;
 		};
 		var proto = constructor.prototype = new views.PageView();
 		proto.render = function() {
 			views.PageView.prototype.render.apply(this);

 			return this;
 		};
 		return constructor;
 	})();

 	/* 初期処理 */
 	pageInit();

 })();
