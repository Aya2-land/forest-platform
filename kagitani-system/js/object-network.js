// 議論内省マップに関する処理プログラム
let defaultThinkingProcess;
let defaultRecordThinkingProcess;
let defaultShowThinkingProcess;
let globalParams = null; //クリックされたネットワークノード

// グローバルスコープに移動

class ThinkingProcess { // forestMRN: forest Meeting Reflection Network
    constructor(container, load) {
        // this.ownNetwork = this.generateThinkingProcessNetworkCanvas(container, {}, {}); // デフォルトのマップを表示

        defaultRecordThinkingProcess = new RecordThinkingProcess();
        this.nodes = new vis.DataSet();
        this.edges = new vis.DataSet();
        this.options = {
	        physics: false,
            nodes: {
                margin: 10,
                widthConstraint: {
                    maximum: 150
                },
            },
	        edges: {
		        arrows: 'to', // エッジに矢印を付けて有向グラフにする
		        smooth: false // falseにするとエッジが直線になる
            },
            interaction: {
                multiselect: false,
                zoomView: false, // グラフの拡大縮小を無効にする
                tooltipDelay: 200,
                hideEdgesOnDrag: false,
                hideNodesOnDrag: false
            },
            configure: {
                enabled: false
            },
            // HTMLツールチップを有効にする
            tooltip: {
                delay: 200,
                fontSize: 12,
                fontColor: 'black',
                fontBackground: 'white'
            }
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
        this.ReasonNodeId = []; //理由ノードのノードID
        this.ReasonConnectNodeId = []; //理由ノードと対応づいているノードID
        this.ReasonContent = []; //理由ノードの内容を保存する配列
        this.TimeNodeId = []; //完了予定ノードのノードID
        this.TimeConnectNodeId = []; //完了予定ノードと対応づいているノードID
        this.TimeContent = []; //完了予定ノードの内容を保存する配列
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
        this.ownNetwork = this.generateThinkingProcessNetworkCanvas(container, this.nodes, this.edges); // デフォルトのマップを表示
        this.choose_input_xmlLoad();
        // カスタムツールチップの設定
        this.setupCustomTooltip();
        if(load == "load"){
            this.jmindex = [];
            this.addEventLister();
            $(`#jsmind_container`).on('click',this.connect_mindmap.bind(this));
            $(`#object_conmenu1`).on('click', this.step_start.bind(this));
            $(`#object_conmenu2`).on('click',this.step_end.bind(this));
            $(`#object_conmenu3`).on('click',this.step_paused.bind(this));
            $(`#process_conmenu1`).on('click',this.show_select.bind(this));
            $(`#process_conmenu2`).on('click',this.connect_network.bind(this));
            $(`#process_conmenu3`).on('click',this.Recruit_Idea.bind(this));
            $(`#process_conmenu4`).on('click',this.ContentmenuCancel.bind(this));
            $(`#process_conmenu5`).on('click',this.show_reason_input.bind(this));
            $(`#p_ontology_select`).on('click',this.addontology.bind(this));
            $(`#p_recruit_select`).on('click',this.Selected_Recruit_Idea.bind(this));
            $(`#t_p_ontology_select`).on('click',this.addontology.bind(this));
            $(`#t_p_recruit_select`).on('click',this.Selected_Recruit_Idea.bind(this));
            $(`#t_p_reason_select`).on('click',this.add_reason.bind(this));
            $(`#t_p_reason_cancel`).on('click',this.cancel_reason_input.bind(this));
            this.ownNetwork.on('click', this.networkClick.bind(this));
            this.ownNetwork.on('dragStart', this.dragstart.bind(this));
            this.ownNetwork.on('dragEnd', this.dragend.bind(this));
            this.ownNetwork.on('doubleClick', this.doubleclick.bind(this));
            this.ownNetwork.on("oncontext", this.onContext.bind(this));
            this.ownNetwork.on('select', this.selectdelete.bind(this));
        }
        this.choose_input_xmlLoad();
    }


    choose_input_xmlLoad(){
        $.ajax({
            url:'js/hozo.xml',
            type:'get',
            dataType:'xml',
            timeout:1000,
            success:this.choose_input_parse_xml.bind(this)
        });
    }

    choose_input_parse_xml(xml,status){
        if(status!='success')return;
        const XML = $(xml).find('W_CONCEPTS');
        const label = Array.from(XML[0].getElementsByTagName('LABEL'));
        const isa = Array.from(XML[0].getElementsByTagName('ISA'));
        const rationaly_record = (return_slot) => {
            let rationaly_label;
            let input_count = 0;
            for(var i=0; i<return_slot.length; i++){
                if(return_slot[i].getAttribute("role") === "入力"){
                    label.map((content_label2) => {
                        if(return_slot[i].getAttribute('class_constraint') === content_label2.childNodes[0].nodeValue){
                            const slot_content = Array.from(content_label2.parentNode.getElementsByTagName("SLOT"));
                            slot_content.map((content_slot2) => {
                                if(content_slot2.getAttribute("role") === "出力"){
                                    if(!this.output_list.includes(content_slot2.getAttribute("class_constraint"))) {
                                        this.output_list.push(content_slot2.getAttribute("class_constraint"));
                                    }
                                    if(input_count == 0){
                                        rationaly_label = content_slot2.getAttribute("class_constraint");
                                    }else{
                                        this.output_input[rationaly_label] = content_slot2.getAttribute("class_constraint");
                                        this.output_input[content_slot2.getAttribute("class_constraint")] = rationaly_label;
                                    }
                                }
                            });
                        return;
                        }
                    });
                    input_count += 1;
                }
            }
        }
        //hozo.xmlファイルのタグを検索して変数に格納（たぶん，全てのタグが配列で格納されている），thisはhozo.xmlのことかな
        isa.map((content)=>{
            if(content.getAttribute('parent') === "合理性を考える"){
                label.map((content_label) => {
                    if(content.getAttribute('child') === content_label.childNodes[0].nodeValue){
                        rationaly_record(Array.from(content_label.parentNode.getElementsByTagName("SLOT")))
                        return;
                    }
                })
            }
        });
        const selectElement = document.getElementById("selectionlist");
        while (selectElement.options.length > 0) {
            selectElement.remove(0);
        }
        this.output_list.map((n) => {
            const optionElement = document.createElement('option');
            optionElement.value = n;
            optionElement.text = n;
            selectElement.appendChild(optionElement);
        })
        
        // t_Process用の選択リストも同様に更新
        const tProcessSelectElement = document.getElementById("t_Process_selectionlist");
        if (tProcessSelectElement) {
            while (tProcessSelectElement.options.length > 0) {
                tProcessSelectElement.remove(0);
            }
            this.output_list.map((n) => {
                const optionElement = document.createElement('option');
                optionElement.value = n;
                optionElement.text = n;
                tProcessSelectElement.appendChild(optionElement);
            })
        }
    }

    //オントロジーノードを選択不可に
    selectdelete(params) {
        if (this.nodes.get(params.nodes[0]).shape == "ellipse") {
            // 選択を解除
            this.ownNetwork.setSelection({ nodes: [] });
        }
    }

    addEventLister(){
        this.bindconnect_mindmap = this.connect_mindmap.bind(this);
        this.bindshow_select = this.show_select.bind(this);
        this.bindconnect_network = this.connect_network.bind(this);
        this.bindstep_start = this.step_start.bind(this); //kagitani
        this.bindstep_paused = this.step_paused.bind(this); //kagitani
        this.bindstep_end = this.step_end.bind(this); //kagitani
        this.bindContentmenuCancel = this.ContentmenuCancel.bind(this);
        this.bindaddontology = this.addontology.bind(this);
        this.bindshow_reason_input = this.show_reason_input.bind(this);
        this.bindadd_reason = this.add_reason.bind(this);
        this.bindcancel_reason_input = this.cancel_reason_input.bind(this);
        this.bindshow_time_input = this.show_time_input.bind(this);
        this.bindadd_time = this.add_time.bind(this);
        this.bindcancel_time_input = this.cancel_time_input.bind(this);
        this.bindSelected_Recruit_Idea = this.Selected_Recruit_Idea.bind(this);
        this.bindRecruit_Idea = this.Recruit_Idea.bind(this);
        $(`#jsmind_container`).on('click',this.bindconnect_mindmap);
        $(`#object_conmenu1`).on('click',this.bindstep_start);
        $(`#object_conmenu2`).on('click',this.bindstep_end);
        $(`#object_conmenu3`).on('click', this.bindstep_paused);
        $(`#net_conmenu02`).on('click', this.bindstep_end);
        $(`#process_conmenu1`).on('click',this.bindshow_select);
        $(`#process_conmenu2`).on('click',this.bindconnect_network);
        $(`#process_conmenu3`).on('click',this.bindRecruit_Idea);
        $(`#process_conmenu4`).on('click',this.bindContentmenuCancel);
        $(`#process_conmenu5`).on('click',this.bindshow_reason_input);
        $(`#process_conmenu6`).on('click',this.bindshow_time_input);
        $(`#p_ontology_select`).on('click',this.bindaddontology);
        $(`#p_recruit_select`).on('click',this.bindSelected_Recruit_Idea);
        $(`#t_p_ontology_select`).on('click',this.bindaddontology);
        $(`#t_p_recruit_select`).on('click',this.bindSelected_Recruit_Idea);
        $(`#t_p_reason_select`).on('click',this.bindadd_reason);
        $(`#t_p_reason_cancel`).on('click',this.bindcancel_reason_input);
        $(`#t_p_time_select`).on('click',this.bindadd_time);
        $(`#t_p_time_cancel`).on('click',this.bindcancel_time_input);
    }

    removeEventLister(){
        $(`#jsmind_container`).off('click',this.bindconnect_mindmap);
        $(`#object_conmenu1`).off('click',this.bindstep_start);
        $(`#object_conmenu2`).off('click',this.bindstep_end);
        $(`#object_conmenu3`).off('click', this.bindstep_paused);
        $(`#net_conmenu02`).off('click', this.bindstep_end);
        $(`#process_conmenu1`).off('click',this.bindshow_select);
        $(`#process_conmenu2`).off('click',this.bindconnect_network);
        $(`#process_conmenu3`).off('click',this.bindRecruit_Idea);
        $(`#process_conmenu4`).off('click',this.bindContentmenuCancel);
        $(`#process_conmenu5`).off('click',this.bindshow_reason_input);
        $(`#process_conmenu6`).off('click',this.bindshow_time_input);
        $(`#p_ontology_select`).off('click',this.bindaddontology);
        $(`#p_recruit_select`).off('click',this.bindSelected_Recruit_Idea);
        $(`#t_p_ontology_select`).off('click',this.bindaddontology);
        $(`#t_p_recruit_select`).off('click',this.bindSelected_Recruit_Idea);
        $(`#t_p_reason_select`).off('click',this.bindadd_reason);
        $(`#t_p_reason_cancel`).off('click',this.bindcancel_reason_input);
        $(`#t_p_time_select`).off('click',this.bindadd_time);
        $(`#t_p_time_cancel`).off('click',this.bindcancel_time_input);
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
        this.edgeEditMode = !this.edgeEditMode;
        if(this.edgeEditMode){
            this.enableEditEdge();
        }else{
            this.disableEditEdge();
        }
    }

    //エッジ編集できる場合の処理
    enableEditEdge() {
        // エッジを編集するときは，ノードの動きを止める
        document.getElementById("process_startEditEdge").value="エッジ追加終了";
        this.nodes.update(this.nodes.map(n => {
            return { ...n, fixed: true };
        }));     
    }

    //エッジ編集できない場合の処理
    disableEditEdge() {
        document.getElementById("process_startEditEdge").value="エッジ追加";
        // エッジの編集モードを抜けたときは，ノードの動きを再度始める（ただし，タグノードはFixedにしておく）
        this.edgeEditMode = false;
        this.nodes.update(this.nodes.map(n => {
            return n.type !== "topic-tag" ? { ...n, fixed: false } : { ...n, fixed: true };
        }))
    }

    /*
     * 議論内省マップの表示・操作部分（Extend vis.js）
     */
    generateThinkingProcessNetworkCanvas (canvas_dom_id, nodes, edges) {
        // マップを表示

        this.setNodes(nodes);
        this.setEdges(edges);

        return new vis.Network(
            document.getElementById(canvas_dom_id),
            {
                nodes: nodes,
                edges: edges,
            },
            this.options
        );

        // this.setCanvasOptions(load);
        // return network;
    }

    /*
     * ノードの操作
     */
    //手段ノードの追加
    addNode(node_id, node_label, node_type, node_x, node_y) {
        let node_color = '#d6f5d6'; // ノードの背景色
        let node_shape = 'box';     // ノードの形状
        let text_color = 'black';   // ノード内文字列の色
        let position_fixed = false;   // ノードを動かせるかどうか（Falseなら動かせる）

        // 理由タグノードの場合の色設定
        if (node_type === "reason-tag") {
            node_color = '#FF8C00'; // オレンジ色（濃いめ）
            node_shape = 'circularImage'; // アイコン形状
            text_color = 'white';  // 白い文字（見やすくするため）
            position_fixed = true;   // 固定位置
        }

        let result_label = '';
        // 理由タグノードの場合はアイコンラベルを使用
        if (node_type === "reason-tag") {
            result_label = '?';
        } else {
            for (let i = 0; i < node_label.length; i += 10) {
                result_label += node_label.substr(i, 10) + '\n';
            }
            result_label = result_label.trim(); // 末尾の不要な改行を除去
        }
        
        const newNode = {
            id: node_id,
            label: result_label,
            group: node_type,
            color: node_color, 
            shape: node_shape,
            font: { color: text_color },
            fixed: position_fixed,
            x: node_x, y: node_y, 
            status: "todo"
        };

        // 理由タグノードの場合はアイコン画像を追加
        if (node_type === "reason-tag") {
            newNode.image = '../image/question_agent.png';
            newNode.size = 20;
            newNode.title = `なぜそれを取り組もうとしたか: ${node_label}`;
        }
        this.nodes.add(newNode);
        const boundingBox = this.ownNetwork.getBoundingBox(node_id);
        node_y += Math.floor(((boundingBox.bottom)-(boundingBox.top))/2);
        this.nodes.update({
            id : node_id,
            color: node_color,
            shape: node_shape,
            font: { color: text_color },
            y : node_y
        });
        const boundingBoxupdate = this.ownNetwork.getBoundingBox(node_id);
        this.latest_selected_node_info.x = node_x;
        this.latest_selected_node_info.y = boundingBoxupdate.bottom+10;
        defaultRecordThinkingProcess.record_Node(node_id, node_label, node_type, node_x, node_y,status);
        console.log(this.nodes);
        return this.nodes;
    }
    

    // ノードの追加（リロード用）(完了)
    addReloadNode(node_id, node_label, node_type, node_x, node_y, status, purpose = null, action_reason = null, completion_reason = null, challenges_learnings = null, estimated_time = null) {
        const existingNode = this.nodes.get(node_id);
        if (existingNode) {
            console.log(`Node with ID ${node_id} already exists. Skipping addition.`);
            return; // 重複がある場合は追加せずにリターン
        }

        let node_color = '#d6f5d6'; // デフォルトの背景色
        let node_shape = 'box';
        let text_color = 'black';
        let position_fixed = false;
        let border_width = 1;
        let border_width_selected = 2;
        let shape_border_dashes = false;

        // ステータスに応じて色や枠線を設定
        switch (status) {
            case "inProgress":
                node_color = 'orange';
                border_width = 3;
                border_width_selected = 5;
                shape_border_dashes = [10, 5];
                break;
            case "paused":
                node_color = 'LightCoral';
                border_width = 3;
                border_width_selected = 5;
                shape_border_dashes = [5, 5];
                break;
            case "completed":
                node_color = 'gray';
                border_width = 3;
                border_width_selected = 5;
                shape_border_dashes = false;
                break;
            default:
                node_color = '#d6f5d6';
                break;
        }

        // 改行処理
        let result_label = '';
        for (let i = 0; i < node_label.length; i += 10) {
            result_label += node_label.substr(i, 10) + '\n';
        }
        result_label = result_label.trim();

        // ツールチップの設定（理由と内省情報がある場合）
        let tooltip = result_label;
        if (purpose && purpose.trim() !== '') {
            tooltip += '\n\n理由: ' + purpose;
        }
        if (action_reason || completion_reason || challenges_learnings) {
            tooltip += '\n\n内省情報:';
            tooltip += '\n行動意図: ' + (action_reason || '未記入');
            tooltip += '\n完了基準: ' + (completion_reason || '未記入');
            tooltip += '\n学び: ' + (challenges_learnings || '未記入');
        }

        // ノード作成
        const newNode = {
            id: `${node_id}`,
            label: result_label,
            group: node_type,
            color: node_color,
            shape: node_shape,
            font: { color: text_color },
            fixed: position_fixed,
            x: node_x, y: node_y,
            borderWidth: border_width,
            borderWidthSelected: border_width_selected,
            shapeProperties: {
                borderDashes: shape_border_dashes
            },
            title: tooltip
        };

        defaultThinkingProcess.nodes.add(newNode);

        // 理由がある場合、オレンジ色の理由タグを追加
        if (purpose && purpose.trim() !== '') {
            // ノードが追加された後にBoundingBoxを取得して正確な位置を計算
            setTimeout(() => {
                const nodeBoundingBox = defaultThinkingProcess.ownNetwork.getBoundingBox(`${node_id}`);
                const reasonTagId = `reason-tag-${node_id}`;
                const reasonTag = {
                    id: reasonTagId,
                    label: '?',
                    shape: 'circularImage',
                    image: '../image/question_agent.png',
                    size: 20,
                    color: {
                        background: 'orange',
                        border: 'darkorange'
                    },
                    x: nodeBoundingBox.left + 8,
                    y: nodeBoundingBox.top + 8,
                    fixed: true,
                    physics: false,
                    group: 'reason-tag',
                    title: '理由: ' + purpose
                };
                defaultThinkingProcess.nodes.add(reasonTag);
            }, 100);
        }

        // 完了予定がある場合、緑色の時間タグを追加（ノードの左下）
        if (estimated_time && estimated_time.trim() !== '') {
            setTimeout(() => {
                const nodeBoundingBox = defaultThinkingProcess.ownNetwork.getBoundingBox(`${node_id}`);
                const timeTagId = `time-tag-${node_id}`;
                const timeTag = {
                    id: timeTagId,
                    label: '🕒',
                    shape: 'ellipse',
                    size: 20,
                    color: {
                        background: 'lightgreen',
                        border: 'green'
                    },
                    font: { 
                        size: 14,
                        color: 'darkgreen'
                    },
                    x: nodeBoundingBox.left + 8,
                    y: nodeBoundingBox.bottom - 8,
                    fixed: true,
                    physics: false,
                    group: 'time-tag',
                    title: '完了予定: ' + estimated_time
                };
                defaultThinkingProcess.nodes.add(timeTag);
            }, 100);
        }

        // 内省情報がある場合、青色の内省タグを右上に追加
        if (action_reason || completion_reason || challenges_learnings) {
            setTimeout(() => {
                const nodeBoundingBox = defaultThinkingProcess.ownNetwork.getBoundingBox(`${node_id}`);
                const reflectionTagId = `reflection-tag-${node_id}`;
                const reflectionTitle = `行動意図: ${action_reason || "未記入"}\n完了基準: ${completion_reason || "未記入"}\n学び: ${challenges_learnings || "未記入"}`;
                const reflectionTag = {
                    id: reflectionTagId,
                    label: '💭',
                    shape: 'ellipse',
                    size: 20,
                    color: {
                        background: 'lightblue',
                        border: 'blue'
                    },
                    font: { 
                        size: 14,
                        color: 'darkblue'
                    },
                    x: nodeBoundingBox.right - 8,
                    y: nodeBoundingBox.top + 8,
                    fixed: true,
                    physics: false,
                    group: 'reflection-tag',
                    title: reflectionTitle
                };
                defaultThinkingProcess.nodes.add(reflectionTag);
            }, 100);
        }

        const boundingBox = defaultThinkingProcess.ownNetwork.getBoundingBox(`${node_id}`);
        defaultThinkingProcess.latest_selected_node_info.x = node_x;
        defaultThinkingProcess.latest_selected_node_info.y = boundingBox.bottom + 10;

        return defaultThinkingProcess.nodes;
    }


    addVersionNode(node_id, node_l, node_type, appeared_at, node_x, node_y){
        const existingNode = defaultThinkingProcess.nodes.get(node_id);
        if (existingNode) {
            console.log(`Node with ID ${node_id} already exists. Skipping addition.`);
            return; // 重複がある場合は追加せずにリターン
        }
        let node_color = '#ffbaa1'; // ノードの背景色
        let node_shape = 'box';     // ノードの形状
        let text_color = 'black';   // ノード内文字列の色
        var y_fixed = true;
        let node_label;
        
        if(node_l == '<select name="change_labels" id="select_labels"><optgroup label="ラベル付与"><option value="node_labels">ラベル選択</option>          <option value="primary_label">主軸</option></optgroup><optgroup label="----L主軸"><option value="pl_1">---L有用性</option><option value="pl_2">---L新規性</option> <option value="pl_3">---L信頼性</option><option value="pl_0">---Lその他</option>                   </optgroup>              <option value="issue_label">課題</option> <optgroup label="----L未検討"> <option value="il_non_1">---L語の妥当性</option><option value="il_non_2">---L証拠の十分性</option><option value="il_non_3">---L論理の整合性</option><option value="il_non_0">---Lその他</option></optgroup><optgroup label="----L再検討"> <option value="il_re_1">---L語の妥当性</option><option value="il_re_2">---L証拠の十分性</option><option value="il_re_3">---L論理の整合性</option><option value="il_re_0">---Lその他</option></optgroup><option value="cl_0">整合性</option></select>'){
            node_label = "【ラベル選択】";
        }else{
            node_label = node_l
        }

        if(node_type == "versionsBro"){
            node_color = '#ffd7c9'; // ノードの背景色
            y_fixed = false;
        }

        const newNode = {
            id: `${node_id}`,
            label: node_label,
            group: node_type,
            color: node_color,
            shape: node_shape,
            font: { color: text_color },
            fixed: {y: y_fixed },
            x: node_x, y: node_y, 
        };
        // console.log(newNode);
        
        defaultThinkingProcess.nodes.add(newNode);
        return defaultThinkingProcess.nodes;
    }

    addVersionEdge(from_node_id, to_node_id){
        // let node_color = 'orange'; // ノードの背景色
        // let node_shape = 'box';     // ノードの形状
        // let text_color = 'black';   // ノード内文字列の色
        const newEdge = {
            from: from_node_id,
            to: to_node_id,
            group: "versionEdges",
            fixed: true,
        };
        defaultThinkingProcess.edges.add(newEdge);
        return defaultThinkingProcess.edges;

    }

    addTriggerNode(flag, trigger_id, edge_id, from_node, to_node, activity_id, t_label, t_type, t_time, node_x, node_y){
        let color = '#82ae46'; // ノードの背景色
        let node_shape = 'circularImage';     // ノードの形状
        var DIR_img = "../image/triggers/"; //ノードのアイコンとなる画像のパス
        let image = "thinking.png"; 
        const t_title = document.createElement("div");  // titleのHTML

        if(!activity_id){
            color = '#60bfa3'; // ノードの背景色
        }

        t_title.innerHTML = "<div id='" + trigger_id + "' class='trigger_title' timestamp='" + t_time + "'><b>"+t_type+"</b></br>" + t_label + " </div>";
        if(!node_x){
            node_x = (defaultThinkingProcess.nodes.get(from_node).x + defaultThinkingProcess.nodes.get(to_node).x ) /2; //ノードがversionの間に来るように
        }
        if(!node_y){
            node_y = Math.floor(Math.random()*200)-100;
        }

        //triggerとなった活動ごとにアイコンを変更
        switch(t_type) {
            case "自己内対話": //自己内対話
                break;
            case "議論資料作成": //議論資料作成
                image = "writing.png";
                break;
            case "議論内省": //議論内省
                image = "meeting.png";
                break;
            case "論文読解": //論文読解
                image = "reading.png";
                break;
            case "論文執筆": //論文執筆
                image = "writing-scholar.png";
                break;
            default: // その他
                break;
        }

        // trigger_fromの設定
        if(defaultThinkingProcess.edges.get(edge_id).group == "trigger_from"){
            // エッジの先がtrigger_nodeならその先のversion_nodeに繋ぐ
            //　trigge自身を指す新しいエッジを追加
            const newEdge = {
                from: from_node,
                to: trigger_id,
                arrows: 'dynamic',
                color: color,
                group: "trigger_from",
                smooth: true,
                fixed: true,
            };
            defaultThinkingProcess.edges.add(newEdge);

        }else{
            // 既存のversionEdgeをtrigger自身を指すようにエッジを繋ぎかえ
            const update_edge = defaultThinkingProcess.edges.get(edge_id);
            update_edge.arrows = 'dynamic';
            update_edge.color = color;
            update_edge.to = trigger_id;
            update_edge.group = "trigger_from";
            update_edge.smooth = true;
            defaultThinkingProcess.edges.update(update_edge);
        }

        //　trigger_toの設定
        const newEdge = {
            from: trigger_id,
            to: to_node,
            arrows: 'dynamic',
            color: color,
            group: "trigger_to",
            smooth: true,
            fixed: true,
        };
        defaultThinkingProcess.edges.add(newEdge);

        //triggerとなるノードを追加
        const newNode = {
            id: trigger_id,
            label: t_time,
            title: t_title,
            group: "trigger",
            type: t_type,
            color: color,
            shape: node_shape,
            image: DIR_img + image,
            imagePadding: 7,
            fixed: false,
            x: node_x, y: node_y,
        };
        defaultThinkingProcess.nodes.add(newNode);

        if(flag == "New"){
            defaultRecordThinkingProcess.record_trigger(trigger_id, activity_id, from_node, to_node, t_time, t_type, t_label, node_x, node_y);
        }

        return defaultThinkingProcess.edges, defaultThinkingProcess.nodes;
    }

    addReloadEdge(edge_id, edge_start, edge_end, edge_label) {
        this.edges.add({id: edge_id, from: edge_start, to: edge_end ,label: edge_label});
    }

    //未完成　ノード追加
    addNewNode() {
        this.addNode(this.generateUniqueNumberText(), "newNode", "step", this.latest_selected_node_info.x, this.latest_selected_node_info.y);
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
            defaultRecordThinkingProcess.update_Node("label", node_id, node_content, "");
        }
    }

