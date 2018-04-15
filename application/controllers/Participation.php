<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Participation extends Doc_Controller {
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

    // 三：页面检查
    $this->check_page_para();

    // 将page_path写入$this->doc
    $this->create_page_path();
    // var_dump($this->doc);die();
  }

  public function new_part(){
    $this->view_inithf([
      'doc/form_participation.html', 
    ], [
      'data' => 
        ["《{$this->doc['doc_name']}》文档的{$this->doc['this_ver']['ver_name']}版本的{$this->doc['this_page']['page_para']}页面的翻译", 
          '新的翻译', 
          site_url("participation/do_new_part{$this->page_seg}")
        ]
    ]);
  }

  public function translate(){
    // 整理并翻译
    $this->view_dochf('doc/translate.html', ['js' => ['doc-translate']]);
  }

  public function revise(){
    $this->view_dochf('doc/revise.html', ['js' => ['doc-revise']]);
  }

  public function do_new_part(){
    // 表单验证
    $this->form_validation->set_rules('html', 'html', 'required');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      msg_err('validation_faild', $info);
    }

    // 写入数据库
    $post_data = $this->input->post($this->participation_model->fields);
    $post_data['page_id'] = $this->doc['this_page']['page_id'];
    $post_data['part_time'] = time();
    $post_data['part_type'] = 'original';
    foreach ($post_data as $key => &$data) {
      if(!$data)  unset($post_data[$key]);
    }
    !$this->participation_model->insert($post_data) && meg_err('写入数据库失败');
    
    msg_succ(site_url("doc/show/{$this->doc['doc_name']}/{$this->doc['this_ver']['ver_name']}{$this->doc['this_page']['page_para']}"));
  }

  public function do_pe(){
    !($type = $this->input->post('type')) && msg_err('未指定type');
    switch($type){
      case 'publish':
        !$this->participation_model->insert(array(
          'user_id' => $_SESSION['user']['user_id'],
          'page_id' => $this->doc['this_page']['page_id'],
          'html' => $this->input->post('html'),
          'part_type' => 'c&t',
          'part_time' => time()
        )) && msg_err('写入数据库失败');
        msg_succ('发布成功');
        break;
      case 'save':
        !$this->participation_model->replace(array(
          'user_id' => $_SESSION['user']['user_id'],
          'page_id' => $this->doc['this_page']['page_id'],
          'html' => $this->input->post('html'),
          'part_type' => 'save',
          'part_time' => time()
        )) && msg_err('写入数据库失败');
        msg_succ('保存成功');
        break;
      case 'preview':
        $dir_path = FCPATH . 'temp';
        $html_path = "/index-{$_SESSION['user']['user_id']}-" . time() .".html";
        !is_dir($dir_path) && mkdir($dir_path, 0777, true);
        !file_put_contents($dir_path . $html_path, $this->input->post('html')) && $this->returnResult('写入页面失败');
        msg_succ('temp' . $html_path);
        break;
    }
  }

}