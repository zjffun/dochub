<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Page extends MY_Controller {
  public function __construct(){
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
    
    $this->init_info();
  }
  public function save(){
    !$this->participation_model->replace(array(
      'user_id' => $_SESSION['user']['user_id'],
      'doc_id' => $this->info['doc']['doc_id'],
      'page_html' => $this->input->post('trans_html'),
      'page_para' => $this->info['page_para'],
      'part_type' => 'save',
      'part_time' => time()
    )) && $this->returnResult('写入数据库失败');
  }

  public function publish(){
    !$this->participation_model->insert(array(
      'user_id' => $_SESSION['user']['user_id'],
      'doc_id' => $this->info['doc']['doc_id'],
      'page_html' => $this->input->post('trans_html'),
      'page_para' => $this->info['page_para'],
      'part_type' => 'c&t',
      'part_time' => time()
    )) && $this->returnResult('写入数据库失败');
  }

  public function preview(){
    $dir_path = FCPATH . 'temp';
    $html_path = "/index-{$_SESSION['user']['user_id']}-" . time() .".html";
    !is_dir($dir_path) && mkdir($dir_path, 0777, true);
    !file_put_contents($dir_path . $html_path, $this->input->post('trans_html')) && $this->returnResult('写入页面失败');
    $this->returnResult(array('temp' . $html_path));
  }

}