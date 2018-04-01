/*global require, BASE_URL, SITE_URL*/
require.config({
  //禁止缓存（调试时用，发布版中应该注释掉）
  urlArgs: "bust=" +  (new Date()).getTime(),
  baseUrl: BASE_URL+'views',
  paths: {
    'jquery': 'node_modules/jquery/dist/jquery',
    'bootstrap': 'node_modules/bootstrap/dist/js/bootstrap.bundle',
    'vue': 'node_modules/vue/dist/vue',
    'jquery-tageditor': 'node_modules/jquery-tageditor/jquery.tag-editor',
    'urijs': 'node_modules/urijs/src',
    'PE': 'node_modules/@1010543618/page-editor/dist/pageeditor',
    'tool': 'js/tool',
    'index': 'js/index',
    'user-login': 'js/user/login',
    'user-profile': 'js/user/profile',
    'doc-init': 'js/doc/init',
    'doc-clearup': 'dist/js/doc/clearup',
    'doc-revise': 'dist/js/doc/revise',
    'doc-translate': 'dist/js/doc/translate',
  },
});


