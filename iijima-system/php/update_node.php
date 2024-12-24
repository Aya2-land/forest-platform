<?php

	session_start();

	require("connect_db.php");
	date_default_timezone_set('Asia/Tokyo');

	$updated_at = date("Y-m-d H:i:s");

	if($_POST["update"] == "content"){

		if($id != "root"){

			$sql = "UPDATE nodes SET content = '".$_POST['content']."', updated_at = '".$updated_at."' WHERE id = '".$_POST['id']."'";
			$result = $mysqli->query($sql);

		}else{
			$sql = "UPDATE nodes SET content = '".$_POST['content']."', updated_at = '".$updated_at."' WHERE type = 'root' AND sheet_id = ".$_SESSION['SHEETID'];
			$result = $mysqli->query($sql);
			if(!$result){
				echo "error";
			}

		}

	}else if($_POST["update"] == "parent"){
		$sql = "UPDATE nodes SET parent_id = '".$_POST['parent_id']."', concept_id = '".$_POST['concept_id']."', updated_at = '".$updated_at."' WHERE id = '".$_POST['id']."'";
		$result = $mysqli->query($sql);

	}else if($_POST["update"] == "delete"){
		$deleted = 1;

		$sql = "UPDATE nodes SET updated_at = '".$updated_at."', deleted = '".$deleted."' WHERE id = '".$_POST['id']."'";
		$result = $mysqli->query($sql);

	}else if($_POST["update"] == "type"){
		$sql = "UPDATE nodes SET type = '".$_POST['type']."' updated_at = '".$updated_at."' WHERE id = '".$_POST['id']."'";
		$result = $mysqli->query($sql);
	}
	else if($_POST["update"] == "sheet"){

		// $sql = "UPDATE sheets SET updated_at = '".$updated_at."' WHERE id = '".$_POST['id']."'";
		$sql = "UPDATE sheets SET updated_at = '".$updated_at."' WHERE id = '".$_SESSION['SHEETID']."'";
		$result = $mysqli->query($sql);

	}else if($_POST["update"] == "edit_reason"){

		$sql = "UPDATE edit_reason SET updated_at = '".$updated_at."', content = '".$_POST['content']."' WHERE node_id = '".$_POST['node_id']."'";
		$result = $mysqli->query($sql);

	}else if($_POST["update"] == "return"){

		$deleted = 0;

		$sql = "UPDATE nodes SET updated_at = '".$updated_at."', deleted = '".$deleted."' WHERE id = '".$_POST['id']."'";

		$i = 0;
		$updated_array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$updated_array = $updated_array + array($i=>$row["id"]);

				$i += 1;

			}

		}

	}
	else if ($_POST["update"] == "reflection") {
		$sql = "UPDATE nodes SET reflection = '".$_POST["text"]."', class = 'other_to_myanswer', type = 'other_to_myanswer' WHERE id = '".$_POST["nodeid"]."'";
		$result = $mysqli->query($sql);
		echo $sql;
	}

	else if ($_POST["update"] == "summary") {
		echo "ok";
		$sql = "UPDATE sheets SET summary = '".$_POST["summary"]."' WHERE id = '".$_SESSION["SHEETID"]."'";
		$result = $mysqli->query($sql);
		echo $sql;
	}
	else if ($_POST["update"] == "annotated") {

		$sql = "UPDATE nodes SET start_char_id = '".$_POST["start_char_id"]."', end_char_id = '".$_POST["end_char_id"]."'WHERE id = '".$_POST["id"]."'";
		$result = $mysqli->query($sql);
		echo $sql;
	}else if($_POST["update"] == "micro_strat"){
		$sql = "UPDATE nodes SET type = '".$_POST['type']."', reflection = '".$_POST['content']."', updated_at = '".$updated_at."' WHERE id = '".$_POST['nodeid']."'";
		$result = $mysqli->query($sql);
	}





	

?>
