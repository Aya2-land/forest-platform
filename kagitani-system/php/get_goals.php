<?php
// マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

$purpose = $_POST["purpose"]; //loadかfetchか

if($purpose === 'fetch'){
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

}else if($purpose === 'load'){
    $objectMapId = $_POST['object_map_id'];

    // SQLインジェクションを防ぐためにプリペアドステートメントを使用
    $stmt = $mysqli->prepare("SELECT object_node_id, label, x, y, object_nodes_type_id FROM object_nodes WHERE object_map_id = ?");

    // prepare() が失敗した場合
    if ($stmt === false) {
        die("SQLステートメントの準備に失敗しました: " . $mysqli->error);
    }

    $stmt->bind_param("i", $objectMapId); // "i"はinteger型を意味します

    // execute() が失敗した場合
    if (!$stmt->execute()) {
        die("クエリ実行に失敗しました: " . $stmt->error);
    }

    // 結果を取得
    $result = $stmt->get_result();
    $goals = [];

    if ($result->num_rows > 0) {
        // 結果を配列に格納
        while ($row = $result->fetch_assoc()) {
            $goals[] = $row;
        }
    }

    // JSON形式で結果を返す
    echo json_encode($goals);

    // ステートメントと接続を閉じる
    $stmt->close();
    $mysqli->close();
}
