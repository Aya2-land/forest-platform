<?php
// データベースに接続
function connectDB_Test() {
    require 'php/connect_db.php';

    $dsn = sprintf('mysql: host=%s; port=%s; dbname=%s; charset=utf8', $db_host, $port, $db_dbname);
    // $param = 'mysql:dbname=shimizu;host=localhost';
    try {
        $pdo = new PDO($dsn, 'root', 'root');
        // $pdo = new PDO($param, 'root', 'kslabkslab');
        return $pdo;

    } catch (PDOException $e) {
        exit($e->getMessage());
    }
}

function test(){
    print("test");
}
?>