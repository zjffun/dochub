<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc_model extends MY_Model{
  public $fields = ['doc_id', 'doc_name', 'description', 'tag', 'user_id'];
  public function select_join_ver($where, $type = null){
    // 获取doc
    $result = $this->db->where($where)->limit(1)->get($this->model_table)->row_array();
    if(!$result) return false;
    
    // 获取ver
    $vers = $this->db->where(['doc_id' => $result['doc_id']])->get(self::TBL_VER)->result_array();

    // 处理ver
    $result['vers'] = [];
    $result['default_ver'] = '';
    if ($vers) {
      $result['default_ver'] = $vers[0];
      foreach ($vers as $key => $ver) {
        $result['vers'][$ver['ver_name']] = $ver;
      }
    }
    // var_dump($result);die();
    return $result;
  }
}

