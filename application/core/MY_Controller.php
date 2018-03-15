<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc_Controller extends MY_Controller {
  public function __construct() {
      parent::__construct();
      $this->load->model('doc_model');
  }

  protected function view_dochf($view, $data = array()) {
      $this->load->view('common/doc_header.html', $data);
      $this->load->view($view);
      $this->load->view('common/doc_footer.html');
  }


  protected function get_show_page($ver_id, $page_para){
    return $this->page_model->get_best([
      'ver_id' => $ver_id,
      'page_para' => $page_para
    ]);
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