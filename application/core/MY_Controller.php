<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class MY_Controller extends CI_Controller {

  private $not_check = array(
    'welcome-index', 
    'user-login', 
    'user-do_login', 
    'user-do_actice'
  );

  public function __construct() {
      parent::__construct();

      $this->load->model('user_model');

      // token登录
      (!isset($_SESSION['user']) || !$_SESSION['user']) &&
      ($token = get_cookie('user_session')) && 
      ($user = $this->user_model->get_user($token, 'token')) &&
      (time() < $user['token_end_time']) &&
      ($_SESSION['user'] = $user);
      
      // 1.在not_check里
      $class_method = $this->router->class . '-' . $this->router->method;
      if (in_array($class_method, $this->not_check)){
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
}