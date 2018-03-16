<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc extends Doc_Controller {

  public function __construct(){

    $this->not_check = array(
      'show'
    );
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('ver_model');
    $this->load->model('page_model');
    
    // $this->update_docs_json();die();
  }

  public function show(){
    $segments = $this->uri->segments;
    // 文档检查
    $doc = $this->doc_model->select_join_ver(array('doc_name' => $segments[3]), 'row_array');
    !$doc && msg_err(['文档不存在', site_url("doc/init_doc")]);

    // 版本检查
    $ver = isset($segments[4]) ? 
      isset($doc['vers'][$segments[4]]) ? $segments[4] : false : 
      $doc['default_ver'] != '' ? $doc['default_ver']['ver_name'] : false;
    !$ver && msg_err(['版本不存在', site_url("ver/init_ver/{$doc['doc_name']}")]);

    // 生成page_para, page_path
    $page_para = '/' . implode('/', count($segments) > 4 ? array_slice($segments, 4) : []);
    $page_path = "/docs/{$doc['doc_name']}/{$ver}{$page_para}";
    
    // 有缓存直接输出
    if (is_file(FCPATH . $page_path)) {
      $this->view_dochf('doc/show.html', array('page_path' => $page_path));
      return;
    }

    // 页面检查
    $page = $this->page_model->select([
      'ver_id' => $doc['vers'][$ver]['ver_id'], 
      'page_para' => $page_para], 'row_array');
    !$page && msg_err(['页面不存在', site_url("page/init_page/{$doc['doc_name']}/{$ver}")]);

    // 参与翻译检查
    $part = $this->get_show_page($doc['vers'][$ver]['ver_id'], $page_para);
    !$part && msg_err(['参与翻译不存在', site_url("participation/new_part/{$doc['doc_name']}/{$ver}{$page_para}")]);

    // 未翻译
    if ($part['part_type'] == 'original') {
      $not_trans_path = FCPATH . $page_path . '/index-not-trans.html';
      if (!is_file($not_trans_path)) {
        !is_dir(FCPATH . $page_path) && !mkdir(FCPATH . $page_path, 0777, true);
        !file_put_contents($not_trans_path, $part['html']) && msg_err(['写入页面失败']);
      }
      $this->view_dochf('doc/show.html', array(
        'page_path' => $page_path . '/index-not-trans.html',
        'type' => 'not_trans'
      ));
      return;
    }
    
    // 写入页面
    !is_dir(FCPATH . $page_path) && !mkdir(FCPATH . $page_path, 0777, true);
    !file_put_contents(FCPATH . $page_path . '/index.html', $show_page['html']) && $this->msg_err(['写入页面失败']);

    // 展示页面
    $this->view_dochf('doc/show.html', array('page_path' => $page_path));
  }

  public function init_doc(){
    $this->view_inithf([
      'doc/form_doc.html', 
      // 'doc/form_ver.html', 
      // 'doc/form_page.html',
      // 'doc/form_participation.html', 
    ], array(
      'data' => ['文档翻译项目', 
      '创建新的文档翻译项目，项目名不能与已有的文档翻译项目重名', 
      site_url('doc/do_init_doc')]));
  }

  public function translate(){
    $this->view_dochf('doc/translate.html', array('js' => ['doc-translate'], 'info' => $this->info));
  }

  public function revise(){
    $this->view_dochf('doc/revise.html', ['js' => 'doc-revise']);
  }

  public function do_init_doc(){
    $this->do_new_doc();
  }
  
  public function do_new_doc(){
    // 表单验证
    $this->form_validation->set_rules('doc_name', '项目名',  'callback_check_doc_name');
    $this->form_validation->set_rules('description', '描述', 'max_length[1024]');
    $this->form_validation->set_rules('tags', '标签', 'max_length[255]');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      msg_err('validation_faild', $info);
    }

    // 写入数据库
    $post_data = $this->input->post($this->doc_model->fields);
    !$this->doc_model->insert($post_data) && msg_err('写入数据库失败');

    // 创建目录
    $dir_path = FCPATH . "docs/{$this->input->post('doc_name')}}";
    !mkdir($dir_path, 0777, true) && msg_err('创建项目文件夹失败');

    // 更新docs.json
    $this->update_docs_json();
    msg_succ(site_url("doc/show/{$post_data['doc_name']}"));
  }

  public function join_project($doc_id){
    $participation = array(
      'user_id' => $_SESSION['user']['user_id'],
      'doc_id' => $doc_id,
      'page_para' => '/',
      'part_type' => 'mark',
      'part_time' => time()
    );
    $this->participation_model->replace($participation);
  }

  public function check_doc_name($doc_name){
    if($this->doc_model->select(array('doc_name' => $doc_name), 'row_array')){
      $this->form_validation->set_message('check_doc_name', "{field}已经存在");
      return FALSE;
    }else{
      return TRUE;
    }
  }


  private function update_docs_json(){
    $docs = $this->doc_model->all_docs();
    $json = array();
    foreach ($docs as $key => $doc) {
      $json[] = array($doc['doc_name'], $doc['description']);
    }
    return file_put_contents(FCPATH . 'docs.min.json', json_encode($json));
  }
}
