// ノードとエッジのデータを管理するための配列
let nodes = new vis.DataSet();
let edges = new vis.DataSet();

// 選択されたノードを管理する
let selectedNodes = [];

// ノードのIDを自動で増やすカウンター
let globalNodeId = 0;

// vis.js 用のネットワーク設定
const container = document.getElementById("summary_area");
const data = { nodes: nodes, edges: edges };
const options = {
    manipulation: {
        enabled: true,
        initiallyActive: true,
        addNode: function(data, callback) {
            data.label = `${++globalNodeId}`;
            nodes.add(data);
            callback(data);
        },
        editNode: function(data, callback) {
            enableEditing(data, callback); // 編集用関数を追加
        },
        deleteNode: function(data) {
            nodes.remove(data);
        },
        addEdge: function(data, callback) {
            edges.add(data);
            callback(data);
        },
        deleteEdge: function(data) {
            edges.remove(data);
        }
    },
    physics: {
        enabled: true
    }
};
const network = new vis.Network(container  , data, options);

// ノード追加の関数
function add_paragraph() {
    const nodeID = ++globalNodeId;
    const newNode = {
        id: nodeID,
        label: `${nodeID}`,
        x: 0,  // 初期位置（後でドラッグで調整）
        y: 0,  // 初期位置（後でドラッグで調整）
        fixed: false  // ノードを動かせる状態に
    };

    // ノードを vis.js の DataSet に追加
    nodes.add(newNode);

    // ノードが追加された後、選択状態にしてエッジの作成を促進
    // if (selectedNodes.length === 1) {
    //     selectedNodes.push(newNode);
    //     const edge = {
    //         from: selected
    //     }
    // }

    // ネットワークを再描画して新しいノードが表示されるようにする
    network.redraw();
}

// ノード編集時の設定（右クリックメニューや、テキスト編集機能）
function enableEditing(nodeData, callback) {
    const node = nodes.get(nodeData.id);
    node.label = prompt("ノードのラベルを入力してください", node.label) || node.label;
    nodes.update(node); // 更新したラベルを反映
    callback(node);
}

// network.on("selectNode", function(event) {
//     const nodeId = event.nodes[0];   //選択されたノード

//     //二つ目のノードを選んだ場合にエッジを追加
//     if (selectedNodes.length === 1 && selectedNodes[0] !== nodeId) {
//         //既にエッジが存在するか確認
//         const existingEdge = edges.get({
//             filter: function(edge) {
//                 return (edge.from === selectedNodes[0] && edge.to === nodeId) ||
//                        (edge.from === nodeId && edge.to === selectedNodes[0]);
//             }
//         });

//         //エッジが存在しない場合のみエッジを追加
//         if (existingEdge.length === 0) {
//             const edgeData = {
//                 from: selectedNodes[0],
//                 to: nodeId
//             };
//             edges.add(edgeData);
//         } else {
//             alert("この２つのノードには既にエッジがあります");
//         }

//         selectedNodes = [];   //ノード選択をリセット
//     } else {
//         selectedNodes.push(nodeId);   //一つ目のノードを選択
//     }
// })

let menu;

// document.addEventListener("DOMContentLoaded", function() {
//     menu = document.getElementById("node_conmenu");    //右クリック時のメニュー
//     console.log(menu);
//     if (!menu) {
//         console.log("メニューがない");
//     }
// });

network.on("oncontext", function (params) {
    params.event.preventDefault();   //デフォルトの右クリックメニューを防止
    console.log(params);
    
    const nodeId = params.nodes[0];   //右クリックされたノードのIDを取得

    if (nodeId) {
        const nodePosition = network.getPositions([nodeId]);
        console.log(nodePosition);
        const nodeX = nodePosition[nodeId].x;
        const nodeY = nodePosition[nodeId].y;
        console.log(nodeX, nodeY);

        //vis.jsの座標をブラウザの絶対座標に変換
        const canvasCoords = network.canvasToDOM({ x: nodeX, y: nodeY });

        const menu = document.getElementById("node_conmenu");
        console.log(menu);
        if (!menu) {
            alert("menuがない");
        } 
        menu.style.left = `${canvasCoords.x}px`;      //絶対座標に基づいて位置を設定
        menu.style.top = `${canvasCoords.y}px`;
        menu.style.display = "block";         //メニューを表示

        //エッジを引くボタンをクリックしたときの処理
        const edgeButton = document.getElementById("drawingEdge");
        edgeButton.onclick = function () {
            connectNodes(nodeId);
        }
    }
});

// ノード同士を繋ぐエッジの作成
function connectNodes(nodeId) {
    alert('エッジを引くノードを選択してください');

    selectedNodes.push(nodeId);

    network.on("selectNode", function(event) {
        const selectedNode = event.nodes[0];

        if (selectedNode !== nodeId) {
            selectedNodes.push(selectedNode);
        }
    })

    if (selectedNodes.length === 2) {
        const existingEdge = edges.get({
            filter: function(edge) {
                return (edge.from === selectedNodes[0] && edge.to === selectedNodes[1]) ||
                       (edge.from === selectedNodes[1] && edge.to === selectedNodes[0]);
            }
        })

        if (existingEdge.length === 0) {
            const edgeData = {
                from: selectedNodes[0],
                to: selectedNodes[1]
            };
            edges.add(edgeData);
        } else {
            alert("この２つのノードには既にエッジが引かれています");
        }
    }

    selectedNodes = [];

    // network.on("selectNode", function(event) {
    //     const nodeId = event.nodes[0];   //選択されたノード
    
    //     //二つ目のノードを選んだ場合にエッジを追加
    //     if (selectedNodes.length === 1 && selectedNodes[0] !== nodeId) {
    //         //既にエッジが存在するか確認
    //         const existingEdge = edges.get({
    //             filter: function(edge) {
    //                 return (edge.from === selectedNodes[0] && edge.to === nodeId) ||
    //                        (edge.from === nodeId && edge.to === selectedNodes[0]);
    //             }
    //         });
    
    //         //エッジが存在しない場合のみエッジを追加
    //         if (existingEdge.length === 0) {
    //             const edgeData = {
    //                 from: selectedNodes[0],
    //                 to: nodeId
    //             };
    //             edges.add(edgeData);
    //         } else {
    //             alert("この２つのノードには既にエッジがあります");
    //         }
    
    //         selectedNodes = [];   //ノード選択をリセット
    //     } else {
    //         selectedNodes.push(nodeId);   //一つ目のノードを選択
    //     }
    // });
}

// ノード削除の関数
function deleteNodes() {
    selectedNodes.forEach(node => {
        nodes.remove(node);
    });
    selectedNodes = [];
}
