<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc extends MY_Controller {

  public function __construct(){
    $this->not_check = array(
      'show'
    );
    parent::__construct();
  }

  public function show($doc_name = null){
    if (!$doc_name) {
      echo "无文档名";die();
    }
    // var_dump($doc_name);
    $this->view_dochf('doc/show.html');
  }
}
