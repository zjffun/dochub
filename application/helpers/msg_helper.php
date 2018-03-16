<?php
defined('BASEPATH') OR exit('No direct script access allowed');

if ( ! function_exists('msg_succ'))
{
  function msg_succ($data){
    return_result($data, true);
  }
}

if ( ! function_exists('msg_err'))
{
  function msg_err($data){
    return_result($data, false);
  }
}

if ( ! function_exists('return_result'))
{
  function return_result($data, $status){
    $result = array(
      'status' => $status,
      'data' => $data
    );
    $CI =& get_instance();
    // json
    if (substr($CI->router->method, 0, 3) == 'do_') {
      header("Content-type: application/json");
      echo json_encode($result);
      die();
    }

    // html
    $string = $CI->load->view('common/msg.html', $result, TRUE);
    echo $string;
    die();
  }
}


