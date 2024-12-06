<?php
// マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

$return_data = [];
$purpose = $_POST["purpose"]; //loadかfetchか

if($purpose === 'fetch'){
    // object_mapsテーブルから目標データを取得
    $sql = "SELECT object_map_id, label, created_at, updated_at FROM object_maps WHERE deleted = '0' ORDER BY created_at DESC";
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

}else if ($purpose === 'load') {
    $objectMapId = $_POST['object_map_id'];

    $result_object_node = $mysqli->query("SELECT object_node_id, label, object_nodes_type_id, x, y, done FROM object_nodes WHERE object_map_id = '$objectMapId' AND deleted = '0'");

    $node = [];
    while ($row = $result_object_node->fetch_assoc()) {
        array_push($node, $row);
    }
    $return_data = array_merge($return_data, ['node' => $node]);

    $result_object_edge = $mysqli->query("SELECT object_edges_id, edge_start, edge_end FROM object_edges
              WHERE object_map_id = '$objectMapId'");
    $edge = [];
    while ($row = $result_object_edge->fetch_assoc()) {
        array_push($edge, $row);
    }
    $return_data = array_merge($return_data, ['edge' => $edge]);

    echo json_encode($return_data); // JSONを出力
}
