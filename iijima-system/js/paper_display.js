
const paper_display = document.getElementById("paper_display");
const highlight_conmenu = document.getElementById("highlight_conmenu");

paper_display.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    highlight_conmenu.style.left = `${event.pageX}px`;
    highlight_conmenu.style.top = `${event.pageY}px`;
    highlight_conmenu.style.display = "block";
});