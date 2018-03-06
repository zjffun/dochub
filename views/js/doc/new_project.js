require(['jquery'], function($){
  $('#doc-name').keyup(function(){
    if ($(this).val() != '') {
      $('#submit').prop('disabled', false);
    }else{
      $('#submit').prop('disabled', true);
    }
  })
  require(['tag-editor'], function(){
    $('#doc-tags').tagEditor({
      initialTags: [],
      delimiter: ', ',
      placeholder: '输入标签 ...'
    });
  })
})
