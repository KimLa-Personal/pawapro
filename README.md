# パワプロ選手データベース
APIからデータを取得して表示するjQuery練習用の課題。  
自身もパワプロの選手データの管理を10年以上模索していたため、成果物を活用する目的で作成中。  
[http://fe.lc-design.jp/sample/kimura/](http://fe.lc-design.jp/sample/kimura/)

## 機能
* 各選手データをAPIとして読み込んで表示
* 見たい選手の情報まで最小限のストレスで遷移
  - 絞込み
  - ソート
* レスポンシブ対応

## 残件
* 各ページのUIを精査
* 選手詳細ページから一覧へのリンク
* 選手詳細ページでのチーム切り替え
* 選手詳細ページの一部画像をretina対応
* トップ、チーム、データページの作成（WFから作った方がいい？

## 検討
* UI
  - チームによる色の出しわけをやめて統一させるか
  - スマホでの絞込み機能をthickboxにするか
* JS
  - API取得時のタイミング（history.back対策として配列格納をやめて都度読み込みの方がいい？
  - UAによる出しわけをやめて完全にレスポンシブ対応にするか