require(['vue', 'jquery'], function(Vue, $){
  $.get('/libraries.min.json', function(docs){
    var docs_top_6 = docs.slice(0, 8);
    new Vue({
      el: '#dh-search-docs',
      data: {
        docs: docs_top_6,
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
            this.docs = docs_top_6;
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