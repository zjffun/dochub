<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Participation_model extends MY_Model{
  public $fields = ['html', 'part_type', 'part_time', 'vote_up', 'vote_down', 'is_default', 'is_publish', 'is_delete', 'user_id', 'page_id'];
}

