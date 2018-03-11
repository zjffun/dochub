require(['vue', 'jquery'], function(Vue, $){
  $.get('/docs.min.json', function(docs){
    var docs_top_9 = docs.slice(0, 8);
    new Vue({
      el: '#dh-search-docs',
      data: {
        show_url_pref: SITE_URL + '/doc/show/',
        docs: docs_top_9,
        isAllDocs: false,
        search: '',
      },
      methods: {
        showAllDocs: function(){
          this.search = '';
          this.docs = docs;
          this.isAllDocs = true;
        },
        findDocs: function(){
          var search = this.search;
          if (search == '') {
            this.docs = docs_top_9;
          }
          var search_patt  = new RegExp(search, 'i');
          var searched_docs = [];
          for (var i = 0; i < docs.length; i++) {
            if (searched_docs.length >= 20) break;
            if (search_patt.test(docs[i][0])) {
              searched_docs.push(docs[i])
            }
          }
          this.docs = searched_docs;
        }
      }
    })
  }, 'json');
})