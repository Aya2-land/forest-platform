<?php
session_start();
require("../php/connect_db.php");
require("php/sheet.php");

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
<!-- ここから大槻修正 -->
<html lang="en">
    <!-- ここまで大槻修正 -->
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>自己内対話活性化支援システム</title>
        <link type="text/css" rel="stylesheet" href="../css/jsmind.css" />
        <link rel="stylesheet" type="text/css" href="../css/item.css">
        <link rel="stylesheet" type="text/css" href="css/font.css">
        <link rel="stylesheet" type="text/css" href="css/jquery.cleditor.css">
        <link rel="stylesheet" type="text/css" href="css/ui.css">
        <link rel="stylesheet" type="text/css" href="css/style.css">
        <!-- <link rel="stylesheet" type="text/css" href="../css/thinking-process-network.css" /> -->
        
        <style>
        /* 問い一覧のスタイリング - 最高優先度 */
        #testxml ul {
            list-style: none !important;
            margin: 0 0 8px 0 !important;
            padding: 8px 12px !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: 1px solid #dee2e6 !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }

        #testxml ul:hover {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
            border-color: #2196f3 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15) !important;
        }

        #testxml ul img {
            width: 16px !important;
            height: 16px !important;
            opacity: 0.7 !important;
            transition: opacity 0.2s ease !important;
            flex-shrink: 0 !important;
        }

        #testxml ul:hover img {
            opacity: 1 !important;
        }

        #testxml ul a {
            color: #495057 !important;
            text-decoration: none !important;
            font-weight: 500 !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
            flex: 1 !important;
            transition: color 0.2s ease !important;
        }

        #testxml ul:hover a {
            color: #1976d2 !important;
        }

        #intention ul, #rationality ul {
            list-style: none !important;
            margin: 0 0 8px 0 !important;
            padding: 8px 12px !important;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
            border: 1px solid #dee2e6 !important;
            border-radius: 6px !important;
            transition: all 0.2s ease !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }

        #intention ul:hover, #rationality ul:hover {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
            border-color: #2196f3 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 2px 8px rgba(33, 150, 243, 0.15) !important;
        }

        #intention ul img, #rationality ul img {
            width: 16px !important;
            height: 16px !important;
            opacity: 0.7 !important;
            transition: opacity 0.2s ease !important;
            flex-shrink: 0 !important;
        }

        #intention ul:hover img, #rationality ul:hover img {
            opacity: 1 !important;
        }

        #intention ul a, #rationality ul a {
            color: #495057 !important;
            text-decoration: none !important;
            font-weight: 500 !important;
            font-size: 13px !important;
            line-height: 1.4 !important;
            flex: 1 !important;
            transition: color 0.2s ease !important;
        }

        #intention ul:hover a, #rationality ul:hover a {
            color: #1976d2 !important;
        }
        
        /* ハンバーガーメニューのタブナビゲーション */
        .tab-navigation {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .dropdown-tab-item {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 12px;
            color: #495057;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            width: 100%;
        }
        
        .dropdown-tab-item:hover {
            background: #e9ecef;
            color: #333;
        }
        
        .dropdown-tab-item.active {
            background: #405dca;
            color: white;
            border-color: #405dca;
        }
        </style>

        <script type="text/javascript" src="js/jquery-1.8.2.min.js"></script>
        <script type="text/javascript" src="js/jquery-ui.min.js"></script>
        <script type="text/javascript" src="js/jsmind.js"></script>
        <script type="text/javascript" src="js/jsmind.draggable.js"></script>
        <script type="text/javascript" src="../js/vis-network.min.js"></script>

        <script src="js/jquery.autosize.js"></script>
        <script src="js/jquery.autosize.min.js"></script>

        <script type="text/javascript" src="js/version_update.js"></script>
        <script type="text/javascript" src="js/get_thinking.js"></script>
        <script type="text/javascript" src="js/jsmind.screenshot.js"></script>
        <script type="text/javascript" src="js/change_tab.js"></script>
        <script type="text/javascript" src="../js/meeting-reflection-network.js"></script>
        <link rel="stylesheet" type="text/css" href="../css/meeting-reflection-network.css" />
        <script type="text/javascript" src="js/navigator.js"></script>
        <script type="text/javascript" src="js/object-network.js"></script>
        <link rel="stylesheet" type="text/css" href="css/object-network.css" />
        <script type="text/javascript" src="js/timeline_slider.js"></script>
        <script type="text/javascript">
        window.onbeforeunload = function(e) {e.returnValue = "ページを離れようとしています。よろしいですか？";}
        
        // タブ切り替え機能
        function switchTab(tabId) {
            // 全てのタブコンテンツを非表示
            const tabContents = document.querySelectorAll('.tabcontent > div');
            tabContents.forEach(tab => {
                tab.style.display = 'none';
            });
            
            // 選択されたタブを表示
            const selectedTab = document.getElementById(tabId);
            if (selectedTab) {
                selectedTab.style.display = 'block';
            }
            
            // ハンバーガーメニューのタブボタンの状態を更新
            const tabButtons = document.querySelectorAll('.dropdown-tab-item');
            tabButtons.forEach(button => {
                button.classList.remove('active');
            });
            
            // クリックされたボタンをアクティブに
            event.target.classList.add('active');
            
            // メニューを閉じる
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            const dropdownMenu = document.querySelector('.dropdown-menu');
            const overlay = document.querySelector('.menu-overlay');
            
            hamburgerMenu.classList.remove('active');
            dropdownMenu.style.opacity = '0';
            dropdownMenu.style.visibility = 'hidden';
            dropdownMenu.style.transform = 'translateX(-100%)';
            overlay.classList.remove('active');
        }
        
        // ノード数を更新する関数（非同期対応）
        async function updateNodeCount() {
            try {
                console.log('ノード数更新開始...');
                const timestamp = new Date().toLocaleString('ja-JP');
                
                // PHPエンドポイントからノード数を取得
                const result = await getNodeCountFromObjectManager();
                const totalNodes = result.count || 0;
                const dataSource = result.source || 'unknown';
                
                // ノード数表示を更新
                const nodeCountElement = document.getElementById('current_node_count');
                if (nodeCountElement) {
                    nodeCountElement.textContent = totalNodes;
                }
                
                // ステータス別ノード数を更新
                if (result.details && result.details.status_stats) {
                    const statusStats = result.details.status_stats;
                    
                    // 各ステータスの表示を更新
                    const completedElement = document.getElementById('completed_count');
                    const inProgressElement = document.getElementById('inProgress_count');
                    const pausedElement = document.getElementById('paused_count');
                    const notStartedElement = document.getElementById('not_started_count');
                    
                    if (completedElement) completedElement.textContent = statusStats.completed || 0;
                    if (inProgressElement) inProgressElement.textContent = statusStats.inProgress || 0;
                    if (pausedElement) pausedElement.textContent = statusStats.paused || 0;
                    if (notStartedElement) notStartedElement.textContent = statusStats.not_started || 0;
                }
                
                // データソース情報を更新
                const debugElement = document.getElementById('node_count_debug');
                if (debugElement) {
                    let debugInfo = `最終更新: ${new Date().toLocaleTimeString()}`;
                    
                    // 詳細情報があれば追加
                    if (result.details) {
                        const details = result.details;
                        debugInfo += ` | 総数: ${details.total}`;
                        if (details.related > 0) {
                            debugInfo += `, 関連: ${details.related}`;
                        }
                        if (details.selectedNodeId) {
                            debugInfo += `, 選択ID: ${details.selectedNodeId}`;
                        }
                        
                        // ステータス別統計があれば追加
                        if (details.status_stats) {
                            const stats = details.status_stats;
                            // debugInfo += ` | ✅${stats.completed} 🔄${stats.inProgress} ⏸️${stats.paused} 📝${stats.not_started}`;
                        }
                    }
                    
                    // debugElement.textContent = debugInfo;
                }
                
                console.log(`ノード数更新完了: ${totalNodes} (source: ${dataSource})`, result);
                
                // 詳細な統計情報をログ出力
                if (result.details && result.details.typeStats) {
                    console.log('ノードタイプ別統計:', result.details.typeStats);
                }
                
                // ステータス別統計をログ出力
                if (result.details && result.details.status_stats) {
                    console.log('ステータス別統計:', result.details.status_stats);
                }
                
                // 詳細ステータス統計をログ出力
                if (result.details && result.details.detailed_status_stats) {
                    console.log('詳細ステータス統計:', result.details.detailed_status_stats);
                }
                
            } catch (error) {
                console.error('ノード数更新エラー:', error);
                const nodeCountElement = document.getElementById('current_node_count');
                if (nodeCountElement) {
                    nodeCountElement.textContent = 'エラー';
                }
                
                const debugElement = document.getElementById('node_count_debug');
                if (debugElement) {
                    debugElement.textContent = `エラー: ${error.message}`;
                }
            }
        }
        
        // object_map_managerからノード数を取得する関数（PHPエンドポイント使用）
        function getNodeCountFromObjectManager() {
            return new Promise((resolve, reject) => {
                try {
                    // 選択されているノードIDを取得（グローバル変数から）
                    const selectedNodeId = typeof selected_node_id !== 'undefined' ? selected_node_id : null;
                    
                    // PHPエンドポイントにAJAXリクエストを送信
                    $.ajax({
                        url: 'php/object_map_manager.php',
                        type: 'POST',
                        data: {
                            process_mode: 'getNodeCount',
                            selected_node_id: selectedNodeId
                        },
                        dataType: 'json',
                        timeout: 5000,
                        success: function(response) {
                            console.log('object_map_manager PHP response:', response);
                            if (response.status === 'success') {
                                resolve({
                                    count: response.total_count,
                                    source: 'object_map_manager_php',
                                    details: {
                                        total: response.total_count,
                                        related: response.related_count,
                                        typeStats: response.type_stats,
                                        status_stats: response.status_stats,
                                        detailed_status_stats: response.detailed_status_stats,
                                        selectedNodeId: response.selected_node_id,
                                        timestamp: response.timestamp
                                    }
                                });
                            } else {
                                console.warn('object_map_manager returned error:', response.message);
                                resolve({ count: 0, source: 'php_error', error: response.message });
                            }
                        },
                        error: function(xhr, status, error) {
                            console.error('AJAX error:', { xhr, status, error });
                            // フォールバック: JavaScript版を試す
                            const fallbackResult = getNodeCountFromObjectManagerFallback();
                            resolve({ 
                                count: fallbackResult, 
                                source: 'javascript_fallback',
                                error: error
                            });
                        }
                    });
                } catch (error) {
                    console.error('getNodeCountFromObjectManager exception:', error);
                    resolve({ count: 0, source: 'exception', error: error.message });
                }
            });
        }
        
        // JavaScript版のフォールバック関数
        function getNodeCountFromObjectManagerFallback() {
            try {
                let nodeCount = 0;
                
                // object_map_managerのnodesプロパティを確認
                if (object_map_manager && object_map_manager.nodes) {
                    if (typeof object_map_manager.nodes.length !== 'undefined') {
                        // nodesが配列の場合
                        nodeCount = object_map_manager.nodes.length;
                    } else if (typeof object_map_manager.nodes.get !== 'undefined') {
                        // nodesがvis.DataSetの場合
                        nodeCount = object_map_manager.nodes.get().length;
                    }
                }
                
                // 別のプロパティ名の可能性もチェック
                if (nodeCount === 0 && object_map_manager) {
                    // networkオブジェクトからノード数を取得
                    if (object_map_manager.network && object_map_manager.network.body && object_map_manager.network.body.data && object_map_manager.network.body.data.nodes) {
                        const nodes = object_map_manager.network.body.data.nodes;
                        if (typeof nodes.get !== 'undefined') {
                            nodeCount = nodes.get().length;
                        }
                    }
                    
                    // 思考過程ネットワークからノード数を取得
                    if (nodeCount === 0 && object_map_manager.thinkingProcess && object_map_manager.thinkingProcess.nodes) {
                        if (typeof object_map_manager.thinkingProcess.nodes.length !== 'undefined') {
                            nodeCount = object_map_manager.thinkingProcess.nodes.length;
                        } else if (typeof object_map_manager.thinkingProcess.nodes.get !== 'undefined') {
                            nodeCount = object_map_manager.thinkingProcess.nodes.get().length;
                        }
                    }
                }
                
                return nodeCount;
            } catch (error) {
                console.log('JavaScript fallbackでのノード数取得エラー:', error);
                return 0;
            }
        }
        
        // ノード数を定期的に更新
        function startNodeCountUpdater() {
            // 初回更新
            updateNodeCount();
            
            // 2秒ごとに更新（より頻繁に）
            setInterval(updateNodeCount, 2000);
            
            // object_map_managerの状態をログ出力
            console.log('object_map_manager の状態:', typeof object_map_manager !== 'undefined' ? object_map_manager : 'undefined');
        }
        
        // マニュアルでノード数を更新するグローバル関数
        window.refreshNodeCount = function() {
            updateNodeCount();
        };
        
        // ハンバーガーメニューのクリックイベント
        document.addEventListener('DOMContentLoaded', function() {
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            const dropdownMenu = document.querySelector('.dropdown-menu');
            let isMenuOpen = false;
            
            // オーバーレイ要素を作成
            const overlay = document.createElement('div');
            overlay.className = 'menu-overlay';
            document.body.appendChild(overlay);
            
            hamburgerMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                isMenuOpen = !isMenuOpen;
                
                if (isMenuOpen) {
                    hamburgerMenu.classList.add('active');
                    dropdownMenu.style.opacity = '1';
                    dropdownMenu.style.visibility = 'visible';
                    dropdownMenu.style.transform = 'translateX(0)';
                    overlay.classList.add('active');
                } else {
                    hamburgerMenu.classList.remove('active');
                    dropdownMenu.style.opacity = '0';
                    dropdownMenu.style.visibility = 'hidden';
                    dropdownMenu.style.transform = 'translateX(-100%)';
                    overlay.classList.remove('active');
                }
            });
            
            // メニュー外をクリックしたら閉じる
            document.addEventListener('click', function() {
                if (isMenuOpen) {
                    isMenuOpen = false;
                    hamburgerMenu.classList.remove('active');
                    dropdownMenu.style.opacity = '0';
                    dropdownMenu.style.visibility = 'hidden';
                    dropdownMenu.style.transform = 'translateX(-100%)';
                    overlay.classList.remove('active');
                }
            });
            
            // オーバーレイをクリックしたら閉じる
            overlay.addEventListener('click', function() {
                if (isMenuOpen) {
                    isMenuOpen = false;
                    hamburgerMenu.classList.remove('active');
                    dropdownMenu.style.opacity = '0';
                    dropdownMenu.style.visibility = 'hidden';
                    dropdownMenu.style.transform = 'translateX(-100%)';
                    overlay.classList.remove('active');
                }
            });
            
            // ドロップダウンメニュー内のクリックでは閉じない
            dropdownMenu.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            
            // 初期タブ表示設定
            switchTab('tab01');
            
            // フィードバックエリアを表示
            const feedbackArea = document.getElementById('feedback_area');
            if (feedbackArea) {
                feedbackArea.style.display = 'block';
            }
            
            // ノード数更新を開始
            startNodeCountUpdater();
        });
        </script>

        <!-- <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
             <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous"> -->

    </head>
    <body id="all">
        <!---        タイトルメニューStart                 -->
        <div id="main_title">
            <div class="header-container">
                <div class="hamburger-menu">
                    <div class="hamburger-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="dropdown-menu">
                        <form name="return" method="POST">
                            <input class="dropdown-item" type="submit" name="sheetbtn" value="シート選択画面に戻る">
                            <input class="dropdown-item logout-btn" type="submit" name="logout" value="ログアウト">
                        </form>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-section">
                            <span class="dropdown-section-title">画面切り替え</span>
                            <div class="tab-navigation">
                                <button class="dropdown-tab-item active" onclick="switchTab('tab01')">思考整理支援システム</button>
                                <button class="dropdown-tab-item" onclick="switchTab('tab04')">過去のマインドマップ</button>
                            </div>
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-section">
                            <span class="dropdown-section-title">モード選択</span>
                            <form name="target_mode" action="">
                                <select class="dropdown-select" name="Select1">
                                    <option>自己内対話モード</option>
                                    <option>資料構成作成モード</option>
                                    <option>資料作成モード</option>
                                    <option>議論内省マップモード</option>
                                </select>
                                <input type="button" class="dropdown-button" value="実行" onclick="ModeChangeButtonClick();" />
                            </form>
                        </div>
                    </div>
                </div>
                <span class="title_name">Forest</span>
            </div>
        </div>
        <!-- <form name="return" method="POST">
             <div id="session">
             <span class="session_php">
             <?php //echo("ユーザ名：");
             //echo($_SESSION["USERNAME"]);
             //echo("  　シート名：");
             //getMapname();?>
             </span>
             <span>
             <a href="" class="modal"><input type="button" id="js-show-popup" class="button9"  onclick="OperateDescription();" value="操作確認"></a>
             <input class="button7" type="button" onclick="save_node();" value="DBの接続確認">
             </span>
             </div>
             </form> -->
        <!---          タイトルメニューFinish              -->

        <!--      タブメニュー Start (ハンバーガーメニューに移動済み) -->
        <ul div class="tabnav" style="display: none;">
            <li class="active"><a href="#tab01">思考整理支援システム</a></li>
            <!-- <li><a href="#tab02">過去のマインドマップ</a></li>
                 <li class="active"><a href="#tab03" >リフレクション</a></li>
                 <li class="active"><a href="#record_tab" >履歴</a></li> -->
            <li class="active"><a href="#tab04">過去のマインドマップ</a></li>  <!--hatakeyama-->
        </ul>

        
        
        <!-- タブメニュー　Finish -->

        

        <!--メインメニュー　Start  -->
        <div class="tabcontent">
            <!-- 思考整理支援システム -->
            <div id="tab01">
                <div id="layout">
                    <div id ="system">
                        <div id="area">

                            <div id="jsmind_nav">
                                <div style="text-align: left">
                                    <!-- 【Edit】 -->
                                    <button class="button4" onclick="add_Qnode();">
                                        問いノード追加
                                    </button>
                                    <button class="button4" onclick="add_Anode();">
                                        答えノード追加
                                    </button>
                                    <button class="button4" onclick="add_Label('primary_label');">
                                        ラベル追加
                                    </button>
                                    <!-- <li><button onclick="horisage();">掘り下げる</button></li>
                                        horisage()関数は現在存在しない-->
                                    <button class="button4" onclick="remove_node();">
                                        ノードの削除
                                    </button>
                                    <!--1つ前に消したノードを復元-->
                                    <!-- <button class="button4" onclick="return_node();">
                                        1つ前に戻る
                                        </button> -->
                                    <!-- 【Zoom】 -->
                                    <button class="button3" id="zoom-in-button" onclick="zoomIn();">
                                        拡大
                                    </button>
                                    <button class="button3" id="zoom-out-button" onclick="zoomOut();">
                                        縮小
                                    </button>
                                    <!-- <button class="button4" id="map-snapshot-button" onclick="MapSnapShot();RecordRelation();">
                                        マップver更新 
                                    </button> -->
                                    
                                    【Screenshot】
                                    <button class="button4" style="width:80px" onclick="screen_shot();">
                                        screenshot
                                    </button>
                                    <!-- 【Reason】
                                        <button class="button4" onclick="add_edit_reason();">
                                        修正理由の追加
                                        </button> -->
                                    <!-- 【Screenshot】
                                        <button class="button4" style="width:80px" onclick="screen_shot();">
                                        screenshot
                                        </button> -->
                                    <!-- <label><input type="checkbox" name="Difference" id="Difference" onClick="Difference();">以前のマップとの差分</label> -->
                                    
                                    <div id="comment_balloon2"class="comment two" hidden><!--hatakeyama -->
                                        <p>緑にハイライトされたノードは合理性を考えるべきノードです．<br/>このノードの考えを変えた際には，関連したノードも考え直す必要はないか考えてみましょう！</p>
                                    </div>
                                    <div id="comment_balloon3"class="comment three" hidden><!--hatakeyama-->
                                        <p>何度もバージョン更新を行っている重要なノードです．<br/>定期的に考えを確認しましょう！</p>
                                    </div>
                                    
                                    <!-- ここから清水さん１ -->
                                    <div id ="presen_menu">
                                        <!-- 【Slide】 -->
                                        <!-- <button class="button4" onclick="MakeSlide();">スライド追加</button> -->
                                        <!-- <button class="button4" onclick="MakeNewPage();">ページ追加</button> -->
                                        <!-- <button class="button4" onclick="AddImage();">画像追加</button> -->
                                        <!-- <input type="file" id="myFile" style="display: none">
                                            <button class="button4" onclick="selectImage()">画像追加</button> -->
                                        <!-- <button class="button4" type="submit" name="selectImage">画像追加</button> -->

                                        <button class="button4" onclick="NewContent_Append('問い')">問いノード追加</button>
                                        <button class="button4" onclick="NewContent_Append('答え')">答えノード追加</button>
                                        <button class="button4" onclick="add_Confirm();">マップ側へ反映</button>
                                        <button class="button4" onclick="Unreflected_node();">未反映ノード</button>
                                        <!-- <button class="button4" onclick="CheckNodeAllLogicRelation();">関係性の一覧</button> -->
                                        <button class="button4" onclick="DeleteLogicRelation();">関係性の解消</button>
                                        <!-- <button class="button4" onclick="AllItemVersionUpdate();">資料のバージョンを更新</button> -->
                                        <!-- <button class="button4" id="input_file" onclick="InputFile();">
                                            資料再現
                                            </button> -->
                                        <!-- <button class="button4" onclick="Get_SlideRank();Get_ContentRank();Get_SlideTitle();">
                                            スライド保存
                                            </button> -->
                                        <!-- 【Export】
                                            <button class="button4" onclick="OutputScenario();">
                                            test
                                            </button> -->
                                        <!-- <button class="button4" onclick="OutputFile()">
                                            test
                                            </button> -->
                                    </div>
                                </div>
                                    
                                <!-- presen_menu fin -->

                                <!--  <div id ="presen_menu"> -->
                                <!-- 【Slide】 -->
                                <!-- <button class="button4" onclick="MakeSlide();">
                                    スライド追加
                                    </button> -->
                                <!-- <button class="button4" onclick="MakeNewPage();">
                                    ページ追加
                                    </button> -->
                                <!-- <button class="button4" onclick="NewContent_Append('問い')">
                                    問いノード追加
                                    </button>
                                    <button class="button4" onclick="NewContent_Append('答え')">
                                    答えノード追加
                                    </button>
                                    <button class="button4" onclick="add_Confirm();">
                                    マップ側へ反映
                                    </button> -->
                                <!-- <button class="button4" id="input_file" onclick="InputFile();">
                                    資料再現
                                    </button> -->
                                <!-- <button class="button4" onclick="Get_SlideRank();Get_ContentRank();Get_SlideTitle();">
                                    スライド保存
                                    </button> -->
                                <!-- <button class="button4" onclick="Unreflected_node();">
                                    未反映ノード
                                    </button>
                                    <button class="button4" onclick="CheckAllLogicRelation();">
                                    関係性の一覧
                                    </button>
                                    <button class="button4" onclick="DeleteLogicRelation();">
                                    関係性の解消
                                    </button>-->
                                <!-- <button class="button4" onclick="recommend_xmlLoad();">
                                    test
                                    </button> -->
                                <!-- 【Export】
                                    <button class="button4" onclick="OutputScenario();">
                                    test
                                    </button> -->
                                    <!-- <button class="button4" onclick="OutputFile()">
                                    test
                                    </button> -->
                                <!--</div>  presen_menu fin-->
                            </div>
                            <!--jsmind_nav fin-->

                            <!-- <div class="Menu">Menu</div> -->
                            <div id="jsmind_container" oncontextmenu="return false;">
                                <div id="mindmap_conmenu">
                                    <ul>
                                        <!-- <li><a href="javascript:void(0);" onClick="SetPurpose()">スライドを作成する</a></li> -->
                                        <!-- <li><a href="javascript:void(0);" onClick="NodeAppend()">資料に追加する</a></li> -->
                                        <!--  -->
                                        
                                        <!-- <li>
                                            ノードの変更
                                        </li> 
                                        <li>
                                            <button class="button4" onclick="add_Qnode();">
                                                問いノードを追加
                                            </button>
                                        </li>
                                        <li>
                                            <button class="button4" onclick="add_Anode();">
                                                答えノードを追加
                                            </button>
                                        </li>
                                        <li>
                                            <button class="button4" onclick="remove_node();">
                                                ノードを削除
                                            </button>
                                        </li> -->
                                        <!-- <li>
                                            <button class="button4" onclick="NodeVersionUpdate(null);">
                                                ノードを更新
                                            </button>
                                        </li> -->
                                        <li>
                                            <button class="button4" onclick="showThinkingProcessMap();">
                                                目標手段階層マップ
                                            </button>
                                        </li>
                                       
                                        <!-- <li>
                                            ノードを資料へ追加
                                        </li> 
                                        <li>
                                            <button class="button4" onclick="ItemAddDocument()">
                                                項目として追加する
                                            </button>
                                        </li>
                                        <li>
                                            <button class="button4" onclick="NodeAppendLogic()">
                                                内容として追加する 
                                            </button>
                                        </li> -->
                                        <!-- <li>
                                            <button class="button4" onclick="VersionSpread();RecordRelation()">
                                                ノードの更新をマップ全体に波及させる
                                            </button>
                                        </li>hatakeyama -->
                                       
                                    </ul>
                                </div>
                            </div>
                            <div id="document_area" oncontextmenu="return false;">
                                <div id="document_title">
                                    <div class="document_purpose">
                                        <textarea id="scenario_title" class="document_title_area" class="statement" onfocus='TextboxClick()' onblur='Edit_title(this);' placeholder="資料タイトル" style='width:90%;'></textarea>
                                    </div>
                                </div>
                            </div>
                            <!-- 20221208 shimizu　資料構成作成エリアで右クリックしたときに項目出現 -->
                            <div id="document_area_conmenu">
                                <ul>
                                    <li><a href="javascript:void(0);" onClick="LogicRelationChecker()">設定した関係を確認する</a></li>
                                </ul>
                                <!-- <ul>
                                    <li><a href="javascript:void(0);" onClick="ItemVersionUpdate()">バージョンを更新</a></li>
                                </ul> -->
                            </div>
                            
                            <div id="document_area_conmenu2" >
                                <select  id="Slides" class='cp_ipselect cp_sl05'>
                                </select><a id="SlideName">大枠</a><br>
                                <select id="Sentences" class='cp_ipselect cp_sl05'>
                                </select><a id="SelectNode">文章</a><br>
                                <input id="ImageOntologyDecide"type="button" value="決定" onclick="AddOntologyInfo();">
                                <input type="button" value="キャンセル" onclick="CancelButton_Click('document_area_conmenu2')">
                            </div>
                            
                            <div id="document_area_conmenu3" >
                                <div id="first_choice_node">
                                    <select id="first_logic_node" class='cp_ipselect cp_sl05'>
                                        <option value="主張">主張</option>
                                        <option value="論拠">論拠</option>
                                        <option value="根拠">根拠</option>
                                    </select>
                                    <select id="logic_intention1_node" class="cp_ipselect cp_sl04" >
                                    </select><a id="SelectContent1_node">スライドA</a><br>
                                </div>
                                <div id="second_choice_node">
                                    <select id="second_logic_node" class='cp_ipselect cp_sl05'>
                                    </select>
                                    <select id="logic_intention2_node" class="cp_ipselect cp_sl04">
                                    </select><a id="SelectContent2_node">スライドB</a><br>
                                </div>
                                <input id="DecideLogicRelationButton" type="button" value="決定" onclick="DecideNodeLogicRelation_Click();">
                                <input id="DecideLogicRelationButton" type="button" value="キャンセル" onclick="CancelButton_Click('document_area_conmenu3')">
                            </div>
                            
                            <div id="document_area_conmenu4" >
                                <div id="first_choice">
                                    <select id="first_logic" class='cp_ipselect cp_sl05'>
                                        <option value="主張">主張</option>
                                        <option value="論拠">論拠</option>
                                        <option value="根拠">根拠</option>
                                    </select>
                                    <select id="logic_intention1" class="cp_ipselect cp_sl04" >
                                    </select><a id="SelectContent1">A</a><br>
                                </div>
                                <div id="second_choice">
                                    <select id="second_logic" class='cp_ipselect cp_sl05'>
                                    </select>
                                    <select id="logic_intention2" class="cp_ipselect cp_sl04">
                                    </select><a id="SelectContent2">B</a><br>
                                </div>
                                <input id="DecideLogicRelationButton" type="button" value="決定" onclick="DecideSlideLogicRelation_Click();">
                                <input id="DecideLogicRelationButton" type="button" value="キャンセル" onclick="CancelButton_Click('document_area_conmenu4')">
                            </div>
                            <!--  ここから大槻修正　-->
                            <div id="network_container" oncontextmenu="return false;" >
                                <div id="utterance_area">
                                    <div id="rclick2">
                                        <div id="timedisplay"></div>
                                        <div id="rclick"></div>
                                    </div>
                                    <div id="utterance_area2">
                                    </div>
                                </div>
                                <div id="mynetwork2">
                                    <div id="buttoncluster">
                                        <input type="button" class="meeting_reflectin_network_button"
                                            id="mrnb_addNode" value="要約ノード追加" />
                                        <input type="button" class="meeting_reflectin_network_button"
                                            id="mrnb_removeNode" value="ノード削除" />
                                        <input type="button" class="meeting_reflectin_network_button"
                                            id="mrnb_startEditEdge" value="エッジ追加" />
                                        <input type="button" class="meeting_reflectin_network_button"
                                            id="mrnb_removeEdge" value="エッジ削除" />
                                        <input type="button" class="meeting_reflectin_network_button"
                                            id="mrnb_ZoomIn" value="拡大" />
                                        <input type="button" class="meeting_reflectin_network_button"
                                            id="mrnb_ZoomOut" value="縮小" />
                                    </div>
                                    <div id="network_conmenu">
                                        <ul>
                                            <li><a href="javascript:void(0);" id="net_conmenu1">概念をつける</a></li>
                                            <li><a href="javascript:void(0);" id="net_conmenu2">マインドマップと対応付ける</a></li>
                                            <li><a href="javascript:void(0);" id="net_conmenu3" style="display:none">採用/棄却をつける</a></li>
                                            <li><a href="javascript:void(0);" id="net_conmenu4">キャンセル</a></li>
                                        </ul>
                                    </div>
                                    <div id="labelselect">
                                        <select id="selectionlist" size="3">
                                            <!-- いるやつあれば追加やけど未実装（研究活動オントロジー読み込みかな？） -->
                                        </select>
                                        <input type="button" value="選択完了" id="ontology_select">
                                    </div>
                                    <div id="recruitselect">
                                        <select id="recruitselectionlist">
                                            <option value="採用">採用</option>
                                            <option value="棄却">棄却</option>
                                        </select>
                                        <input type="button" value="選択完了" id="recruit_select">
                                    </div>
                                    <div id="mynetwork"></div>
                                </div>
                            </div>
                            <!--  ここから大槻修正　-->
                            
                            <!--  ここまで大槻修正　-->

                            <!-- 思考過程表出化マップ　By川 -->
                            <div id="process_network_container" oncontextmenu="return false;" >
                                <div id="myProcessnetwork2">
                                    <!-- ボタンとシークバーを横並びに配置 -->
                                    <div class="control-panel">
                                        <div id="buttoncluster">
                                            <button type="button" class="process_close" onclick="closeThinkingProcessMap()"
                                                    id="process_close" title="閉じる">
                                                <span class="button-icon">✕</span>
                                                <span class="button-text">閉じる</span>
                                            </button>
                                            <button type="button" class="thinkingProcess_network_button"
                                                    id="process_addNode" title="ノード追加">
                                                <span class="button-icon">＋</span>
                                                <span class="button-text">ノード追加</span>
                                            </button>
                                            <button type="button" class="thinkingProcess_network_button"
                                                    id="process_removeNode" title="ノード削除">
                                                <span class="button-icon">－</span>
                                                <span class="button-text">ノード削除</span>
                                            </button>
                                            <button type="button" class="thinkingProcess_network_button"
                                                    id="process_startEditEdge" title="エッジ追加">
                                                <span class="button-icon">⟷</span>
                                                <span class="button-text">エッジ追加</span>
                                            </button>
                                            <button type="button" class="thinkingProcess_network_button"
                                                    id="process_removeEdge" title="エッジ削除">
                                                <span class="button-icon">✂</span>
                                                <span class="button-text">エッジ削除</span>
                                            </button>
                                            <button type="button" class="thinkingProcess_network_button"
                                                    id="process_ZoomIn" title="拡大">
                                                <span class="button-icon">🔍</span>
                                                <span class="button-text">拡大</span>
                                            </button>
                                            <button type="button" class="thinkingProcess_network_button"
                                                    id="process_ZoomOut" title="縮小">
                                                <span class="button-icon">🔎</span>
                                                <span class="button-text">縮小</span>
                                            </button>
                                        </div>
                                        <!-- シークバーを隣に配置（横幅いっぱい使用） -->
                                        <div id="timeline_container">
                                            <input type="range" id="timeline_slider" min="0" max="0" value="0" step="1" />
                                            <span id="timeline_label">読み込み中...</span>
                                        </div>
                                    </div>

                                        <div id="myProcessnetwork"></div>
                                    <div id="t_Process_conmenu" class="context-menu" role="menu" aria-label="ノード操作メニュー">
                                        <div class="context-menu-header">
                                            <span class="context-menu-title">ノード操作</span>
                                        </div>
                                        <ul class="context-menu-list" role="none">
                                            <li class="context-menu-item status-action" role="none">
                                                <a href="javascript:void(0);" id="object_conmenu1" class="context-menu-link" role="menuitem" 
                                                   title="ノードの作業を開始状態にします" aria-label="作業開始">
                                                    <span class="context-menu-icon" aria-hidden="true">▶️</span>
                                                    <span class="context-menu-text">開始</span>
                                                </a>
                                            </li>
                                            <li class="context-menu-item status-action" role="none">
                                                <a href="javascript:void(0);" id="object_conmenu2" class="context-menu-link" role="menuitem"
                                                   title="ノードの作業を完了し、内省記録を入力します" aria-label="作業完了">
                                                    <span class="context-menu-icon" aria-hidden="true">✅</span>
                                                    <span class="context-menu-text">完了</span>
                                                </a>
                                            </li>
                                            <li class="context-menu-item status-action" role="none">
                                                <a href="javascript:void(0);" id="object_conmenu3" class="context-menu-link" role="menuitem"
                                                   title="ノードの作業を一時中断状態にします" aria-label="作業中断">
                                                    <span class="context-menu-icon" aria-hidden="true">⏸️</span>
                                                    <span class="context-menu-text">中断</span>
                                                </a>
                                            </li>
                                            <li class="context-menu-separator" role="separator" aria-hidden="true"></li>
                                            <li class="context-menu-item annotation-action" role="none">
                                                <a href="javascript:void(0);" id="process_conmenu5" class="context-menu-link" role="menuitem"
                                                   title="このノードに取り組む理由を記述します" aria-label="理由記述">
                                                    <span class="context-menu-icon" aria-hidden="true">❓</span>
                                                    <span class="context-menu-text">理由を記述する</span>
                                                </a>
                                            </li>
                                            <li class="context-menu-item annotation-action" role="none">
                                                <a href="javascript:void(0);" id="process_conmenu6" class="context-menu-link" role="menuitem"
                                                   title="このノードの完了予定日時を設定します" aria-label="完了予定設定">
                                                    <span class="context-menu-icon" aria-hidden="true">⏰</span>
                                                    <span class="context-menu-text">完了予定を設定</span>
                                                </a>
                                            </li>
                                            <li class="context-menu-separator" role="separator" aria-hidden="true"></li>
                                            <li class="context-menu-item cancel-action" role="none">
                                                <a href="javascript:void(0);" id="process_conmenu4" class="context-menu-link" role="menuitem"
                                                   title="メニューを閉じます (ESCキーでも可能)" aria-label="キャンセル">
                                                    <span class="context-menu-icon" aria-hidden="true">❌</span>
                                                    <span class="context-menu-text">キャンセル</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div id="feedbackTooltip" style="position:absolute; display:none; z-index:1000;"></div>
                                    <div id="labelselect">
                                        <select id="selectionlist" size="3">
                                            <!-- いるやつあれば追加やけど未実装（研究活動オントロジー読み込みかな？） -->
                                        </select>
                                        <input type="button" value="選択完了" id="p_ontology_select">
                                    </div>
                                    <div id="recruitselect">
                                        <select id="recruitselectionlist">
                                            <option value="採用">採用</option>
                                            <option value="棄却">棄却</option>
                                        </select>
                                        <input type="button" value="選択完了" id="p_recruit_select">
                                    </div>
                                    <div id="t_Process_labelselect" style="display:none; position:absolute; z-index:1000; background:white; border:1px solid #ccc; padding:10px;">
                                        <select id="t_Process_selectionlist" size="3">
                                            <!-- いるやつあれば追加やけど未実装（研究活動オントロジー読み込みかな？） -->
                                        </select>
                                        <input type="button" value="選択完了" id="t_p_ontology_select">
                                    </div>
                                    <div id="t_Process_recruitselect" style="display:none; position:absolute; z-index:1000; background:white; border:1px solid #ccc; padding:10px;">
                                        <select id="t_Process_recruitselectionlist">
                                            <option value="採用">採用</option>
                                            <option value="棄却">棄却</option>
                                        </select>
                                        <input type="button" value="選択完了" id="t_p_recruit_select">
                                    </div>
                                    <div id="t_Process_reasonselect" style="display:none; position:absolute; z-index:1000; background:white; border:1px solid #ccc; padding:10px; width:300px;">
                                        <label for="t_Process_reasontext">なぜそれを取り組もうとしたか:</label><br>
                                        <textarea id="t_Process_reasontext" rows="4" cols="40" placeholder="理由を入力してください..."></textarea><br><br>
                                        <input type="button" value="決定" id="t_p_reason_select">
                                        <input type="button" value="キャンセル" id="t_p_reason_cancel">
                                    </div>
                                    <div id="t_Process_timeselect" style="display:none; position:absolute; z-index:1000; background:white; border:1px solid #ccc; padding:10px; width:300px;">
                                        <label for="t_Process_timetext">完了予定:</label><br>
                                        <select id="t_Process_timetext" style="width: 200px;">
                                            <option value="">選択してください</option>
                                            <option value="今日中">今日中</option>
                                            <option value="明日まで">明日まで</option>
                                            <option value="3日後">3日後</option>
                                            <option value="1週間後">1週間後</option>
                                            <option value="2週間後">2週間後</option>
                                            <option value="1ヶ月後">1ヶ月後</option>
                                            <option value="2ヶ月後">2ヶ月後</option>
                                            <option value="3ヶ月後">3ヶ月後</option>
                                            <option value="半年後">半年後</option>
                                            <option value="1年後">1年後</option>
                                            <option value="未定">未定</option>
                                        </select><br><br>
                                        <input type="button" value="決定" id="t_p_time_select">
                                        <input type="button" value="キャンセル" id="t_p_time_cancel">
                                    </div>
                                    <div id="t_Process_reflectionselect" style="display:none; position:absolute; z-index:1000; background:white; border:1px solid #ccc; padding:10px; width:400px;">
                                        <h4>内省を記述する</h4>
                                        <label for="t_Process_actionReason">行動意図：なぜこの手段を実行しましたか？</label><br>
                                        <textarea id="t_Process_actionReason" rows="3" cols="50" placeholder="例：実験対象者を選定するための参考基準を得るため．"></textarea><br><br>
                                        
                                        <label for="t_Process_completionReason">完了基準：なぜ完了と判断しましたか？</label><br>
                                        <textarea id="t_Process_completionReason" rows="3" cols="50" placeholder="例：必要な研究事例（5つ）を確認し，比較表を作成できたから．"></textarea><br><br>
                                        
                                        <label for="t_Process_challengesLearnings">経験の活用：困難や学びはありますか？</label><br>
                                        <textarea id="t_Process_challengesLearnings" rows="4" cols="50" placeholder="例：他の研究事例を調べる過程で混乱が生じた．関連論文を追加調査し共通点を抽出した．"></textarea><br><br>
                                        
                                        <input type="button" value="決定" id="t_p_reflection_select">
                                        <input type="button" value="キャンセル" id="t_p_reflection_cancel">
                                    </div>
                                    <!-- <div id="myProcessnetwork"></div> -->
                                </div>
                                <div id="trigger_area">
                                    <div id="trigger_area_display">
                                        <div id="conceptdisplay"></div>
                                        <div id="trigger_click"></div>
                                        <div id="trigger_area_add">
                                            <input type="button" id="inputTriggerbutton" value=" ＋ 活動を入力" onclick="inputTriggerAreaOpen()"/>
                                            <div id="trigger_add">
                                            </div>
                                        </div>
                                    </div>
                                    <div id="trigger_area_list">
                                    </div>
                                </div>
                            </div>
                            <!-- 思考過程表出化マップ　fin -->

                        </div>
                        <!--are fin-->
                    </div>
                    <!--system fin-->
                </div>
                <!--layout fin-->
            

            <!-- 　　　tab02メニュー　　　　　-->
            <!--  過去のマインドマップを表示する　-->
            <!-- <div id="tab02">
                 <div id="layout">
                 <div id="jsmind_nav2">
                 <div class ="mt_timing">
                 <select name="mttime_list" id="mttime_list"> -->
            <!-- ログイン中のユーザのMT時間を取得する -->
            <!--  -->
            <!-- </select>
                 <input type="button" class="ShowCurrentMapButton" onClick="ShowCurrentMap();" value="現在のマップを表示">
                 <input type="button" class="HideCurrentMapButton" onClick="HideCurrentMap();" value="現在のマップを隠す">
                 </div>
                 </div> -->
            <!-- 過去のマインドマップを表示する部分 -->
            <!-- <div id="jsmind_container_mrn2"> -->
            <!-- <div>過去のオントロジー</div> -->
            <!-- </div> -->
            <!-- 現在のマインドマップのコピー
                 <div id="jsmind_container_mrn3"></div>
                 </div>
                 </div> -->

                 <!--サイドメニュー　start-->
                <div id="side_menu">
                    
                    <!-- マインドマップ編集のサイドメニュー -->
                    
                    <div id="mind">
                        
                        <!--チェックメニュー　Start  -->
                        

                        <div class="toi_list" style="text-align: center;">
                            <div id="mind_all">
                                <input class="button5" type="button" onclick="showGeneration();" value="問い一覧">
                                <!-- <b>マインドマップモード</b> -->
                            </div>
                            <!-- <div id="presen_all" hidden>
                                <input class="button5" type="button" onclick="P_showGeneration();" value="問い一覧">
                                <b>資料作成モード</b>
                            </div> -->
                        </div>

                        <div id="mind" class="side">
                            <div class="inquiry_area">
                                <div style="background-color: #69a7ff; color: white; padding: 8px; text-align: center; font-weight: bold; margin-bottom: 10px; border-radius: 4px;">【情報の表出化】</div>
                                <div id="testxml"></div>
                                <div id="ont"></div>
                                <div style="background-color: #69a7ff; color: white; padding: 8px; text-align: center; font-weight: bold; margin-bottom: 10px; margin-top: 15px; border-radius: 4px;">【理由・目的】</div>
                                <div id="intention"></div>
                                <div style="background-color: #69a7ff; color: white; padding: 8px; text-align: center; font-weight: bold; margin-bottom: 10px; margin-top: 15px; border-radius: 4px;">【合理性】</div>
                                <div id="rationality"></div>
                            </div>

                        <!--ここから大槻修正-->
                        <div id = "feedback_area" style="display: none">
                            <!-- ノード数表示エリア -->
                            <div id="node_count_display" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 8px; margin-bottom: 10px; font-weight: bold; color: #495057;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <span>📊 現在のノード数: </span>
                                        <span id="current_node_count" style="color: #007bff; font-size: 16px;">0</span>
                                        <span> 個</span>
                                    </div>
                                    <button onclick="refreshNodeCount()" style="background: #007bff; color: white; border: none; border-radius: 3px; padding: 4px 8px; font-size: 12px; cursor: pointer;" title="ノード数を更新">
                                        🔄
                                    </button>
                                </div>
                                
                                <!-- ステータス別ノード数表示エリア -->
                                <div id="status_stats_display" style="margin-top: 8px; font-size: 12px; border-top: 1px solid #dee2e6; padding-top: 6px;">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 4px;">
                                        <div style="color: #28a745;">✅ 完了: <span id="completed_count">0</span></div>
                                        <div style="color: #17a2b8;">🔄 実行中: <span id="inProgress_count">0</span></div>
                                        <div style="color: #ffc107;">⏸️ 中断: <span id="paused_count">0</span></div>
                                        <div style="color: #6c757d;">📝 未着手: <span id="not_started_count">0</span></div>
                                    </div>
                                </div>
                                
                                <div id="node_count_debug" style="font-size: 10px; color: #6c757d; margin-top: 4px;">
                               
                                </div>
                            </div>
                            <div id = "ontology_feedback"></div>
                            <!-- <div id = "accordion_discussion"></div>
                            <input id = "feedbackrecord" type="button" value="記録"> -->
                        </div>
                        <div id="xml_upload_area" style="display: none">
                            <!-- <form id="uploadForm" enctype="multipart/form-data"> -->
                                <!-- <div style="font-size: 15px;">XMLファイルを選んでください</div>
                                <input type="file" name="xmlFile" id="meetingUtteranceXmlFileUploader" accept=".xml"> -->
                            <!-- </form> -->
                            <!-- <button id="discussion_log_xml_file_upload_button">アップロード</button>
                            <div id="uploaded_meeting_utterance_xml_concent_display_area" style="display: none"></div> -->
                        </div>
                        <!--ここまで大槻修正-->
                        <!-- <div class="correct_reason">修正理由</div>
                            <div id="reason" align="center"></div>
                            <div class="toi_menu">問い一覧</div> -->

                        <!--  hatakeyama  -->
                        <!-- <div class="version_reason">
                            <div class="correct_reason">バージョン更新理由</div>
                            <div id="comment_balloon"class="comment balloon-under" hidden>
                                <p>バージョンを更新した理由が<br/>あれば記述しましょう！</p>
                            </div>
                            <div id="reason" style="text-align:'center'"></div>
                        </div>
                        <div class="correct_reason">ノードバージョン履歴</div>
                        <div id="node_version_log" class="node_version_log"></div> -->
                        <!--  hatakeyama  -->
                            <div id="ImageAddContent">
                                <!-- <form id="ImageForm" method="POST" enctype="multipart/form-data"> -->
                                <div class="deco-file">
                                    <label>
                                        画像追加
                                        <input id="myFile" type="file" name="ImageFile" onchange="handleFileSelect()" accept="image/*" required>
                                    </label>
                                    <p id="FilenameDisplay" class="file-names"></p>
                                </div>
                                <!-- <button id="ImageSaveButton" type="submit" class="btn btn-primary" name="myFileImage">画像保存</button> -->
                                <button id="ImageSaveButton" name="myFileImage" hidden>画像保存</button>
                                <!-- </form> -->
                            </div>
                            <div id='node_slide'>
                                <!-- <input id="finish_btn" class="presen-btn" type="button" value="資料作成終了" onclick="macrolevel_xmlLoad();"> -->
                                <input id="output_file" class="presen-btn" type="button" value="資料構成出力" onclick="OutputFile();">
                                <button id="input_btn" class="presen-btn">資料構成復元</button>
                                <input id="input_file" type="file" onclick="InputFile()" >
                            </div>
                            <div id='document_slide'>
                                <input id="finish_btn" class="presen-btn" type="button" value="資料作成終了" onclick="OutputFileS();">
                            </div>
                            <!-- <input type="file" id="myFile" style="display: none">
                                <button class="button4" onclick="selectImage()">画像追加</button> -->
                            <!-- <div>
                                <form method="post" enctype="multipart/form-data">
                                <input type="file" name="image" required>
                                <button type="submit" name="myFile">保存</button>
                                </form>
                                </div> -->
                        </div>
                        
                    </div> <!-- mind fin -->

                    
                </div>
                <!--サイドメニュー　finish-->
            </div>
            <!--tab01 fin-->

            <!--  tab04メニュー　　hatakeyama　　-->
            <div id="tab04">
                <div id="layout">
                    <div id="jsmind_nav2">
                        <div class ="mt_timing">
                            <!-- 時刻入力で過去のマップ表示 -->
                            <!-- ここから大槻修正 -->
                            <div id="timeselect">
                                <select id="selectiontime">
                                </select>
                                <input id="past_time_select_button" type="button" value="選択完了">
                            </div>
                            
                            <!-- <form id ="reco_peri" class="ref_peri" method="post" acion="">
                                <input id="od" name="start_date" type="datetime-local"/>
                                <span><input id="pastmap_btn" type="button" onclick="GetPastMap($('#reco_period').val());" value="過去のマップを表示" /></span>
                                <input type="button" class="ShowCurrentMapButton" onClick="ShowCurrentMap();" value="現在のマップを表示">
                                <input type="button" class="HideCurrentMapButton" onClick="HideCurrentMap();" value="現在のマップを隠す">
                            </form> -->
                            <!-- ここまで大槻修正 -->
                        </div>
                    </div>
                    <!-- ここから大槻修正 -->
                    <div id="jsmind_container_mrn4">
                        <!-- ここまで大槻修正 -->
                        <!-- 過去のマインドマップを表示する部分 -->
                        <div id="jsmind_container_mrn2"></div>
                        <!--<div>過去のオントロジー</div>-->
                        <!-- </div> -->
                        <!-- 現在のマインドマップのコピー -->
                        <div id="jsmind_container_mrn3"></div>
                        <!-- ここから大槻修正 -->
                    </div>
                    <div id="mynetwork_show"></div>
                    <!-- ここまで大槻修正 -->
                </div>
            </div>

            <!-- リフレクション　yoshioka -->
            <div id="tab03">
                <div id="layout">
                    <div id="reflection_container">
                        <form id ="ref_peri" class="ref_peri" method = "post" acion="">
                            <p>リフクション期間を設定してください</p>
                            <label><input id="ref_c2" type="radio" name="ref_per" value="today" onclick="riflection_period2();" checked/>本日分のリフレクション</label>
                            <br>
                            <br>
                            <label><input id="ref_c" type="radio" name="ref_per" value="select" onclick="riflection_period();"/>リフレクション期間を指定する</label>
                            <br>
                            <input id="reflection_period" name="start_date" type="date" disabled="disabled"/>から<input id="reflection_period2" name="finish_date" type="date" disabled="disabled"/>
                            <br>
                            <br>
                            <span><input id="reflection_btn" type="button" onclick="activity_reflection();" value="リフレクション開始" /></span>
                        </form>
                        <form id ="reflection_form" class="ref_form" method = "post" action = "php/record_reflection.php" ></form>
                    </div>
                </div>
            </div>
            <!--リフレクション終了 yoshioka -->

            <!-- 履歴　yoshioka -->
            <div id="record_tab">
                <div id="layout">
                    <div id="record_container">
                        <form id ="reco_peri" class="ref_peri" method = "post" acion="">
                            <p>確認したいリフレクション履歴期間を設定してください</p>
                            <label><input id="reco_c2" type="radio" name="reco_per" value="today" onclick="record_period2();" checked/>本日分のリフレクション</label>
                            <br>
                            <br>
                            <label><input id="reco_c" type="radio" name="reco_per" value="select" onclick="record_period();"/>リフレクション期間を指定する</label>
                            <br>
                            <input id="reco_period" name="start_date" type="date" disabled="disabled"/>から<input id="reco_period2" name="finish_date" type="date" disabled="disabled"/>
                            <br>
                            <br>
                            <!-- ↓idがバッティングしていたため，とりあえずコメントアウトしている． -->
                            <!-- <span><input id="reflection_btn" type="button" onclick="get_recordAAAA();" value="リフレクション履歴表示" /></span> -->
                        </form>
                        <div id ="record_table"></div>
                    </div>
                </div>
            </div>
            <!--履歴 yoshioka -->

        </div>    
        

        <!-- メインメニュー　Finish -->

        <div id="macro_feedback_area">
            <!-- <h3>【聴衆モデルによる助言】</h3>
                 <p>「学術的な意義が述べられているか」を主題の一つとして選択していますが，「どのような新規性がありますか？」の問いには，答える必要はありませんか？</p>
                 <textarea placeholder='回答' style='width:300px; height:100px;'></textarea>
                 </br></br></br>
                 <p>今回の発表では分野外の聴衆から理解を得る必要があります．「学術的な意義が述べられているか」を主題に設定する必要はありませんか？</p>
                 <input type="button" value="必要ある"><input type="button" value="必要ない">
                 <br>
                 <p>「どのような新規性がありますか？」の問いには，答える必要はありませんか？</p>
                 <textarea placeholder='回答' style='width:300px; height:100px;'></textarea>
                 <br><br></br>
                 <button>終了</button>
                 <p>　</p> -->

        </div>


        <script type="text/javascript" src="js/second_advice.js"></script>
        <script type="text/javascript" src="js/mindmap.js"></script>
        <script type="text/javascript" src="js/add_node.js"></script>
        <script type="text/javascript" src="../js/node_tag.js"></script>
        <script type="text/javascript" src="../js/ont_choose_thinking.js"></script>
        <!-- <script type="text/javascript" src="../js/thinking-process-network.js"></script> -->
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
