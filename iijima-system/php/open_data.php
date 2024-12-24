<?php

	session_start();

	/*add_node.jsで木構造を復元するために使用*/

	require("connect_db.php");

	if($_POST["val"] == "id"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id."  ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["id"]);

					$i += 1;

				}

			}

		}

		echo json_encode($array);

	}else if($_POST["val"] == "concept_id"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["concept_id"]);

					$i += 1;

				}

			}

		}

		echo json_encode($array);

	}else if($_POST["val"] == "content"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["content"]);

					$i += 1;

				}

			}

		}

		echo json_encode($array);

	}else if($_POST["val"] == "type"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["type"]);

					$i += 1;

				}

			}

		}

		echo json_encode($array);

	}else if($_POST["val"] == "parent_id"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["parent_id"]);

					$i += 1;

				}

			}

		}

		echo json_encode($array);

	}else if($_POST["val"] == "class"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["class"]);

					$i += 1;

				}

			}

		}

		echo json_encode($array);

	}
	else if($_POST["val"] == "start_char_id"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["start_char_id"]);

					$i += 1;

				}

			}

		}

		echo json_encode($array);

	}
	else if($_POST["val"] == "end_char_id"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." ORDER BY created_at asc";

		$i = 0;
		$array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				if($row["deleted"] == 0){

					$array = $array + array($i=>$row["end_char_id"]);

					$i += 1;

				}

			}

		}
		echo json_encode($array);

	}
	
	
	
	
	else if($_POST["val"] == "root"){

		$id = $_SESSION["SHEETID"];

		$sql = "SELECT * FROM nodes WHERE sheet_id = ".$id." AND type = 'root'";

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				echo $row["content"];

			}

		}

		echo json_encode($array);

	}else if($result == FALSE){
		echo "false";
			error_log($result.'$result失敗です'.$mysqli->error, "3", "error_log.txt");
			// error_log('失敗しました。'.mysqli_error($link), 0);
		  }else{
			error_log('$result不明なエラーです', 0);
		  }


?>
