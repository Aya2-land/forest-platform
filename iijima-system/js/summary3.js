//ノード追加時のID管理
let globalNodeId = 0;
//選択されたノードを保存する配列
let selectedNodes = [];
//ノード間のエッジを管理する配列
let edges = [];
//ノードの縦位置を管理する変数（y座標）
let currentYPosition = 10;

function add_paragraph() {
    //表示エリアの参照を取得
    const summary_area = document.getElementById("summary_area");
    const node = createNode(summary_area);

    summary_area.appendChild(node);

    //ドラッグ関連のイベントを登録
    setupDragAndInertia(node, summary_area);
}

function createNode(summary_area) {
    const summary_area_rect = summary_area.getBoundingClientRect();

    let x = summary_area_rect.width / 2;   //ノードの幅を考慮
    let y = currentYPosition;   //ノードの高さを考慮
    //スクロール位置を加算して，座標を補正
    const scrollOffsetX = window.scrollX;
    const scrollOffsetY = window.scrollY;

    x += scrollOffsetX;
    y += scrollOffsetY;
    //console.log(`${x}, ${y}`);

    const node = document.createElement("div");
    const nodeID = ++globalNodeId;

    node.className = "node";
    node.textContent = `${nodeID}`;
    node.dataset.nodeId = nodeID;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    /*
    //数値を表示するためのspanタグを作成
    const numberSpan = document.createElement("span");
    numberSpan.className = "node-number";
    numberSpan.textContent = nodeID;         //数値としてノードIDを設定

    //ノードのテキストを作成
    const textSpan = document.createElement("span");
    textSpan.className = "node-text";
    textSpan.textContent="";

    //ノードに数値とテキストを追加
    node.appendChild(numberSpan);
    node.appendChild(document.createElement("br"));   //改行を挿入
    node.appendChild(textSpan);
    */

    if (selectedNodes.length === 1) {
        selectedNodes.push(node);
        //DOMに追加された後にエッジを描画
        requestAnimationFrame(() => connectNodes());
    }

    //次に追加されるノードのy座標を更新
    currentYPosition += 70;

    return node;
}

//ドラッグと感性の動きを設定する関数
function setupDragAndInertia(node, summary_area) {
    const summary_area_rect = summary_area.getBoundingClientRect();

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    node.addEventListener("mousedown", (e) => onMouseDown(e, node));
    document.addEventListener("mousemove", (e) => onMouseMove(e, node));
    document.addEventListener("mouseup", () => onMouseUp(node));
    //ノードをクリックして選択する機能の追加
    node.addEventListener("dblclick", () => selectNode(node));

    //右クリックを処理する
    node.addEventListener("contextmenu", (e) => {
        e.preventDefault();  //デフォルトの右クリックメニューを無効化
        enableEditing(node);  //ノードを編集可能にする
    })

    function onMouseDown(e, node) {
        if (node.contentEditable === "true") return;   //編集中はドラッグを無効にする

        isDragging = true;

        const node_rect = node.getBoundingClientRect();
        offsetX = e.clientX - node_rect.left;
        offsetY = e.clientY - node_rect.top;

        //ドラッグ中は文字選択を無効化
        document.body.style.userSelect = "none";
        node.style.cursor = "grabbing";
        node.style.backgroundColor = "yellow";

    }

    function onMouseMove(e, node) {
        if (isDragging) {
            //スクロール量を計算
            const scrollOffsetX = window.scrollX;
            const scrollOffsetY = window.scrollY;

            //summary_areaのrectを再取得（スクロール後の位置に合わせて更新）
            const summary_area_rect = summary_area.getBoundingClientRect();

            let x = e.clientX - summary_area_rect.left - offsetX + scrollOffsetX;
            let y = e.clientY - summary_area_rect.top - offsetY + scrollOffsetY;

            //範囲を制限
            x = Math.max(0, Math.min(x, summary_area_rect.width - node.offsetWidth));
            y = Math.max(0, Math.min(y, summary_area_rect.height - node.offsetHeight));
            //console.log(`${x}, ${y}`);

            node.style.left = `${x}px`;
            node.style.top = `${y}px`;

            //エッジの再描画
            updateEdges(node);

        }
    }

    function onMouseUp(node) {
        if (isDragging) {
            isDragging = false;

            node.style.cursor = "grab";
            //ドラッグ終了時に文字選択を有効化
            document.body.style.userSelect = "auto";

            if (selectedNodes.includes(node)) {
                node.style.backgroundColor = "lightblue";
            } else {
                node.style.backgroundColor = "#4CAF50";
            }
        }
    }
}

