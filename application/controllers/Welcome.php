<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends MY_Controller {
  public function __construct(){
    $this->not_check = array(
      'index'
    );
    parent::__construct();
  }
	public function index()
	{
    $data['css'] = array('index');
    $data['js'] = array('index');
		$this->viewhf('index.html', $data);
	}
}
