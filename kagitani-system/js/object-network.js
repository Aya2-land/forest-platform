let defaultForestMRN;
let defaultRecordForestMRN;
let defaultShowForestMRN;
let autoRecordFlag = false; // 自動記録フラグ
let globalParams = null; //クリックされたネットワークノード

//Record_activitiesのためにユニークな値を作り出す．
function generateUniqueID() {
    return crypto.randomUUID();
}

class ForestMRN { // forestMRN: forest Meeting Reflection Network
    constructor(container, load) {
        // this.ownNetwork = this.generateMeetingReflectionNetworkCanvas(container, {}, {}); // デフォルトのマップを表示
        defaultRecordForestMRN = new RecordForestMRN();
        this.nodes = new vis.DataSet();
        this.edges = new vis.DataSet();
        this.options = {
	        layout: {
                // hierarchical: {
                //   direction: 'UD',  // 上から下
                //   sortMethod: 'hubsize',  // スケールフリーネットワークに適用
                // },
              },
              edges: {
                arrows: 'to',
                smooth: { type: 'continuous' },
              },
              physics: {
                enabled: false,  // 物理エンジンを無効にして固定レイアウト
              },
            };
            
        this.nodeConnectEnabled = false; // マインドマップとの対応づけを可能にする（マインドマップのノードクリックが，議論内省マップノードとの対応を付与するのかそうでないのかを判定するよう）
        this.latest_selected_node_info = {
            x: 0,
            y: 35
        }; // 最後にクリックされたノードの情報
        this.output_input = {}; //オントロジーの入力と出力の対応付け
        this.output_list = [];  //概念として出すもの
        this.dragStartNodeId = null;  //ドラッグスタートしたノードのID
        this.dragEndNodeId = null; //ドラッグエンドしたノードID
        this.edgeEditMode = false; // リンクを編集できるかどうかのモード（Falseは編集不可）
        this.EdgeStartId = []; //エッジの開始ID
        this.EdgeEndId = []; //エッジの終了ID
        this.OntologyNodeId = []; //オントロジーノードのノードID
        this.OntologyConnectNodeId = []; //オントロジーノードと対応づいているノードID
        this.ConnectNetworkNodeId = [];
        this.ConnectMindMapNodeId = [];
        this.RecruitNodeId = [];//採用or棄却されたノードID
        this.Recruit = [];//採用or棄却
        this.Feedback = [];//フィードバック書いたかどうか
        this.FeedbackNodeId = null; //フィードバック書かれるノードID
        this.selectId = null;//選択されたノードID
        this.interval = null; //インターバル抜けるための変数
        this.material_id = null;
        this.concept_id = null;
        this.scale = 1;
        this.BoxDisplay = {
            x: 0,
            y: 0
        }//右クリックされやメニューの表示場所
        this.ownNetwork = this.generateMeetingReflectionNetworkCanvas(container, this.nodes, this.edges); // デフォルトのマップを表示
        if(load == "load"){
            this.jmindex = [];
            this.addEventLister();
            // $(`#jsmind_container`).on('click',this.connect_mindmap.bind(this));
            // $(`#net_conmenu2`).on('click',this.connect_network.bind(this));
            $(`#net_conmenu3`).on('click',this.SelectTag.bind(this));
            // $(`#net_conmenu4`).on('click',this.ContentmenuCancel.bind(this));
            // $(`#ontology_select`).on('click',this.addontology.bind(this));
            $(`#recruit_select`).on('click',this.assignTagsToNode.bind(this));
            this.ownNetwork.on('click', this.networkClick.bind(this));
            this.ownNetwork.on('dragStart', this.dragstart.bind(this));
            this.ownNetwork.on('dragEnd', this.dragend.bind(this));
            this.ownNetwork.on('doubleClick', this.doubleclick.bind(this));
            this.ownNetwork.on("oncontext", this.onContext.bind(this));
            this.ownNetwork.on('select', this.selectdelete.bind(this));
        }else if(load == 'pastmap'){
            this.jmindex2 = [];
            this.jmindex3 = [];
            this.ownNetwork.on('click', this.shownetworkClick.bind(this));
        }
    }


    // //オントロジーノードを選択不可に
    selectdelete(params) {
        if (this.nodes.get(params.nodes[0]).shape == "ellipse") {
            // 選択を解除
            this.ownNetwork.setSelection({ nodes: [] });
        }
    }

    addEventLister() {
        this.bindconnect_mindmap = this.connect_mindmap.bind(this);
        this.bindstep_start = this.step_start.bind(this); //kagitani
        this.bindstep_break = this.step_break.bind(this); //kagitani
        this.bindstep_end = this.step_end.bind(this); //kagitani
        this.bindshow_select = this.show_select.bind(this);
        this.bindconnect_network = this.connect_network.bind(this);
        this.bindSelectTag = this.SelectTag.bind(this);
        this.bindContentmenuCancel = this.ContentmenuCancel.bind(this);
        this.bindaddontology = this.addontology.bind(this);
        this.bindassignTagsToNode = this.assignTagsToNode.bind(this);
        this.bindfeedback = this.feedback.bind(this);
        this.bindNodeblinking = this.Nodeblinking.bind(this);
    
        // 既存のクリックイベント
        $(`#jsmind_container`).on('click', this.bindconnect_mindmap);
        $(`#net_conmenu00`).on('click', this.bindstep_start);
        $(`#net_conmenu01`).on('click', this.bindstep_break);
        $(`#net_conmenu02`).on('click', this.bindstep_end);
        $(`#net_conmenu1`).on('click', this.bindshow_select);
        $(`#net_conmenu2`).on('click', this.bindconnect_network);
        $(`#net_conmenu3`).on('click', this.bindSelectTag);
        $(`#net_conmenu4`).on('click', this.bindContentmenuCancel);
        $(`#ontology_select`).on('click', this.bindaddontology);
        $(`#recruit_select`).on('click', this.bindassignTagsToNode);
        $(`#feedbackrecord`).on('click', this.bindfeedback);
    }
    
    
    removeEventLister(){
        $(`#jsmind_container`).off('click',this.bindconnect_mindmap);
        $(`#net_conmenu00`).off('click',this.bindstep_start);
        $(`#net_conmenu01`).off('click',this.bindstep_break);
        $(`#net_conmenu02`).off('click',this.bindstep_end);
        $(`#net_conmenu1`).off('click',this.bindshow_select);
        $(`#net_conmenu2`).off('click',this.bindconnect_network);
        $(`#net_conmenu3`).off('click',this.bindSelectTag);
        $(`#net_conmenu4`).off('click',this.bindContentmenuCancel);
        $(`#ontology_select`).off('click',this.bindaddontology);
        $(`#recruit_select`).off('click',this.bindassignTagsToNode);
        $(`#feedbackrecord`).off('click',this.bindfeedback);
        clearInterval(this.interval);
    }
    /*
     * マップ編集ユーティリティ
     */
    generateUniqueNumberText() {
        return `${new Date().getTime()}${Math.floor(1000000 * Math.random())}`;
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
        console.log("切り替え - 現在のエッジ編集モード:", this.edgeEditMode);
        this.edgeEditMode = !this.edgeEditMode;
        console.log("エッジ編集モード切り替え後:", this.edgeEditMode);
        if(this.edgeEditMode){
            this.enableEditEdge();
        } else {
            this.disableEditEdge();
        }
    }

    enableEditEdge() {
        console.log("ノード固定状態の更新前:", this.nodes);
        //document.getElementById("mrnb_startEditEdge").value="エッジ追加終了";
        this.nodes.update(this.nodes.map(n => {
            return { ...n, fixed: true };
        }));
        console.log("ノード固定状態の更新後:", this.nodes);
    }
    
    disableEditEdge() {
        console.log("ノード固定状態の更新前:", this.nodes);
        //document.getElementById("mrnb_startEditEdge").value="エッジ追加";
        this.edgeEditMode = false;
        this.nodes.update(this.nodes.map(n => {
            return n.type !== "topic-tag" ? { ...n, fixed: false } : { ...n, fixed: true };
        }));
        console.log("ノード固定状態の更新後:", this.nodes);
    }

    /*
     * 議論内省マップの表示・操作部分（Extend vis.js）
     */
    generateMeetingReflectionNetworkCanvas (canvas_dom_id, nodes, edges) {
        // マップを表示

        // this.setNodes(nodes);
        // this.setEdges(edges);

        return new vis.Network(
            document.getElementById(canvas_dom_id),
            {
                nodes: nodes,
                edges: edges,
            },
            this.options
        );
    }

    /*
     * ノードの操作
     */

    //目標追加
    addGoal(node_id, node_label, node_type, node_x, node_y) {
        let node_color = 'red'; // ノードの背景色
        let node_shape = 'box';     // ノードの形状
        let text_color = 'white';   // ノード内文字列の色
        let position_fixed = false;   // ノードを動かせるかどうか（Falseなら動かせる）
        let result_label = '';
        for (let i = 0; i < node_label.length; i += 10) {
            result_label += node_label.substr(i, 10) + '\n';
        }
        result_label = result_label.trim(); // 末尾の不要な改行を除去

        const newNode = {
            id: `${node_type}_${node_id}`, 
            label: result_label,
            title: '出現',  // ここで「出現」を設定
            group: node_type,
            color: node_color, shape: node_shape,
            font: { color: text_color },
            fixed: position_fixed,
            x: node_x, y: node_y, 
            status:null
        };
        
        this.nodes.add(newNode);
        const boundingBox = this.ownNetwork.getBoundingBox(`${node_type}_${node_id}`);
        if(node_type !==  "topic-tag"){
            node_y += Math.floor(((boundingBox.bottom)-(boundingBox.top))/2);
        }
        this.nodes.update({
            id : `${node_type}_${node_id}`,
            color: node_color, shape: node_shape,
            font: { color: text_color },
            y : node_y
        });
        const boundingBoxupdate = this.ownNetwork.getBoundingBox(`${node_type}_${node_id}`);
        this.latest_selected_node_info.x = node_x;
        this.latest_selected_node_info.y = boundingBoxupdate.bottom+10;
        defaultRecordForestMRN.record_GoalNode(`${node_type}_${node_id}`, node_label, node_type, node_x, node_y);
        Record_activities(`${node_type}_${node_id}`, null, "add", node_label, null, "goal", generateUniqueID(),object_map_id);
        // console.log("check");
        return this.nodes;
    }

