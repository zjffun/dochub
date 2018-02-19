/*********************************************************************************
 * dochub的数据库
 *-------------------------------------------------------------------------------
 * 版权所有: dochub
***********************************************************************************/

#不设置编码cmd下中文会乱码
SET NAMES utf8;
#删除原来的kcy库
DROP DATABASE IF EXISTS dochub;
#创建kcy库
CREATE DATABASE dochub CHARSET utf8;
GRANT ALL ON dochub.* to 'dochub'@'%' IDENTIFIED BY '123456';
GRANT ALL ON dochub.* to 'dochub'@'localhost' IDENTIFIED BY '123456';
FLUSH PRIVILEGES;
SET NAMES utf8;
USE dochub;
/*-----------------创建表-----------------*/
#用户表
CREATE TABLE user (
 user_id mediumint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
 user_email varchar(64) NOT NULL COMMENT '用户EMAIL地址',
 user_pwd varchar(32) NOT NULL COMMENT '用户密码',
 user_name varchar(32) COMMENT '用户名',
 user_phone char(16)  COMMENT '用户手机号码0086-188xxxxxxxx',
 user_bio varchar(255) COMMENT '用户个人简介',
 user_address varchar(255) COMMENT '用户地址',
 user_regist_time timestamp NOT NULL COMMENT '注册时间，邮箱激活后为激活时间',
 activation_code char(27) NOT NULL COMMENT '激活码',
 PRIMARY KEY (user_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


#文档表
CREATE TABLE docs (
 doc_id mediumint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文档ID',
 doc_name varchar(64) NOT NULL COMMENT '文档名',
 description varchar(1024) COMMENT '文档简介',
 PRIMARY KEY (doc_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

#用户参与翻译文档表
CREATE TABLE participation (
 user_id mediumint UNSIGNED NOT NULL COMMENT '用户ID',
 doc_id mediumint UNSIGNED NOT NULL COMMENT '文档ID',
 page_path varchar(255) NOT NULL COMMENT '页面路径',
 role tinyint NOT NULL COMMENT '角色:0为参与mark，1为翻译者，2为校对者，3为整理者'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

#浏览记录表
CREATE TABLE browse_record (
 user_id mediumint UNSIGNED NOT NULL COMMENT '用户ID',
 doc_id mediumint UNSIGNED NOT NULL COMMENT '文档ID',
 browse_times int NOT NULL COMMENT '浏览次数',
 last_browse_time timestamp NOT NULL COMMENT '上次浏览时间'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*-----------------插入数据-----------------*/
INSERT INTO user 
(user_id, user_email, user_name, user_pwd, user_regist_time, activation_code) 
VALUES 
(0, 'admin@163.com', 'admin',MD5('123456'), now(), '0');

INSERT INTO docs 
(doc_id, doc_name, description) 
VALUES 
(1,"bootstrap","The most popular front-end framework for developing responsive, mobile first projects on the web."),
(2,"react","React is a JavaScript library for building user interfaces."),
(3,"react-dom","The entry point of the DOM-related rendering paths. It is intended to be paired with the isomorphic React, which is shipped as react to npm."),
(4,"vue","Simple, Fast & Composable MVVM for building interactive interfaces"),
(5,"d3","A JavaScript visualization library for HTML and SVG."),
(6,"angular.js","AngularJS is an MVC framework for building web applications. The core features include HTML enhanced with custom component and data-binding capabilities, dependency injection and strong focus on simplicity, testability, maintainability and boiler-plate reduction."),
(7,"angular-touch","AngularJS module for touch events and helpers for touch-enabled devices"),
(8,"angular-sanitize","AngularJS module for sanitizing HTML"),
(9,"angular-resource","AngularJS module for interacting with RESTful server-side data sources");

INSERT INTO browse_record 
(user_id, doc_id, browse_times, last_browse_time) 
VALUES 
(0, 1, 3, now()),
(0, 2, 3, now()),
(0, 3, 3, now()),
(0, 4, 3, now());

INSERT INTO participation 
(user_id, doc_id, page_path, role) 
VALUES 
(0, 1, '/index.html', 1),
(0, 2, '/', 0),
(0, 3, '/', 0),
(0, 4, '/', 0);




