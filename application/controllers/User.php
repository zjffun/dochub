<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class User extends CI_Controller {

  public function __construct(){
    parent::__construct();

    $this->load->library('form_validation');

    $this->load->helper('cookie');

    $this->load->model('user_model');
  }

  public function login()
  {
    $this->load->view('user/login.html');
  }

  public function logout(){
    session_unset();
    redirect('/');
  }

  public function profile(){
    $this->load->view('user/profile.html');
  }

  public function do_login()
  {
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
      
      $result['status'] = false;
      $result['msg'] = 'validation_faild';
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      $result['info'] = $info;
      goto login_failed;
    }
    //账号密码验证
    if ($is_email) {
      $this->form_validation->reset_validation();
      $this->form_validation->set_rules('user_name', '电子邮箱', 'callback_useremail_login_check');
      if ($this->form_validation->run() == false) {
        // 电子邮箱不存在
        $result['status'] = false;
        $result['msg'] = 'validation_faild';
        $info = array();
        foreach ($this->form_validation->error_array() as $key => $value) {
          $info[] = array($key,$value);
        }
        $result['info'] = $info;
        goto login_failed;
      }elseif ($is_email && !($user = $this->user_model->do_login($user_name, $user_pwd, 'email'))){
        //密码错误
        $result['status'] = false;
        $result['msg'] = "password_faild";
        goto login_failed;
      }
    }else{
      if (!$this->user_model->username_check($user_name)){
        // 用户名不存在
        $result['status'] = false;
        $result['msg'] = 'username_faild';
        goto login_failed;
      }
      $user = $this->user_model->do_login($user_name, $user_pwd);
      if ($user){
        $status = $this->user_model->useremail_check($user['user_email']);
        if ($status == 2) {
          // 注册未激活
          $result['msg'] = 'validation_faild';
          $activation_code = $user['activation_code'];
              $useremail = urlencode($user['user_email']);
              $resend_email_url = site_url("user/send_active_email/$activation_code/$useremail");
          $info = array();
          $info[] = array('user_name',"{field}已经注册，但还未激活，<a target='_blank' href='$resend_email_url'>点击这里</a>重新发送激活邮件");
          $result['info'] = $info;
          goto login_failed;
        }
      }else{
        // 密码错误
        $result['status'] = false;
        $result['msg'] = "password_faild";
        goto login_failed;
      }
    }

    
    // 通过所有验证
    $_SESSION['user'] = $user;

    $result['status'] = true;
    unset($user['user_pwd']);
    $result['user_info'] = $user;

    //登录失败返回失败原因
    login_failed:
    echo json_encode($result);
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