    //kagitani--手段追加
    addStep(node_id, node_label, node_type, node_x, node_y) {
        const fromNodeId = globalParams.nodes[0] || globalParams.nodes;
        const fromNode = this.nodes.get(fromNodeId); // globalParams.nodes から元のノードを取得
        console.log("ここ確認するお",fromNode);

        let node_color = 'green'; // ノードの背景色
        let node_shape = 'box';     // ノードの形状
        let text_color = 'white';   // ノード内文字列の色
        let position_fixed = false; // ノードを動かせるかどうか（Falseなら動かせる）
        let result_label = '';
        for (let i = 0; i < node_label.length; i += 10) {
            result_label += node_label.substr(i, 10) + '\n';
        }
        result_label = result_label.trim(); // 末尾の不要な改行を除去
        const newNode = {
            id: `${node_type}_${node_id}`, label: result_label,
            group: node_type,
            title: '出現',  // ここで「出現」を設定
            color: node_color, shape: node_shape,
            font: { color: text_color },
            fixed: position_fixed,
            x: node_x, y: node_y = fromNode.y, 
            status:null
        };
        this.nodes.add(newNode);

        const boundingBoxupdate = this.ownNetwork.getBoundingBox(`${node_type}_${node_id}`);
        this.latest_selected_node_info.x = node_x;
        this.latest_selected_node_info.y = boundingBoxupdate.bottom + 10;
    
        console.log(`${node_type}_${node_id}`, node_label, node_type, node_x, node_y);
        defaultRecordForestMRN.record_StepNode(`${node_type}_${node_id}`, node_label, node_type, node_x, node_y);
        Record_activities(`${node_type}_${node_id}`, null, "add", node_label, null, "step",generateUniqueID(),object_map_id);
        console.log("クリックされたノードの確認です:", globalParams);
    
        // ノード追加後に、エッジを自動で追加
        if (globalParams && globalParams.nodes) {
            console.log("globalParams と globalParams.nodes が存在しています。");
    
            // エッジ編集モードに切り替え
            this.SelectEditEdge();
            console.log("エッジ編集モードに切り替えました。");
    
            // エッジを追加
            const fromNodeId = globalParams.nodes[0] || globalParams.nodes;
            console.log("エッジ追加:", { from: fromNodeId, to: `${node_type}_${node_id}` });
            
            this.edges.add({ from: fromNodeId, to: `${node_type}_${node_id}` });
            
            // エッジが正しく追加されたか確認
            console.log("エッジが追加されました。現在のエッジ:", this.edges.get());
            
            // エッジの記録を行う
            defaultRecordForestMRN.record_Edge(fromNodeId, `${node_type}_${node_id}`);
            console.log("エッジが記録されました。");
    
            // 編集モードを解除
            this.SelectEditEdge();
            console.log("エッジ編集モードが解除されました。");

            //ここに，globalParams.nodesの枠が赤くなる処理を行う．
            // ここに，globalParams.nodesの枠が赤くなる処理を行う．
            try {
                globalParams.nodes.forEach(nodeId => {
                    console.log("枠を赤くするノード:", nodeId);
                    
                    // ノードを更新して枠を赤くする
                    // this.nodes.update({
                    //     id: nodeId,
                    //     color: { border: 'red' }, // 枠線の色を赤に変更
                    //     borderWidth: 4 // 枠線の太さを設定
                    // });

                    console.log(`ノード ${nodeId} の枠が赤く変更されました。`);
                });
            } catch (error) {
                console.error("枠の色変更中にエラーが発生しました:", error);
            }
                }
    
        return this.nodes;
    }
    

