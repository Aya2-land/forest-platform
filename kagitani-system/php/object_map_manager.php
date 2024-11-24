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

/*
 * すべてのマップ履歴について，開始と終了（リフレクションの開始＿過去のリフレクションの終了）時刻を取得
 */
$result_map_create_start_and_end = $mysqli->query("SELECT * FROM network_sturuct_activity WHERE user_id = $user_id AND sheet_id = $sheet_id ORDER BY start_time DESC");

$map_create_start_and_end = [];
$latest_map_created_time = null; // 最初にヒットしたもの（現在の最新状態のもの）を履歴情報から除外するためのフラグ
while ($row = $result_map_create_start_and_end->fetch_assoc()) {
    $latest_map_created_time === null ? $latest_map_created_time = $row['start_time'] : array_push($map_create_start_and_end, $row); // 最新のやつは除外してそれ以外はPUSH
}

// if(!empty($first_load_flag)) {
//     // 最初の読み込みの処理のときだけ，最新のマップ作成時間を取得
//     $target_map_created_start_times = $latest_map_created_time;
// } else {
//     // 過去のマップを読み出そうとするとき
//     $target_map_created_start_times = $_POST["first_load_flag"];
// }

//$return_data = array_merge($return_data, ["map_create_start_and_end" => $map_create_start_and_end]);


if($purpose === "record_meeting_utterance") {
    // ミーティングの発話をノードごとに保存する処理

    /*
     * マップ作成開始時間の記録・直前までのMapの終了時刻のアップデート
     *   手続きは，まず過去の最新のマップの終了時刻を更新，次に，その更新した時刻TIMESTAMPをSELECT取得，最後にそのタイムスタンプと同じ時刻の新規マップデータを挿入
     */
    $et_update_query = "UPDATE network_sturuct_activity SET end_time = CURRENT_TIMESTAMP(), situation = 'end'
                                                       WHERE user_id = $user_id AND
                                                             sheet_id = $sheet_id AND
                                                             start_time in
                                                             ( SELECT * FROM (SELECT MAX(start_time) FROM network_sturuct_activity
                                                                                    WHERE user_id = $user_id AND
                                                                                          sheet_id = $sheet_id
                                                             ) AS MAX_START_TIME)";
    $mysqli->query($et_update_query);
    $map_renewal_time_query = "SELECT MAX(end_time) FROM network_sturuct_activity WHERE user_id = $user_id AND sheet_id = $sheet_id ORDER BY end_time DESC"; // XMLからのデータを引き渡された時間（マップを新しく作り始めた時間＝リフレクションが次のフェーズにうつったとき）
    $result_map_renewal_time_tmp = $mysqli->query($map_renewal_time_query);
    $row = $result_map_renewal_time_tmp->fetch_assoc();
    $map_renewal_time_tmp = $row['MAX(end_time)'];
    $map_renewal_time = $map_renewal_time_tmp === null ? "CURRENT_TIMESTAMP" : "'$map_renewal_time_tmp'"; // 過去に作ったマップが１つもないときは現在時刻指定
    $st_record_query = "INSERT INTO network_sturuct_activity (user_id, sheet_id, start_time, end_time, situation) VALUES
                                              ($user_id, $sheet_id, $map_renewal_time, $map_renewal_time, 'start')";
    $res = $mysqli->query($st_record_query);

        /*
    * 発話ノードの記録（network_textへのデータ挿入）
    */
    $jsonDataArray = json_decode($_POST['utters'], true);
    
    $nt_record_query = "INSERT INTO network_text (user_id, sheet_id, area_id, sender, content, time, JPNtime, ST_Time) VALUES ";
    foreach ($jsonDataArray as $jsonData) {
        $id = $mysqli->real_escape_string($jsonData['message_id']);
        $content = $mysqli->real_escape_string($jsonData['content']);
        $sender = $mysqli->real_escape_string($jsonData['sender']);
        $time = $mysqli->real_escape_string($jsonData['time']);
        $JPNtime = $mysqli->real_escape_string($jsonData['JPNtime']);
        
        $nt_record_query .= "($user_id, $sheet_id, $id, '$sender', '$content', $time, '$JPNtime', $map_renewal_time), ";
    }
    $nt_record_query = rtrim($nt_record_query,", ");
    $mysqli->query($nt_record_query);
    return;
}



