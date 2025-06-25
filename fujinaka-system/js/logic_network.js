let defaultLogicNetwork;
let defaultRecordLogicNetwork;

class LogicNetwork {
  constructor(container, load) {
    defaultRecordLogicNetwork = new RecordLogicNetwork();
    this.nodes = new vis.DataSet();
    this.edges = new vis.DataSet();
    this.options = {
      physics: false,
      interaction: {
        multiselect: false,
      }
    };
    this.latest_selected_node_info = {
      x: 0,
      y: 35,
    }
    this.network = null;
    this.edgeEditMode = false; //リンクの編集モード
    this.dragStartNodeId = null;  //ドラッグスタートしたノードのID
    this.dragEndNodeId = null; //ドラッグエンドしたノードID

    this.ownNetwork = this.generateLogicNetworkCanvas(container, this.nodes, this.edges);
      if(load == "load")
        this.ownNetwork.on('dragStart', this.dragstart.bind(this));
        this.ownNetwork.on('dragEnd', this.dragend.bind(this));
        this.ownNetwork.on('doubleClick', this.doubleclick.bind(this));
        this.ownNetwork.on('click', (params) => {
          // 既存のタグメニューを消す
          const oldTagMenu = document.getElementById('tagMenu');
          if (oldTagMenu) oldTagMenu.remove();
      
          if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const nodePosition = this.ownNetwork.getPositions([nodeId])[nodeId];
            const canvasPosition = this.ownNetwork.canvasToDOM(nodePosition);
      
            // ノードのサイズを仮定（必要なら取得方法を工夫）
            const nodeRadius = 30; // ノードの半径（px）
      
            // タグメニューを作成
            const tagMenu = document.createElement('div');
            tagMenu.id = 'tagMenu';
            tagMenu.style.position = 'absolute';
            tagMenu.style.left = (canvasPosition.x + nodeRadius) + 'px'; // 右へ
            tagMenu.style.top = (canvasPosition.y - nodeRadius) + 'px';  // 上へ
            tagMenu.style.background = '#fff';
            tagMenu.style.border = '1px solid #ccc';
            tagMenu.style.padding = '4px';
            tagMenu.style.zIndex = 1000;
      
            // タグボタンA
            const btnA = document.createElement('button');
            btnA.textContent = '主張';
            btnA.onclick = () => {
              addTagToNode(nodeId, '主張');
              tagMenu.remove();
            };
            tagMenu.appendChild(btnA);
      
            // タグボタンB
            const btnB = document.createElement('button');
            btnB.textContent = '事実';
            btnB.onclick = () => {
              this.addTagToNode(nodeId, '事実');
              tagMenu.remove();
            };
            tagMenu.appendChild(btnB);
      
            const btnC = document.createElement('button');
            btnC.textContent = '理由付け';
            btnC.onclick = () => {
              this.addTagToNode(nodeId, '理由付け');
              tagMenu.remove();
            };
            tagMenu.appendChild(btnC);
      
            document.body.appendChild(tagMenu);
      
            // メニュー外クリックで消す
            setTimeout(() => {
              document.addEventListener('click', function handler(e) {
                if (!tagMenu.contains(e.target)) tagMenu.remove();
                document.removeEventListener('click', handler);
              });
            }, 0);
          }
        });
  }

  setNodes(newNodes) {
    this.nodes = newNodes;
  }
  setEdges(newEdges) {
    this.edges = newEdges;
  }
  setOptions(options) {
    this.options = options;
  }

  //エッジ編集できるか切り替え
  SelectEditEdge(){
    console.log("切り替え");
    this.edgeEditMode = !this.edgeEditMode;
    if(this.edgeEditMode){
      this.enableEditEdge();
    }else{
      this.disableEditEdge();
    }
  }

  //エッジ編集できる場合の処理
  enableEditEdge() {
    document.getElementById("ln_startEditEdge").value = "エッジ追加終了";
    this.nodes.update(this.nodes.map(n => {
      return { ...n, fixed: true };
    }));
  }

  //エッジ編集できない場合の処理
  disableEditEdge() {
    document.getElementById("ln_startEditEdge").value = "エッジ追加";
    this.edgeEditMode = false;
    this.nodes.update(this.nodes.map(n => {
      return n.type !== "topic-tag" ? { ...n, fixed: false } : { ...n, fixed: true };
    }));
  }

  //乱数生成
  generateUniqueNumberText() {
    return `${new Date().getTime()}${Math.floor(1000000 * Math.random())}`;
  }

  //ネットワークを生成する
  generateLogicNetworkCanvas(mynetwork, nodes, edges) {
    return new vis.Network(
      document.getElementById(mynetwork),
      {
        nodes: nodes,
        edges: edges,
      },
      this.options
    );
  }

  addReloadNode(node_id, node_label, node_x, node_y) {

    let node_shape = 'box';     // ノードの形状
    let position_fixed = false; // ノードを動かせるかどうか（Falseなら動かせる）

    // ラベルを10文字ごとに改行する
    let result_label = '';
    const lines = node_label.split('\n'); // 改行ごとに分割
    for (let line of lines) {

        // 10文字ごとに改行
        for (let i = 0; i < line.length; i += 10) {
            result_label += line.substring(i, i + 10) + '\n';
        }
    }

    result_label = result_label.trim(); // 末尾の不要な改行を除去

    // 実際にネットワークに追加するノードのデータを作成
    const newNode = {
        id: `${node_id}`, 
        label: result_label,
        shape: node_shape,
        fixed: position_fixed,
        x: node_x, y: node_y,
        size: 30,
    };

    // ノードをthis.nodesに追加
    this.nodes.add(newNode);

    // ノードが追加された後に確認
    console.log("Created newNode:", newNode);

    // ノードの位置調整
    const boundingBox = this.ownNetwork.getBoundingBox(`${node_id}`);
    this.latest_selected_node_info.x = node_x;
    this.latest_selected_node_info.y = boundingBox.bottom + 10;

    // 最後に、ノードが追加された後、現在のノードリスト（this.nodes）を返します。
    return this.nodes;
  }

  //ノードを追加する
  addNode(node_id, node_label, node_x, node_y) {
    let node_color = '#fffacd';
    let node_shape = 'box';
    const newNode = {
      id: node_id,
      label: node_label,
      color: node_color,
      shape: node_shape,
      x: node_x,
      y: node_y,
    };
    this.nodes.add(newNode);
    console.log(node_x);
    defaultRecordLogicNetwork.record_LogicNode(node_id, node_label, node_x, node_y);
    return this.nodes;
  }

  addNewNode() {
    this.addNode(this.generateUniqueNumberText(), "newNode", this.latest_selected_node_info.x, this.latest_selected_node_info.y);
    console.log("addGoalできた");
}


  //ノードのラベル編集(完了)
  editNode(node_id, node_content) {
    //ノードのラベルの編集
    const node = this.nodes.get(node_id);
    if (node) { // IDに相当するノードがある場合の中身を編集
      let result_label = '';
      for (let i = 0; i < node_content.length; i += 10) {
        result_label += node_content.substr(i, 10) + '\n';
      }
      result_label = result_label.trim(); // 末尾の不要な改行を除去
      node.label = result_label;
      // 編集を反映
      this.nodes.update(node);
    }
  }

    //ダブルクリックでラベル編集
  doubleclick (params) {
    console.log('Double-click event triggered:', params); // デバッグ用
    params.event.preventDefault();
    const clickedNodeId = params.nodes[0];
    if (clickedNodeId !== undefined) {
      // ユーザーに新しいラベルを尋ね、それをノードの中身に設定
      const newLabel = prompt('新しいラベルを入力してください:', this.nodes.get(clickedNodeId).label.split('\n').join(''));
      // 編集したラベルを反映
      if (newLabel !== null) {
        this.editNode(clickedNodeId, newLabel);
      }
    }
  }

  //ノードを削除する
  deleteNode (){
    const selectNodeId = this.ownNetwork.getSelection().nodes[0];
    if(selectNodeId !== undefined){
        this.edges.remove(this.ownNetwork.getConnectedEdges(selectNodeId));
        this.nodes.remove({id: selectNodeId});
    }
    defaultRecordLogicNetwork.delete_LogicNode(selectNodeId);
    defaultRecordLogicNetwork.delete_LogicEdge(selectNodeId, "");
    defaultRecordLogicNetwork.delete_LogicEdge("", selectNodeId);
  }

  //エッジを追加する
  addEdge(E_start, E_end) {
    this.edges.add({ from: E_start, to: E_end });
    defaultRecordLogicNetwork.record_LogicEdge(E_start, E_end);
  }

  //ドラッグ開始
  dragstart(params) {
    if (!this.edgeEditMode) {
      params.event.preventDefault();
    } else {
      this.dragStartNodeId = this.ownNetwork.getNodeAt(params.pointer.DOM);
    }
  }

  //ドラッグ終了
  //edgeEditModeの場合にaddEdge
  dragend(params) {
    if (this.edgeEditMode) {
      this.dragEndNodeId = this.ownNetwork.getNodeAt(params.pointer.DOM);
      if (this.dragStartNodeId !== null && this.dragEndNodeId !== null && this.dragEndNodeId !== this.dragStartNodeId && this.dragEndNodeId !== undefined && this.nodes.get(this.dragStartNodeId).shape != "ellipse" && this.nodes.get(this.dragEndNodeId).shape != "ellipse") {
        let notable = true;
        const ConnectSelectNode = [];
        const connectedEdges = this.ownNetwork.getConnectedEdges(this.dragStartNodeId);
        connectedEdges.map((n) => {
          ConnectSelectNode.push(this.ownNetwork.getConnectedNodes(n).filter(n => n !== this.dragStartNodeId)[0]);
        });
        ConnectSelectNode.map((n) => {
          if (n === this.dragEndNodeId) {
            notable = false;
          }
        });
        if (!notable) {
          return;
        }
        this.edges.add({ from: this.dragStartNodeId, to: this.dragEndNodeId });
        defaultRecordLogicNetwork.record_LogicEdge(this.dragStartNodeId, this.dragEndNodeId);
      }
      this.dragStartNodeId = null;
      this.dragEndNodeId = null;
    } else {
      //移動したノードの情報を保存
      const movedNodeId = params.nodes[0];
      if (movedNodeId !== undefined) {
        const node = this.nodes.get(movedNodeId);
        if (!node) {
          console.error(`ノードID ${movedNodeId} に該当するノードが見つかりません。`);
          return;
        }
        this.nodes.update({
          id: movedNodeId,
          x: params.pointer.x,
          y: params.pointer.y,
        })
        const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
        this.latest_selected_node_info.x = (nodeBoundingBox.right + nodeBoundingBox.left) / 2;
        this.latest_selected_node_info.y = nodeBoundingBox.bottom + 10;
        try {
          defaultRecordLogicNetwork.update_LogicNodePosition(movedNodeId, this.latest_selected_node_info.x, this.latest_selected_node_info.y);
        } catch (error) {
          console.error("Error updating defaultRecordLogicNetwork:", error);
        }
      }
    }
  }

  deleteEdge() {
    const selectEdgeId = this.ownNetwork.getSelection().edges[0];
    const startid = this.edges.get(selectEdgeId).from;
    const endid = this.edges.get(selectEdgeId).to;
        if(selectEdgeId !== undefined){
            this.edges.remove({id: selectEdgeId});
        }
    defaultRecordLogicNetwork.delete_LogicEdge(startid, endid);
  }

  CheckSelectedNode(){
    let selected_node = null;
    if(_jm.get_selected_node() == false){
      selected_node = last_selected_node;
    }else{
      selected_node = _jm.get_selected_node();
    }
    return selected_node; // 選択中のノード情報を返す
  }

  maketriangle(topic) {
    // 三角形の中心座標とサイズを設定
    const centerX = 0; // 中心のX座標
    const centerY = 0; // 中心のY座標
    const size = 100; // 三角形の辺の長さ

    // 三角形の頂点の座標を計算
    const node1X = centerX;
    const node1Y = centerY - size / Math.sqrt(3); // 上の頂点
    const node2X = centerX - size / 2;
    const node2Y = centerY + size / (2 * Math.sqrt(3)); // 左下の頂点
    const node3X = centerX + size / 2;
    const node3Y = centerY + size / (2 * Math.sqrt(3)); // 右下の頂点

    // ノードを追加
    const node1Id = this.generateUniqueNumberText();
    const node2Id = this.generateUniqueNumberText();
    const node3Id = this.generateUniqueNumberText();

    this.addNode(node1Id, topic, node1X, node1Y);
    this.addNode(node2Id, "Node 2", node2X, node2Y);
    this.addNode(node3Id, "Node 3", node3X, node3Y);

    // データベースにノードを記録
    defaultRecordLogicNetwork.record_LogicNode(node1Id, "Node 1", node1X, node1Y);
    defaultRecordLogicNetwork.record_LogicNode(node2Id, "Node 2", node2X, node2Y);
    defaultRecordLogicNetwork.record_LogicNode(node3Id, "Node 3", node3X, node3Y);

    // エッジを追加して三角形を形成
    this.addEdge(node1Id, node2Id);
    this.addEdge(node2Id, node3Id);
    this.addEdge(node3Id, node1Id);

    defaultRecordLogicNetwork.record_LogicEdge(node1Id, node2Id);
    defaultRecordLogicNetwork.record_LogicEdge(node2Id, node3Id);
    defaultRecordLogicNetwork.record_LogicEdge(node3Id, node1Id);

    console.log("三角形を作成しました");
  }

  // Forestのノードを起点に三角ロジックを作成する
  Settriangle() {
    // マインドマップ側から選択ノード情報を取得
    let selected_fnode = CheckSelectedNode();
    if (!selected_fnode || !selected_fnode.topic) {
      alert("ノードを選択してください");
      return;
    }


    // maketriangleを呼び出し、中心座標を渡す
    this.maketriangle(selected_fnode.topic);
    console.log(selected_fnode.topic);
  }


  createTriangleFromSelectedNode() {
    // 選択されているノードを取得
    const selectedNodeId = this.ownNetwork.getSelection().nodes[0];
    if (!selectedNodeId) {
      console.error("ノードが選択されていません");
      alert("ノードを選択してください");
      return;
    }
  
    // 選択されたノードの情報を取得
    const baseNode = this.nodes.get(selectedNodeId);
    if (!baseNode) {
      console.error("選択されたノードが見つかりません");
      return;
    }
  
    // 基準ノードの座標
    const centerX = baseNode.x;
    const centerY = baseNode.y;
    const size = 100; // 三角形の辺の長さ
  
    // 三角形の他の2つの頂点の座標を計算
    const node2X = centerX - size / 2;
    const node2Y = centerY + size / (2 * Math.sqrt(3)); // 左下の頂点
    const node3X = centerX + size / 2;
    const node3Y = centerY + size / (2 * Math.sqrt(3)); // 右下の頂点
  
    // 新しいノードのIDを生成
    const node2Id = this.generateUniqueNumberText();
    const node3Id = this.generateUniqueNumberText();
  
    // 新しいノードを追加
    this.addNode(node2Id, "Node 2", node2X, node2Y);
    this.addNode(node3Id, "Node 3", node3X, node3Y);
  
    // エッジを追加して三角形を形成
    this.addEdge(selectedNodeId, node2Id);
    this.addEdge(node2Id, node3Id);
    this.addEdge(node3Id, selectedNodeId);
  
    // データベースに記録
    defaultRecordLogicNetwork.record_LogicNode(node2Id, "Node 2", node2X, node2Y);
    defaultRecordLogicNetwork.record_LogicNode(node3Id, "Node 3", node3X, node3Y);
    defaultRecordLogicNetwork.record_LogicEdge(selectedNodeId, node2Id);
    defaultRecordLogicNetwork.record_LogicEdge(node2Id, node3Id);
    defaultRecordLogicNetwork.record_LogicEdge(node3Id, selectedNodeId);
  
    console.log("三角形を作成しました");
  }

  

}

