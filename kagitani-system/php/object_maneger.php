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
			$object_map_id = $_POST["object_map_id"];
			//$label = $_POST["label"];    //ラベル
			$x = $_POST["x"];  //x座標
			$y = $_POST["y"];  //y座標
			$object_nodes_type = "goal";
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$sql = $mysqli->query("INSERT INTO object_nodes(object_node_id, object_map_id, label, x, y, object_nodes_type, created_at, updated_at, deleted) 
                    VALUES ('$object_node_id', '$object_map_id', 'NewNodes', '$x', '$y', '$object_nodes_type', '$timestamp', '$timestamp', 0)");
		//手順ノードの記録
		}else if($record_thing === 'step'){
			$object_node_id = $_POST["node_id"]; //ノードID
			$object_map_id = $_POST["object_map_id"];
			//$label = $_POST["label"];    //ラベル
			$x = $_POST["x"];  //x座標
			$y = $_POST["y"];  //y座標
			$object_nodes_type = "step";
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			// SQL 文を文字列として定義
			$sql = "INSERT INTO object_nodes(object_node_id, object_map_id, label, x, y, object_nodes_type, created_at, updated_at, deleted) 
			VALUES ('$object_node_id', '$object_map_id', 'NewNodes', '$x', '$y', '$object_nodes_type', '$timestamp', '$timestamp', 0)";

			// クエリを実行
			if ($mysqli->query($sql)) {
			echo "PHP, 手順ノード追加成功"; // 成功メッセージ
			} else {
			echo "エラー: " . $mysqli->error; // エラーメッセージ
			}

		}else if($record_thing === 'edge'){
			//エッジの記録
			$object_edges_id = uniqid('edge_', true); // edge_で始まる一意のIDを生成
			$object_map_id = $_POST["object_map_id"];
			$edge_start = $_POST["edge_start"];          //エッジ開始
			$edge_end = $_POST["edge_end"];              //エッジ終了
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO object_edges(object_edges_id, edge_start, edge_end, time, object_map_id)
			                VALUES ('$object_edges_id', '$edge_start', '$edge_end', '$timestamp','$object_map_id')");
		}else if($record_thing === 'reflection'){
			//内省の記録
			$object_reflection_id = uniqid('reflection_', true); // edge_で始まる一意のIDを生成
			$object_node_id = $_POST["object_node_id"]; 
			$object_map_id = $_POST["object_map_id"];
			$action_reason = $_POST["action_reason"];   
			$completion_reason = $_POST["completion_reason"];     
			$challenges_learnings = $_POST["challenges_learnings"];                //エッジ終了
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO `object_node_reflections`(`object_reflection_id`, `object_node_id`, 
														`action_reason`, `completion_reason`, `challenges_learnings`, `object_map_id`,`created_at`, `updated_at`) 
									VALUES ('$object_reflection_id','$object_node_id','$action_reason','$completion_reason','$challenges_learnings','$object_map_id','$timestamp','$timestamp')");
			$mysqli->query("UPDATE object_nodes SET action_reason = '$action_reason', completion_reason = '$completion_reason',challenges_learnings = '$challenges_learnings',updated_at = '$timestamp' 
				WHERE  object_node_id = '$object_node_id' ");
		}else if($record_thing === 'map'){
			// マップの記録
			$object_map_id = $_POST["object_map_id"];  // ユニークなIDを生成
			$goalContent = $_POST["goalContent"];   // 目標内容を受け取る
			$timeString = $_POST["timeString"];     // 時間を受け取る
			$startDate = $_POST["startDate"]; 
			$endDate = $_POST["endDate"]; 
		
			// データの確認
			var_dump($goalContent);  // goalContent の確認
			var_dump($timeString);   // timeString の確認
		
			// SQLクエリ
			$query = "INSERT INTO object_maps(object_map_id,label, map_id, created_at, updated_at, start_date, end_date, deleted,memo)
					  VALUES ('$object_map_id','$goalContent' , null, '$timeString', '$timeString','$startDate','$endDate', 0, 'メモがありません')";
		
			// SQLクエリの確認
			echo "実行するSQLクエリ: " . $query . "<br>";
		
			// クエリの実行
			if (!$mysqli->query($query)) {
				// エラーハンドリング
				echo "SQLエラー: " . $mysqli->error . "<br>";
				echo "エラーコード: " . $mysqli->errno . "<br>";
			} else {
				echo "データが正常に挿入されました<br>";
			}
		}else if($record_thing === 'memo'){
			$object_map_id = $_POST["object_map_id"];          //エッジ開始
			$memo = $_POST["memo"];            //エッジ終了
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO `object_maps`(`object_map_id`, `updated_at`, `memo`) 
									VALUES ('$object_map_id','$timestamp','$memo')");
		}else if($record_thing === 'tag'){
			$object_tag_id = uniqid('tag_', true); // tag_で始まる一意のIDを生成
			$object_node_id = $_POST["object_node_id"]; 
			$object_map_id = $_POST["object_map_id"];          //エッジ開始
			$tag_type = $_POST["tag_type"];            //エッジ終了
			$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
			$mysqli->query("INSERT INTO `object_tags`(`object_tag_id`,`tag_type`,`object_node_id`, `timestamp`, `object_map_id`) 
									VALUES ('$object_tag_id','$tag_type','$object_node_id','$timestamp','$object_map_id')");
		}
	}else if($purpose === 'update'){
		$update_thing = $_POST['update_thing'];
		if($update_thing === 'node'){
			$select_update = $_POST['select_update'];   //ノードの変更するもの(座標(point),内容(label))
			$node_id = $_POST["node_id"]; //ノードID
			$node_update_thing1 = $_POST['node_update_thing1']; //node_contentつまりラベルのこと
			$node_update_thing2 = $_POST['node_update_thing2'];
			if($select_update === 'point'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_nodes SET x = '$node_update_thing1', y = '$node_update_thing2', updated_at = '$timestamp' 
				                WHERE object_node_id = '$node_id' ");
			}else if($select_update === 'label'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_nodes SET label = '$node_update_thing1', updated_at = '$timestamp' 
				WHERE  object_node_id = '$node_id' ");
			}else if($select_update === 'done'){
				$object_node_id = $_POST["node_id"]; //ノードID
				$done = "done";
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_nodes SET status = '$done', updated_at = '$timestamp' 
				WHERE  object_node_id = '$node_id' ");
			}
		}else if($update_thing === 'map'){
			$select_update = $_POST['select_update']; 
			$object_map_id = $_POST["object_map_id"]; 
			if($select_update === 'updated_at'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_maps SET updated_at = '$timestamp' WHERE object_map_id = '$object_map_id'");
			}else if($select_update === 'label'){
				$label = $_POST['label']; 
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_maps SET label = '$label', updated_at = '$timestamp' WHERE object_map_id = '$object_map_id'");
			}
		}else if($update_thing === 'memo'){
			$object_map_id = $_POST["object_map_id"]; 
			$select_update = $_POST['select_update']; 
			$memo = $_POST['memo']; 
			if($select_update === 'memo'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_maps SET memo = '$memo', updated_at = '$timestamp' WHERE object_map_id = '$object_map_id'");
			}
		}else if($update_thing === 'status'){
			$select_update = $_POST['select_update']; 
			$object_node_id = $_POST["node_id"];
			if($select_update === 'inProgress'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_nodes SET status = '$select_update', updated_at = '$timestamp' WHERE object_node_id = '$object_node_id'");
			}else if($select_update === 'break'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_nodes SET status = '$select_update', updated_at = '$timestamp' WHERE object_node_id = '$object_node_id'");
			}else if($select_update === 'end'){
				$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
				$mysqli->query("UPDATE object_nodes SET status = '$select_update', updated_at = '$timestamp' WHERE object_node_id = '$object_node_id'");
			}
		}
	}else if($purpose === 'delete'){
		$delete_thing = $_POST['delete_thing'];
		echo "Purpose is delete<br>";
		if($delete_thing === 'node'){
			$node_id = $_POST["node_id"];
			$mysqli->query("UPDATE object_nodes SET deleted = 1 WHERE object_node_id = '$node_id'");
		}else if($delete_thing === 'edge'){
			// $object_edges_id = $_POST["object_edges_id"];
			$edge_start = $_POST["edge_start"];          //エッジ開始
			$edge_end = $_POST["edge_end"]; 
			//$edge_start のみが空の場合：
			if($edge_start === ""){
				$mysqli->query("DELETE FROM object_edges WHERE edge_end = '$edge_end' AND time >= '$struct_start_time'");
			//$edge_end のみが空の場合：
			}else if($edge_end === ""){
				$mysqli->query("DELETE FROM object_edges WHERE edge_start = '$edge_start' AND time >= '$struct_start_time'");
			//$edge_start と $edge_end が両方指定されている場合
			}else{
				$mysqli->query("DELETE FROM object_edges WHERE edge_start = '$edge_start' AND edge_end = '$edge_end'");
			}
			exit();
		}else if($delete_thing === 'connection'){
			$node_id = $_POST["node_id"];
			$result1 = $mysqli->query("DELETE FROM network_ontology_activity WHERE node_id = '$node_id' AND time > '$struct_start_time'");
			$result2 = $mysqli->query("DELETE FROM network_mindmap_connect WHERE network_node_id = '$node_id' AND time > '$struct_start_time'");
		}else if ($delete_thing === 'map') {
			$object_map_id = $_POST["object_map_id"];
			
			$stmt = $mysqli->prepare("UPDATE object_maps SET deleted = 1 WHERE object_map_id = ?");
			$stmt->bind_param("s", $object_map_id); // "s" は文字列の型を表す
		
			if ($stmt->execute()) {
				echo json_encode(["status" => "success", "message" => "削除に成功しました"]);
			} else {
				echo json_encode([
					"status" => "error", 
					"message" => "削除に失敗しました", 
					"error" => $stmt->error
				]);
			}
		
			$stmt->close();
		}
		
	}

	

	//時間設定はいる
	
	//クエリ($sql)のエラー処理
//     if($sql == TRUE){
// 		echo "true";
// 		error_log('$sql成功しています！'.$timestamp, 0);
// 	}else if($sql == FALSE){
// 		error_log($sql.'$sql失敗です', 0);
// 		// error_log('失敗しました。'.mysqli_error($link), 0);
// 	}else{
// 		error_log('$sql不明なエラーです', 0);
// 	}

//     //php($result)のエラー処理
//     $result = $sql;
//     if($result == TRUE){
// 		echo "true";
// 		error_log('$result成功しています！'.$timestamp, 0);
// 	}else if($result == FALSE){
// 		error_log($result.'$result失敗です'.$mysqli->error, 0);
// 		// error_log('失敗しました。'.mysqli_error($link), 0);
// 	}else{
// 		error_log('$result不明なエラーです', 0);
// 	}
// ?>