    //ダブルクリック時編集(完了)
    doubleclick (params) {
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

    // ノード削除(完了)
    deleteNode (){
        const selectNodeId = this.ownNetwork.getSelection().nodes[0];
        if(selectNodeId !== undefined){
            console.log(defaultThinkingProcess.nodes.get(selectNodeId));
            const node_group = defaultThinkingProcess.nodes.get(selectNodeId).group;
            console.log(node_group);
            if(node_group == "trigger"){
                defaultRecordThinkingProcess.delete_trigger_Node(selectNodeId);
            }else{
                defaultRecordThinkingProcess.delete_db_Node(selectNodeId);
            }
            defaultRecordThinkingProcess.delete_db_Edge(null, selectNodeId, "");
            defaultRecordThinkingProcess.delete_db_Edge(null, "", selectNodeId);

            this.edges.remove(this.ownNetwork.getConnectedEdges(selectNodeId));
            this.nodes.remove({id: selectNodeId});
            const ontology_index = this.OntologyConnectNodeId.indexOf(selectNodeId);
            if(ontology_index !== -1){
                this.nodes.remove({ id: this.OntologyNodeId[ontology_index]});
                defaultRecordThinkingProcess.delete_db_Node(this.OntologyNodeId[ontology_index]);
                this.OntologyNodeId.splice(ontology_index, 1);
                this.OntologyConnectNodeId.splice(ontology_index, 1);
            }
            // 理由の関連付けも削除
            const reason_index = this.ReasonConnectNodeId.indexOf(selectNodeId);
            if(reason_index !== -1){
                // 理由ノードも削除
                this.nodes.remove({ id: this.ReasonNodeId[reason_index]});
                defaultRecordThinkingProcess.delete_db_Node(this.ReasonNodeId[reason_index]);
                this.ReasonNodeId.splice(reason_index, 1);
                this.ReasonConnectNodeId.splice(reason_index, 1);
                this.ReasonContent.splice(reason_index, 1); // 理由内容も削除
            }
            // 理由タグも削除（リロード時のタグ）
            const reasonTagId = `reason-tag-${selectNodeId}`;
            const reasonTagNode = this.nodes.get(reasonTagId);
            if (reasonTagNode) {
                this.nodes.remove({ id: reasonTagId });
            }
            
            // 完了予定の関連付けも削除
            const time_index = this.TimeConnectNodeId.indexOf(selectNodeId);
            if(time_index !== -1){
                // 完了予定ノードも削除
                this.nodes.remove({ id: this.TimeNodeId[time_index]});
                defaultRecordThinkingProcess.delete_db_Node(this.TimeNodeId[time_index]);
                this.TimeNodeId.splice(time_index, 1);
                this.TimeConnectNodeId.splice(time_index, 1);
                this.TimeContent.splice(time_index, 1); // 完了予定内容も削除
            }
            // 時間タグも削除（リロード時のタグ）
            const timeTagId = `time-tag-${selectNodeId}`;
            const timeTagNode = this.nodes.get(timeTagId);
            if (timeTagNode) {
                this.nodes.remove({ id: timeTagId });
            }
            const connect_net_index = [];
            this.ConnectNetworkNodeId.map((n_id, index) => {
                if(n_id === selectNodeId){
                    connect_net_index.push(index);
                }
            });
            connect_net_index.sort((a, b) => b - a);
            connect_net_index.forEach(index => {
                this.ConnectNetworkNodeId.splice(index, 1);
                this.ConnectMindMapNodeId.splice(index, 1);
            });
            defaultRecordThinkingProcess.delete_connection(selectNodeId);
        }
    }

    // 右クリック時
    onContext(params) {
        this.nodeConnectEnabled = false;

        if (params.nodes.length == 1) {
            const NetworkMenu = document.getElementById('t_Process_conmenu');
            this.selectId = params.nodes[0]; // ここで選択されたノードIDを設定
            console.log(`右クリックされたノードID: ${this.selectId}`); // デバッグ用ログ
            const pointerX = params.pointer.DOM.x;
            const pointerY = params.pointer.DOM.y;
            const mynetPosition = document.getElementById("myProcessnetwork2").getBoundingClientRect();
            this.BoxDisplay.x = pointerX + mynetPosition.left + 20;
            this.BoxDisplay.y = pointerY + mynetPosition.top + 20;
            NetworkMenu.style.left = this.BoxDisplay.x;
            NetworkMenu.style.top = this.BoxDisplay.y;
            NetworkMenu.style.display = "block";
            if(this.OntologyConnectNodeId.indexOf(this.selectId) !== -1){
                document.getElementById("process_conmenu3").style.display = "block";
            }
        }
    }

    //ラベルの選択（完了）
    show_select (){
        document.getElementById('t_Process_conmenu').style.display = "none";
        if(this.OntologyConnectNodeId.indexOf(this.selectId) !== -1){
            alert('このノードにはすでに概念がつけられているため概念付けできません');
            return;
        }
        const labelselect = document.getElementById("t_Process_labelselect");
        labelselect.style.display = "block";
        labelselect.style.left = this.BoxDisplay.x + "px";
        labelselect.style.top = this.BoxDisplay.y + "px";
        labelselect.style.position = "absolute";
        labelselect.style.zIndex = "1000";
    }

    ContentmenuCancel(){
        document.getElementById('t_Process_conmenu').style.display = "none";
    }

    //マインドマップとネットワークつなげる
    connect_network (){
        document.getElementById('t_Process_conmenu').style.display = "none";
        this.nodeConnectEnabled = true;
    }

    // マインドマップのノードがクリックされたときの処理
    connect_mindmap (e) {
        const Jsmind = new jsMind({container:'jsmind_container',
                                editable: false});
        if (!this.nodeConnectEnabled) {
            return;
        }else{
            const mm_nodeid = Jsmind.view.get_binded_nodeid(e.target);
            if(mm_nodeid == null){
                alert('ノードのクリックがうまくできませんでした．もう一度試してみてください');
                return;
            }else{
                if(this.ConnectNetworkNodeId.indexOf(this.selectId) !== -1 && this.ConnectMindMapNodeId.indexOf(mm_nodeid) !== -1){
                    alert('このノードはすでに選択されています');
                    return;
                }
                defaultRecordThinkingProcess.record_connection(this.selectId,mm_nodeid);
                this.ConnectNetworkNodeId.push(this.selectId);
                this.ConnectMindMapNodeId.push(mm_nodeid);
                this.nodeConnectEnabled = false;
            }
        }
    }

    //概念をマップに追加（概念選択なし版）
    addontology (){
        // 両方の選択ダイアログを非表示にする
        const labelselect = document.getElementById("labelselect");
        const tProcessLabelselect = document.getElementById("t_Process_labelselect");
        if (labelselect) labelselect.style.display = "none";
        if (tProcessLabelselect) tProcessLabelselect.style.display = "none";
        
        // 右クリックメニューを非表示にする
        document.getElementById('t_Process_conmenu').style.display = "none";
        
        // selectIdが設定されているかチェック
        if (!this.selectId) {
            console.error('selectIdが設定されていません:', this.selectId);
            //alert('ノードが選択されていません');
            return;
        }
        
        // すでに概念がつけられているかチェック
        if(this.OntologyConnectNodeId.indexOf(this.selectId) !== -1){
            //alert('このノードにはすでに概念がつけられているため概念付けできません');
            return;
        }
        
        // ノードが存在するかチェック
        const selectedNode = this.nodes.get(this.selectId);
        if (!selectedNode) {
            console.error('選択されたノードが見つかりません:', this.selectId);
            //alert('選択されたノードが見つかりません');
            return;
        }
        
        console.log('選択されたノード:', selectedNode);
        
        const nodeBoundingBox = this.ownNetwork.getBoundingBox(this.selectId);
        if (!nodeBoundingBox) {
            console.error('ノードの位置情報を取得できませんでした:', this.selectId);
            //lert('ノードの位置情報を取得できませんでした');
            return;
        }
        
        console.log('ノードの位置情報:', nodeBoundingBox);
        
        const TopicTagId = this.generateUniqueNumberText();
        
        // 概念選択機能
        // どちらの選択リストが使用されているかを判定
        let selectionlist = document.getElementById('selectionlist');
        let tProcessSelectionlist = document.getElementById('t_Process_selectionlist');
        let selectedValue = '';
        
        if (selectionlist && selectionlist.value) {
            selectedValue = selectionlist.value;
        } else if (tProcessSelectionlist && tProcessSelectionlist.value) {
            selectedValue = tProcessSelectionlist.value;
        }
        
        if (!selectedValue) {
            alert('概念を選択してください');
            return;
        }
        
        this.addNode(TopicTagId, selectedValue, "topic-tag", nodeBoundingBox.left, nodeBoundingBox.top);
        this.OntologyConnectNodeId.push(this.selectId);
        this.OntologyNodeId.push('topic-tag_'+TopicTagId);
        defaultRecordThinkingProcess.record_ontology(this.selectId, 'topic-tag_'+TopicTagId);
        
        // 選択をリセット
        if (selectionlist && selectionlist.options.length > 2) {
            selectionlist.options[2].selected = true;
        }
        if (tProcessSelectionlist && tProcessSelectionlist.options.length > 2) {
            tProcessSelectionlist.options[2].selected = true;
        }
    }

    //理由を記述する機能
    show_reason_input (){
        document.getElementById('t_Process_conmenu').style.display = "none";
        
        // selectIdが設定されているかチェック
        if (!this.selectId) {
            console.error('selectIdが設定されていません:', this.selectId);
            return;
        }
        
        const reasonselect = document.getElementById("t_Process_reasonselect");
        if (!reasonselect) {
            alert('理由入力ダイアログが見つかりません');
            return;
        }
        
        // テキストエリアをクリア
        document.getElementById("t_Process_reasontext").value = "";
        
        reasonselect.style.display = "block";
        reasonselect.style.left = this.BoxDisplay.x + "px";
        reasonselect.style.top = this.BoxDisplay.y + "px";
        reasonselect.style.position = "absolute";
        reasonselect.style.zIndex = "1000";
    }

    //理由を追加する
    add_reason (){
        const reasonselect = document.getElementById("t_Process_reasonselect");
        if (reasonselect) reasonselect.style.display = "none";
        
        // selectIdが設定されているかチェック
        if (!this.selectId) {
            console.error('selectIdが設定されていません:', this.selectId);
            // alert('ノードが選択されていません');
            return;
        }
        
        // すでに理由が記述されているかチェック
        if(this.ReasonConnectNodeId.indexOf(this.selectId) !== -1){
            alert('このノードにはすでに理由が記述されているため記述できません');
            return;
        }
        
        // 理由テキストを取得
        const reasonText = document.getElementById("t_Process_reasontext").value.trim();
        if (!reasonText) {
            alert('理由を入力してください');
            return;
        }
        
        // ノードが存在するかチェック
        const selectedNode = this.nodes.get(this.selectId);
        if (!selectedNode) {
            console.error('選択されたノードが見つかりません:', this.selectId);
            alert('選択されたノードが見つかりません');
            return;
        }
        
        console.log('選択されたノード:', selectedNode);
        
        // ノードの位置情報を取得
        const nodeBoundingBox = this.ownNetwork.getBoundingBox(this.selectId);
        if (!nodeBoundingBox) {
            console.error('ノードの位置情報を取得できませんでした:', this.selectId);
            alert('ノードの位置情報を取得できませんでした');
            return;
        }
        
        const ReasonTagId = this.generateUniqueNumberText();
        
        // 理由タグノードを作成（左上に配置）
        // reasonTextを渡して、addNodeメソッド内でtitle属性が設定されるようにする
        //this.addNode(ReasonTagId, reasonText, "reason-tag", nodeBoundingBox.left, nodeBoundingBox.top);
        
        // 理由の関連付けを記録
        this.ReasonConnectNodeId.push(this.selectId);
        this.ReasonNodeId.push('reason-tag_'+ReasonTagId);
        this.ReasonContent.push(reasonText); // 理由内容をメモリに保存
        
        // 理由ノードの記録（DBに保存）
        defaultRecordThinkingProcess.record_reason(this.selectId, 'reason-tag_'+ReasonTagId, reasonText);
        
        console.log('理由を記録しました:', reasonText);
        console.log('関連付けノードID:', this.selectId);
        console.log('理由ID:', 'reason-tag_'+ReasonTagId);
    }

    //理由入力をキャンセル
    cancel_reason_input (){
        document.getElementById("t_Process_reasonselect").style.display = "none";
    }

    //完了予定を記述する機能
    show_time_input (){
        document.getElementById('t_Process_conmenu').style.display = "none";
        
        // selectIdが設定されているかチェック
        if (!this.selectId) {
            console.error('selectIdが設定されていません:', this.selectId);
            return;
        }
        
        const timeselect = document.getElementById("t_Process_timeselect");
        if (!timeselect) {
            alert('完了予定入力ダイアログが見つかりません');
            return;
        }
        
        // 選択をリセット
        document.getElementById("t_Process_timetext").value = "";
        
        timeselect.style.display = "block";
        timeselect.style.left = this.BoxDisplay.x + "px";
        timeselect.style.top = this.BoxDisplay.y + "px";
        timeselect.style.position = "absolute";
        timeselect.style.zIndex = "1000";
    }

    //完了予定を追加する
    add_time (){
        const timeselect = document.getElementById("t_Process_timeselect");
        if (timeselect) timeselect.style.display = "none";
        
        // selectIdが設定されているかチェック
        if (!this.selectId) {
            console.error('selectIdが設定されていません:', this.selectId);
            return;
        }
        
        // すでに完了予定が記述されているかチェック
        if(this.TimeConnectNodeId.indexOf(this.selectId) !== -1){
            alert('このノードにはすでに完了予定が記述されているため記述できません');
            return;
        }
        
        // 完了予定を取得
        const timeText = document.getElementById("t_Process_timetext").value.trim();
        if (!timeText) {
            alert('完了予定を選択してください');
            return;
        }
        
        // ノードが存在するかチェック
        const selectedNode = this.nodes.get(this.selectId);
        if (!selectedNode) {
            console.error('選択されたノードが見つかりません:', this.selectId);
            alert('選択されたノードが見つかりません');
            return;
        }
        
        const TimeTagId = this.generateUniqueNumberText();
        
        // 完了予定の関連付けを記録
        this.TimeConnectNodeId.push(this.selectId);
        this.TimeNodeId.push('time-tag_'+TimeTagId);
        this.TimeContent.push(timeText); // 完了予定内容をメモリに保存
        
        // 完了予定ノードの記録（DBに保存）
        defaultRecordThinkingProcess.record_time(this.selectId, 'time-tag_'+TimeTagId, timeText);
        
        console.log('完了予定を記録しました:', timeText);
        console.log('関連付けノードID:', this.selectId);
        console.log('完了予定ID:', 'time-tag_'+TimeTagId);
    }

    //完了予定入力をキャンセル
    cancel_time_input (){
        document.getElementById("t_Process_timeselect").style.display = "none";
    }

    Recruit_Idea (){
        document.getElementById('t_Process_conmenu').style.display = "none";
        
        // selectIdが設定されているかチェック
        if (!this.selectId) {
            alert('ノードが選択されていません');
            return;
        }
        
        if(this.RecruitNodeId.indexOf(this.selectId) !== -1){
            alert('このノードにはすでに採用不採用がつけられています');
            return;
        }
        const recruitselect = document.getElementById("t_Process_recruitselect");
        if (!recruitselect) {
            alert('採用/棄却選択ダイアログが見つかりません');
            return;
        }
        recruitselect.style.display = "block";
        recruitselect.style.left = this.BoxDisplay.x + "px";
        recruitselect.style.top = this.BoxDisplay.y + "px";
    }

    Selected_Recruit_Idea (){
        const FeedBackReflectionText = [];
        const FeedBackReflection = [];
        
        // 両方のダイアログを非表示にする
        const recruitselect = document.getElementById("recruitselect");
        const tProcessRecruitselect = document.getElementById("t_Process_recruitselect");
        if (recruitselect) recruitselect.style.display = "none";
        if (tProcessRecruitselect) tProcessRecruitselect.style.display = "none";
        
        // どちらの選択リストが使用されているかを判定
        let selectionlist = document.getElementById('recruitselectionlist');
        let tProcessSelectionlist = document.getElementById('t_Process_recruitselectionlist');
        let selectedValue = '';
        
        if (selectionlist && selectionlist.value) {
            selectedValue = selectionlist.value;
        } else if (tProcessSelectionlist && tProcessSelectionlist.value) {
            selectedValue = tProcessSelectionlist.value;
        }
        
        if (!selectedValue) {
            alert('採用/棄却を選択してください');
            return;
        }
        
        const Ontology_Node_Id = this.OntologyNodeId[this.OntologyConnectNodeId.indexOf(this.selectId)];
        this.RecruitNodeId.push(this.selectId);
        this.Feedback.push(this.selectId);
        this.Recruit.push(selectedValue);
        if (selectedValue === "採用") {
            this.nodes.update({
                id : Ontology_Node_Id,
                borderWidth: 5,
                color: {
                    border: "green",
                },
            });
        }else if(selectedValue === "棄却"){
            this.nodes.update({
                id : Ontology_Node_Id,
                borderWidth: 5,
                color: {
                    border: "red",
                },
            });
        }
        const node_info = this.nodes.get(this.selectId);
        document.getElementById("accordion_discussion").innerHTML += "<div id='"+this.selectId+"' class='accordion-item'><div class='accordion-header' style='font-size:10px'>なぜ「"+node_info.label+"」は"+selectedValue+"されたのですか？</div><div class='accordion-content'><textarea id='text"+ this.selectId +"' class='accordion-input'></textarea></div></div>";
        const accordionHeaders = document.querySelectorAll('#accordion_discussion .accordion-header');
        accordionHeaders.forEach(header => {
          header.addEventListener('click', function () {
            const accordionItem = this.parentElement;
            accordionItem.classList.toggle('active');
          });
        });
        for(var i=0; i<this.RecruitNodeId.length-1; i++){
            document.getElementById("text"+this.RecruitNodeId[i]).innerHTML = FeedBackReflection[FeedBackReflectionText.indexOf("text"+this.RecruitNodeId[i])];
        }
        defaultRecordThinkingProcess.record_recruit(this.selectId, Ontology_Node_Id, selectedValue);
    }

    //手段開始ボタン
    step_start() {
        const menu = document.getElementById('t_Process_conmenu');
        if (menu) menu.style.display = "none";

        console.log(`step_start() を呼び出しました。選択中のノードID: ${this.selectId}`); // デバッグ用ログ 
        if (!this.selectId) {
            console.error("選択されたノードIDが設定されていません。");
            return;
        }

        console.log(`ノード ${this.selectId} の作業開始だよ！！`);
        defaultRecordThinkingProcess.update_Node("status", this.selectId, "inProgress", "");

        // const fromNodeId = globalParams.nodes[0] || globalParams.nodes;
        // const fromNode = this.nodes.get(fromNodeId);
        // console.log("ここ確認する！！！！！！！", fromNode);

        this.nodes.update({
            id: this.selectId,
            color: 'orange',
            title: "作業中",
            size: 50,
            physics: { enabled: false },
            borderWidth: 3,
            borderWidthSelected: 5,
            shapeProperties: {
                borderDashes: [10, 5]
            }
        });

        const updatedNode = this.nodes.get(this.selectId);
        console.log('更新後のノード:', updatedNode);
    }


    // 手段中断ボタン
    step_paused() {
        const menu = document.getElementById('t_Process_conmenu');
        if (menu) menu.style.display = "none";

        console.log(`step_paused() を呼び出しました。選択中のノードID: ${this.selectId}`);
        if (!this.selectId) {
            console.error("選択されたノードIDが設定されていません。");
            return;
        }

        console.log(`ノード ${this.selectId} の作業中断だよ！！`);
        // ステータスを更新
        defaultRecordThinkingProcess.update_Node("status", this.selectId, "paused", "");

        // ノードの見た目を更新
        this.nodes.update({
            id: this.selectId,
            color: 'LightCoral',
            title: "作業中断",
            size: 50,
            physics: { enabled: false },
            borderWidth: 3,
            borderWidthSelected: 5,
            shapeProperties: {
                borderDashes: [5, 5]
            }
        });

        const updatedNode = this.nodes.get(this.selectId);
        console.log('更新後のノード（中断）:', updatedNode);

        // フィードバック吹き出しを表示するならここで
        // this.showFeedbackTooltip();
    }


    // 手段終了ボタン
    step_end() {
        const menu = document.getElementById('contextMenuNodeActions');
        if (menu) menu.style.display = "none";
    
        console.log(`step_end() を呼び出しました。選択中のノードID: ${this.selectId}`);
        if (!this.selectId) {
            console.error("選択されたノードIDが設定されていません。");
            return;
        }
    
        console.log(`ノード ${this.selectId} の作業完了だよ！！`);
        // ステータスを completed に更新
        defaultRecordThinkingProcess.update_Node("status", this.selectId, "completed", "");
    
        // ノードの見た目を更新
        this.nodes.update({
            id: this.selectId,
            color: 'gray',
            title: "作業完了",
            size: 50,
            physics: { enabled: false },
            borderWidth: 3,
            borderWidthSelected: 5,
            shapeProperties: {
                borderDashes: false
            }
        });
    
        const updatedNode = this.nodes.get(this.selectId);
        console.log('更新後のノード（完了）:', updatedNode);
    
        // フィードバックの吹き出しを表示
        this.showFeedbackTooltip();
    }
    
    showFeedbackTooltip() {
        const tooltip = document.getElementById("feedbackTooltip");
        if (!tooltip) {
            console.error("フィードバック用ツールチップの要素が見つかりませんでした。");
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
        tooltip.style.width = "400px";
        tooltip.style.minWidth = "300px";
        tooltip.innerHTML = `
        <div style="border: 2px solid #888; border-radius: 8px; background: white; box-shadow: 2px 2px 8px rgba(0,0,0,0.3);">
            <div id="feedbackTooltipHeader" style="cursor: move; background: #ccc; padding: 5px; border-bottom: 1px solid #888;">
                <strong>【行動記録入力】</strong>
            </div>
            <div style="padding: 10px;">
                <form id="formFeedbackInput">
                    <label for="actionReason">行動意図：なぜこの手段を実行しましたか？</label><br>
                    <textarea id="actionReason" name="actionReason" rows="3" placeholder="例：実験対象者を選定するための参考基準を得るため．" style="width: 100%;"></textarea><br><br>
    
                    <label for="completionReason">完了基準：なぜ完了と判断しましたか？</label><br>
                    <textarea id="completionReason" name="completionReason" rows="3" placeholder="例：必要な研究事例（5つ）を確認し，比較表を作成できたから．" style="width: 100%;"></textarea><br><br>
    
                    <label for="challengesAndLearnings">経験の活用：困難や学びはありますか？</label><br>
                    <textarea id="challengesAndLearnings" name="challengesAndLearnings" rows="4" placeholder="例：他の研究事例を調べる過程で混乱が生じた．関連論文を追加調査し共通点を抽出した．" style="width: 100%;"></textarea><br><br>
    
                    <button type="button" id="btnSaveFeedback">保存</button>
                </form>
            </div>
        </div>
    `;
    
        tooltip.style.display = "block";
    
        // 保存ボタンのイベントリスナーを設定
        this.setupTooltipSaveButton(tooltip);
        this.setupTooltipDrag(tooltip);
    }
    
    setupTooltipSaveButton(tooltip) {
        const saveButton = document.getElementById("btnSaveFeedback");
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
                    record_thing: 'reflection'
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
        const header = document.getElementById("feedbackTooltipHeader");
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
    


    //ノードがクリックされたときの処理
    networkClick (params){
        //他のところクリックしたら色直す
        document.getElementById("ontology_feedback").innerHTML = "";
        const feedbackarea = document.getElementsByClassName("accordion-item");
        for(var i=0; i<feedbackarea.length; i++){
            feedbackarea[i].style.display = "none";
        }
        if(this.jmindex != []){
            const jmnode = document.getElementsByTagName("jmnode");
            this.jmindex.map((n) => {
                if(jmnode[n].getAttribute("type") == "answer"){
                    jmnode[n].style.backgroundColor = "#ffffff";
                }else{
                    jmnode[n].style.backgroundColor = "#87cefa";
                }
            })
            this.jmindex.length = 0;
        }
        if(params.nodes.length == 1){
            if(this.OntologyConnectNodeId.indexOf(params.nodes[0]) !== -1){
                const node_infomation = this.nodes.get(this.OntologyNodeId[this.OntologyConnectNodeId.indexOf(params.nodes[0])]);
                document.getElementById("ontology_feedback").innerHTML = "<div class='feedback_message'>この発言は「"+node_infomation.label + "」と「" + this.output_input[node_infomation.label] + "」<br>との合理性を意識して発言されたのかもしれません</div>";
            }
            // 理由が記述されたノードの場合、理由を表示
            if(this.ReasonConnectNodeId.indexOf(params.nodes[0]) !== -1){
                const reason_index = this.ReasonConnectNodeId.indexOf(params.nodes[0]);
                const reason_id = this.ReasonNodeId[reason_index];
                // 理由の詳細をDBから取得して表示する処理を追加可能
                console.log('理由が記述されたノードがクリックされました:', reason_id);
                // 必要に応じてここで理由の詳細表示ダイアログを表示
            }
        }
        if(this.RecruitNodeId.indexOf(params.nodes[0]) !== -1){
            this.FeedbackNodeId = params.nodes[0];
            document.getElementById(this.FeedbackNodeId).style.display = "block";
        }
        if(params.nodes.length == 1){
            const net_index = this.ConnectNetworkNodeId.map((n_id, index) => {
                return n_id === params.nodes[0] ? index : null;
            }).filter(n => n !== null);
            if(net_index == ""){
                return;
            }
            const jmnode = document.getElementsByTagName("jmnode");
            net_index.map((m_id) => {
                this.jmindex.push(this.ConnectMindMapNodeId[m_id]);
                if(jmnode[this.ConnectMindMapNodeId[m_id]].getAttribute("type") == "answer"){
                    jmnode[this.ConnectMindMapNodeId[m_id]].style.backgroundColor = "#ffff99";
                }else{
                    jmnode[this.ConnectMindMapNodeId[m_id]].style.backgroundColor = "#ffff99";
                }
            });
        }
        // console.log(params);
        // console.log(params.pointer.DOM);
        // console.log(params.pointer.DOM.x, params.pointer.DOM.y);
    }

    addNewEdge(E_start, E_end){
        let edge_id = this.generateUniqueNumberText();
        this.edges.add({ id: edge_id ,from: E_start, to: E_end });
        defaultRecordThinkingProcess.record_Edge(edge_id, E_start, E_end);
    }

    //ドラッグ開始(完成)
    dragstart (params) {
        if(!this.edgeEditMode){
            params.event.preventDefault();
        }else{
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
                let edge_id = this.generateUniqueNumberText();
                this.edges.add({id: edge_id, from: this.dragStartNodeId, to: this.dragEndNodeId });
                defaultRecordThinkingProcess.record_Edge(edge_id, this.dragStartNodeId, this.dragEndNodeId);
            }
            this.dragStartNodeId = null;
            this.dragEndNodeId = null;
        }else{
            const movedNodeId = params.nodes[0];
            if (movedNodeId !== undefined) {
                //なぜか更新したら色変わってしまうから一時的に
                let node_color = this.nodes.get(movedNodeId).color;
                // let border_color = '#ffdb4f'; 
                // switch(this.nodes.get(movedNodeId).group) {
                //     case "process": // 自分で考えた要約に関するノードの場合
                //         node_color = '#ffdb4f';
                //         break;
                //     case "versions": // 議論内での発言ノードの場合
                //         node_color = '#ffbaa1';
                //         break;
                //     case "topic-tag": // 議論内省マップのノードがどんなトピックに対応しているかを表すタグノードの場合
                //         node_color = '#ffdb4f';
                //         break;
                //     default: // その他
                //         break;
                // }
                this.nodes.update({ id: movedNodeId, color: node_color, x: params.pointer.x, y: params.pointer.y });
                const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
                //次に追加したノードの座標指定
                this.latest_selected_node_info.x = (nodeBoundingBox.right + nodeBoundingBox.left)/2;
                this.latest_selected_node_info.y = nodeBoundingBox.bottom + 10;
                console.log(params.nodes);
                console.log(`ノード ${movedNodeId} の位置を更新しました。新しい座標: (${this.latest_selected_node_info.x}, ${this.latest_selected_node_info.y})`);
            
                defaultRecordThinkingProcess.update_Node("point" ,movedNodeId, (nodeBoundingBox.right + nodeBoundingBox.left)/2, (nodeBoundingBox.bottom + nodeBoundingBox.top)/2)
                
                const ontology_index = this.OntologyConnectNodeId.indexOf(movedNodeId);
                if(ontology_index !== -1){
                    const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
                    const ontology_x = nodeBoundingBox.left;
                    const ontology_y = nodeBoundingBox.top;
                    /*
                    console.log(this.Recruit[this.RecruitNodeId.indexOf(this.OntologyConnectNodeId[this.OntologyNodeId.indexOf(this.OntologyNodeId[ontology_index])])]);
                    let border_color = '#ffdb4f';
                    if(this.Recruit[this.RecruitNodeId.indexOf(this.OntologyConnectNodeId[this.OntologyNodeId.indexOf(this.OntologyNodeId[ontology_index])])]==="採用"){
                        border_color = 'green'; 
                    }else if(this.Recruit[this.RecruitNodeId.indexOf(this.OntologyConnectNodeId[this.OntologyNodeId.indexOf(this.OntologyNodeId[ontology_index])])]==="棄却"){
                        border_color = 'red'; 
                    }
                    this.nodes.update({ id: this.OntologyNodeId[ontology_index], color: { background: 'blue', border: border_color}, x: ontology_x, y: ontology_y });
                    */
                    this.nodes.update({ id: this.OntologyNodeId[ontology_index], color: { background: 'blue', border: '#ffdb4f'}, x: ontology_x, y: ontology_y });
                    defaultRecordThinkingProcess.update_Node("point" ,this.OntologyNodeId[ontology_index], ontology_x, ontology_y);
                }
                
                // 理由タグの位置も更新（リロード時の理由タグにも対応）
                const reasonTagId = `reason-tag-${movedNodeId}`;
                const reasonTag = this.nodes.get(reasonTagId);
                if (reasonTag) {
                    const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
                    const tag_x = nodeBoundingBox.left + 8;
                    const tag_y = nodeBoundingBox.top + 8;
                    this.nodes.update({ 
                        id: reasonTagId, 
                        x: tag_x, 
                        y: tag_y
                    });
                }
                
                // 内省タグの位置も更新（リロード時の内省タグにも対応）
                const reflectionTagId = `reflection-tag-${movedNodeId}`;
                const reflectionTag = this.nodes.get(reflectionTagId);
                if (reflectionTag) {
                    const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
                    const tag_x = nodeBoundingBox.right - 8;
                    const tag_y = nodeBoundingBox.top + 8;
                    this.nodes.update({ 
                        id: reflectionTagId, 
                        x: tag_x, 
                        y: tag_y
                    });
                }
                
                // 時間タグの位置も更新（リロード時の時間タグにも対応）
                const timeTagId = `time-tag-${movedNodeId}`;
                const timeTag = this.nodes.get(timeTagId);
                if (timeTag) {
                    const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
                    const tag_x = nodeBoundingBox.left + 8;
                    const tag_y = nodeBoundingBox.bottom - 8; // ノードの左下
                    this.nodes.update({ 
                        id: timeTagId, 
                        x: tag_x, 
                        y: tag_y
                    });
                }
                
                // 理由ノードの位置も更新（従来のシステム用）
                const reason_index = this.ReasonConnectNodeId.indexOf(movedNodeId);
                if(reason_index !== -1){
                    const nodeBoundingBox = this.ownNetwork.getBoundingBox(movedNodeId);
                    const reason_x = nodeBoundingBox.left;
                    const reason_y = nodeBoundingBox.top;
                    
                    // 理由ノードの詳細情報をメモリから取得
                    const reasonNodeId = this.ReasonNodeId[reason_index];
                    const reasonContent = this.ReasonContent[reason_index]; // メモリから理由内容を取得
                    
                    this.nodes.update({ 
                        id: this.ReasonNodeId[reason_index], 
                        color: { background: '#FF8C00', border: '#FF6347'}, 
                        x: reason_x, 
                        y: reason_y,
                        title: `なぜそれを取り組もうとしたか: ${reasonContent}`
                    });
                    defaultRecordThinkingProcess.update_Node("point" ,this.ReasonNodeId[reason_index], reason_x, reason_y);
                }
            }
        }
    }
    
    // エッジの削除（完了）
    deleteEdge() {
        const selectEdgeId = this.ownNetwork.getSelection().edges[0];
        const startid = this.edges.get(selectEdgeId).from;
        const endid = this.edges.get(selectEdgeId).to;
        if(selectEdgeId !== undefined){
            this.edges.remove({id: selectEdgeId});
            defaultRecordThinkingProcess.delete_db_Edge(selectEdgeId, startid, endid);
            const Edge_index = this.OntologyConnectNodeId.indexOf(startid);
            if(Edge_index !== -1){
                this.EdgeStartId.splice(Edge_index, 1);
                this.EdgeEndId.splice(Edge_index, 1);
            }
        }
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
                        slot_content.map((content_slot) => {
                            if(content_slot.getAttribute("role") === "出力"){
                                const nodeBoundingBox = defaultThinkingProcess.ownNetwork.getBoundingBox(material_id);
                                this.addNode(concept_id, content_slot.getAttribute("class_constraint"), "topic-tag", nodeBoundingBox.left, nodeBoundingBox.top);
                                this.OntologyConnectNodeId.push(material_id);
                                this.OntologyNodeId.push('topic-tag_'+concept_id);
                                defaultRecordThinkingProcess.record_ontology(material_id, 'topic-tag_'+concept_id);
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

    // シンプルなツールチップ設定（vis.jsのデフォルトツールチップを使用）
    setupCustomTooltip() {
        // vis.jsのデフォルトツールチップを使用するため、特別な設定は不要
        // ノードのtitle属性が自動的にツールチップとして表示される
    }

}

// ネットワーク関係の記録
class RecordThinkingProcess{
    //ノードの記録(完了)
    record_Node(id, label, node_type, x, y, status) {
        let selected_node_id = document.getElementById('conceptdisplay').getAttribute('nodeId');
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {
                node_id: id,
                label: label,
                node_type: node_type,
                x: x,
                y: y,
                status: status,
                selected_node_id: selected_node_id,
                purpose: 'record',
                record_thing: 'node'
            },

        });
    }

    //エッジの記録(完了)
    record_Edge(edge_id, edge_start, edge_end) {
        $.ajax({
            url: "php/edit_object_map_maneger.php",
            type: "POST",
            data: {
                edge_id: edge_id,
                edge_start: edge_start,
                edge_end: edge_end,
                purpose: 'record',
                record_thing: 'edge'
            },
            success: function (response) {
                console.log("✅ edge記録成功:", response);
            },
            error: function (xhr, status, error) {
                console.error("❌ edge記録エラー:", status, error);
                console.warn("📄 レスポンステキスト:", xhr.responseText);
            }
        });
    }
    

    //ノードの更新(完了)
    update_Node (select_update, id, node_update_thing1, node_update_thing2){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {select_update : select_update,
                node_id : id,
                purpose : 'update',
                update_thing : 'node',
                node_update_thing1 : node_update_thing1,
                node_update_thing2: node_update_thing2},
            success:function(e){
                if(e){
                    console.log(e);
                }
            }
        });
    }

    //ノードの削除(完了)
    delete_db_Node (id){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {node_id : id,
                purpose : 'delete',
                delete_thing : 'node'},
        });
    }