//ノードを編集可能にする関数
function enableEditing(node) {
    //すでに編集モードなら何もしない
    if (node.contentEditable === "true") {
        return;
    }

    node.contentEditable = "true";  //編集可能にする
    node.focus()     //フォーカスを当てる  これがないと，カーソルを表示するために，ノードを右クリック2回しなければならなかった
    node.style.backgroundColor = "lightyellow";  //背景色を指定
    node.style.cursor = "text";  //編集中にカーソルを棒に変更

    //編集を終了するためのイベントを設定
    node.addEventListener("blur", () => disableEditing(node), { once: true });
}

//ノードの編集モードを削除する関数
function disableEditing(node) {
    node.contentEditable = "false" //編集を終了
    if (node.className === "node") {
        node.style.backgroundColor = "#4CAF50";
        node.style.cursor = "grab";
    } else {
        node.style.backgroundColor = "#b2be6b";
        node.style.cursor = "default";
        //node.style.outline = "none";
    }
}

function selectNode(node) {
    //ノードの選択をトグル
    if (selectedNodes.includes(node)) {
        selectedNodes = selectedNodes.filter(n => n !== node);
        node.style.backgroundColor = "#4CAF50";
    } else {
        selectedNodes.push(node);
        node.style.backgroundColor = "lightblue";
    }
}

function connectNodes() {
    if (selectedNodes.length < 2) {
        alert("ノードを二つ選択してください．")
    } else if (selectedNodes.length === 2) {
        const svg_area = document.getElementById("svg_area");

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        const node1 = selectedNodes[0];
        const node2 = selectedNodes[1];

        //スクロール位置を考慮した座標の取得
        const node1_rect = node1.getBoundingClientRect();
        const node2_rect = node2.getBoundingClientRect();
        const summary_area = document.getElementById("summary_area");
        const summary_area_rect = summary_area.getBoundingClientRect();

        //スクロール位置を加算して，座標を補正
        const scrollOffsetX = window.scrollX;
        const scrollOffsetY = window.scrollY;

        const x1 = node1_rect.left + node1_rect.width / 2 - summary_area_rect.left + scrollOffsetX;
        const y1 = node1_rect.top + node1_rect.height / 2 - summary_area_rect.top + scrollOffsetY;
        const x2 = node2_rect.left + node2_rect.width / 2 - summary_area_rect.left + scrollOffsetX;
        const y2 = node2_rect.top + node2_rect.height / 2 - summary_area_rect.top + scrollOffsetY;

        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "2");

        //svg_areaに線を追加
        svg_area.appendChild(line);

        //関係性ノードをエッジの中心に追加
        const initialText = "関係性を選択";      //初期テキスト
        const relationshipNode = createRelationshipNode(x1, y1, x2, y2, initialText);
        summary_area.appendChild(relationshipNode);

        //エッジ情報を保存
        edges.push({
            node1,                 //エッジの始点ノード
            node2,                 //エッジの終点ノード
            line,                  //SVGの線オブジェクト
            relationshipNode       //関係性ノード
        });

        //選択状態をリセット
        selectedNodes.forEach(node => (node.style.backgroundColor = "#4CAF50"));
        selectedNodes = [];
    } else {
        alert("ノードを二つだけ選択してください．");
    }
}

function updateEdges(node) {
    edges.forEach(({ node1, node2, line, relationshipNode }) => {
        if (node === node1 || node === node2) {
            //エッジの再描画
            const x1 = getNodeCenterX(node1);
            const y1 = getNodeCenterY(node1);
            const x2 = getNodeCenterX(node2);
            const y2 = getNodeCenterY(node2);

            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);

            //関係性ノードをエッジの中心に移動
            const relationshipNode_rect = relationshipNode.getBoundingClientRect();
            const width = relationshipNode_rect.width;
            const height = relationshipNode_rect.height;

            const centerX = (x1 + x2) / 2;
            const centerY = (y1 + y2) / 2;

            relationshipNode.style.left = `${centerX - width / 2}px`;
            relationshipNode.style.top = `${centerY - height / 2}px`;
        }
    });
}

