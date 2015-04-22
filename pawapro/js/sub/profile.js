/* ===================================================================

 * profile.js - プロフィールページ表示処理
 *
 * jQuery 2.1.1

======================================================================*/

$(function() {

/*--------------------------------------------------------------------
 プロフィールページ用変数
----------------------------------------------------------------------*/

	var prof = {
		asset: {},
		ui: {}
	};

	// 追加変数
	var setting = {

		abilityDataArray: [],
		ABILITY_API_URL: '../pawapro/data/ability.do',	// 超特殊能力APIファイルURL

		THUMB_NOIMG_PATH: fn.global.SERVER_PATH + 'img/player/img_noThumb.gif',		// サムネイル用NO PHOTO画像パス
		GALLERY_NOIMG_PATH: fn.global.SERVER_PATH + 'img/player/img_noGallery.jpg'	// ギャラリー用NO PHOTO画像パス

	};

	// グローバル変数に追加
	$.extend(fn.global, setting);


/*--------------------------------------------------------------------
 プロフィール用処理関数
----------------------------------------------------------------------*/

	prof.asset = {

		/**
		 * 超特殊能力APIを配列に格納
		 */
		apiAbilitySet: function(data) {

			fn.global.abilityDataArray = data;
		},

		/**
		 * サムネイルスライダー
		 */
		thumbSlider: function() {

			var $thumbList = $('.thumbNav-list').find('ul');
			var $thumb = $thumbList.find('li');

			var $sliderWidth = $('.slider').width();

			var thumbLen = $thumb.length;
			var thumbWidth = $thumb.outerWidth(true);

			// 一度に見れるサムネイルの数を算出
			var thumbViewLen;
			for(var i=0; i<thumbLen; i++) {
				if($sliderWidth < thumbWidth * i) {
					thumbViewLen = i-1;
					break;
				}
			}

			// 表示サムネイル要素
			var $targetThumb = $thumbList.find('[data-id="' + fn.param.name + '"]');

			// 表示サムネイルのインデックス値を取得
			var thumbStartIndex = (fn.param.name == undefined || fn.param.name == 'undefined') ? 0 : $targetThumb.index();

			// 表示サムネイルのインデックス値が表示数を超えていた場合
			var thumbListLeft = 0;
			if(thumbStartIndex >= thumbViewLen) {
				thumbListLeft = 0 - ((thumbStartIndex < thumbLen - thumbViewLen) ? thumbWidth * thumbStartIndex : thumbWidth * (thumbLen - thumbViewLen));
			}

			// 一覧の横幅を算出
			var thumbListWidth = (thumbWidth * thumbLen) - Number($thumb.css('marginRight').slice(0, -2));

			// CSSを追加
			$thumbList.css({ width: thumbListWidth, left: thumbListLeft });

			// 初期時は表示中のサムネイルにカレントクラスを付与
			if(!$thumbList.find('current').length) $thumbList.find('[data-id="' + fn.param.name + '"]').addClass('current');

			/**
			 * スライド処理
			 * param@ slideType: 'next' or 'back'
			 * param@ targetThumb: 表示させるサムネイルID
			 */
			prof.asset.thumbSlide = function(slideType, targetThumbId) {

				// クリック連打防止
				if($thumbList.is(':animated')) {

					// アニメーション中であれば処理を行わない
					return false;

				} else {

					// スライダーで移動する数
					var SLIDE_COUNT = 5;

					// 現在のleftの値を取得
					var offsetLeft = Number($thumbList.css('left').slice(0, -2));

					// 現在の先頭に表示されているサムネイルのインデックス値
					var thumbIndex = (offsetLeft -(offsetLeft *2)) / thumbWidth;

					// スライドさせる数
					var slideCount;
					if(targetThumbId == undefined || targetThumbId == 'undefined') {

						// 引数targetThumbIdに値がない場合は共通で指定されている数
						slideCount = SLIDE_COUNT;

					} else {

						// 引数targetThumbIdに値があれば、スライドする数を算出
						var targetThumbCount = $thumbList.find('[data-id="' + targetThumbId + '"]').index();
						slideCount = targetThumbCount - thumbIndex;

					}

					// 引数slideTypeに値がない場合は、スライドカウントが0より大きければnextに
					if(slideType == undefined || slideType == 'undefined') slideType = (slideCount >= 0) ? 'next' : 'back';

					// slideTypeがnextかbackで、移動する距離を算出
					var slideWidth;
					if(slideType == 'next') {

						slideWidth = 0 - (thumbWidth * slideCount);

					} else if (slideType == 'back') {

						// 現在の先頭に表示されているサムネイルのインデックス値がスライドカウントより少ない場合は移動カウントを調整
						if(thumbIndex < slideCount) slideCount = thumbIndex;
						slideWidth = thumbWidth * slideCount;
					} else {
						return false;
					}

					// 現在のカレントクラスを削除して、先頭に移動するサムネイルにカレントクラスを付与
					$thumbList.find('.current').removeClass('current');
					$thumbList.find('li[data-id="' + fn.param.name + '"]').addClass('current');

					// アニメーション処理
					$thumbList.animate({ left: offsetLeft + slideWidth });

					/** ボタン表示処理 */
					slideBtnView((offsetLeft + slideWidth), thumbListWidth);
				}

			};

			var $btnBack = $('.btnBack');
			var $btnNext = $('.btnNext');

			/**
			 * ボタン表示非表示処理
			 * param@ positionLeft: 表示位置left値
			 * param@ listWidth: 一覧の横幅
			 */
			var slideBtnView = function(positionLeft, listWidth) {

				// 次へボタン表示制限
				var limitNext = positionLeft <= (0 - listWidth) + $('.slider').width();

				// 前へボタン表示制限
				var limitBack = positionLeft >= 0;

				// 制限を超えたらボタン非表示
				if(($btnNext.css('display') == 'none') && !limitNext) {
					$btnNext.show();
				} else if(limitNext) {
					$btnNext.hide();
				}

				// 制限以内であればボタンを表示
				if(($btnBack.css('display') == 'none') && !limitBack) {
					$btnBack.show();
				} else if(limitBack) {
					$btnBack.hide();
				}

			};

			/** ボタン表示処理 */
			slideBtnView(thumbListLeft, thumbListWidth);

			// 前へボタンクリック処理
			$btnBack.on('click', function() {
				/** スライド処理 */
				prof.asset.thumbSlide('back');
			});

			// 次へボタンクリック処理
			$btnNext.on('click', function() {
				/** スライド処理 */
				prof.asset.thumbSlide('next');
			});

		},

		/**
		 * イメージギャラリー
		 */
		imageGallery: function($targetNode) {

			var $galleryArea = $targetNode;
			var $galleryImgList = $('.' + $galleryArea.find('ul').attr('class'));

			if($galleryImgList.find('li').length > 1) {

				var GALLERY_TARGET_ID = 'galleries';

				// ギャラリーそれぞれにIDを付与
				$galleryImgList.find('li').each(function(i) {
					$(this).attr('id', GALLERY_TARGET_ID + fn.conv.zeroPadding(i+1, 2));
				});

				// サムネイルを生成
				var galleryThumbList = [];
				galleryThumbList.push('<ul class="gallery-thumbList">');

				// ギャラリーの数だけサムネイルを生成するループ処理
				for(var i=0; i<$galleryImgList.children('li').length; i++) {

					var thisId = '#' + GALLERY_TARGET_ID + fn.conv.zeroPadding(i+1, 2);
					var imgSrcVal = $(thisId).find('img').attr('src');
					var imgAltVal = $(thisId).find('img').attr('alt');

					galleryThumbList.push('<li><a href="' + thisId + '">●</a></li>');
				}
				galleryThumbList.push('</ul>');

				// 生成したサムネイルを出力
				$galleryArea.append(galleryThumbList.join('')).promise().done(function() {

					var $galleryThumbList = $('.gallery-thumbList');
					var GALLERY_ACTIVE_CLASS = 'active';

					// 2枚目以降のギャラリーを非表示
					$galleryImgList.find('li:gt(0)').hide();

					// 1枚目のギャラリー及びサムネイルにアクティブクラスを付与
					$galleryImgList.find('li:first-child').addClass(GALLERY_ACTIVE_CLASS);
					$galleryThumbList.find('li:first-child').addClass(GALLERY_ACTIVE_CLASS);

					// サムネイルクリック処理
					$galleryThumbList.find('a').on('click', function() {

						var $this = $(this);

						// アニメーション中でなければ処理を実行
						if($galleryImgList.find('li').is(':animated') == false && $this.parent('li').hasClass(GALLERY_ACTIVE_CLASS) == false) {

							var fadeSpeed = 500;

							var $targetImage = $($this.attr('href'));

							// ギャラリーをアニメーションで切り替えてアクティブクラスの付与要素を変更
							$galleryImgList.find('.' + GALLERY_ACTIVE_CLASS).fadeOut(fadeSpeed).removeClass(GALLERY_ACTIVE_CLASS);
							$targetImage.fadeIn(fadeSpeed).addClass(GALLERY_ACTIVE_CLASS);

							// サムネイルのアクティブクラスの付与要素を切り替え
							$galleryThumbList.find('.' + GALLERY_ACTIVE_CLASS).removeClass(GALLERY_ACTIVE_CLASS);
							$this.parent('li').addClass(GALLERY_ACTIVE_CLASS);
						}

						return false;
					});

				});

			}

		},

		/**
		 * 検索フォーム入力中に、候補のみを絞り込んで表示する
		 * param@ $targetForm: 入力フォームセレクタ
		 * param@ $targetSelector: 絞り込む対象セレクタ
		 */
		searchNarrowDown: function($targetForm, $targetSelector) {

			// 入力テキストを取得
			var textVal = $targetForm.val();

			var regexp = new RegExp(/　/g);

			if(textVal.indexOf("　") > -1) textVal = textVal.replace(/　/g, " ");

			// 入力テキストが含まれているかを検索するループ処理
			$targetSelector.each(function() {

				var $this = $(this);

				var thisText = $this.text();						// 文字列そのまま
				var thisTextRuby = $this.find('span').text();		// 非表示にしているふりがな文字列そのまま
				var thisTextRubyUpper = thisTextRuby.toUpperCase(); // 非表示にしている英字文字列の大文字
				var thisTextRubyLower = thisTextRuby.toLowerCase(); // 非表示にしている英字文字列の小文字

				// 含まれていれば表示、含まれていなければ非表示
				var ifTextIndexOf = thisText.indexOf(textVal) > -1 || thisTextRuby.indexOf(textVal) > -1 || thisTextRubyUpper.indexOf(textVal) > -1 || thisTextRubyLower.indexOf(textVal) > -1;
				ifTextIndexOf ? $this.show() : $this.hide();

			});

		},

		/**
		 * ギャラリー画像の404をチェックし、不要画像及び要素を削除
		 */
		checkGalleryImage: function() {

			var $galleryImageList = $('.galleryArea');

			// 対象内の画像全てをチェックするループ処理
			$galleryImageList.find('img').each(function() {

				var $this = $(this);

				// もし404であれば要素を削除
				$this.error(function() {

					var $galleryThumbList = $('.gallery-thumbList');
					var targetId = '#' + $this.parents('li').attr('id');

					// もしギャラリーの最初の要素であれば処理を行わない
					if($galleryImageList.find('li' + targetId).index() != 0) {

						// 画像の親要素を削除
						$(targetId).remove();
						// 対象のサムネイルを削除
						$galleryThumbList.find('a[href="' + targetId + '"]').parents('li').remove();
					}

					// 画像が1枚しか残らなかった場合はサムネイルの親要素を削除
					if($('.gallery-imageList').find('li').length == 1) $galleryThumbList.remove();

				});
			});

			/** 残った404画像箇所に代替画像に差し替える */
			if(fn.ua.isPc) {
				fn.conv.imgErrorSubstitute($('.gallery-imageList').find('li'), fn.global.GALLERY_NOIMG_PATH);
			} else if(fn.ua.isiPhone) {
				fn.conv.imgErrorSubstitute($('.galleryArea').find('figure'), fn.global.THUMB_NOIMG_PATH);
			}
		},

		/**
		 * 文字列が長い場合は切り出す
		 * param@ str: 文字列
		 * param@ num: 最長表示文字数
		 */
		stringSlice: function(str, num) {

			// 文字数が最長表示文字数を超えた場合のみ処理を実行
			if(str.length > num) {

				if(str.indexOf('・') > -1) {

					// 「・」で区切られてた場合はその前を切り出す
					str = str.slice(0, str.indexOf('・'));
				} else if(str.indexOf(' ') > -1) {

					// 半角スペースで区切られてた場合はその後を切り出す
					str = str.slice(str.indexOf(' '));
				} else {

					// 「・」も半角スペースもない場合は先頭から最長表示文字数分切り出す
					str = str.slice(0, num);
				}
			}

			return str;
		},

		/**
		 * 超特殊能力と一致するかをチェック
		 * param@ str: 文字列
		 */
		checkSpecialAbility: function(str) {

			var result = false;

			// プラス能力をチェック
			var specialPlus = fn.global.abilityDataArray.plus;
			if(specialPlus != undefined) {
				for(var i=0; i<specialPlus.length; i++) {
					if(str == specialPlus[i]) result = 'plus';
				}
			}

			// マイナス能力をチェック
			var specialMinus = fn.global.abilityDataArray.minus;
			if(specialMinus != undefined) {
				for(var i=0; i<specialMinus.length; i++) {
					if(str == specialMinus[i]) result = 'minus';
				}
			}

			return result;
		},

		/**
		 * 特殊能力の値によってHTMLを出力
		 * param@ str: 能力名
		 * param@ num: 能力値
		 */
		setAbilityHtml: function(str, num) {

			var setHtml;
			var ADD_CLASS_NAME;

			if(num == '' || num > 3 || num < 3) {

				// 引数numが数字または空の場合
				if(str == '') {

					// 文字列が空の場合は空のHTMLを返す
					setHtml = '<li class="abilityDisabled"></li>';

				} else {

					// 数値にあわせてクラス名を変更してHTMLをセット
					if(num == '') {
						num = 3;
						ADD_CLASS_NAME = 'abilityNormal';
					} else if(num > 3) {
						ADD_CLASS_NAME = 'abilityPlus';
					} else if(num < 3) {
						ADD_CLASS_NAME = 'abilityMinus';
					}

					setHtml = '<li class="' + ADD_CLASS_NAME + '">' + str + '<span>' + num + '</span></li>';
				}

			} else {

				// 引数numが文字の場合は超特殊能力と一致するかをチェック
				ADD_CLASS_NAME = (prof.asset.checkSpecialAbility(num) == 'minus') ? 'abilitySpecialMinus' : 'abilitySpecialPlus';
				setHtml = '<li class="' + ADD_CLASS_NAME + '">' + num + '</span></li>';
			}

			return setHtml;
		},

		/**
		 * 特殊能力一覧HTMLを生成
		 * param@ str: 文字列
		 * param@ addClass: 付与するクラス名
		 */
		setAbilityList: function(str, addClass) {

			var setHtml = [];
			var strArray = str.split('、');

			for(var i=0; i<strArray.length; i++) {

				var CLASS_NAME = addClass;

				/** 超特殊能力と一致すればクラス名を変更 */
				var abilityType = prof.asset.checkSpecialAbility(strArray[i]);
				if(abilityType == 'plus') {
					CLASS_NAME = 'abilitySpecialPlus';
				} else if(abilityType == 'minus') {
					CLASS_NAME = 'abilitySpecialMinus';
				}

				setHtml.push('<li class="' + CLASS_NAME + '">' + strArray[i] + '</li>\n');
			}

			return setHtml.join('');
		}

	};


/*--------------------------------------------------------------------
 コンテンツ情報表示処理関数
----------------------------------------------------------------------*/

	prof.ui = {

		/**
		 * コンテンツ情報表示のコールバック処理
		 * param@ data: 取得したJSONデータ
		 */
		apiContents: function(data) {

			// APIデータをグローバル変数に格納
			fn.global.apiDataArray = data.profileData;
			fn.global.apiDataArrayOrg = data.profileData;

			/** APIデータを表示チームの選手のみに絞り込む */
			fn.api.doApiGrep('teamId', fn.param.team);

			/** APIデータをソート */
			fn.api.doApiSort('sortNum');

			/** APIデータをセットしてサムネイル一覧を生成 */
			if(fn.ua.isPc) prof.ui.setThumbList();

			/** APIデータをセットして選手詳細情報を生成 */
			prof.ui.setProfDetails();

			/** APIデータをセットして検索パネル情報を生成 */
			prof.ui.setSearchPanel();

		},

		/**
		 * APIデータをセットしてサムネイル一覧を生成
		 */
		setThumbList: function() {

			var tempThumbList = [];
			tempThumbList.push('<ul data-team="' + fn.param.team + '">');

			// APIデータを出力HTMLにセット
			$(fn.global.apiDataArray).each(function() {

				if(this.playerCat == fn.param.playerCat) {

					tempThumbList.push('	<li data-id="' + this.id + '" data-playerCat="' + this.playerCat + '">');
					tempThumbList.push('		<figure>');
					tempThumbList.push('			<figcaption>' + prof.asset.stringSlice(this.name, 7) + '</figcaption>');

					// サムネイル画像がなければNoPhoto画像を表示
					if(!(this.thumbImage).length) {
						tempThumbList.push('			<img src="' + fn.global.THUMB_NOIMG_PATH + '" alt="' + this.name + '" />');
					} else {
						tempThumbList.push('			<img src="' + this.thumbImage + '" alt="' + this.name + '" />');
					}
					tempThumbList.push('		</figure>');
					tempThumbList.push('	</li>');

				}

			});
			tempThumbList.push('</ul>');

			// セットしたHTMLを出力
			var $thumbList = $('.thumbNav-list');
			$thumbList.prepend(tempThumbList.join('')).promise().done(function() {

				// サムネイルタイトルにプレイヤーカテゴリを代入
				$('.thumbNav-title').text(fn.conv.doPlayerCatJapanese(fn.param.playerCat));

				/** 画像が404だった場合に代替画像に差し替える */
				fn.conv.imgErrorSubstitute($('.thumbNav-list li'), fn.global.THUMB_NOIMG_PATH);

				// グローバル変数の値と同じ属性のサムネイルがあるかをチェックしてグローバル変数の値を変更
	 			var $targetThumbLi = (!$thumbList.find('li[data-id="' + fn.param.name + '"]').length) ? $thumbList.find('li:first-child') : $thumbList.find('li[data-id="' + fn.param.name + '"]');
				fn.api.setProfileParam($targetThumbLi.attr('data-id'), undefined, $targetThumbLi.attr('data-playerCat'));

				/** サムネイルスライダー */
				prof.asset.thumbSlider();

				// サムネイルクリック処理
				$thumbList.find('li').off('click');
				$thumbList.find('li').on('click', function() {

					var $this = $(this);

					/** グローバル変数の値を変更 */
					fn.api.setProfileParam($this.attr('data-id'), undefined, $this.attr('data-playerCat'))

					/** URLにパラメータを付与してリダイレクト */
					location.href = fn.api.addUrlParam();

				});

			});

		},

		/**
		 * APIデータをセットして選手詳細情報を生成
		 */
		setProfDetails: function() {

			var tempProfDetails = [];
			tempProfDetails.push('<article id="profileArea">');
			tempProfDetails.push('	<p class="btnBackList"><a href="./">一覧</a></p>');

			// パラメータがallだった場合は、最初のデータを表示する
			if(fn.param.name == 'all') fn.param.name = fn.global.apiDataArray[0].id;

			// APIデータを出力HTMLにセット
			$(fn.global.apiDataArray).each(function() {

				if(this.id == fn.param.name) {

					tempProfDetails.push('	<p class="teamName">' + this.teamName + '</p>');
					tempProfDetails.push('	<h1>' + this.backNo + '．' + this.name + '<span>' + this.ruby + '</span></h1>');

					tempProfDetails.push('	<div class="profile-data">');
					tempProfDetails.push('		<div class="galleryArea">');

					// スマホ表示用のサムネイル画像を表示
					var thumbImagePath = (this.thumbImage == '') ? fn.global.GALLERY_NOIMG_PATH : this.thumbImage;
					tempProfDetails.push('			<figure><img src="' + thumbImagePath + '" alt="' + this.name + '" /></figure>');

					// PC表示用のギャラリー画像をあるだけ表示
					tempProfDetails.push('			<ul class="gallery-imageList">');

					var galleryImagePath;
					$(this.galleryImages).each(function(galleryCnt) {

						// 前の画像と違うパスであれば処理を進める
						if(galleryImagePath !== this.image) {

							// 画像が404、またはデータが空の場合はNO PHOTO画像
							galleryImagePath = (galleryImagePath == '') ? fn.global.GALLERY_NOIMG_PATH : this.image;

							// 画像変数がNO PHOTOでなかった場合(1枚目は除く)は画像を表示
							if((galleryImagePath !== fn.global.GALLERY_NOIMG_PATH) || (galleryCnt = 0)) {
								tempProfDetails.push('				<li><img src="' + galleryImagePath + '" width="280" height="210" alt="" /></li>');
							}
						}
					});

					tempProfDetails.push('			</ul>');
					tempProfDetails.push('		</div>');

					// プロフィール情報を出力
					tempProfDetails.push('		<dl>');
					tempProfDetails.push('			<dt>背ネーム</dt>');
					tempProfDetails.push('			<dd>' + this.backName + '</dd>');

					// チーム情報があれば表示
					if(this.groupName != '') {
						tempProfDetails.push('			<dt>所属</dt>');
						tempProfDetails.push('			<dd>' + this.groupName + '</dd>');
					}

					tempProfDetails.push('			<dt>誕生日</dt>');
					tempProfDetails.push('			<dd>' + fn.conv.timeFormatString(this.birthday) + '</dd>');
					tempProfDetails.push('			<dt>利き腕</dt>');
					tempProfDetails.push('			<dd>' + this.handedness + '</dd>');
					tempProfDetails.push('			<dt>ポジション</dt>');
					tempProfDetails.push('			<dd>');

					// サブポジションがあれば表記を出し分け
					var positoinLen = (this.positions).length;
					$(this.positions).each(function(i) {
	                
						if(i == 0 && positoinLen > 1) {
							tempProfDetails.push(this.position + ' （サブ/');
						} else if(i == positoinLen -1 && positoinLen > 1) {
							tempProfDetails.push(this.position + '）');
						} else {
							tempProfDetails.push(this.position);
						}
					});
					tempProfDetails.push('</dd>');

					// 投手か野手で表示フォームを出し分け
					tempProfDetails.push('			<dt>フォーム</dt>');
					var viewForm = (this.playerCats !== 'pitcher') ? this.battingForm : this.pitchingForm;
					tempProfDetails.push('			<dd>' + viewForm + '</dd>');

					tempProfDetails.push('			<dt>経歴</dt>');
					tempProfDetails.push('			<dd>');
					tempProfDetails.push('				<ul>');
					tempProfDetails.push('					<li>' + this.country + '</li>');
					tempProfDetails.push('					<li>' + this.career + '</li>');
					tempProfDetails.push('					<li>' + this.length + '年目</li>');
					tempProfDetails.push('				</ul>');
					tempProfDetails.push('			</dd>');
					tempProfDetails.push('			<dt>バット</dt>');
					tempProfDetails.push('			<dd>' + this.bat + '</dd>');
					tempProfDetails.push('			<dt>グラブ</dt>');
					tempProfDetails.push('			<dd>' + this.glove + '</dd>');
					tempProfDetails.push('			<dt>リストバンド</dt>');
					tempProfDetails.push('			<dd>');
					tempProfDetails.push('				<ul>');
					tempProfDetails.push('					<li>左/' + this.wristbandLeft + '</li>');
					tempProfDetails.push('					<li>右/' + this.wristbandRight + '</li>');
					tempProfDetails.push('				</ul>');
					tempProfDetails.push('			</dd>');
					tempProfDetails.push('		</dl>');
					tempProfDetails.push('	</div>');

					// 能力情報を出力(タブコンテンツ)
					tempProfDetails.push('	<div class="profile-param">');

					tempProfDetails.push('		<ul class="tabNav">');
					tempProfDetails.push('			<li><a href="#pitcher">投手能力</a></li>');
					tempProfDetails.push('			<li><a href="#fielder">野手能力</a></li>');
					tempProfDetails.push('			<li><a href="#other">その他</a></li>');
					tempProfDetails.push('		</ul>');

					tempProfDetails.push('		<section id="pitcher" class="tabContents">');
					tempProfDetails.push('			<h2>能力値</h2>');
					tempProfDetails.push('			<div class="paramBase">');
					tempProfDetails.push('				<dl class="paramData">');
					tempProfDetails.push('					<dt>適性</dt>');
					tempProfDetails.push('					<dd>' + this.positionType + '</dd>');
					tempProfDetails.push('					<dt>球速</dt>');
					tempProfDetails.push('					<dd>' + this.paramSpeed + ' km/h</dd>');
					tempProfDetails.push('					<dt>コントロール</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramControl, 'learge') + '">' + this.paramControl + '</dd>');
					tempProfDetails.push('					<dt>スタミナ</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramStamina, 'learge') + '">' + this.paramStamina + '</dd>');
					tempProfDetails.push('				</dl>');

					tempProfDetails.push('				<div class="paramBreakingBall">');

					// ストレート
					tempProfDetails.push('					<ul class="breakingTop">');
					tempProfDetails.push('						<li>ストレート</li>');
					$(this.breakingTop).each(function() {
						if(!!this.breakingName.length) tempProfDetails.push('						<li>' + this.breakingName + '</li>');
					});
					tempProfDetails.push('					</ul>');

					// サウスポーの場合は変化球は左右逆表示
					var ifHandednessLeft = this.handedness.indexOf('左投') > -1;
					var arrayBreakingLeft = ifHandednessLeft ? this.breakingRight : this.breakingLeft;
					var arrayBreakingLeftBottom = ifHandednessLeft ? this.breakingRightBottom : this.breakingLeftBottom;
					var arrayBreakingBottom = this.breakingBottom;
					var arrayBreakingRightBottom = ifHandednessLeft ? this.breakingLeftBottom : this.breakingRightBottom;
					var arrayBreakingRight = ifHandednessLeft ? this.breakingLeft : this.breakingRight;

					var breakingLevelClass;

					// 左変化球
					tempProfDetails.push('					<ul class="breakingLeft">');
					for(var i=0; i<arrayBreakingLeft.length; i++) {
						var obj = arrayBreakingLeft[i];
						breakingLevelClass = (!!obj.breakingName.length) ? 'level' + obj.breakingLevel : 'level0';
						tempProfDetails.push('						<li class="' + breakingLevelClass + '">' + obj.breakingName + '</li>');
					}
					tempProfDetails.push('					</ul>');

					// 左下変化球
					tempProfDetails.push('					<ul class="breakingLeftBottom">');
					for(var i=0; i<arrayBreakingLeftBottom.length; i++) {
						var obj = arrayBreakingLeftBottom[i];
						breakingLevelClass = (!!obj.breakingName.length) ? 'level' + obj.breakingLevel : 'level0';
						tempProfDetails.push('						<li class="' + breakingLevelClass + '">' + obj.breakingName + '</li>');
					}
					tempProfDetails.push('					</ul>');

					// 縦変化球
					tempProfDetails.push('					<ul class="breakingBottom">');
					for(var i=0; i<arrayBreakingBottom.length; i++) {
						var obj = arrayBreakingBottom[i];
						breakingLevelClass = (!!obj.breakingName.length) ? 'level' + obj.breakingLevel : 'level0';
						tempProfDetails.push('						<li class="' + breakingLevelClass + '">' + obj.breakingName + '</li>');
					}
					tempProfDetails.push('					</ul>');

					// 右下変化球
					tempProfDetails.push('					<ul class="breakingRightBottom">');
					for(var i=0; i<arrayBreakingRightBottom.length; i++) {
						var obj = arrayBreakingRightBottom[i];
						breakingLevelClass = (!!obj.breakingName.length) ? 'level' + obj.breakingLevel : 'level0';
						tempProfDetails.push('						<li class="' + breakingLevelClass + '">' + obj.breakingName + '</li>');
					}
					tempProfDetails.push('					</ul>');

					// 右変化球
					tempProfDetails.push('					<ul class="breakingRight">');
					for(var i=0; i<arrayBreakingRight.length; i++) {
						var obj = arrayBreakingRight[i];
						breakingLevelClass = (!!obj.breakingName.length) ? 'level' + obj.breakingLevel : 'level0';
						tempProfDetails.push('						<li class="' + breakingLevelClass + '">' + obj.breakingName + '</li>');
					}
					tempProfDetails.push('					</ul>');

					tempProfDetails.push('				</div>');
					tempProfDetails.push('			</div>');

					tempProfDetails.push('			<h2>特殊能力</h2>');
					tempProfDetails.push('			<ul class="abilityData">');

					/** 特殊能力の値によってHTMLを出力 */
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('ピンチ', this.pAbilityPinch));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('対左打者', this.pAbilityLeftBatter));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('対ランナー', this.pAbilityPressure));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('ケガしにくさ', this.cAbilityTough));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('打たれ強さ', this.pAbilityMental));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('クイック', this.pAbilityQuick));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('回 復', this.pAbilityRecovery));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('安定度', this.cAbilityStability));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('ノ ビ', this.pAbilityNovi));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('キ レ', this.pAbilityKire));
					tempProfDetails.push('			</ul>');

					/** 投手の場合、特殊能力一覧HTMLを生成 */
					if(this.playerCats == 'pitcher') {

						// 特殊能力一覧を生成
						if(this.sAbilityPlus != '' || this.sAbilityMinus != '') {
							tempProfDetails.push('			<ul class="abilityList">');
							if(this.sAbilityPlus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.sAbilityPlus, 'abilityPlus'));
							if(this.sAbilityMinus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.sAbilityMinus, 'abilityMinus'));
							tempProfDetails.push('			</ul>');
						}

						// 共通能力一覧を生成
						if(this.oAbilityPlus != '' || this.oAbilityMinus != '') {
							tempProfDetails.push('			<ul class="abilityList">');
							if(this.oAbilityPlus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.oAbilityPlus, 'abilityAppoint'));
							if(this.oAbilityMinus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.oAbilityMinus, 'abilityMinus'));
							tempProfDetails.push('			</ul>');
						}
					}

					tempProfDetails.push('		</section>');

					tempProfDetails.push('		<section id="fielder" class="tabContents">');
					tempProfDetails.push('			<h2>能力値</h2>');
					tempProfDetails.push('			<div class="paramBase">');
					tempProfDetails.push('				<dl class="paramData">');
					tempProfDetails.push('					<dt>弾道</dt>');
					tempProfDetails.push('					<dd class="iconParam' + this.paramBallistic + '">' + this.paramBallistic + '</dd>');
					tempProfDetails.push('					<dt>ミートカーソル</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramMeet, 'learge') + '">' + this.paramMeet + '</dd>');
					tempProfDetails.push('					<dt>打撃パワー</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramPower, 'learge') + '">' + this.paramPower + '</dd>');
					tempProfDetails.push('					<dt>走力</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramRun, 'learge') + '">' + this.paramRun + '</dd>');
					tempProfDetails.push('					<dt>肩力</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramThrow, 'learge') + '">' + this.paramThrow + '</dd>');
					tempProfDetails.push('					<dt>守備力</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramFialding, 'learge') + '">' + this.paramFialding + '</dd>');
					tempProfDetails.push('					<dt>捕球</dt>');
					tempProfDetails.push('					<dd class="iconParam' + fn.conv.doStatusTypeVal(this.paramCatching, 'learge') + '">' + this.paramCatching + '</dd>');
					tempProfDetails.push('				</dl>');
					tempProfDetails.push('			</div>');
					tempProfDetails.push('			<h2>特殊能力</h2>');

					tempProfDetails.push('			<ul class="abilityData">');

					/** 特殊能力の値によってHTMLを出力 */
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('チャンス', this.iAbilityChance));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('対左投手', this.iAbilitySouthpaw));

					var ifAbilityCatcher = (this.playerCats == 'fielder' && this.positonNum.indexOf('2') > -1) ? 'キャッチャー' : '';
					tempProfDetails.push('				' + prof.asset.setAbilityHtml(ifAbilityCatcher, this.iAbilityCatcher));

					tempProfDetails.push('				' + prof.asset.setAbilityHtml('ケガしにくさ', this.cAbilityTough));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('盗 塁', this.iAbilitySteal));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('走 塁', this.iAbilityRunning));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('送 球', this.iAbilityThrowing));
					tempProfDetails.push('				' + prof.asset.setAbilityHtml('安定度', this.cAbilityStability));
					tempProfDetails.push('			</ul>');

					/** 野手の場合、特殊能力一覧HTMLを生成 */
					if(this.playerCats == 'fielder') {

						// 特殊能力一覧を生成
						if(this.sAbilityPlus != '' || this.sAbilityMinus != '') {
							tempProfDetails.push('			<ul class="abilityList">');
							if(this.sAbilityPlus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.sAbilityPlus, 'abilityPlus'));
							if(this.sAbilityMinus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.sAbilityMinus, 'abilityMinus'));
							tempProfDetails.push('			</ul>');
						}

						// 共通能力一覧を生成
						if(this.oAbilityPlus != '' || this.oAbilityMinus != '') {
							tempProfDetails.push('			<ul class="abilityList">');
							if(this.oAbilityPlus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.oAbilityPlus, 'abilityAppoint'));
							if(this.oAbilityMinus != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.oAbilityMinus, 'abilityMinus'));
							tempProfDetails.push('			</ul>');
						}
					}

					tempProfDetails.push('		</section>');

					tempProfDetails.push('		<section id="other" class="tabContents">');
					tempProfDetails.push('			<h2>スタイル</h2>');

					// 成長タイプを生成
					tempProfDetails.push('			<dl class="paramData">');
					tempProfDetails.push('				<dt>成長型</dt>');
					tempProfDetails.push('				<dd>' + this.playerType + '</dd>');
					tempProfDetails.push('				<dt>成長時期</dt>');
					tempProfDetails.push('				<dd>' + this.growth + '</dd>');
					tempProfDetails.push('			</dl>');

					// その他能力一覧
					if(this.otherAppoint != '' || this.playStyle != '' || this.hideParam != '') {
						tempProfDetails.push('			<ul class="abilityList mb30">');

						// 起用法を生成
						if(this.otherAppoint != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.otherAppoint, 'abilityAppoint'));

						// プレイスタイルを生成
						if(this.playStyle != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.playStyle, 'abilityAppoint'));

						// 隠しパラメータを生成
						if(this.hideParam != '') tempProfDetails.push('				' + prof.asset.setAbilityList(this.hideParam, 'abilityAppoint'));

						tempProfDetails.push('			</ul>');
					}
					tempProfDetails.push('			<h2>成績</h2>');

					// 成績を生成
					tempProfDetails.push('			<dl class="resultData">');
					tempProfDetails.push('				<dt>打率</dt>');
					tempProfDetails.push('				<dd>' + this.resultBattingAverage + '</dd>');
					tempProfDetails.push('				<dt>本塁打</dt>');
					tempProfDetails.push('				<dd>' + this.resultHomeRuns + ' 本</dd>');
					tempProfDetails.push('				<dt>打点</dt>');
					tempProfDetails.push('				<dd>' + this.resultRunsBattedIn + ' 点</dd>');
					tempProfDetails.push('				<dt>防御率</dt>');
					tempProfDetails.push('				<dd>' + this.resultEarnedRunAverage + '</dd>');
					tempProfDetails.push('			</dl>');

					tempProfDetails.push('			<h2>概要</h2>');
					tempProfDetails.push('			<p class="playerDiscription">概要</p>');

					tempProfDetails.push('		</section>');
					tempProfDetails.push('	</div>');

					return false;
				}

			});
			tempProfDetails.push('</article>');

			// 既にコンテンツがある場合は削除
			if(!!$('article#profileArea').length) $('article#profileArea').remove();

			// セットしたHTMLを出力
			$('#contents').append(tempProfDetails.join('')).promise().done(function() {

				/** ギャラリー画像の404をチェックし、不要画像及び要素を削除 */
				prof.asset.checkGalleryImage();

				/** タブ連動コンテンツ */
				fn.ui.tabContents($('.tabNav'), $('.tabContents'));

				// イメージギャラリー
				prof.asset.imageGallery($('.galleryArea'));

				// コンテンツナビのhref属性値を親のliにカスタム属性値として追加
				var $contentsNav = $('#contentsNav');
				$contentsNav.find('dd').each(function() {

					/** アンカー値から#を除いてカスタム属性値として付与 */
					var $this = $(this);
					$this.attr('data-playerCat', $this.find('a').attr('href').slice(1));
				});

				// 表示中のコンテンツナビにカレントクラスを付与
				$contentsNav.find('[data-playerCat="' + fn.param.playerCat + '"]').addClass('current');

			});

		},

		/**
		 * APIデータをセットして検索パネルを生成
		 */
		setSearchPanel: function() {

			// 検索パネルを生成
			var tempSearchPanel = [];
			tempSearchPanel.push('		<dl id="searchList">');

			// APIデータを出力HTMLにセット
			var prevPlayerCat;
			$(fn.global.apiDataArray).each(function() {

				if(prevPlayerCat == undefined || prevPlayerCat != this.playerCat) {
					if(prevPlayerCat != this.playerCat) {
						tempSearchPanel.push('				</ul>');
						tempSearchPanel.push('			</dd>');
					}
					tempSearchPanel.push('			<dt data-playerCat="' + this.playerCat + '">' + fn.conv.doPlayerCatJapanese(this.playerCat) + '</dt>');
					tempSearchPanel.push('			<dd>');
					tempSearchPanel.push('				<ul class="nameList">');
				}

				tempSearchPanel.push('					<li data-id="' + this.id + '" data-playerCat="' + this.playerCat + '">' + this.name + '<span>' + this.ruby + '</span><span>' + this.backName + '<span></li>');
				prevPlayerCat = this.playerCat;
			});

			tempSearchPanel.push('				</ul>');
			tempSearchPanel.push('			</dd>');
			tempSearchPanel.push('		</dl>');

			// セットしたHTMLを出力
			$('.thickboxBody').append(tempSearchPanel.join('')).promise().done(function() {

				// スマホの場合はアコーディオン
				if(fn.ua.isiPhone) {
					var $searchList = $('#searchList');
					$searchList.children('dt').addClass('acdHead');
					$searchList.children('dd').addClass('acdBody');
					fn.ui.accordion();
				}

				// 名前アイコンクリック時の処理
				$('.nameList li').on('click', function() {

					/** グローバル変数を変更 */
					var $this = $(this);
					fn.api.setProfileParam($this.attr('data-id'), undefined, $this.attr('data-playerCat'));

					if(fn.ua.isPc) {

						// 検索パネルをアニメーション非表示後にリダイレクト
						$('#thickbox').fadeOut(300, function() {
							/** URLにパラメータを付与してリダイレクト */
							location.href = fn.api.addUrlParam();
						});

					} else if(fn.ua.isiPhone) {

						/** スマホはリダイレクトのみ */
						location.href = fn.api.addUrlParam();
					}
				});

			});

		}

	};


