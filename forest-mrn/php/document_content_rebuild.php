<?php

//指定した日時だけ取得・マッチングするバージョン
session_start();
require("connect_db.php");

$user_id = $_SESSION["USERID"];//"26943"; //
$map_id = $_SESSION["MAPID"];//"102774749"; //

//タイムゾーンの設定
date_default_timezone_set('Asia/Tokyo');
$today_date = date("Y-m-d");


$sql = "SELECT item_content_id, node_id, concept_id, brother_id, content, item_id, type, parent_id, logic_option FROM item_content_latest WHERE map_id='$map_id' AND deleted=0";

$reflections = array();

if($result = $mysqli->query($sql)){

  //$reflections
  while($row = mysqli_fetch_assoc($result)){
    $reflections[] = array(
    'item_content_id'=> $row["item_content_id"],
    'node_id'=> $row["node_id"],
    'concept_id'=> $row["concept_id"],
    'brother_id' => $row["brother_id"],
    'content' => $row["content"],
    'item_id'=> $row["item_id"],
    'type'=> $row["type"],
    'parent_id'=> $row["parent_id"],
    'logic_option'=> $row["logic_option"]);
  }
}

echo json_encode($reflections);

?>
