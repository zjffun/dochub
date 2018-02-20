<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class MY_Controller extends CI_Controller {

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

}
