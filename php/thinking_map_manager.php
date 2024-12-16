<?php
// 議論内省マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

// POSTデータの受け取り
$user_id = $_SESSION['USERID'];      //ユーザID
$map_id = $_SESSION['MAPID'];    //マップID
$selected_conID = $_POST['selected_concept_id'];
$return_data = []; // DBアクセスの結果として返すキー・バリューのペア

$timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);

$selected_node_id = $_POST["selected_node_id"]; //マインドマップで選択されたノードID

// 選択されたノードのconcept_labelを取得
if($selected_conID){
    $xml_data = simplexml_load_file('../js/hozo.xml'); //法造データ取り出し
    $conLABEL = $xml_data->xpath('W_CONCEPTS/CONCEPT[@id="'.$selected_conID.'"]/LABEL/text()');
    $concept_name = !empty($conLABEL) ? (string)$conLABEL[0] : '';
    $return_data = array_merge($return_data, ['selected_concept' => $concept_name]);
}

/*
    * triggerの候補一覧
*/
$result_t_candidate = $mysqli->query("SELECT activity_id, activity_type, concept_id, content, appeared_at, trigger_on FROM trigger_candidates
WHERE map_id = '$map_id' ORDER BY appeared_at DESC");
$t_candidate = [];
$t_candidate_concept = [];

if (!$result_t_candidate) {
    echo "SELECT id, activity_type, concept_id, content, appeared_at, trigger_on FROM trigger_candidates WHERE map_id = '$map_id' ORDER BY appeared_at DESC";
    return;
}

// concept名を取り出し
while ($row = $result_t_candidate->fetch_assoc()) {
    $conID = $row["concept_id"];
    $conLABEL = $xml_data->xpath('W_CONCEPTS/CONCEPT[@id="'.$conID.'"]/LABEL/text()');
    $row['concept_label'] = !empty($conLABEL) ? (string)$conLABEL[0] : '';
    array_push($t_candidate, $row);
}
$return_data = array_merge($return_data, ['trigger_candidate' => $t_candidate]);

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

?>