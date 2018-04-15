<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Page extends Doc_Controller {
  public function __construct(){
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
    $this->load->model('page_model');

    // 一：文档检查
    $this->check_doc_name();

    // 二：版本检查
    $this->check_ver();
  }

  public function init_page(){
    $this->view_inithf([
      'doc/form_page.html',
      // 'doc/form_participation.html', 
    ], array(
      'doc' => $this->doc,
      'data' => ["《{$this->doc['doc_name']}》文档的{$this->doc['this_ver']['ver_name']}版本的页面", 
        '新的页面', 
        site_url("page/do_init_page/{$this->doc['doc_name']}/{$this->doc['this_ver']['ver_name']}")
      ]));
  }

  public function do_init_page(){
    $this->do_new_page();
  }
  public function do_new_page(){
    // 表单验证
    $this->form_validation->set_rules('page_para', '页面参数', 'required');
    $this->form_validation->set_rules('ori_url', '页面原网页url', 'required');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      msg_err('validation_faild', $info);
    }

    // 写入数据库
    $post_data = $this->input->post($this->page_model->fields);
    $post_data['ver_id'] = $this->doc['this_ver']['ver_id'];
    !$this->page_model->insert($post_data) && meg_err('写入数据库失败');
    
    msg_succ(site_url("doc/show/{$this->doc['doc_name']}/{$this->doc['this_ver']['ver_name']}{$post_data['page_para']}"));
  }

}