    addReloadNode(node_id, node_label, node_type, node_x, node_y, done) {
        console.log("status:", done);
    
        let node_color = 'skyblue'; // ノードの背景色
        let node_shape = 'box';     // ノードの形状
        let text_color = 'black';   // ノード内文字列の色
        let position_fixed = false;   // ノードを動かせるかどうか（Falseなら動かせる）
    
        switch(node_type) {
            case "goal": // 目標ノード
                node_color = 'red';
                text_color = 'white';
                break;
            case "step": // 手段ノード
                node_color = 'green';
                text_color = 'white';
                break;
            default: // その他
                break;
        }
    
        switch(done) {
            case "inProgress":
                node_color = 'orange';
                break;
            case "done": // 手段完了
                node_color = 'gray';
                text_color = 'white';
                break;
            case "break": // 手段完了
                node_color = 'LightCoral';
                break;
            case "end": // 手段完了
                node_color = 'gray';
                break;
            case null: //手段進行中
                break;
            default: // その他
                break;
        }
    
        let result_label = '';
        for (let i = 0; i < node_label.length; i += 10) {
            result_label += node_label.substr(i, 10) + '\n';
        }
        result_label = result_label.trim(); // 末尾の不要な改行を除去
    
        // 実際にネットワークに追加するノードのデータを作成
        const newNode = {
            id: `${node_id}`, label: result_label,
            title: '',  // ここで「出現」を設定
            group: node_type,
            color: node_color, shape: node_shape,
            font: { color: text_color },
            fixed: position_fixed,
            x: node_x, y: node_y, 
            status: done,
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
    
        // ノードの色が灰色の場合、右クリックとダブルクリックを無効化
        if (node_color === 'gray') {
            this.disableNodeRightClickAndDoubleClick(node_id);
        }
    
        // 最後に、ノードが追加された後、現在のノードリスト（this.nodes）を返します。
        return this.nodes;
    }
    
    // 右クリックとダブルクリックを無効化する関数
    disableNodeRightClickAndDoubleClick(nodeId) {
        const nodeElement = document.getElementById(`node-${nodeId}`);
        if (!nodeElement) {
            console.error("ノードが見つかりません: ", nodeId);
            return;
        }
    
        // 右クリックイベントの無効化
        nodeElement.addEventListener('contextmenu', (event) => {
            event.preventDefault();  // 右クリックのデフォルト動作（コンテキストメニュー）を無効化
            console.log(`右クリック無効化: ノードID: ${nodeId}`);
        });
    
        // ダブルクリックイベントの無効化
        nodeElement.addEventListener('dblclick', (event) => {
            event.preventDefault();  // ダブルクリックのデフォルト動作（ノードの編集など）を無効化
            console.log(`ダブルクリック無効化: ノードID: ${nodeId}`);
        });
    }
    

    //操作できないノードを作る（過去のマインドマップのため）
    addShowNode(node_id, node_label, node_type, node_x, node_y) {
        let node_color = 'skyblue'; // ノードの背景色
        let node_shape = 'box';     // ノードの形状
        let text_color = 'black';   // ノード内文字列の色
        switch(node_type) {
            case "material-content": // 議論資料に書かれた内容に関するノードの場合
                break;
            case "self-summary": // 自分で考えた要約に関するノードの場合
                node_color = 'green';
                text_color = 'white';
                break;
            case "utterance": // 議論内での発言ノードの場合
                node_color = 'pink';
                break;
            case "topic-tag": // 議論内省マップのノードがどんなトピックに対応しているかを表すタグノードの場合
                node_color = 'blue';
                node_shape = 'ellipse';
                text_color = 'white';
                break;
            default: // その他
                break;
        }
        const newNode = {
            id: `${node_id}`, label: node_label,
            group: node_type,
            title: '出現',  // ここで「出現」を設定
            color: node_color, shape: node_shape,
            font: { color: text_color },
            fixed: true,
            x: node_x, y: node_y, 
            status:null
        };
        this.nodes.add(newNode);
        return this.nodes;
    }

    //そうか，これはリロードした時に呼び起こすやつだ．じゃあ関係ないな．
    addReloadEdge(object_edges_id, edge_start, edge_end) {
        // console.log("object_edges_id:", object_edges_id); // object_edges_idの確認
        // console.log("addReloadEdge called with edge_start:", edge_start, "and edge_end:", edge_end);
        
        // this.edges が Set または Map のインスタンスであることを確認
        if (this.edges instanceof Set) {
            // console.log("this.edges is a Set");
        } else {
            // console.log("this.edges is not a Set, it is:", this.edges);
        }
    
        try {
            // this.edges.add({ object_edge_id: object_edges_id, from: edge_start, to: edge_end });
        } catch (error) {
            // console.error("Error in addReloadEdge:", error);
        }

        this.edges.add({from: edge_start, to: edge_end});
    }
    

    //kagitani
    addNewGoal() {
        this.addGoal(this.generateUniqueNumberText(), "newNode", "goal", this.latest_selected_node_info.x, this.latest_selected_node_info.y);
        console.log("addGoalできた");
    }

    addNewStep() {
        this.addStep(this.generateUniqueNumberText(), "newNode", "step", this.latest_selected_node_info.x, this.latest_selected_node_info.y);
        console.log("addStepできた");
    }
    //kagitani

    addmaterialNode(node_id, node_label){
        this.addNode(node_id, node_label, "material-content", this.latest_selected_node_info.x, this.latest_selected_node_info.y);
        console.log(this.latest_selected_node_info.x,this.latest_selected_node_info.y)
    }

    addutteranceNode(utterance){
        this.addNode(this.generateUniqueNumberText(), utterance, "utterance", this.latest_selected_node_info.x, this.latest_selected_node_info.y);
    }

    //kagitani--ーラベル編集
    editGoal(node_id, node_content) {
        const node = this.nodes.get(node_id);
        if (node) {
            let result_label = '';
            for (let i = 0; i < node_content.length; i += 10) {
                result_label += node_content.substr(i, 10) + '\n';
            }
            result_label = result_label.trim();
            node.label = result_label;
            this.nodes.update(node);
            defaultRecordForestMRN.update_Goal("label", node_id, node_content, "");
   
            console.log("Node Data:", node); // ノードの詳細データをログ出力

            switch (node.group) { // nullチェック付き
                case "goal": // 自分で考えた要約に関するノードの場合
                    console.log("ゴールを保存！！！！！！！！！！！！");
                    Record_activities(node_id, null, "edit", node_content, null, "goal", generateUniqueID(),object_map_id);
                    break;
                case "step": // 議論内での発言ノードの場合
                    console.log("手段を保存！！！！！！！！！！！！");
                    Record_activities(node_id, null, "edit", node_content, null, "step", generateUniqueID(),object_map_id);
                    break; 
                default:
                    console.log("何でやねん");
                    break;
            }
            // デバッグ: Record_activities の呼び出し確認
            console.log("Record_activities invoked for Node ID:", node_id,object_map_id);
        } 
    }
    
    //kagitani--ダブルクリック時編集
    doubleclick (params) {
        const clickedNodeId = params.nodes[0];
        if (clickedNodeId !== undefined) {
            // ユーザーに新しいラベルを尋ね、それをノードの中身に設定
            const newLabel = prompt('新しいラベルを入力してください:', this.nodes.get(clickedNodeId).label.split('\n').join(''));
            // 編集したラベルを反映
            if (newLabel !== null) {
                this.editGoal(clickedNodeId, newLabel);
            }
            
        }
    }

    // kagitani--目標ノード削除
    deleteGoal (){
        //ユーザーが選択したノードのIDを取得しています。selectNodeIdがundefinedでなければ、削除処理を開始します。
        const selectNodeId = this.ownNetwork.getSelection().nodes[0];

        if(selectNodeId !== undefined){
            //選択ノードに接続されているすべてのエッジを削除し、さらにそのノード自体も削除しています。
            this.edges.remove(this.ownNetwork.getConnectedEdges(selectNodeId));
            this.nodes.remove({id: selectNodeId});
            console.log(selectNodeId) //ここが正しく表示されている

            //データベースから選択ノードと、それに関連するエッジを削除しています。
            //delete_db_Nodeは指定ノードを削除し、delete_db_Edgeは指定ノードが含まれるエッジを削除します。
            defaultRecordForestMRN.delete_db_Node(selectNodeId);
            defaultRecordForestMRN.delete_db_Edge(selectNodeId, "");
            defaultRecordForestMRN.delete_db_Edge("", selectNodeId);
        }

        switch (node?.group) { // nullチェック付き
            case "goal": // 自分で考えた要約に関するノードの場合
                console.log("ゴールを保存！！！！！！！！！！！！");
                Record_activities(node_id, null, "delete", node_content, null, "goal", generateUniqueID());
                break;
            case "step": // 議論内での発言ノードの場合
                console.log("手段を保存！！！！！！！！！！！！");
                Record_activities(node_id, null, "delete", node_content, null, "step", generateUniqueID());
                break;       
        }
    }

    // 右クリック時
    onContext(params) {
        globalParams  =  params;
        this.nodeConnectEnabled = false;
        if (params.nodes.length == 1) {
            const NetworkMenu = document.getElementById('network_conmenu');
            this.selectId = params.nodes[0];
            const pointerX = params.pointer.DOM.x;
            const pointerY = params.pointer.DOM.y;
            //const mynetPosition = document.getElementById("mynetwork2").getBoundingClientRect();
            const mynetPosition = document.getElementById("myobject").getBoundingClientRect();
            this.BoxDisplay.x = pointerX + mynetPosition.left + 20;
            this.BoxDisplay.y = pointerY + mynetPosition.top + 20;
            NetworkMenu.style.left = this.BoxDisplay.x;
            NetworkMenu.style.top = this.BoxDisplay.y;
            NetworkMenu.style.display = "block";//ここようわからん未完成かも
            if(this.OntologyConnectNodeId.indexOf(this.selectId) !== -1){
                document.getElementById("net_conmenu3").style.display = "block";
            }
        }
    }

    //ラベルの選択（完了）
    show_select (){
        console.log(this.OntologyConnectNodeId.indexOf(this.selectId))
        document.getElementById('network_conmenu').style.display = "none";
        if(this.OntologyConnectNodeId.indexOf(this.selectId) !== -1){
            alert('このノードにはすでに概念がつけられているため概念付けできません');
            return;
        }
        const labelselect = document.getElementById("labelselect");
        labelselect.style.display = "block";
        labelselect.style.left = this.BoxDisplay.x;
        labelselect.style.top = this.BoxDisplay.y;
    }

    //手段開始ボタン
    step_start() {
        document.getElementById('network_conmenu').style.display = "none";
        console.log(`ノード ${this.selectId} の作業開始だよ！！`);  // コンソールにメッセージ表示
        defaultRecordForestMRN.update_NodeStatus("inProgress", this.selectId, "", "");
    
        const fromNodeId = globalParams.nodes[0] || globalParams.nodes;
        const fromNode = this.nodes.get(fromNodeId); // globalParams.nodes から元のノードを取得
        console.log("ここ確認する！！！！！！！", fromNode);
        
        Record_activities(this.selectId, null, "start", fromNode.label, null, "step", generateUniqueID(),object_map_id);
    
        // ノードを更新
        this.nodes.update({
            id: this.selectId,
            color: 'orange',
            title: "作業中",
            size: 50,  // ノードのサイズを大きく変更
            physics: { enabled: false },  // 物理エンジンを無効にする
            borderWidth: 3,
            borderWidthSelected: 5,
            shapeProperties: {
                borderDashes: [10, 5] // 点滅線を使用
            }
        });
    
        // ノードの更新状態を確認
        const updatedNode = this.nodes.get(this.selectId);
        console.log('更新後のノード:', updatedNode);
    
        // DBに保存する
        autoRecordFlag = true;
    
        // カスタムイベントを発火
        const event = new CustomEvent("stepStartEvent", {
            detail: {
                object_node_id: this.selectId,
                autoRecordFlag: autoRecordFlag,
            },
        });
        window.dispatchEvent(event); // グローバルイベントとして発火
    
        // 「fromNode.label 実行中．．．」を画面に表示
        const statusMessage = `${fromNode.label} 実行中．．．`;
    
        // メッセージを表示するためのdivを作成
        const messageDiv = document.createElement('div');
        messageDiv.id = 'statusMessage';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';  // 画面上部から少し下
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.backgroundColor = '#f8d7da';  // 背景色（赤みの強い色）
        messageDiv.style.color = '#721c24';  // 文字色
        messageDiv.style.padding = '5px 15px';
        messageDiv.style.fontSize = '12px';  // 文字サイズを小さく
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.border = '2px solid #f5c6cb';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '9999';  // 他の要素より前面に表示
        messageDiv.style.display = 'flex';  // 横並びに設定
        messageDiv.style.alignItems = 'center';  // 中央に整列
        messageDiv.style.justifyContent = 'center';  // 中央に整列
    
        // メッセージ内容を設定
        messageDiv.innerText = statusMessage;
    
        // ボディに追加
        document.body.appendChild(messageDiv);
    
        // 一定時間後にメッセージを非表示にする（例えば5秒後）
        setTimeout(() => {
            document.getElementById('statusMessage').remove();
        }, 5000);
    }
    
    
    //手段中断ボタン
    step_break (){
        document.getElementById('network_conmenu').style.display = "none";
        console.log(`ノード ${this.selectId} の作業中断だよ！！`);  // コンソールにメッセージ表示
        defaultRecordForestMRN.update_NodeStatus("break", this.selectId, "", "");
        
        const fromNodeId = globalParams.nodes[0] || globalParams.nodes;
        const fromNode = this.nodes.get(fromNodeId); 

        // ノードを更新
        this.nodes.update({
            id: this.selectId,
            color: 'LightCoral',
            title: "作業中断",
            size: 50,  // ノードのサイズを大きく変更
            
        });

        //DBに保存するのをやめる．
        autoRecordFlag = false;
        // カスタムイベントを発火
        const breakEvent = new CustomEvent("stepBreakEvent", {
            detail: {
                object_node_id: this.selectId,
                autoRecordFlag: autoRecordFlag,
            },
        });

        window.dispatchEvent(breakEvent); // グローバルイベントとして発火

        Record_activities(this.selectId, null, "break",fromNode.label, null, "step", generateUniqueID(),object_map_id);
    }

   // 手段完了ボタン
step_end() {
    document.getElementById('network_conmenu').style.display = "none";
    console.log(`step_end() を呼び出しました。選択中のノードID: ${this.selectId}`); // デバッグ用ログ

    // ステータス更新
    defaultRecordForestMRN.update_NodeStatus("end", this.selectId, "", "");

    const fromNodeId = globalParams.nodes[0] || globalParams.nodes;
    const fromNode = this.nodes.get(fromNodeId);
    console.log(fromNode);
    console.log(`step_end() 呼び出し: fromNodeId: ${fromNodeId}`, fromNode);

    Record_activities(this.selectId, null, "end", fromNode.label, null, "step", generateUniqueID(), object_map_id);
    
    // 右クリックとダブルクリックイベントを無効化
    this.disableNodeRightClickAndDoubleClick(this.selectId);

    // フィードバック吹き出しを表示
    this.showFeedbackTooltip();
}

// 右クリックとダブルクリックを無効化する関数
disableNodeRightClickAndDoubleClick(nodeId) {
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (!nodeElement) {
        console.error("ノードが見つかりません: ", nodeId);
        return;
    }

    // 右クリックイベントの無効化
    nodeElement.addEventListener('contextmenu', (event) => {
        event.preventDefault();  // 右クリックのデフォルト動作（コンテキストメニュー）を無効化
        console.log(`右クリック無効化: ノードID: ${nodeId}`);
    });

    // ダブルクリックイベントの無効化
    nodeElement.addEventListener('dblclick', (event) => {
        event.preventDefault();  // ダブルクリックのデフォルト動作（ノードの編集など）を無効化
        console.log(`ダブルクリック無効化: ノードID: ${nodeId}`);
    });
}

    
showFeedbackTooltip() {
    const tooltip = document.getElementById("tooltip");
    if (!tooltip) {
        console.error("吹き出しの要素が見つかりませんでした。");
        return;
    }

    // ノードの位置を取得
    const positions = this.ownNetwork.getPositions(this.selectId);
    if (!positions || !positions[this.selectId]) {
        console.error("選択されたノードの位置情報が取得できませんでした。");
        return;
    }
    const nodePosition = positions[this.selectId];
    const canvasPosition = this.ownNetwork.canvasToDOM({
        x: nodePosition.x,
        y: nodePosition.y
    });

    // 吹き出しの内容を設定
    tooltip.style.left = `${canvasPosition.x}px`;
    tooltip.style.top = `${canvasPosition.y + 20}px`; // ノードの下に表示
    tooltip.style.width = "400px"; // ツールチップの横幅を設定（必要に応じて調整）
    tooltip.style.minWidth = "300px"; // 最小幅を設定（小さすぎないように）
    tooltip.innerHTML = `
        <div id="tooltipHeader" style="cursor: move; background: #ccc; padding: 5px;">
            <strong>【行動記録入力】</strong>
        </div>
        <div style="padding: 10px;">
            <form id="feedbackForm">
                <label for="actionReason">行動意図：なぜこの手段を実行しましたか？</label><br>
                <textarea id="actionReason" name="actionReason" rows="3" placeholder="例：実験対象者を選定するための参考基準を得るため．" style="width: 100%;"></textarea><br><br>

                <label for="completionReason">完了基準：なぜ完了と判断しましたか？</label><br>
                <textarea id="completionReason" name="completionReason" rows="3" placeholder="例：必要な研究事例（5つ）を確認し，比較表を作成できたから．" style="width: 100%;"></textarea><br><br>

                <label for="challengesAndLearnings">経験の活用：困難や学びはありますか？</label><br>
                <textarea id="challengesAndLearnings" name="challengesAndLearnings" rows="4" placeholder="例：他の研究事例を調べる過程で混乱が生じた．関連論文を追加調査し共通点を抽出した．" style="width: 100%;"></textarea><br><br>

                <button type="button" id="saveFeedback">保存</button>
            </form>
        </div>
    `;
    tooltip.style.display = "block";

    // 保存ボタンのイベントリスナーを設定
    this.setupTooltipSaveButton(tooltip);
    this.setupTooltipDrag(tooltip);
}


setupTooltipSaveButton(tooltip) {
    const saveButton = document.getElementById("saveFeedback");
    saveButton.addEventListener("click", () => {
        const actionReason = document.getElementById("actionReason").value.trim();
        const completionReason = document.getElementById("completionReason").value.trim();
        const challengesAndLearnings = document.getElementById("challengesAndLearnings").value.trim();

        // サーバーにデータを送信
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {
                action_reason: actionReason,
                completion_reason: completionReason,
                challenges_learnings: challengesAndLearnings,
                object_node_id: this.selectId,
                purpose: 'record',
                record_thing: 'feedback'
            },
            success: (response) => {
                console.log("サーバーの応答:", response);

                // ノードの title を更新（入力内容を簡略化して表示）
                const title = `
                    行動意図: ${actionReason || "未記入"}\n
                    完了基準: ${completionReason || "未記入"}\n
                    学び: ${challengesAndLearnings || "未記入"}
                `;
                this.nodes.update({
                    id: this.selectId,
                    color: 'gray',
                    title: title
                });

                console.log(`ノード ${this.selectId} のタイトルを更新しました。`);
                tooltip.style.display = "none"; // 保存後に吹き出しを閉じる
            },
            error: (error) => {
                console.error("記録保存中にエラーが発生しました:", error);
                alert("記録の保存に失敗しました。");
            }
        });
    });
}

    
    setupTooltipDrag(tooltip) {
        const header = document.getElementById("tooltipHeader");
        let offsetX = 0, offsetY = 0, isDragging = false;
    
        header.addEventListener("mousedown", (event) => {
            isDragging = true;
            offsetX = event.clientX - tooltip.offsetLeft;
            offsetY = event.clientY - tooltip.offsetTop;
            document.body.style.cursor = "grabbing";
        });
    
        document.addEventListener("mousemove", (event) => {
            if (isDragging) {
                tooltip.style.left = `${event.clientX - offsetX}px`;
                tooltip.style.top = `${event.clientY - offsetY}px`;
            }
        });
    
        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = "default";
            }
        });
    }
    

    //概念をマップに追加（完了）
    addontology() {
        document.getElementById("labelselect").style.display = "none";
        const nodeBoundingBox = this.ownNetwork.getBoundingBox(this.selectId);
        const TopicTagId = this.generateUniqueNumberText();
        const selectionlist = document.getElementById('selectionlist');
        
        // ノードを追加
        this.addNode(TopicTagId, selectionlist.value, "topic-tag", nodeBoundingBox.left, nodeBoundingBox.top);
        
        this.OntologyConnectNodeId.push(this.selectId); // 選択したIDを追加
        this.OntologyNodeId.push('topic-tag_' + TopicTagId);
        defaultRecordForestMRN.record_ontology(this.selectId, 'topic-tag_' + TopicTagId);
        selectionlist.options[2].selected = true;
        
        // 新しいIDが追加されたか確認するためのデバッグ
        console.log(`OntologyNodeId after addition: ${JSON.stringify(this.OntologyNodeId)}`);
    }
    

    SelectTag (){
        document.getElementById('network_conmenu').style.display = "none";
        const recruitselect = document.getElementById("recruitselect");
        recruitselect.style.display = "block";
        recruitselect.style.left = this.BoxDisplay.x;
        recruitselect.style.top = this.BoxDisplay.y;
    }

    assignTagsToNode() {
        const FeedBackReflectionText = [];
        const FeedBackReflection = [];
        document.getElementById("recruitselect").style.display = "none";
        const selectionlist = document.getElementById('taggingSection');  // 修正した部分
        const Ontology_Node_Id = this.OntologyNodeId[this.OntologyConnectNodeId.indexOf(this.selectId)];
        this.RecruitNodeId.push(this.selectId);
        this.Feedback.push(this.selectId);
        this.Recruit.push(selectionlist.value);
    
        if (selectionlist.value === "調べる") {
            this.nodes.update({
                id: Ontology_Node_Id,
                borderWidth: 5,
                color: {
                    border: "green",
                    background: "#e0f7e0",
                },
                label: "調べる",
                shape: "box", // サポートされる形状に変更
            });
            console.log("調べるノードを更新しました");
        } else if (selectionlist.value === "考える") {
            this.nodes.update({
                id: Ontology_Node_Id,
                borderWidth: 5,
                color: {
                    border: "red",
                    background: "#fbe0e0",
                },
                label: "考える",
                shape: "box",
            });
            console.log("考えるノードを更新しました");
        } else if (selectionlist.value === "表現する") {
            this.nodes.update({
                id: Ontology_Node_Id,
                borderWidth: 5,
                color: {
                    border: "blue",
                    background: "#e0eaff",
                },
                label: "表現する",
                shape: "box",
            });
            console.log("表現するノードを更新しました");
        } else if (selectionlist.value === "相談する") {
            this.nodes.update({
                id: Ontology_Node_Id,
                borderWidth: 5,
                color: {
                    border: "orange",
                    background: "#ffe0b3",
                },
                label: "相談する",
                shape: "box", // 星形をサポートされる形状に変更
            });
            console.log("相談するノードを更新しました");
        }
    
        for (var i = 0; i < this.RecruitNodeId.length - 1; i++) {
            FeedBackReflectionText.push("text" + this.RecruitNodeId[i]);
            FeedBackReflection.push(document.getElementById("text" + this.RecruitNodeId[i]).value);
        }
    
        const node_info = this.nodes.get(this.selectId);
        document.getElementById("accordion_discussion").innerHTML += "<div id='" + this.selectId + "' class='accordion-item'><div class='accordion-header' style='font-size:10px'>なぜ「" + node_info.label + "」は" + selectionlist.value + "されたのですか？</div><div class='accordion-content'><textarea id='text" + this.selectId + "' class='accordion-input'></textarea></div></div>";
        
        const accordionHeaders = document.querySelectorAll('#accordion_discussion .accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function () {
                const accordionItem = this.parentElement;
                accordionItem.classList.toggle('active');
            });
        });
    
        // 追加したら消えてしまうからおいておく
        for (var i = 0; i < this.RecruitNodeId.length - 1; i++) {
            document.getElementById("text" + this.RecruitNodeId[i]).innerHTML = FeedBackReflection[FeedBackReflectionText.indexOf("text" + this.RecruitNodeId[i])];
        }
    
        // ここを修正したらいいよ！！！！！
        defaultRecordForestMRN.record_tagForObject(this.selectId, Ontology_Node_Id, selectionlist.value);
        document.getElementById("net_conmenu3").style.display = "none";
        
    }
    
    
    ContentmenuCancel(){
        document.getElementById('network_conmenu').style.display = "none";
    }

    //マインドマップとネットワークつなげる(今後動作確認はいる多分行けた)，(複雑なので何してるか聞きたいなら大槻まで)
    //this.nodeConnectEnabled を true に設定し、接続モードが有効になったことを示します。
    //これにより、マインドマップのノードをクリックした際に接続処理が実行されるようになります。
    //ネットワークのノード接続モードを有効にする。
    connect_network (){
        //ネットワークのコンテキストメニュー（network_conmenu）を非表示にする。
        document.getElementById('network_conmenu').style.display = "none"; 
        //this.nodeConnectEnabled を true に設定し、接続モードを有効化。
        this.nodeConnectEnabled = true;
    }

    // マインドマップのノードがクリックされたときの処理
    connect_mindmap (e) {
        //console.log("connect_mindmap function called")
        //jsMind オブジェクトを作成し、クリックされたノードIDを取得
        const Jsmind = new jsMind({container:'jsmind_container', editable: false});
        const mm_nodeid = Jsmind.view.get_binded_nodeid(e.target);
        //console.log("Clicked node ID:", mm_nodeid); //ここで，マインドマップのノードIDを取得してる．

        //新たな接続を記録し、ConnectNetworkNodeId と ConnectMindMapNodeId に追加
        // ノード接続を記録
        defaultRecordForestMRN.record_connection(this.selectId, mm_nodeid);
        //console.log("Recorded connection:", {selectId: this.selectId, mm_nodeid: mm_nodeid});

        this.ConnectNetworkNodeId.push(this.selectId);
        this.ConnectMindMapNodeId.push(mm_nodeid);
    }


    //ネットワークノードがクリックされたときの処理
    networkClick (params){
        // ノード選択後、手段追加ボタンを有効にする
        //console.log("クリックされたノード:", params.nodes);  // クリックされたノード情報をログ出力

        globalParams = params; // グローバル変数に保存
        //console.log("確認:", globalParams);

        // ノードが1つ以上選択された場合に手段追加ボタンを有効化
        if (params.nodes.length > 0) {
            //console.log("手段追加ボタンを有効化する条件が満たされました。");
            document.getElementById("mrnb_addStep").disabled = false; // 手段追加ボタンを有効化
        } else {
            //console.log("手段追加ボタンを無効化します。");
            document.getElementById("mrnb_addStep").disabled = true; // 手段追加ボタンを無効化
        }
        //他のところクリックしたら色直す
        if(this.jmindex != []){
            const jmnode = document.getElementsByTagName("jmnode");
            this.jmindex.map((n) => {
                if(jmnode[n].getAttribute("type") == "answer"){
                    jmnode[n].style.backgroundColor = "#ffa500";
                }else{
                    jmnode[n].style.backgroundColor = "#87cefa";
                }
            })
            this.jmindex.length = 0;
        }
        //ここ未完成
        if(this.nodes.get(params.nodes[0]).group === "utterance"){
            if(this.OntologyConnectNodeId.indexOf(params.nodes[0]) !== -1){
                const node_infomation = this.nodes.get(this.OntologyNodeId[this.OntologyConnectNodeId.indexOf(params.nodes[0])]);
                document.getElementById("ontology_feedback").innerHTML = "<div class='feedback_message'>この発言は「"+node_infomation.label + "」と「" + this.output_input[node_infomation.label] + "」<br>との合理性を意識して発言されたのかもしれません</div>";
            } 
        }
        // if(this.RecruitNodeId.indexOf(params.nodes[0]) !== -1){
        //     this.FeedbackNodeId = params.nodes[0];
        //     document.getElementById(this.FeedbackNodeId).style.display = "block";
        // }
        if(params.nodes.length == 1){
            const net_index = this.ConnectNetworkNodeId.map((n_id, index) => {
                return n_id === params.nodes[0] ? index : null;
            }).filter(n => n !== null);
            if(net_index == ""){
                return;
            }
            const jmnode = document.getElementsByTagName("jmnode");
            net_index.map((m_id) => {
                for(var i = 0; i < jmnode.length; i++){
                    if(jmnode[i].getAttribute("nodeid") == this.ConnectMindMapNodeId[m_id]){
                        //ここいろかえる必要あるかも
                        jmnode[i].style.backgroundColor = "white";
                        this.jmindex.push(i);
                        break;
                    }
                }
            });
        }
    }

    //ここ色々使えるかも．
    //マインドマップ内の複数コンテナに対応し、選択されたネットワークノードの関連情報をハイライト
    shownetworkClick (params){
        //過去のハイライトをリセット（背景色を元に戻す）
        if(this.jmindex2 != []){
            const area2 = document.getElementById("jsmind_container2");
            const jmnode2 = area2.getElementsByTagName("jmnode");
            this.jmindex2.map((n) => {
              if(jmnode2[n].getAttribute("type") == "answer"){
                jmnode2[n].style.backgroundColor = "#ffa500";
              }else{
                jmnode2[n].style.backgroundColor = "#87cefa";
              }
            })
            this.jmindex2.length = 0;
          }
          if(this.jmindex3 != []){
            const area3 = document.getElementById("jsmind_container3");
            const jmnode3 = area3.getElementsByTagName("jmnode");
            this.jmindex3.map((n) => {
              if(jmnode3[n].getAttribute("type") == "answer"){
                jmnode3[n].style.backgroundColor = "#ffa500";
              }else{
                jmnode3[n].style.backgroundColor = "#87cefa";
              }
            })
            this.jmindex3.length = 0;
          }
          //現在のネットワークノードに対応するマインドマップノードを見つけ、それらの背景色を変更。
          if(params.nodes.length = 1){
            const net_index_show = this.ConnectNetworkNodeId.map((n_id, index) => {
              return n_id === params.nodes[0] ? index : null;
            }).filter(n => n !== null);
            if(net_index_show == ""){
              return;
            }
            const area2 = document.getElementById("jsmind_container2");
            const area3 = document.getElementById("jsmind_container3");
            const jmnode2 = area2.getElementsByTagName("jmnode");
            const jmnode3 = area3.getElementsByTagName("jmnode");
            net_index_show.map((m_id) => {
              for(var i = 0; i < jmnode2.length; i++){
                if(jmnode2[i].getAttribute("nodeid") == this.ConnectMindMapNodeId[m_id]){
                  //ここいろかえる必要あるかも
                  jmnode2[i].style.backgroundColor = "white";
                  this.jmindex2.push(i);
                }
              }
              for(var i = 0; i < jmnode3.length; i++){
                if(jmnode3[i].getAttribute("nodeid") == this.ConnectMindMapNodeId[m_id]){
                  //ここいろかえる必要あるかも
                  jmnode3[i].style.backgroundColor = "white";
                  this.jmindex3.push(i);
                  return;
                }
              }
            });
          }
  
    }

    addNewEdge(E_start, E_end){
        this.edges.add({ from: E_start, to: E_end });
        defaultRecordForestMRN.record_Edge(E_start, E_end);
    }

    //ドラッグ開始(完成)
    dragstart (params) {
        //this.edgeEditMode が false の場合、エッジ編集モードでないためドラッグ操作を無効にします。
        if(!this.edgeEditMode){
            params.event.preventDefault();  //params.event.preventDefault(); でドラッグ操作をキャンセルしています。
            //this.edgeEditMode が true であれば、ドラッグを許可し、this.dragStartNodeId にドラッグを開始したノードの ID を格納します。
        }else{
            //this.ownNetwork.getNodeAt(params.pointer.DOM) で、ドラッグ開始時の位置にあるノードを取得しています。
            this.dragStartNodeId = this.ownNetwork.getNodeAt(params.pointer.DOM);
        }
    }

    //ドラッグ終了(完成)
    dragend (params) {
        if(this.edgeEditMode){
            this.dragEndNodeId = this.ownNetwork.getNodeAt(params.pointer.DOM);
            if(this.dragStartNodeId !== null && this.dragEndNodeId !== null && this.dragEndNodeId !== this.dragStartNodeId && this.dragEndNodeId !== undefined && this.nodes.get(this.dragStartNodeId).shape != "ellipse" && this.nodes.get(this.dragEndNodeId).shape != "ellipse"){
                let notable = true;
                const ConnectSelectNode = [];
                const connectedEdges = this.ownNetwork.getConnectedEdges(this.dragStartNodeId);
                connectedEdges.map((n)=>{
                    ConnectSelectNode.push(this.ownNetwork.getConnectedNodes(n).filter(n => n !== this.dragStartNodeId)[0]);
                });
                ConnectSelectNode.map((n)=>{
                    if(n === this.dragEndNodeId){
                        notable = false;
                    }
                });
                if(notable == false){
                    return;
                }
                this.edges.add({ from: this.dragStartNodeId, to: this.dragEndNodeId });
                defaultRecordForestMRN.record_Edge(this.dragStartNodeId, this.dragEndNodeId);
            }
            this.dragStartNodeId = null;
            this.dragEndNodeId = null;
        }else {
            const movedNodeId = params.nodes[0];
            //console.log("Moved Node ID:", movedNodeId); // ノードIDをログ出力
            //console.log("param:", params); 
        
            // ノードが正しく選択されている場合にのみ処理を進める
            if (movedNodeId !== undefined) {
                // ノードデータを取得
                const node = this.nodes.get(movedNodeId);
                console.log("Node Data:", node); // ノードの詳細データをログ出力
        
                // なぜか更新したら色変わってしまうから一時的に
                let node_color;
                // ノードのグループに応じて色を設定
                switch (node?.group) { // nullチェック付き
                    case "goal": // 自分で考えた要約に関するノードの場合
                        node_color = 'red';
                        //console.log("Group is '0', setting color to red");
                        break;
                    case "step": // 議論内での発言ノードの場合
                        node_color = 'green';
                        //console.log("Group is '1', setting color to green");
                        break;
                    default: // その他
                        //console.log("Group does not match, using default color");
                        break;
                }

                // "done"が設定されている場合は色をgrayに変更
                switch(node.status) {
                    //目標ノードか手段ノードか
                    case "inProgress":
                        node_color = 'orange';
                        break;
                    case "done": // 手段完了
                        node_color = 'gray';
                        text_color = 'white';
                        break;
                    case "break": // 手段完了
                        node_color = 'LightCoral';
                        break;
                    case "end": // 手段完了
                        node_color = 'gray';
                        break;
                    case null: //手段進行中
                        break;
                    default: // その他
                        break;
                }

                // 設定されたnode_colorをノードに適用
                //console.log("Node Color to be set:", node_color);
                this.nodes.update({
                    id: movedNodeId,
                    color: { background: node_color },
                });

                // ノードを更新
                try {
                    this.nodes.update({ 
                        id: movedNodeId, 
                        color: { background: node_color }, // 背景色を設定
                        x: params.pointer.x, 
                        y: params.pointer.y 
                    });
                    //console.log("Node successfully updated.");
                } catch (error) {
                    //console.error("Error updating node:", error); // エラー時のログ
                }
        
                // ノードの境界ボックスを取得
                const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
                //console.log("Node Bounding Box:", nodeBoundingBox); // 境界ボックスの情報をログ出力
        
                // 次に追加したノードの座標指定
                this.latest_selected_node_info.x = (nodeBoundingBox.right + nodeBoundingBox.left) / 2;
                this.latest_selected_node_info.y = nodeBoundingBox.bottom + 10;
                //console.log("Updated latest_selected_node_info:", this.latest_selected_node_info); // 更新した座標情報をログ出力
        
                // 外部更新処理
                try {
                    defaultRecordForestMRN.update_Goal(
                        "point", 
                        movedNodeId, 
                        (nodeBoundingBox.right + nodeBoundingBox.left) / 2, 
                        (nodeBoundingBox.bottom + nodeBoundingBox.top) / 2
                    );
                    //console.log("defaultRecordForestMRN successfully updated.");
                } catch (error) {
                    //console.error("Error updating defaultRecordForestMRN:", error); // エラー時のログ
                }
            } else {
                //console.warn("No node was moved.");
            }
        }       
    }
    
    // エッジの削除（完了）
    deleteEdge() {
        //this.ownNetwork.getSelection().edges[0] によって、現在選択されているエッジのIDを取得し、selectEdgeId に代入
        const selectEdgeId = this.ownNetwork.getSelection().edges[0];
        console.log("Selected Edge ID:", selectEdgeId); // 選択したエッジIDを表示

        //選択されたエッジの開始ノードID（from）と終了ノードID（to）を取得し、startid と endid に格納します。
        const startid = this.edges.get(selectEdgeId).from;
        const endid = this.edges.get(selectEdgeId).to;
        //const object_edges_id = edgeData.object_edge_id;
        console.log("Edge Start ID:", startid);
        console.log("Edge End ID:", endid);
        //console.log("Object Edge ID:", object_edges_id);

         // selectEdgeId が undefined でない場合（エッジが選択されている場合）、以下の削除処理を実行
    if (selectEdgeId !== undefined) {
        this.edges.remove({ id: selectEdgeId });  // this.edges から選択されたエッジを削除
        console.log("Edge removed from visualization:", selectEdgeId);

        // データベースからもエッジを削除するようにリクエスト
       //defaultRecordForestMRN.delete_db_Edge(object_edges_id, startid, endid); 
       defaultRecordForestMRN.delete_db_Edge(startid, endid); 
        console.log("Database delete request sent with:",startid, endid);

        // OntologyConnectNodeIdからstartidのインデックスを取得し、EdgeStartIdとEdgeEndIdのリストから削除
        const Edge_index = this.OntologyConnectNodeId.indexOf(startid);
        if (Edge_index !== -1) {
            this.EdgeStartId.splice(Edge_index, 1);
            this.EdgeEndId.splice(Edge_index, 1);
            console.log("Edge removed from internal arrays:", Edge_index);
        } else {
            console.warn("Start ID not found in OntologyConnectNodeId:", startid);
        }
    } else {
        console.warn("No edge selected for deletion.");
    }
}

    feedback(){
        defaultRecordForestMRN.record_Feedback(this.FeedbackNodeId,document.getElementById("text"+this.FeedbackNodeId).value);
        const feedbacknode_index = this.Feedback.indexOf(this.FeedbackNodeId);
        this.Feedback.splice(feedbacknode_index, 1);
        const feedbacknode = this.nodes.get(this.FeedbackNodeId);
        let node_color = 'skyblue'; // ノードの背景色
        switch(feedbacknode.group) {
            case "material-content": // 議論資料に書かれた内容に関するノードの場合
                break;
            case "self-summary": // 自分で考えた要約に関するノードの場合
                node_color = 'green';
                break;
            case "utterance": // 議論内での発言ノードの場合
                node_color = 'pink';
                break;
            case "topic-tag": // 議論内省マップのノードがどんなトピックに対応しているかを表すタグノードの場合
                node_color = 'blue';
                break;
            default: // その他
                break;
        }
        this.nodes.update({ id: this.FeedbackNodeId, color: node_color, borderWidth: 0 });
    }

    Nodeblinking() {
        this.Feedback.map((n) => {
            const feedbacknode = this.nodes.get(n);
            //let node_color = 'skyblue'; // ノードの背景色
            switch(feedbacknode.group) {
                case "material-content": // 議論資料に書かれた内容に関するノードの場合
                    break;
                case "self-summary": // 自分で考えた要約に関するノードの場合
                    node_color = 'green';
                    break;
                case "utterance": // 議論内での発言ノードの場合
                    node_color = 'pink';
                    break;
                case "topic-tag": // 議論内省マップのノードがどんなトピックに対応しているかを表すタグノードの場合
                    node_color = 'blue';
                    break;
                default: // その他
                    break;
            }
            const borderWidth = feedbacknode.borderWidth === 0 ? 5 : 0;
            this.nodes.update({ id: n, color: { background: node_color, border: "red"}, borderWidth: borderWidth });
        })
    }

    addMaterialOntology(material_id, concept_id){
        $.ajax({
            url:'js/hozo.xml',
            type:'get',
            dataType:'xml',
            timeout:1000,
            success: (xml,status) => {
                if(status!='success')return;
                const XML = $(xml).find('W_CONCEPTS');
                const concept = Array.from(XML[0].getElementsByTagName('CONCEPT'));
                //hozo.xmlファイルのタグを検索して変数に格納（たぶん，全てのタグが配列で格納されている），thisはhozo.xmlのことかな
                concept.map((content)=>{
                    if(content.getAttribute('id') === concept_id){
                        const slot_content = Array.from(content.getElementsByTagName("SLOT"));
                        console.log(content)
                        slot_content.map((content_slot) => {
                            if(content_slot.getAttribute("role") === "出力"){
                                const nodeBoundingBox = defaultForestMRN.ownNetwork.getBoundingBox(material_id);
                                this.addNode(concept_id, content_slot.getAttribute("class_constraint"), "topic-tag", nodeBoundingBox.left, nodeBoundingBox.top);
                                this.OntologyConnectNodeId.push(material_id);
                                this.OntologyNodeId.push('topic-tag_'+concept_id);
                                defaultRecordForestMRN.record_ontology(material_id, 'topic-tag_'+concept_id);
                            }
                        });
                    }
                });
            }
        });
    }

    zoomIn() {
        const scale = this.ownNetwork.getScale() * 1.1; // Increase scale by 10%
        this.scale = scale;
        this.ownNetwork.moveTo({ scale: scale });
    }
      
    zoomOut() {
        const scale = this.ownNetwork.getScale() * 0.9; // Decrease scale by 10%
        this.scale = scale;
        this.ownNetwork.moveTo({ scale: scale });
    }

}


