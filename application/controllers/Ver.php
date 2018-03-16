<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Ver extends Doc_Controller {
  public function __construct(){
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('ver_model');

    $segments = $this->uri->segments;
    // 文档检查
    $doc = $this->doc_model->select_join_ver(array('doc_name' => $segments[3]), 'row_array');
    !$doc && $this->returnResult('文档不存在');
    $this->doc = $doc;
  }
  public function init_ver(){
    $this->view_inithf([
      'doc/form_ver.html', 
      // 'doc/form_page.html',
      // 'doc/form_participation.html', 
    ], array(
      'doc' => $this->doc,
      'data' => ["《{$this->doc['doc_name']}》文档的版本", 
        '新的版本', 
        site_url("ver/do_init_ver/{$this->doc['doc_name']}")
      ]));
  }
  
  public function do_init_ver(){
    $this->do_new_ver();
  }

  public function do_new_ver(){
    // 表单验证
    $this->form_validation->set_rules('ver_name', '版本名', 'required');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      msg_err('validation_faild', $info);
    }
    // 写入数据库
    $post_data = $this->input->post($this->ver_model->fields);
    $post_data['doc_id'] = $this->doc['doc_id'];
    !$this->ver_model->insert($post_data) && msg('写入数据库失败');
    msg_succ(site_url("doc/show/{$this->doc['doc_name']}/{$post_data['ver_name']}"));
  }

}