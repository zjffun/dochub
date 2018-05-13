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

  const VIEW_DOC_VER_PAGE = 'doc_ver_page';
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
  public function selectPage($start, $length, $where = null){
    // get(表, 取多少, 开始)
    if($where){
      return $this->db->where($where)->get($this->model_table, $length, $start)->result_array();
    }else{
      return $this->db->get($this->model_table, $length, $start)->result_array();
    }
    
  }
  public function countAll(){
    // count_all：获取记录总数
    return $this->db->count_all($this->model_table);
  }
  public function countAllFiltered($where = null){
    if($where){
      return $this->db->select('count(1) as count')->where($where)->get($this->model_table)->row()->count;
    }else{
      return $this->db->select('count(1) as count')->get($this->model_table)->row()->count;
    }
  }
  public function all_docs(){
    return $this->db->get($this->model_table)->result_array();
  }

}