// ネットワーク関係の記録
class RecordForestMRN{
    //kagitani--目標ノードの記録
    record_GoalNode (id, label, node_type, x, y){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {node_id : id,
                object_map_id : object_map_id,
                label : label,
                x : x,
                y : y,
                node_type : node_type,
                purpose : 'record',
                record_thing: 'node'
            }
        });
    }
    
    record_StepNode (id, label, node_type, x, y){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {node_id : id,
                object_map_id : object_map_id,
                label : label,
                x : x,
                y : y,
                node_type : node_type,
                purpose : 'record',
                record_thing: 'step'
            },
            success: function(response) {
                console.log("データが正常に送信されました:", response);
            },
            error: function(xhr, status, error) {
                console.error("エラーが発生しました:", error);
            }
        });
    }

    record_NodeStatus (id, status){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {node_id : id,
                status : status,
                label : label,
                purpose : 'update',
                record_thing: 'status'
            },
            success: function(response) {
                console.log("データが正常に送信されました:", response);
            },
            error: function(xhr, status, error) {
                console.error("エラーが発生しました:", error);
            }
        });
    }

    record_tagForObject (id, status){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {node_id : id,
                status : status,
                label : label,
                purpose : 'update',
                record_thing: 'status'
            },
            success: function(response) {
                console.log("データが正常に送信されました:", response);
            },
            error: function(xhr, status, error) {
                console.error("エラーが発生しました:", error);
            }
        });
    }

    update_NodeStatus(select_update, id, node_update_thing1, node_update_thing2) {
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {
                select_update: select_update,//status
                node_id: id,
                purpose: 'update',
                update_thing: 'status',
                status:'inProgress',
                node_update_thing1: node_update_thing1,
                node_update_thing2: node_update_thing2
            },
            success: function(response) {
                console.log("完了！！！！！１Server response:", response);
                try {
                    const parsedResponse = JSON.parse(response); // JSONレスポンスの解析を試みる
                    console.log("Parsed response:", parsedResponse);
                } catch (error) {
                    //console.error("Failed to parse response as JSON:", error);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX error:", {
                    xhr: xhr,
                    status: status,
                    error: error
                });
            }
        });
    }

    // ノードの削除
    delete_db_Node(id) {
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {
                node_id: id,
                purpose: 'delete',
                delete_thing: 'node',
                delete_flag: 1 // 削除フラグを 1 に設定
            },
            success: function(response) {
                console.log("Node deletion successful:", response);
            },
            error: function(xhr, status, error) {
                console.error("Error deleting node:", error);
            }
        });
    }

    //エッジの記録(完了)
    record_Edge(edge_start, edge_end) {
        console.log("エッジの記録を開始");
        console.log("送信データ:", {
            object_map_id : object_map_id,
            edge_start: edge_start,
            edge_end: edge_end,
            purpose: 'record',
            record_thing: 'edge'
        });
        
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {
                object_map_id : object_map_id,
                edge_start: edge_start,
                edge_end: edge_end,
                purpose: 'record',
                record_thing: 'edge'
            },
            success: function(response) {
                console.log("エッジの記録成功:", response);
            },
            error: function(xhr, status, error) {
                console.error("エッジ記録エラー:", error);
                console.log("ステータス:", status);
                console.log("レスポンステキスト:", xhr.responseText);
            }
        });
        console.log("エッジの記録をするぽよ");
    }

    // フラグをオフにして記録を停止
    stopAutoRecord() {
        autoRecordFlag = false; // 自動記録を停止
        $.ajax({
            url: "php/record_object_activities.php",
            type: "POST",
            data: {
                purpose: 'auto_record',
                record_thing: 'stop_flag',
            },
            success: function(response) {
                console.log("Flag stopped:", response); // サーバーからのレスポンスを確認
            },
            error: function(xhr, status, error) {
                console.error("Error stopping flag:", error); // エラーを表示
            }
        });
    }

    

    //フィードバックの記録
    record_Feedback (node_id, text){
        $.ajax({
            url: "php/discussion_edit_structmap_maneger.php",
            type: "POST",
            data: {purpose: "record",
                record_thing: "reflectioncontent",
                node_id : node_id,
                text : text},
        });
    }

    record_Material_Edge(edge_start, edge_end, edge_label){
        $.ajax({
            url: "php/discussion_edit_structmap_maneger.php",
            type: "POST",
            data: {edge_start : edge_start,
                edge_end : edge_end,
                edge_label: edge_label,
                purpose : 'record',
                record_thing: 'material_edge'},
        });
    }

    //kagitani--ノードの更新
    update_Goal(select_update, id, node_update_thing1, node_update_thing2) {
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {
                select_update: select_update,
                node_id: id,
                purpose: 'update',
                update_thing: 'node',
                node_update_thing1: node_update_thing1,
                node_update_thing2: node_update_thing2
            },
            success: function(response) {
                //console.log("Server response:", response);
                try {
                    const parsedResponse = JSON.parse(response); // JSONレスポンスの解析を試みる
                    console.log("Parsed response:", parsedResponse);
                } catch (error) {
                    //console.error("Failed to parse response as JSON:", error);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX error:", {
                    xhr: xhr,
                    status: status,
                    error: error
                });
            }
        });
    }
    
    
    //エッジの削除(完了)
    delete_db_Edge(edge_start, edge_end) {
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {
                edge_start: edge_start,
                edge_end: edge_end,
                purpose: 'delete',
                delete_thing: 'edge'
            },
            success: function(response) {
                console.log("エッジのサーバーの応答:", response); // サーバーからの応答を表示
                if (response === "success") {
                    console.log("エッジ削除が成功しました");
                } else {
                    console.warn("エッジ削除の応答が予期しない形式です:", response);
                }
            },
            error: function(error) {
                console.error("エッジ削除のエラー:", error);
            }
        });
    }
    

    delete_connection (id){
        $.ajax({
            url: "php/discussion_edit_structmap_maneger.php",
            type: "POST",
            data: {node_id : id,
                purpose : 'delete',
                delete_thing : 'connection'},
        });
    }

    //繋げたものをDBに記録
    record_connection (NetworkNodeId,MindMapNodeId){
        $.ajax({
            url: "php/discussion_edit_structmap_maneger.php",
            type: "POST",
            data: {networknodeid : NetworkNodeId,
                mindmapnodeid : MindMapNodeId,
                purpose : 'record',
                record_thing : 'connection'},
        });
    }

    // オントロジーの対応付けの記録
    record_ontology (node_id, ontology_node_id){
        $.ajax({
            url: "php/discussion_edit_structmap_maneger.php",
            type: "POST",
            data: {node_id : node_id,
                ontology_node_id : ontology_node_id,
                purpose : 'record',
                record_thing : 'ontology'},
        });
    }

    // オントロジーの対応付けの記録
    record_recruit (node_id, ontology_node, result){
        $.ajax({
            url: "php/discussion_edit_structmap_maneger.php",
            type: "POST",
            data: {node_id : node_id,
                ontology_node : ontology_node,
                result_recruit : result,
                purpose : 'record',
                record_thing : 'recruit'},
        });
    }
}

