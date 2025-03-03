// ノードとエッジのデータを管理するための配列
let nodes = new vis.DataSet();
let edges = new vis.DataSet();

// 選択されたノードを管理する
// let selectedNodes = [];
let selectedNodeId = null;

//node_conmenuを削除するかどうか決める変数
let blockConmenu = true;

//ノードの色を管理する
let draggedNode = null;        //ドラッグ中
let rightClickedNode = null;   //右クリック中

// ノードのIDを自動で増やすカウンター
let globalNodeId = 0;

// vis.js 用のネットワーク設定
const container = document.getElementById("summary_area");
const data = { nodes: nodes, edges: edges };
const options = {
    // エッジの設定をすると，後でエッジの形を指定する際に上書きされてしまった
    edges: {
        smooth: false    //全てのエッジに直線を利用
    },
    manipulation: {
        enabled: true,
        initiallyActive: true,
        // addNode: function (data, callback) {
        //     data.label = `${++globalNodeId}`;
        //     nodes.add(data);
        //     callback(data);
        // },
        // editNode: function (data, callback) {
        //     enableEditing(data, callback); // 編集用関数を追加
        // },
        // deleteNode: function (data) {
        //     nodes.remove(data);
        // },
        // addEdge: function (data, callback) {
        //     edges.add(data);
        //     callback(data);
        // },
        // deleteEdge: function (data) {
        //     edges.remove(data);
        // }
    },
    physics: {
        enabled: false
    },
    interaction: {
        hover: true
    }
};

const network = new vis.Network(container, data, options);     //summary_areaの要素を書き換えてしまう  node_conmenuはsummary_areaの外に置く

// ノード追加の関数　　　
function add_paragraph(granularity) {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
        alert("ノードと対応付ける範囲を選択してください");
        return;
    }
    const range = selection.getRangeAt(0);
    selection.removeAllRanges();

    //ユーザに段落番号・章番号を入力させる
    let number = null;
    while (true) {
        if (granularity === "paragraph") {
            number = prompt("段落番号を入力してください：");
        } else {
            number = prompt("章番号を入力してください：");
        }

        if (number === null) {
            return;
        }

        //数字ではない場合は再入力
        if (isNaN(number) || number.trim() === "") {
            alert("数字を入力してください：");
        } else {
            break;
        }
    }

    number = number.trim()

    let label = null;
    let background = null;
    let border = null;
    let highlight_background = null;
    let highlight_border = null;
    let initialPosition_x = 0;
    let initialPosition_y = 0;
    let classname = null;

    if (granularity === "paragraph") {
        label = `${number}段落`;
        background = "#85B9FF";
        border = "#2B7CE9";
        highlight_background = "#D2E5FF";
        highlight_border = "#2B7CE9";
        classname = "paragraph"
    } else {
        label = `${number}章`;
        background = "#C1E58C";
        border = "#6B8E23";
        highlight_background = "#D8F5A2";
        highlight_border = "#6B8E23";
        classname = "chapter";
    }

    const nodeId = ++globalNodeId;
    const newNode = {
        id: nodeId,
        label: "newNode",
        className: classname,
        x: initialPosition_x,  // 初期位置（後でドラッグで調整）
        y: initialPosition_y,  // 初期位置（後でドラッグで調整）
        shape: "box",
        font: {
            align: "left"
        },
        widthConstraint: {
            maximum: 400
        },
        color: {
            background: background,
            border: border,
            highlight: {
                background: highlight_background,
                border: highlight_border
            },
            hover: {
                background: highlight_background,
                border: highlight_border
            }
        },
        // width: 1000,
        height: 60,
        zIndex: 10,
        fixed: false,  // ノードを動かせる状態に
        customData: {
            range: range,       // Range オブジェクトは JavaScript のネイティブオブジェクトであり、シリアライズ（JSON化）できない ため、そのまま保存すると vis.js の toJSON() などを使うときに問題が起こる可能性がある．
            highlight: []
        }
    };

    const newNode_tag = {
        id: `tag${nodeId}`,
        label: label,
        x: initialPosition_x,         //初期位置
        y: initialPosition_y - 20,         //初期位置
        shape: "box",
        color: {
            background: background,
            border: border
        },
        height: 60,
        zIndex: 0,
        fixed: true    //ノードを固定する
    };

    // ノードを vis.js の DataSet に追加
    nodes.add([newNode, newNode_tag]);
    //タグノードを追加
    // nodes.add(newNode_tag);

    // ノードが追加された後、選択状態にしてエッジの作成を促進
    // if (selectedNodes.length === 1) {
    //     selectedNodes.push(newNode);
    //     const edge = {
    //         from: selected
    //     }
    // }
    // ネットワークを再描画して新しいノードが表示されるようにする
    network.redraw();  //これが必要な時と必要でない時
    console.log(nodes.get(nodeId));
    console.log(nodes.get(`tag${nodeId}`), nodes.get(nodeId).info);
}

