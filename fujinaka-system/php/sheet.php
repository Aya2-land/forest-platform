<?php
	/*index.phpでシート名を表示する*/
	function getSheetname(){

		require("connect_db.php");

		$sql = "SELECT * FROM sheets WHERE id = ".$_SESSION["MAPID"];

		if($result = $mysqli->query($sql)){

			while($row = mysqli_fetch_assoc($result)){

				echo $row["name"];
				$_SESSION["SHEETNAME"] = $row["name"];


			}

		}

	}

	/*select_sheet.phpで既に作成済みのシートを表示する*/
	function showSheet(){

		require("connect_db.php");

		$id = $_SESSION['USERID'];
		$sql = "SELECT * FROM sheets WHERE user_id = '$id' ORDER BY updated_at DESC";
		if($result = $mysqli->query($sql)){
			while($row = mysqli_fetch_assoc($result)){
				echo"<p><label><input type='radio' name='sheet' value='".$row['id']."'>"  .$row['updated_at'].  "  "  .$row['name'].  "</label></p>";
			}

		}

	}

	/*select_sheet.phpからシートを新規作成する*/
	function createSheet(){

		require("connect_db.php");
		date_default_timezone_set('Asia/Tokyo');

		$_SESSION["MAPID"] = rand();
		$created_at = date("Y-m-d H:i:s");
		$deleted = 0;

		//if($name == ""){

			$sql = "INSERT INTO sheets (id, user_id, created_at, name, updated_at, deleted) VALUES (".$_SESSION['MAPID'].", ".$_SESSION['USERID'].", '".$created_at."', '".$_POST['mapname']."', '".$created_at."','".$deleted."')";
			if (!$result = $mysqli->query($sql)) {
		      print('Error - SQLSTATE'. mysqli_error($link));
		      exit();
		    }

			header("Location: index.php");

		/*}else{

			echo "<script>alert('既に存在するシート名');</script>";
			header("Location: select_sheet.php");

		}*/

	}

	function deleteSheet(){
		require("connect_db.php");

		$deleted = 0;
		$updated_at = date("Y-m-d H:i:s");
		echo $_SESSION['MAPID'];
		$sql = "DELETE FROM sheets WHERE id = ".$_SESSION['MAPID'];
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

		require("connect_db.php");

		$id = $_SESSION['USERID'];
	  $sql = " SELECT mt_time FROM mt_timing WHERE user_id = '$id' ORDER BY mt_time DESC";

		$array = array();

	  if($result = $mysqli->query($sql)) {
			echo" <option value='null'>選択してください</option>";
	    while($row = mysqli_fetch_assoc($result)){
	     	echo" <option value='".$row['mt_time']."'>"  .$row['mt_time']. "</option>" ;
				array_push($array, $row['mt_time']); // あとで取り出せるように配列化
	    }
		}
		//$_SESSION['last_mttime'] = $array[0]; // 前回のMTタイムをSESSIONで取り出せるように
	}

?>
