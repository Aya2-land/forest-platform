<?php
session_start();
// require("../php/connect_db.php");
require("php/function.php");

require("php/sheet.php");

$pdo = connectDB_Test();

// ログイン状態のチェック
if (!isset($_SESSION["USERID"]) ) { //ログイン出来ていない
    header("Location: ../logout.php");
    exit;
}

if( (isset($_POST["sheetbtn"])) ||   //シート選択ボタンが押された
    (isset($_SESSION["USERID"]) && !isset($_SESSION["MAPID"]) )) { //ログインは出来ているがシート未選択の場合
    header("Location: select_sheet.php");
    $_SESSION["MAPID"] = null; //シート選択画面に遷移させた時にMAPIDをリセット
}

if(isset($_POST["logout"])){ //logoutボタンが押された
    // alert("本当にログアウトしますか？");
    
    // 時間があれば確認ダイアログを作る
    header("Location: ../logout.php");
    exit;
}

if(isset($_POST["myFileImage"])){ //imageFileImage
    // print("画像");

    if (!empty($_FILES['ImageFile']['name'])) {
        $uuid = uniqid();
        $name = $_FILES['ImageFile']['name'];
        $type = $_FILES['ImageFile']['type'];
        $content = file_get_contents($_FILES['ImageFile']['tmp_name']);
        $size = $_FILES['ImageFile']['size'];

        $sql = "INSERT INTO images(image_id, image_name, image_type, image_content, image_size, created_at)
      VALUES ('$uuid', :image_name, :image_type, :image_content, :image_size, now())";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':image_name', $name, PDO::PARAM_STR);
        $stmt->bindValue(':image_type', $type, PDO::PARAM_STR);
        $stmt->bindValue(':image_content', $content, PDO::PARAM_STR);
        $stmt->bindValue(':image_size', $size, PDO::PARAM_INT);
        $stmt->execute();
    }
    header("Location: index.php");
    // CreateSlide_Image();
    // header("Location: select_sheet.php");
    exit();
}




?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<!-- FontAwesomeのCDNをHTMLに追加 -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">

