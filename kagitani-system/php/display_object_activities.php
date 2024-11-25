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

if($purpose === "select_meeting_utterance") { //こいつを取ってきていることが判明したぞお
    /*
     * 議論における発話パーツ一覧
     */
    //活動ログの表示
    $result_objectLog = $mysqli->query("SELECT timestamp, obejct_node_id, activity_text FROM object_activities ORDER BY timestamp DESC");
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
        var_dump($return_data);  // ここでデータを確認
        
        //デバッグの後、$return_data を JSON 形式に変換して出力
        //JSON（JavaScript Object Notation）とは、データをシンプルかつわかりやすく表現するフォーマットの1つ．
        echo json_encode($return_data);  // 最終的なデータをJSONとして返す
        exit;
    }
}
