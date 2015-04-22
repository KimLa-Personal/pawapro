/* ===================================================================

 * list.js - 一覧ページ表示処理
 *
 * jQuery 2.1.1

======================================================================*/

$(function() {

/*--------------------------------------------------------------------
 一覧用変数
----------------------------------------------------------------------*/

	var list = {
		asset: {},
		ui: {}
	};

	// 追加変数
	var setting = {

		VIEW_LIST_NUM: 10, 	// 一覧表示数
		PLAYER_ALL_NUM: '',	// アイテムの総数

		apiRefineArray: [],	// 一覧絞込みキー格納用

		THUMB_NOIMG_PATH: fn.global.SERVER_PATH + 'img/player/img_noThumb.gif'	// サムネイル用NO PHOTO画像パス

	};

	// グローバル変数に追加
	$.extend(fn.global, setting);


/*--------------------------------------------------------------------
 一覧用処理関数
----------------------------------------------------------------------*/

	list.asset = {

		/**
		 * プロフィールページ用パラメータの変更
		 * param@ paramTeam: 
		 * param@ paramSortKeyword: 
		 */
		setParamExtend: function(paramTeam, paramSortKeyword, paramSortOrder) {

			newParamArray = [];
			newParamArray['team'] = paramTeam;
			newParamArray['sortKeyword'] = paramSortKeyword;
			newParamArray['sortOrder'] = paramSortOrder;

			// グローバル変数を変更
			$.extend(fn.param, newParamArray);
		},


		/**
		 * チェックボックスをチェック時の処理
		 * param@ $targetNode: チェックした要素
		 */
		checkboxGroupCheck: function($targetNode) {

			var $this = $targetNode;
			var $checkGroup = $this.parents('ul');

			if($this.val() == 'all') {

				// クリックしたのが「全て」だった場合
				$checkGroup.find('input').prop('checked', $this.prop('checked'));

			} else {

				var $allCheckbox = $this.parents('ul').find('input:checkbox[value="all"]');

				// 同カテゴリの「全て」がチェックされていた場合は「全て」のチェックを外す
				if($allCheckbox.prop('checked') == true) {
					$allCheckbox.prop('checked', false);
				} else {

					// 全ての項目がチェックされた場合は、「全て」にチェックをする
					if($checkGroup.find('input:not([value="all"])').length == $checkGroup.find('input:not([value="all"]):checked').length) $allCheckbox.prop('checked', true);
				}

			}

		},

		/**
		 * 絞込み条件の処理
		 */
		checkSearchRefine: function() {

			var catArray = [];
			var $refinePanel = $('.refinePanel');

			var errorText = [];

			// APIデータをオリジナルに戻す
			fn.global.apiDataArray = fn.global.apiDataArrayOrg;

			// 絞込み条件一覧を生成
			var checkedList = [];

			// 全てのcheckboxをチェックするループ処理
			$refinePanel.find('.categoryList').each(function() {

				var $this = $(this);

				// グループ内にひとつでもチェックされていれば処理を実行
				if(!!$this.find('input:checked').length) {

					checkedList.push('<dl class="refineNowList">');
					checkedList.push('<dt>' + $this.find('dt').text() + '</dt>');

					// カテゴリ内の「全て」にチェックが入っている場合は処理を行わない
					if($this.find('input:checkbox[value="all"]').prop('checked') == false) {

						// 絞込みカテゴリを取得
						var refineTitle = $this.attr('data-refine');

						// カテゴリ内の「全て」以外のcheckboxをチェックするループ処理
						var checkedArray = [];
						checkedList.push('<dd>');
						checkedList.push('<ul>');
						$this.find('input:checkbox[value!="all"]').each(function() {

							// チェックされているもののみ格納する
							var $checkbox = $(this);
							if($checkbox.prop('checked') == true) {
								checkedArray.push($checkbox.val());
								checkedList.push('<li>' + $checkbox.parent('label').text() + '</li>');
							}
						});
						checkedList.push('</ul>');
						checkedList.push('</dd>');

						/** APIデータを絞り込む */
						fn.api.doApiGrep(refineTitle, checkedArray);
					} else {
						checkedList.push('<dd>全て</dd>');
					}
					checkedList.push('</dl>');

				} else {

					// グループ内にひとつもチェックされている項目がなければエラーメッセージを生成
					errorText.push('<p class="errerMsg">「' + $this.find('dt').text() + '」を選択してください</p>');
				}

			});

			if(errorText.length == 0) {

				/**
				 * Loading画像表示後の処理
				 */
				var afterFunction = function() {

					// 絞込み条件をたたむ
					if($('#btnRefine').hasClass('acdOpened')) $('#btnRefine').click();

					// 絞込み条件一覧を差し替え
					$('.refineInfo > dd').find('dl').remove();
					$('.refineInfo > dd').append(checkedList.join(''));

					/** 一覧を再表示 */
					list.ui.setList();
				}

				/** Loading画像を表示 */
				fn.ui.viewLoadingImage($('.playerList'), afterFunction);

			} else {

				// 既にエラーメッセージがあれば削除
				var $errerMsg = $('.errerMsg');
				if(!!$errerMsg.length) $errerMsg.remove();

				// thickboxにエラーメッセージをセットして表示
				$('.thickboxBody').append(errorText.join('')).promise().done(function() {;

					/** thickbox処理 */
					fn.ui.thickbox();
				});

			}

		}

	};


/*--------------------------------------------------------------------
 コンテンツ情報表示処理関数
----------------------------------------------------------------------*/

	list.ui = {

		/**
		 * コンテンツ情報表示のコールバック処理
		 * param@ data: 取得したJSONデータ
		 */
		apiContents: function(data) {

			// APIデータをグローバル変数に格納
			fn.global.apiDataArray = data.profileData;
			fn.global.apiDataArrayOrg = data.profileData;

			/** 一覧を表示 */
			list.ui.setList();

		},

		/**
		 * 一覧を表示
		 * param@ pageNum: ページ番号
		 */
		setList: function(pageNum) {

			/** APIデータを表示チームの選手のみに絞り込む */
			if(fn.param.team != 'all') fn.api.doApiGrep('teamId', fn.param.team);

			// ページ番号を数値に変換
			pageNum = (pageNum == undefined || pageNum == 'undefined') ? 1 : Number(pageNum);

			// リスト開始アイテム番号を算出
			var startItemNum = (pageNum == 1) ? 1 : (pageNum * fn.global.VIEW_LIST_NUM) - (fn.global.VIEW_LIST_NUM-1);

			// 初期処理時のみ各データを変数に格納
			if(pageNum == 1) {

				/** APIデータをソート */
				fn.api.doApiSort(fn.param.sortKeyword, 'backNoId', fn.param.sortOrder);

				// 選手データの総数
				fn.global.PLAYER_ALL_NUM = fn.global.apiDataArray.length;
			}

			// データを出力HTMLにセット
			var tempPlayerList = [];

			tempPlayerList.push('					<div class="playerListArea">');
			tempPlayerList.push('						<ul class="playerList">');

			// 一覧を生成するループ処理
			for(var i = startItemNum; i < (startItemNum + fn.global.VIEW_LIST_NUM); i++) {

				// 選手総数を超えた場合は処理を行わない
				if(i <= fn.global.PLAYER_ALL_NUM) {

					var apiData = fn.global.apiDataArray[i-1];

					tempPlayerList.push('							<li data-id="' + apiData.id + '" data-team="' + apiData.teamId + '" data-playerCat="' + apiData.playerCat + '">');
					tempPlayerList.push('								<h2>' + apiData.backNo + '. ' + apiData.name + '<span>' + apiData.ruby + '<span></h2>');
					tempPlayerList.push('								<div class="playerList-thumb">');

					// サムネイル画像がなければNoPhoto画像を表示
					if(!(apiData.thumbImage).length) {
						tempPlayerList.push('									<figure class="profImg"><img src="' + fn.global.THUMB_NOIMG_PATH + '" alt="' + apiData.name + '" /></figure>');
					} else {
						tempPlayerList.push('									<figure class="profImg"><img src="' + apiData.thumbImage + '" alt="' + apiData.name + '" /></figure>');
					}

					tempPlayerList.push('								</div>');
					tempPlayerList.push('								<div class="playerList-data">');

					tempPlayerList.push('									<ul class="profData">');

					// 投手か野手でポジション表記を出し分け
					if(apiData.playerCats !== 'pitcher') {

						// 野手の場合、ポジションが複数あった場合は出し分け
						var positoinLen = apiData.positions.length;

						tempPlayerList.push('									<li>');
						$(apiData.positions).each(function(i) {

							// 特定の文字が含まれていた場合は削除
							var positionText = (this.position.indexOf('◎') > -1 || this.position.indexOf('○') > -1) ? this.position.slice(0, -1) : this.position;

							if(i == 0 && positoinLen > 1) {
								tempPlayerList.push(positionText + '<span>');
							} else if(i == positoinLen -1 && positoinLen > 1) {
								tempPlayerList.push(positionText + '</span>');
							} else {
								tempPlayerList.push(positionText);
							}
							i++;
						});

						tempPlayerList.push('									</li>');

					} else {

						// 特定の文字が含まれていた場合は削除
						var positionTypeText = (apiData.positionType.indexOf('◎') > -1 || apiData.positionType.indexOf('○') > -1) ? apiData.positionType.slice(0, -1) : apiData.positionType;

						tempPlayerList.push('									<li>' + positionTypeText + '</li>');
					}

					tempPlayerList.push('										<li>' + apiData.teamName + '</li>');
					tempPlayerList.push('										<li>' + apiData.handedness + '</li>');
					tempPlayerList.push('										<li>' + fn.conv.timeFormatString(apiData.birthday) + '生</li>');
					tempPlayerList.push('										<li>' + apiData.length + '年目</li>');
					tempPlayerList.push('									</ul>');

					tempPlayerList.push('									<ul class="paramData">');

					// 投手か野手で表示能力を出し分け
					if(apiData.playerCats !== 'pitcher') {

						// 野手能力
						tempPlayerList.push('										<li class="iconParam' + apiData.paramBallistic + '">弾道</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramMeet, 'learge') + '">ミートカーソル</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramPower, 'learge') + '">打撃パワー</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramRun, 'learge') + '">走力</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramThrow, 'learge') + '">肩力</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramFialding, 'learge') + '">守備力</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramCatching, 'learge') + '">捕球</li>');
					} else {

						// 投手能力
						tempPlayerList.push('										<li><span>' + apiData.paramSpeed + '</span> km/h</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramControl, 'learge') + '">コントロール</li>');
						tempPlayerList.push('										<li class="iconParam' + fn.conv.doStatusTypeVal(apiData.paramStamina, 'learge') + '">スタミナ</li>');
					}

					tempPlayerList.push('									</ul>');
					tempPlayerList.push('								</div>');
					tempPlayerList.push('							</li>');
				}
			}

			tempPlayerList.push('						</ul>');
			tempPlayerList.push('					</div>');

			// 一覧が既にある場合は削除
			if(!!$('.playerListArea').length) $('.playerListArea').remove();

			// ページテキストを差し替え
			var viewListLastNum = startItemNum + fn.global.VIEW_LIST_NUM -1;
			if(viewListLastNum > fn.global.apiDataArray.length) {
				viewListLastNum = fn.global.apiDataArray.length;
			}

			// 全表示件数
			var allListNum = fn.global.apiDataArray.length;

			var listNumberText = (allListNum == 0) ? 0 : startItemNum + ' - ' + viewListLastNum;
			if(allListNum == 0) tempPlayerList.push('<p class="noSearchResult">検索条件に一致したデータはありませんでした</p>');

			$('.listNumber').text(listNumberText + '件（全' + fn.conv.doNumberDelimite(allListNum) + '件中）');

			// ソート中のソートボタンにアクティブクラスを付与
			$('.sortBtn > [data-sort="' + fn.param.sortKeyword + '"]').addClass('active');

			// セットしたHTMLを出力
			$('#playerList').append(tempPlayerList.join('')).promise().done(function() {

				/** ページャーを表示 */
				if(allListNum > 0) list.ui.setPager(pageNum);

				/** 画像が404だった場合に代替画像に差し替える */
				fn.conv.imgErrorSubstitute($('.playerList > li .profImg'), fn.global.THUMB_NOIMG_PATH);

				// コンテンツナビのhref属性値を親のliにカスタム属性値として追加
				var $contentsNav = $('#contentsNav');
				$contentsNav.find('dd').each(function() {

					/** アンカー値から#を除いてカスタム属性値として付与 */
					var $this = $(this);
					$this.attr('data-team', $this.find('a').attr('href').slice(1));
				});

				// 表示中のコンテンツナビにカレントクラスを付与
				$contentsNav.find('[data-team="' + fn.param.team + '"]').addClass('current');

				// コンテンツナビクリック時の処理
				$('#contentsNav a').off('click');
				$('#contentsNav a').on('click', function() {
					var $this = $(this);

					/** グローバル変数を変更 */
					list.asset.setParamExtend($this.parent('dd').attr('data-team'), undefined, undefined);

					/** パラメータを付与してリロード */
					location.href = fn.api.addUrlParam();
					return false;
				});

				// 絞込みボタンクリック時の処理
				$('.btnListRefine').off('click');
				$('.btnListRefine').on('click', function() {
					list.asset.checkSearchRefine();
				});

				// 一覧クリック時の処理
				$('.playerList > li').on('click', function() {

					var $this = $(this);

					/** グローバル変数を変更 */
					fn.api.setProfileParam($this.attr('data-id'), $this.attr('data-team'), $this.attr('data-playerCat'));

					/** パラメータを付与して詳細へ遷移 */
					location.href = fn.api.addUrlParam('profile.html');
				});

				// ページャークリック時の処理
				$('.pager').find('li, p').on('click', function() {

					// カレントまたは無効クラスがなければ、一覧表示を実行してページトップにスムーススクロール
					var $this = $(this);
					if($this.hasClass('current') || $this.hasClass('disabled')) {
						return false;
					} else {
						list.ui.setList($(this).attr('data-page'));
						fn.ui.smoothScroll('#page');
					}
				});

				// ソートボタンクリック時の処理
				$('.sortBtn > [data-sort]').off('click');
				$('.sortBtn > [data-sort]').on('click', function() {

					var $this = $(this);

					// ソートボタンのアクティブクラスを全て削除
					$('.sortBtn li').removeClass('active');

					// グローバル変数を変更
					list.asset.setParamExtend(undefined, $this.attr('data-sort'), $this.attr('data-order'));

					/** パラメータを付与して詳細へ遷移 */
					location.href = fn.api.addUrlParam();

				});

			});

		},

		/**
		 * ページャーを表示
		 * param@ num: 一覧の表示中のページ番号
		 */
		setPager: function(num) {

			var viewIndex = Number(num);

			var pagerCnt = 5;	// ページャーの表示数
			var pagerLastNum = Math.ceil(fn.global.PLAYER_ALL_NUM/fn.global.VIEW_LIST_NUM);	// 最後のページ番号

			var startIndex;				// 表示時のページャー開始番号
			var startIndexFirst = 1;	// 最初表示時のページャー開始番号

			// 最後表示時のページャー開始番号を算出
			var startIndexLast = (pagerLastNum - pagerCnt < 0) ? 1 : pagerLastNum - pagerCnt + 1;

			// ページャー表示数の半分を算出
			var harfPageCnt = Math.floor(pagerCnt/2);

			// ページャーの表示開始番号を設定
			if(viewIndex > harfPageCnt && viewIndex < (startIndexLast + harfPageCnt)) {

				// 表示するページ番号を中央にページャーを表示する
				startIndex = viewIndex - harfPageCnt;
	 		} else if(viewIndex <= harfPageCnt) {

				// 表示するページ番号が1に近い場合は、ページャーを1から表示を開始する
				startIndex = startIndexFirst;
			} else if(viewIndex > (startIndexLast - harfPageCnt)) {

				// 表示するページ番号が最後のページ番号に近い場合は、最後のページ番号を含めたページャを表示する
				startIndex = startIndexLast;
			}

			// ページャのHTMLを生成
			var tempPager = [];

			var prevText = (fn.ua.isPc) ? '&lt; 前へ' : '&lt;';
			var nextText = (fn.ua.isPc) ? '次へ &gt;' : '&gt;';

			tempPager.push('<div class="pager">');
			if(fn.ua.isPc) tempPager.push('	<p class="btnBeforeStart" data-page="' + startIndexFirst + '">&lt;&lt; 最初へ</p>');
			tempPager.push('	<p class="btnBeforePrev" data-page="' + (viewIndex-1) + '">' + prevText + '</p>');
			tempPager.push('	<ol>');

			// ページャーを表示する数だけループ処理で生成
			for(var i = startIndex; i < (startIndex + pagerCnt); i++) {

				// ページャー表示数を超えた場合は生成しない
				if(i<=pagerLastNum) {
					tempPager.push('		<li data-page="' + i + '">' + i + '</li>');
				}
			}

			tempPager.push('	</ol>');
			tempPager.push('	<p class="btnAfterNext" data-page="' + (viewIndex + 1) + '">' + nextText + '</p>');
			if(fn.ua.isPc) tempPager.push('	<p class="btnAfterLast" data-page="' + pagerLastNum + '">最後へ &gt;&gt;</p>');
			tempPager.push('</div>');

			// 既にページャーがある場合は削除
			if(!!$('.pager').length) $('.pager').remove();

			// 生成したHTMLを出力
			$('#playerList').append(tempPager.join('')).promise().done(function() {

				var $pager = $('.pager');							// ページャー要素
				var $pagerFirstBtn = $pager.find('li:first-child');	// ページャー先頭の要素
				var $pagerLastBtn = $pager.find('li:last-child');	// ページャー最後の要素

				var CLASS_CURRENT = 'current';		// カレントクラス名
				var CLASS_DISABLED = 'disabled';	// 無効クラス名

				// 表示中ページ番号にカレントクラスを付与
				$pager.find('li[data-page="' + viewIndex + '"]').addClass(CLASS_CURRENT);

				// 前へ、最初へボタンの無効化処理
				if($pagerFirstBtn.attr('data-page') == 1) {

					// ページャーの先頭番号が1であれば、先頭ページ表示ボタンに無効クラスを付与
					$('.btnBeforeStart').addClass(CLASS_DISABLED);

					// ページャーの先頭番号にカレントクラスがあれば、前へボタンに無効クラスを付与
					if($pagerFirstBtn.hasClass(CLASS_CURRENT)) $('.btnBeforePrev').addClass(CLASS_DISABLED);
				}

				// 次へ、最後へボタンの無効化処理
				if($pagerLastBtn.attr('data-page') == pagerLastNum) {

					// ページャーの最後の番号が最終ページ番号と同じであれば、最後ページ表示ボタンに無効クラスを付与
					$('.btnAfterLast').addClass(CLASS_DISABLED);

					// ページャーの最後の番号にカレントクラスがあれば、次へボタンに無効クラスを付与
					if($pagerLastBtn.hasClass(CLASS_CURRENT)) $('.btnAfterNext').addClass(CLASS_DISABLED);
				}

			});

		}

	};


/*--------------------------------------------------------------------
 初期処理
----------------------------------------------------------------------*/

	/**
	 * 実行処理
	 */
	var listInit = function() {

		/** APIを取得してコンテンツ情報を表示 */
		var settinglistData = {
			url: fn.global.PLAYER_API_URL,
			callback: list.ui.apiContents,
			data: {}
		};
		fn.api.doCallApi(settinglistData);

		/** 絞込み条件「全て」のチェック状態による処理 */
		$('.categoryList input:checkbox[value="all"]').each(function() {
			list.asset.checkboxGroupCheck($(this));
		});

		/** チェックボックスをチェック時の処理 */
		$('.categoryList label').on('click', function() {
			list.asset.checkboxGroupCheck($(this).find('input'));
		});

		// スマホの場合はソートボタンの「順」を消す
		if(fn.ua.isiPhone) {
			var $sortList = $('.sortBtn > li');
			$sortList.each(function() {
				var $this = $(this);
				$this.text($this.text().slice(0, -1));
			});
		}

	};

	/** 初期処理 */
	listInit();

});
