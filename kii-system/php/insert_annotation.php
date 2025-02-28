<?php

	session_start();

	/*ノード情報をDBに格納する際に使用*/
	require("connect_db.php");
	date_default_timezone_set('Asia/Tokyo');
	$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
	$map_id = $_SESSION['MAPID'];    //シートID
	
	$send_annotation_id = $_POST["id"]; //nishida
	$start_char_id = $_POST["start_char_id"]; //nishida
	$end_char_id = $_POST["end_char_id"]; //nishida
    // $type = "toi";
    $type = $_POST["type"];
    $paper_content = $_POST["content"];
	$node_id= $_POST["node_id"];


	$sql = "INSERT INTO paper_annotations (annotation_id, node_id, start_char_id, end_char_id, content, created_at, deleted)
		VALUES ('$send_annotation_id', '$node_id', '$start_char_id','$end_char_id', '$paper_content', '$timestamp', 0 )";

	$result = $mysqli->query($sql);

    //クエリ($sql)のエラー処理
    if($mysqli->error){
		echo "Error annnotations error: ".$mysqli->error;
		//error_log('$annotation_sql成功しています！'.$timestamp, 0);
	}

?>