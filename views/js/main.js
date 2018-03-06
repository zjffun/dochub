/*global require, BASE_URL, SITE_URL*/
require.config({
  //禁止缓存（调试时用，发布版中应该注释掉）
  urlArgs: "bust=" +  (new Date()).getTime(),
  baseUrl: BASE_URL+'views',
  paths: {
    'jquery': 'https://cdn.bootcss.com/jquery/3.3.1/jquery',
    'bootstrap': 'https://cdn.bootcss.com/bootstrap/4.0.0/js/bootstrap.bundle',
    'vue': 'https://cdn.bootcss.com/vue/2.5.13/vue',
    'tag-editor': 'https://cdn.bootcss.com/tag-editor/1.0.20/jquery.tag-editor',
    'gpte': 'node_modules/google-page-translation-editor/dist/gpte',
    'tool': 'js/tool',
    'index': 'js/index',
    'user-login': 'js/user/login',
    'user-profile': 'js/user/profile',
    'doc-new_project': 'js/doc/new_project',
    'doc-clearup': 'dist/js/doc/clearup',
    'doc-revise': 'dist/js/doc/revise',
    'doc-translate': 'dist/js/doc/translate',
  },
});


