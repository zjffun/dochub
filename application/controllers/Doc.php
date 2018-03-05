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
    $this->view_dochf('doc/show.html');
  }

  public function translate($doc_name = null){
    if (!$doc_name) {
      echo "无文档名";die();
    }
    $data['js'] = array('doc-translate');
    $this->view_dochf('doc/translate.html', $data);
  }

  public function revise($doc_name = null){
    if (!$doc_name) {
      echo "无文档名";die();
    }
    $data['js'] = array('doc-revise');
    $this->view_dochf('doc/revise.html', $data);
  }

}
