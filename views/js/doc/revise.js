require(['jquery', 'PE'], function($, PE){
  $(function(){
    PE.init({
      el: '#dh-pe',
      ref_page_url: PAGE_PATH + '/index.html',
      // 右iframe中编辑用的页面的url
      edit_page_url: PAGE_PATH + '/index.html',
      // 原始页面的url
      ori_url: ORI_URL,
      // 服务器的url
      server_url: SITE_URL + '/participation/do_pe' + THIS_PARA,
    })
  })
})