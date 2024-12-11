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

    // クエリの構築
    $query = "SELECT * FROM activities WHERE 1=1";
    $params = [];

    if ($startDate) {
        $query .= " AND timestamp >= :startDate";
        $params[':startDate'] = $startDate;
    }
    if ($endDate) {
        $query .= " AND timestamp <= :endDate";
        $params[':endDate'] = $endDate;
    }
    if ($map) {
        $query .= " AND map_name = :map";
        $params[':map'] = $map;
    }
    if ($start) {
        $query .= " AND act = 1";
    }
    if ($end) {
        $query .= " AND act = 1";
    }

    // クエリ実行
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    // 結果を取得してJSONで返す
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DBエラー: ' . $e->getMessage()]);
}