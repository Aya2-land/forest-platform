<?php
session_start();

require "connect_db.php";


$sheet_id = $_SESSION["SHEETID"];
$rationality_id = $_POST["rationality_id"];

		$sql = "SELECT * FROM rationality_nodes WHERE sheet_id = ".$sheet_id." AND rationality_id = '".$rationality_id."' ";

		$i = 0;
		$node_id_array = array();

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$node_id_array = $node_id_array + array($i=>$row["node_id"]);

				$i += 1;

			}

		}

		echo json_encode($node_id_array);


?>





