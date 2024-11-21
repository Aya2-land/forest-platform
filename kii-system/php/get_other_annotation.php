<?php
session_start();
require "connect_db.php";

    $map_id = $_SESSION["MAPID"];
    $paper_id = $_SESSION["PAPERID"]; 

	if($_POST["val"] == "get_conceptid"){
		$id = $_POST["id"];

        $i = 0;
        $node_id_array = array();

        $sql = "SELECT * FROM node_latest WHERE node_id = '".$id."' AND (type_id = 1 OR type_id = 3)";

        if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				$node_id_array = $node_id_array + array($i=>$row["concept_id"]);

				$i += 1;

			}
        }
    
        echo json_encode($node_id_array);

    }


    else if ($_POST["val"] == "get_question") {

        $id = $_POST["id"];   
        $i = 0;
        $data_array = array(); // contentとmapidを格納する配列 
        $map_id = $_SESSION["MAPID"];
        $paper_id = $_SESSION["PAPERID"]; 
        $sql = "SELECT nl.*, ml.map_id
                    FROM node_latest nl
                    JOIN map_node_links ml ON nl.node_id = ml.node_id
                    WHERE nl.concept_id = '1643939439432000_n877' AND nl.type = 'predict' AND nl.content NOT LIKE '＊あなたの解釈' AND ml.map_id IN (SELECT m.map_id FROM maps m WHERE m.map_id NOT LIKE ".$map_id." AND m.paper_id = ".$paper_id.");";

        if ($result = $mysqli->query($sql)) {

            while ($row = mysqli_fetch_assoc($result)) {
                $data_array[$i] = array(
                    
                    "content" => $row["content"],
                    "map_id" => $row["map_id"],
                    "id" => $row["node_id"],
                    "parent_id"=> $row["parent_id"]
                );
                $i++;
            }
            echo json_encode($data_array);
            //echo json_encode($sql);
        }
    }

    else if ($_POST["val"] == "judge_annotation") {
        $start_char_id = $_POST["start_char_id"];
        $end_char_id = $_POST["end_char_id"];
        $data_array = array(); // contentとmapidを格納する配列
    
        // SQLクエリを構築
        $sql = "SELECT * FROM annotations WHERE ";
        $sql .= "((start_char_id >= $start_char_id AND end_char_id <= $end_char_id) ";
        $sql .= "OR (start_char_id < $start_char_id AND end_char_id > $end_char_id) ";
        $sql .= "AND (paper_id = $paper_id))";

        if ($result = $mysqli->query($sql)) {
            $i = 0;
            while ($row = mysqli_fetch_assoc($result)) {
                if ($row["paper_id"] == $paper_id && $row["map_id"] != $map_id){
                    $data_array[$i] = array(
                        "content" => $row["content"],
                        "end_char_id"=> $row["end_char_id"],
                        "start_char_id"=> $row["start_char_id"],
                        "map_id"=> $row["map_id"],
                        "parent_id"=> $row["parent_id"]
                    );      
                    $i++;
                } 
            }
            
            echo json_encode($data_array);
        }

    }

    else if($_POST["val"] == "get_my_conceptid"){
        
        $s_id = $_SESSION["MAPID"];
        $i = 0;
        $node_id_array = array();

        $sql = "SELECT * FROM node_latest WHERE (type_id = 1 OR type_id = 2 OR type_id = 3) AND node_id IN (SELECT node_id FROM map_node_links WHERE map_id = '".$s_id."')";

        if ($result = $mysqli->query($sql)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data_array[$i] = [
                    "content" => $row["content"],
                    "map_id" => $s_id,
                    "id" => $row["id"],
                    "concept_id" => $row["concept_id"]
                ];
                $i++;
            }
            echo json_encode($data_array);
        }

    }

    else if($_POST["val"] == "get_other_question"){
        $c_array = $_POST["array"];
    
        $data_array = array();
        $i = 0;
        
       $sql = "SELECT DISTINCT concept_id, content 
                    FROM node_latest 
                    WHERE (type_id = 1 OR type_id = 2) AND node_id IN (SELECT node_id FROM map_node_links WHERE map_id IN (SELECT map_id FROM maps WHERE paper_id = ".$paper_id.") )";

        if ($result = $mysqli->query($sql)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data_array[$i] = [
                    "content" => $row["content"],
                    "concept_id" => $row["concept_id"]
                ];
                $i++;
            }
            echo json_encode($data_array);
        }
    }
      


?>