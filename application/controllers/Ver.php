<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Page extends Doc_Controller {
  public function __construct(){
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
    $this->load->model('page_model');

    $this->init_info();
  }

  public function init_page(){
    echo 213;
  }

}