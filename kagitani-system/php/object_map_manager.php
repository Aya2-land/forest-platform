<?php
// 議論内省マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

// POSTデータの受け取り
$user_id = $_SESSION['USERID'];      //ユーザID
$map_id = $_SESSION['MAPID'];    //マップID

//all...選択されたノードの変遷
//brother...選択されているノードの兄弟ノードの変遷を追加
$process_mode = $_POST['process_mode']; 

$selected_conID = $_POST["selected_concept_id"]; //マインドマップで選択されたノードのconceptID
$selected_node_id = $_POST["selected_node_id"]; //マインドマップで選択されたノードID

$return_data = []; // DBアクセスの結果として返すキー・バリューのペア

if($process_mode === "all" || $process_mode === "allRE" ){
    if (isset($_POST['concept_ids'])) {
        $conIDs_base = $_POST['concept_ids'];

        // 配列で渡されるので変換
        if (!empty($conIDs_base)) {
            $conIDs_base = array_map(function($id) use ($mysqli) {
                // 各IDをエスケープして安全に挿入
                return "'" . $mysqli->real_escape_string($id) . "'";
            }, $conIDs_base);
            
            // 配列をカンマ区切りの文字列に変換
            $conIDs = implode(',', $conIDs_base);
        } else {
            // $conIDsが空の場合は空の文字列を使用
            $conIDs = "''"; // 空配列の場合は、SQL文が正しく評価されるように
        }
    } else {
        // concept_idsが存在しない場合の処理
        $conIDs = "''"; // デフォルトで空の文字列を設定
    }
    

    $timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);

    $xml_data = simplexml_load_file('../js/hozo.xml'); //法造データ取り出し

    // 選択されたノードのconcept_labelを取得
    if($selected_conID){
        $conLABEL = $xml_data->xpath('W_CONCEPTS/CONCEPT[@id="'.$selected_conID.'"]/LABEL/text()');
        $concept_name = !empty($conLABEL) ? (string)$conLABEL[0] : '';
        $return_data = array_merge($return_data, ['selected_concept' => $concept_name]);
    }

    /*
        * triggerの候補一覧
    */


    $result_t_candidate = $mysqli->query("SELECT DISTINCT activity_id, activity_type, concept_id, content, appeared_at, trigger_on FROM trigger_candidates
                                                        WHERE map_id = '$map_id' AND (concept_id IN ($conIDs) OR concept_id = '$selected_conID') ORDER BY appeared_at DESC");
    $t_candidate = [];
    $t_candidate_concept = [];

    if ($result_t_candidate) {
        // concept名を取り出し
        while ($row = $result_t_candidate->fetch_assoc()) {
            $conID = $row["concept_id"];
            $conLABEL = $xml_data->xpath('W_CONCEPTS/CONCEPT[@id="'.$conID.'"]/LABEL/text()');
            $row['concept_label'] = !empty($conLABEL) ? (string)$conLABEL[0] : '';
            array_push($t_candidate, $row);
        }
        $return_data = array_merge($return_data, ['trigger_candidate' => $t_candidate]);
    }

    /*
        * 目標手段階層マップのノードデータの取得    	
    */
    $result_object_node = $mysqli->query("SELECT object_node_id, content, object_nodes_type, node_x, node_y, status FROM object_nodes
            WHERE node_id = '".$selected_node_id."' AND deleted = 0");
    $object_node = [];
    while ($row = $result_object_node->fetch_assoc()) {
        array_push($object_node, $row);
    }
    $return_data = array_merge($return_data, ['onode' => $object_node]);

    /*
        * 目標手段階層マップのエッジデータの取得
        */
    $result_processmap_edge = $mysqli->query("SELECT object_edge_id, edge_start, edge_end, label FROM object_edges
        WHERE (edge_start IN (SELECT object_node_id FROM object_nodes WHERE node_id = '".$selected_node_id."' AND deleted = 0) 
           OR edge_end IN (SELECT object_node_id FROM object_nodes WHERE node_id = '".$selected_node_id."' AND deleted = 0)) 
        AND deleted = 0");
    
    if (!$result_processmap_edge) {
        // クエリエラーを出力
        error_log("SQLエラー: " . $mysqli->error);
        $return_data = array_merge($return_data, [
            'pedge' => [],
            'pedge_error' => $mysqli->error,
            'pedge_query' => "SELECT object_edge_id, edge_start, edge_end, label FROM object_edges
                WHERE (edge_start IN (SELECT object_node_id FROM object_nodes WHERE node_id = '".$selected_node_id."' AND deleted = 0) 
                   OR edge_end IN (SELECT object_node_id FROM object_nodes WHERE node_id = '".$selected_node_id."' AND deleted = 0)) 
                AND deleted = 0"
        ]);
    } else {
        $processmap_edge = [];
        while ($row = $result_processmap_edge->fetch_assoc()) {
            $processmap_edge[] = $row;
        }
        $return_data = array_merge($return_data, ['pedge' => $processmap_edge]);
    }

    /*
    * 目標手段階層マップの日付データの取得
    */
    $selected_node_id = $mysqli->real_escape_string($selected_node_id); // セキュリティのため
    $date_sql = "
        SELECT DISTINCT DATE(h.appeared_at) AS appeared_date
        FROM object_nodes_histories h
        JOIN object_nodes o ON h.object_node_id = o.object_node_id
        WHERE o.node_id = '$selected_node_id'
        ORDER BY appeared_date ASC
    ";
    
    $result = $mysqli->query($date_sql);
    
    $date_list = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $date_list[] = $row['appeared_date'];
        }
    } else {
        echo "SQL Error: " . $mysqli->error;
    }
    
    // 返却データに含める
    $return_data = $return_data ?? [];
    $return_data['dates'] = $date_list;
    

    // ノードのバージョン情報を取得
    $result_node_versions = $mysqli->query("SELECT node_version_id, parent_id, appeared_at, disappeared_at, content FROM node_versions WHERE node_id = '".$selected_node_id."'ORDER BY appeared_at ASC");
    $node_versions = [];
    while ($row = $result_node_versions->fetch_assoc()) {
        array_push($node_versions, $row);
    }
    $return_data = array_merge($return_data, ['node_versions' => $node_versions]);

    // triggerを取得
    $result_trigger = $mysqli->query("SELECT * FROM triggers
                            WHERE node_version_from IN (SELECT node_version_id FROM node_versions WHERE node_id = '".$selected_node_id."') AND deleted = 0");
    $trigger = [];
    while ($row = $result_trigger->fetch_assoc()) {
        array_push($trigger, $row);
    }
    $return_data = array_merge($return_data, ['trigger' => $trigger]);


    if (empty($return_data)) {
        echo json_encode(["error" => "not"]);
        return;
    } else {
        echo json_encode($return_data);
        return;
    }
}else if($process_mode === "AddBrother"){
    //兄弟ノードの数を取得
    $result_brother_num = $mysqli->query("SELECT process_node_id, content, process_node_type, node_x, node_y FROM process_nodes
            WHERE node_id = '".$selected_node_id."' AND deleted = 0");
    /*  
        * 思考過程表出化マップのノードデータの取得    	
    */
    $result_processmap_node = $mysqli->query("SELECT process_node_id, content, process_node_type, node_x, node_y FROM process_nodes
            WHERE node_id = '".$selected_node_id."' AND deleted = 0");
    $processmap_node = [];
    while ($row = $result_processmap_node->fetch_assoc()) {
        array_push($processmap_node, $row);
    }
    $return_data = array_merge($return_data, ['pnode' => $processmap_node]);

    /*
        * 思考過程表出化マップのエッジデータの取得
        */
    $result_processmap_edge = $mysqli->query("SELECT process_edge_id, edge_start, edge_end, label FROM process_edges
                WHERE (edge_start IN (SELECT process_node_id FROM process_nodes WHERE node_id = '".$selected_node_id."' AND deleted = 0) OR edge_end IN (SELECT process_node_id FROM process_nodes WHERE node_id = '".$selected_node_id."' AND deleted = 0))AND deleted = 0");
    $processmap_edge = [];
    while ($row = $result_processmap_edge->fetch_assoc()) {
        array_push($processmap_edge, $row);
    }
    $return_data = array_merge($return_data, ['pedge' => $processmap_edge]);

    // ノードのバージョン情報と対応するメインのバージョン情報を取得
    $result_node_versions = $mysqli->query("SELECT nv.node_version_id, nv.node_id, nv.parent_id, nv.appeared_at, nv.disappeared_at,nv.content, nv.x, nv.y, (
                                                            SELECT node_version_id FROM node_versions WHERE node_id = '".$selected_node_id."' AND appeared_at < nv.appeared_at ORDER BY appeared_at DESC LIMIT 1
                                                        ) AS broversion FROM node_versions nv
                                                        WHERE parent_id IN (SELECT parent_id FROM node_versions WHERE node_id = '".$selected_node_id."') AND node_id IN (SELECT node_id FROM nodes WHERE deleted = 0 AND node_id NOT LIKE '".$selected_node_id."') ORDER BY nv.appeared_at ASC");
    $node_versions = [];
    $brother_num = [];
    while ($row = $result_node_versions->fetch_assoc()) {
        array_push($node_versions, $row);
        // node_id を取得
        $node_id = $row['node_id'];
        
        // node_id がすでに存在するか確認する
        if (array_key_exists($node_id, $brother_num)) {
            // 既に存在する場合はカウントを増やす
            $brother_num[$node_id]++;
        } else {
            // まだ存在しない場合は初期カウントとして1を設定する
            $brother_num[$node_id] = 1;
        }
    }
    $return_data = array_merge($return_data, ['node_versions' => $node_versions]);
    $return_data = array_merge($return_data, ['brother_num' => $brother_num]);

    // triggerを取得
    $result_trigger = $mysqli->query("SELECT * FROM triggers
                            WHERE node_version_from IN (SELECT node_version_id FROM node_versions WHERE node_id = '".$selected_node_id."') AND deleted = 0");
    $trigger = [];
    while ($row = $result_trigger->fetch_assoc()) {
        array_push($trigger, $row);
    }
    $return_data = array_merge($return_data, ['trigger' => $trigger]);


    if (empty($return_data)) {
        echo json_encode(["error" => "not"]);
        return;
    } else {
        echo json_encode($return_data);
        return;
    }
}else if ($process_mode === "PassData") {

    $selected_node_id = $_POST['selected_node_id'] ?? null;
    $selectedDate = $_POST['selected_date'] ?? null;

    if (!$selected_node_id || !$selectedDate) {
        echo json_encode([
            'status' => 'invalid_input',
            'message' => 'selected_node_id または selected_date が不足しています',
            'data' => []
        ]);
        exit;
    }

    $datetime = $selectedDate . ' 23:59:59';

    // 1. object_nodes を取得
    $sql_object_nodes = "
        SELECT object_node_id
        FROM object_nodes
        WHERE node_id = '".$mysqli->real_escape_string($selected_node_id)."'
        AND created_at <= '".$mysqli->real_escape_string($datetime)."'
    ";
    error_log("SQL object_nodes: $sql_object_nodes");

    $result_object_nodes = $mysqli->query($sql_object_nodes);

    if (!$result_object_nodes) {
        echo json_encode([
            'status' => 'sql_error',
            'message' => 'object_nodes の SQL 実行に失敗: ' . $mysqli->error,
            'data' => [],
            'debug' => ['sql_object_nodes' => $sql_object_nodes]
        ]);
        exit;
    }

    $object_node_ids = [];
    while ($row = $result_object_nodes->fetch_assoc()) {
        $object_node_ids[] = $row['object_node_id'];
    }

    if (empty($object_node_ids)) {
        echo json_encode([
            'status' => 'empty_object_nodes',
            'message' => "node_id {$selected_node_id} に該当する object_node_id が存在しません（{$datetime} 以前）",
            'data' => [],
            'debug' => [
                'sql_object_nodes' => $sql_object_nodes,
                'selected_node_id' => $selected_node_id,
                'datetime' => $datetime
            ]
        ]);
        exit;
    }

    // 2. object_nodes_histories 取得
    $ids_string = implode(",", array_map(function ($id) use ($mysqli) {
        return "'" . $mysqli->real_escape_string($id) . "'";
    }, $object_node_ids));

    $sql_histories = "
        SELECT 
            object_node_id, content, object_node_type, x, y, status, appeared_at, disappeared_at
        FROM 
            object_nodes_histories
        WHERE 
            object_node_id IN ($ids_string)
            AND appeared_at <= '".$mysqli->real_escape_string($datetime)."'
            AND (disappeared_at IS NULL OR disappeared_at > '".$mysqli->real_escape_string($datetime)."')
        ORDER BY 
            object_node_id, appeared_at DESC
    ";
    error_log("SQL histories: $sql_histories");

    $result_histories = $mysqli->query($sql_histories);

    if (!$result_histories) {
        echo json_encode([
            'status' => 'sql_error',
            'message' => 'object_nodes_histories の SQL 実行に失敗: ' . $mysqli->error,
            'data' => [],
            'debug' => ['sql_histories' => $sql_histories]
        ]);
        exit;
    }

    // 最新履歴だけ取得
    $object_node_h = [];
    $seen_ids = [];

    while ($row = $result_histories->fetch_assoc()) {
        $oid = $row['object_node_id'];
        if (!in_array($oid, $seen_ids)) {
            $object_node_h[] = $row;
            $seen_ids[] = $oid;
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'データ取得成功',
        'data' => $object_node_h,
        'debug' => [
            'object_node_ids_count' => count($object_node_ids),
            'histories_found' => count($object_node_h),
            'sql_object_nodes' => $sql_object_nodes,
            'sql_histories' => $sql_histories,
            'selected_node_id' => $selected_node_id,
            'datetime' => $datetime
        ]
    ]);
}




?>