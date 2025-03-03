const highlight_conmenu = document.getElementById("highlight_conmenu");
const documentArea = document.getElementById("document_area");
console.log(documentArea);

let highlightedRanges = [];
// const documentArea = document.getElementById("document_area");
// console.log(documentArea);

// function tohighlight() {

//     documentArea.addEventListener("contextmenu", function (event) {
//         event.preventDefault();

//         highlight_conmenu.style.left = `${event.pageX}px`;
//         highlight_conmenu.style.top = `${event.pageY}px`;
//         highlight_conmenu.style.display = "block";
//         console.log(highlight_conmenu);
//     });
// }

documentArea.addEventListener("contextmenu", function (event) {
    event.preventDefault();

    highlight_conmenu.style.left = `${event.pageX}px`;
    highlight_conmenu.style.top = `${event.pageY}px`;
    highlight_conmenu.style.display = "block";
    console.log(highlight_conmenu);
});

//ノードをクリックするとハイライトを表示する
function highlightRanges(selectedNodeId) {
    const currentNode = nodes.get(selectedNodeId);
    const classlist = currentNode.className === "paragraph" ? "paragraph-highlight" : "chapter-highlight";
    // const currentNodeRange = currentNode.info;

    const currentNodeRange = currentNode.customData.range;
    // 選択範囲の内容をコピー
    const rangeContents = currentNodeRange.cloneContents();

    // `p_txt_` を含む `span` タグだけを取得
    const spanElements = Array.from(rangeContents.querySelectorAll("span[char_id^='p_txt_']"));

    // ハイライト適用
    spanElements.forEach(span => {
        // 実際のDOM上の対応する `SPAN` を取得してクラスを追加
        const realSpan = document.querySelector(`span[char_id="${span.getAttribute("char_id")}"]`);
        if (realSpan) {
            realSpan.classList.add("range-highlight");
        }
    });

    const currentNodeHighlightRange = currentNode.customData.highlight;

    currentNodeHighlightRange.forEach(realSpan => {
        if (realSpan) {
            realSpan.classList.remove("range-highlight");
            realSpan.classList.add(classlist);
        }
    });


    // currentNodeRange.forEach((range, index) => {
    //     // if (index === 0) return;
    //     const rangeContents = range.cloneContents();

    //     const spanElements = rangeContents.querySelectorAll("span[char_id^='p_txt_']");

    //     spanElements.forEach(span => {
    //         const realSpan = document.querySelector(`span[char_id="${span.getAttribute("char_id")}"]`);
    //         if (realSpan) {
    //             if (index === 0) {
    //                 realSpan.classList.add("range-highlight");
    //             } else {
    //                 realSpan.classList.remove("range-highlight");
    //                 realSpan.classList.add(classlist);
    //             }
    //         }
    //     });
    // })
}

