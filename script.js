var current1, current2;
var options;
var scores;
var similarProb = 0;

$(".load").click(function () {
  $("#download").css("visibility", "visible");
  var input = $("textarea").val().split("\n");
  $("tbody").empty();

  options = [];
  scores = [];

  for (var i = 0; i < input.length; i++) {
    var elements = input[i].split(",");
    var option = elements[0].replace(/^\s+|\s+$/g, "");

    var score = elements.length < 2 ? 1500.0 : parseFloat(elements[1]);

    if (option != "") {
      scores.push({ option: option, score: score });
    }
  }

  // Sort scores in descending order
  scores.sort((a, b) => b.score - a.score);
  console.log(scores);

  // Append sorted scores to the table
  for (var i = 0; i < scores.length; i++) {
    $("tbody").append(
      '<tr><th scope="row">' +
        i +
        "</th><td>" +
        scores[i].option +
        "</td><td>" +
        scores[i].score +
        "</td></tr>"
    );

    options.push(scores[i].option);
  }

  displayValues();
});

$(".downloadFile").click(function () {
  var csvFile = "data:text/csv;charset=utf-8,";
  var criterion = $("input").val();

  csvFile += "item," + criterion + " score\r\n";

  for (var i = 0; i < scores.length; i++) {
    let row = scores[i].option + "," + scores[i].score;
    csvFile += row + "\r\n";
  }

  var encodedURI = encodeURI(csvFile);
  var link = document.createElement("a");

  link.setAttribute("href", encodedURI);
  link.setAttribute("download", "ranked by " + criterion + ".csv");
  document.body.appendChild(link);

  link.click();
});

var totalGuesses = 0;
var correctGuesses = 0;

$(".option").click(function () {
  var option = 2;
  var results;
  var higherEloIndex, lowerEloIndex;
  var isCorrect = false;

  if ($(this).attr("id") == "option1") {
    option = 1;
    results = eloScore(scores[current1].score, scores[current2].score);
    higherEloIndex =
      scores[current1].score > scores[current2].score ? current1 : current2;
  } else {
    results = eloScore(scores[current2].score, scores[current1].score);
    results = results.reverse();
    higherEloIndex =
      scores[current2].score > scores[current1].score ? current2 : current1;
  }

  lowerEloIndex = higherEloIndex === current1 ? current2 : current1;

  scores[current1].score = results[0];
  setCellContentsAt(current1 + 1, 1, Math.round(scores[current1].score));

  scores[current2].score = results[1];
  setCellContentsAt(current2 + 1, 1, Math.round(scores[current2].score));

  // Check if the user's preference matches the higher ELO option
  if (
    (option === 1 && higherEloIndex === current1) ||
    (option === 2 && higherEloIndex === current2)
  ) {
    correctGuesses++;
    isCorrect = true;
  }
  totalGuesses++;

  // Update the stats display
  var accuracy = ((correctGuesses / totalGuesses) * 100).toFixed(0);
  var lastGuess = isCorrect ? "Correct" : "Incorrect";
  $("#stats").html(
    `Last guess: ${lastGuess}. ${correctGuesses}/${totalGuesses}. ${accuracy}%`
  );

  displayValues();
  updateProgress();
  sortTable();
});

function sortTable() {
  scores.sort((a, b) => b.score - a.score);
  $("tbody").empty();
  for (var i = 0; i < scores.length; i++) {
    $("tbody").append(
      '<tr><th scope="row">' +
        i +
        "</th><td>" +
        scores[i].option +
        "</td><td>" +
        scores[i].score +
        "</td></tr>"
    );
  }
}

function displayValues() {
  mode = "random";
  if (Math.random() < similarProb) {
    mode = "similar";
  }
  current1 = Math.ceil(options.length * Math.random()) - 1;
  current2 = current1;

  while (current2 == current1) {
    current2 = Math.ceil(options.length * Math.random()) - 1;
  }

  if (mode == "similar") {
    current1 = Math.ceil(options.length * Math.random()) - 1;
    do {
      current2 = current1 + Math.round(Math.random() / similarProb);
    } while (current2 == current1);
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
  var spread =
    Math.max(...scores.map((s) => s.score)) -
    Math.min(...scores.map((s) => s.score));
  $(".progress-bar").width(spread / 5 + "%");

  similarProb = (spread / 500) ** 3;

  if (spread / 5 > 80) {
    $(".progress-bar").addClass("bg-success");
  }
}

$(document).ready(function () {
  $(".load").trigger("click");
});
