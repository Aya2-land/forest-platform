<?php

	session_start();

	require("connect_db.php");
	date_default_timezone_set('Asia/Tokyo');

	$user_id = $_SESSION['USERID'];      //ユーザID
	$purpose = $_POST['purpose'];  //記録(record)か，更新(update)か，削除(delete)か

    if($purpose === 'record'){
		$record_thing = $_POST['record_thing'];  //nodeか，edgeか，ネットワークとマインドマップの繋がり(connection)，オントロジーとのつながり(ontology)，採用不採用(recruit)
		//目標ノードの記録
		if($record_thing === 'node'){
			$logic_node_id = $_POST["node_id"]; //ノードID
            $x = $_POST["x"];
            $y = $_POST["y"];
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$sql = $mysqli->query("INSERT INTO yamashita(logic_node_id, label, x, y, created_at) VALUES ('$logic_node_id', 'NewNodes', $x, $y, '$timestamp')");
        }
    }
?>