/*--------------------------------------------------------------------
 初期処理
----------------------------------------------------------------------*/

	/**
	 * 実行処理
	 */
	var profInit = function() {

		/** APIを取得してコンテンツ情報を表示 */
		var settingAbilityData = {
			url: fn.global.ABILITY_API_URL,
			callback: prof.asset.apiAbilitySet,
			data: {}
		};
		fn.api.doCallApi(settingAbilityData);

		/** APIを取得してコンテンツ情報を表示 */
		var settingContentsData = {
			url: fn.global.PLAYER_API_URL,
			callback: prof.ui.apiContents,
			data: {}
		};
		fn.api.doCallApi(settingContentsData);

		// コンテンツナビクリック時の処理
		$('#contentsNav a').off('click');
		$('#contentsNav a').on('click', function() {
			var $this = $(this);

			/** グローバル変数を変更 */
			fn.api.setProfileParam('all', $this.parent('dd').attr('data-team'), $this.parent('dd').attr('data-playerCat'));

			/** パラメータを付与してリロード */
			location.href = fn.api.addUrlParam();
			return false;
		});

		/** 検索ボタンクリック時に検索パネルを表示 */
		$('#btnSearch').on('click', function() {

			var $listSearch = $('#listSearch'); // フォーム要素
			var $searchList = $('#searchList');	// 一覧

			/**
			 * thickbox表示時の処理
			 */
			var openedFunction = function() {

				// 検索一覧の高さを固定
				$searchList.css('height', $searchList.height());

				// 表示時にフォームにフォーカスを当てておく
				$listSearch.focus();

				/** 検索フォーム入力中に、候補のみを絞り込んで表示する */
				$listSearch.on('keyup', function() {
					prof.asset.searchNarrowDown($(this), $searchList.find('li'));
				});

			}

			/**
			 * thickbox非表示時の処理
			 */
			var closedFunction = function() {

				// アニメーションで非表示後にフォームをクリア
				$listSearch.val('');
			}

			/** thickbox処理 */
			fn.ui.thickbox(openedFunction, closedFunction);
		});

	};

	/** 初期処理 */
	profInit();

});