function getNodeCenterX(node) {
    const node_rect = node.getBoundingClientRect();
    const summary_area_rect = document.getElementById("summary_area").getBoundingClientRect();
    return node_rect.left + node_rect.width / 2 - summary_area_rect.left + window.scrollX;
}

function getNodeCenterY(node) {
    const node_rect = node.getBoundingClientRect();
    const summary_area_rect = document.getElementById("summary_area").getBoundingClientRect();
    return node_rect.top + node_rect.height / 2 - summary_area_rect.top + window.scrollY;
}

function deleteNodes() {
    if (selectedNodes.length === 0) {
        alert("削除するノードが選択されていません．");
        return;
    }

    //選択されたノードを1つずつ処理
    selectedNodes.forEach(nodeToDelete => {
        //エッジの削除
        edges = edges.filter(({ node1, node2, line, relationshipNode }) => {
            if (node1 === nodeToDelete || node2 === nodeToDelete) {
                line.remove();   //エッジをSVGから削除
                relationshipNode.remove();   //関係性ノードを削除
                return false;    //削除するエッジをフィルタリング 削除対象のエッジ
            }
            return true;
        });

        //ノードをHTML構造化から削除
        nodeToDelete.remove();
    });
    //選択ノードリストをリセット
    selectedNodes = [];
}

function createRelationshipNode(x1, y1, x2, y2, initialText) {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;

    const relationshipNode = document.createElement("div");
    relationshipNode.className = "relationship-node";
    relationshipNode.textContent = initialText;      //初期テキスト　後で変更可能にする

    //エッジの中心に配置
    relationshipNode.style.left = `${centerX - 55}px`;     //テキストは100pxであるが，paddingが5pxずつある
    relationshipNode.style.top = `${centerY - 30}px`;

    //初期状態をセット　赤い枠の判定に使用する
    relationshipNode.dataset.flag = "false"  //datasetでflagを管理

    //ノードクリック時にテキストを編集可能にする
    relationshipNode.addEventListener("contextmenu", (e) => {
        e.preventDefault();  //イベントのバブリングを防止

        //他の関係性ノードのハイライトを解除
        document.querySelectorAll(".relationship-node").forEach(node => {
            if (node !== relationshipNode) {
                node.style.outline = "none";   //ハイライトを解除
                node.dataset.flag = "false";   //他のノードのフラグを初期化
            }
        });

        //クリックされたノードの状態を切り替え
        if (relationshipNode.dataset.flag === "true") {
            relationshipNode.style.outline = "none";
            relationshipNode.dataset.flag = "false";     //フラグをfalseに戻す
        } else {
            //クリックされた関係性ノードをハイライト
            relationshipNode.style.outline = "2px solid red";    //赤色の枠で囲む
            relationshipNode.dataset.flag = "true";
        }

        toggleDropdownMenu(e, relationshipNode);
    })

    document.addEventListener("click", () => {
        relationshipNode.style.outline = "none";
        relationshipNode.dataset.flag = "false";
    })

    return relationshipNode;
}

//プルダウンメニューを表示する関数
function toggleDropdownMenu(e, relationshipNode) {
    //プルダウンメニューの作成
    const menu = document.getElementById("mindmap_conmenu");

    //表示されている場合は閉じる
    if (menu.style.display === "block") {
        menu.style.display = "none";
        return;
    }

    const cursorX = e.clientX + window.scrollX;  //スクロール位置を加算　後で修正するかも
    const cursorY = e.clientY + window.scrollY;

    menu.style.left = `${cursorX}px`;                       //scrollOffsetの符号は考え直す必要がある
    menu.style.top = `${cursorY}px`;
    menu.style.display = "block";

    //メニューをクリック以外で閉じるイベントを設定
    document.addEventListener("click", () => {
        menu.style.display = "none";
    }, {
        once: true
    });
}

//自由記述ボタンをクリックした際の処理
function free_description() {
    //フラグがtrueになっているノードを取得
    const relationshipNode = document.querySelector(".relationship-node[data-flag='true']");    //探しているノードがなければnullが返される  実行される順序が怪しめ

    if (relationshipNode) {
        //編集モードに変更
        enableEditing(relationshipNode);
        //relationshipNode.style.outline = "2px solid red"; 編集中は赤い枠を表示し続ける
    }

}