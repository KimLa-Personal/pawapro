/*--------------------------------------------------------------------
 playerList.js
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
      this.sidebarView = {};
      this.refinePanelView = {};
      this.listControlView = {};
      this.playerListView = {};
      this.pagerView = {};
      this.collection = [];
      this.listShowCount = 10;
      this.init(el);
      return this;
    };
    var proto = constructor.prototype = new views.PageView();
    proto.init = function(el) {
      global.param = fn.setParam();
      global.param.startIndex = Number(global.param.startIndex);
      this.setEl(el);
      this.onInstance();
      this.setEvents();
      this.setCustomEvents();
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
      if(global.param.team !== 'all') {
        this.refineCollection();
      }
      this.collection = fn.setSortData(this.collection, global.param.sortKeyword, global.param.sortOrder);
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

      /* 絞り込みパネル */
      this.refinePanelView = new RefinePanelView();
      this.refinePanelView.parentViewEl = this.$el;
      this.refinePanelView.init({ el: '#RefinePanelView' });

      /* 一覧操作 */
      this.listControlView = new ListControlView();
      this.listControlView.init({
        el: '#ListControlView',
        collection: this.collection,
        listShowCount: this.listShowCount
      });

      /* 選手一覧 */
      this.playerListView = new PlayerListView();
      this.playerListView.parentViewEl = this.$el;
      this.playerListView.init({
        el: '#PlayerListView',
        collection: this.collection,
        listShowCount: this.listShowCount
      });

      /* ページャー */
      this.pagerView = new PagerView();
      this.pagerView.parentViewEl = this.$el;
      this.pagerView.init({
        el: '#PagerView',
        collection: this.collection,
        listShowCount: this.listShowCount
      });

      return this;
    };
    proto.error = function() {
      return this;
    };
    proto.onResize = function() {
      this.sidebarView.onResize();
      views.PageView.prototype.onResize.apply(this);
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
      this.$nav.find('[data-team="' + global.param.team + '"]').closest('li').addClass('current');
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
      global.param.team = $(target).data('team');
      global.param.startIndex = 1;
      utils.setParamAnchor(global.param);
      return this;
    };
    return constructor;
  })();

  /**
   * 絞り込みパネル
   */
  var RefinePanelView = (function() {
    var constructor = function() {
      this.$el = {};
      this.$btnAccord = {};
      this.$mainAccord = {};
      this.isAnimate = false;
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
      this.$btnAccord = this.$el.find('.js-accordTriggerBtn');
      this.$mainAccord = this.$el.find('.js-accordMain');
      return this;
    };
    proto.onInstance = function() {
      this.$mainAccord.hide();
      return this;
    };
    proto.setEvents = function() {
      var that = this;
      this.$btnAccord.on('click', function() {
        if(!that.isAnimate) {
          that.onClickBtnAccord();
          that.isAnimate = false;
        }
      });
      return this;
    };
    proto.onClickBtnAccord = function() {
      this.isAnimate = true;
      this.$mainAccord.slideToggle();
      this.$mainAccord.toggleClass('active');
      return this;
    };
    return constructor;
  })();

  /**
   * 一覧操作
   */
  var ListControlView = (function() {
    var constructor = function() {
      this.$el = {};
      this.$sortTab = {};
      this.$info = {};
      this.collection = [];
      this.listShowCount = 10;
      return this;
    };
    var proto = constructor.prototype;
    proto.init = function(args) {
      this.collection = args.collection || null;
      this.listShowCount =  args.listShowCount || this.listShowCount;
      this.setEl(args.el);
      this.onInstance();
      this.setEvents();
      return this;
    };
    proto.setEl = function(el) {
      this.$el = $(el);
      this.$sortTab = this.$el.find('.js-listControlSortTab');
      this.$info = this.$el.find('.js-listControlInfo');
      return this;
    };
    proto.onInstance = function() {
      this.$sortTab.find('[data-sortkeyword="' + global.param.sortKeyword + '"]').addClass('active');
      this.$info.html(global.param.startIndex + ' - ' + (global.param.startIndex + this.listShowCount -1) + '件<small>（全' + this.collection.length + '件中）</small>');
      return this;
    };
    proto.setEvents = function() {
      var that = this;
      this.$sortTab.find('li').on('click', function() {
        that.onClickSortTab(this);
      });
      return this;
    };
    proto.onClickSortTab = function(target) {
      global.param.sortKeyword = $(target).data('sortkeyword');
      global.param.sortOrder = $(target).data('sortorder');
      global.param.startIndex = 1;
      utils.setParamAnchor(global.param);
      return this;
    };
    return constructor;
  })();

  /**
   * 選手一覧
   */
  var PlayerListView = (function() {
    var constructor = function() {
      this.$el = {};
      this.$list = {};
      this.collection = [];
      this.listShowCount = 10;
      return this;
    };
    var proto = constructor.prototype;
    proto.init = function(args) {
      this.collection = args.collection || null;
      this.listShowCount =  args.listShowCount || this.listShowCount;
      this.setEl(args.el);
      this.render();
      return this;
    };
    proto.setEl = function(el) {
      this.$el = $(el);
      this.$list = this.$el.find('.js-playerCassetteList');
      return this;
    };
    proto.render = function() {
      this.renderPlayerList();
      return this;
    };
    proto.renderPlayerList = function() {
      var that = this;
      var tmpl = [];
      var startIndex = Number(global.param.startIndex)-1;
      for(var i=startIndex; i<this.collection.length; i++) {
        if(i === startIndex + this.listShowCount) { break; }
        var model = this.collection[i];
        var isPitcher = (model.playerCats === 'pitcher') ? true : false;

        tmpl.push('<li class="playerCassette">');
        tmpl.push('  <a href="#">');
        tmpl.push('    <h3 class="playerCassette-name">' + model.backNo + '. ' + model.name + '<small>' + model.ruby + '</small></h3>');
        tmpl.push('    <div class="playerCassette-thumb">');
        tmpl.push('      <figure><img src="' + model.thumbImage + '" alt="' + model.name + '"></figure>');
        tmpl.push('    </div>');
        tmpl.push('    <div class="playerCassette-data">');
        tmpl.push('      <ul class="playerCassette-data-prof">');
        tmpl.push('        <li class="playerCassette-data-prof-position">');
        if(isPitcher) {
          tmpl.push('          ' + model.positionType);
        } else {
          tmpl.push('          ' + that.parsePositionString(model.positions));
        }
        tmpl.push('        </li>');
        tmpl.push('        <li class="playerCassette-data-prof-team">' + model.teamName + '</li>');
        tmpl.push('        <li class="playerCassette-data-prof-handed">' + model.handedness + '</li>');
        tmpl.push('        <li class="playerCassette-data-prof-birthday">' + parse.timeFormat(model.birthday) + '生</li>');
        tmpl.push('        <li class="playerCassette-data-prof-carrier">' + model.length +'年目</li>');
        tmpl.push('      </ul>');
        tmpl.push('      <ul class="playerCassette-data-param">');
        if(isPitcher) {
          tmpl.push('        <li class="playerCassette-data-param-speed"><span>' + model.paramSpeed + '</span>km/h</li>');
          tmpl.push('        <li class="playerCassette-data-param-control">コントロール<span class="icon-param' + parse.statusType(model.paramControl) + '">' + model.paramControl + '</span></li>');
          tmpl.push('        <li class="playerCassette-data-param-stamina">スタミナ<span class="icon-param' + parse.statusType(model.paramStamina) + '">' + model.paramStamina + '</span></li>');
        } else {
          tmpl.push('        <li>弾道<span class="icon-param' + model.paramBallistic + '">' + model.paramBallistic + '</span></li>');
          tmpl.push('        <li>ミート<span class="icon-param' + parse.statusType(model.paramMeet) + '">' + model.paramMeet + '</span></li>');
          tmpl.push('        <li>打撃パワー<span class="icon-param' + parse.statusType(model.paramPower) + '">' + model.paramPower + '</span></li>');
          tmpl.push('        <li>走力<span class="icon-param' + parse.statusType(model.paramRun) + '">' + model.paramRun + '</span></li>');
          tmpl.push('        <li>肩力<span class="icon-param' + parse.statusType(model.paramThrow) + '">' + model.paramThrow + '</span></li>');
          tmpl.push('        <li>守備力<span class="icon-param' + parse.statusType(model.paramFialding) + '">' + model.paramFialding + '</span></li>');
          tmpl.push('        <li>捕球<span class="icon-param' + parse.statusType(model.paramCatching) + '">' + model.paramCatching + '</span></li>');
        }
        tmpl.push('      </ul>');
        tmpl.push('    </div>');
        tmpl.push('  </a>');
        tmpl.push('</li>');
      }

      this.$list.append(tmpl.join('')).promise().done(function() {
        that.onRender();
      });
      return this;
    };
    proto.parsePositionString = function(array) {
      var str = '';
      for(var i=0; i<array.length; i++) {
        str += (array[i].position.indexOf('◎') > -1 || array[i].position.indexOf('○') > -1) ? array[i].position.slice(0, -1) : array[i].position;
        if(array.length > 1 && i === 0) { str += '<span>'; }
        if(array.length > 1 && i === array.length-1) { str += '</span>'; }
      }
      return str;
    };
    proto.onRender = function() {
      return this;
    };
    proto.setEvents = function() {
      var that = this;
      return this;
    };
    return constructor;
  })();

  /**
   * ページャー
   */
  var PagerView = (function() {
    var constructor = function() {
      this.$el = {};
      this.$pagerList = {};
      this.$btnStart = {};
      this.$btnLast = {};
      this.$btnPrev = {};
      this.$btnNext = {};
      this.collection = [];
      this.listShowCount = 10;      // 一覧表示カセット数
      this.showPagerCount = 5;      // ページャーの数
      this.startPagerNum = 1;       // ページャー開始番号
      this.endPagerNum = 1;         // ページャー終了番号
      this.showCurrentPagerNum = 1; // 現在のページャー番号
      this.showFirstPagerNum = 1;   // 表示するページャー開始番号
      this.classCurrent = 'current';
      this.classDisabled = 'disabled';
      return this;
    };
    var proto = constructor.prototype;
    proto.init = function(args) {
      this.collection = args.collection || null;
      this.listShowCount = args.listShowCount || this.listShowCount;
      this.setEl(args.el);
      this.onInstance();
      this.render();
      return this;
    };
    proto.setEl = function(el) {
      this.$el = $(el);
      return this;
    };
    proto.onInstance = function() {
      this.startPagerNum = 1;
      this.endPagerNum = Math.ceil(this.collection.length/this.listShowCount);
      this.showCurrentPagerNum = Math.ceil(global.param.startIndex/this.listShowCount);
      if(this.endPagerNum > this.showPagerCount) {
        var pagerHalfNum = Math.floor(this.showPagerCount/2);
        this.showFirstPagerNum = this.showCurrentPagerNum - pagerHalfNum;
        this.showFirstPagerNum = (this.showFirstPagerNum < 1) ? 1 : this.showFirstPagerNum;
        if((this.showCurrentPagerNum + pagerHalfNum) > this.endPagerNum) {
          this.showFirstPagerNum = this.endPagerNum - this.showPagerCount +1;
        }
      }
      return this;
    };
    proto.render = function() {
      var that = this;
      var tmpl = [];
      var pagerNum = (this.endPagerNum < this.showPagerCount) ? this.endPagerNum : this.showPagerCount;
      tmpl.push('<p class="playerList-pager-btnStart js-pagerBtnStart" data-startindex="' + this.startPagerNum + '">&lt;&lt; 最初へ</p>');
      tmpl.push('<p class="playerList-pager-btnPrev js-pagerBtnPrev" data-startindex="' + (this.showCurrentPagerNum-1) + '">&lt; 前へ</p>');
      tmpl.push('<ol class="playerList-pager-list js-pagerList">');
      for(var i=0; i<pagerNum; i++) {
        var pageNum = this.showFirstPagerNum+i;
        tmpl.push('  <li data-startindex="' + pageNum + '">' + pageNum + '</li>');
      }
      tmpl.push('</ol>');
      tmpl.push('<p class="playerList-pager-btnNext js-pagerBtnNext" data-startindex="' + (this.showCurrentPagerNum+1) + '">次へ &gt;</p>');
      tmpl.push('<p class="playerList-pager-btnLast js-pagerBtnLast" data-startindex="' + this.endPagerNum + '">最後へ &gt;&gt;</p>');
      this.$el.append(tmpl.join('')).promise().done(function() {
        that.onRender();
      });
      return this;
    };
    proto.onRender = function() {
      this.$pagerList = this.$el.find('.js-pagerList');
      this.$btnStart = this.$el.find('.js-pagerBtnStart');
      this.$btnLast = this.$el.find('.js-pagerBtnLast');
      this.$btnPrev = this.$el.find('.js-pagerBtnPrev');
      this.$btnNext = this.$el.find('.js-pagerBtnNext');
      this.setClass();
      this.setEvents();
      return this;
    };
    proto.setClass = function() {
      this.$pagerList.find('[data-startindex="' + this.showCurrentPagerNum + '"]').addClass(this.classCurrent);
      if(this.$pagerList.find('.' + this.classCurrent).data('startindex') === this.startPagerNum) {
        this.$btnStart.addClass(this.classDisabled);
      }
      if(this.$pagerList.find('.' + this.classCurrent).data('startindex') === this.endPagerNum) {
        this.$btnLast.addClass(this.classDisabled);
      }
      if(this.$btnPrev.data('startindex') < 1) {
        this.$btnPrev.addClass(this.classDisabled);
      }
      if(this.$btnNext.data('startindex') > this.endPagerNum) {
        this.$btnNext.addClass(this.classDisabled);
      }
      return this;
    };
    proto.setEvents = function() {
      var that = this;
      this.$pagerList.find('li').on('click', function() {
        that.onClickPagerList(this);
      });
      this.$el.children('p').on('click', function() {
        if(!$(this).hasClass(that.classDisabled)) {
          that.onClickPagerList(this);
        }
      });
      return this;
    };
    proto.onClickPagerList = function(target) {
      global.param.startIndex = ($(target).data('startindex')-1) * this.listShowCount +1;
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
