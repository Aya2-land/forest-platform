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

    // 新しい目標を作成
    const newGoal = document.createElement("div");
    
    // 目標の内容と追加した時刻を表示
    newGoal.innerHTML = `<strong>目標:</strong> ${goalContent} <br><strong>追加日時:</strong> ${timeString}`;

    // 目標を表示する一覧エリアに追加
    const goalListArea = document.getElementById("goalListArea");

    // 新しい目標をgoalListAreaの先頭に追加
    const firstChild = goalListArea.firstChild;
    if (firstChild) {
        goalListArea.insertBefore(newGoal, firstChild); // 最初に目標を追加
    } else {
        goalListArea.appendChild(newGoal); // もし目標がなければ普通に追加
    }

    // 目標を追加後、入力フィールドをクリア
    document.getElementById("goalInput").value = "";

	// サーバーに目標を保存するリクエストを送信
    record_objectMap(goalContent, timeString);

    // 目標にスタイルを適用
    newGoal.style.border = "1px solid black";
    newGoal.style.margin = "10px 0";
    newGoal.style.padding = "5px";
}

//kagitani--目標ノードの記録
function record_objectMap(goalContent, timeString){
    $.ajax({
        url: "php/object_maneger.php",  // PHPファイルのパス
        type: "POST",  // HTTPメソッド
        data: {
            goalContent: goalContent,
            timeString: timeString,
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
    const data = { purpose: 'fetch' };  // サーバーに送るデータ（目的など）

    $.ajax({
        url: 'php/get_goals.php',  // PHPファイルのパス
        type: 'POST',
        data: data,  // サーバーに送るデータ
        success: (response) => {
            console.log('サーバーからのレスポンス:', response);
            
            try {
                // レスポンスをJSONとしてパース
                const goals = JSON.parse(response);
                console.log('パースされた目標:', goals);

                const goalList = document.getElementById('goalList');
				if (goalList) {
					goalList.innerHTML = '';  // goalList が存在する場合のみ
				} else {
					console.error('goalList要素が見つかりません');
				}

                // 各目標をリストとして表示
                goals.forEach(goal => {
                    const goalElement = document.createElement('div');
                    goalElement.classList.add('goal-item');
                    goalElement.innerHTML = `
                        <div><strong>目標ID:</strong> ${goal.object_map_id}</div>
                        <div><strong>目標内容:</strong> ${goal.goal_content}</div>
                        <div><strong>作成日時:</strong> ${goal.created_at}</div>
                    `;
                    goalList.appendChild(goalElement);
                });
            } catch (e) {
                // JSONパースに失敗した場合
                console.error('JSONパースエラー:', e, response);
            }
        },
        error: (xhr, status, error) => {
            // AJAXリクエストが失敗した場合
            console.error('AJAXエラー:', status, error);
            console.log('レスポンステキスト:', xhr.responseText);
        }
    });
}