// //ノードのドラッグ開始時
// network.on("dragStart", function (event) {
//     const nodeId = event.nodes[0];
//     if (nodeId) {
//         const node = nodes.get(nodeId);
//         node.color = { background: "lightblue" };    //ドラッグ中の色変更
//         nodes.update(node);
//         draggedNode = nodeId;    //ドラッグ中のノードの記録
//     }
// });

// //ドラッグ終了時に元の色に戻す
// network.on("dragEnd", function (event) {
//     if (draggedNode) {
//         const node = nodes.get(draggedNode);
//         node.color = { background: "blue" };
//         nodes.update(node);
//         draggedNode = null;   //ドラッグ中ノードの記録解除
//     }
// });

const node_conmenu = document.getElementById("node_conmenu");
const relationship_conmenu = document.getElementById("relationship_conmenu");
const saveHighlight_conmenu = document.getElementById("saveHighlight_conmenu");
// let canvasCoords = null;

network.on("oncontext", function (params) {
    params.event.preventDefault();   //デフォルトの右クリックメニューを防止

    //右クリックの座標を取得
    const pointer = params.pointer.DOM;

    //クリックした位置にあるノードを取得
    const nodeId = network.getNodeAt(pointer);

    if (nodeId) {
        //nodeIdがtagノードであった場合は処理しない
        if (isNaN(nodeId)) {
            return;
        }

        selectedNodeId = nodeId;

        //右クリックされたノードの色を変更
        // nodes.update({
        //     id: selectedNodeId,
        //     color: {
        //         background: "#ffcccc"   //背景色を変更
        //     }
        // })
        // const node = nodes.get(nodeId);
        // selectedNode = node;

        // const node = nodes.get(nodeId);
        // const node_color = options.nodes.highlight.background;
        // console.log(node_color);
        // node.color = { background: `${node_color}` };   //右クリック時の色変更
        // nodes.update(node);
        // rightClickedNode = nodeId;    //右クリックさせたノードの記録

        const nodePosition = network.getPositions([nodeId]);

        const nodeX = nodePosition[nodeId].x;
        const nodeY = nodePosition[nodeId].y;

        //vis.jsの座標をブラウザの絶対座標に変換
        const canvasCoords = network.canvasToDOM({ x: nodeX, y: nodeY });

        //親要素（summary_area）のオフセットを取得
        const containerOffset = container.getBoundingClientRect();

        // 親要素のオフセットを加算して、node_conmenu の位置を調整
        node_conmenu.style.left = `${canvasCoords.x + containerOffset.left}px`;      //絶対座標に基づいて位置を設定
        node_conmenu.style.top = `${canvasCoords.y}px`;
        node_conmenu.style.display = "block";                 //メニューを表示

        //エッジを引くボタンをクリックしたときの処理
        // const edgeButton = document.getElementById("drawingEdge");
        // edgeButton.onclick = function () {
        //     connectNodes(nodeId);
        // };

        //他の場所をクリックしたらメニューを非表示にする
        document.addEventListener("click", function hideMenu(event) {
            if (blockConmenu) {
                if (!node_conmenu.contains(event.target) && !documentArea.contains(event.target) && !highlight_conmenu.contains(event.target)) {

                    node_conmenu.style.display = "none";
                    document.removeEventListener("click", hideMenu);     //登録した関数を削除するため引数必要ない
                    selectedNodeId = null;
                    console.log("hide");
                }
            }
        });

    }
});

network.on("selectNode", function (event) {
    if (event.nodes.length > 0) {   // この条件は必要なのか
        selectedNodeId = event.nodes[0];
        highlightRanges(selectedNodeId);
    }
});

network.on("deselectNode", function () {
    //document_areaのハイライトを解除する
    clearHighlights();
});

//ノードを動かし始めた瞬間にもメニューを消す
network.on("dragStart", function () {
    if (node_conmenu) {
        node_conmenu.style.display = "none";
    }
    selectedNodeId = null;

    //relationshipの表示位置を更新する条件
    // if (relationship.style.display === "block") {
    //     //既に表示されているrelationshipがそのエッジに関連しているかチェック
    //     edges.forEach(function (edge) {
    //         const fromNodePosition = network.getPositions([edge.from])[edge.from];
    //         const toNodePosition = network.getPositions([edge.to])[edge.to];

    //         const centerX = (fromNodePosition.x + toNodePosition.x) / 2;
    //         const centerY = (fromNodePosition.y + toNodePosition.y) / 2;

    //         const domPosition = network.canvasToDOM({ x: centerX, y: centerY });

    //         relationship.style.left = `${domPosition.x}px`;
    //         relationship.style.top = `${domPosition.y}px`;
    //     });
    // }
});

