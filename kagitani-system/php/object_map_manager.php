<?php
// 議論内省マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

// POSTデータの受け取り
$user_id = $_SESSION['USERID'];      //ユーザID
$sheet_id = $_SESSION['SHEETID'];    //シートID

$purpose = $_POST["purpose"]; // どんなデータを取得したり保存したりするのか（内容．例：発話ノードのXMLからの保存orマップノードの取得）

$target_map_created_start_times = null;  // リフレクションの開始時間
$first_load_flag = $_POST["first_load_flag"]; // どんなデータがほしいというリクエストなのかを判定

$return_data = []; // DBアクセスの結果として返すキー・バリューのペア

if($purpose === "select_meeting_utterance") { //こいつを取ってきていることが判明したぞお
    //updated_atが最新のマップIDを獲得する．
    // 最新の map_id を取得
    $latest_map_id_result = $mysqli->query("SELECT `map_id` FROM `object_maps` ORDER BY `updated_at` DESC LIMIT 1;");
    if ($latest_map_id_result->num_rows > 0) {
        $latest_map_id_row = $latest_map_id_result->fetch_assoc();
        $latest_map_id = $latest_map_id_row['map_id'];
    } else {
        die("No map_id found in object_maps table.\n");
    }

    // 最新の map_id に関連するノードを取得
    $stmt = $mysqli->prepare("
        SELECT `object_node_id`, `object_map_id`, `label`, `x`, `y`, `object_nodes_type_id`, `created_at`, `updated_at`, `deleted`
        FROM `object_nodes`
        WHERE `deleted` = 0 
        AND `object_map_id` = ?
        ORDER BY `updated_at` DESC;
    ");
    $stmt->bind_param('s', $latest_map_id); // 's' は文字列型を意味します
    $stmt->execute();
    $result_discussionmap_node = $stmt->get_result();

    $discussionmap_node = [];
    while ($row = $result_discussionmap_node->fetch_assoc()) {
        $discussionmap_node[] = $row; // 配列に追加
    }

    // $return_data にノード情報を追加
    $return_data = array_merge($return_data, ['dnode' => $discussionmap_node]);


    /*
     * 議論内省マップのエッジデータの取得
     */
    $result_discussionmap_edge = $mysqli->query("SELECT object_edges_id, edge_start, edge_end FROM object_edges
              ORDER BY time DESC ");
    $discussionmap_edge = [];
    while ($row = $result_discussionmap_edge->fetch_assoc()) {
        array_push($discussionmap_edge, $row);
    }
    $return_data = array_merge($return_data, ['dedge' => $discussionmap_edge]);

    /*
     * 議論における発話パーツ一覧
     */
    //活動ログの表示
    $result_objectLog = $mysqli->query("SELECT timestamp, node_id, concept_id, act, text FROM activities
            WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND type != 'question' ORDER BY timestamp DESC");
    $objectLog = [];
    while ($row = $result_objectLog->fetch_assoc()) {
        array_push($objectLog, $row);
    }
    $return_data = array_merge($return_data, ['objectLog' => $objectLog]);
    
    if (empty($return_data)) {  //$return_data が空（null、空の配列、空文字列など）かどうかを確認
        echo json_encode(["error" => "not"]);  //["error" => "not"] という連想配列（キーが error、値が not）を json_encode 関数で JSON 形式に変換して出力
        return;
    } else {
        // $return_data にデータがある場合、この部分が実行
        //var_dump($return_data);  // ここでデータを確認
        
        //デバッグの後、$return_data を JSON 形式に変換して出力
        //JSON（JavaScript Object Notation）とは、データをシンプルかつわかりやすく表現するフォーマットの1つ．
        echo json_encode($return_data);  // 最終的なデータをJSONとして返す
        exit;
    }
}
