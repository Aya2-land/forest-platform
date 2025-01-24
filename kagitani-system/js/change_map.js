function ModeChangeButtonClick() {
    const selindex = document.target_mode.Select1;
    const num = selindex.selectedIndex;
    var ModeLabel = ["二分割モード", "思考整理マップ", "手段目標マップ"];
  
    console.log(num);
    console.log(ModeLabel);
    target = document.getElementById("output");
  
    if(num == 0){
      // 二分割モード：現在の状態
      $('#object_container').toggle('fast');
      $('#object_container').css('display','flex');
      $('#jsmind_container').css('width','calc((100vw - 315px)*0.4)');
      
      const parentWidth = $('#object_container').parent().width();
      $('#layout').css('width', `${parentWidth * 0.3}px`);
      $('#mind').show();
    }else if(num == 1){
      // 思考整理マップモード：layoutのみ表示
      $('#object_container').hide();  // ドキュメント非表示
      $('#myobject').hide();  // ドキュメント非表示
      $('#utterance_area').hide();  // ドキュメント非表示
      $('#layout').show();  // layoutを表示
      const parentWidth = $('#object_container').parent().width();
      $('#layout').css('width', `${parentWidth * 1.0}px`);  // layoutの横幅を2倍に変更
      $('#jsmind_nav').css('width', `${parentWidth * 1.008}px`);  // layoutの横幅を2倍に変更
    }else if(num == 2){
      // 手段目標マップモード：layout以外の部分を表示
      $('#layout').hide();  // layoutを非表示にする
      $('#jsmind_container').hide();  // jsMind コンテナ非表示
      $('#myobject').show();  // ドキュメント非表示
      $('#utterance_area').show();  // ドキュメント非表示
      $('#object_container').toggle('fast');
      $('#object_container').css('display','flex');
  
      // 画面全体に#object_containerを広げる
      $('#object_container').css('width', '600vw');  // 画面全体に設定
      $('#object_container').css('height', '60vh'); // 画面全体に設定
      $('#object_container').css('position', 'absolute'); // 絶対配置に設定
      $('#object_container').css('top', '80'); // 上端を0に設定
      $('#object_container').css('left', '0'); // 左端を0に設定
      $('#object_container').css('right', '0'); // 右端を0に設定
      $('#object_container').css('bottom', '100'); // 下端を0に設定
      //$('#object_container').css('grid-column', 'span 2'); // グリッドのカラムを跨るように設定
      const parentWidth = $('#object_container').parent().width();
      $('#object_container').css('width', `${parentWidth * 1.0}px`);  // layoutの横幅を2倍に変更
      $('#myobject').css('width', `${parentWidth * 1.008}px`);  // layoutの横幅を2倍に変更
  }
  
    jump_node("root");
  }
  