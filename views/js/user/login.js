/*global SITE_URL*/
require(['vue', 'store', 'jquery'], function(Vue, store, $){
  var email_reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  var v_login = new Vue({
    // element to mount to
    el: '#v-login',
    // initial data
    data: {
      user: {
        name: '',
        pwd: ''
      },
      msg: {
        name: null,
        pwd: null
      },
      is_checked: 'checked'
    },
    // computed property for form validation state
    computed: {
      isValid: function () {
        var msg = this.msg
        // every：
        // 如果数组中检测到有一个元素不满足，则整个表达式返回 false ，且剩余的元素不会再进行检测。
        // 如果所有元素都满足条件，则返回 true。
        return Object.keys(msg).every(function (key) {
        return msg[key] === null
        })
      }
    },
    // methods
    methods: {
      change_name: function(){
        this.msg.name = this.user.name.length < 3 ? '用户名应大于等于3位' : null;
      },
      change_pwd: function(){
        this.msg.pwd = this.user.pwd.length < 6 ? '密码应大于等于6位' : null;
      },
      change_is_remember: function(){
        this.is_checked = this.is_checked == 'checked' ? '' : 'checked';
      },
      login: function () {
        var vue = this;
        var form_data = $('#v-login').find('form').serialize();
        if (this.isValid) {
          $.ajax({
            url : SITE_URL+'/user/do_login',
            type : "post",
            data : form_data,
            dataType : "json",
            success : function(data){
              login_ajax_sucess(vue, data)
            },
            error : function(data){
              alert("服务器发生错误，登录失败");
            }
          });
        }
      },
    }
  })
  function login_ajax_sucess(vue, data){
    if (data['status'] === true) {
      store.set('user', data.user_info);
      location.href = document.referrer;
    }else {
      switch(data['msg']){
        case 'validation_faild':
          $(data['info']).each(function(){
            var info = this;
            switch(info[0]){
              case 'user_name':
                vue.msg.name = info[1];
                break;
            }
          });
          break;
        case 'username_faild':
          vue.msg.name = '用户名不存在';
          break;
        case 'useremail_faild':
          vue.msg.name = '邮箱不存在';
          break;
        case 'password_faild':
          vue.msg.pwd = '密码错误';
          break;
        default:
          alert('发生未知错误，登录失败');
      }
    }
  }
});