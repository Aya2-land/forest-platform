<?php

	session_start();

	/*ノード情報をDBに格納する際に使用*/
	require("connect_db.php");
	date_default_timezone_set('Asia/Tokyo');
	$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);

	$id = $_POST["id"];
	$content = $_POST["content"];
	$paper_title = $_POST["paper_title"];

	$sql = "INSERT INTO papers (id, paper_content, created_at, paper_title) VALUE ('$id','$content','$timestamp', '$paper_title')";
	$result = $mysqli->query($sql);
	echo $sql;
	
?>

