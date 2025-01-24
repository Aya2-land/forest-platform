<?php
session_start();

require("connect_db.php");

$user_id = $_SESSION['USERID'];      //ユーザID
$sheet_id = $_SESSION['MAPID'];    //シートID
$st_time = $_POST["st_time"];
$en_time = $_POST["en_time"]; 

$result = $mysqli->query("SELECT ontology_id, node_id FROM network_ontology_activity
          WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$st_time' AND time < '$en_time'
          ORDER BY time DESC ");

$data = array();
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

if (empty($data)) {
    echo json_encode(["error" => "not"]);
} else {
    echo json_encode($data);
}

?>
