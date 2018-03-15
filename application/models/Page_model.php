<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Page_model extends MY_Model{
  public function get_best($where){
    return $this->db->select('html, part_type')->where($where)->join('participation', 'participation.page_id = page.page_id')->order_by('is_default DESC,(vote_up - vote_down) DESC,part_type ASC')->get($this->model_table)->row_array();
  }
}
