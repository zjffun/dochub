/*global require, BASE_URL, SITE_URL*/
require.config({
  //禁止缓存（调试时用，发布版中应该注释掉）
  urlArgs: "bust=" +  (new Date()).getTime(),
  baseUrl: BASE_URL+'views',
  paths: {
    'jquery': 'https://cdn.bootcss.com/jquery/3.3.1/jquery',
    'bootstrap': 'https://cdn.bootcss.com/bootstrap/4.0.0/js/bootstrap.bundle',
    'vue': 'https://cdn.bootcss.com/vue/2.5.13/vue',
    'store': 'https://cdn.bootcss.com/store.js/1.3.20/store',
    'tool': 'js/tool',
    'index': 'js/index',
    'user-login': 'js/user/login',
  },
  shim: {
    'store': {exports: 'store'},
    'popper.js': {exports: 'popper'}
  }
});
// console.log(require('popper.js'));
require(['vue', 'store', 'jquery', 'bootstrap'], function(Vue, store, $){
  var user = store.get('user');
  new Vue({
    // element to mount to
    el: '#v-dh-nav',
    // initial data
    data: {
      user: user,
    },
    methods: {
      logout: function(){
        store.remove('user');
        location.href = SITE_URL+'/user/logout';
      }
    }
  })
})

