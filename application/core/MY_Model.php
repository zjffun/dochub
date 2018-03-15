<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class MY_Model extends CI_Model {
  const TBL_USER = 'user';
  const TBL_DOC = 'doc';
  const TBL_VER = 'ver';
  const TBL_PAGE = 'page';
  const TBL_BROWSE_RECORD = 'browse_record';
  const TBL_PARTICIPATION = 'participation';
  const TBL_COLLECTION = 'collection';

  public function __construct(){
    parent::__construct();

    // 获取当前模型对应的表
    $this->model_table = str_replace('_model', '', strtolower(get_class($this)));
  }

  public function insert($form_data){
    // insert：TRUE on success, FALSE on failure
    return $this->db->insert($this->model_table, $form_data);
  }
  public function replace($form_data){
    // insert：TRUE on success, FALSE on failure
    return $this->db->replace($this->model_table, $form_data);
  }
  public function select($where, $type = null){
    $result = $this->db->where($where)->get($this->model_table);
    switch ($type) {
      case 'row_array':
        return $result->row_array();
        break;
      default:
        return $result->result_array();
        break;
    }
  }

  public function all_docs(){
    return $this->db->get($this->model_table)->result_array();
  }

}