    //triggerの削除
    delete_trigger_Node (id){
        $.ajax({
            url: "../php/thinking_edit_processmap_maneger.php",
            type: "POST",
            data: {trigger_id : id,
                purpose : 'delete',
                delete_thing : 'trigger'},
            success: function(e){
                if(e){
                    console.log(e);
                }
            }
        });
    }
    
    //エッジの削除(完了)
    delete_db_Edge (edge_id, edge_start,edge_end){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {edge_id: edge_id,
                edge_start : edge_start,
                edge_end : edge_end,
                purpose : 'delete',
                delete_thing : 'edge'},
                success: function(e){
                    if(e){
                        console.log(e);
                    }
                }
        });
    }

    delete_connection (id){
        $.ajax({
            url: "../php/thinking_edit_processmap_maneger.php",
            type: "POST",
            data: {node_id : id,
                purpose : 'delete',
                delete_thing : 'connection'},
        });
    }

    //繋げたものをDBに記録
    record_connection (NetworkNodeId,MindMapNodeId){
        $.ajax({
            url: "../php/thinking_edit_processmap_maneger.php",
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
            url: "../php/thinking_edit_processmap_maneger.php",
            type: "POST",
            data: {node_id : node_id,
                ontology_node_id : ontology_node_id,
                purpose : 'record',
                record_thing : 'ontology'},
        });
    }

    // 理由の記録
    record_reason (node_id, reason_node_id, reason_text){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {node_id : node_id,
                reason_node_id : reason_node_id,
                reason_text : reason_text,
                purpose : 'record',
                record_thing : 'reason'},
        });
    }

    // 完了予定の記録
    record_time (node_id, time_node_id, time_text){
        $.ajax({
            url: "php/object_maneger.php",
            type: "POST",
            data: {node_id : node_id,
                time_node_id : time_node_id,
                time_text : time_text,
                purpose : 'record',
                record_thing : 'estimated_time'},
        });
    }

    /*
    // オントロジーの対応付けの記録
    record_recruit (node_id, ontology_node, result){
        $.ajax({
            url: "../php/thinking_edit_processmap_maneger.php",
            type: "POST",
            data: {node_id : node_id,
                ontology_node : ontology_node,
                result_recruit : result,
                purpose : 'record',
                record_thing : 'recruit'},
        });
    }
    */

    record_trigger(trigger_id, activity_id, from, to, time, activity_type, content, x, y){
        
        $.ajax({
            url: "../php/thinking_edit_processmap_maneger.php",
            type: "POST",
            data: {trigger_id : trigger_id,
                activity_id : activity_id,
                node_version_from : from,
                node_version_to : to,
                activity_time : time,
                activity_type : activity_type,
                content : content,
                x : x,
                y : y,
                purpose: 'record',
                record_thing : 'trigger'},
            success: function(e){
                if(e){
                    console.log(e);
                }else{
                    if(activity_id){
                        document.getElementById(activity_id).trigger_on = 1;
                        document.getElementById(activity_id).style.background = "#979997";
                        document.getElementById(activity_id).style.borderWidth = 3;
                    }
                }
            }
        });
    }
}


