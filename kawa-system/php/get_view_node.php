<?php
session_start();
require "connect_db.php";

    $map_id = $_SESSION["MAPID"];
    $paper_id = $_SESSION["PAPERID"]; 

	if($_POST["val"] == "view_ymodel"){
		$id = $_POST["id"];

        $i = 0;
        $node_id_array = array();

        $sql = "SELECT * FROM node_latest WHERE node_id = '".$id."' AND node_type_id = 1";

        if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$node_id_array = $node_id_array + array($i=>$row["concept_id"]);

				$i += 1;

			}
        }
    
        echo json_encode($node_id_array);

    }
      


?>