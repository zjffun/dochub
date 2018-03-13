require(['jquery'], function($){
  $('#doc-name').keyup(function(){
    if ($(this).val() != '') {
      $('#submit').prop('disabled', false);
    }else{
      $('#submit').prop('disabled', true);
    }
  })
  $('#submit').click(function(){
    var form_data = $('form#project').serialize();
    $.ajax({
      url : SITE_URL+'/doc/do_new_project',
      type : "post",
      data : form_data,
      dataType : "json",
      success : function(data){
        if(data.status == true){
          location.href = SITE_URL + '/doc/show/' +
            $('#doc-name').val() + '/' +
            $('#default-version').val();
        }else{
          alert(data.msg);
        }
      },
      error : function(data){
        alert("服务器发生错误");
      }
    });
  })
  require(['jquery-tageditor'], function(){
    $('#doc-tag').tagEditor({
      initialTags: [],
      delimiter: ', ',
      placeholder: '输入标签 ...'
    });
  })
})
