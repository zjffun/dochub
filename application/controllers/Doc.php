<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc extends MY_Controller {

  public function __construct(){
    $this->not_check = array(
      'show'
    );
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
  }

  public function show($doc_name = null){
    if (!$doc_name) {
      echo "无文档名";die();
    };
    $doc = $this->doc_model->select(array('doc_name' => $doc_name), 'row_array');
    // 判断文档是否存在
    if (!$doc) {
      $msg = array('文档不存在', '<button>创建该文档翻译项目</button>（登陆后才能创建）');
      $this->viewhf('errors/msg.html', $msg);
      return;
    }
    // 判断文档是否初始化
    if (!is_file(FCPATH . 'docs/' . $doc_name . '/index.html')){
      $this->viewhf('doc/init_project.html', array('js' => ['doc-init_project'], 'doc_name' => $doc_name));
      return;
    }
    // 全部通过展示文档显示文档
    $this->view_dochf('doc/show.html', array('doc' => $doc));
  }

  public function new_project(){
    $data['js'] = array('doc-new_project');
    $this->viewhf('doc/new_project.html', $data);
  }

  public function translate($doc_name = null){
    if (!$doc_name) {
      echo "无文档名";die();
    }
    $data['js'] = array('doc-translate');
    $this->view_dochf('doc/translate.html', $data);
  }

  public function revise($doc_name = null){
    if (!$doc_name) {
      echo "无文档名";die();
    }
    $data['js'] = array('doc-revise');
    $this->view_dochf('doc/revise.html', $data);
  }

  public function do_init_project(){
    $doc_name = $this->input->post('doc_name');
    // 表单验证
    $this->form_validation->set_rules('doc_name', '文档名', 'required');
    $this->form_validation->set_rules('trans_html', '谷歌网页翻译的HTML源码', 'required');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      $this->returnResult('validation_faild', $info);
    }

    $doc = $this->doc_model->select(array('doc_name' => $this->input->post('doc_name'), 'row_array'));
    // 判断文档是否存在
    if (!$doc) {
      $msg = array('文档不存在', '<button>创建该文档翻译项目</button>（登陆后才能创建）');
      $this->returnResult('文档不存在');
    }
    $file_path = FCPATH . 'docs/' . $doc_name . '/index.html';
    // 判断文档是否初始化
    if (is_file($file_path)){
      $this->returnResult('已经初始化了，请刷新查看');
    }

    // 进行初始化
    if (!file_put_contents($file_path, $this->input->post('trans_html'))) {
      $this->returnResult('写入首页失败');
    }
    
    // 参加该翻译项目
    $this->join_project($this->db->insert_id());

    $this->returnResult(array('初始化成功'));
  }

  public function do_new_project(){
    // 表单验证
    $this->form_validation->set_rules('doc_name', '项目名',  'callback_check_doc_name');
    $this->form_validation->set_rules('description', '描述', 'max_length[1024]');
    $this->form_validation->set_rules('tags', '标签', 'max_length[255]');
    $this->output->set_header('Content-Type: application/json; charset=utf-8');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      $this->returnResult('validation_faild', $info);
    }

    // 新建翻译项目
    $project = $this->input->post();
    if ($this->doc_model->insert($project)) {
      $dir_path = FCPATH . 'docs/' . $this->input->post('doc_name');
      // 创建目录
      if (!mkdir($dir_path)) {
        $this->returnResult('创建项目文件夹失败');
      }
      // 更新docs.json
      $this->update_docs_json();
      // 参加该翻译项目
      $this->join_project($this->db->insert_id());
      $this->returnResult(array('添加成功'));
    }else{
      $this->returnResult('写入数据库失败');
    }
    
  }

  public function join_project($doc_id){
    $participation = array(
      'user_id' => $_SESSION['user']['user_id'],
      'doc_id' => $doc_id,
      'page_path' => '/',
      'role' => 0
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
