<?php

//指定した日時だけ取得・マッチングするバージョン
session_start();
require("connect_db.php");

$map_id = $_SESSION["MAPID"];

//タイムゾーンの設定
date_default_timezone_set('Asia/Tokyo');
$today_date = date("Y-m-d");

$sql = "SELECT item_id, item_bro_id, node_id, logic_option, title FROM item_latest WHERE map_id='$map_id'";

$reflections = array();

if($result = $mysqli->query($sql)){
  //$reflections
  while($row = mysqli_fetch_assoc($result)){
    $reflections[] = array(
    'item_id'=> $row["item_id"],
    'item_bro_id' => $row["brother_id"],
    'logic_option' => $row["logic_option"],
    'title' => $row["title"],
    'node_id' => $row["node_id"]);
  }
}

echo json_encode($reflections);

?>
