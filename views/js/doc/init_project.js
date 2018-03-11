require(['jquery'], function($){
  $('#trans-html').keyup(function(){
    console.log($(this).val())
    if ($(this).val() != '') {
      $('#submit').prop('disabled', false);
    }else{
      $('#submit').prop('disabled', true);
    }
  })
  $('#submit').click(function(){
    var form_data = $('form#project').serialize();
    $.ajax({
      url : SITE_URL+'/doc/do_init_project',
      type : "post",
      data : form_data,
      dataType : "json",
      success : function(data){
        if(data.status == true){
          location.href = SITE_URL + '/doc/show/' + $('#doc-name').val();
        }else{
          alert(data.msg);
        }
      },
      error : function(data){
        alert("服务器发生错误，登录失败");
      }
    });
  })
})