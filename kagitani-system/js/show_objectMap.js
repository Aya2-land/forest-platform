//目標マップの切り替えを行う
let object_map_id = null; // グローバル変数の定義

// "過去の目標" ボタンをクリックした時に実行される関数
function showObjectMap() {
    console.log("showObjectMap関数が実行されました");
    
    // inquiry_areaを非表示に
    const inquiryArea = document.getElementById("inquiry_area");
    if (inquiryArea) {
        inquiryArea.style.display = "none";
        console.log("inquiry_areaを非表示にしました");
    } else {
        console.error("inquiry_areaが見つかりません");
    }
    
    // objectMap_areaを表示
    const objectMapArea = document.getElementById("objectMap_area");
    if (objectMapArea) {
        objectMapArea.style.display = "block";
        console.log("objectMap_areaを表示しました");
    } else {
        console.error("objectMap_areaが見つかりません");
    }
}

// "問い一覧" ボタンをクリックした時に実行される関数
function showGeneration() {
    console.log("showGeneration関数が実行されました");

    // inquiry_areaを表示
    const inquiryArea = document.getElementById("inquiry_area");
    if (inquiryArea) {
        inquiryArea.style.display = "block";
        console.log("inquiry_areaを表示しました");
    } else {
        console.error("inquiry_areaが見つかりません");
    }

    // objectMap_areaを非表示に
    const objectMapArea = document.getElementById("objectMap_area");
    if (objectMapArea) {
        objectMapArea.style.display = "none";
        console.log("objectMap_areaを非表示にしました");
    } else {
        console.error("objectMap_areaが見つかりません");
    }
}

function addObjectMap() {
    const goalContent = document.getElementById("goalInput").value;

    if (goalContent.trim() === "") {
        alert("目標の内容を入力してください");
        return;
    }

    const currentDate = new Date();
    const timeString = currentDate.toLocaleString(); // ローカルの日時形式で取得
    const objectMapId = 'map_' + Math.random().toString(36).substr(2, 9); // ランダムなIDを取得

    // 新しい目標ボタンを作成
    const newGoalButton = document.createElement("div");
    newGoalButton.classList.add('goal-item'); // CSSのクラスを追加

	// メモの初期値を設定
	newGoalButton.setAttribute('data-memo', 'メモがありません');

    // ボタンに目標情報を設定
    initializeGoalButton(newGoalButton, goalContent, timeString, timeString, objectMapId);

    // 表示エリアに追加
    const goalListArea = document.getElementById("goalListArea");
    goalListArea.insertBefore(newGoalButton, goalListArea.firstChild);

    // 入力フィールドをクリア
    document.getElementById("goalInput").value = "";

    // サーバーに目標を保存
    record_objectMap(goalContent, timeString, objectMapId);
    
    //活動ログに追加
    Record_activities(objectMapId, null, "add", goalContent, null, "map", generateUniqueID(),null);
}

