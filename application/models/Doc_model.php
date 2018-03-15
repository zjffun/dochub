<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Doc_model extends MY_Model{
  public function select_join_ver($where, $type = null){
    // 获取doc
    $result = $this->db->where($where)->get($this->model_table)->row_array();
    if(!$result) return false;
    
    // 获取ver
    $vers = $this->db->where(['doc_id' => $result['doc_id']])->get(self::TBL_VER)->result_array();

    // 处理ver
    $result['vers'] = [];
    $result['default_ver'] = '';
    foreach ($vers as $key => $ver) {
      $result['vers'][$ver['ver_name']] = $ver;
      if ($ver['is_default'] == 'true' && $result['default_ver'] == '') {
        $result['default_ver'] = $ver['ver_name'];
      }
    }

    //var_dump($result);die();
    return $result;
  }
}