/*
 * データベースからの読み込み
 */
let process_mode;
let trigger_list;
const getProcessMapDataFromDB = (callback) => {
    //選択されているノードIDとconcept_id
    let selected_node_id;
    let selected_concept_id;
    if(process_mode == "all"){
        selected_node_id = _jm.get_selected_node().id;
        selected_concept_id = Get_NodeInfo(selected_node_id, "concept_id");
    }else{
        const conceptDiplay = document.getElementById("conceptdisplay");
        selected_node_id = conceptDiplay.getAttribute('nodeid');
        selected_concept_id = conceptDiplay.getAttribute('conceptid');;
    }
    choose_trigger_xmlLoad().then(conceptIds => {
        return new Promise((resolve, reject) => {
            try{
                return $.ajax({
                    url: "php/object_map_manager.php",
                    type: "POST",
                    data: data =  {
                        process_mode: process_mode,
                        selected_node_id: selected_node_id,
                        selected_concept_id: selected_concept_id,
                        concept_ids: conceptIds
                    },
                }).success((r) => {
                    trigger_list = JSON.parse(r);
                    console.log(trigger_list);
                    callback(trigger_list);
                });
            } catch (error){
                reject(error);
            }
        });
    }).catch(error => {
        console.error(error); // エラー処理
    });
}

