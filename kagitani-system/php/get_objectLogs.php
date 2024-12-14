<?php
// マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

try {
    // POSTデータの取得
    $startDate = $_POST['startDate'] ?? null;
    $endDate = $_POST['endDate'] ?? null;
    $map = $_POST['map'] ?? null;
    $start = isset($_POST['start']) && $_POST['start'] == 1;
    $end = isset($_POST['end']) && $_POST['end'] == 1;

    // デバッグログ: POSTデータの確認
    error_log("[" . date("Y-m-d H:i:s") . "] POSTデータ: " . print_r($_POST, true));

    // ベースクエリの構築
    $query = "SELECT timestamp, text, act, type FROM activities WHERE 1=1";
    $params = [];

    // 動的条件の追加
    if ($startDate) {
        $query .= " AND timestamp >= ?";
        $params[] = $startDate;
    }
    if ($endDate) {
        $query .= " AND timestamp <= ?";
        $params[] = $endDate;
    }
    if ($map) {
        $query .= " AND object_map_id = ?";
        $params[] = $map;
    }
    if ($start) {
        $query .= " AND act = 1";
    }
    if ($end) {
        $query .= " AND act = 1";
    }

    // デバッグログ: クエリの確認
    error_log("[" . date("Y-m-d H:i:s") . "] 生成されたクエリ: $query");
    error_log("[" . date("Y-m-d H:i:s") . "] バインドパラメータ: " . print_r($params, true));

    // クエリの準備
    $stmt = $mysqli->prepare($query);
    if (!$stmt) {
        throw new Exception("クエリの準備に失敗しました: " . $mysqli->error);
    }

    // パラメータのバインド
    if (!empty($params)) {
        $types = str_repeat('s', count($params)); // すべてのパラメータを文字列型として扱う
        if (!$stmt->bind_param($types, ...$params)) {
            throw new Exception("パラメータのバインドに失敗しました: " . $stmt->error);
        }
    }

    // クエリの実行
    if (!$stmt->execute()) {
        throw new Exception("クエリの実行に失敗しました: " . $stmt->error);
    }

    // 結果の取得
    $result = $stmt->get_result();
    if (!$result) {
        throw new Exception("結果の取得に失敗しました: " . $stmt->error);
    }
    $activities = $result->fetch_all(MYSQLI_ASSOC);

    // JSONで結果を返す
    echo json_encode($activities);

    // デバッグログ: 結果の確認
    error_log("[" . date("Y-m-d H:i:s") . "] クエリ結果: " . print_r($activities, true));

} catch (Exception $e) {
    // エラーの詳細を記録
    error_log("[" . date("Y-m-d H:i:s") . "] エラー: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
