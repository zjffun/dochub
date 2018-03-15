'use strict';

require(['jquery', 'gpte'], function($, gpte){
  $(function(){
    // gpte_init();
    $('#dh-preview').click(function(){
      var form_data = {trans_html: $('#gpte-trans').contents().find('html').html()};
      $.ajax({
        url : SITE_URL + '/page/preview' + PAGE_PARA,
        type : "post",
        data : form_data,
        dataType : "json",
        success : function(data){
          if(data.status == true){
            window.open(BASE_URL + data.data[0]);
          }else{
            alert(data.msg);
          }
        },
        error : function(data){
          alert("服务器发生错误");
        }
      });
    });
    $('#dh-publish').click(function(){
      var form_data = {trans_html: $('#gpte-trans').contents().find('html').html()};
      $.ajax({
        url : SITE_URL + '/page/publish' + PAGE_PARA,
        type : "post",
        data : form_data,
        dataType : "json",
        success : function(data){
          if(data.status == true){
            alert(data.data[0]);
          }else{
            alert(data.msg);
          }
        },
        error : function(data){
          alert("服务器发生错误");
        }
      });
    });
    $('#dh-save').click(function(){
      var form_data = {trans_html: $('#gpte-trans').contents().find('html').html()};
      $.ajax({
        url : SITE_URL + '/page/save' + PAGE_PARA,
        type : "post",
        data : form_data,
        dataType : "json",
        success : function(data){
          if(data.status == true){
            alert(data.data[0]);
          }else{
            alert(data.msg);
          }
        },
        error : function(data){
          alert("服务器发生错误");
        }
      });
    });
    $('#dh-discard').click(function(){
      confirm('是否放弃，放弃后当前修改内容将不会保存！') && history.back(-1);
    });
  });
});
