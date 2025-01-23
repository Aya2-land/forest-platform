<?php

//指定した日時だけ取得・マッチングするバージョン
session_start();
require("connect_db.php");

$user_id = $_SESSION["USERID"];//"26943"; //
$map_id = $_SESSION["MAPID"];//"102774749"; //

//タイムゾーンの設定
date_default_timezone_set('Asia/Tokyo');
$today_date = date("Y-m-d");


$sql = "SELECT slide_id, rank, title, logic_option, node_id, concept_id FROM document_rank WHERE map_id='$map_id' AND deleted=0";

$reflections = array();

if($result = $mysqli->query($sql)){
  //$reflections
  while($row = mysqli_fetch_assoc($result)){
    $reflections[] = array(
    'slide_id'=> $row["slide_id"],
    'rank' => $row["rank"],
    'title' => $row["title"],
    'logic_option' => $row["logic_option"],
    'node_id' => $row["node_id"],
    'concept_id' => $row["concept_id"]);
  }
}

echo json_encode($reflections);

?>
