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
    $this->load->model('page_model');
    
    // $this->update_docs_json();die();
  }


  public function show(){
    $segments = $this->uri->segments;
    // 文档检查
    $doc = $this->doc_model->select_join_ver(array('doc_name' => $segments[3]), 'row_array');
    !$doc && $this->msgpage('文档不存在');

    // 版本检查
    !$doc['default_ver'] && $this->msgpage('版本不存在');
    $ver = isset($segments[4]) ? $segments[4] : $doc['default_ver'];

    // 生成page_para
    $page_para = '/' . implode('/', count($segments) > 4 ? array_slice($segments, 4) : []);

    $page_path = "/docs/{$doc['doc_name']}/{$ver}{$page_para}";

    // 有缓存直接输出
    if (is_file(FCPATH . $page_path)) {
      $this->view_dochf('doc/show.html', array('page_path' => $page_path));
      return;
    }

    // 未初始化
    $show_page = $this->get_show_page($doc['vers'][$ver]['ver_id'], $page_para);
    !$show_page && $this->msgpage('页面不存在');

    // 未翻译
    if ($show_page['part_type'] == 'original') {
      $not_trans_path = FCPATH . $page_path . '/index-not-trans.html';
      if (!is_file($not_trans_path)) {
        !is_dir(FCPATH . $page_path) && !mkdir(FCPATH . $page_path, 0777, true);
        !file_put_contents($not_trans_path, $show_page['html']) && $this->returnResult('写入页面失败');
      }
      $this->view_dochf('doc/show.html', array(
        'page_path' => $page_path . 'index-not-trans.html',
        'type' => 'not_trans'
      ));
      return;
    }
    
    // 写入页面
    !is_dir(FCPATH . $page_path) && !mkdir(FCPATH . $page_path, 0777, true);
    !file_put_contents(FCPATH . $page_path . '/index.html', $show_page['html']) && $this->returnResult('写入页面失败');

    // 展示页面
    $this->view_dochf('doc/show.html', array('page_path' => $page_path));
  }
  
  public function show_not_trans(){
    $this->view_dochf('doc/show_not_trans.html', array('info' => $this->info));
  }

  public function new_project(){
    $this->viewhf('doc/new_project.html', array('js' => ['doc-new_project']));
  }

  

  public function translate(){
    $this->view_dochf('doc/translate.html', array('js' => ['doc-translate'], 'info' => $this->info));
  }

  public function revise(){
    $this->view_dochf('doc/revise.html', ['js' => 'doc-revise']);
  }

  public function do_new_project(){
    // 表单验证
    $this->form_validation->set_rules('doc_name', '项目名',  'callback_check_doc_name');
    $this->form_validation->set_rules('description', '描述', 'max_length[1024]');
    $this->form_validation->set_rules('default_version', '默认版本', 'required');
    $this->form_validation->set_rules('tags', '标签', 'max_length[255]');
    $this->form_validation->set_rules('versions', '版本', 'max_length[255]');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      $this->returnResult('validation_faild', $info);
    }

    // 写入数据库
    $project = $this->input->post();
    $project['versions'] = $project['default_version'];
    !$this->doc_model->insert($project) && $this->returnResult('写入数据库失败');

    // 创建目录
    $dir_path = FCPATH . "docs/{$this->input->post('doc_name')}/{$this->input->post('default_version')}";
    !mkdir($dir_path, 0777, true) && $this->returnResult('创建项目文件夹失败');
    // 更新docs.json
    $this->update_docs_json();
    $this->returnResult(array('添加成功'));
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