const getPassDataFromDB = (selected_date) => {
    console.log("呼ばれたぞい");
    let selected_node_id;
    let selected_concept_id;

    if (process_mode == "all") {
        selected_node_id = _jm.get_selected_node().id;
        selected_concept_id = Get_NodeInfo(selected_node_id, "concept_id");
    } else {
        const conceptDisplay = document.getElementById("conceptdisplay");
        selected_node_id = conceptDisplay.getAttribute('nodeid');
        selected_concept_id = conceptDisplay.getAttribute('conceptid');
    }

    choose_trigger_xmlLoad().then(conceptIds => {
        console.log("今から取得します", selected_node_id);

        const postData = {
            process_mode: "PassData",
            selected_node_id: selected_node_id,
            selected_concept_id: selected_concept_id,
            concept_ids: conceptIds,
            selected_date: selected_date
        };

        console.log("送信データ:", postData);

        $.ajax({
            url: "php/object_map_manager.php",
            type: "POST",
            data: postData,
            success: function(response) {
                console.log("レスポンス文字列:", response);
                try {
                    const data = JSON.parse(response);
                    console.log("パース結果:", data);

                    const historyArray = data.hnode || data.data || []; 

                    if (Array.isArray(historyArray) && historyArray.length > 0) {
                        console.log(`履歴件数: ${historyArray.length}`);
                        historyArray.forEach((node, i) => {
                            console.log(`[${i + 1}] object_node_id: ${node.object_node_id}`);
                            console.log("  content:", node.content);
                            console.log("  object_node_type:", node.object_node_type);
                            console.log("  x:", node.x, " y:", node.y);
                            console.log("  status:", node.status);
                            console.log("  appeared_at:", node.appeared_at);
                            console.log("  disappeared_at:", node.disappeared_at);
                        });

                        // ここで履歴データを渡して画面表示を更新する
                        displayPassData(historyArray);

                    } else {
                        console.warn("履歴データが見つかりません");
                    }

                    if (data.status && data.status !== "success") {
                        console.warn("正常終了していません:", data.status, data.message);
                    }
                } catch (e) {
                    console.error("JSONパース失敗:", e);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX通信エラー:", status, error);
            }
        });
    });
};


// hnode配列を受け取ってマップに表示する関数例
const displayPassData = (hnodeArray) => {
    if (!Array.isArray(hnodeArray) || hnodeArray.length === 0) {
        console.log("履歴ノードデータが空または不正です");
        return;
    }

    // 例えば既存の履歴ノードを一旦クリアする処理があればここで行う
    // defaultThinkingProcess.clearHistoryNodes(); // あれば

    hnodeArray.forEach((node) => {
        // ここは既存のノード追加関数に合わせて適宜調整してください
        defaultThinkingProcess.addReloadNode(
            node.object_node_id,
            node.content,
            node.object_node_type,  // おそらくプロパティ名がobject_node_typeに変わってるはず
            node.x,
            node.y,
            node.status,
            node.purpose,
            node.action_reason,
            node.completion_reason,
            node.challenges_learnings
        );
    });

    console.log(`履歴ノード ${hnodeArray.length}件を表示しました`);
};


const makeTriggerInList = (id, activity_type, concept_label, content, timestamp, trigger_on) => {
    // 左側の発話ノードのリストのところのノードのDOMを構成する
    let backColor = "white";
    let borderColor = "#67796b";
    let borderWidth = 1;
    if(trigger_on == 1){
        backColor = "#979997";
        borderWidth = 2;
    }
    return $(`(<div id="${id}"
                 style='border: solid "${borderWidth}"px "${borderColor}"; background: ${backColor};'
                 class='trigger_in_list'
                 trigger_content='${content}'
                 timestamp='${timestamp}'
                 trigger_on='${trigger_on}'
                 activity_type='${activity_type}'
            >【${timestamp}：${activity_type}】<br>${concept_label}：<br>${content}</div>`);
}

// 思考過程表出化マップを表示
const displayTriggerData = (mode, display_target_area_id) => {
    process_mode = mode;
    let node_x = 0;
    let node_y = 0;
    let from_id = "";
    if(mode=="all" || mode == "allRE"){
        const conceptdisplay_area = $(`#conceptdisplay`); // 何の認知活動かを表示するエリア
        const target_area = $(`#${display_target_area_id}`); // DOMエリア
        $('#trigger_area_list').html("");
        let selected_node_id;
        let selected_concept_id;
        // 初回読み込み時に何の認知活動かを表示する
        if(mode=="all"){
            selected_node_id = _jm.get_selected_node().id;
            var jmnode = document.getElementsByTagName("jmnode");
            for(var i=0; i<jmnode.length; i++){
                if(selected_node_id == jmnode[i].getAttribute("nodeid")){
                    selected_concept_id = jmnode[i].getAttribute("concept_id");
                }
            }
            document.getElementById('conceptdisplay').setAttribute('nodeId', selected_node_id);
            document.getElementById('conceptdisplay').setAttribute('conceptId', selected_concept_id);
        }else{
            const conceptDisplay = document.getElementById('conceptdisplay');
            selected_node_id = conceptDisplay.getAttribute('nodeid');
            selected_concept_id =conceptDisplay.getAttribute('conceptid');
        }

        getProcessMapDataFromDB ((trigger_list_info) => {
            //concept_labelを表示
            const concept_label = trigger_list_info['selected_concept'];
            conceptdisplay_area.html(concept_label);
            let j = 0;

            // versionノードの表示
            trigger_list_info.node_versions.forEach((v) => {
                defaultThinkingProcess.addVersionNode(v.node_version_id, v.content, "versions", v.appeared_at, node_x, node_y);
                if(from_id != ""){
                    defaultThinkingProcess.addVersionEdge(from_id, v.node_version_id);
                }
                from_id = v.node_version_id;
                node_x += 300;
            });
            // triggerの候補一覧
            trigger_list_info.trigger_candidate.forEach((u) => {
                if(u){
                    const trigger_dom = makeTriggerInList(u.activity_id, u.activity_type, u.concept_label, u.content, u.appeared_at, u.trigger_on);
                    target_area.append(trigger_dom); // 挿入
                }
            });
            // triggerノードの表示
            trigger_list_info.trigger.forEach((u) => {
                j++;
                if(u){
                    let from_node = u.node_version_from;
                    let to_node = u.node_version_to;
                    let edge_ids = defaultThinkingProcess.ownNetwork.getConnectedEdges(from_node);
                    let num = 0;
                    for(i = 0; i<edge_ids.length; i++){
                        if(defaultThinkingProcess.edges.get(edge_ids[i]).group == "versionEdges" || defaultThinkingProcess.edges.get(edge_ids[i]).group == "trigger_from"){
                            //(versionEdgesのときなど)自身が指されている(左側のものと繋がっている)edgeを除外
                            if(defaultThinkingProcess.ownNetwork.getConnectedNodes(edge_ids[i])[1] != from_node){
                                num = i;
                            }
                        }
                    }
                    let edge_id = edge_ids[num];
                    defaultThinkingProcess.addTriggerNode("Reload", u.trigger_id, edge_id, from_node, to_node, u.activity_id, u.content, u.activity_type, u.activity_time, u.x, u.y);
                }
            });
            console.log("onodeの中身:", trigger_list_info.onode);
            console.log("pedgeの中身:", trigger_list_info.pedge);
            console.log("datesの中身:", trigger_list_info.dates);

            trigger_list_info.onode.map((n) => {
                defaultThinkingProcess.addReloadNode(n.object_node_id, n.content, n.object_nodes_type, n.node_x, n.node_y, n.status, n.purpose, n.action_reason, n.completion_reason, n.challenges_learnings, n.estimated_time);
            });
            trigger_list_info.pedge.map((n) => {
                defaultThinkingProcess.addReloadEdge(n.process_edge_id, n.edge_start, n.edge_end, n.label);
            });

            // —————————————— ここからシークバー関連の処理 ——————————————
            const timelineDates = trigger_list_info.dates;  // 日付配列

            const slider = document.getElementById("timeline_slider");
            const label = document.getElementById("timeline_label");
            
            let selectedDate = null;
            
            if (timelineDates && timelineDates.length > 0) {
                slider.max = timelineDates.length - 1;
                slider.value = timelineDates.length - 1;  // 最後のインデックスに初期設定
                selectedDate = timelineDates[slider.value];
                label.textContent = selectedDate;
                console.log("初期選択日付（最新）:", selectedDate);
                
                slider.oninput = () => {
                    const index = parseInt(slider.value);
                    selectedDate = timelineDates[index];
                    label.textContent = selectedDate;
                    console.log("選択された日付:", selectedDate);
                    defaultThinkingProcess = new ThinkingProcess("myProcessnetwork", "load");
                    getPassDataFromDB(selectedDate);
                    console.log("過去データを取得するぞい！");
                };
            } else {
                label.textContent = "日付なし";
                slider.max = 0;
                slider.value = 0;
                selectedDate = null;
                console.log("日付データがありません");
            }
            
            // —————————————— ここまで ——————————————

            const nodes = this.nodes;
            const edges = this.edges;

            addeventdisplayTriggerData();
            
        });
    }
    
}

const addeventdisplayTriggerData = () => {
    let mousedownId = null;
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
    $(`#trigger_area`).on('mousedown', (e) => {
    // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
    mousedownId = null;
    const overed_node = e.target;
    if(overed_node.getAttribute('trigger_on')==='0'){
        mousedownId = overed_node.getAttribute('id');
    }
    });
    $(`#trigger_area`).on('mouseleave', (e) => {
    // リスト内の発話ノードにマウスイベント（マウスが要素上からでた）を追加
        // $(`#trigger_click`).empty();
    });
    $(`.trigger_in_list`).on('click', (e) => {
        // リスト内の発話ノードにマウスイベント(左クリック)を追加
        const clicked_trigger = e.target;
        document.getElementById("trigger_click").innerHTML="<input type='button' class='triggerbutton' id='triggerFromList' value='ノードとして追加'>";

        $(`#triggerFromList`).on("click", () => {
            const selected_node_id = defaultThinkingProcess.ownNetwork.getSelection().nodes[0];
            const selected_edge_id = defaultThinkingProcess.ownNetwork.getSelection().edges;
            const activity_id = clicked_trigger.getAttribute('id');
            const t_label = clicked_trigger.innerHTML;
            const t_type = clicked_trigger.getAttribute('activity_type');
            const t_time = clicked_trigger.getAttribute('timestamp');
            let edge_id =selected_edge_id;
            let trigger_id = defaultThinkingProcess.generateUniqueNumberText();
            let num = 0 ;
            let selected_node_group = defaultThinkingProcess.nodes.get(selected_node_id).group;

            if(selected_node_id && selected_node_group == "versions" || selected_node_group == "versionsBro"){
                //versionのノードが選択されている時，それにつながるedge_idを取得し，右側のedge_idにつながるnode_idを取得する
                for(i = 0; i<selected_edge_id.length; i++){
                    let selected_edge_group = defaultThinkingProcess.edges.get(selected_edge_id[i]).group;
                    if(selected_edge_group == "versionEdges" || selected_edge_group == "trigger_from"){
                        //(versionEdgesのときなど)自身が指されている(左側のものと繋がっている)edgeを除外
                        if(defaultThinkingProcess.ownNetwork.getConnectedNodes(selected_edge_id[i])[1] != selected_node_id){
                            num = i;
                        }
                    }
                }
                edge_id = selected_edge_id[num];
                const connect_node_ids = defaultThinkingProcess.ownNetwork.getConnectedNodes(selected_edge_id[num]);
                let from_node = connect_node_ids[0];
                let to_node = connect_node_ids[1];
                if(defaultThinkingProcess.edges.get(selected_edge_id[num]).group == "trigger_to"){
                    // triggerを指しているedgeだった場合，その先のversionノードを取得する
                    let e = defaultThinkingProcess.ownNetwork.getConnectedEdges(connect_node_ids[1]);
                    let n = defaultThinkingProcess.ownNetwork.getConnectedNodes(e[1])
                    to_node = n[1];
                }
                defaultThinkingProcess.addTriggerNode("New", trigger_id, edge_id, from_node, to_node, activity_id, t_label, t_type, t_time, null, null);
                document.getElementById("trigger_click").innerHTML="";
                return;
            }else if(selected_edge_id.length == 1 && (defaultThinkingProcess.edges.get(selected_edge_id[0]).group == "versionEdges" || defaultThinkingProcess.edges.get(selected_edge_id[0]).group == "trigger_from")){
                //versionもしくはtriggerのエッジが選択されている時，それにつながるnode_id(2つ)を取得する
                const connect_node_ids = defaultThinkingProcess.ownNetwork.getConnectedNodes(selected_edge_id);
                let from_node = connect_node_ids[0];
                let to_node = connect_node_ids[1];
                if(defaultThinkingProcess.edges.get(selected_edge_id[0]).group == "trigger_from"){
                    // triggerを指しているedgeだった場合，その先のversionノードを取得する
                    let e = defaultThinkingProcess.ownNetwork.getConnectedEdges(connect_node_ids[1]);
                    let n = defaultThinkingProcess.ownNetwork.getConnectedNodes(e[1])
                    to_node = n[1];
                }
                defaultThinkingProcess.addTriggerNode("New", trigger_id, selected_edge_id[0], from_node, to_node, activity_id, t_label, t_type, t_time, null, null);
                document.getElementById("trigger_click").innerHTML="";
                return;
            }else{
                alert('追加したい箇所のノードまたはエッジを選択してください');
                return;
            }
        });
    });
    $(`.trigger_in_list`).on('contextmenu', (e) => {
        // リスト内の発話ノードにマウスイベント(右クリック)を追加
        const clicked_trigger = e.target;
        document.getElementById("trigger_click").innerHTML="<input type='button' class='triggerbutton' id='triggerMapShow' value='マインドマップを表示'>";
        $(`#triggerMapShow`).on("click", () => {
            console.log(clicked_node.getAttribute('id'));
            document.getElementById("trigger_click").innerHTML="";
        });
    });
}

// 学習者がオリジナルのTriggerを入力できる箇所を作成
function inputTriggerAreaOpen(){
    $('#trigger_area_display').css('height','auto');
    $('#trigger_area_add').css('height','auto');
    $('#trigger_add').css('height','auto');
    document.getElementById('inputTriggerbutton').value = " × 閉じる";
    document.getElementById('inputTriggerbutton').onclick = inputTriggerAreaClose;

    // 日時入力欄
    let input_time = document.createElement('input');
    input_time.type = 'datetime-local';
    input_time.id = 'trigger_time';
    document.getElementById("trigger_add").appendChild(input_time);

    // 活動入力欄
    let input_activity = document.createElement('select');
    input_activity.id = 'trigger_activity';
    document.getElementById("trigger_add").appendChild(input_activity);

    // 活動一覧
    let s0 = document.createElement('option');
    s0.value = '';
    s0.textContent = '-何の活動を行いましたか？-';
    let s1 = document.createElement('option');
    s1.value = '自己内対話'
    s1.textContent = '自己内対話'
    let s2 = document.createElement('option');
    s2.value = '議論資料作成'
    s2.textContent = '議論資料作成'
    let s3 = document.createElement('option');
    s3.value = '議論内省'
    s3.textContent = '議論内省'
    let s4 = document.createElement('option');
    s4.value = '論文執筆'
    s4.textContent = '論文執筆'
    let s5 = document.createElement('option');
    s5.value = '論文読解'
    s5.textContent = '論文読解'
    document.getElementById("trigger_activity").appendChild(s0);
    document.getElementById("trigger_activity").appendChild(s1);
    document.getElementById("trigger_activity").appendChild(s2);
    document.getElementById("trigger_activity").appendChild(s3);
    document.getElementById("trigger_activity").appendChild(s4);
    document.getElementById("trigger_activity").appendChild(s5);

    // 自由記述欄
    let input_content = document.createElement('textarea');
    input_content.id = 'trigger_content';
    input_content.placeholder = '何をきっかけに思考が変化しましたか？';
    input_content.rows = 3
    document.getElementById("trigger_add").appendChild(input_content);
    
    // 入力ボタン 
    let input_button = document.createElement('input');
    input_button.type = 'button';
    input_button.className = 'triggerbutton';
    input_button.id = 'triggerNew'
    input_button.value = 'ノードとして追加';
    input_button.onclick = inputTrigger;
    document.getElementById("trigger_add").appendChild(input_button);
    
  }

//   Trigger入力箇所を閉じる処理
function inputTriggerAreaClose(){
    $('#trigger_area_display').css('height','100px');
    $('#trigger_area_add').css('height','20px');
    $('#trigger_add').css('height','0px');
    document.getElementById("trigger_time").remove();
    document.getElementById("trigger_activity").remove();
    document.getElementById("trigger_content").remove();
    document.getElementById("triggerNew").remove();
    document.getElementById('inputTriggerbutton').value = "＋ 活動を入力";
    document.getElementById('inputTriggerbutton').onclick = inputTriggerAreaOpen;
}

// 入力されたTriggerをマップに表示
function inputTrigger(){
    let trigger_id = defaultThinkingProcess.generateUniqueNumberText();
    const t_type = document.getElementById("trigger_activity").value;
    const t_time = document.getElementById("trigger_time").value.replace('T', ' ');
    let content = document.getElementById("trigger_content").value;
    const t_label = "【"+t_time+"："+t_type+"】<br>"+content+"";
    
    if(!t_type){
        alert('どの活動を行ったのか入力してください');
        return;
    }else if(!content){
        alert('どのような活動を行ったのか入力してください');
        return;
    }

    const selected_node_id = defaultThinkingProcess.ownNetwork.getSelection().nodes[0];
    const selected_edge_id = defaultThinkingProcess.ownNetwork.getSelection().edges;
    let edge_id =selected_edge_id;
    let num = 0 ;
    let selected_node_group = defaultThinkingProcess.nodes.get(selected_node_id).group;

    if(selected_node_id && selected_node_group == "versions" || selected_node_group == "versionsBro"){ 
        //versionのノードが選択されている時，それにつながるedge_idを取得し，右側のedge_idにつながるnode_idを取得する
        for(i = 0; i<selected_edge_id.length; i++){
            let selected_edge_group = defaultThinkingProcess.edges.get(selected_edge_id[i]).group
            if(selected_edge_group == "versionEdges" || selected_edge_group == "trigger_from"){
                //(versionEdgesのときなど)自身が指されている(左側のものと繋がっている)edgeを除外
                if(defaultThinkingProcess.ownNetwork.getConnectedNodes(selected_edge_id[i])[1] != selected_node_id){
                    num = i;
                }
            }
        }
        edge_id = selected_edge_id[num];
        const connect_node_ids = defaultThinkingProcess.ownNetwork.getConnectedNodes(selected_edge_id[num]);
        let from_node = connect_node_ids[0];
        let to_node = connect_node_ids[1];
        if(defaultThinkingProcess.edges.get(selected_edge_id[num]).group == "trigger_to"){
            // triggerを指しているedgeだった場合，その先のversionノードを取得する
            let e = defaultThinkingProcess.ownNetwork.getConnectedEdges(connect_node_ids[1]);
            let n = defaultThinkingProcess.ownNetwork.getConnectedNodes(e[1])
            to_node = n[1];
        }
         defaultThinkingProcess.addTriggerNode("New", trigger_id, edge_id, from_node, to_node, null, t_label, t_type, t_time, null, null)
        // document.getElementById("trigger_time").reset();
        // document.getElementById("trigger_activity").reset();
        // document.getElementById("trigger_content").reset();   
    }else if(selected_edge_id.length == 1 && (defaultThinkingProcess.edges.get(selected_edge_id[0]).group == "versionEdges" || defaultThinkingProcess.edges.get(selected_edge_id[0]).group == "trigger_from")){
        //versionもしくはtriggerのエッジが選択されている時，それにつながるnode_id(2つ)を取得する
        const connect_node_ids = defaultThinkingProcess.ownNetwork.getConnectedNodes(selected_edge_id);
        let from_node = connect_node_ids[0];
        let to_node = connect_node_ids[1];
        if(defaultThinkingProcess.edges.get(selected_edge_id[0]).group == "trigger_from"){
            // triggerを指しているedgeだった場合，その先のversionノードを取得する
            let e = defaultThinkingProcess.ownNetwork.getConnectedEdges(connect_node_ids[1]);
            let n = defaultThinkingProcess.ownNetwork.getConnectedNodes(e[1])
            to_node = n[1];
        }
         defaultThinkingProcess.addTriggerNode("New", trigger_id, selected_edge_id[0], from_node, to_node, null, t_label, t_type, t_time, null, null)
        // document.getElementById("trigger_time").reset();
        // document.getElementById("trigger_activity").reset();
        // document.getElementById("trigger_content").reset();   
        return;
    }else{
        alert('追加したい箇所のノードまたはエッジを選択してください');
        return;
    }
}

function ShowRelatedProcess(mode){
    // checkboxの状態を取得
    check = document.getElementById("checkbox_process");

    // 兄弟ノードを含めた表示
    if(mode=='brother'){
        // checlboxがチェックされている時の処理
        if(check.checked == true){
            console.log(check);
            displayTriggerData("AddBrother", "trigger_area_list");
        }
        else{
            console.log(check);
            defaultThinkingProcess = new ThinkingProcess("myProcessnetwork", "load");
            displayTriggerData("allRE", "trigger_area_list");
        }
    }// 整合性ラベルのついたノードを含めた表示
    if(mode=='consistency'){
        console.log(mode);
        // checlboxがチェックされている時の処理
        if(check.checked == true){
            
        }
        else{
          
        }
    }
    
}

function showThinkingProcessMap() {
    document.getElementById('feedback_area').style.display = "block";
    document.getElementById('xml_upload_area').style.display = "block";
    $('#process_network_container').css('display', 'flex');
    $('#jsmind_container').css('width', '100%');
    $('#jsmind_container').css('height', '50%');
    $('#mind').css('height', '90%');
    $('#document').hide();
    const frame_dom = document.getElementsByClassName("inquiry_area");
    frame_dom[0].style.border = "solid 5px #ccc";
    $("#myProcessnetwork").css({
        width: '100%',
        height: '400px' // 必要に応じて調整
    });

    defaultThinkingProcess = new ThinkingProcess("myProcessnetwork", "load");
    displayTriggerData("all", "trigger_area_list");

    // シークバーのイベントリスナーを追加
    const slider = document.getElementById("timeline_slider");
    const label = document.getElementById("timeline_label");

    slider.addEventListener("input", (event) => {
        const value = event.target.value;
        label.textContent = `${value}%`;

        // シークバーの値に応じて表示内容を変更する処理
        updateThinkingProcessMap(value);
    });
}

// シークバーの値に応じてマップを更新する関数
function updateThinkingProcessMap(value) {
    //console.log(`シークバーの値: ${value}`);
    // ここにシークバーの値に応じたマップの更新ロジックを実装
    // 例: ノードやエッジの表示/非表示を切り替える
}
function closeThinkingProcessMap(){
  
    document.getElementById('feedback_area').style.display = "block";
    document.getElementById('xml_upload_area').style.display = "block";
    $('#process_network_container').css('display','none');
    // $('#jsmind_container').css('width','calc(100vw - 350px)');
    $('#jsmind_container').css('height','100%');
    $('#mind').css('height','90%');
}

// nodeIDをidにもつノードのtypeがラベルの時，思考過程表出化マップを開く
function proposeThinkingProcess(nodeID){

    const nodeClass = Get_NodeInfo(nodeID, "class").replace(" selected", "");
    console.log(nodeClass);
    if(nodeClass =='primary_label' || nodeClass =='issue_label' || nodeClass =='consistency_label' ){
        var label_name = "注目すべきである";
        switch (nodeClass){
            case 'primary_label':
                label_name = "主軸である";
                break;
            case 'issue_label':
                label_name = "課題である";
                break;
            case 'consistency_label':
                label_name = "整合性を保つべきである";
                break;
        }
        alert("「"+ label_name +"」と考えていた思考が変わりましたね．なぜそのように考えたのかを振り返ってみましょう！");
        showThinkingProcessMap();
    }
}

// ロードした際の関数
window.addEventListener('load', () => {

    // 初期表示時点でいくつかのオブジェクトを非表示にする
    document.getElementById("process_network_container").style.display="none";
    defaultThinkingProcess = new ThinkingProcess("myProcessnetwork", "load");
    // マップ編集ボタンにイベント付与
    $(`#process_addNode`).on("click", e => {
        defaultThinkingProcess.addNewNode();
    });
    $(`#process_removeNode`).on("click", e => {
        defaultThinkingProcess.deleteNode();
    });
    $(`#process_startEditEdge`).on("click", e => {
        defaultThinkingProcess.SelectEditEdge();
    });
    $(`#process_removeEdge`).on("click", e => {
        defaultThinkingProcess.deleteEdge();
    });
    $(`#process_ZoomIn`).on("click", e => {
        defaultThinkingProcess.zoomIn();
    });
    $(`#process_ZoomOut`).on("click", e => {
        defaultThinkingProcess.zoomOut();
    });

    const accordionHeaders = document.querySelectorAll('#accordion_discussion .accordion-header');
    accordionHeaders.forEach(header => {
      header.addEventListener('click', function () {
        const accordionItem = this.parentElement;
        accordionItem.classList.toggle('active');
      });
    });
});
