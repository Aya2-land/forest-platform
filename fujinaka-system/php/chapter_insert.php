<?php

	session_start();

	/*ノード情報をDBに格納する際に使用*/
	require("connect_db.php");

  //タイムゾーンの設定
  date_default_timezone_set('Asia/Tokyo');

	$user_id = $_SESSION['USERID'];		//ユーザID
  $map_id = $_SESSION['MAPID'];	//シートID
  $chapter_id = $_POST["id"];				//章ID
	$rank = $_POST["rank"];						//章順番
	$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);

	$sql = "INSERT INTO chapter (chapter_id, user_id, map_id, rank, created_at)
	VALUES ('$chapter_id', '$user_id', '$map_id', '$rank', '$timestamp')";

	$result = $mysqli->query($sql);

	//php($sql)のエラー処理
	if($sql == TRUE){
		;
		error_log('$sql:chapter_insert成功', 0);
	}else if($sql == FALSE){
		error_log($sql.'$sql:chapter_insert失敗', 0);
	}else{
		error_log('$sql:chapter_insert不明なエラー', 0);
	}
	
	//php($result)のエラー処理
	if($result == TRUE){
		
		error_log('$result:chapter_insert成功', 0);
	}else if($result == FALSE){
		error_log($result.'$result:chapter_insert失敗'.$mysqli->error, 0);
	}else{
		error_log('$result:chapter_insert不明なエラー', 0);
	}

?>