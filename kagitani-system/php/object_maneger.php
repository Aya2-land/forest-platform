<?php

	session_start();

	require("connect_db.php");
	date_default_timezone_set('Asia/Tokyo');

	$user_id = $_SESSION['USERID'];      //ユーザID
    $sheet_id = $_SESSION['SHEETID'];    //シートID
	$purpose = $_POST['purpose'];  //記録(record)か，更新(update)か，削除(delete)か

	$result_struct_start_time = $mysqli->query("SELECT MAX(start_time) FROM network_sturuct_activity WHERE user_id = $user_id AND sheet_id = $sheet_id ORDER BY start_time DESC");
	// echo "SELECT MAX(start_time) FROM network_sturuct_activity WHERE user_id = $user_id AND sheet_id = $sheet_id ORDER BY start_time DESC";
	// echo ",  ";

	if ($result_struct_start_time) {
        $row = $result_struct_start_time->fetch_assoc();
        $struct_start_time = $row['MAX(start_time)'];
        echo $struct_start_time;
    } else {
        //echo "Error: " . $mysqli->error;
    }

    $struct_start_time = $row['MAX(start_time)'];  //更新するときの議論内省開始時間

	// echo ",                       ";
	// echo "PHP,";

	if($purpose === 'record'){
		$record_thing = $_POST['record_thing'];  //nodeか，edgeか，ネットワークとマインドマップの繋がり(connection)，オントロジーとのつながり(ontology)，採用不採用(recruit)
		//目標ノードの記録
		if($record_thing === 'node'){
			$object_node_id = $_POST["node_id"]; //ノードID
			//$label = $_POST["label"];    //ラベル
			$x = $_POST["x"];  //x座標
			$y = $_POST["y"];  //y座標
			$object_nodes_type_id = 0;
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$sql = $mysqli->query("INSERT INTO object_nodes(object_node_id, object_map_id, label, x, y, object_nodes_type_id, created_at, updated_at, deleted) 
                    VALUES ('$object_node_id', '$sheet_id', 'NewNodes', '$x', '$y', '$object_nodes_type_id', '$timestamp', '$timestamp', 0)");
            //echo $sql; // 生成されたSQL文を表示

            // クエリを実行
            // if ($mysqli->query($sql)) {
            //     echo "PHP, 目標ノード追加成功"; // 成功メッセージ
            // } else {
            //     echo "エラー: " . $mysqli->error; // エラーメッセージ
            // }
		}else if($record_thing === 'edge'){
			//エッジの記録
			$edge_start = $_POST["edge_start"];          //エッジ開始
			$edge_end = $_POST["edge_end"];              //エッジ終了
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO network_edges_activity (user_id, sheet_id, edge_start, edge_end, time)
			                VALUES ('$user_id', '$sheet_id', '$edge_start', '$edge_end', '$timestamp')");
		}else if($record_thing === 'connection'){
			$networknodeid = $_POST["networknodeid"];   //ネットワークのID
			$mindmapnodeid = $_POST["mindmapnodeid"];  //マインドマップのID
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query($sql = "INSERT INTO network_mindmap_connect(user_id, sheet_id, network_node_id, mindmap_node_id, time)
			               VALUES ('$user_id', '$sheet_id', '$networknodeid', '$mindmapnodeid', '$timestamp')");
		}else if($record_thing === 'ontology'){
			$node_id = $_POST["node_id"];             //ノードID
			$ontology_node_id = $_POST["ontology_node_id"];    //オントロジーノードのノードID
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO network_ontology_activity (user_id, sheet_id, ontology_id, node_id, time)
			               VALUES ('$user_id', '$sheet_id', '$ontology_node_id', '$node_id', '$timestamp')");
		}else if($record_thing === 'recruit'){
			$node_id = $_POST["node_id"];             //ノードID
			$result_recruit = $_POST["result_recruit"];
			$ontology_node = $_POST["ontology_node"];
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO network_recruit (user_id, sheet_id, node_id, ontology_id, result_recruit, time)
			               VALUES ('$user_id', '$sheet_id', '$node_id', '$ontology_node', '$result_recruit', '$timestamp')");
		}else if($record_thing === 'material_edge'){
			$edge_start = $_POST["edge_start"];          //エッジ開始
			$edge_end = $_POST["edge_end"];              //エッジ終了
			$edge_label = $_POST['edge_label'];
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO network_edges_activity (user_id, sheet_id, edge_start, edge_end, edge_label, time)
			                VALUES ('$user_id', '$sheet_id', '$edge_start', '$edge_end', '$edge_label', '$timestamp')");
		}else if($record_thing === 'reflectioncontent'){
			$node_id = $_POST["node_id"];
			$text = $_POST["text"];
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("UPDATE network_recruit SET reason = '$text'
			WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND node_id = '$node_id' AND time >= '$struct_start_time'");
		}
	}else if($purpose === 'update'){
		$update_thing = $_POST['update_thing'];
		if($update_thing === 'node'){
			$select_update = $_POST['select_update'];   //ノードの変更するもの(座標(point),内容(label))
			$node_id = $_POST["node_id"]; //ノードID
			$node_update_thing1 = $_POST['node_update_thing1'];
			$node_update_thing2 = $_POST['node_update_thing2'];
			if($select_update === 'point'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE c SET x = '$node_update_thing1', y = '$node_update_thing2', updated_at = '$timestamp' 
				                WHERE user_id = '$user_id' AND object_map_id = '$sheet_id' AND object_node_id = '$node_id' ");
			}else if($select_update === 'label'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_nodes SET label = '$node_update_thing1', updated_at = '$timestamp' 
				WHERE user_id = '$user_id' AND object_map_id = '$sheet_id' AND object_node_id = '$node_id' ");
			}
		}

	}else if($purpose === 'delete'){
		$delete_thing = $_POST['delete_thing'];
		if($delete_thing === 'node'){
			$node_id = $_POST["node_id"];
			$mysqli->query("DELETE FROM object_nodes WHERE user_id = '$user_id' AND object_map_id = '$sheet_id' AND object_node_id = '$node_id' ");
		}else if($delete_thing === 'edge'){
			$edge_start = $_POST["edge_start"];          //エッジ開始
			$edge_end = $_POST["edge_end"]; 
			if($edge_start === ""){
				$mysqli->query("DELETE FROM network_edges_activity WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND edge_end = '$edge_end' AND time >= '$struct_start_time'");
			}else if($edge_end === ""){
				$mysqli->query("DELETE FROM network_edges_activity WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND edge_start = '$edge_start' AND time >= '$struct_start_time'");
			}else{
				$mysqli->query("DELETE FROM network_edges_activity WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND edge_start = '$edge_start' AND edge_end = '$edge_end' AND time >= '$struct_start_time'");
			}
		}else if($delete_thing === 'connection'){
			$node_id = $_POST["node_id"];
			$result1 = $mysqli->query("DELETE FROM network_ontology_activity WHERE node_id = '$node_id' AND time > '$struct_start_time'");
			$result2 = $mysqli->query("DELETE FROM network_mindmap_connect WHERE network_node_id = '$node_id' AND time > '$struct_start_time'");
		}
	}

	

	//時間設定はいる
	
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
    $result = $sql;
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