network.on("dragging", function (event) {
    if (!event.nodes.length) return;  //ノードが選択されていない場合は処理しない

    const moveNodeId = event.nodes[0];
    const pos = network.getPositions(moveNodeId);
    const newX = pos[moveNodeId].x;
    const newY = pos[moveNodeId].y;

    const tagNode = nodes.get(`tag${moveNodeId}`);
    console.log("dragging");
    console.log(tagNode);

    if (tagNode) {
        nodes.update({
            id: `tag${moveNodeId}`,
            x: newX,
            y: newY - 20,   //newNodeとの相対位置を維持
            // fixed: false
        });
        console.log(tagNode);
    }
});

const tmp = node_conmenu.innerHTML;

function changeMenu(menu) {
    blockConmenu = false;
    if (menu === "relationship") {
        node_conmenu.innerHTML = relationship_conmenu.innerHTML;
    } else {
        node_conmenu.innerHTML = saveHighlight_conmenu.innerHTML;
        tohighlight()
    }
    setTimeout(function () {           //すぐにhideMenuが実行されてしまうのを防ぐ
        blockConmenu = true;
    });
}

function backMenu() {
    blockConmenu = false;
    node_conmenu.innerHTML = tmp;
    setTimeout(function () {
        blockConmenu = true;
    });
}

const relationship = document.getElementById("binding_relationship");

// ノード同士を繋ぐエッジの作成
function connectNodes(binding) {
    console.log(selectedNodeId);
    let selectedNodesId = [];
    if (selectedNodeId) {
        blockConmenu = false;
        node_conmenu.style.display = "none";

        selectedNodesId.push(selectedNodeId);
        console.log(selectedNodesId[0]);
        selectedNodeId = null;

        // alert("エッジを引くノードを選択してください");

        //ノード選択時の処理   一度エッジの処理が終わるたびにnetwork.on("selectNode")を削除する
        const selectNodeHandler = function (event) {
            console.log(selectedNodesId[0]);
            if (event.nodes[0] !== selectedNodesId[0]) {
                selectedNodesId.push(event.nodes[0]);
            } else {
                alert("別のノードを選択してください");
                return;                                  //network.on("selectNode", function ())の処理を終える
            }

            if (selectedNodesId.length === 2) {
                alert("ノードの選択完了しました");

                const existingEdge = edges.get({
                    filter: function (edge) {
                        return (edge.from === selectedNodesId[0] && edge.to === selectedNodesId[1]) ||
                            (edge.from === selectedNodesId[1] && edge.to === selectedNodesId[0]);
                    }
                });

                let edgeData = null;

                if (existingEdge.length === 0) {
                    switch (binding) {
                        case "parallel":
                            edgeData = {
                                from: selectedNodesId[0],
                                to: selectedNodesId[1],
                                arrows: {
                                    from: { enabled: true, type: "circle" },
                                    to: { enabled: true, type: "circle" }
                                },
                            };
                            break;
                        case "contrast":
                            edgeData = {
                                from: selectedNodesId[0],
                                to: selectedNodesId[1],
                                arrows: {
                                    from: { enabled: true, type: "inv_curve" },
                                    to: { enabled: true, type: "inv_curve" }
                                }
                            };
                            break;
                        case "adversative":
                            edgeData = {
                                from: selectedNodesId[0],
                                to: selectedNodesId[1],
                                arrows: "from,to"
                            };
                            break;
                        case "causeAndeffect":
                            edgeData = {
                                from: selectedNodesId[0],
                                to: selectedNodesId[1],
                                arrows: {
                                    from: { enabled: true, type: "box" },
                                    to: { enabled: true, type: "diamond" }
                                }
                            };
                            break;
                        case "abstractAndconcrete":
                            edgeData = {
                                from: selectedNodesId[0],
                                to: selectedNodesId[1],
                                arrows: {
                                    from: { enabled: true, type: "box" },
                                    to: { enabled: true, type: "inv_triangle" }
                                }
                            };
                            break;
                        default:
                            edgeData = {
                                from: selectedNodesId[0],
                                to: selectedNodesId[1],
                                arrows: {
                                    from: { enabled: true, type: "box" },
                                    to: { enabled: true, type: "arrow" }
                                }
                            };
                            break;
                    }
                    // const edgeData = {
                    //     from: selectedNodesId[0],
                    //     to: selectedNodesId[1]
                    // };
                    console.log(edgeData);
                    edges.add(edgeData);

                    // //ノードの座標を取得
                    // const fromNode = network.getPositions([selectedNodesId[0]])[selectedNodesId[0]];    //{1: {x: 100, y: 200}}
                    // const toNode = network.getPositions([selectedNodesId[1]])[selectedNodesId[1]];

                    // //エッジの中心座標を計算
                    // const centerX = (fromNode.x + toNode.x) / 2;
                    // const centerY = (fromNode.y + toNode.y) / 2;

                    // //vis.jsの座標をブラウザの絶対座標に変換
                    // const domPosition = network.canvasToDOM({ x: centerX, y: centerY });

                    // //relationshipを配置
                    // relationship.style.display = "block";
                    // relationship.style.left = `${domPosition.x}px`;
                    // relationship.style.top = `${domPosition.y}px`;

                } else {
                    alert("この2つのノードには既にエッジが引かれています");
                }

                network.off("selectNode", selectNodeHandler);

                //ノードの選択をリセット
                selectedNodesId = [];
            }

        };

        network.on("selectNode", selectNodeHandler);

        // network.on("selectNode", function (event) {
        //     console.log(selectedNodesId[0]);
        //     if (event.nodes[0] !== selectedNodesId[0]) {
        //         selectedNodesId.push(event.nodes[0]);
        //     } else {
        //         alert("別のノードを選択してください");
        //         network.unselectAll();
        //         return;                                  //network.on("selectNode", function ())の処理を終える
        //     }

        //     if (selectedNodesId.length === 2) {
        //         alert("ノードの選択完了しました");

        //         network.unselectAll();

        //         const existingEdge = edges.get({
        //             filter: function (edge) {
        //                 return (edge.from === selectedNodesId[0] && edge.to === selectedNodesId[1]) ||
        //                     (edge.from === selectedNodesId[1] && edge.to === selectedNodesId[0]);
        //             }
        //         });

        //         if (existingEdge.length === 0) {
        //             const edgeData = {
        //                 from: selectedNodesId[0],
        //                 to: selectedNodesId[1]
        //             };
        //             edges.add(edgeData);
        //         } else {
        //             alert("この2つのノードには既にエッジが引かれています");

        //             network.unselectAll();
        //         }
        //         //ノードの選択をリセット
        //         selectedNodesId = [];
        //     }

        // });
    }
}

