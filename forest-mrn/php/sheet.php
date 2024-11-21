<?php
	/*index.phpでシート名を表示する*/
	function getSheetname(){

		require "connect_db.php";

		$sql = "SELECT * FROM sheets WHERE id = ".$_SESSION["SHEETID"];

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				echo $row["name"];
				$_SESSION["SHEETNAME"] = $row["name"];


			}

		}

	}

	/*select_sheet.phpで既に作成済みのシートを表示する*/
	function showSheet(){

		require "connect_db.php";

		$id = $_SESSION['USERID'];
		$sql = "SELECT * FROM sheets WHERE user_id = '$id' AND self_conversation_activity_mode = 'self_research' ORDER BY updated_at DESC";
		if($result = $mysqli->query($sql)){
			while($row = mysqli_fetch_assoc($result)){
				echo"<p><label><input type='radio' name='sheet' value='".$row['id']."'>"  .$row['updated_at'].  "  "  .$row['name'].  "</label></p>";
			}

		}

	}

	/*select_sheet.phpからシートを新規作成する*/
	function createSheet(){

		require "connect_db.php";
		date_default_timezone_set('Asia/Tokyo');

		$_SESSION["SHEETID"] = rand(); //ここでセッションが定義されているらしい
		$map_version = rand();	//hatakeyama not unique
		$created_at = date("Y-m-d H:i:s");
		$deleted = 0;

		//if($name == ""){

			$sql = "INSERT INTO sheets (id, user_id, created_at, name, updated_at, deleted, self_conversation_activity_mode) VALUES (".$_SESSION['SHEETID'].", ".$_SESSION['USERID'].", '".$created_at."', '".$_POST['sheetname']."', '".$created_at."','".$deleted."', 'self_research')";
			if (!$result = $mysqli->query($sql)) {
		      print('Error - SQLSTATE'. mysqli_error($link));
		      exit();
		    }

			//hatakeyama mapsにINSERTする.
			$sql_m = "INSERT INTO maps (map_id, name, created_at, deleted_at, user_id) VALUES (".$_SESSION['SHEETID'].", '".$_POST['sheetname']."', '".$created_at."', NULL, ".$_SESSION['USERID'].")";
			if (!$result = $mysqli->query($sql_m)) {
		      print('Error - SQLSTATE'. mysqli_error($link));
		      exit();
		    }

			//hatakeyama map_versionsにver.1をINSERTする.
			$sql_mv = "INSERT INTO map_versions (id, map_id, appeared_at, disappeared_at, type, updated_reason) VALUES ($map_version, '".$_SESSION['SHEETID']."', '".$created_at."', NULL, 'new', NULL)";
			if (!$result = $mysqli->query($sql_mv)) {
		      print('Error - SQLSTATE'. mysqli_error($link));
		      exit();
		    }

			header("Location: index.php");

		/*}else{

			echo "<script>alert('既に存在するシート名');</script>";
			header("Location: select_sheet.php");

		}*/

	}

	/*select_sheet.phpからシートを新規作成する*/
	//2022-11-24 shimizu
	function createDocument(){

		require "connect_db.php";
		date_default_timezone_set('Asia/Tokyo');

		$_SESSION["SHEETID"] = rand();
		$created_at = date("Y-m-d H:i:s");
		$deleted = 0;

		$sql = "INSERT INTO documents (id, user_id, created_at, name, updated_at, deleted) VALUES (".$_SESSION['SHEETID'].", ".$_SESSION['USERID'].", '".$created_at."', '".$_POST['sheetname']."', '".$created_at."','".$deleted."')";
		if (!$result = $mysqli->query($sql)) {
			print('Error - SQLSTATE'. mysqli_error($link));
			exit();
		}
		
		//hatakeyama mapsにINSERTする.
		$sql_m = "INSERT INTO maps (map_id, name, created_at, deleted_at, user_id) VALUES (".$_SESSION['SHEETID'].", '".$_POST['sheetname']."', '".$created_at."', NULL, ".$_SESSION['USERID'].")";
		if (!$result = $mysqli->query($sql_m)) {
		  print('Error - SQLSTATE'. mysqli_error($link));
		  exit();
		}

		//hatakeyama map_versionsにver.1をINSERTする.
		$sql_mv = "INSERT INTO map_versions (id, map_id, appeared_at, disappeared_at, type, updated_reason) VALUES (".$map_version.", '".$_SESSION['SHEETID']."', '".$created_at."', NULL, 'new', NULL)";
		if (!$result = $mysqli->query($sql_mv)) {
		  print('Error - SQLSTATE'. mysqli_error($link));
		  exit();
		}


		header("Location: index.php");

	}

	function deleteSheet(){
		require "connect_db.php";

		$deleted = 0;
		$updated_at = date("Y-m-d H:i:s");
		echo $_SESSION['SHEETID'];
		$sql = "DELETE FROM sheets WHERE id = ".$_SESSION['SHEETID'];
		$result = $mysqli->query($sql);
		if (!$result) {
		     print('Error - SQLSTATE');
		     exit();
		 }

		//hatakeyama mapsの削除（deleted_atに値を入れる）
		$sql_md = "UPDATE maps SET deleted_at = '".$updated_at."' WHERE map_id = ".$_SESSION['SHEETID'];
		$result_md = $mysqli->query($sql_md);

		//hatakeyama map_versionsの削除（deleted_atに値を入れる）
		$sql_mvd = "UPDATE map_versions SET disappeared_at = '".$updated_at."' WHERE map_id = ".$_SESSION['SHEETID']." AND appeared_at = (select max(appeared_at) from (select appeared_at from map_versions) temp)";
		$result_mvd = $mysqli->query($sql_mvd);

		 header("Location: select_sheet.php");

	}

	//2022-11-24 shimizu
	function deleteDocument(){
		require "connect_db.php";

		$deleted = 0;
		$updated_at = date("Y-m-d H:i:s");
		echo $_SESSION['SHEETID'];
		$sql = "DELETE FROM documents WHERE id = ".$_SESSION['SHEETID'];
		$result = $mysqli->query($sql);
		if (!$result) {
		     print('Error - SQLSTATE');
		     exit();
		 }
		 header("Location: select_sheet.php");

	}

// ==================================== matsuoka ==================================

	// index.phpで，ユーザのMT時間一覧を表示する
	function get_mttiming(){

		require "connect_db.php";

		$id = $_SESSION['USERID'];
	  $sql = " SELECT mt_time FROM mt_timing WHERE user_id = '$id' ORDER BY mt_time DESC";

		$array = array();

	  if($result = $mysqli->query($sql)) {
			// echo" <option value='null'>選択してください</option>";
	    while($row = mysqli_fetch_assoc($result)){
	     	echo" <option value='".$row['mt_time']."'>"  .$row['mt_time']. "</option>" ;
				array_push($array, $row['mt_time']); // あとで取り出せるように配列化
	    }
		}
		$_SESSION['last_mttime'] = $array[0]; // 前回のMTタイムをSESSIONで取り出せるように
	}

?>
