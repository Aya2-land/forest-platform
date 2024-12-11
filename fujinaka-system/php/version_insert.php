<?php

session_start();
require("connect_db.php");


$map_version_id = $_POST['version_id'];	//バージョンID


if (!empty($_POST['content'])) {

        $content = $_POST['content'];

        $sql = "UPDATE versions SET paper_content = '$content' WHERE version_id = '$map_version_id'";

        echo $sql;

        $result = $mysqli->query($sql);
    
} else{
        $user_id = $_SESSION['USERID'];      	//ユーザID
        $user_name = $_SESSION['USERNAME'];	//ユーザ名
        $map_id = $_SESSION['MAPID'];    	//シートID
        $paper_title = $_POST['paper_title'];   //論文タイトル
        $timestamp = date("Y-m-d H:i:s") . "." . substr(explode(".", (microtime(true) . ""))[1], 0, 3);
        $node_version_id = rand();

        $sql = "INSERT INTO versions (version_id, user_id, user_name, map_id, paper_title, created_at) VALUES ('$map_version_id', '$user_id', '$user_name', '$map_id', '$paper_title', '$timestamp')";

        $result = $mysqli->query($sql);

        $sql = "INSERT INTO node_versions (node_version_id, node_id, parent_id, type_id, appeared_at, content, concept_id, x, y) 
                SELECT '".$node_version_id."' AS node_version_id, node_id, '".$map_version_id."' AS map_version_id, parent_id, type_id, appeared_at, content, concept_id, x, y
                FROM node_latest WHERE node_id IN (SELECT node_id FROM map_node_links WHERE map_id='$map_id')";

        $result = $mysqli->query($sql);

        $sql = "INSERT INTO version_chapter (version_id, chapter_id, user_id, map_id, title, rank) 
                SELECT '$map_version_id', chapter_id, '$user_id', '$map_id', title, rank
                FROM chapter WHERE map_id='$map_id' AND deleted = 0";
        

        $result = $mysqli->query($sql);


        $sql = "INSERT INTO version_section (version_id, section_id, user_id, map_id, chapter_id, title, rank) 
                SELECT '$map_version_id', section_id, '$user_id', '$map_id', chapter_id, title, rank
                FROM section WHERE map_id='$map_id' AND deleted = 0";
        $result = $mysqli->query($sql);


        $sql = "INSERT INTO version_paragraph (version_id, paragraph_id, user_id, map_id, section_id, title, rank, content) 
                SELECT '$map_version_id', paragraph_id, '$user_id', '$map_id', section_id, title, rank, content
                FROM paragraph WHERE map_id='$map_id' AND deleted = 0";

        $result = $mysqli->query($sql);


        $sql = "INSERT INTO version_content_rank (version_id, content_id, node_id, concept_id, rank, content, paragraph_id, type, indent, user_id, map_id) 
                SELECT '$map_version_id', content_id, node_id, concept_id, rank, content, slide_id, type, indent, '$user_id', '$map_id'
                FROM slide_content_rank WHERE map_id='$map_id' AND deleted = 0";

        $result = $mysqli->query($sql);


        $sql = "INSERT INTO version_feedback (version_id, feedback_id, user_id, map_id, node_id, node_concept, content, feedback_status) 
                SELECT '$map_version_id', feedback_id, '$user_id', '$map_id', node_id, node_concept, content, feedback_status
                FROM feedback WHERE map_id='$map_id'";

        $result = $mysqli->query($sql);
}



?>