// network.on("afterDrawing", function() {
//     //ここに描画後のカスタム処理を記述
//     console.log("ネットワークの描画が完了しました");

//     //エッジの中心にHTML要素を追加したい場合の処理
//     edges.forEach(function (edge) {
//         const fromNodePosition = network.getPositions([edge.from])[edge.from];
//         const toNodePosition = network.getPositions([edge.to])[edge.to];

//         //エッジの中心座標を計算
//         const centerX = (fromNodePosition.x + toNodePosition.x) / 2;
//         const centerY = (fromNodePosition.y + toNodePosition.y) / 2;

//         //vis.jsの座標をブラウザの絶対座標に変換
//         const domPosition = network.canvasToDOM({ x: centerX, y: centerY});

//         //エッジ中心にHTML要素を配置
//         const edgeLabel = document.getElementById("binding_relationship");
//         edgeLabel.style.left = `${domPosition.x}px`;
//         edgeLabel.style.top = `${domPosition.y}px`;
//         edgeLabel.style.display = "block";
//     })
// });

let editBox = document.getElementById("editBox");

// ノード編集時の設定（右クリックメニューや、テキスト編集機能）    
function enableEditing() {
    node_conmenu.style.display = "none";
    const editableNodeId = selectedNodeId;       //他の場所をクリックするとselectedNodeId = nullになってしまう

    if (editableNodeId) {
        const editableNode = nodes.get(editableNodeId);
        const newLabel = prompt(`${editableNodeId}段落の要約を記入してください`, editableNode.label);

        nodes.update({
            id: editableNodeId,
            label: newLabel                         //.replace(/(.{25})/g, "$1\n")   //25文字ごとに改行を挿入
        });

        selectedNodeId = null;

    }
}

// ノード削除の関数
function deleteNode() {
    if (selectedNodeId) {
        nodes.remove([selectedNodeId, `tag${selectedNodeId}`]);
        node_conmenu.style.display = "none";

    }
    selectedNodeId = null;
}

function drawhighlight() {

}
