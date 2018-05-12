<?php
$config['full_tag_open'] = '<ul class="pagination justify-content-end">';
// 起始标签放在所有结果的左侧。
$config['full_tag_close'] = '</ul>';
// 结束标签放在所有结果的右侧。


$config['first_link'] = FALSE;
// 左边第一个链接显示的文本，如果你不想显示该链接，将其设置为 FALSE 。
$config['first_tag_open'] = '<div>';
// 第一个链接的起始标签。
$config['first_tag_close'] = '</div>';
//第一个链接的结束标签。
$config['first_url'] = '';
//可以为第一个链接设置一个自定义的 URL 。


$config['last_link'] = FALSE;
//右边最后一个链接显示的文本，如果你不想显示该链接，将其设置为 FALSE 。
$config['last_tag_open'] = '<div>';
//最后一个链接的起始标签。
$config['last_tag_close'] = '</div>';
//最后一个链接的结束标签。


$config['next_link'] = '&raquo;';
//下一页链接显示的文本，如果你不想显示该链接，将其设置为 FALSE 。
$config['next_tag_open'] = '<li class="page-item">';
//下一页链接的起始标签。
$config['next_tag_close'] = '
</li>';
//下一页链接的结束标签。


$config['prev_link'] = '&laquo;';
// 上一页链接显示的文本，如果你不想显示该链接，将其设置为 FALSE 。
$config['prev_tag_open'] = '<li class="page-item">';
// 上一页链接的起始标签。
$config['prev_tag_close'] = '</li>';
// 上一页链接的结束标签。



$config['cur_tag_open'] = '<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1">';
// 当前页链接的起始标签。
$config['cur_tag_close'] = '</a></li>';
// 当前页链接的结束标签。

$config['num_tag_open'] = '<li class="page-item">';
// 数字链接的起始标签。
$config['num_tag_close'] = '</li>';
// 数字链接的结束标签。

$config['attributes'] = array('class' => 'page-link');