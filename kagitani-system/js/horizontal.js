// let startX, startWidth;
// const resizable = document.querySelector("#layout");

// resizable.addEventListener("mousedown", (e) => {
//     startX = e.clientX;
//     startWidth = parseInt(document.defaultView.getComputedStyle(resizable).width, 10);
//     document.documentElement.addEventListener("mousemove", resize, false);
//     document.documentElement.addEventListener("mouseup", stopResize, false);
// });

// function resize(e) {
//     resizable.style.width = (startWidth + e.clientX - startX) + "px";
// }

// function stopResize() {
//     document.documentElement.removeEventListener("mousemove", resize, false);
//     document.documentElement.removeEventListener("mouseup", stopResize, false);
// }
