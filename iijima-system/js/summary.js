//ノード追加時のID管理
let globalNodeId = 0;


function add_paragraph() {
    //表示エリアの参照を取得
    const summary_area = document.getElementById("summary_area");

    //ノードの生成
    const node = document.createElement("div");
    const nodeID = ++globalNodeId;

    node.className = "node";
    node.textContent = `${nodeID}`;
    node.dataset.nodeId = nodeID;

    //ノードの位置をランダムに生成（summary_area内で）
    const summary_area_rect = summary_area.getBoundingClientRect();
    let x = Math.random() * (summary_area_rect.width - 50); //ノードの幅を考慮
    let y = Math.random() * (summary_area_rect.height - 50); //ノードの高さを考慮

    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    summary_area.appendChild(node);

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;


    node.addEventListener("mousedown", (e) => {
        isDragging = true;

        const node_rect = node.getBoundingClientRect();
        offsetX = e.clientX - node_rect.left;     //マウスのX位置とノードの左端の差
        offsetY = e.clientY - node_rect.top;      //マウスのY位置とノードの上端の差
        node.style.cursor = "grabbing";    //視覚的フィードバック
    });

    document.addEventListener("mousemove", (e) => {
        //ノードの位置をマウスの位置に合わせて更新
        if (isDragging) {
            //ノードがsummary_area内でのみ動けるようにする
            x = e.clientX - summary_area_rect.left - offsetX;
            y = e.clientY - summary_area_rect.top - offsetY;
            console.log(e.clientX);
            console.log(e.clientY);

            //範囲を制限
            x = Math.max(0, Math.min(x, summary_area_rect.width - node.offsetWidth));
            y = Math.max(0, Math.min(y, summary_area_rect.height - node.offsetHeight));

            node.style.left = `${x}px`;
            node.style.top = `${y}px`;

        };
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;  //ドラッグ終了
        node.style.cursor = "grab"  //元に戻す
    });

};