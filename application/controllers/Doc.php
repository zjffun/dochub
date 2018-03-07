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
      $this->viewhf('doc/init_project.html');
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

  public function do_new_project(){
    //表单验证
    $this->form_validation->set_rules('doc_name', '用户名', 'required');
    $this->form_validation->set_rules('description', '描述', 'max_length[1024]');
    $this->form_validation->set_rules('tags', '标签', 'max_length[255]');
    $this->output->set_header('Content-Type: application/json; charset=utf-8');
    // 表单验证
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
      $this->returnResult(array('添加成功'));
    }else{
      $this->returnResult('写入数据库失败');
    }

    // 参加该翻译项目
    $this->join_project($this->db->insert_id());
  }

  public function join_project($doc_id){
    $participation = array(
      'user_id' => $_SESSION['user']['user_id'],
      'doc_id' => $doc_id,
      'page_path' => '/',
      'role' => 0
    );
    $this->participation_model->insert($participation);
  }
}
