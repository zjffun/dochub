import gpte_init from './gpte_init.js';
require(['jquery', 'gpte'], function($, gpte){
  $(function(){
    // gpte_init();
    $('#dh-preview').click(function(){
      var form_data = {trans_html: '123'};
      $.ajax({
        url : SITE_URL + '/page/preview' + PAGE_PARA,
        type : "post",
        data : form_data,
        dataType : "json",
        success : function(data){
          if(data.status == true){
            window.open(BASE_URL + data.data[0])
          }else{
            alert(data.msg);
          }
        },
        error : function(data){
          alert("服务器发生错误");
        }
      });
    });
  });
})