function initializeGoalButton(goalButton, goalContent, createdAt, updatedAt, objectMapId) {
    // ボタンのHTMLを設定
    goalButton.innerHTML = `
        <div class="goal-card compact">
            <div class="goal-content">
                <span class="goal-text">${goalContent}</span><br>
                <span class="goal-date-updated" style="font-size: 0.7em; display: block;">更新: ${updatedAt}</span> 
                <span class="goal-date-created" style="font-size: 0.7em; display: block;">作成: ${createdAt}</span>
            </div>
            <div class="goal-actions">
                <button class="memo-btn" title="メモを追加/編集">📝</button>
                <button class="export-btn" title="目標をエクスポート">📤</button>
                <button class="delete-btn" title="目標を削除">🗑️</button>
            </div>
        </div>
    `;

    // メモボタンを取得し、イベントリスナーを追加
    const memoButton = goalButton.querySelector('.memo-btn');
    memoButton.addEventListener('click', () => {
        const currentMemo = goalButton.getAttribute('data-memo') || 'メモがありません';
        const newMemo = prompt('メモを編集してください:', currentMemo);

        if (newMemo !== null) {
            goalButton.setAttribute('data-memo', newMemo.trim() || 'メモがありません');
        }
    });

    // エクスポートボタンのイベントリスナーを追加
// エクスポートボタンのイベントリスナーを追加
    const exportButton = goalButton.querySelector('.export-btn');
    exportButton.addEventListener('click', () => {
        // マップ名と時間を取得
        const currentTime = new Date().toISOString().replace(/[:.-]/g, '_');  // ファイル名用にISO形式の日付を取得

        // エクスポートするマップ（vis.jsのコンテナ）を取得
        const networkContainer = document.querySelector('#mynetwork');  // マップのコンテナのIDを指定

        // マップの全体の高さと幅を取得
        const width = networkContainer.scrollWidth;  // 全体の幅
        const height = networkContainer.scrollHeight;  // 全体の高さ

        // html2canvasのオプション設定
        html2canvas(networkContainer, {
            scrollX: 0,
            scrollY: 0,
            width: width,
            height: height,
            useCORS: true,
            allowTaint: true,
            x: 0,
            y: 0,
            logging: true,  // デバッグ用
            ignoreElements: (element) => {
                // 不要な要素は無視する場合
                return element.id === 'someIdToIgnore';
            }
        }).then(canvas => {
            // キャプチャしたcanvasを画像として保存
            canvas.toBlob(blob => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${currentTime}_${goalContent}.png`;  // ファイル名に時間と目標内容を使用
                link.click();
            }, 'image/png');
        }).catch(error => {
            console.error('Error in capturing canvas:', error);
        });
    });



    // 削除ボタンのイベントリスナーを追加
    const deleteButton = goalButton.querySelector('.delete-btn');
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 親要素のクリックイベントを防止
        if (confirm('本当にこの目標を削除しますか？')) {
            deleteGoal(objectMapId, goalButton);
        }
    });

    // ボタンのクリック時の動作
    goalButton.addEventListener('click', () => {
        goalButton.focus(); // ボタンにフォーカスを当てる
        handleGoalClick(goalButton, goalContent, createdAt, objectMapId);
    });

    // 編集機能を追加
    enableGoalEdit(goalButton, goalContent, createdAt, objectMapId);
}




function handleMemoClick(goalButton, objectMapId) {
    // メモ入力ダイアログを表示
    const currentMemo = goalButton.getAttribute('data-memo') || ''; // 既存メモを取得
    const newMemo = prompt('メモを入力してください:', currentMemo);

    if (newMemo !== null) {
        // メモを保存（要素属性に設定）
        goalButton.setAttribute('data-memo', newMemo.trim());

        // 必要であればサーバーに保存
        saveMemo(objectMapId, newMemo.trim());
    }
}

function saveMemo(objectMapId, memoContent) {
	$.ajax({
        url: "php/object_maneger.php",
        type: "POST",
        data: {
            purpose: 'record',
            record_thing: 'memo',
            object_map_id: objectMapId,
			label:memoContent,
            node_update_thing1: null,
            node_update_thing2: null,
        },
        success: (response) => {
            console.log("サーバーレスポンス:", response); // デバッグ用ログ
            try {
            } catch (e) {
                console.error("JSONパースエラー: ", e);
                alert('不明なエラーが発生しました');
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAXエラー: ", error);
            console.log("ステータス: ", status);
            console.log("レスポンステキスト: ", xhr.responseText);
            alert('通信エラーが発生しました: ' + xhr.responseText);
        }
    });
}

// memoButton.addEventListener('click', () => {
//     const currentMemo = goalButton.getAttribute('data-memo') || 'メモがありません';
//     const newMemo = prompt('メモを編集してください:', currentMemo);

//     if (newMemo !== null) {
//         const updatedMemo = newMemo.trim() || 'メモがありません';
//         goalButton.setAttribute('data-memo', updatedMemo);

//         // サーバーにメモを更新するリクエストを送信
//         $.ajax({
//             url: "php/object_maneger.php",
//             type: "POST",
//             data: {
//                 purpose: 'update',
//                 select_update: 'label',
//                 update_thing: 'memo',
//                 object_map_id: goalButton.getAttribute('data-object-map-id'),  // object_map_idを送信
//                 memo: updatedMemo,  // 修正したメモを送信
//                 node_update_thing1: null,
//                 node_update_thing2: null,
//             },
//             success: (response) => {
//                 console.log("サーバーレスポンス:", response); // デバッグ用ログ
//                 try {
//                     const parsedResponse = JSON.parse(response);
//                     console.log(parsedResponse); // 必要に応じてレスポンスを確認
//                 } catch (e) {
//                     console.error("JSONパースエラー: ", e);
//                     alert('不明なエラーが発生しました');
//                 }
//             },
//             error: (xhr, status, error) => {
//                 console.error("AJAXエラー: ", error);
//                 console.log("ステータス: ", status);
//                 console.log("レスポンステキスト: ", xhr.responseText);
//                 alert('通信エラーが発生しました: ' + xhr.responseText);
//             }
//         });
//     }
// });




// 目標を削除する関数
function deleteGoal(objectMapId, goalButton) {
    $.ajax({
        url: "php/object_maneger.php",
        type: "POST",
        data: {
            purpose: 'delete',
            delete_thing: 'map',
            object_map_id: objectMapId,
            node_update_thing1: null,
            node_update_thing2: null,
        },
        success: (response) => {
            console.log("サーバーレスポンス:", response); // デバッグ用ログ
			goalButton.remove();
            try {
            } catch (e) {
                console.error("JSONパースエラー: ", e);
                alert('不明なエラーが発生しました');
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAXエラー: ", error);
            console.log("ステータス: ", status);
            console.log("レスポンステキスト: ", xhr.responseText);
            alert('通信エラーが発生しました: ' + xhr.responseText);
        }
    });
}

function enableGoalEdit(newGoalButton, currentGoalContent, createdAt, objectMapId) {
    // ダブルクリックで編集モードにする
    newGoalButton.addEventListener('dblclick', (event) => {
        // 現在の目標内容を取得
        const currentLabel = currentGoalContent;

        // ユーザーに新しいラベルを入力させる
        const newLabel = prompt('新しいラベルを入力してください:', currentLabel);

        // 編集したラベルを反映
        if (newLabel !== null) {
            const updatedGoalContent = newLabel.trim();

            if (updatedGoalContent !== "") {
                // 更新日時を現在の日時に設定
                const updatedAt = new Date().toLocaleString();

                // 新しいラベルと更新日時をボタンに反映
                newGoalButton.innerHTML = `
                    <span class="goal-content">
                        <strong>目標:</strong> ${updatedGoalContent} <br>
                        <strong>作成日時:</strong> ${createdAt} <br>
                        <strong>更新日時:</strong> ${updatedAt}
                    </span>
					<button class="memo-btn">📝</button>
                    <button class="delete-btn">🗑️</button>
                `;

                // 削除ボタンのイベントを再設定
                const deleteButton = newGoalButton.querySelector('.delete-btn');
                deleteButton.addEventListener('click', (event) => {
                    event.stopPropagation(); // 親のクリックイベントを防ぐ
                    if (confirm('本当にこの目標を削除しますか？')) {
                        deleteGoal(objectMapId, newGoalButton); // 目標を削除
                    }
                });

                // 編集内容をサーバーに保存するリクエストを送信
                update_objectMap(updatedGoalContent, updatedAt, objectMapId);
            } else {
                alert("目標の内容が空です");
            }
        }
    });
}


//目標マップの記録
function record_objectMap(goalContent, timeString,objectMapId){
    $.ajax({
        url: "php/object_maneger.php",  // PHPファイルのパス
        type: "POST",  // HTTPメソッド
        data: {
            goalContent: goalContent,
            timeString: timeString,
			object_map_id: objectMapId,  // ランダムIDを追加
            purpose : 'record',  // パラメータ
            record_thing: 'map'  // パラメータ
        },
		success: function(response) {
			// responseをコンソールに表示
			console.log("サーバーからのレスポンス:", response);
		},
		error: function(xhr, status, error) {
			console.error('送信エラー:', status, error);
		}
    });
}

function update_objectMap(updatedGoalContent, createdAt, objectMapId) {
   $.ajax({
       url: "php/object_maneger.php",
       type: "POST",
       data: {
           select_update: 'label',
           purpose: 'update',
           update_thing: 'map',
           object_map_id: objectMapId,
           label: updatedGoalContent,
           created_at: createdAt,
           node_update_thing1:null,
           node_update_thing2:null,
       },
       success: function(response){
           // レスポンスデータをコンソールに出力
           console.log("Success: ", response);
       },
       error: function(xhr, status, error){
           // エラーの詳細を表示
           console.log("Error status: " + status);
           console.log("Error message: " + error);
           console.log("Response text: " + xhr.responseText);
       }
   });
}

window.addEventListener('load', () => {
    fetchGoals();
});


function fetchGoals() {
    const data = { purpose: 'fetch' }; // サーバーに送るデータ

    $.ajax({
        url: 'php/get_goals.php', // PHPファイルのパス
        type: 'POST',
        data: data,
        success: (response) => {
            try {
                // JSONをパース
                const goals = JSON.parse(response);

                // 表示エリアをクリア
                const goalListArea = document.getElementById('goalListArea');
                goalListArea.innerHTML = '';

                // 各目標を表示
                goals.forEach((goal) => {
                    // ボタン要素を作成
                    const goalButton = document.createElement('div');
                    goalButton.classList.add('goal-item'); // スタイル用クラスを追加

                    // ボタンに目標情報を設定
                    initializeGoalButton(goalButton, goal.label, goal.created_at, goal.updated_at, goal.object_map_id);

                    // 表示エリアにボタンを追加
                    goalListArea.appendChild(goalButton);
                });
            } catch (e) {
                console.error("デバッグエラー: JSONパースエラー", e);
                console.log("デバッグ: サーバーからのレスポンス（解析失敗）:", response);
            }
        },
        error: (xhr, status, error) => {
            console.error("デバッグエラー: AJAXリクエスト失敗");
            console.error("デバッグ: ステータス:", status);
            console.error("デバッグ: エラー内容:", error);
            console.error("デバッグ: レスポンステキスト:", xhr.responseText);
        }
    });
}

function handleGoalClick(goalButton, goalContent, timeString, objectMapId) {
    defaultForestMRN = new ForestMRN("mynetwork", "load");

    // 他のボタンのスタイルをリセット
    const goalButtons = document.querySelectorAll('.goal-item');
    goalButtons.forEach(button => {
        button.style.border = ''; // スタイルをリセット
        button.classList.remove('selected'); // 'selected'クラスを外す
    });

    // クリックされたボタンに選択状態を適用
    goalButton.classList.add('selected'); // クリックされたボタンに'selected'クラスを追加

    // グローバル変数を更新
    object_map_id = objectMapId; // object_map_idを更新
    console.log(`Current object_map_id: ${object_map_id}`); // デバッグ用にコンソールに表示
    console.log(`更新時間を最新にします`); 
    // object_map_idの更新時間を最新にする．
    updateObjectMapData(objectMapId);

     // 現在の日時を取得し、更新日時を更新
     const currentDate = new Date().toLocaleString(); // 現在の日時を取得 (適切なフォーマット)
    
     // goalButton内の更新日時を更新
     const updatedAtElement = goalButton.querySelector('.goal-date');
     if (updatedAtElement) {
         updatedAtElement.textContent = `更新: ${currentDate}`; // 更新日時のテキストを現在時刻に変更
     }

    // object_map_id に紐づけられたデータをロード
    loadObjectMapData(objectMapId);
}


//ここ改善したら良さそう．
// object_map_idに紐づけられたobject_mapのデータを取得する関数
function loadObjectMapData(objectMapId) {

    $.ajax({
        url: 'php/get_goals.php', // PHPファイルのパス
        type: 'POST',
        data: {
            object_map_id: objectMapId,  // object_map_idを送信
            purpose: 'load'  // 目的を指定
        },
        success: (response) => {
            //console.log("サーバーレスポンス:", response); // デバッグ用

			// レスポンスが JSON 文字列の場合、パースします
            let objectMapData;
            try {
                objectMapData = JSON.parse(response);
            } catch (e) {
                console.error("JSONパースエラー:", e);
                return; // エラーが発生した場合は早期リターン
            }

			if (objectMapData && Array.isArray(objectMapData.node)) {
				objectMapData.node.forEach((n) => {
					if (n.object_node_id) {
						// object_node_id を node_id として渡す
						defaultForestMRN.addReloadNode(n.object_node_id, n.label, n.object_nodes_type_id, n.x, n.y, n.status);
					} else {
						console.warn("Node ID is undefined, skipping this node:", n);
					}
				});
			} else {
				console.error("node is undefined or not an array:", objectMapData.node);
			}
	
			if (objectMapData && Array.isArray(objectMapData.edge)) {
				objectMapData.edge.forEach((n) => {
					if (n.object_edges_id) {
						// `object_edges_id` を使用する
						defaultForestMRN.addReloadEdge(n.object_edges_id, n.edge_start, n.edge_end);
					} else {
						console.warn("dges ID is undefined, skipping this edge:", n);
					}
				});
			} else {
				console.error("eges is undefined or not an array:", objectMapData.node);
			}
        },
        error: (xhr, status, error) => {
            console.error("デバッグエラー: AJAXリクエスト失敗");
            console.error("デバッグ: ステータス:", status);
            console.error("デバッグ: エラー内容:", error);
            console.error("デバッグ: レスポンステキスト:", xhr.responseText);
        }
    });
}

// object_map_idに紐づけられたobject_mapのデータを取得する関数
function updateObjectMapData(objectMapId) {
    // リクエストデータを確認
    console.log("送信データ:", {
        object_map_id: objectMapId,
        purpose: 'update',
        update_thing: 'map',
        select_update: 'updated_at',
    });

    $.ajax({
        url: "php/object_maneger.php",
        type: "POST",
        data: {
            object_map_id: objectMapId,
            purpose: 'update',
            update_thing: 'map',
            select_update: 'updated_at',
        },
        success: function(response) {
            console.log("成功:", response); // サーバーのレスポンスをログ出力
        },
        error: function(xhr, status, error) {
            console.error("ノード更新エラー:", error); // エラー詳細を出力
            console.error("レスポンス:", xhr.responseText); // サーバーからのレスポンスも確認
        }
    });
}



