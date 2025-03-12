const highlight_conmenu = document.getElementById("highlight_conmenu");
const documentArea = document.getElementById("document_area");
console.log(documentArea);
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

document.addEventListener("click", function (event) {
    if (!highlight_conmenu.contains(event.target)) {
        highlight_conmenu.style.display = "none";
        console.log("hairimashita");
    }
});

//ノードをクリックするとハイライトを表示する
function highlightRanges(selectedNodeId) {
    console.log(selectedNodeId);
    const currentNode = nodes.get(selectedNodeId);
    const classlist = currentNode.className === "paragraph" ? "paragraph-highlight" : "chapter-highlight";

    const currentNodeRange = currentNode.customData.range;
    currentNodeRange.forEach(span => {
        // 実際のDOM上の対応する `SPAN` を取得してクラスを追加
        const realSpan = document.querySelector(`span[char_id="${span}"]`);
        if (realSpan) {
            realSpan.classList.add("range-highlight");
        }
    });

    // // 選択範囲の内容をコピー
    // const rangeContents = currentNodeRange.cloneContents();

    // // `p_txt_` を含む `span` タグだけを取得
    // const spanElements = Array.from(rangeContents.querySelectorAll("span[char_id^='p_txt_']"));

    // // ハイライト適用
    // spanElements.forEach(span => {
    //     // 実際のDOM上の対応する `SPAN` を取得してクラスを追加
    //     const realSpan = document.querySelector(`span[char_id="${span.getAttribute("char_id")}"]`);
    //     if (realSpan) {
    //         realSpan.classList.add("range-highlight");
    //     }
    // });

    const currentNodeHighlightRange = currentNode.customData.highlight;
    currentNodeHighlightRange.forEach(span => {
        const realSpan = document.querySelector(`span[char_id="${span}"]`);
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

function otherHighlightRanges(otherSelectedNodeId) {
    const currentOtherNode = otherNodes.get(otherSelectedNodeId);
    const classlist = currentOtherNode.className === "paragraph" ? "other-paragraph-highlight" : "other-chapter-highlight";

    const currentOtherNodeRange = currentOtherNode.customData.range;
    currentOtherNodeRange.forEach(span => {
        const realSpan = document.querySelector(`span[char_id="${span}"]`);
        if (realSpan) {
            realSpan.classList.add("range-highlight");
        }
    });

    const currentOtherNodeHighlightRange = currentOtherNode.customData.highlight;
    currentOtherNodeHighlightRange.forEach(span => {
        const realSpan = document.querySelector(`span[char_id="${span}"]`);
        if (realSpan) {
            realSpan.classList.remove("range-highlight");
            realSpan.classList.add(classlist);
        }
    });
}

function myHighlights(selectedNodeId) {
    const currentNode = nodes.get(selectedNodeId);
    const classlist = currentNode.className === "paragraph" ? "paragraph-highlight" : "chapter-highlight";
    const currentNodeHighlightRange = currentNode.customData.highlight;
    currentNodeHighlightRange.forEach(span => {
        const realSpan = document.querySelector(`span[char_id="${span}"]`);
        if (realSpan) {
            realSpan.classList.remove("range-highlight");
            if (classlist === "paragraph-highlight" && realSpan.classList.contains("other-paragraph-highlight")) {
                realSpan.classList.remove("other-paragraph-highlight");
                realSpan.classList.add("mix-paragraph-highlight");
            } else if (classlist === "chapter-highlight" && realSpan.classList.contains("other-chapter-highlight")) {
                realSpan.classList.remove("other-chapter-highlight");
                realSpan.classList.add("mix-chapter-highlight");
            } else {
                realSpan.classList.add(classlist);
            }
        }
    });
}

//二つマップを表示した状態で編集するとハイライトが消えない
//マップを表示した状態で別のファイルを参照するとハイライトが消えるようにする

function otherHighlights(otherSelectedNodeId) {
    const currentOtherNode = otherNodes.get(otherSelectedNodeId);
    const classlist = currentOtherNode.className === "paragraph" ? "other-paragraph-highlight" : "other-chapter-highlight";
    const currentOtherNodeHighlightRange = currentOtherNode.customData.highlight;
    currentOtherNodeHighlightRange.forEach(span => {
        const realSpan = document.querySelector(`span[char_id="${span}"]`);
        if (realSpan) {
            realSpan.classList.remove("range-highlight");
            if (classlist === "other-paragraph-highlight" && realSpan.classList.contains("paragraph-highlight")) {
                realSpan.classList.remove("paragraph-highlight");
                realSpan.classList.add("mix-paragraph-highlight");
            } else if (classlist === "other-chapter-highlight" && realSpan.classList.contains("chapter-highlight")) {
                realSpan.classList.remove("chapter-highlight");
                realSpan.classList.add("mix-chapter-highlight");
            } else {
                realSpan.classList.add(classlist);
            }
        }
    });
}

function myCompareHighlightRanges(selectedNodeId) {
    const selectedNode = nodes.get(selectedNodeId);
    const targetIdentify = selectedNode.customData.identify;
    // const otherNode = otherNodes.get().find(node => node.customData?.identify === targetIdentify && node.className !== "tag");
    const otherNode = otherNodes.get({
        filter: node => node.customData?.identify === targetIdentify && node.className !== "tag"
    })[0];
    highlightRanges(selectedNodeId);
    if (otherNode) {
        otherNetwork.selectNodes([otherNode.id]);
        otherNodeLabel.value = otherNode.label;
        otherHighlights(otherNode.id);
    }
}

function otherCompareHighlightRanges(otherSelectedNodeId) {
    const otherSelectedNode = otherNodes.get(otherSelectedNodeId);
    console.log(otherSelectedNode);
    const targetIdentify = otherSelectedNode.customData.identify;
    console.log(targetIdentify);
    // const myNode = nodes.get().find(node => node.customData?.identify === targetIdentify && node.className !== "tag");
    const myNode = nodes.get({
        filter: node => node.customData?.identify === targetIdentify && node.className !== "tag"
    })[0];
    console.log(myNode);
    otherHighlightRanges(otherSelectedNodeId);
    if (myNode) {
        network.selectNodes([myNode.id]);
        nodeLabel.value = myNode.label;
        myHighlights(myNode.id);
        // network.emit("selectNode", { nodes: [myNode.id] });
    }
}

//自身のマップのノードの選択状態を解除
function myDeselectNode(otherSelectedNodeId) {
    const otherSelectedNode = otherNodes.get(otherSelectedNodeId);
    const targetIdentify = otherSelectedNode.customData.identify;
    // const myNode = nodes.get().find(node => node.customData?.identify === targetIdentify && node.className !== "tag");
    const myNode = nodes.get({
        filter: node => node.customData?.identify === targetIdentify && node.className !== "tag"
    })[0];
    if (myNode) {
        network.deselectNodes([myNode.id]);
        nodeLabel.value = "";
    }
}

//他者のマップのノードの選択状態を解除
function otherDeselectNode(selectedNodeId) {
    const selectedNode = nodes.get(selectedNodeId);
    const targetIdentify = selectedNode.customData.identify;
    // const otherNode = otherNodes.get().find(node => node.customData?.identify === targetIdentify && node.className !== "tag");
    const otherNode = otherNodes.get({
        filter: node => node.customData?.identify === targetIdentify && node.className !== "tag"
    })[0];
    if (otherNode) {
        otherNetwork.deselectNodes([otherNode.id]);
        otherNodeLabel.value = "";
    }
}

function saveHighlights() {
    highlight_conmenu.style.display = "none";
    const selection = window.getSelection();
    if (!selectedNodeId) {
        alert("紐づけるノードを選択してからハイライトしてください");
        selection.removeAllRanges();
        return;
    }
    const currentNode = nodes.get(selectedNodeId);

    const range = selection.getRangeAt(0);
    //選択範囲のchar_idを取得
    const selectedSpans = Array.from(range.cloneContents().querySelectorAll("span[char_id^='p_txt_']"));
    const selectedCharIds = selectedSpans.map(span => span.getAttribute("char_id"));

    //選択範囲が段落や章を超えていないか判定する
    const currentNodeRange = currentNode.customData.range;
    //ノードが管理する範囲(char_idの配列)と比較
    const isRangeInside = selectedCharIds.every(charId => currentNodeRange.includes(charId));

    if (!isRangeInside) {
        const classnameTojpn = currentNode.className === "paragraph" ? "段落" : "章";
        alert(`該当する${classnameTojpn}以外の範囲を選択しています`);
        selection.removeAllRanges();
        return;
    }
    // //選択範囲が段落や章を超えていないか判定する
    // const currentNode = nodes.get(selectedNodeId);
    // const currentNodeRange = currentNode.customData.range;
    // const isRangeInside = currentNodeRange.isPointInRange(range.startContainer, range.startOffset) && currentNodeRange.isPointInRange(range.endContainer, range.endOffset);

    // if (!isRangeInside) {
    //     const classnameTojpn = currentNode.className === "paragraph" ? "段落" : "章";
    //     alert(`該当する${classnameTojpn}以外の範囲を選択しています`);
    //     return;
    // }

    // currentNodeRange.push(range);
    console.log(currentNodeRange);
    console.log("highlight saved: ", selectedNodeId, range);   //ノードIDと対応しており，段落番号と対応してない

    const classlist = currentNode.className === "paragraph" ? "paragraph-highlight" : "chapter-highlight";

    // // 選択範囲の内容をコピー
    // const rangeContents = range.cloneContents();

    // // `p_txt_` を含む `span` タグだけを取得
    // const spanElements = Array.from(rangeContents.querySelectorAll("span[char_id^='p_txt_']"));

    let currentNodeHighlightRange = currentNode.customData.highlight;
    // ハイライト適用
    selectedSpans.forEach(span => {
        currentNodeHighlightRange.push(span.getAttribute("char_id"));    //Javascriptの仕様によりcustomData.highlightにも代入される
        // 実際のDOM上の対応する `SPAN` を取得してクラスを追加
        const realSpan = document.querySelector(`span[char_id="${span.getAttribute("char_id")}"]`);     //spanはコピーであるため，実際のDOMに変換する必要がある
        if (realSpan) {
            realSpan.classList.remove("range-highlight");
            realSpan.classList.add(classlist);
        }
    });
    console.log(currentNodeHighlightRange);


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

function allClearHighlights() {
    const highlightedElements = document.querySelectorAll(".paragraph-highlight, .chapter-highlight, .other-paragraph-highlight, .other-chapter-highlight, .mix-paragraph-highlight, .mix-chapter-highlight, .range-highlight");
    highlightedElements.forEach(element => {
        element.classList.remove("paragraph-highlight", "chapter-highlight", "other-paragraph-highlight", "other-chapter-highlight", "mix-paragraph-highlight", "mix-chapter-highlight", "range-highlight");
    });
}

function removeHighlights() {
    highlight_conmenu.style.display = "none";
    const selection = window.getSelection();

    if (!selectedNodeId) {
        alert("ハイライトを消すノードを選択してください");
        selection.removeAllRanges();
        return;
    }

    const currentNode = nodes.get(selectedNodeId);
    const range = selection.getRangeAt(0);
    //選択範囲のchar_idを取得
    const selectedSpans = Array.from(range.cloneContents().querySelectorAll("span[char_id^='p_txt_']"));
    const selectedCharIds = selectedSpans.map(span => span.getAttribute("char_id"));

    //選択範囲が段落や章を超えていないか判定する
    const currentNodeRange = currentNode.customData.range;
    const isRangeInside = selectedCharIds.every(charId => currentNodeRange.includes(charId));
    // const isRangeInside = currentNodeRange.isPointInRange(range.startContainer, range.startOffset) && currentNodeRange.isPointInRange(range.endContainer, range.endOffset);

    if (!isRangeInside) {
        const classnameTojpn = currentNode.className === "paragraph" ? "段落" : "章";
        alert(`該当する${classnameTojpn}以外の範囲を選択しています`);
        selection.removeAllRanges();
        return;
    }

    // DOM 上で対応する `span` タグからハイライトを削除
    // const spanElements = Array.from(range.cloneContents().querySelectorAll("span[char_id^='p_txt_']"));

    // `customData.highlight` から該当の `span` を削除
    currentNode.customData.highlight = currentNode.customData.highlight.filter(charId => {
        if (selectedCharIds.includes(charId)) {
            const realSpan = document.querySelector(`span[char_id="${charId}"]`);
            if (realSpan) {
                realSpan.classList.remove("paragraph-highlight", "chapter-highlight");
                realSpan.classList.add("range-highlight");
            }
            return false;    //削除対象
        }
        return true;   //残す
    });

    // let highlightArray = currentNode.customData.highlight;
    // highlightArray = highlightArray.filter(realSpan => {
    //     //realSpanと選択範囲のspanのうちidが同じものが一つでもあればrealSpanを削除する
    //     const shouldRemove = spanElements.some(span => span.getAttribute("char_id") === realSpan.getAttribute("char_id"));
    //     if (shouldRemove) {
    //         realSpan.classList.remove("paragraph-highlight", "chapter-highlight");
    //         realSpan.classList.add("range-highlight");
    //     }
    //     return !shouldRemove;
    // });

    // // 更新後の配列を `customData.highlight` に反映
    // currentNode.customData.highlight = highlightArray;

    //選択範囲を解除　デフォルトの水色のラインを消す
    selection.removeAllRanges();
}
