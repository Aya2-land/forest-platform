<?php

	session_start();

	require "connect_db.php";

	if($_POST["val"] == "rationality"){
		$sheet_id = $_SESSION["MAPID"];
		$rationality_id = $_POST["rationality_id"];

		$sql = "SELECT * FROM rationality_nodes WHERE sheet_id = ".$sheet_id." AND rationality_id = '".$rationality_id."'";

		$i = 0;
		$node_id_array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$node_id_array = $node_id_array + array($i=>$row["node_id"]);

				$i += 1;

			}

		}

		echo json_encode($node_id_array);

	}else if($_POST["val"] == "edit_reason"){
		$sheet_id = $_SESSION["MAPID"];
		$id = $_POST["id"];

		$sql = "SELECT * FROM edit_reason WHERE sheet_id = ".$sheet_id." AND node_id = '".$id."'";

		$i = 0;
		$node_id_array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$node_id_array = $node_id_array + array($i=>$row["content"]);

				$i += 1;

			}

		}

		echo json_encode($node_id_array);

	}else if($_POST["val"] == "node_id"){
		$sql = "SELECT * FROM nodes WHERE id = '".$_POST["node_id"]."'";
		$result = $mysqli->query($sql);

		if(!$result){

			echo "false";

		}else{

			echo "save";

		}

	}else if($_POST["val"] == "return"){

		$sql = "SELECT * FROM nodes WHERE user_id = ".$_SESSION["USERID"]." AND sheet_id = ".$_SESSION["MAPID"]." AND updated_at = (select max(updated_at) from nodes)";

		$i = 0;
		$updated_array = array();

		if($$mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$updated_array = $updated_array + array($i=>$row["id"]);

				$i += 1;

			}

		}

		echo json_encode($updated_array);

// MTタイムを選択した時の処理
	}else if($_POST["val"] == "time"){

		echo "ok";

	}

?>
