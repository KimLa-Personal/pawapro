/**
 * タスク設定ファイル
 */
module.exports = {
    // 出力先ディレクトリ
    dist: 'dist/%type%/',
    // gulpコマンドでデフォルトで監視するディレクトリ(assets/*/)
    defaultPath: '',
    // サーバー設定
    server: {
      ghostMode: {
        clicks: false,
        location: false,
        forms: false,
        scroll: false
      }
    },
    // パス設定
    path: {
      html: {
        src: 'dist/%type%/**/*.html'
      },
      style: {
        src: [
          'assets/%type%/style/**/*.styl',
          '!assets/%type%/style/_*/**/*.styl'
        ],
        watch: 'assets/%type%/**/*.styl',
        dest: 'dist/%type%'
      },
      ejs: {
        src: [
          'assets/%type%/templates/**/*.ejs',
          '!assets/%type%/templates/_*/**/*.ejs'
        ],
        watch: ['assets/%type%/templates/**/*.ejs'],
        dest: 'dist/%type%'
      },
      js: {
        src: 'assets/%type%/script/**/*.js',
        watch: 'assets/%type%/**/*.js',
        dest: 'dist/%type%'
      },
      test: {
        src: [
          'node_modules/jquery/dist/jquery.js',
          'dist/%type%/js/*.js',
          'node_modules/power-assert/build/power-assert.js',
          'node_modules/sinon/pkg/sinon.js',
          'assets/%type%/test/**/*.js'
        ]
      },
      copy: [
        {
          from: 'assets/%type%/lib/**/*',
          to: 'dist/%type%'
        },
        {
          from: 'assets/%type%/img/**/*',
          to: 'dist/%type%'
        },
        {
          from: 'assets/%type%/other/**/*',
          to: 'dist/%type%'
        },
        {
          from: 'assets/%type%/**.html',
          to: 'dist/%type%'
        }
      ]
    }
};