class RecordLogicNetwork{
  record_LogicNode (node_id, label, x, y){
    $.ajax({
      url: "php/logic_maneger.php",
      type: "POST",
      data: {
        node_id : node_id,
        label : label,
        x : x,
        y : y,
        purpose : 'record',
        record_thing : 'node'
      },
      dataType: "json",
      success: function(response) {
        console.log(response); // ← ここでレスポンス確認
        if (response.status === "success") {
          console.log("記録成功:", response.node_id);
        } else {
          console.error("エラー:", response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error("通信エラー:", error);
      }
    });
  }

  update_LogicNodePosition (movedNodeId, x, y){
    $.ajax({
      url: "php/logic_maneger.php",
      type: "POST",
      data: {
        movedNodeId : movedNodeId,
        x : x,
        y : y,
        purpose : 'update',
        update_thing : 'node'
      },
      dataType: "json",
      success: function(response) {
        console.log(response); // ← ここでレスポンス確認
        if (response.status === "success") {
          console.log("記録成功:", response.node_id);
        } else {
          console.error("エラー:", response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error("通信エラー:", error);
      }
    })
  }

  delete_LogicNode (node_id){
    $.ajax({
      url: "php/logic_maneger.php",
      type: "POST",
      data: {
        node_id : node_id,
        purpose : 'delete',
        delete_thing : 'node'
      },
      dataType: "json",
      success: function(response) {
        console.log(response); // ← ここでレスポンス確認
        if (response.status === "success") {
          console.log("記録成功:", response.node_id);
        } else {
          console.error("エラー:", response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error("通信エラー:", error);
      }
    })
  }

  record_LogicEdge (edge_start,  edge_end){
    $.ajax({
      url: "php/logic_maneger.php",
      type: "POST",
      data: {
        edge_start: edge_start,
        edge_end: edge_end,
        purpose: 'record',
        record_thing: 'edge'
      },
      dataType: "json",
      success: function(response) {
        console.log(response); // ← ここでレスポンス確認
        if (response.status === "success") {
          console.log("記録成功:", response.node_id);
        } else {
          console.error("エラー:", response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error("通信エラー:", error);
      }
    })
  }

  delete_LogicEdge (edge_start, edge_end){
    $.ajax({
      url: "php/logic_maneger.php",
      type: "POST",
      data: {
        edge_start: edge_start,
        edge_end: edge_end,
        purpose : 'delete',
        delete_thing : 'edge'
      },
      dataType: "json",
      success: function(response) {
        console.log(response); // ← ここでレスポンス確認
        if (response.status === "success") {
          console.log("記録成功:", response.node_id);
        } else {
          console.error("エラー:", response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error("通信エラー:", error);
      }
    })
  }
  

}

window.addEventListener('load', () => {
  defaultLogicNetwork = new LogicNetwork("mynetwork", "load");
  $('#mynetwork').css('visibility', 'visible');
  $(`#ln_addNode`).on("click", e => {
    defaultLogicNetwork.addNewNode();
  });
  $(`#ln_deleteNode`).on("click", e => {
    defaultLogicNetwork.deleteNode();
  });
  $(`#ln_startEditEdge`).on("click", e => {
    defaultLogicNetwork.SelectEditEdge();
  });
  $(`#ln_deleteEdge`).on("click", e => {
    defaultLogicNetwork.deleteEdge();
  });
  $(`ln_addjmNode`).on("click", e => {
    defaultLogicNetwork.jm_to_ls();
  });
  $(`#ln_maketriangle`).on("click", e => {
    defaultLogicNetwork.maketriangle();
  });
  $(`#ln_createtriangle`).on("click", e => {
    defaultLogicNetwork.createTriangleFromSelectedNode();
  });
});


// document.getElementById("logic_btn").addEventListener("click", () => {
//   document.getElementById("logic_area").style.display = "block";
//   defaultLogicNetwork = new LogicNetwork("mynetwork", "load");
//   $(`#ln_addNode`).on("click", e => {
//     defaultLogicNetwork.addNode();
//   });
//   $(`#ln_deleteNode`).on("click", e => {
//     defaultLogicNetwork.deleteNode();
//   });
//   $(`#ln_startEditEdge`).on("click", e => {
//     defaultLogicNetwork.SelectEditEdge();
//   });
//   $(`#ln_deleteEdge`).on("click", e => {
//     defaultLogicNetwork.deleteEdge();
//   });
// });
function addTagToNode(nodeId, tag) {
  const node = defaultLogicNetwork.nodes.get(nodeId);
  // 既存のタグ（[主張][事実][理由付け]）を除去してから新しいタグを付与
  const newLabel = node.label.replace(/\s*\[(主張|事実|理由付け)\]$/, '') + ' [' + tag + ']';
  defaultLogicNetwork.nodes.update({ id: nodeId, label: newLabel });
}

// タグボタン生成
['主張', '事実', '理由付け'].forEach(tag => {
  const btn = document.createElement('button');
  btn.textContent = tag;
  btn.onclick = () => {
    addTagToNode(nodeId, tag);
    tagMenu.remove();
  };
  tagMenu.appendChild(btn);
});