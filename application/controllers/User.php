<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends MY_Controller {
  public function __construct(){
    $this->not_check = array(
      'login', 
      'do_login', 
      'do_actice'
    );
    parent::__construct();

    $this->load->library('form_validation');

    $this->load->model('user_model');
  }

  public function login(){
    $this->load->view('user/login.html');
  }

  public function logout(){
    session_unset();
    delete_cookie('user_session');
    redirect('/');
  }

  public function profile(){
    $data['js'] = array('user-profile');
    $this->viewhf('user/profile.html', $data);
  }

  public function do_login(){
    $user_name = $this->input->post('user_name',true);
    $user_pwd = $this->input->post('user_pwd',true);
    $is_remember = $this->input->post('is_remember',true);
    $is_email = false;
    $email_reg = '/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/';
    if(preg_match($email_reg, $user_name)){
      //是邮箱
      $is_email = true;
    }
    
    //表单验证
    $this->form_validation->set_rules('user_name', '用户名', 'required');
    $this->form_validation->set_rules('user_pwd', '密码', 'required');

    $this->output->set_header('Content-Type: application/json; charset=utf-8');
    // 表单验证
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      $this->returnResult('validation_faild', $info);
    }

    // 获取用户
    if ($is_email) {
      // 根据邮箱获取
      $this->form_validation->reset_validation();
      // 邮箱状态
      $this->form_validation->set_rules('user_name', '电子邮箱', 'callback_useremail_login_check');
      if ($this->form_validation->run() == false) {
        $info = array();
        foreach ($this->form_validation->error_array() as $key => $value) {
          $info[] = array($key,$value);
        }
        $this->returnResult('validation_faild', $info);
      }
      // 获取用户
      $user = $this->user_model->get_user($user_name, 'email');
    }else{
      // 根据用户名获取
      // 用户名状态
      if (!$this->user_model->username_check($user_name)){
        $this->returnResult('username_faild');
      }
      // 获取用户
      $user = $this->user_model->get_user($user_name, 'name');
    }

    // 验证密码
    if (!hash_equals($user['user_pwd'], crypt($user_pwd, $user['user_pwd']))){
      $this->returnResult('password_faild');
    }
  
    // 通过所有验证
    $_SESSION['user'] = $user;
    
    // 自动登录
    if ($is_remember == 'on') {
      $token = RandomToken();
      $end_time = time() + 14*24*60*60;
      if($this->user_model->set_token($user['user_id'], $token, $end_time)){
        $_SESSION['user']['token'] = $token;
        $_SESSION['user']['token_end_time'] = $end_time;
        set_cookie('user_session', $token, 14*24*60*60);
      }else{
        $this->returnResult('设置cookie失败！');
      }
    }

    $this->returnResult(array());
  }

  public function get_user(){
    $user = $_SESSION['user'];
    unset($user['user_pwd']);
    unset($user['token']);
    unset($user['token_end_time']);
    $this->returnResult($user);
  }
  public function get_my_common_docs(){
    $this->returnResult($this->user_model->get_my_common_docs($_SESSION['user']['user_id']));
  }
  public function get_my_collection(){
    $this->returnResult($this->user_model->get_my_collection($_SESSION['user']['user_id']));
  }
  public function get_my_participation(){
    $this->returnResult($this->user_model->get_my_participation($_SESSION['user']['user_id']));
  }

  /*激活用户*/
  public function do_actice($activation_code){
    if ($user = $this->user_model->do_actice($activation_code)) {
      //激活成功，前往主页
      $_SESSION['user'] = $user;
      redirect('/');
    }else{
      //激活失败，提示是否重新发送验证邮件
      echo "激活失败，提示是否重新发送验证邮件";
    }
  }

  public function username_check($username){
    if($this->user_model->username_check($username))
    {
      $this->form_validation->set_message('username_check', '用户名已经存在');
      return FALSE;
    }
    else
    {
      return TRUE;
    }
  }

  public function useremail_login_check($useremail){
    $status = $this->user_model->useremail_check($useremail);
    switch ($status) {
      case 0:
        $this->form_validation->set_message('useremail_login_check', "{field}未注册，<a href=''>点击这里</a>注册");
        return FALSE;
        break;
      case 1:
        return TRUE;
        break;
      case 2:
        $activation_code = $this->user_model->get_activation_code($useremail);
        $useremail = urlencode($useremail);
        $resend_email_url = site_url("user/send_active_email/$activation_code/$useremail");
        $this->form_validation->set_message('useremail_login_check', "{field}已经注册，但还未激活，<a target='_blank' href='$resend_email_url'>点击这里</a>重新发送激活邮件");
        return FALSE;
        break;
    }
  }

}
