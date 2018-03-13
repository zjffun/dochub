<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Participation_model extends MY_Model{
  public function get_best($where){
    return $this->db->select('page_html')->where($where)->order_by('is_default DESC, (vote_up - vote_down) DESC')->get($this->model_table)->row_array();
  }
}

