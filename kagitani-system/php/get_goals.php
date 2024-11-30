<?php
// 議論内省マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

// POSTデータの受け取り
$user_id = $_SESSION['USERID'];      //ユーザID
$sheet_id = $_SESSION['SHEETID'];    //シートID

//$purpose = $_POST["purpose"]; // どんなデータを取得したり保存したりするのか（内容．例：発話ノードのXMLからの保存orマップノードの取得）

// object_mapsテーブルから目標データを取得
$sql = "SELECT object_map_id, label, created_at FROM object_maps ORDER BY created_at DESC";
$result = $mysqli->query($sql);

$goals = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $goals[] = $row; // 結果を配列に格納
    }
}

// JSON形式で返す
echo json_encode($goals);

// 接続を閉じる
$mysqli->close();