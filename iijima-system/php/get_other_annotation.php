<?php
session_start();
require "connect_db.php";

    $sheet_id = $_SESSION["SHEETID"];
    $paper_id = $_SESSION["PAPERID"]; 

	if($_POST["val"] == "get_conceptid"){
		$id = $_POST["id"];

        $i = 0;
        $node_id_array = array();

        $sql = "SELECT * FROM nodes WHERE id = '".$id."' AND (type = 'toi' OR type = 'other_question')";

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
        $data_array = array(); // contentとsheetidを格納する配列 
        $sheet_id = $_SESSION["SHEETID"];
        $paper_id = $_SESSION["PAPERID"]; 
        $sql = "SELECT * FROM nodes WHERE concept_id = '".$id."' AND type = 'predict' AND deleted = '0' AND content NOT LIKE '＊あなたの予測' AND sheet_id != '".$sheet_id."' AND (paper_id = '".$paper_id."')";

        if ($result = $mysqli->query($sql)) {

            while ($row = mysqli_fetch_assoc($result)) {
                $data_array[$i] = array(
                    
                    "content" => $row["content"],
                    "sheet_id" => $row["sheet_id"],
                    "id" => $row["id"],
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
        $data_array = array(); // contentとsheetidを格納する配列
    
        // SQLクエリを構築
        $sql = "SELECT * FROM annotations WHERE ";
        $sql .= "((start_char_id >= $start_char_id AND end_char_id <= $end_char_id) ";
        $sql .= "OR (start_char_id < $start_char_id AND end_char_id > $end_char_id) ";
        $sql .= "AND (paper_id = $paper_id))";

        if ($result = $mysqli->query($sql)) {
            $i = 0;
            while ($row = mysqli_fetch_assoc($result)) {
                if ($row["paper_id"] == $paper_id && $row["sheet_id"] != $sheet_id){
                    $data_array[$i] = array(
                        "content" => $row["content"],
                        "end_char_id"=> $row["end_char_id"],
                        "start_char_id"=> $row["start_char_id"],
                        "sheet_id"=> $row["sheet_id"],
                        "parent_id"=> $row["parent_id"]
                    );      
                    $i++;
                } 
            }
            
            echo json_encode($data_array);
        }

    }

    else if($_POST["val"] == "get_my_conceptid"){
        
        $s_id = $_SESSION["SHEETID"];
        $i = 0;
        $node_id_array = array();

        $sql = "SELECT * FROM nodes WHERE sheet_id = '".$s_id."' AND (type = 'toi' OR type =  'other_question' OR type = 'toi_deep') AND deleted = 0";

        if ($result = $mysqli->query($sql)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data_array[$i] = [
                    "content" => $row["content"],
                    "sheet_id" => $row["sheet_id"],
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
        
       $sql = "SELECT DISTINCT concept_id, content FROM nodes WHERE (type = 'toi' OR type = 'toi_deep') AND paper_id = $paper_id AND concept_id <> '' AND deleted = '0'";



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