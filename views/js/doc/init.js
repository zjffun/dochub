require(['vue', 'jquery'], function(Vue, $){
  new Vue({
    el: '#vue-dh-init',
    data: {
      is_translated: false,
    },
    methods: {
      submit: function(arg){
        var form_data = $('form').serialize();
        $.ajax({
          url : $(arg.target).attr('submit-url'),
          type : "post",
          data : form_data,
          dataType : "json",
          success : function(data){
            if(data.status == true){
              location.href = data.data;
            }else{
              alert(data);
            }
          },
          error : function(data){
            alert("服务器发生错误");
          }
        });
      }
    }
  })
  require(['jquery-tageditor'], function(){
    $('#doc-tag').tagEditor({
      initialTags: [],
      delimiter: ', ',
      placeholder: '输入标签 ...'
    });
  })
})
