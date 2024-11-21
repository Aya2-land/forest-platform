<?php

	session_start();

	/*ノード情報をDBに格納する際に使用*/
	require("connect_db.php");
	date_default_timezone_set('Asia/Tokyo');

	//jsmind.js
	if($_POST["insert"] == "node"){

		$created_at = date("Y-m-d H:i:s");
		$deleted = 0;

		$node_v_id = uniqid(rand(0,64));
		$node_h_id = uniqid(rand(0,64));

		if($_POST["type"] == 0){

			$id = $_SESSION["MAPID"];

			$sql = "SELECT * FROM nodes WHERE map_id = '$id'";

			if($result = $mysqli->query($sql)){

				while($row = mysqli_fetch_assoc($result)){

					$root = $row["id"];

				}

			}

			if(count($root) === 0){

				$node_sql = "INSERT INTO nodes (node_id, user_id, type_id, from_mode, deleted )
					VALUES ('".$_POST['id']."','".$_SESSION['USERID']."','".$_POST['type']."', '".$_POST['from_mode']."', '".$deleted."')";
				
				$node_v_sql = "INSERT INTO node_versions (node_version_id, node_id, parent_id, type_id, appeared_at, disappeared_at, content, concept_id, x, y)
					VALUES ('".$node_v_id."', '".$_POST['id']."','".$_POST['parent_id']."','".$_POST['type']."', '".$created_at."','".$created_at."','".$_POST['content']."','".$_POST['concept_id']."','".$_POST['x']."','".$_POST['y']."')";
				
				$node_h_sql = "INSERT INTO node_histories (node_history_id, node_version_id, parent_id, type_id, appeared_at, disappeared_at, content, concept_id, x, y)
					VALUES ('".$node_h_id."', '".$node_v_id."','".$_POST['parent_id']."','".$_POST['type']."', '".$created_at."','".$created_at."','".$_POST['content']."','".$_POST['concept_id']."','".$_POST['x']."','".$_POST['y']."')";

				$n_result = $mysqli->query($node_sql);
				if(!$n_result){
					echo "error";
				}
				$n_v_result = $mysqli->query($node_v_sql);
				if(!$n_result){
					echo "error";
				}
				$n_h_result = $mysqli->query($node_h_sql);
				if(!$n_result){
					echo "error";
				}

			}

		}else{
			
			$created_at = date("Y-m-d H:i:s");
			$deleted = 0;


			$node_sql = "INSERT INTO nodes (node_id, user_id, type_id, from_mode, deleted )
					VALUES ('".$_POST['id']."','".$_SESSION['USERID']."','".$_POST['type']."', '".$_POST['from_mode']."', '".$deleted."')";
				
			$node_v_sql = "INSERT INTO node_versions (node_version_id, node_id, parent_id, type_id, appeared_at, disappeared_at, content, concept_id, x, y)
				VALUES ('".$node_v_id."', '".$_POST['id']."','".$_POST['parent_id']."','".$_POST['type']."', '".$created_at."','".$created_at."','".$_POST['content']."','".$_POST['concept_id']."','".$_POST['x']."','".$_POST['y']."')";
				
			$node_h_sql = "INSERT INTO node_histories (node_history_id, node_version_id, parent_id, type_id, appeared_at, disappeared_at, content, concept_id, x, y)
				VALUES ('".$node_h_id."', '".$node_v_id."','".$_POST['parent_id']."','".$_POST['type']."', '".$created_at."','".$created_at."','".$_POST['content']."','".$_POST['concept_id']."','".$_POST['x']."','".$_POST['y']."')";

			$n_result = $mysqli->query($node_sql);
			if(!$n_result){
				echo "error1";
			}
			$n_v_result = $mysqli->query($node_v_sql);
			if(!$n_v_result){
				echo "error2";
			}
			$n_h_result = $mysqli->query($node_h_sql);
			if(!$n_v_result){
				echo "error3";
			}

		}

	}else if($_POST["insert"] == "rationality"){

		$created_at = date("Y-m-d H:i:s");
		$id = rand();


		$sql = "INSERT INTO rationality_nodes(id, user_id, map_id, created_at, rationality_id, node_id)
		VALUES ('".$id."', '".$_SESSION["USERID"]."', '".$_SESSION['MAPID']."', '".$created_at."', '".$_POST['rationality_id']."', '".$_POST['node_id']."')";
		$result = $mysqli->query($sql);

	}else if($_POST["insert"] == "edit_reason"){

		$created_at = date("Y-m-d H:i:s");
		$id = rand();

		$sql = "INSERT INTO edit_reason(id, user_id, map_id, created_at, updated_at, node_id, content)
		VALUES ('".$id."', '".$_SESSION['USERID']."','".$_SESSION['MAPID']."', '".$created_at."', '".$created_at."', '".$_POST['node_id']."', '".$_POST['content']."')";
		$result = $mysqli->query($sql);

	}

?>
