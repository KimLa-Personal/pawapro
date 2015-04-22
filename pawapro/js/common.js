/* ===================================================================

 * common.js - 共通処理
 *
 * jQuery 2.1.1

======================================================================*/

(function($) {

	var App = {

		ua: {},
		param: {},
		global: {},
		api: {},
		ui: {},
		conv: {}

	};
	window.fn = App;


/*--------------------------------------------------------------------
 ユーザエージェント判定
----------------------------------------------------------------------*/

	App.ua.name		 = window.navigator.userAgent.toLowerCase()

	App.ua.isIE		 = (App.ua.name.indexOf('msie') >= 0 || App.ua.name.indexOf('trident') >= 0);
	App.ua.isiPhone	 = App.ua.name.indexOf('iphone') >= 0;
	App.ua.isiPod	 = App.ua.name.indexOf('ipod') >= 0;
	App.ua.isiPad	 = App.ua.name.indexOf('ipad') >= 0;
	App.ua.isiOS	 = (App.ua.isiPhone || App.ua.isiPod || App.ua.isiPad);
	App.ua.isAndroid = App.ua.name.indexOf('android') >= 0;
	App.ua.isTablet	 = (App.ua.isiPad || (App.ua.isAndroid && App.ua.name.indexOf('mobile') < 0));
	App.ua.isPc		 = (!App.ua.isiPhone && !App.ua.isiPad && !App.ua.isiPod && !App.ua.isAndroid);

	// 各バージョン判定
	if (App.ua.isIE) {
		App.ua.verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(App.ua.name);
		if (App.ua.verArray) App.ua.ver = parseInt(App.ua.verArray[2], 10);
	}
	if (App.ua.isiOS) {
		App.ua.verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(App.ua.name);
		if (App.ua.verArray) App.ua.ver = parseInt(App.ua.verArray[2], 10);
	}
	if (App.ua.isAndroid) {
		App.ua.verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(App.ua.name);
		if (App.ua.verArray) App.ua.ver = parseInt(App.ua.verArray[2], 10);
	}


/*--------------------------------------------------------------------
 パラメータ変数
----------------------------------------------------------------------*/

	App.param = {

	},


/*--------------------------------------------------------------------
 グローバル変数
----------------------------------------------------------------------*/

	App.global = {

		SERVER_PATH: '/pawapro/pawapro/',				// ドメインURL+共通ディレクトリ
		PLAYER_API_URL: '../pawapro/data/player.do',	// 選手データAPIファイルURL

		apiDataArray: [],	// APIデータ格納用
		apiDataArrayOrg: []	// APIデータ格納用バックアップ用

	};


/*--------------------------------------------------------------------
 API処理関数
----------------------------------------------------------------------*/

	App.api = {

		/**
		 * API呼び出し共通関数
		 * param@ setting: API呼び出しに必要な情報
		 */
		doCallApi: function(setting) {

			// APIからJSONデータを取得
			$.ajax({
				'type': 'GET',
				'url': setting.url,
				'dataType': 'json',
				'data': setting.data,
				'timeout': 300000,
				'success': function(data) {

					// コールバック処理
					setting.callback(data);
				},
				'error': function() {
					return false;
				}
			});
		},

		/**
		 * URLのパラメータをグローバル変数に格納
		 */
		doUrlParamCheck: function() {

			// URLにパラメータがあるかをチェック
			if(location.href.indexOf('?') < 0) {

				/** パラメータがなければHTMLから取得 */
				App.api.localApiExtend();

				/** URLにパラメータを付与してリダイレクト */
				location.href = App.api.addUrlParam();
				return false;

			} else {

				/** パラメータがあれば分解してグローバル変数に格納 */
				App.api.getUrlParam();
				return true;
			}

		},

		/**
		 * HTMLに記述されているJSONデータをグローバル変数に格納
		 **/
		localApiExtend: function() {

			// headに記述されていれば処理を実行
			if(!!$('#orgParam').length) {

				// headに記述されたパラメータを取得してグローバル変数に格納
				var paramText = $('#orgParam').html();
				if (paramText != '') $.extend(App.param, JSON.parse(paramText));
			}
		},

		/**
		 * URLにパラメータを付与
		 * param@ href: URL
		 * param@ param: 付与パラメータ
		 */
		addUrlParam: function(href) {

			// href引数が空であれば現在のURLを取得
 			var url = (href == undefined || href == 'undefined') ? location.href : href;

			// パラメータを生成
			var paramData = '';
			$.each(App.param, function(index, elem) {

				// pageIdは含めない
				if(index != 'pageId') {

					// 詳細表示時はsort系パラメータは含めない
					var ifProfile = url.indexOf('profile') > -1 && index.indexOf('sort') == 0;
					if(!ifProfile) paramData += '&' + index + '=' + elem;
				}

			});
			paramData = paramData.slice(1, paramData.length);

			// URLに文字列?が含まれていれば、?以降を削除
			var urlIndexOf = url.indexOf('?');
			if(urlIndexOf > -1) url = url.slice(0, urlIndexOf);

			// URLにパラメータを付与
			return url + '?' + paramData;
		},

		/**
		 * URLのパラーメータを分解してグローバル変数に格納
		 */
		getUrlParam: function() {

			// URLからパラメータを取得
			var url = location.href;

			// URLに#が含まれていれば、パラメータ分解前に#以降を削除
			var urlInnerAnchor = url.indexOf('#');
			if(urlInnerAnchor > -1) url = url.slice(0, urlInnerAnchor);

			// パラメータを分解
			parameters = url.split('?');
			params = parameters[1].split('&');

			var paramDataArray = [];
			for(var i=0; i < params.length; i++) {
				paramTitle = params[i].split('=');
				paramDataArray[paramTitle[0]] = paramTitle[1];
			}

			// パラメータをグローバル変数に格納
			$.extend(App.param, paramDataArray);
		},

		/**
		 * APIデータをソート
		 * param@ sortKey: ソート対象のオブジェクトキー
		 * param@ sortKeySecound: 第2ソートのオブジェクトキー
		 * param@ sortOrder: descend(降順) or ascend(昇順)
		 */
		doApiSort: function(sortKey, sortKeySecound, sortOrder) {

			// ソートタイプが空であれば降順に設定
			var orderType = (sortOrder == undefined) ? 'descend' : sortOrder;

			// 配列に格納したAPIデータ
			var apiData = App.global.apiDataArray;

			// ソート処理
			apiData.sort(function(a, b) {

				var aArray = a[sortKey];
				var bArray = b[sortKey];

				// 降順昇順設定
				var ifSortUnMatch, ifSortMatch;
				if(orderType == 'descend') {
					ifSortUnMatch = aArray < bArray;
					ifSortMatch   = aArray > bArray;
				} else {
					ifSortUnMatch = aArray > bArray;
					ifSortMatch   = aArray < bArray;
				}

				// ソート処理
				if(ifSortUnMatch) return -1;
				if(ifSortMatch) return 1;

				// 第2ソート引数があれば実行
				if(sortKeySecound != undefined) {

					var aArray2 = a[sortKeySecound];
					var bArray2 = b[sortKeySecound];

					// 降順昇順設定
					var ifSort2UnMatch, ifSort2Match;
					if(orderType == 'descend') {
						ifSort2UnMatch = aArray2 < bArray2;
						ifSort2Match   = aArray2 > bArray2;
					} else {
						ifSort2UnMatch = aArray2 > bArray2;
						ifSort2Match   = aArray2 < bArray2;
					}

					// 第2ソート処理
					if(ifSort2UnMatch) return -1;
					if(ifSort2Match) return 1;
				}

			});
		},

		/**
		 * APIデータを絞り込む
		 * param@ grepIndex: 絞り込むインデックス値
		 * param@ grepKey: 絞り込む文字列
		 */
		doApiGrep: function(grepIndex, grepKey) {

			// 前方一致用の前方追加文字列
			var indexKey = '　';

			// 絞り込む文字列に文字列を追加
			if(grepKey instanceof Array == true) grepKey = grepKey.join(indexKey);
			grepKey = indexKey + grepKey;

			// 配列内のAPIデータを絞り込む
			App.global.apiDataArray = jQuery.grep(App.global.apiDataArray, function(value, index) {

				var grepWord = value[grepIndex];

				// 検索対象が守備位置の場合は前方1文字を対象にする
				if(grepIndex == 'positonNum') {

					// 絞込み対象が投手の場合は前方2文字
 					grepWord = (grepWord < 200) ? grepWord.slice(0, 2) : grepWord.slice(0, 1);
				}

				// 文字列が一致すればtrueを返す
				if(grepKey.indexOf(indexKey + grepWord) > -1 ) return true;
			});
		},

		/**
		 * プロフィールページ用パラメータの変更
		 * param@ paramName: 
		 * param@ paramTeam: 
		 * param@ paramPlayerCat: 
		 */
		setProfileParam: function(paramName, paramTeam, paramPlayerCat) {

			newParamArray = [];
			newParamArray['name'] = paramName;
			newParamArray['team'] = paramTeam;
			newParamArray['playerCat'] = paramPlayerCat;

			// グローバル変数を変更
			$.extend(fn.param, newParamArray);
		}

	};

/*--------------------------------------------------------------------
 UI処理関数
----------------------------------------------------------------------*/

	App.ui = {

		/**
		 * スムーススクロール
		 * param@ targetHref: アンカーパスID
		 */
		smoothScroll: function(targetHref) {

			var href = targetHref;

			// 遷移先URLが#のみまたは空であれば先頭に
			var target = $(href === '#' || href === '' ? 'html' : href);
			var position = target.offset().top;

			// スクロール処理
			$('html, body').animate({
				scrollTop: position
			}, 500, 'swing');
		},

		/**
		 * 画像マウスオーバー時の画像ファイル名を変換
		 * param@ $targetNode マウスオーバーした要素
		 */
		imageRollover: function($targetNode) {

			var $this = $targetNode;

			// 画像パスを取得して分解、画像ファイル名のみを取得
			var imgSrc = $this.attr('src');
			var imgPath = imgSrc.split('/');
			var imgFile = imgPath[imgPath.length -1];

			// 画像ファイル名に_onがなければ追加、あれば削除
 			var imgReplacedFile = (imgFile.indexOf('_on') == -1) ? imgSrc.replace(/(\.)(gif|jpg|png)/i, '_on$1$2') : imgSrc.replace(/(\_on)(.)(gif|jpg|png)/i, '$2$3');

			// 変換した画像パスをsrc属性に代入
			$this.attr('src', imgReplacedFile);

			return false;
		},

		/**
		 * タブ連動コンテンツ
		 * param@ $nav: タブ要素
		 * param@ $contents: 連動させるコンテンツ要素
		 */
		tabContents: function($nav, $contents) {

			var $tabNav = $nav;
			var $tabContents = $contents;
			var ACTIVE_CLASS = 'active';

			// タブクリック処理
			$tabNav.find('li a').on('click', function() {

				var $this = $(this);
				var $target = $($this.attr('href'));

				// 一度タブのクラスを削除し、コンテンツを非表示
				$tabNav.find('.' + ACTIVE_CLASS).removeClass(ACTIVE_CLASS);
				$tabContents.hide();

				// クリックしたタブにクラスを付与
				$this.parent('li').addClass(ACTIVE_CLASS);
				// 対象のコンテンツを表示
				$target.show();

				return false;
			});

			// 初期表示処理
			if(!$tabNav.find('.' + ACTIVE_CLASS).length) {

				if(App.param.playerCat == undefined || App.param.playerCat == 'undefined') {

					// パラメータ値がない場合は最初のコンテンツを表示
					$tabNav.find('li:first-child a').click();
				} else {

					// パラメータ値が投手以外であれば野手に
					var playerCats = (App.param.playerCat !== 'pitcher') ? 'fielder' : App.param.playerCat;

					// パラメータ値があればパラメータ値と同じ属性値のコンテンツを表示
					$tabNav.find('[href="#' + playerCats + '"]').click();
				}
			}

		},

		/**
		 * アコーディオン
		 */
		accordion: function() {

			var $acdHead = $('.acdHead');
			var $acdBody = $('.acdBody');

			var OPENED_CLASS = 'acdOpened';

			// 初期処理はクラスが付与されていない本体を非表示
			$acdHead.not('.' + OPENED_CLASS).next($acdBody).hide();

			// ボタンクリック時の処理
			$acdHead.on('click', function() {

				var $this = $(this);

				// クラス付与、削除の切り替え
				$this.toggleClass(OPENED_CLASS);

				// 本体の表示、非表示の切り替え
				$this.next($acdBody).slideToggle();
			});

		},

		/**
		 * thickbox
		 * param@ openedFn: 表示時の実行処理
		 * param@ closedFn: 非表示時の実行処理
		 */
		thickbox: function(openedFn, closedFn) {

			var $thickbox = $('#thickbox');		// thickbox全体要素
			var fadeSpeed = 300;				// fadeIn、fadeOut時のスピード

			// thickboxを表示
			$thickbox.fadeIn(fadeSpeed, function() {

				// 表示時の処理があれば実行
				if(openedFn != undefined) openedFn();

				// 閉じるボタン、検索パネル以外クリック時は非表示
				$('.thickboxInner').on('click', function() { return false; });
				$('.btnClose, #thickbox').on('click', function() {

					// 非表示時の処理があれば実行
					if(closedFn != undefined) closedFn();

					// thickboxを閉じる
					$thickbox.fadeOut(fadeSpeed);
				});
			});

		},

		/**
		 * Loading画像を表示
		 * param@ $targetNode: 画像を表示させる要素
		 * param@ fn: 表示の実行関数
		 */
		viewLoadingImage: function($targetNode, fn) {

			var $target = $targetNode;

			// loading画像HTMLをセット
			$target.before('<div class="loadingImage"></div>');

			// 要素を非表示
			$target.hide();

			// loading画像を一定時間表示後に、HTML出力処理を実行
			var $loadingImage = $('.loadingImage');
			setTimeout(function() {

				// loading画像を削除
				$loadingImage.remove();

				// 処理を実行
				fn();

			}, 1500);

		}

	};

/*--------------------------------------------------------------------
 データ処理処理関数
----------------------------------------------------------------------*/

	App.conv = {

		/**
		 * ゼロ埋め
		 * param@ num: 数字
		 * param@ len: 出力文字数
		 */
		zeroPadding: function(num, len) {

			var numLen = String(num).length;

			if(numLen < len) {

				// 足りない文字カウント分'0'を追記
				var addZero = '';
				for(var i=0; i<(len - numLen); i++) {
					addZero = addZero + '0';
				}
				num = (addZero + num);
			}

			return num;
		},

		/**
		  * 数値をカンマ区切りする
		  * param@ num: 数値
		 **/
		doNumberDelimite: function(num) {

			return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
		},

		/**
		 * 画像が404だった場合に代替画像に差し替える
		 * param@ $targetNode: 対象要素
		 * param@ imagePath: 代替画像パス
		 */
		imgErrorSubstitute: function($targetNode, imagePath) {

			// 対象要素がimgタグでなければ、引数の子孫要素のimgタグを対象に
			if(!!$targetNode.find('img').length) $targetNode = $targetNode.find('img');

			// 対象要素全てをチェック
			$targetNode.each(function() {

				// もし画像が存在しない場合は代替画像パスに置換
				var $this = $(this);
				$this.error(function() {
					$this.attr('src', imagePath);
				});
			});
			return false;
		},

		/**
		 * プレイヤーカテゴリを日本語表記に変換
		 * param@ str: 文字列
		 */
		doPlayerCatJapanese: function(str) {

			var enText = ['pitcher', 'catcher', 'infielder', 'outfielder'];
			var jpText = ['投手', '捕手', '内野手', '外野手'];

			// ループ処理で引数に一致した順の日本語表記を返す
			var strJp;
			for(var i=0; i<enText.length; i++) {
				if(str == enText[i]) {
					strJp = jpText[i];
				}
			}
			return strJp;
		},

		/**
		 * 文字列を年月日のフォーマットに変換
		 * param@ timeData: 文字列
		 */
		timeFormatString: function(timeData) {

			// 数字以外の文字列が含まれていた場合は文字列をそのまま返す
			if(isNaN(Number(timeData)) == true || timeData == undefined || timeData == 'undefined') return timeData;

			// 文字列に変換
			var getStr = String(timeData);

			// 変換フォーマット
			var timeFormat = 'yyyymmddHHMMSSFFF';

			// 初期値
			var year = 1990, month = 01, date = 01;
			var hour = '00', minute = '00';
			var second = '00', millisecond = '000';

			// 文字列を変換フォーマットに変換
			var set;
			set = timeFormat.indexOf('yyyy');
			if(set > -1) year = getStr.substr(set, 4);

			set = timeFormat.indexOf('mm');
			if(set > -1) month = Number(getStr.substr(set, 2)) - 1;

			set = timeFormat.indexOf('dd');
			if(set > -1) date = getStr.substr(set, 2);

			set = timeFormat.indexOf('HH');
			if(set > -1) hour = getStr.substr(set, 2);

			set = timeFormat.indexOf('MM');
			if(set > -1) minute = getStr.substr(set, 2);

			set = timeFormat.indexOf('SS');
			if(set > -1) second = getStr.substr(set, 2);

			// タイムゾーンに変換
			var newData = new Date(year, month, date, hour, minute, second, millisecond);

			// 曜日の表示文字列を設定
			var week = ['日', '月', '火', '水', '木', '金', '土'];

			// 分解した年月日を結合
			var rtnStr = [];
			rtnStr.push(newData.getFullYear() + '年');
			rtnStr.push((newData.getMonth() + 1) + '月');
			rtnStr.push(newData.getDate() + '日');
			//rtnStr.push('（' + week[newData.getDay()] + '）'); // 曜日

			return rtnStr.join('');
		},

		/**
		 * ステータス値によってステータス属性を変換
		 * param@ value: ステータス値
		 * param@ value: 大文字(learge) or 小文字(smallまたは未記入)
		 */
		doStatusTypeVal: function(value, setType) {

			// ステータス属性を設定
			var paramTypeSet = (setType == 'learge') ? ['S', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] : ['s', 'a', 'b', 'c', 'd', 'e', 'f', 'g'];

			// 各ステータス値の範囲を設定
			var paramRangeS = value >= 90;
			var paramRangeA = value < 90 && value >= 80;
			var paramRangeB = value < 80 && value >= 70;
			var paramRangeC = value < 70 && value >= 60;
			var paramRangeD = value < 60 && value >= 50;
			var paramRangeE = value < 50 && value >= 40;
			var paramRangeF = value < 40 && value >= 30;
			var paramRangeG = value < 30;

			// 引数で取得したステータス値を範囲によってステータス属性を設定
			var paramType;
			if(paramRangeS) {
				paramType = paramTypeSet[0];
			} else if(paramRangeA) {
				paramType = paramTypeSet[1];
			} else if(paramRangeB) {
				paramType = paramTypeSet[2];
			} else if(paramRangeC) {
				paramType = paramTypeSet[3];
			} else if(paramRangeD) {
				paramType = paramTypeSet[4];
			} else if(paramRangeE) {
				paramType = paramTypeSet[5];
			} else if(paramRangeF) {
				paramType = paramTypeSet[6];
			} else if(paramRangeG) {
				paramType = paramTypeSet[7];
			}

			return paramType;
		},

		/**
		 * パスから拡張子を除いたファイル名のみ抽出
		 * param@ filePath: ファイルパス
		 */
		getFileName: function(filePath) {

			var fileName;

			// href属性からファイル名のみ取り出す
			hrefPath = filePath.split('/');
			fileName = hrefPath[hrefPath.length -1];

			// もしhref属性に.htmlがあれば.htmlを削除
			var hrefIndexOf = fileName.indexOf('.html');
			if(hrefIndexOf > -1) fileName = fileName.slice(0, hrefIndexOf);

			return fileName;
		}

	};

/*--------------------------------------------------------------------
 即時実行処理
----------------------------------------------------------------------*/

	/**
	 * 初期実行処理
	 */
	var init = function() {

		/** URLのパラメータをグローバル変数に格納 */
		App.api.doUrlParamCheck();

		// ホスト名によってルート相対パスを変更
		if(location.host == 'fe.lc-design.jp') {
			App.global.SERVER_PATH = '/sample/kimura/pawapro/';
		} else if(location.host == 'homepage2.nifty.com') {
			App.global.SERVER_PATH = '/nastyboy/pawapro/pawapro/';
		}

		/** pagetopボタンの表示処理 */
		if(!!$('#globalFooter .btnPagetop').length && fn.ua.isPc) btnPagetopView();

		/** アコーディオン */
		if(!!$('.acdHead').length && !!$('.acdBody').length) App.ui.accordion();

		/** スムーススクロール */
		$('a[href^="#"]').on('click', function() {
			App.ui.smoothScroll($(this).attr('href'));
		});

		/** 画像マウスオーバー時の画像ファイル名変換 */
		$('.btn').hover(function() {
			App.ui.imageRollover($(this));
		}, function() {
			App.ui.imageRollover($(this));
		});

	};

	/**
	 * pagetopボタンの表示処理
	 */
	var btnPagetopView = function() {

		var $win = $(window);
		var $linkPagetop = $('#globalFooter .btnPagetop');
		var viewSpeed = 150;

		// 初期は非表示
		$linkPagetop.hide();

		// スクロールイベント発生時のみ表示処理を実行
		if($win.height() < $('body').height()) {

			$win.scroll(function() {
				var scrollTop = $('body').scrollTop();
				(scrollTop > 0) ? $linkPagetop.fadeIn(viewSpeed) : $linkPagetop.fadeOut(viewSpeed);
			});
		}
	};

	/** 初期実行処理 */
	init();

})(jQuery);
