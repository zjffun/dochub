<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc_Controller extends MY_Controller {
  public function __construct() {
    parent::__construct();
    $this->load->model('doc_model');

    // 初始化变量
    $segments = $this->uri->segments;
    $this->doc_name = isset($segments[3]) ? $segments[3] : false;
    $this->ver_name = isset($segments[4]) ? $segments[4] : false;
    $this->page_para = '/' . implode('/', count($segments) > 4 ? array_slice($segments, 4) : []);
    $this->page_seg = '';
  }

  protected function view_dochf($view, $data = array()) {
      $data['doc'] = $this->doc;
      $this->load->view('common/doc_header.html', $data);
      $this->load->view($view);
      $this->load->view('common/doc_footer.html');
  }

  protected function view_inithf($views, $data = array()) {
      $data['js'][] = 'doc-init';
      $this->load->view('common/header.html', $data);
      $this->load->view('doc/init_header.html');
      foreach ($views as $key => $view) {
        $this->load->view($view);
      }
      $this->load->view('doc/init_footer.html');
      $this->load->view('common/footer.html');
  }

  protected function get_show_page($ver_id, $page_para){
    return $this->page_model->get_best([
      'ver_id' => $ver_id,
      'page_para' => $page_para
    ]);
  }

  // 一：文档检查
  protected function check_doc_name(){
    !($this->doc = $this->doc_model->select_join_ver(array('doc_name' => $this->doc_name), 'row_array')) && msg_err(['文档不存在', site_url("doc/init_doc")]);
    $this->doc['page_seg'] = $this->page_seg = '/' . $this->doc_name;
  }

  // 二：版本检查
  protected function check_ver(){
    // 参数有版本名并且版本名存在就用该版本，否则用默认版本
    !($this->doc['this_ver'] = $this->ver_name && isset($doc['vers'][$this->ver_name]) ? $doc['vers'][$this->ver_name] : $this->doc['default_ver']) && msg_err(['版本不存在', site_url("ver/init_ver{$this->page_seg}")]);
    $this->ver_name = $this->doc['this_ver']['ver_name'];
    $this->doc['page_seg'] = $this->page_seg .= '/' . $this->ver_name;
  }

  // 三：页面检查
  protected function check_page_para(){
    !($this->doc['this_page'] = $this->page_model->select([
      'ver_id' => $this->doc['this_ver']['ver_id'], 
      'page_para' => $this->page_para 
      ], 'row_array')) && msg_err(['页面不存在', site_url("page/init_page{$this->page_seg}")]);
    $this->doc['page_seg'] = $this->page_seg .= $this->page_para;
  }

  protected function create_page_path(){
    return $this->doc['page_path'] = "/docs{$this->page_seg}" . ($this->page_para == '/' ? '' : '/');
  }
}

class MY_Controller extends CI_Controller {
  public function __construct() {
      parent::__construct();

      $this->load->model('user_model');

      // token登录
      (!isset($_SESSION['user']) || !$_SESSION['user']) &&
      ($token = get_cookie('user_session')) && 
      ($user = $this->user_model->get_user($token, 'token')) &&
      (time() < $user['token_end_time']) &&
      ($_SESSION['user'] = $user);
      
      // 1.判断not_check
      // 设置了not_check 且 （当not_check[0]为* ? !method不在not_check中 : method在not_check中）
      if (isset($this->not_check) && 
        ($this->not_check[0] === '*' ? 
          !in_array('!'.$this->router->method, $this->not_check) : 
          in_array($this->router->method, $this->not_check)
        )){
        return;
      }
      // 2.已经登录
      if (isset($_SESSION['user']) && $_SESSION['user']) {
        return;
      }
      
      //条件都不满足去登录
      redirect('/user/login');
  }

  protected function returnResult(...$para) {
    header("Content-type: application/json");
    echo json_encode($this->generateResult($para));
    die();
  }

  protected function msgpage(...$para){
    $string = $this->load->view('common/msg.html', ['msg' => $para], TRUE);
    echo $string;
    die();
  }

  protected function generateResult($para){
    // $para[0]是数组返回成功结果
    if (is_array($para[0])) {
      return array('status' => true, 'data' => $para[0]);
    }
    // $para[0]是字符串返回失败结果
    if (is_string($para[0])) {
      return (isset($para[1])) ? array('status' => false, 'msg' => $para[0], 'data' => $para[1]) : array('status' => false, 'msg' => $para[0]);
    }
    return array('status' => false, 'msg' => '生成结果是参数错误');
  }

  protected function viewhf($view, $data = array()) {
      $this->load->view('common/header.html', $data);
      $this->load->view($view);
      $this->load->view('common/footer.html');
  }

  protected function view_dochf($view, $data = array()) {
      $this->load->view('common/doc_header.html', $data);
      $this->load->view($view);
      $this->load->view('common/doc_footer.html');
  }
}