'use strict';

require(['jquery', 'gpte', 'urijs/URI'], function($, gpte, URI){
  $(function(){
    $('#dh-resolve').click(function(){
      var aa = URI(ORI_URL+'/123/789');
      $('#gpte-trans').contents().find('link').each(function(){
        var href = $(this).attr('href');
        console.log(URI(href));
        href && !URI(href).hostname() && $(this).attr('href', URI(ORI_URL).absoluteTo(href) + href);
      });
      $('#gpte-trans').contents().find('img, script').each(function(){
        var src = $(this).attr('src');
        src && !URI(src).hostname() && $(this).attr('src', URI(ORI_URL).absoluteTo(src) + src);
      });
    });
    $('#dh-preview').click(function(){
      var form_data = {trans_html: $('#gpte-trans').contents().find('html').html()};
      $.ajax({
        url : SITE_URL + '/participation/do_preview' + THIS_PARA,
        type : "post",
        data : form_data,
        dataType : "json",
        success : function(data){
          if(data.status == true){
            window.open(BASE_URL + data.data);
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
        url : SITE_URL + '/page/publish' + THIS_PARA,
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
        url : SITE_URL + '/page/save' + THIS_PARA,
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
