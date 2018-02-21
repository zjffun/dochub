<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Welcome extends MY_Controller {
	public function index()
	{
    $data['css'] = array('index');
    $data['js'] = array('index');
		$this->viewhf('index.html', $data);
	}
}
