//目標マップの切り替えを行う



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
    const newGoalButton = document.createElement("button");
    newGoalButton.classList.add('goal-item'); // CSSのクラスを追加

    // 目標の内容と追加した時刻をボタンの中に設定
    newGoalButton.innerHTML = `<strong>目標:</strong> ${goalContent} <br><strong>作成日時:</strong> ${timeString}`;

	// ボタンにobject_map_idをdata属性として設定
    newGoalButton.setAttribute('data-object-map-id', objectMapId);

    // ボタンのクリック時の動作をhandleGoalClick関数に委任
    newGoalButton.addEventListener('click', (event) => {
        // クリックしたボタンからobject_map_idを取得
        const clickedObjectMapId = event.target.getAttribute('data-object-map-id');
        handleGoalClick(goalContent, timeString, objectMapId);
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
    record_objectMap(goalContent, timeString,objectMapId);
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

					console.log('data-object-map-id', goal.object_map_id);

					// ボタンに object_map_id を data 属性として設定
                    goalButton.setAttribute('data-object-map-id', goal.object_map_id);

                    // ボタンのクリック時の動作を handleGoalClick 関数に委任
					goalButton.addEventListener('click', () => {
						handleGoalClick(goal.label, goal.created_at, goal.object_map_id);
					});

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


// ボタンがクリックされたときに実行する処理を別の関数に分ける
function handleGoalClick(goalContent, timeString, objectMapId) {
    // どのマップが，どのobject_map_idかどうかは，呼び出さずともわかる状態になった．
    alert(`目標: ${goalContent}\n作成日時: ${timeString}\nobject_map_id: ${objectMapId}`);

	//既存に表示されている目標手段ノードを削除する．表示を消す．

	//クリックした時，object_map_idに紐づけられたobject_mapのデータを呼び出そう．	
	// object_map_idに紐づけられたobject_mapのデータを取得
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
            try {
                // サーバーから返ってきたデータをパース
                const objectMapData = JSON.parse(response);

                // 取得したデータを表示（例: アラート表示）
                if (objectMapData && Array.isArray(objectMapData)) {
                    // データが正しく取得できた場合、forEach で各ノードを処理
                    objectMapData.forEach((n) => {
                        if (n.object_node_id) {
                            // object_node_id を node_id として渡す
                            defaultForestMRN.addReloadNode(n.object_node_id, n.label, n.object_nodes_type_id, n.x, n.y);
                        } else {
                            console.warn("Node ID is undefined, skipping this node:", n);
                        }
                    });
                } else {
                    alert("データが見つかりませんでした。");
                }
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




