<?php

	session_start();

	/*ノード情報をDBに格納する際に使用*/
	require("connect_db.php");
	date_default_timezone_set('Asia/Tokyo');
	$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
	$sheet_id = $_SESSION['SHEETID'];    //シートID
	
	$send_annotation_id = $_POST["id"]; //nishida
	$start_char_id = $_POST["start_char_id"]; //nishida
	$end_char_id = $_POST["end_char_id"]; //nishida
    // $type = "toi";
    $type = $_POST["type"];
    $paper_content = $_POST["content"];
	$node_id= $_POST["node_id"];
	$sql = "SELECT parent_id FROM nodes WHERE id ='$node_id'";
	$parent_id = $mysqli->query($sql);

	if($result = $mysqli->query($sql)){

		while($row = mysqli_fetch_assoc($result)){
			$parent_id = $row["parent_id"];
		}
	}

	// $sql = "INSERT INTO annotations (id, start_char_id, end_char_id, type, content, created_at, deleted, sheet_id)
	// VALUES ('$send_annotation_id','$start_char_id','$end_char_id','$type','$paper_content', '$timestamp', 0, '.$sheet_id.')";

	$sql = "INSERT INTO annotations (id, start_char_id, end_char_id, type, content, created_at, deleted, sheet_id, node_id, paper_id, parent_id)
	VALUES ('$send_annotation_id','$start_char_id','$end_char_id','$type','$paper_content', '$timestamp', 0, '$sheet_id', '$node_id', '".$_SESSION["PAPERID"]."','$parent_id')";

	$result = $mysqli->query($sql);

    //クエリ($sql)のエラー処理
    if($sql == TRUE){
		echo $parent_id;
		//error_log('$annotation_sql成功しています！'.$timestamp, 0);
	}else if($sql == FALSE){
		error_log($sql.'$annotation_sql失敗です', 0);
		// error_log('失敗しました。'.mysqli_error($link), 0);
	}else{
		error_log('annotation_$sql不明なエラーです', 0);
	}

//php($result)のエラー処理
if($result == TRUE){
		//echo "true";
		//error_log('$result成功しています！'.$timestamp, 0);
	}else if($result == FALSE){
  echo "なんでfalse";
		error_log($result.'$result失敗です'.$mysqli->error, "3", "error_log.txt");
		// error_log('失敗しました。'.mysqli_error($link), 0);
	}else{
		error_log('$result不明なエラーです', 0);
	}

?>