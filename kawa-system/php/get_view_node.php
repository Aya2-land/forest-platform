<?php
session_start();
require "connect_db.php";

    $sheet_id = $_SESSION["SHEETID"];
    $paper_id = $_SESSION["PAPERID"]; 

    if($_POST["val"] == "get_sheet_id"){

        $sql = "SELECT * FROM sheets WHERE paper_id = '".$paper_id."' AND deleted = '0' ";

        if($result = $mysqli->query($sql)){

            $users = array();
            $i = 1;

            while ($row = mysqli_fetch_assoc($result)) {
                if($row["id"] == $sheet_id){
                    $users[0] = array(
                        "sheet_id" => $row["id"]
                    );
                }
                else {
                    $users[$i] = array(
                        "sheet_id" => $row["id"]
                    );
                    $i++;
                }
            }

            echo json_encode($users);

        }    
    }
	
    else if($_POST["val"] == "view_ymodel"){

        $sheet_id = $_POST["sheet_id"];
        $node_array = array();

        $c_id = $_POST["concept_id"];

        for($i = 0; $i < count($c_id); $i++){

            $c = $c_id[$i];
            $sql = "SELECT * FROM nodes WHERE sheet_id = '".$sheet_id."' AND concept_id='".$c."'  AND type != 'toi' AND type != 'toi_deep' AND type != 'other_to_myquestion' AND deleted = 0 AND content NOT LIKE '<select name=\"change_criticism2\"%' ";

            if($result = $mysqli->query($sql)){

                $nodes = array();

                while ($row = mysqli_fetch_assoc($result)) {
                    $nodes[] = array(
                        "node_id" => $row["id"],
                        "content" => $row["content"],
                        "concept_id" => $row["concept_id"],
                        "parent_id" => $row["parent_id"],
                        "type" => $row["type"],
                        "c_number" => $i + 1,
                        "child" => 0,
                    );
                }
                
                array_push($node_array, $nodes);

            }    
        }

        echo json_encode($node_array);

    }

    else if($_POST["val"] == "get_parent_node"){

        $child_array = array();
        $n_id = $_POST["node_id"];
        $c_number = $_POST["c_number"];
        $j = 1;

        for($i = 0; $i < count($n_id); $i++){
            getParent($c_number[$i], $child_array, $n_id[$i], $j);
        }
        
        echo json_encode($child_array);

    }


//　子ノードを取得
function getParent($c_number, &$child_array, $parent_id, $j){
        
    global $mysqli;
    
    $child = array();

    $sql = "SELECT * FROM nodes WHERE parent_id = '".$parent_id."' AND deleted = 0 AND content NOT LIKE '<select name=\"change_criticism2\"%' "; //選択されていない批評ノードを排除

    if($result = $mysqli->query($sql)){

        while ($row = mysqli_fetch_assoc($result)) {
            
            for($i = 0; $i < count($child_array[$c_number-1]); $i++){
                if($child_array[$c_number-1][$i]["node_id"] == $row["id"]){
                    $row = 0;
                }
            }

            $child[] = array(
                "node_id" => $row["id"],
                "content" => $row["content"],
                "concept_id" => $row["concept_id"],
                "parent_id" => $row["parent_id"],
                "type" => $row["type"],
                "c_number" => intval($c_number),
                "child" => $j,
            );

            array_push($child_array, $child);
            $next_parent_id = $row["id"];
            $child = array();
            
            $j++;
            getParent($c_number, $child_array, $next_parent_id, $j);
            
        }
    }
    
    return $child_array;
        
}


?>