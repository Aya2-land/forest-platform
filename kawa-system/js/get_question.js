function get_question(){
    var element = document.getElementById("result");
    element.textContent = ""; // テキストを空にする


    $.ajax({

        url: "php/get_other_annotation.php",
        type: "POST",
        data: { val : "get_my_conceptid"},
        success: function(concept_id){
            
            if(concept_id =="[]"){
                console.log('fin');
                return;
            }
            conceptid_array = JSON.parse(concept_id);
            console.log(conceptid_array);
            
            
            $.ajax({

                url: "php/get_other_annotation.php",
                type: "POST",
                data: { val : "get_other_question",
                        array : conceptid_array,
                      },
                success: function(question){
                    result = JSON.parse(question);
                    var questionArray = result;
                    console.log(result);
                    var arrayDisplay = document.getElementById("result");
                    

                    for (var i = 0; i < questionArray.length; i++) {
                        

                        var button = document.createElement("button"); // 新しいボタン要素を作成
                        if (i == 0){
                            button.setAttribute("id", "selected");
                        }
                        else{
                            button.setAttribute("id", "answer_button"+i);
                        }
                        button.innerHTML = questionArray[i]["content"]; // ボタンのテキストを配列の要素に設定
                        button.setAttribute("data-map_id", questionArray[i]["map_id"]);
                        button.setAttribute("class", "b_que");
                        

                        arrayDisplay.appendChild(button); // ボタンを表示用の要素に追加                      
                    }
                    
                }
                
            });

        }
    })

}