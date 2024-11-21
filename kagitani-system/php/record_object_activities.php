<?php

	session_start();

	/*ノード情報をDBに格納する際に使用*/
	require("connect_db.php");

    //タイムゾーンの設定
    date_default_timezone_set('Asia/Tokyo');

    // フォームからデータを取得
	$primary_id = $_POST["primary"];     //primary_id
	$object_node_id = $_POST["object_node_id"];
    $object_activity_id = uniqid('activity_', true);// オブジェクトアクティビティIDの生成
	$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);

	//timestampを定義しようと思ったらエラーが出てくる．
	$sql = "INSERT INTO object_activities (object_activity_id, object_node_id, activity_id) 
				VALUES ('$object_activity_id', '$object_node_id', '$primary_id')";


	$result = $mysqli->query($sql);


    //クエリ($sql)のエラー処理
    if($sql == TRUE){
			echo "true";
			error_log('$sql成功しています！'.$timestamp, 0);
		}else if($sql == FALSE){
			error_log($sql.'$sql失敗です', 0);
			// error_log('失敗しました。'.mysqli_error($link), 0);
		}else{
			error_log('$sql不明なエラーです', 0);
		}

    //php($result)のエラー処理
    if($result == TRUE){
			echo "true";
			error_log('$result成功しています！'.$timestamp, 0);
		}else if($result == FALSE){
			error_log($result.'$result失敗です'.$mysqli->error, 0);
			// error_log('失敗しました。'.mysqli_error($link), 0);
		}else{
			error_log('$result不明なエラーです', 0);
		}


?>
