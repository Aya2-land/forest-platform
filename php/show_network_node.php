<?php
session_start();

require("connect_db.php");

$user_id = $_SESSION['USERID'];      //ユーザID
$map_id = $_SESSION['MAPID'];    //シートID
$st_time = $_POST["st_time"];
$en_time = $_POST["en_time"]; 

$result = $mysqli->query("SELECT node_id, label, node_x, node_y, color, shape FROM network_nodes_activity
          WHERE user_id = '$user_id' AND map_id = '$map_id' AND updated_time > '$st_time' AND updated_time < '$en_time'
          ORDER BY updated_time DESC ");

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
