var current1, current2;
var options;
var scores;

$(".load").click(function () {
  //$('.collapse').collapse();
  $("#download").css("visibility", "visible");
  var input = $("textarea").val().split("\n");
  $("tbody").empty();

  options = [];
  scores = [];

  for (var i = 0; i < input.length; i++) {
    var elements = input[i].split(",");
    var option = elements[0].replace(/^\s+|\s+$/g, "");

    if (elements.length < 2) var score = 1500.0;
    else var score = parseFloat(elements[1]);

    if (option != "") {
      $("tbody").append(
        '<tr><th scope="row">' +
          i +
          "</th><td>" +
          option +
          "</td><td>" +
          score +
          "</td></tr>"
      );
      scores.push(score);
      options.push(option);
    }
  }

  displayValues();
});

$(".downloadFile").click(function () {
  var csvFile = "data:text/csv;charset=utf-8,";
  var criterion = $("input").val();

  csvFile += "item," + criterion + " score\r\n";

  for (var i = 0; i < options.length; i++) {
    let row = options[i] + "," + scores[i];
    csvFile += row + "\r\n";
  }

  var encodedURI = encodeURI(csvFile);
  var link = document.createElement("a");

  link.setAttribute("href", encodedURI);
  link.setAttribute("download", "ranked by " + criterion + ".csv");
  document.body.appendChild(link);

  link.click();
});

$(".option").click(function () {
  var option = 2;
  var results;
  if ($(this).attr("id") == "option1") {
    option = 1;
    results = eloScore(scores[current1], scores[current2]);
  } else {
    results = eloScore(scores[current2], scores[current1]);
    results = results.reverse();
  }

  scores[current1] = results[0];
  setCellContentsAt(current1 + 1, 1, Math.round(scores[current1]));

  scores[current2] = results[1];
  setCellContentsAt(current2 + 1, 1, Math.round(scores[current2]));

  displayValues();
  updateProgress();
});

function displayValues() {
  current1 = Math.ceil(options.length * Math.random()) - 1;
  current2 = current1;

  while (current2 == current1) {
    current2 = Math.ceil(options.length * Math.random()) - 1;
  }

  $("#option1").html(getCellContentsAt(current1 + 1, 0));
  $("#option2").html(getCellContentsAt(current2 + 1, 0));
}

function eloScore(winner, loser) {
  var kFactor = 32;
  var newWinner, newLoser;

  newWinner =
    winner + kFactor * (1 - 1 / (1 + Math.pow(10, (loser - winner) / 400)));
  newLoser =
    loser + kFactor * (-1 / (1 + Math.pow(10, (winner - loser) / 400)));

  return [newWinner, newLoser];
}

function setCellContentsAt(rowIndex, colIndex, newContents) {
  $("table")
    .find("tr:eq(" + rowIndex + ") td" + ":eq(" + colIndex + ")")
    .html("")
    .append(newContents);
}

function getCellContentsAt(rowIndex, colIndex) {
  return $("table")
    .find("tr:eq(" + rowIndex + ") td" + ":eq(" + colIndex + ")")
    .html();
}

function updateProgress() {
  var spread = Math.max(...scores) - Math.min(...scores);
  $(".progress-bar").width(spread / 5 + "%");

  if (spread / 5 > 80) {
    $(".progress-bar").addClass("bg-success");
  }
}

$(document).ready(function () {
  $(".load").trigger("click");
});