/*
 * データベースからの読み込み
 */
let utterance_list;
const getDiscussionMapDataFromDB = (target_time, end_time, callback) => {
    let data;
        //最初のデータロードの際に使われる。
        if(target_time === null){
            data =  {
                    purpose: "select_meeting_utterance",
                    object_map_Id : object_map_id
                    };
        }
        return $.ajax({
            url: "php/object_map_manager.php",
            type: "POST",
            data: data,
            success: (r) => {
                //console.log("Raw response:", r); 
                try {
                    utterance_list = JSON.parse(r);
                    console.log("Parsed utterance_list:", utterance_list);
                    callback(utterance_list);
                } catch (e) {
                    //ここのエラー治ってない．原因はわからんけど，普通に動くから削除してる．
                    // console.error("Failed to parse JSON:", e, r);
                }
            },
            error: (xhr, status, error) => {
                console.error("AJAX error:", status, error);
                console.log("Response text:", xhr.responseText);
            }
        });
}

const getLatestMapID = (callback) => {
    $.ajax({
        url: "php/object_map_manager.php",  // PHPファイルのURL
        type: "POST",
        data: { purpose: "get_latest_map_id" }, // 送信するデータ
        success: (response) => {
            console.log("Raw response from getLatestMapID:", response); // 生のレスポンスを表示
            try {
                const data = JSON.parse(response); // JSON形式にパース
                if (data.error) {
                    console.error("Error from server:", data.error); // エラーメッセージがあれば表示
                } else {
                    const latestMapID = data.map_id; // 最新のmap_idを取得
                    console.log("Latest map_id:", latestMapID);
                    callback(latestMapID); // コールバックに渡す
                }
            } catch (e) {
                console.error("Failed to parse JSON:", e, response); // JSONパースに失敗した場合
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAX error in getLatestMapID:", status, error); // エラー処理
            console.log("Response text:", xhr.responseText); // レスポンスの内容を表示
        }
    });
};


//活動ログを表示する．
const makeLog = (timestamp, text, act, type, mapId) => {
    console.log("makeLog called with arguments:", { 
        timestamp, 
        text, 
        act,
        type,
        mapId
    });

    let mapName = '';

    $.ajax({
        url: 'php/get_goals.php',
        type: 'POST',
        data: {
            object_map_id: mapId,
            purpose: 'name'
        },
        async: false,
        success: (response) => {
            console.log("AJAX success - レスポンス受け取り:", response);
            try {
                const data = JSON.parse(response);
                mapName = data[0].label;
                console.log("mapName received:", mapName);
            } catch (error) {
                console.error("レスポンスの解析に失敗しました:", error, "レスポンス内容:", response);
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAX error:", status, error);
        }
    });

    let message = "";
    const mapNameElement = mapName ? `<br><span style="font-size: 11px; color: #330;"> ${mapName}</span>` : '';

    if (type === "goal") {
        if (act === "add") {
            message = `<strong>🎯 新しい目標追加</strong> ${mapNameElement}`;
        } else if (act === "edit") {
            message = `<strong>🎯 目標設定</strong><br>${text} ${mapNameElement}`;
        }
    } else if (type === "step") {
        if (act === "add") {
            message = `<u>🛠️ 新しい手段追加</u> ${mapNameElement}`;
        } else if (act === "edit") {
            message = `<u>🛠️ 手段設定</u><br>${text} ${mapNameElement}`;
        } else if (act === "start") {
            message = `<u><i class="fa fa-play"></i> 手段開始</u><br>${text} ${mapNameElement}`;
        } else if (act === "break") {
            message = `<u><i class="fa fa-pause"></i> 手段中断</u><br>${text} ${mapNameElement}`;
        } else if (act === "end") {
            message = `<u><i class="fa fa-check"></i> 手段終了</u><br>${text} ${mapNameElement}`;
        }
    } else if (type === "map") {
        if (act === "add") {
            message = `<strong style="font-size: 13px; color: #d19a00;">🗺️ 新しいマップ追加</strong><br>${mapName}`;
        }
    } else if (type === "answer") {
        if (act === "add") {
            message = `<strong>✅ 新しい答え追加</strong> ${mapNameElement}`;
        } else if (act === "edit") {
            message = `<strong>✅ 答え編集</strong><br>${text} ${mapNameElement}`;
        }
    } else if (type === "question") {
        if (act === "add") {
            message = `<strong>❓ 新しい問い追加</strong> ${mapNameElement}`;
        } else if (act === "edit") {
            message = `<strong>❓ 問い編集</strong><br>${text} ${mapNameElement}`;
        }
    } else {
        console.error("Invalid type:", type);
        return null;
    }
    
    const backColorMap = {
        add: '#d4edda',
        edit: '#d1ecf1',
        start: '#fff3cd',
        break: '#f8d7da',
        end: '#f1f3f4',
        mapAdd: '#fff8dc'
    };
    const backColor = (type === "map" && act === "add") ? backColorMap.mapAdd : backColorMap[act] || 'gray';

    const logNode = $(`
        <div id="${timestamp}" 
             style='border: solid 2px #d19a00; 
                    border-radius: 10px;
                    font-size: 14px; 
                    line-height: 1.5; 
                    background: ${backColor}; 
                    margin: 0 auto 10px auto; 
                    width: 95%; 
                    padding: 3px;
                    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);'
             class='utter_node_in_list animated fadeIn' 
             utterance='${text}' 
             timestamp='${timestamp}'>
            <div style="margin: 0; padding: 0;">${message}</div>
            <div style="font-size: 10px; color: #666; text-align: right; margin: 0; padding: 0;">${timestamp}</div>
            <ul style="margin: 0; padding: 0; text-align: right; list-style: none;"></ul>
        </div>
    `);

    logNode.hide().fadeIn(500);

    console.log("Generated logNode HTML:", logNode);

    return logNode;
}



// objectMapIdを指定してマップ名を取得
function loadMapLabel() {
    $.ajax({
        url: 'php/get_goals.php',  // PHPファイルのパス
        type: 'POST',
        data: {
            purpose: 'label'  // 目的を指定
        },
        success: (response) => {
            console.log("AJAX success - レスポンス受け取り:", response); // レスポンスを表示

            // レスポンスが JSON 文字列の場合、パースします
            let mapsData;
            try {
                mapsData = JSON.parse(response);
                console.log("JSONパース成功 - mapsData:", mapsData); // パース後のデータを表示
            } catch (e) {
                console.error("JSONパースエラー:", e);
                return; // エラーが発生した場合は早期リターン
            }

            // mapsData が配列ならば
            if (Array.isArray(mapsData)) {
                console.log("mapsData は配列です - マップ名を表示"); // 配列の場合
                const filterMapSelect = document.getElementById("filter-map");
                console.log("filterMapSelect:", filterMapSelect); // filterMapSelect要素を表示

                // 最初の選択肢を追加
                const firstOption = document.createElement("option");
                firstOption.value = "";
                firstOption.textContent = "選択してください";
                filterMapSelect.appendChild(firstOption);
                console.log("最初のオプション追加 - firstOption:", firstOption);

                // マップ名を選択肢として追加
                mapsData.forEach((map, index) => {
                    const option = document.createElement("option");
                    option.value = map.object_map_id;  // object_map_idを値に設定
                    option.textContent = map.label;   // 表示名として使用
                    filterMapSelect.appendChild(option);
                    console.log(`マップ名を追加 - index: ${index}, map_name: ${map.label}, map_id: ${map.object_map_id}`);
                });
                
            } else {
                console.error("mapsDataは配列ではありません。取得失敗かデータ形式が不正です。");
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAXリクエスト失敗 - 状態:", status, "エラー:", error);
            console.error("AJAXリクエスト失敗 - xhr:", xhr); // xhrの詳細を表示
        }
    });
}



function openFilterModal() {
    document.getElementById("filter-modal").style.display = "block";
}

function closeFilterModal() {
    document.getElementById("filter-modal").style.display = "none";
}

//フィルタを書ける関数，一旦仮．
function applyFilters() {
    // 活動日付の範囲を取得
    var startDate = document.getElementById('filter-start-date').value;
    var endDate = document.getElementById('filter-end-date').value;

    // 使用マップの選択
    var mapSelect = document.getElementById('filter-map');
    var mapValue = mapSelect.value; // 選択された値
    var mapLabel = mapSelect.options[mapSelect.selectedIndex]?.textContent || ""; // 選択された表示名

    // 手段開始・終了のチェックボックス状態を取得
    var start = document.getElementById('filter-start').checked;
    var end = document.getElementById('filter-end').checked;

    // 活動日付の範囲を選択していない場合のエラーチェック
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        alert("終了日は開始日以降の日付を選択してください。");
        return; // 逆転した範囲を適用しないように
    }

    var filterStatus = document.getElementById('filter-status');

    // フィルタ条件をチェック
    if (startDate || endDate || mapValue) {
        // 現在のフィルタ条件を表示
        let filterText = "現在のフィルタ: ";
        if (startDate) filterText += `開始日 ${startDate} `;
        if (endDate) filterText += `| 終了日 ${endDate} `;
        if (mapValue) filterText += `| マップ: ${mapLabel}`;
        filterStatus.querySelector('p').textContent = filterText;
        filterStatus.style.display = 'block'; // 表示
    } else {
        filterStatus.style.display = 'none'; // 非表示
    }

    console.log('開始日:', startDate);
    console.log('終了日:', endDate);
    console.log('マップ:', mapLabel);
    console.log('手段開始:', start);
    console.log('手段終了:', end);

    $.ajax({
        url: 'php/get_objectLogs.php', // PHPファイルのパス
        type: 'POST',
        data: {
            startDate: startDate,
            endDate: endDate,
            map: mapValue, // マップの値を送信
            start: start ? 1 : 0,
            end: end ? 1 : 0
        },
        success: (response) => {
            console.log("AJAX success - レスポンス受け取り:", response);
            try {
                // レスポンスをJSONにパース
                const logs = JSON.parse(response);
            
                // 挿入対象エリアを取得
                const target_area = $(`#utterance_area2`);
                // 既存の内容をクリア
                target_area.empty();

                // レスポンスが配列であることを確認
                if (Array.isArray(logs)) {
                    logs.forEach(logEntry => {
                        // 各ログエントリから必要なデータを取得
                        const { timestamp, text, act, type } = logEntry;
            
                        // makeLogを呼び出してログを生成
                        const log = makeLog(timestamp, text, act, type, mapLabel);
                        console.log("生成されたDOM:", { timestamp, text, act, type, log });
            
                        // 挿入対象エリアに追加
                        target_area.append(log);
                    });
                } else {
                    console.error("レスポンスは配列形式ではありません:", logs);
                }
            } catch (error) {
                console.error("レスポンスの解析に失敗しました:", error, "レスポンス内容:", response);
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAX error:", status, error);
        }
    });
    // モーダルを閉じる
    closeFilterModal();
}


function resetFilters() {
    // フィルタ条件をリセット
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    document.getElementById('filter-map').value = '';
    document.getElementById('filter-start').checked = false;
    document.getElementById('filter-end').checked = false;

    // サーバーから全てのログを取得するリクエストを送信
    $.ajax({
        url: 'php/get_objectLogs.php', // 全てのログを取得するPHPスクリプト
        type: 'POST',
        data: {}, // 条件なしでリクエスト
        success: (response) => {
            console.log("AJAX success - 全てのログを取得:", response);
            try {
                const logs = JSON.parse(response);
                const target_area = $(`#utterance_area2`);
                // 既存の内容をクリア
                target_area.empty();

                if (Array.isArray(logs)) {
                    logs.forEach(logEntry => {
                        const { timestamp, text, act, type } = logEntry;
                        const log = makeLog(timestamp, text, act, type,map);
                        target_area.append(log);
                    });
                } else {
                    console.error("レスポンスは配列形式ではありません:", logs);
                }
            } catch (error) {
                console.error("レスポンスの解析に失敗しました:", error);
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAX error:", status, error);
        }
    });
}


//活動ログを表示する関数を作ってみたよん
// イベントリスナーを設定
window.addEventListener("textSendEvent", (event) => {
    console.log("[object-network.js] カスタムイベントを受信しました:", event);

    const now = new Date();
    // 年/月/日 時:分:秒 形式でフォーマット
    const receivedTimestamp = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}時${now.getMinutes()}分${now.getSeconds()}秒`;
    const receivedNodeText = event.detail.nodeTEXT; // nodeTEXTを取得
    const receivedNodeAct = event.detail.nodeACT; // nodeACTを取得
    const receivedNodeType = event.detail.nodeTYPE; // nodeTYPEを取得
    const receiveMapId = event.detail.objectMapId; // objectMapIdの誤スペルを修正
    console.log("[object-network.js] 受信したtimestamp:", receivedTimestamp, receivedNodeText, receivedNodeAct, receivedNodeType, receiveMapId);

    try {
        // DOMを生成して挿入
        const log = makeLog(receivedTimestamp, receivedNodeText, receivedNodeAct, receivedNodeType, receiveMapId);

        const target_area = $(`#utterance_area2`);

        if (target_area.length > 0) {
            target_area.prepend(log); // 一番上に挿入
        } else {
            console.warn("[object-network.js] 挿入対象エリアが見つかりません。");
        }
    } catch (error) {
        console.error("[object-network.js] DOM操作中にエラーが発生しました:", error);
    }
});

// アップロードする時
const displayUtteranceNodeInList = (display_target_area_id, target_reflection_time) => {
    // 指定した時間（指定なしなら最新）のマップに対応する発話ノードリストを取得して画面上に配置
    let mousedownId = null;
    document.getElementById(display_target_area_id).innerHTML="";
    const target_area = $(`#${display_target_area_id}`); // 発話ノードリストのDOMエリア
    const timedisplay_area = $(`#timedisplay`); // 発話ノードの議論内での時間を表示するエリア
    getDiscussionMapDataFromDB(target_reflection_time, null, (utterance_list_info) => {
        //データの取得と挿入
        for(var i=0; i<utterance_list_info.document.length; i++){
            defaultForestMRN.addmaterialNode(utterance_list_info.document[i].content_id, utterance_list_info.document[i].content);
            document.getElementById("labelselect").style.display = "none";
            defaultForestMRN.addMaterialOntology('material-content_'+utterance_list_info.document[i].content_id, utterance_list_info.document[i].concept_id);
        }
        utterance_list_info.document_relation.map(u => {
            defaultForestMRN.addmaterialEdge("material-content_"+u.doc_con1_id, "material-content_"+u.doc_con2_id, u.doc_con1_label+"→"+u.doc_con2_label)        
        });
    }).then(() => {
        $(`#utterance_area`).on('mousedown', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            mousedownId = null;
            const overed_node = e.target;
            if(overed_node.getAttribute('network_on')==='0'){
                mousedownId = overed_node.getAttribute('id');
            }
        });
        $(`#utterance_area`).on('mouseleave', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            $(`#rclick`).empty();
        });
        $(`.utter_node_in_list`).on('mouseup', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            const overed_node = e.target;
            if(overed_node.getAttribute('network_on') === '0' && mousedownId !== null && mousedownId !== overed_node.getAttribute('id') && overed_node.getAttribute('speaker') === document.getElementById(mousedownId).getAttribute('speaker')){
                union_utterance(mousedownId, overed_node.getAttribute('id'))
            }
        });
        $(`.utter_node_in_list`).on('mouseenter', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上に入った）を追加
            const overed_node = e.target;
            timedisplay_area.html(overed_node.getAttribute('timestamp'));
        });
        $(`.utter_node_in_list`).on('mouseleave', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            const overed_node = e.target;
            timedisplay_area.empty();
        });
        $(`.utter_node_in_list`).on('click', (e) => {
            // リスト内の発話ノードにマウスイベント(右クリック)を追加
            document.getElementById("rclick").innerHTML="";
            const clicked_node = e.target;
            if(clicked_node.getAttribute('network_on') === '0'){
                document.getElementById("rclick").innerHTML="<input type='button' id='utteranceNodebutton' value='ノードに追加'>";
                $(`#utteranceNodebutton`).on("click", () => {
                    defaultForestMRN.addutteranceNode(clicked_node.getAttribute('utterance'));
                    document.getElementById("rclick").innerHTML="";
                    clicked_node.setAttribute('network_on', "1");
                    document.getElementById(clicked_node.getAttribute('id')).style.background="gray";
                    update_text_on(clicked_node.getAttribute('id'));
                });
            }
        });      
        $(`.utter_node_in_list`).on('contextmenu', (e) => {
            // リスト内の発話ノードにマウスイベント(右クリック)を追加
            const clicked_node = e.target;
            timedisplay_area.empty();
            // rightclick()
        });
        $('#utterance_area').on('mouseenter', '.utter_node_in_list', (e) => {
            console.log("いえ〜い");
        });
          
        document.getElementById("accordion_discussion").innerHTML = "";      
    });
}