<!-- html2canvasのCDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js"></script>
<!-- ここから大槻修正 -->
<html lang="en">
    <!-- ここまで大槻修正 -->
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>自己内対話活性化支援システム</title>
        <link type="text/css" rel="stylesheet" href="css/jsmind.css" />
        <link rel="stylesheet" type="text/css" href="css/item.css">
        <link rel="stylesheet" type="text/css" href="css/font.css">
        <link rel="stylesheet" type="text/css" href="css/jquery.cleditor.css">
        <link rel="stylesheet" type="text/css" href="css/ui.css">
        <link rel="stylesheet" type="text/css" href="css/style.css">
        <link rel="stylesheet" type="text/css" href="css/assignTagsToNode.css">

        <script type="text/javascript" src="js/jquery-1.8.2.min.js"></script>
        <script type="text/javascript" src="js/jquery-ui.min.js"></script>
        <script type="text/javascript" src="js/jsmind.js"></script>
        <script type="text/javascript" src="js/jsmind.draggable.js"></script>
        <script type="text/javascript" src="../js/vis-network.min.js"></script>

        <script src="js/jquery.autosize.js"></script>
        <script src="js/jquery.autosize.min.js"></script>

        <script type="text/javascript" src="js/version_update.js"></script>
        <script type="text/javascript" src="./js/object-network.js"></script>
        <script type="text/javascript" src="js/get_thinking.js"></script>
        <script type="text/javascript" src="js/jsmind.screenshot.js"></script>
        <script type="text/javascript" src="js/change_tab.js"></script>
        <script type="text/javascript" src="./js/meeting-reflection-network.js"></script>
        <link rel="stylesheet" type="text/css" href="../css/meeting-reflection-network.css" />
        <script type="text/javascript" src="./js/vis-network.min.js"></script>
        <script type="text/javascript" src="js/show_objectMap.js"></script>
        <script type="text/javascript" src="js/object_tag.js"></script>
        <script type="text/javascript" src="js/change_map.js"></script>
        <!-- <script type="text/javascript" src="./js/meeting-reflection-network.js"></script> -->
        <link rel="stylesheet" type="text/css" href="css/meeting-reflection-network.css" />
        <script type="text/javascript">
        window.onbeforeunload = function(e) {e.returnValue = "ページを離れようとしています。よろしいですか？";}
        </script>
 </head>

    <body id="all">
        <!---        タイトルメニューStart                 -->
        <div id="main_title">
            <form name="return" method="POST">
                <span class="title_name">Forest</span>
                <span><input class="button2" type="submit" name="logout" value="ログアウト"></span>
                <span><input class="button1" type="submit" name="sheetbtn" value="シート選択画面へ"></span>
            </form>
        </div>
        <!---          タイトルメニューFinish              -->
        
        <div class="Menu">
            <!--サイドメニュー　start-->
            <div id="side_menu">
                <div class="checkbox">
                    <form name="target_mode" action="">
                        <select class="cp_ipselect2 cp_sl02"name="Select1">
                            <option>二分割モード</option>
                            <option>思考整理マップ</option>
                            <option>手段目標マップ</option>
                        </select>
                        <input type="button" class="button3" value="実行" onclick="ModeChangeButtonClick();" />
                    </form>
                </div>
                <!-- マインドマップ編集のサイドメニュー -->
                <div id="mind">
                    <div class="toi_list" style="display: flex; justify-content: center; align-items: center;">
                        <div id="mind_all" style="margin-right: 10px;">
                            <input class="button5" type="button" onclick="showGeneration();" value="問い一覧">
                        </div>
                        <div id="mind_all">
                            <input class="button5" type="button" onclick="showObjectMap();" value="過去の目標"> 
                        </div>
                    </div>

                    <div class="inquiry_area" id="inquiry_area">
                        <div>【情報の表出化】</div>
                        <div id="testxml"></div>
                        <div id="ont"></div>
                        <div>【理由・目的】</div>
                        <div id="intention"></div>
                        <div>【合理性】</div>
                        <div id="rationality"></div>
                    </div>

                    <div class="objectMap_area" id="objectMap_area" style="display: none;">
                        <!-- 目標内容を入力するフォーム -->
                        <div class="goal-input-container">
                            <div class="input-group">
                                <label for="goalInput" class="input-label">目標:</label>
                                <textarea id="goalInput" placeholder="目標を入力してください" rows="3" class="input-field"></textarea>
                            </div>

                            <div class="input-group">
                                <label for="startDateInput" class="input-label">開始日:</label>
                                <input type="date" id="startDateInput" class="input-field">
                            </div>

                            <div class="input-group">
                                <label for="endDateInput" class="input-label">終了日:</label>
                                <input type="date" id="endDateInput" class="input-field">
                            </div>

                            <button id="setGoal_button" onclick="addObjectMap()" class="setGoal_button">
                                目標を追加
                            </button>
                        </div>


                        <!-- 目標を一覧で表示するエリア -->
                        <div id="goalListArea">
                            <!-- 目標がここに表示されます -->
                        </div>
                    </div>
                </div> <!-- mind fin -->

                <!--サイドメニュー　finish-->
            </div>
        </div>

        <!--メインメニュー　Start  -->
        <div class="tabcontent">
            <!-- 思考整理支援システム -->
            <div id="forestTab">
                <div id="layout">
                    <div id="jsmind_nav">
                        <!-- <div class="button-container"> -->
                            <!-- 【Edit】 -->
                        <button class="action-button primary-button" onclick="add_Qnode();">
                            <span class="button-icon">❓</span> 問い追加
                        </button>
                        <button class="action-button primary-button" onclick="add_Anode();">
                            <span class="button-icon">💡</span> 答え追加
                        </button>
                        <button class="action-button danger-button" onclick="remove_node();">
                            <span class="button-icon">❌</span> ノード削除
                        </button>
                        <button class="action-button tool-button" id="zoom-in-button" onclick="zoomIn();">
                            <span class="button-icon">🔍➕</span> 拡大
                        </button>
                        <button class="action-button tool-button" id="zoom-out-button" onclick="zoomOut();">
                            <span class="button-icon">🔍➖</span> 縮小
                        </button>
                        <button class="action-button tool-button" id="map-snapshot-button" onclick="MapSnapShot();RecordRelation();">
                            <span class="button-icon">🔍➖</span> マップver更新
                        </button>
                    </div>
                <!-- </div> -->

                    <div id="jsmind_container" oncontextmenu="return false;">
                        <div id="mindmap_conmenu">
                            <ul>
                                <li><a href="javascript:void(0);" onClick="ItemAddDocument()">項目として追加する</a></li>
                                <li><a href="javascript:void(0);" onClick="NodeAppendLogic()">内容として追加する</a></li>
                                <li><a href="javascript:void(0);" onclick="NodeVersionUpdate(null)">ノードを更新</a></li>
                                <li><a href="javascript:void(0);" onclick="document.getElementById('mindmap_conmenu').style.display='none';">キャンセル</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                    <!--  kagitani　-->
                <div id="object_container" oncontextmenu="return false;" >
                        <div id="utterance_area">
                        <button id="a_button" onclick="openFilterModal()">活動ログフィルタ</button>
                        <div id="filter-status" style="display: none;">
                            <p>現在のフィルタ: 開始日 2024-12-01 | 終了日 2024-12-12 | マップ: Tokyo</p>
                        </div>

                           <!-- モーダルウィンドウ -->
                            <div id="filter-modal" class="modal">
                                <div class="modal-content">
                                    <span class="close" onclick="closeFilterModal()">&times;</span>
                                    <h2>活動ログのフィルタ</h2>

                                     <!-- 開始日と終了日の選択 -->
                                    <div class="filter-item date-range">
                                        <div class="date-picker-wrapper">
                                            <label for="filter-start-date">開始日</label>
                                            <input type="date" id="filter-start-date" class="date-picker">
                                        </div>

                                        <div class="date-picker-wrapper">
                                            <label for="filter-end-date">終了日</label>
                                            <input type="date" id="filter-end-date" class="date-picker">
                                        </div>
                                    </div>

                                    <!-- 使用マップフィルタ -->
                                    <div class="filter-item">
                                        <label for="filter-map">使用マップ</label>
                                        <select id="filter-map">
                                            <!-- JavaScriptがここにオプションを追加 -->
                                        </select>
                                    </div>


                                    <!-- 手段開始のみ表示 -->
                                    <div class="filter-item">
                                        <label for="filter-start">手段開始のみ表示</label>
                                        <input type="checkbox" id="filter-start">
                                    </div>

                                    <!-- 手段終了のみ表示 -->
                                    <div class="filter-item">
                                        <label for="filter-end">手段終了のみ表示</label>
                                        <input type="checkbox" id="filter-end">
                                    </div>

                                    <!-- フィルタを適用するボタン -->
                                    <button class="filter_button" onclick="applyFilters();">フィルタを適用</button>
                                    <button class="filter_button" onclick="resetFilters();">全てのログを表示</button>

                                </div>
                            </div>

                            <div id="utterance_area2">
                            </div>
                        </div>
                        <div id="myobject">
                            <div id="buttoncluster">
                                <button class="action-button primary-button" id="mrnb_addGoal">
                                    <span class="button-icon">🎯</span> 目標追加
                                </button>
                                <button class="action-button primary-button" id="mrnb_addStep" disabled>
                                    <span class="button-icon">🔧</span> 手段追加
                                </button>
                                <button class="action-button danger-button" id="mrnb_removeNode">
                                    <span class="button-icon">❌</span> ノード削除
                                </button>
                                <button class="action-button tool-button" id="mrnb_ZoomIn">
                                    <span class="button-icon">🔍➕</span> 拡大
                                </button>
                                <button class="action-button tool-button" id="mrnb_ZoomOut">
                                    <span class="button-icon">🔍➖</span> 縮小
                                </button>
                            </div>
                            <div id="network_conmenu" class="context-menu">
                                <ul>
                                    <li><a href="javascript:void(0);" id="net_conmenu00"><i class="fa fa-play"></i> 手段開始</a></li> 
                                    <li><a href="javascript:void(0);" id="net_conmenu01"><i class="fa fa-pause"></i> 手段中断</a></li> 
                                    <li><a href="javascript:void(0);" id="net_conmenu02"><i class="fa fa-check"></i> 手段完了</a></li> 
                                    <!-- <li><a href="javascript:void(0);" id="net_conmenu03"><i class="fa fa-eye"></i> 活動表示</a></li>  -->
                                    <!-- <li><a href="javascript:void(0);" id="net_conmenu3"><i class="fa fa-tag"></i> 性質を選択</a></li> -->
                                    <li><a href="javascript:void(0);" id="net_conmenu04"><i class="fa fa-tag"></i> 性質を選択</a></li>
                                    <li><a href="javascript:void(0);" id="net_conmenu4"><i class="fa fa-times"></i> キャンセル</a></li>
                                </ul>
                            </div>
                            <div id="tooltip" style="position: absolute; display: none; padding: 10px; background: #f9f9f9; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);">
                                吹き出しの内容
                            </div>

                            <!-- 手段の性質(タグ)選択メニュー-->
                            <div id="recruitselect" style="width: 400px; padding: 20px; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9f9; position: absolute; top: 100px; left: 100px;">

                                <!-- タグ選択 -->
                                <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                                    <label for="taggingSection" style="font-weight: bold;">タグ:</label>
                                    <select id="taggingSection" style="width: 50%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                                    </select>
                                    <button id="recruit_tag" style="padding: 8px 15px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">選択</button>
                                </div>

                                <!-- タグ生成 -->
                                <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                                    <label for="customTagInput" style="font-weight: bold;">タグ生成:</label>
                                    <input type="text" id="customTagInput" placeholder="タグ名を入力" style="width: 45%; padding: 8px; border-radius: 5px; border: 1px solid #ccc;">
                                    <button id="addTagButton" style="padding: 8px 15px; background-color: #007BFF; color: white; border: none; border-radius: 5px; cursor: pointer;">生成</button>
                                </div>

                                <!-- キャンセルボタン -->
                                <div style="text-align: center;">
                                    <button id="cancelTagButton" style="margin-top: 10px; padding: 8px 15px; width: 100%; background-color: #6C757D; color: white; border: none; border-radius: 5px; cursor: pointer;">キャンセル</button>
                                </div>
                            </div>

               
                            <!-- <div id="taggingSection" class="tag-modal" style="display:none;">
                                <div class="modal-content">
                                    <h3>タグ付けを選択してください</h3>
                                    <div>
                                        <h4>手段そのものの性質</h4>
                                        <select id="meansNature">
                                            <option value="考える">考える（自分の中で考えを深める活動）</option>
                                            <option value="調べる">調べる（情報収集やリサーチを行う活動）</option>
                                            <option value="表現する">表現する（機能的な成果物を形にする活動）</option>
                                            <option value="相談する">相談する（他者とコミュニケーションを取る活動）</option>
                                        </select>
                                    </div>
                                    <div>
                                        <h4>目標に対する手段の性質</h4>
                                        <select id="meansGoalNature">
                                            <option value="準備">準備（情報収集や基礎的な作業をする段階）</option>
                                            <option value="実施">実施（実際に行動や作業を進める段階）</option>
                                            <option value="評価">評価（進捗や成果を評価する段階）</option>
                                            <option value="改善">改善（問題点を見つけて修正する段階）</option>
                                        </select>
                                    </div>
                                    <button id="applyTagging">適用</button>
                                    <button id="cancelTagging">キャンセル</button>
                                </div>
                            </div> -->
                            <div id="mynetwork"></div>
                        </div>
                </div>
                    <!--  kagitani　-->
                
            </div><!--layout fin-->
        </div>
        <!-- メインメニュー　Finish -->

    
        <script type="text/javascript" src="js/second_advice.js"></script>
        <script type="text/javascript" src="js/mindmap.js"></script>
        <script type="text/javascript" src="js/add_node.js"></script>
        <script type="text/javascript" src="../js/node_tag.js"></script>
        <script type="text/javascript" src="../js/ont_choose_thinking.js"></script>
        <script type="text/javascript" src="../js/thinking-process-network.js"></script>
        <script type="text/javascript" src="js/past_sheet.js"></script>
        <script type="text/javascript" src="js/record_presentation.js"></script>
        <script type="text/javascript" src="js/presentation.js"></script>
        <script type="text/javascript" src="js/micro.js"></script>
        <script type="text/javascript" src="js/macro.js"></script>
        <script type="text/javascript" src="js/macrolevel_advice.js"></script>
        <script type="text/javascript" src="js/rationality.js"></script>
        <script type="text/javascript" src="plugins/Sortable-master/Sortable.js"></script>
        <script type="text/javascript" src="plugins/Sortable-master/Sortable.min.js"></script>
        <script type="text/javascript" src="plugins/Modaal-master/dist/js/modaal.js"></script>
        <script type="text/javascript" src="plugins/Modaal-master/dist/js/modaal.min.js"></script>
        <!-- <script src="plugins/Modaal-master/dist/css/modaal.css"></script> -->
        <script type="text/javascript" src="js/ont_inquiry.js"></script>
        <script type="text/javascript" src="js/ont_inquiry_verp.js"></script>
        <script type="text/javascript" src="js/ont_choose_inquiry.js"></script>
        <script type="text/javascript" src="js/ont_choose_input_output.js"></script>
        <script type="text/javascript" src="js/ont_rationality.js"></script>
        <script type="text/javascript" src="js/ont_scenario_inquiry.js"></script>
        <script type="text/javascript" src="js/ont_audience_model.js"></script>
        <script type="text/javascript" src="js/upload.js"></script>     
        <!-- 2022.shimizu -->
        <script type="text/javascript" src="js/html2canvas.min.js"></script>
        <script type="text/javascript" src="js/add_OntologyArea.js"></script>
        <!--  ここから大槻修正　--> 
        <!-- <link href="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis-network.min.css" rel="stylesheet" type="text/css" /> -->
        <script type="text/javascript" src="./js/network.js"></script>  
        <script type="text/javascript" src="./js/readxmldata.js"></script>  
        
        <!--  ここまで大槻修正　-->
    </body>
</html>
