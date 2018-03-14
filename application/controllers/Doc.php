<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc extends MY_Controller {

  public function __construct(){

    $this->not_check = array(
      'show'
    );
    $this->not_init_doc_info = array(
      'new_project', 
      'do_new_project'
    );
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
    
    $this->init_info();
    // $this->update_docs_json();die();
  }

  public function show(){
    // 有缓存直接输出
    if (is_file($this->info['page_path'])) {
      $this->view_dochf('doc/show.html', array('info' => $this->info));
      return;
    }

    // 判断文档是否存在
    if (!$this->info['doc']) {
      $msg = array('文档不存在', '<button>创建该文档翻译项目</button>（登陆后才能创建）');
      $this->viewhf('errors/msg.html', array('msg' => $msg));
      return;
    }

    // 判断版本是否存在
    if (!in_array($this->info['page_version'], explode(',', $this->info['doc']['versions']))) {
      $msg = array('该版本不存在', '<button>创建新版本</button>（登陆后才能创建）');
      $this->viewhf('errors/msg.html', array('msg' => $msg));
      return;
    }

    // 判断文档是否初始化
    $show_traslation = $this->get_show_traslation($this->info['doc']['doc_id'], $this->info['page_para']);
    if (!$show_traslation){
      Header('Location: ' . site_url("doc/init_project{$this->info['page_para']}"));
      die();
    }

    // 写入页面
    !mkdir($this->info['page_dir_path'], 0777, true) && $this->returnResult('创建项目文件夹失败');
    !file_put_contents($this->info['page_path'], $show_traslation['page_html']) && $this->returnResult('写入页面失败');

    // 展示页面
    $this->view_dochf('doc/show.html', array('info' => $this->info));
  }

  public function new_project(){
    $this->viewhf('doc/new_project.html', array('js' => ['doc-new_project']));
  }

  public function init_project(){
    $this->viewhf('doc/init_project.html', array('js' => ['doc-init_project'], 'info' => $this->info));
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
    // 参加该翻译项目
    $this->join_project($this->db->insert_id());
    $this->returnResult(array('添加成功'));
  }

  public function do_init_project(){
    // 表单验证
    $this->form_validation->set_rules('trans_html', '谷歌网页翻译的HTML源码', 'required');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      $this->returnResult('validation_faild', $info);
    }

    // 判断文档是否存在
    if (!$this->info['doc']) {
      $msg = array('文档不存在', '<button>创建该文档翻译项目</button>（登陆后才能创建）');
      $this->returnResult('文档不存在');
    }

    // 判断版本是否存在
    if (!in_array($this->info['page_version'], explode(',', $this->info['doc']['versions']))) {
      $msg = array('该版本不存在', '<button>创建新版本</button>（登陆后才能创建）');
      $this->returnResult('该版本不存在');
    }

    // 判断文档是否初始化
    $this->get_show_traslation($this->info['doc']['doc_id'], $this->info['page_para']) && $this->returnResult('已经初始化了，请刷新查看');

    // 写入数据库
    !$this->participation_model->insert(array(
      'user_id' => $_SESSION['user']['user_id'],
      'doc_id' => $this->info['doc']['doc_id'],
      'page_html' => $this->input->post('trans_html'),
      'page_para' => $this->info['page_para'],
      'part_type' => 'c&t',
      'part_time' => time()
    )) && $this->returnResult('写入数据库失败');

    // 初始化首页
    $dir_path = FCPATH . 'docs/' . $this->info['page_para'];
    !is_dir($dir_path) && mkdir($dir_path, 0777, true);
    !file_put_contents($dir_path . '/index.html', $this->input->post('trans_html')) && $this->returnResult('写入页面失败');
    
    $this->returnResult(array('初始化成功'));
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

  private function get_show_traslation($doc_id, $page_para){
    return $this->participation_model->get_best(array(
        'doc_id' => $doc_id,
        'page_para' => $page_para
      ));
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