//ロードする時
//display_target_area_id: 表示するエリアのID。target_reflection_time: 表示したい時間帯のデータを取得するための引数。
const displayDiscussionMapData = (display_target_area_id, target_reflection_time) => {
    console.log("window.onload - objectMapId:"); // window.onload時にobjectMapIdを表示
    loadMapLabel(); // マップデータをロード
    getLatestMapID((mapID) => {
        console.log("getLatestMapID コールバック開始");  // コールバックが呼ばれたことを確認
        console.log("取得した最新の mapID:", mapID);  // 取得した mapID を確認
    
        object_map_id = mapID;
        console.log("object_map_id に設定した値:", object_map_id);  // object_map_id に代入された値を確認
    
        // object_map_id を使用して updateObjectMapData 関数を呼び出し
        updateObjectMapData(object_map_id);  
        console.log("updateObjectMapData 関数を呼び出し。引数:", object_map_id);  // 関数呼び出しの直前
    
        console.log("更新後の mapID:", mapID);  // もう一度、mapIDの値を確認
    });
    
    // 指定した時間（指定なしなら最新）のマップに対応する発話ノードリストを取得して画面上に配置
    const target_area = $(`#${display_target_area_id}`); // 発話ノードリストのDOMエリア
    const timedisplay_area = $(`#timedisplay`); // 発話ノードの議論内での時間を表示するエリア
    let mousedownId = null;
    //データベースから指定時間の発話データを取得。
    //データが存在する場合、dnode 内の各ノードを addReloadNode 関数でリロード。
    getDiscussionMapDataFromDB(null, null, (utterance_list_info) => {
        console.log("utterance_list_info:", utterance_list_info);
        //utterance_listチェック
        if (utterance_list_info && Array.isArray(utterance_list_info.dnode)) {
            utterance_list_info.dnode.forEach((n) => {
                if (n.object_node_id) {
                    // object_node_id を node_id として渡す
                    defaultForestMRN.addReloadNode(n.object_node_id, n.label, n.object_nodes_type, n.x, n.y, n.status);
                } else {
                    console.warn("Node ID is undefined, skipping this node:", n);
                }
            });
        } else {
            console.error("dnode is undefined or not an array:", utterance_list_info.dnode);
        }

        if (utterance_list_info && Array.isArray(utterance_list_info.dedge)) {
            utterance_list_info.dedge.forEach((n) => {
                if (n.object_edges_id) {
                    // `object_edges_id` を使用する
                    defaultForestMRN.addReloadEdge(n.object_edges_id, n.edge_start, n.edge_end);
                } else {
                    console.warn("edges ID is undefined, skipping this edge:", n);
                }
            });
        } else {
            console.error("deges is undefined or not an array:", utterance_list_info.dnode);
        }
        // データの取得と挿入
        utterance_list_info.objectLog.map(u => {
            // 関数呼び出し前のデバッグログ
            // console.log(`makeLogに渡すデータ:
            //     node_id: ${u.node_id},
            //     timestamp: ${u.timestamp},
            //     text: ${u.text},
            //     act: ${u.act}`);
        
            const log = makeLog(u.timestamp, u.text, u.act, u.type,u.object_map_id);
        
            // 関数呼び出し後のデバッグログ
            console.log("生成されたDOM:", u.timestamp, u.text, u.act, u.type);
        
            target_area.append(log); // 挿入            
        });
        
    }).then(() => {
        const accordionHeaders = document.querySelectorAll('#accordion_discussion .accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function () {
                const accordionItem = this.parentElement;
                accordionItem.classList.toggle('active');
            });
        });
        const feedbackarea = document.getElementsByClassName("accordion-item");
        for(var i=0; i<feedbackarea.length; i++){
            feedbackarea[i].style.display = "none";
        }
         $(`#utterance_area`).on('mousedown', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            mousedownId = null;
            const overed_node = e.target;
            if(overed_node.getAttribute('network_on')==='0'){
                mousedownId = overed_node.getAttribute('id');
            }
         });
         $(`#utterance_area`).on('mouseleave', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            $(`#rclick`).empty();
        });
        $(`.utter_node_in_list`).on('mouseup', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            const overed_node = e.target;
            if(overed_node.getAttribute('network_on') === '0' && mousedownId !== null && mousedownId !== overed_node.getAttribute('id') && overed_node.getAttribute('speaker') === document.getElementById(mousedownId).getAttribute('speaker')){
                union_utterance(mousedownId, overed_node.getAttribute('id'))
            }
        });
        $(`.utter_node_in_list`).on('mouseenter', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上に入った）を追加
            const overed_node = e.target;
            timedisplay_area.html(overed_node.getAttribute('timestamp'));
        });
        $(`.utter_node_in_list`).on('mouseleave', (e) => {
            // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
            const overed_node = e.target;
            timedisplay_area.empty();
        });
        $(`.utter_node_in_list`).on('click', (e) => {
            // リスト内の発話ノードにマウスイベント(右クリック)を追加
            document.getElementById("rclick").innerHTML="";
            const clicked_node = e.target;
            if(clicked_node.getAttribute('network_on') === '0'){
                document.getElementById("rclick").innerHTML="<input type='button' id='utteranceNodebutton' value='ノードに追加'>";
                $(`#utteranceNodebutton`).on("click", () => {
                    defaultForestMRN.addutteranceNode(clicked_node.getAttribute('utterance'));
                    document.getElementById("rclick").innerHTML="";
                    clicked_node.setAttribute('network_on', "1");
                    document.getElementById(clicked_node.getAttribute('id')).style.background="gray";
                    update_text_on(clicked_node.getAttribute('id'));
                });
            }
        });
        $(`.utter_node_in_list`).on('contextmenu', (e) => {
            // リスト内の発話ノードにマウスイベント(右クリック)を追加
            const clicked_node = e.target;
            timedisplay_area.empty();
            // rightclick()
        });
        // ネットワークにイベントリスナーを追加
        utterance_list_info.dnode.on('hoverNode', function(event) {
            // ノードにカーソルが当たった時に「いえ〜い」を表示
            console.log("いえ〜い");
        });        
    });
}

