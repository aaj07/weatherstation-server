var socket = io().connect();
// First we need to check, whether any mac has been selected. If so, we can send the initial request.
if (!$("#selectMacAddress").val()) {
  console.log("No mac address given. Time to fetch an update.");
} else {
  console.log($("#selectMacAddress").val());
  getUpdateForMac();
}
$(function () {
  $("#selectMacAddress").change(function () {
    console.log($("#selectMacAddress").val());
    getUpdateForMac();
  });
  socket.on("setMinAndMaxTimestampForMac", function (data) {
    console.log(data.min);
    console.log(data.max);
    createSliderWithRange(data.min, data.max, data.min, data.max);
  });

  socket.on("mac update", function (newMacAddress) {
    var ctxDropDownMacs = document.getElementById("selectMacAddress");
    var element = document.createElement("option");
    element.textContent = newMacAddress;
    element.value = newMacAddress;
    ctxDropDownMacs.appendChild(element);
  });
});

//- Create a slider based on the mac address
function createSliderWithRange(min, max, currentMinVal, currentMaxVal) {
  if ($("#slider_area").length) {
    $("#slider_area").empty();
  }
  var sliderElement = $('<div id="timeRangeSlider">').appendTo("#slider_area");
  sliderElement.slider({
    class: "span2",
    type: "text",
    min: min,
    max: max,
    value: [currentMinVal, currentMaxVal],
  });
  sliderElement.on("slide", function (slideEvt) {
    $("#timeRangeSliderMinVal").html(new Date(1000 * slideEvt.value[0]));
    $("#timeRangeSliderMaxVal").html(new Date(1000 * slideEvt.value[1]));
  });
  // Update the current chart.
  var timeStampFrom = $("#timeRangeSlider").data("slider").getValue()[0];
  var timeStampTo = $("#timeRangeSlider").data("slider").getValue()[1];
  getUpdateForChartBasedOnTimeStamps(timeStampFrom, timeStampTo);
  sliderElement.on("slideStop", function (slideEvt) {
    getUpdateForChartBasedOnTimeStamps(slideEvt.value[0], slideEvt.value[1]);
  });
}
