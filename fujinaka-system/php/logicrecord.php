<?php

session_start();
require("connect_db.php");
date_default_timezone_set('Asia/Tokyo');

header('Content-Type: application/json'); // JSON 形式でレスポンスを返す

if (!isset($_SESSION['USERID'])) {
    echo json_encode(["status" => "error", "message" => "ユーザーIDが設定されていません"]);
    exit;
}

$user_id = $_SESSION['USERID']; // ユーザーID
$purpose = isset($_POST['purpose']) ? $_POST['purpose'] : '';

if ($purpose === 'record') {
    $record_thing = isset($_POST['record_thing']) ? $_POST['record_thing'] : '';

    if ($record_thing === 'node') {
        if (isset($_POST["node_id"], $_POST["x"], $_POST["y"])) {
            $logic_node_id = $_POST["node_id"];
            $x = $_POST["x"];
            $y = $_POST["y"];
            $timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);

            $sql = "INSERT INTO yamashita (logic_node_id, label, x, y, created_at) 
                    VALUES ('$logic_node_id', 'NewNodes', $x, $y, '$timestamp')";

            if ($mysqli->query($sql)) {
                echo json_encode(["status" => "success", "message" => "ノードが記録されました", "node_id" => $logic_node_id]);
            } else {
                echo json_encode(["status" => "error", "message" => "データベースエラー: " . $mysqli->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "必要なデータが不足しています"]);
        }
    }
}
?>
