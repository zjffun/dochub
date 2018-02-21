/*global BASE_URL SITE_URL*/
require(['vue', 'jquery'], function(Vue, $){
  new Vue({
    // element to mount to
    el: '#v-dh-profile-card',
    // initial data
    data: {
      user: {}
    },
    created: function(){
      var vue = this;
      $.get(SITE_URL + '/user/get_user', function(data){
        if (data.status == true) {
          vue.user = data.data;
        }
      }, 'json')
    },
    // methods
    methods: {
    }
  });
  new Vue({
    el: '#v-dh-profile-docs',
    data: {
      currentRoute: location.hash,
      docs: null,
      search: null,
      all_docs: null
    },
    created: function(){
      this.currentRoute = this.currentRoute ? this.currentRoute : '#home';
      this.getDocs();
    },
    methods: {
      changeTab: function(tab){
        this.currentRoute = tab.target.hash;
        this.search = '';
        this.getDocs();
      },
      findDocs: function(){
        var search = this.search;
        var all_docs = this.all_docs;
        var search_patt  = new RegExp(search, 'i');
        var searched_docs = [];
        for (var i = 0; i < all_docs.length; i++) {
          if (search_patt.test(all_docs[i].doc_name)) {
            searched_docs.push(all_docs[i])
          }
        }
        this.docs = searched_docs;
      },
      getDocs: function(){
        var vue = this;
        switch(this.currentRoute){
          case '#home':
            $.get(SITE_URL + '/user/get_my_common_docs', function(data){
              vue.docs = vue.all_docs = data.data
            })
            break;
          case '#participation':
            $.get(SITE_URL + '/user/get_my_participation', function(data){
              vue.docs = vue.all_docs = data.data
            })
            break;
          case '#collection':
            $.get(SITE_URL + '/user/get_my_collection', function(data){
              vue.docs = vue.all_docs = data.data
            })
            break;
          default:
        }
      }
    },
  })
});