<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class User_model extends MY_Model{

	/*
	*$method：username（默认）或email
	*/
	public function do_login($user_name, $user_pwd, $method = 'username'){
		$user_pwd = md5($user_pwd);
		if ($method == 'username') {
			return $this->db->where(array('user_name' => $user_name, 'user_pwd' => $user_pwd))->get(self::TBL_USER)->row_array();
		}elseif($method == 'email'){
			return $this->db->where(array('user_email' => $user_name, 'user_pwd' => $user_pwd))->get(self::TBL_USER)->row_array();
		}
		
	}


	public function get_my_common_docs($user_id){
		return $this->db
			->select('doc_name, description')
			->where(self::TBL_BROWSE_RECORD . '.user_id',$user_id)
			->join(self::TBL_DOCS, self::TBL_DOCS . '.doc_id = ' . self::TBL_BROWSE_RECORD . '.doc_id', 'left')
			->order_by('browse_times', 'DESC')
			->get(self::TBL_BROWSE_RECORD)
			->result_array();
	}
	public function get_my_participation($user_id){
		return $this->db
			->select('doc_name, description, count(1) as count')
			->where(self::TBL_PARTICIPATION . '.user_id',$user_id)
			->join(self::TBL_DOCS, self::TBL_DOCS . '.doc_id = ' . self::TBL_PARTICIPATION . '.doc_id', 'left')
			->group_by(self::TBL_DOCS . '.doc_id')
			->order_by('count', 'DESC')
			->get(self::TBL_PARTICIPATION)
			->result_array();
	}
	public function get_my_collection($user_id){
		return $this->db
			->select('doc_name, description')
			->where(self::TBL_COLLECTION . '.user_id',$user_id)
			->join(self::TBL_DOCS, self::TBL_DOCS . '.doc_id = ' . self::TBL_COLLECTION . '.doc_id', 'left')
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
	*不存在或注册后未激活大于一天返回0，
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
		elseif ($user['user_regist_time'] > time()+24*60*60)
			//存在，未激活，大于一天
			return 0;
		else
			//存在，未激活，小于一天
			return 2;	
	}
}

