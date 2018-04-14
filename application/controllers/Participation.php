<?php
defined('BASEPATH') OR exit('No direct script access allowed');
class Participation extends Doc_Controller {
  public function __construct(){
    parent::__construct();
    $this->load->library('form_validation');
    $this->load->model('doc_model');
    $this->load->model('participation_model');
    $this->load->model('page_model');

    $segments = $this->uri->segments;
    // 文档检查
    $doc = $this->doc_model->select_join_ver(array('doc_name' => $segments[3]), 'row_array');
    !$doc && msg_err(['文档不存在', site_url("doc/init_doc")]);

    // 版本检查
    $ver = isset($segments[4]) ? 
      isset($doc['vers'][$segments[4]]) ? $segments[4] : false : 
      $doc['default_ver'] != '' ? $doc['default_ver']['ver_name'] : false;
    !$ver && msg_err(['版本不存在', site_url("ver/init_ver/{$doc['doc_name']}")]);

    // 生成page_para, page_path
    $page_para = '/' . implode('/', count($segments) > 4 ? array_slice($segments, 4) : []);
    $page_path = "/docs/{$doc['doc_name']}/{$ver}{$page_para}";

    // 页面检查
    $page = $this->page_model->select([
      'ver_id' => $doc['vers'][$ver]['ver_id'], 
      'page_para' => $page_para], 'row_array');
    !$page && msg_err(['页面不存在', site_url("page/init_page/{$doc['doc_name']}/{$ver}")]);

    $doc['page'] = $page;
    $doc['this_ver'] = $doc['vers'][$ver];
    $doc['this_page'] = $page;
    $doc['this_para'] = "/{$doc['doc_name']}/{$doc['this_ver']['ver_name']}{$doc['this_page']['page_para']}";
    $doc['page_path'] = $page_path;

    $this->doc = $doc;
  }

  public function new_part(){
    $this->view_inithf([
      'doc/form_participation.html', 
    ], array(
      'doc' => $this->doc,
      'data' => ["《{$this->doc['doc_name']}》文档的{$this->doc['this_ver']['ver_name']}版本的{$this->doc['this_page']['page_para']}页面的翻译", 
        '新的翻译', 
        site_url("participation/do_new_part{$this->doc['this_para']}")
      ]));
  }

  public function translate(){
    // 整理并翻译
    $this->view_dochf('doc/translate.html', array('js' => ['doc-translate'], 'doc' => $this->doc));
  }

  public function revise(){
    $this->view_dochf('doc/revise.html', ['js' => ['doc-revise'], 'doc' => $this->doc]);
  }

  public function do_new_part(){
    // 表单验证
    $this->form_validation->set_rules('html', 'html', 'required');
    if ($this->form_validation->run() == false) {
      $info = array();
      foreach ($this->form_validation->error_array() as $key => $value) {
        $info[] = array($key,$value);
      }
      msg_err('validation_faild', $info);
    }

    // 写入数据库
    $post_data = $this->input->post($this->participation_model->fields);
    $post_data['page_id'] = $this->doc['this_page']['page_id'];
    $post_data['part_time'] = time();
    $post_data['part_type'] = 'original';
    foreach ($post_data as $key => &$data) {
      if(!$data)  unset($post_data[$key]);
    }
    !$this->participation_model->insert($post_data) && meg_err('写入数据库失败');
    
    msg_succ(site_url("doc/show/{$this->doc['doc_name']}/{$this->doc['this_ver']['ver_name']}{$this->doc['this_page']['page_para']}"));
  }

  public function do_pe(){
    !($type = $this->input->post('type')) && msg_err('未指定type');
    switch($type){
      case 'publish':
        !$this->participation_model->insert(array(
          'user_id' => $_SESSION['user']['user_id'],
          'page_id' => $this->doc['page']['page_id'],
          'html' => $this->input->post('html'),
          'part_type' => 'c&t',
          'part_time' => time()
        )) && msg_err('写入数据库失败');
        msg_succ('发布成功');
        break;
      case 'save':
        !$this->participation_model->replace(array(
          'user_id' => $_SESSION['user']['user_id'],
          'page_id' => $this->doc['page']['page_id'],
          'html' => $this->input->post('html'),
          'part_type' => 'save',
          'part_time' => time()
        )) && msg_err('写入数据库失败');
        msg_succ('保存成功');
        break;
      case 'preview':
        $dir_path = FCPATH . 'temp';
        $html_path = "/index-{$_SESSION['user']['user_id']}-" . time() .".html";
        !is_dir($dir_path) && mkdir($dir_path, 0777, true);
        !file_put_contents($dir_path . $html_path, $this->input->post('html')) && $this->returnResult('写入页面失败');
        msg_succ('temp' . $html_path);
        break;
    }
  }

}