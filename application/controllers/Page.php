<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Page extends MY_Controller {
  public function __construct(){
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
    $this->load->model('page_model');

    $this->init_info();
  }

  public function init_page(){
    // 表单验证
    $this->form_validation->set_rules('ori_html', '原始HTML代码', 'required');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      $this->returnResult('validation_faild', $info);
    }
    $ori_html = $this->input->post('ori_html');
    // 判断文档是否存在
    if (!$this->info['doc']) {
      $this->returnResult('文档不存在');
    }

    // 判断版本是否存在
    if (!in_array($this->info['page_version'], explode(',', $this->info['doc']['versions']))) {
      $this->returnResult('该版本不存在');
    }

    // 判断是否初始化
    $this->get_show_page($this->info['doc']['doc_id'], $this->info['page_para']) && $this->returnResult('已经初始化');

    // 写入数据库
    !$this->page_model->insert(array(
      'user_id' => $_SESSION['user']['user_id'],
      'doc_id' => $this->info['doc']['doc_id'],
      'page_para' => $this->info['page_para'],
      'ori_url' => $this->input->post('ori_url'),
    )) && $this->returnResult('写入数据库失败');
    !$this->participation_model->insert(array(
      'user_id' => $_SESSION['user']['user_id'],
      'page_id' => $this->db->insert_id(),
      'html' => $ori_html,
      'part_type' => 'original',
      'part_time' => time()
    )) && $this->returnResult('写入数据库失败');
    
    // 初始化首页
    $dir_path = FCPATH . 'docs/' . $this->info['page_para'];
    !is_dir($dir_path) && mkdir($dir_path, 0777, true);
    !file_put_contents($dir_path . '/index-not-trans.html', $ori_html) && $this->returnResult('写入页面失败');
    
    $this->returnResult(array('初始化成功'));
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
    $this->returnResult(array('保存成功'));
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
    $this->returnResult(array('发布成功'));
  }

  public function preview(){
    $dir_path = FCPATH . 'temp';
    $html_path = "/index-{$_SESSION['user']['user_id']}-" . time() .".html";
    !is_dir($dir_path) && mkdir($dir_path, 0777, true);
    !file_put_contents($dir_path . $html_path, $this->input->post('trans_html')) && $this->returnResult('写入页面失败');
    $this->returnResult(array('temp' . $html_path));
  }


}