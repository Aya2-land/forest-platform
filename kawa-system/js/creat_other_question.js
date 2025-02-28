

function get_other_nodeid(){
    var element = document.getElementById("result");
    element.textContent = ""; // テキストを空にする

    //nodeid取得
    nodeid = get_selected_nodeid();
    console.log(nodeid);
    

    
    $.ajax({

        url: "php/get_other_annotation.php",
        type: "POST",
        data: { val : "get_conceptid",
                id : nodeid
              },
        success: function(conceptid){
            
            if(conceptid =="[]"){
                console.log('fin');
                return;
            }
            conceptid = conceptid.substring(2, 20);
            
            
            $.ajax({

                url: "php/get_other_annotation.php",
                type: "POST",
                data: { val : "get_question",
                        id : conceptid
                      },
                success: function(question){
                    result = JSON.parse(question);
                    var Array = result;
                    console.log(Array);
                    var arrayDisplay = document.getElementById("result");
                    var oq_menu = document.getElementById('other_conmenu');
                    temp = "answer_button0";

                    

                    for (var i = 0; i < Array.length; i++) {
                        

                        var button = document.createElement("button"); // 新しいボタン要素を作成
                        if (i == 0){
                            button.setAttribute("id", "selected");
                        }
                        else{
                            button.setAttribute("id", "answer_button"+i);
                        }
                        button.innerHTML = Array[i]["content"]; // ボタンのテキストを配列の要素に設定
                        button.setAttribute("data-map_id", Array[i]["map_id"]);


                        button.addEventListener("contextmenu", function(e) {
                            console.log(temp);
                            var sss = document.getElementById("selected");
                            if (sss.id == "selected"){
                                var sss = document.getElementById("selected");
                                sss.id = temp;
                            }

                            console.log("ok");
                            oq_menu.style.left = (e.pageX - document.body.scrollLeft - 10) + 'px';
                            oq_menu.style.top = (e.pageY - document.body.scrollTop + 10) + 'px';
                            oq_menu.classList.add('on');

                            temp = e.target.id;
                            e.target.id = "selected";

                        });
                        

                        arrayDisplay.appendChild(button); // ボタンを表示用の要素に追加                      
                    }
                    
                    

                }
                
                

            });

        }
    })

}





async function add_Anode_from_other(node_class, node_type){

    var selected_node = _jm.get_selected_node();

    for(key in selected_node){

        if(key == "id"){

            var parent_id = selected_node[key];

        }

    }

    var nodeid = jsMind.util.uuid.newid();//idの生成

    var topic = document.getElementById("selected").innerHTML;
    var node = _jm.add_node(selected_node, nodeid, topic);

    var jmnode = document.getElementsByTagName("jmnode");

    for(var i=0; i<jmnode.length; i++){

        if(parent_id == jmnode[i].getAttribute("nodeid")){

            var p_concept = jmnode[i].getAttribute("concept_id");

        }

    }

    for(var j=0; j<jmnode.length; j++){

        if(nodeid == jmnode[j].getAttribute("nodeid")){

            jmnode[j].setAttribute("concept_id",p_concept);
            jmnode[j].setAttribute("class",node_class);
            jmnode[j].setAttribute("type",node_type);
            jmnode[j].setAttribute("parent_id",parent_id);

            try {
                var type_name = async function() {
                  return new Promise((resolve, reject) => {
                    $.ajax({
                      url: "php/get_Typeid.php",
                      type: "POST",
                      data: { class: node_class, type: node_type },
                      success: function(response) {
                        const result = JSON.parse(response);
                        resolve(result); 
                      },
                      error: function(error) {
                        console.log("エラー:", error);
                        reject(error);
                      }
                    });
                  });
                };
                // get_typeid の非同期処理が完了するまで待つ
                var node_type_id = await get_Typeid("", type_name);
              } catch (error) {
                console.log("エラーが発生しました:", error);
              }

            $.ajax({

                url: "php/insert_node.php",
                type: "POST",
                data: { insert : "node",
                        id : nodeid,
                        parent_id : parent_id,
                        type : node_type_id['node_type_id'],
                        concept_id : p_concept,
                        x : jmnode[j].style.left,
                        y : jmnode[j].style.top,
                        content : jmnode[j].innerHTML,
                    },

            });

            //yoshioka登録　追加ボタンより答えを追加したこと
            //渡す情報（ノードID，親ノードID，操作，テキスト，法造コンセプトID，タイプ，primary）
            Record_activities(nodeid,
                              parent_id,
                              "add",
                              jmnode[j].innerHTML,
                              p_concept,
                              node_type,
                              jsMind.util.uuid.newid()
                             );



        }

    }

    $.ajax({

        url: "php/update_node.php",
        type: "POST",
        data: { update : "map" }

    });

}

function show_selected_sheet(onoff){

    if (onoff == "on"){
        $('#jsmind_container').css('height','calc(50% - 42.5px)');
        $('#jsmind_container2').css('height','calc(50% - 42.5px)');
        $('#jsmind_container2').css('display','flex');
        $('#jsmind_container2_menu').css('display','block');
    }
    else{
        reset_annotation();

        $('#jsmind_container').css('height','100%');
        $('#jsmind_container2').css('height','100%');
        $('#jsmind_container2').css('display','none');
        $('#jsmind_container2_menu').css('display','none');
    }
}

function reset_annotation(){
    var elements = document.querySelectorAll('[type="user_s"]');

    // 見つかった要素を削除
    elements.forEach(function(element) {
        element.removeAttribute("type");
    });
}

function show_other_mindmap(button, map_id, parent_id=null){
    reset_annotation();
    if(map_id == "null"){
      return;
    }
  else{
    var button = document.getElementById("all_annotation");
    button.setAttribute("onClick", "show_other_mindmap(this, "+map_id+")");

    $.ajax({
      
      url: "php/user_sheet.php",
      type: "POST",
      data: { 
        // val : "user",
        user : map_id,
      },
      success: function(data){
        var obj = JSON.parse(data); // JSON型をパース
        console.log(obj);
        if(obj['user'] == ""){
          // alert("ユーザの取得に失敗しました．");
        }else{
            show_selected_sheet("on");
            // console.log("取得日時", obj['time']);

            // 配列に変換
            var node_array = new Array();
            node_array = obj['array'];
            console.log(node_array);

            // 表示する関数に受け渡す
            OpenPastSheet(node_array);
        }
      },
      error : function(msg, status){
        alert('通信ができない状態です。');
      }
    })

    if (parent_id != null){
        Rebuild_paper3("paper_area",map_id, parent_id);  
    }
    else{
        Rebuild_paper2("paper_area",map_id);
    }
  }
}

function show_other_mindmap_all(){

    //nodeid取得
    nodeid = get_selected_nodeid();
    console.log(nodeid);
    
    $.ajax({

        url: "php/get_other_annotation.php",
        type: "POST",
        data: { val : "get_conceptid",
                id : nodeid
              },
        success: function(conceptid){
            
            if(conceptid =="[]"){
                console.log('fin');
                return;
            }
            conceptid = conceptid.substring(2, 20);
            
            
            $.ajax({

                url: "php/get_other_annotation.php",
                type: "POST",
                data: { val : "get_question",
                        id : conceptid
                      },
                success: function(question){
                    result = JSON.parse(question);
                    var Array = result;
                    console.log(Array);
                    create_mindmapbutton(Array, "node");
                }
            });

        }
    })
}

function test(){
    console.log("ok");
}

function hightlight(char){
    if (char == "konkyo"){
        char.setAttribute("judge", "on");
    }
}