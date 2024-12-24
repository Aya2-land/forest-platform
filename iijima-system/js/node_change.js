



function add_Test_node(){

    
    var selected_node = _jm.get_selected_node();

    for(key in selected_node){

        if(key == "id"){

            var parent_id = selected_node[key];

        }

    }

    var nodeid = jsMind.util.uuid.newid();//idの生成
    // var versionid = jsMind.util.uuid.newid(); //hatakeyama

    var topic = 'New Node';
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
            jmnode[j].setAttribute("type","answer");
            jmnode[j].setAttribute("parent_id",parent_id);

            $.ajax({

                url: "php/insert_node.php",
                type: "POST",
                data: { insert : "node",
                        id : nodeid,
                        parent_id : parent_id,
                        type : "answer",
                        concept_id : p_concept,
                        x : jmnode[j].style.left,
                        y : jmnode[j].style.top,
                        content : jmnode[j].innerHTML,
                        class : "" },

            });

            //hatakeyama 「答えノード追加」ボタン
            // NodeInsert(
            //   versionid, 
            //   nodeid, 
            //   parent_id, 
            //   jmnode[j].innerHTML, 
            //   "",
            //   "add_new_node"
            // );
            // RecordRelation(2);   //relationテーブル
            // check_edit_reason(nodeid);
            // $('#comment_balloon').hide();
            // $('#comment_balloon').fadeIn(1000);


            //yoshioka登録　追加ボタンより答えを追加したこと
            //渡す情報（ノードID，親ノードID，操作，テキスト，法造コンセプトID，タイプ，primary）
            Record_activities(nodeid,
                              parent_id,
                              "add",
                              jmnode[j].innerHTML,
                              p_concept,
                              "answer",
                              jsMind.util.uuid.newid()
                             );



        }

    }
     



    $.ajax({

        url: "php/update_node.php",
        type: "POST",
        data: { update : "sheet" }

    });


}



// ノードのヴァージョン管理

