//ノード追加時のID管理
let globalNodeId = 0;


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
    let x = Math.random() * (summary_area_rect.width - 50); //ノードの幅を考慮
    let y = Math.random() * (summary_area_rect.height - 50); //ノードの高さを考慮

    const node = document.createElement("div");
    const nodeID = ++globalNodeId;

    node.className = "node";
    node.textContent = `${nodeID}`;
    node.dataset.nodeId = nodeID;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;

    return node;
}

//ドラッグと感性の動きを設定する関数
function setupDragAndInertia(node, summary_area) {
    const summary_area_rect = summary_area.getBoundingClientRect();

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let animationFrame;

    //ばね力関連の変数
    const springConstant = 0.1;  //ばね定数
    const dampingFactor = 0.95;  //摩擦係数

    node.addEventListener("mousedown", (e) => onMouseDown(e, node));
    document.addEventListener("mousemove", (e) => onMouseMove(e, node));
    document.addEventListener("mouseup", onMouseUp);

    function onMouseDown(e, node) {
        isDragging = true;

        const node_rect = node.getBoundingClientRect();
        offsetX = e.clientX - node_rect.left;
        offsetY = e.clientY - node_rect.top;
        node.style.cursor = "grabbing";

        //速度をリセット
        velocityX = 0;
        velocityY = 0;

        //アニメーションを停止
        cancelAnimationFrame(animationFrame);
    }

    function onMouseMove(e, node) {
        if (isDragging) {
            let x = e.clientX - summary_area_rect.left - offsetX;
            let y = e.clientY - summary_area_rect.top - offsetY;

            //範囲を制限
            x = Math.max(0, Math.min(x, summary_area_rect.width - node.offsetWidth));
            y = Math.max(0, Math.min(y, summary_area_rect.height - node.offsetHeight));

            node.style.left = `${x}px`;
            node.style.top = `${y}px`;

            //速度を計算
            velocityX = e.movementX;
            velocityY = e.movementY;
        }
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            node.style.cursor = "grab";
            startSpringMotion();
        }
    }

    function startSpringMotion() {
        const summary_area_rect = summary_area.getBoundingClientRect();

        //初期位置
        let x = parseFloat(node.style.left);
        let y = parseFloat(node.style.top);

        function animate() {
            //目標位置
            const targetX = summary_area_rect.width / 2 - node.offsetWidth / 2;
            const targetY = summary_area_rect.height / 2 - node.offsetHeight / 2;

            //ばね力を計算
            const springForceX = -springConstant * (x - targetX);
            const springForceY = -springConstant * (y - targetY);

            //速度を加える
            velocityX += springForceX;
            velocityY += springForceY;

            //摩擦を加える
            velocityX *= dampingFactor;
            velocityY *= dampingFactor;

            //ノードの位置を更新
            x += velocityX;
            y += velocityY;

            // 範囲を制限
            x = Math.max(0, Math.min(x, summary_area_rect.width - node.offsetWidth));
            y = Math.max(0, Math.min(y, summary_area_rect.height - node.offsetHeight));

            node.style.left = `${x}px`;
            node.style.top = `${y}px`;

            //ばねの動きが完全に止まったらアニメーションを停止
            if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
                animationFrame = requestAnimationFrame(animate);
            }

        }

        animate();
    }

}
