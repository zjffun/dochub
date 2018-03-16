<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Page extends Doc_Controller {
  public function __construct(){
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
    $this->load->model('page_model');

    $segments = $this->uri->segments;
    // 文档检查
    $doc = $this->doc_model->select_join_ver(array('doc_name' => $segments[3]), 'row_array');
    !$doc && msg_err(['文档不存在', site_url("doc/init_doc")]);

    // 版本检查
    $ver = isset($segments[4]) ? 
      isset($doc['vers'][$segments[4]]) ? $segments[4] : false : 
      $doc['default_ver'] != '' ? $doc['default_ver']['ver_name'] : false;
    !$ver && msg_err(['版本不存在', site_url("ver/init_ver/{$doc['doc_name']}")]);

    $doc['this_ver'] = $doc['vers'][$ver];
    $this->doc = $doc;
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