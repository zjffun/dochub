'use strict';

function gpte_init(){
  var $ori = $('#gpte-ori');
  var $trans = $('#gpte-trans');
  var ori_height = 0;
  var trans_height = 0;
  setInterval(function(){
    if (Math.abs(ori_height - $ori.contents().height()) > 20) {
      ori_height = $ori.contents().height() + 20;
      $ori.height(ori_height);
    }
    if (Math.abs(trans_height - $trans.contents().height()) > 20) {
      trans_height = $trans.contents().height()+20;
      $trans.height(trans_height);
    }
  }, 500);
  test_gpte = gpte.init({
    $ori: $('#gpte-ori'), 
    $trans: $('#gpte-trans')
  });
}

require(['jquery', 'gpte'], function($, gpte){
  $(function(){
    gpte_init();
  });
});
