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
    
            $sql = "INSERT INTO logic_node (logic_node_id, label, x, y, created_at, updated_at) 
                    VALUES ('$logic_node_id', 'NewNodes', '$x', '$y', '$timestamp', '$timestamp')";
    
            if ($mysqli->query($sql)) {
                echo json_encode(["status" => "success", "message" => "ノードが記録されました", "node_id" => $logic_node_id]);
            } else {
                echo json_encode(["status" => "error", "message" => "データベースエラー: " . $mysqli->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "必要なパラメータが不足しています (node_id, x, y)"]);
        }
    } 
    else if ($record_thing === 'edge') {
        if (isset($_POST["edge_start"], $_POST["edge_end"])) { // パラメータの存在チェック
            $logic_edges_id = uniqid('edge_', true);
            $edge_start = $_POST["edge_start"];
            $edge_end = $_POST["edge_end"];
            $timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
    
            $sql = "INSERT INTO logic_edge (logic_edge_id, edge_start, edge_end, created_at, updated_at) 
                    VALUES ('$logic_edges_id', '$edge_start', '$edge_end', '$timestamp', '$timestamp')";
    
            if ($mysqli->query($sql)) {
                echo json_encode(["status" => "success", "message" => "エッジが記録されました", "edge_id" => $logic_edges_id]);
            } else {
                echo json_encode(["status" => "error", "message" => "データベースエラー: " . $mysqli->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "必要なパラメータが不足しています (edge_start, edge_end)"]);
        }
    }
    
}

// else if ($purpose === 'update') {
//     if ($update_thing === 'node') {
//         $movedNodeId = $_POST["movedNodeId"];
//         $x = $_POST["x"];
//         $y = $_POST["y"];
//         $timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);

//         $sql = "UPDATE logic_node SET x = '$x', y = '$y', updated_at = '$timestamp' WHERE logic_node_id =  '$movedNodeId'";
//     }
// }

?>
