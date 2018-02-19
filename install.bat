CD /d %~dp0
SET cur_path=%~dp0dochub.sql
mysql -uroot -e"source %cur_path%"
PAUSE