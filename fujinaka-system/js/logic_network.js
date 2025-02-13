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
  }

  //エッジを追加する
  addEdge(E_start, E_end) {
    this.edges.add({ from: E_start, to: E_end });
    defaultRecordLogicNetwork.record_Edge(E_start, E_end);
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
        // defaultRecordForestMRN.record_Edge(this.dragStartNodeId, this.dragEndNodeId);
      }
      this.dragStartNodeId = null;
      this.dragEndNodeId = null;
    }
  }

  deleteEdge() {
    const selectEdgeId = this.ownNetwork.getSelection().edges[0];
        if(selectEdgeId !== undefined){
            this.edges.remove({id: selectEdgeId});
        }
  }

}

class RecordLogicNetwork{
  record_LogicNode (id, label, x, y){
    $.ajax({
      url: "php/logicrecord.php",
      type: "POST",
      data: {
        node_id : id,
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