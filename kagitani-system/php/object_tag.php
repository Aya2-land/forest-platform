<?php
// マップのデータを読み出すための処理群

session_start();
require("connect_db.php");

// POSTデータの受け取り
$user_id = $_SESSION['USERID'];      //ユーザID
$sheet_id = $_SESSION['MAPID'];    //シートID


$return_data = [];

$purpose = $_POST["purpose"]; //loadかfetchか

if($purpose === 'fetch'){
    // object_tagテーブルからタグを取得
    $sql = "SELECT tag_type FROM object_tags ORDER BY timestamp DESC";
    $result = $mysqli->query($sql);

    $tags = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $tags[] = $row; // 結果を配列に格納
        }
    }

    // JSON形式で返す
    echo json_encode($tags);

    // 接続を閉じる
    $mysqli->close();

}else if ($purpose === 'save') {
    $tag_type = $_POST['tag_type'];
    $object_tag_id = uniqid('tag_', true);
    $timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
    $sql = $mysqli->query("INSERT INTO object_tags (object_tag_id, tag_type, timestamp) 
    VALUES ('$object_tag_id', '$tag_type', '$timestamp')");

    // SQLクエリの確認
	echo "実行するSQLクエリ: " . $sql . "<br>";
		
	// クエリの実行
	if (!$mysqli->query($query)) {
		// エラーハンドリング
		echo "SQLエラー: " . $mysqli->error . "<br>";
		echo "エラーコード: " . $mysqli->errno . "<br>";
	} else {
		echo "データが正常に挿入されました<br>";
	}


}
