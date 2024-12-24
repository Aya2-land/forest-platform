<?php

	session_start();

	require "connect_db.php";

	if($_POST["val"] == "rationality"){
		$sheet_id = $_SESSION["SHEETID"];
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
		$sheet_id = $_SESSION["SHEETID"];
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

		$sql = "SELECT * FROM nodes WHERE user_id = ".$_SESSION["USERID"]." AND sheet_id = ".$_SESSION["SHEETID"]." AND updated_at = (select max(updated_at) from nodes)";

		$i = 0;
		$updated_array = array();

		if($mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$updated_array = $updated_array + array($i=>$row["id"]);

				$i += 1;

			}

		}
	}
	else if($_POST["val"] == "get_other_answer"){

		$node_id = $_POST["id"];

		$i = 0;

		$sql = "SELECT user_id, content, parent_sheet_id, sheet_id FROM nodes WHERE id = '$node_id'";
		if ($result = $mysqli->query($sql)) {

            while ($row = mysqli_fetch_assoc($result)) {

				$sql2 = "SELECT name FROM users WHERE id = '".$row['user_id']."'";
				$result2 = $mysqli->query($sql2);

				$row2 = mysqli_fetch_assoc($result2);
				$user_array[0] = array(
					"name" => $row2["name"]
				);

				$sql3 = "SELECT summary FROM sheets WHERE id ='".$row['parent_sheet_id']."'";
				$result3 = $mysqli->query($sql3);

				$row3 = mysqli_fetch_assoc($result3);
				$summary_array[0] = array(
					"summary" => $row3["summary"]
				);

                $data_array[$i] = array(
					"parent_sheet_id" => $row["parent_sheet_id"],
					"sheet_id" => $row["sheet_id"],
                    "content" => $row["content"],
					"name" => $user_array[0]["name"],
					"summary" => $summary_array[0]["summary"]

                );

                $i++;
            }
            echo json_encode($data_array);
        }
	}

// MTタイムを選択した時の処理
	else if($_POST["val"] == "time"){

		echo "ok";

	}

?>
