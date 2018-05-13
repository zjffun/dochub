<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class User_model extends MY_Model{

	/*
	*$method：id（默认）、email或name
	*/
	public function get_user($user, $method = 'id'){
		if ($method == 'id') {
			return $this->db->where(array('user_id' => $user))->get(self::TBL_USER)->row_array();
		}elseif($method == 'email'){
			return $this->db->where(array('user_email' => $user))->get(self::TBL_USER)->row_array();
		}elseif($method == 'name'){
			return $this->db->where(array('user_name' => $user))->get(self::TBL_USER)->row_array();
		}elseif($method == 'token'){
			return $this->db->where(array('token' => $user))->get(self::TBL_USER)->row_array();
		}
	}

	public function set_token($user_id, $token, $end_time){
		return $this->db->update(self::TBL_USER, array(
			'token' => $token, 
			'token_end_time' => $end_time
		), "user_id = $user_id", 1);
	}

	public function get_my_common_docs($user_id){
		return $this->db
			->select('doc_name, description')
			->where(self::TBL_BROWSE_RECORD . '.user_id',$user_id)
			->join(self::VIEW_DOC_VER_PAGE, self::VIEW_DOC_VER_PAGE . '.page_id = ' . self::TBL_BROWSE_RECORD . '.page_id', 'left')
			->group_by('doc_id')
			->order_by('browse_times', 'DESC')
			->get(self::TBL_BROWSE_RECORD)
			->result_array();
	}
	public function get_my_participation($user_id){
		return $this->db
			->select('doc_name, description, count(1) as count')
			->where(self::TBL_PARTICIPATION . '.user_id',$user_id)
			->join(self::TBL_DOC, self::TBL_DOC . '.doc_id = ' . self::TBL_PARTICIPATION . '.doc_id', 'left')
			->group_by(self::TBL_DOC . '.doc_id')
			->order_by('count', 'DESC')
			->get(self::TBL_PARTICIPATION)
			->result_array();
	}
	public function get_my_collection($user_id){
		return $this->db
			->select('doc_name, description')
			->where(self::TBL_COLLECTION . '.user_id',$user_id)
			->join(self::TBL_DOC, self::TBL_DOC . '.doc_id = ' . self::TBL_COLLECTION . '.doc_id', 'left')
			->order_by('collect_time', 'DESC')
			->get(self::TBL_COLLECTION)
			->result_array();
	}
	

	/**
	查询用户名是否存在，存在返回true，否则返回false
	*/
	public function username_check($username){
		return $this->db->where('user_name',$username)->get(self::TBL_USER)->row() ? true : false;
	}

	/**
	*查询邮箱是否存在
	*不存在返回0，
	*存在返回1，
	*注册后未激活小于一天返回2
	*/
	public function useremail_check($useremail){
		$user = $this->db->where('user_email', $useremail)->get(self::TBL_USER)->row_array();
		
		if ($user == null)
			//不存在
			return 0;
		elseif ($user['activation_code'] == '0')
			//存在，激活
			return 1;
		else
			//存在，未激活
			return 2;	
	}
}