function saveHighlights() {
    highlight_conmenu.style.display = "none";
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    if (!selectedNodeId) {
        alert("紐づけるノードを選択してからハイライトしてください");
        selection.removeAllRanges();
        return;
    }

    //選択範囲が段落や章を超えていないか判定する
    const currentNode = nodes.get(selectedNodeId);
    // const currentNodeRange = currentNode.info;
    const currentNodeRange = currentNode.customData.range;
    // const isRangeInside = currentNodeRange[0].isPointInRange(range.startContainer, range.startOffset) && currentNodeRange[0].isPointInRange(range.endContainer, range.endOffset);
    const isRangeInside = currentNodeRange.isPointInRange(range.startContainer, range.startOffset) && currentNodeRange.isPointInRange(range.endContainer, range.endOffset);

    if (!isRangeInside) {
        const classnameTojpn = currentNode.className === "paragraph" ? "段落" : "章";

        alert(`該当する${classnameTojpn}以外の範囲を選択しています`);
        return;
    }

    // currentNodeRange.push(range);
    console.log(currentNodeRange);
    // highlightedRanges.push({ id: selectedNodeId, range: range });   //どのノードと対応付けるか，また選択範囲を保存
    console.log("highlight saved: ", selectedNodeId, range);   //ノードIDと対応しており，段落番号と対応してない

    // const highlightNode = nodes.get(selectedNodeId);

    const classlist = currentNode.className === "paragraph" ? "paragraph-highlight" : "chapter-highlight";

    // 選択範囲の内容をコピー
    const rangeContents = range.cloneContents();

    // `p_txt_` を含む `span` タグだけを取得
    const spanElements = Array.from(rangeContents.querySelectorAll("span[char_id^='p_txt_']"));

    let currentNodeHighlightRange = currentNode.customData.highlight;
    // ハイライト適用
    spanElements.forEach(span => {
        // 実際のDOM上の対応する `SPAN` を取得してクラスを追加
        const realSpan = document.querySelector(`span[char_id="${span.getAttribute("char_id")}"]`);
        if (realSpan) {
            realSpan.classList.remove("range-highlight");
            realSpan.classList.add(classlist);
            currentNodeHighlightRange.push(realSpan);
        }
    });



    //選択範囲を解除　デフォルトの水色のラインを消す
    selection.removeAllRanges();

    // const startContainer = range.startContainer; // 範囲の開始ノード
    // const endContainer = range.endContainer;     // 範囲の終了ノード
    // const startOffset = range.startOffset;      // 範囲の開始オフセット
    // const endOffset = range.endOffset;          // 範囲の終了オフセット

    // //選択範囲内の文字を囲むspanタグを取得
    // let selectedSpans = [];

    // //範囲内のノードを探索
    // let currentNode = startContainer;
    // console.log(startContainer);
    // console.log(endContainer);
    // console.log(startOffset);
    // console.log(endOffset);

    // while (currentNode !== null) {
    //     if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.tagName === "SPAN") {
    //         const charId = currentNode.getAttribute("char_id");
    //         if (charId && charId.startsWith("p_txt_")) {
    //             selectedSpans.push(currentNode);
    //         }
    //     }

    //     if (currentNode === endContainer) break;

    //     if (currentNode.nextSibling) {
    //         currentNode = currentNode.nextSibling;
    //     } else {
    //         while (currentNode.parentNode && !currentNode.parentNode.nextSibling) {
    //             currentNode = currentNode.parentNode;
    //         }
    //         currentNode = currentNode.parentNode ? currentNode.parentNode.nextSibling : null;
    //     }
    // }

    //  // ハイライト適用
    //  selectedSpans.forEach(span => {
    //     span.classList.add(classlist);
    // });

    // console.log("Highlighted spans:", selectedSpans);

    // while (currentNode !== null && currentNode !==endContainer) {
    //     if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.tagName === "SPAN") {
    //         selectedSpans.push(currentNode);
    //     }
    //     console.log(currentNode);
    //     currentNode = currentNode.nextSibling || currentNode.parentNode.nextSibling;
    // }
    // console.log(selectedSpans);

    // //取得したspanタグにハイライトを追加
    // selectedSpans.forEach(span => {
    //     span.classList.add(classlist);   //ハイライトクラスを追加
    // });

    // const cloneContents = ranges.cloneContents(); //範囲内のノードをコピー
    // const tempDiv = document.createElement("div");
    // tempDiv.appendChild(cloneContents);   //範囲内の内容を仮のdivに挿入

    // const lines = tempDiv.innerHTML.split("<br>");   //<br>タグで行を分ける

    // lines.forEach((line, index) => {
    //     const span = document.createElement("span");
    //     span.classList.add(classlist);

    //     span.innerHTML = line;

    //     ranges.insertNode(span);

    //     if (index < lines.length - 1) {
    //         // ranges.insertNode(document.createElement("br"));
    //     }
    // });

    // // 選択範囲内の各テキストノードを処理
    // let startNode = ranges.startContainer;
    // let endNode = ranges.endContainer;
    // let startOffset = ranges.startOffset;
    // let endOffset = ranges.endOffset;

    // if (startNode === Node.TEXT_NODE) {
    //     startNode.splitText(startOffset);
    // }

    // if (endNode === Node.TEXT_NODE) {
    //     endNode.splitText(endOffset);
    // }

    // //Rangeオブジェクトに対して直接処理
    // const span = document.createElement("span");
    // span.classList.add(classlist);

    // const extractedContents = ranges.extractContents();
    // span.appendChild(extractedContents);   //範囲の内容をspanに移動
    // ranges.insertNode(span);  //範囲を置き換える

    // //選択範囲がずれるのを防ぐために，選択範囲を再設定
    // const newRange = document.createRange();
    // newRange.selectNodeContents(ranges.startContainer);
    // selection.removeAllRanges();
    // selection.addRange(newRange);
    // 各文字がspanに囲まれているため，テキストだけのノードがない
    // ranges.surroundContents(span);

}

function clearHighlights() {
    //ハイライトを解除する
    const highlightedElements = document.querySelectorAll(".paragraph-highlight, .chapter-highlight, .range-highlight");
    highlightedElements.forEach(element => {
        element.classList.remove("paragraph-highlight", "chapter-highlight", "range-highlight");
    });
}

function removeHighlights() {
    highlight_conmenu.style.display = "none";
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    if (!selectedNodeId) {
        alert("ハイライトを消すノードを選択してください");
        selection.removeAllRanges();
        return;
    }

    const currentNode = nodes.get(selectedNodeId);

    //選択範囲が段落や章を超えていないか判定する
    const currentNodeRange = currentNode.customData.range;
    const isRangeInside = currentNodeRange.isPointInRange(range.startContainer, range.startOffset) && currentNodeRange.isPointInRange(range.endContainer, range.endOffset);

    if (!isRangeInside) {
        const classnameTojpn = currentNode.className === "paragraph" ? "段落" : "章";
        alert(`該当する${classnameTojpn}以外の範囲を選択しています`);
        return;
    }

    // DOM 上で対応する `span` タグからハイライトを削除
    const spanElements = Array.from(range.cloneContents().querySelectorAll("span[char_id^='p_txt_']"));

    // `customData.highlight` から該当の `span` を削除
    let highlightArray = currentNode.customData.highlight;
    highlightArray = highlightArray.filter(realSpan => {
        //realSpanと選択範囲のspanのうちidが同じものが一つでもあればrealSpanを削除する
        const shouldRemove = spanElements.some(span => span.getAttribute("char_id") === realSpan.getAttribute("char_id"));
        if (shouldRemove) {
            realSpan.classList.remove("paragraph-highlight", "chapter-highlight");
            realSpan.classList.add("range-highlight");
        }
        return !shouldRemove;
    });

    // 更新後の配列を `customData.highlight` に反映
    currentNode.customData.highlight = highlightArray;
}
