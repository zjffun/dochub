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
    'gpte': 'node_modules/google-page-translation-editor/dist/gpte',
    'tool': 'js/tool',
    'index': 'js/index',
    'user-login': 'js/user/login',
    'user-profile': 'js/user/profile',
    'doc-new_project': 'js/doc/new_project',
    'doc-init_project': 'js/doc/init_project',
    'doc-clearup': 'dist/js/doc/clearup',
    'doc-revise': 'dist/js/doc/revise',
    'doc-translate': 'dist/js/doc/translate',
  },
});