if($purpose === "select_meeting_utterance") { //こいつを取ってきていることが判明したぞお
    /***
     *** ここから議論内省マップデータの取得（SELECT）処理
     ***/

    $return_data = array_merge($return_data, ['start_time' => $target_map_created_start_times]);

    /*
     * 議論内省マップのノードデータと思考整理マップのノードの対応関係データを取得する処理
     */
    // $result_forest_node_and_discussionmap_node_relation = $mysqli->query("SELECT network_node_id, mindmap_node_id FROM network_mindmap_connect
    //           WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$target_map_created_start_times'
    //           ORDER BY time DESC ");
    
    // $forest_node_and_discussionmap_node_relation = [];
    // while ($row = $result_forest_node_and_discussionmap_node_relation->fetch_assoc()) {
    //     array_push($forest_node_and_discussionmap_node_relation, $row);
    // }
    // $return_data = array_merge($return_data, ['fnode_dnode_rel' => $forest_node_and_discussionmap_node_relation]);
    
    
    /* 
     * オントロジーとの対応データの読み込み
     */
    // $result_discussionmap_node_and_ontology_relation = $mysqli->query("SELECT ontology_id, node_id FROM network_ontology_activity
    //           WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$target_map_created_start_times'
    //           ORDER BY time DESC ");
    // $discussionmap_node_and_ontology_relation = [];
    // while ($row = $result_discussionmap_node_and_ontology_relation->fetch_assoc()) {
    //     array_push($discussionmap_node_and_ontology_relation, $row);
    // }
    // $return_data = array_merge($return_data, ['dnode_ontology_rel' => $discussionmap_node_and_ontology_relation]);    
    
    /*
     * 議論内省マップのノードデータの取得
     */

    $result_discussionmap_node = $mysqli->query("SELECT `object_node_id`, `object_map_id`, `label`, `x`, `y`, `object_nodes_type_id`, `created_at`, `updated_at`, `deleted`
                FROM `object_nodes`
                WHERE `deleted` = 0
                ORDER BY `updated_at` DESC;
                ");
    $discussionmap_node = [];  //空の配列として初期化されます。この配列に、取得したノードの情報を格納
    //fetch_assoc() は、クエリの結果から1行を連想配列（カラム名をキーにした配列）として取り出す．
    //array_push($discussionmap_node, $row);: 取得した行（$row）を、$discussionmap_node 配列に追加します。この操作をクエリの結果がすべて取り出されるまで繰り返します。
    while ($row = $result_discussionmap_node->fetch_assoc()) {
        array_push($discussionmap_node, $row);
    }

    //既存の $return_data 配列に、新たに取得したノード情報（$discussionmap_node）を 'dnode' というキーで追加します。
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
    

    /*
     * 採用のデータの取得
     */
    // $result_recruit = $mysqli->query("SELECT node_id, ontology_id, result_recruit, reason FROM network_recruit
    //           WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$target_map_created_start_times'
    //           ORDER BY time DESC ");
    // $recruit = [];
    // while ($row = $result_recruit->fetch_assoc()) {
    //     array_push($recruit, $row);
    // }
    // $return_data = array_merge($return_data, ['recruit' => $recruit]);


    /*
    * 未完成?，資料のタイトルを取ってくる（今残ってる資料を取ってきてるから過去の資料を見たいならまだできない）
    */
    // $result_document_title = $mysqli->query("SELECT node_id, title, id, slide_id, concept_id FROM document_rank
    //                         WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND deleted = 0");
    // $document_title = [];
    // while ($row = $result_document_title->fetch_assoc()) {
    //     array_push($document_title, $row);
    // }
    // $return_data = array_merge($return_data, ['document_title' => $document_title]);


    // $result_document = $mysqli->query("SELECT id, content_id, node_id, concept_id, content, slide_id FROM document_content_rank
    //                     WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND deleted = 0 ");
    // $document = [];
    // while ($row = $result_document->fetch_assoc()) {
    // array_push($document, $row);
    // }
    // $return_data = array_merge($return_data, ['document' => $document]);

    // userIDがないから一意に特定できるかわからん．清水さんに確認
    // $result_document_relation = $mysqli->query("SELECT node1_id, doc_con1_id, doc_con1_label, node2_id, doc_con2_id, doc_con2_label FROM document_content_relation
    //     WHERE sheet_id = '$sheet_id' AND deleted = 0");
    // $document_relation = [];
    // while ($row = $result_document_relation->fetch_assoc()) {
    //     array_push($document_relation, $row);
    // }
    // $return_data = array_merge($return_data, ['document_relation' => $document_relation]);
    
    
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

// }else if($purpose === "select_version_discussionmap"){
//     $result_discussionmap_create_start_time = $mysqli->query("SELECT start_time FROM network_sturuct_activity 
//                 WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' 
//                 AND start_time < '$first_load_flag' AND end_time > '$first_load_flag'");
//     if (empty($result_discussionmap_create_start_time) ||
//         $result_discussionmap_create_start_time->num_rows === 0 ||
//         $result_discussionmap_create_start_time->num_rows === null) {
//         // エンドタイムが今の最新時刻を含むものが存在しない（まだ最新のリフレクションを閉じていない）場合，現状最新の時刻のマップを取得する
//         $res = $mysqli->query("SELECT MAX(start_time) FROM network_sturuct_activity 
//                 WHERE user_id = '$user_id' AND sheet_id = '$sheet_id'"); // 一番最新のマップの時間
//         $result_discussionmap_create_start_time = $res->fetch_assoc()['MAX(start_time)'];
//     }else{
//         $result_discussionmap_create_start_time = $result_discussionmap_create_start_time->fetch_assoc()['start_time'];
//     }
//     $return_data = array_merge($return_data, ['result_discussionmap_create_start_time' => $result_discussionmap_create_start_time]);

//      /*
//      * 議論内省マップのノードデータと思考整理マップのノードの対応関係データを取得する処理
//      */
//     $result_forest_node_and_discussionmap_node_relation = $mysqli->query("SELECT network_node_id, mindmap_node_id FROM network_mindmap_connect
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$result_discussionmap_create_start_time' AND time < '$first_load_flag'
//               ORDER BY time DESC ");
    
//     $forest_node_and_discussionmap_node_relation = [];
//     while ($row = $result_forest_node_and_discussionmap_node_relation->fetch_assoc()) {
//         array_push($forest_node_and_discussionmap_node_relation, $row);
//     }
//     $return_data = array_merge($return_data, ['fnode_dnode_rel' => $forest_node_and_discussionmap_node_relation]);
    
    
//     /* 
//      * オントロジーとの対応データの読み込み
//      */
//     $result_discussionmap_node_and_ontology_relation = $mysqli->query("SELECT ontology_id, node_id FROM network_ontology_activity
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$result_discussionmap_create_start_time' AND time < '$first_load_flag'
//               ORDER BY time DESC ");
//     $discussionmap_node_and_ontology_relation = [];
//     while ($row = $result_discussionmap_node_and_ontology_relation->fetch_assoc()) {
//         array_push($discussionmap_node_and_ontology_relation, $row);
//     }
//     $return_data = array_merge($return_data, ['dnode_ontology_rel' => $discussionmap_node_and_ontology_relation]);    
    
//     /*
//      * 議論内省マップのノードデータの取得--ここ編集してみる
//      */
//     $result_discussionmap_node = $mysqli->query("SELECT node_id, label, node_x, node_y, node_type FROM object_nodes
//             WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND updated_time >= '$result_discussionmap_create_start_time' AND updated_time < '$first_load_flag'
//             ORDER BY updated_time DESC ");
//     $discussionmap_node = [];
//     while ($row = $result_discussionmap_node->fetch_assoc()) {
//         array_push($discussionmap_node, $row);
//     }
//     $return_data = array_merge($return_data, ['dnode' => $discussionmap_node]);

//     /*
//      * 議論内省マップのエッジデータの取得
//      */
//     $result_discussionmap_edge = $mysqli->query("SELECT edge_start, edge_end, edge_label FROM network_edges_activity
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time >= '$result_discussionmap_create_start_time' AND time < '$first_load_flag'
//               ORDER BY time DESC ");
//     $discussionmap_edge = [];
//     while ($row = $result_discussionmap_edge->fetch_assoc()) {
//         array_push($discussionmap_edge, $row);
//     }
//     $return_data = array_merge($return_data, ['dedge' => $discussionmap_edge]);

//     /*
//      * 採用の取得
//      */
//     $result_recruit = $mysqli->query("SELECT node_id, ontology_id, result_recruit FROM network_recruit
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$result_discussionmap_create_start_time' AND time < '$first_load_flag'
//               ORDER BY time DESC ");
//     $recruit = [];
//     while ($row = $result_recruit->fetch_assoc()) {
//         array_push($recruit, $row);
//     }
//     $return_data = array_merge($return_data, ['recruit' => $recruit]);

//     if (empty($return_data)) {
//         echo json_encode(["error" => "not"]);
//         return;
//     } else {
//         echo json_encode($return_data);
//         return;
//     }
// }else if($purpose === "select_past_discussionmap"){
    
//     $discussion_start_time = $_POST["discussion_start_time"];
//     $discussion_end_time = $_POST["discussion_end_time"];
//      /*
//      * 議論内省マップのノードデータと思考整理マップのノードの対応関係データを取得する処理
//      */
//     $result_forest_node_and_discussionmap_node_relation = $mysqli->query("SELECT network_node_id, mindmap_node_id FROM network_mindmap_connect
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$discussion_start_time' AND time < '$discussion_end_time'
//               ORDER BY time DESC ");
    
//     $forest_node_and_discussionmap_node_relation = [];
//     while ($row = $result_forest_node_and_discussionmap_node_relation->fetch_assoc()) {
//         array_push($forest_node_and_discussionmap_node_relation, $row);
//     }
//     $return_data = array_merge($return_data, ['fnode_dnode_rel' => $forest_node_and_discussionmap_node_relation]);
    
    
//     /* 
//      * オントロジーとの対応データの読み込み
//      */
//     $result_discussionmap_node_and_ontology_relation = $mysqli->query("SELECT ontology_id, node_id FROM network_ontology_activity
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$discussion_start_time' AND time < '$discussion_end_time'
//               ORDER BY time DESC ");
//     $discussionmap_node_and_ontology_relation = [];
//     while ($row = $result_discussionmap_node_and_ontology_relation->fetch_assoc()) {
//         array_push($discussionmap_node_and_ontology_relation, $row);
//     }
//     $return_data = array_merge($return_data, ['dnode_ontology_rel' => $discussionmap_node_and_ontology_relation]);    
    
//     /*
//      * 議論内省マップのノードデータの取得
//      */
//     $result_discussionmap_node = $mysqli->query("SELECT node_id, label, node_x, node_y, node_type FROM network_nodes_activity
//             WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND updated_time >= '$discussion_start_time' AND updated_time < '$discussion_end_time'
//             ORDER BY updated_time DESC ");
//     $discussionmap_node = [];
//     while ($row = $result_discussionmap_node->fetch_assoc()) {
//         array_push($discussionmap_node, $row);
//     }
//     $return_data = array_merge($return_data, ['dnode' => $discussionmap_node]);

//     /*
//      * 議論内省マップのエッジデータの取得
//      */
//     $result_discussionmap_edge = $mysqli->query("SELECT edge_start, edge_end, edge_label FROM network_edges_activity
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time >= '$discussion_start_time' AND time < '$discussion_end_time'
//               ORDER BY time DESC ");
//     $discussionmap_edge = [];
//     while ($row = $result_discussionmap_edge->fetch_assoc()) {
//         array_push($discussionmap_edge, $row);
//     }
//     $return_data = array_merge($return_data, ['dedge' => $discussionmap_edge]);

//     /*
//      * 採用の取得
//      */
//     $result_recruit = $mysqli->query("SELECT node_id, ontology_id, result_recruit FROM network_recruit
//               WHERE user_id = '$user_id' AND sheet_id = '$sheet_id' AND time > '$discussion_start_time' AND time < '$discussion_end_time'
//               ORDER BY time DESC ");
//     $recruit = [];
//     while ($row = $result_recruit->fetch_assoc()) {
//         array_push($recruit, $row);
//     }
//     $return_data = array_merge($return_data, ['recruit' => $recruit]);

//     if (empty($return_data)) {
//         echo json_encode(["error" => "not"]);
//         return;
//     } else {
//         echo json_encode($return_data);
//         return;
//     }
// }
