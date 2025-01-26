<?php
// マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

$user_id = $_SESSION['USERID'];      //ユーザID
$sheet_id = $_SESSION['MAPID'];    //シートID

$return_data = [];
$purpose = $_POST["purpose"]; //loadかfetchか

if ($purpose === 'fetch') {
    // object_mapsテーブルから目標データを取得
    $sql = "SELECT object_map_id, label, created_at, updated_at, start_date, end_date, memo FROM object_maps WHERE `map_id` = ? AND deleted = '0' ORDER BY created_at DESC";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("s", $sheet_id);  // プレースホルダに変数をバインド
    $stmt->execute();
    $result = $stmt->get_result();

    $goals = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $goals[] = $row; // 結果を配列に格納
        }
    }

    // JSON形式で返す
    echo json_encode($goals);

    // 接続を閉じる
    $mysqli->close();
} else if ($purpose === 'load') {
    $objectMapId = $_POST['object_map_id'];

    $result_object_node = $mysqli->prepare("SELECT object_node_id, label, object_nodes_type, tag, x, y, status FROM object_nodes WHERE object_map_id = ? AND deleted = '0'");
    $result_object_node->bind_param("s", $objectMapId);
    $result_object_node->execute();
    $node = [];
    $result_object_node = $result_object_node->get_result();
    while ($row = $result_object_node->fetch_assoc()) {
        $node[] = $row;
    }
    $return_data['node'] = $node;

    $result_object_edge = $mysqli->prepare("SELECT object_edges_id, edge_start, edge_end FROM object_edges WHERE object_map_id = ?");
    $result_object_edge->bind_param("s", $objectMapId);
    $result_object_edge->execute();
    $edge = [];
    $result_object_edge = $result_object_edge->get_result();
    while ($row = $result_object_edge->fetch_assoc()) {
        $edge[] = $row;
    }
    $return_data['edge'] = $edge;

    echo json_encode($return_data); // JSONを出力
} else if ($purpose === 'label') {
    $sql = "SELECT object_map_id, label FROM object_maps WHERE deleted = '0' ORDER BY created_at DESC";
    $result = $mysqli->query($sql);

    $goals = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $goals[] = $row; // 結果を配列に格納
        }
    }

    // JSON形式で返す
    echo json_encode($goals);

    // 接続を閉じる
    $mysqli->close();
} else if ($purpose === 'name') {
    $objectMapId = $_POST['object_map_id'];
    $sql = "SELECT label FROM object_maps WHERE object_map_id = ?";
    $stmt = $mysqli->prepare($sql);
    $stmt->bind_param("s", $objectMapId);
    $stmt->execute();
    $result = $stmt->get_result();

    $goals = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $goals[] = $row; // 結果を配列に格納
        }
    }

    // JSON形式で返す
    echo json_encode($goals);

    // 接続を閉じる
    $mysqli->close();
}
