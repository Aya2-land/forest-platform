<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Vis Network | Data | DataSet</title>

    <style type="text/css">
      html,
      #mynetwork {
        width: 100%;
        height: 400px;
        border: 1px solid lightgray;
      }
    </style>

  <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/vis/4.21.0/vis.min.js"></script>
  </head>

  <body>
    network
    <div id="logic_area">
      <div id="mynetwork" style="overflow: auto;"></div>
    </div>
    <div id="object_container">
      <input type="button" id="ln_addNode" value="ノード追加">
      <input type="button" id="ln_deleteNode" value="ノード削除">
      <input type="button" id="ln_startEditEdge" value="エッジ追加">
      <input type="button" id="ln_deleteEdge" value="エッジ削除">
    </div>
    <script type="text/javascript" src="js/logic_network.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  </body>
</html>