// 議論時の発言を記録する関数
const recordMeetingUtteranceNodes = (utterances) => {
    $.ajax({
      url: "php/object_map_manager.php",
      type: "POST",
      data: {
        purpose: "record_meeting_utterance",
        utters: JSON.stringify(utterances),
      }
    }).success((r) => {
      console.log(r);
      displayUtteranceNodeInList("utterance_area2", null); 
    });
  }

// ロードした際の関数
window.addEventListener('load', () => {
    // 初期表示時点でいくつかのオブジェクトを非表示にする
    // document.getElementById("network_container").style.display="none";
    //document.getElementById("object_container").style.display="none";
    defaultForestMRN = new ForestMRN("mynetwork", "load");
    //setUploadedXMLData("meetingUtteranceXmlFileUploader", "uploaded_meeting_utterance_xml_concent_display_area");
    // 内省マップ編集ボタンにイベント付与
    $(`#mrnb_addNode`).on("click", e => {
        defaultForestMRN.addNewNode();
    });
    $(`#mrnb_addGoal`).on("click", e => {
        defaultForestMRN.addNewGoal();
    });
    $(`#mrnb_addStep`).on("click", e => {
        defaultForestMRN.addNewStep();
    });
    // $(`#mrnb_removeNode`).on("click", e => {
    //     defaultForestMRN.deleteNode();
    // });
    $(`#mrnb_removeNode`).on("click", e => {
        defaultForestMRN.deleteGoal();
    });
    $(`#mrnb_startEditEdge`).on("click", e => {
        defaultForestMRN.SelectEditEdge();
    });
    $(`#mrnb_removeEdge`).on("click", e => {
        defaultForestMRN.deleteEdge();
    });
    $(`#mrnb_ZoomIn`).on("click", e => {
        defaultForestMRN.zoomIn();
    });
    $(`#mrnb_ZoomOut`).on("click", e => {
        defaultForestMRN.zoomOut();
    });
    displayDiscussionMapData("utterance_area2", null); // 最新の議論内省マップの発話リストを表示
    // 内省マップ編集ボタンにイベント付与
    $(`#mrnb_addNode`).on("click", e => {
        defaultForestMRN.addNewNode();
    });
    // $(`#mrnb_removeNode`).on("click", e => {
    //     defaultForestMRN.deleteNode();
    // });
    $(`#mrnb_removeNode`).on("click", e => {
        defaultForestMRN.deleteGoal();
    });
    // $(`#mrnb_startEditEdge`).on("click", e => {
    //     defaultForestMRN.SelectEditEdge();
    // });
    $(`#mrnb_removeEdge`).on("click", e => {
        defaultForestMRN.deleteEdge();
    });
    $(`#mrnb_ZoomIn`).on("click", e => {
        defaultForestMRN.zoomIn();
    });
    $(`#mrnb_ZoomOut`).on("click", e => {
        defaultForestMRN.zoomOut();
    });

    $("#past_time_select_button").on("click", () => {
        // ファイルアップロードボタンにアップロードイベントを付与
        select_time();
    });
    const accordionHeaders = document.querySelectorAll('#accordion_discussion .accordion-header');
    accordionHeaders.forEach(header => {
      header.addEventListener('click', function () {
        const accordionItem = this.parentElement;
        accordionItem.classList.toggle('active');
      });
    });
});


