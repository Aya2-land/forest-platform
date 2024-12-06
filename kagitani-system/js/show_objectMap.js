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
    // 入力フィールドの内容を取得
    const goalContent = document.getElementById("goalInput").value;

    // 入力内容が空でないかチェック
    if (goalContent.trim() === "") {
        alert("目標の内容を入力してください");
        return; // 空の場合は処理を中断
    }

    // 現在の時刻を取得
    const currentDate = new Date();
    const timeString = currentDate.toLocaleString(); // ローカルの日時形式で取得
    const objectMapId = 'map_' + Math.random().toString(36).substr(2, 9); // ランダムなIDを取得

    // 新しい目標ボタンを作成
    const newGoalButton = document.createElement("div");
    newGoalButton.classList.add('goal-item'); // CSSのクラスを追加

    // 目標の内容と追加した時刻を表示
    newGoalButton.innerHTML = `
        <span class="goal-content"><strong>目標:</strong> ${goalContent} <br><strong>作成日時:</strong> ${timeString}</span>
        <button class="delete-btn">🗑️</button>
    `;

    // ボタンにobject_map_idをdata属性として設定
    newGoalButton.setAttribute('data-object-map-id', objectMapId);

    // 削除ボタンのクリックイベント
    const deleteButton = newGoalButton.querySelector('.delete-btn');
    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation(); // 親のクリックイベントを防ぐ
        if (confirm('本当にこの目標を削除しますか？')) {
            deleteGoal(objectMapId, newGoalButton); // 目標を削除
        }
    });

    // 目標を表示する一覧エリアに追加
    const goalListArea = document.getElementById("goalListArea");

    // 新しい目標をgoalListAreaの先頭に追加
    const firstChild = goalListArea.firstChild;
    if (firstChild) {
        goalListArea.insertBefore(newGoalButton, firstChild); // 最初に目標ボタンを追加
    } else {
        goalListArea.appendChild(newGoalButton); // もし目標ボタンがなければ普通に追加
    }

    // 目標を追加後、入力フィールドをクリア
    document.getElementById("goalInput").value = "";

    // サーバーに目標を保存するリクエストを送信
    record_objectMap(goalContent, timeString, objectMapId);
}

//削除するところでエラーが出る！！！！何でだ！！！！
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



function enableGoalEdit(newGoalButton, currentGoalContent, timeString, objectMapId) {
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
                // 新しいラベルをボタンに反映
                newGoalButton.innerHTML = `<strong>目標:</strong> ${updatedGoalContent} <br><strong>作成日時:</strong> ${timeString}`;
                
                // 編集内容をサーバーに保存するリクエストを送信（必要であれば）
                update_objectMap(updatedGoalContent, timeString, objectMapId);
            } else {
                alert("目標の内容が空です");
                // 編集前の内容に戻す
                newGoalButton.innerHTML = `<strong>目標:</strong> ${currentLabel} <br><strong>作成日時:</strong> ${timeString}`;
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

// DBから目標データを取得
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
                    const goalButton = document.createElement('button');
                    goalButton.classList.add('goal-item'); // スタイル用クラスを追加
                    goalButton.innerHTML = `
                        <strong>目標:</strong> ${goal.label}<br>
                        <strong>作成日時:</strong> ${goal.created_at}
                    `;

                    console.log('object-map-id', goal.object_map_id);

                    // ボタンに object_map_id を data 属性として設定
                    goalButton.setAttribute('data-object-map-id', goal.object_map_id);

                    // 削除ボタンの作成
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('delete-btn');
                    deleteButton.textContent = '🗑️'; // ゴミ箱アイコン
                    deleteButton.addEventListener('click', (event) => {
                        event.stopPropagation(); // ボタンクリック時に親ボタンがクリックされないようにする
                        const confirmDelete = confirm('この目標を削除しますか？');
                        if (confirmDelete) {
                            deleteGoal(goal.object_map_id, goalButton);
                        }
                    });

                    // ボタンに削除ボタンを追加
                    goalButton.appendChild(deleteButton);

                    // ボタンのクリック時の動作を handleGoalClick 関数に委任
                    goalButton.addEventListener('click', (event) => {
                        goalButton.focus();  // ボタンにフォーカスを当てる
                        handleGoalClick(goalButton, goal.label, goal.created_at, goal.object_map_id);
                    });

                    // 編集機能を追加
                    enableGoalEdit(goalButton, goal.label, goal.created_at, goal.object_map_id);

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
    });

	// グローバル変数を更新
    object_map_id = objectMapId; // object_map_idを更新
    console.log(`Current object_map_id: ${object_map_id}`); // デバッグ用にコンソールに表示

	//object_map_idの更新時間を最新にする．
	updateObjectMapData(objectMapId);

    // メッセージを表示
    //alert(`目標: ${goalContent}\n作成日時: ${timeString}\nobject_map_id: ${objectMapId}`);

    // クリックされたボタンのスタイルを変更
    goalButton.style.border = '5px solid #007BFF'; // 太くするスタイルを適用

    // object_map_id に紐づけられたデータをロード
    loadObjectMapData(objectMapId);
}

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
						defaultForestMRN.addReloadNode(n.object_node_id, n.label, n.object_nodes_type_id, n.x, n.y);
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

			// if (objectMapData && Array.isArray(objectMapData)) {
            //     objectMapData.forEach((n) => {
            //         if (n.object_node_id) {
            //             // object_node_id を node_id として渡す
            //             defaultForestMRN.addReloadNode(n.object_node_id, n.label, n.object_nodes_type_id, n.x, n.y);
            //         } else {
            //             console.warn("Node ID is undefined, skipping this node:", n);
            //         }
            //     });
            // } else {
            //     console.error("objectMapData is undefined or not an array:", objectMapData);
            // }
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
    $.ajax({
        url: "php/object_maneger.php",
        type: "POST",
        data: {
            object_map_id: objectMapId, // 正しいキーを使用
            purpose: 'update',
            update_thing: 'map',
			select_update: 'updated_at'
        },
        success: function(response) {
            //console.log("成功:", response); // 成功した場合のレスポンスを表示
        },
        error: function(xhr, status, error) {
            console.error("ノード更新エラー:", error); // エラー内容を詳しく表示
            console.error("レスポンス:", xhr.responseText); // サーバーからのレスポンスも表示
        }
    });
}


