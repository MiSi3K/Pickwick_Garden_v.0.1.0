 <!-- ------------------------------------------------------------
<!-- START UP FUNCTIONS------------------------------------------
<!-- ------------------------------------------------------------
$(function loadState() {
	$.getJSON('/_LoadSettings', function(data) {
		var sectionStateM = data.exStateM;
		var sectionTimeM = data.exTimeM;
		var Schedule = data.exSchedule;
		var sectionStateA = data.exStateA;
		var sectionTimeA = data.exTimeA;
		var flipStateM, fliperM, slideM, flipStateA, fliperA, slideA, vCheck;
		for (var i = 1; i < 7; i++) {
			fliperM = "#flip_" + i;
			slideM = "#slider_" + i;
			fliperA = "#flip_" + (i+6);
			slideA = "#slider_" + (i+6);
			if (sectionStateM[i-1]==1) {flipStateM='on';}
			else {flipStateM='off';}
			if (sectionStateA[i-1]==1) {flipStateA='on';}
			else {flipStateA='off';}
			$(fliperM).val(flipStateM).slider('refresh');
			$(slideM).val(sectionTimeM[i-1]).slider('refresh');
			$(fliperA).val(flipStateA).slider('refresh');
			$(slideA).val(sectionTimeA[i-1]).slider('refresh');
			turn_off(i);
			turn_off(i+6);
			}
		for (var i = 0; i < 24; i++) {
			vCheck = "#check_" + i;
			if (Schedule[i] == 1) {$(vCheck).prop('checked', true);}
			else {$(vCheck).prop('checked', false);}
			$(vCheck).checkboxradio('refresh');
			}
		displaySummary();
	})	
})
<!-- ------------------------------------------------------------
$(function statusUpdate() {
	$.getJSON('/_status', function(data) {
		if (data.sRunning == false) {
			vStatus = "idle";
			$('#bManual').prop('disabled', false);
			$('#bLoad').prop('disabled', false);
			$('#bLoadA').prop('disabled', false);
			$('#bLoadM').prop('disabled', false);
			$('#bSave').prop('disabled', false);
			$('#bSaveA').prop('disabled', false);
			$('#bSaveM').prop('disabled', false);
			}
		else {
			vStatus = "working";
			$('#bManual').prop('disabled', true);
			$('#bLoad').prop('disabled', true);
			$('#bSave').prop('disabled', true);
			$('#bLoadA').prop('disabled', true);
			$('#bSaveA').prop('disabled', true);
			$('#bLoadM').prop('disabled', true);
			$('#bSaveM').prop('disabled', true);
			}
		if (data.sAutomatic == true) {
			vMode = "automatic mode";
			$('#bManual').prop('disabled', true);
			}
		else {
			vMode = "manual mode";
			$('#bManual').prop('disabled', false);
			}
		document.getElementById('status').innerHTML = "System is " + vStatus + " in " + vMode;
		document.getElementById('comment_1').innerHTML = data.sComment1;
		document.getElementById('comment_2').innerHTML = data.sComment2;
		})
	setTimeout(statusUpdate, 500);
})
<!-- ------------------------------------------------------------
$(function startTime() {
	var today = new Date();
	var h = today.getHours();
	var m = today.getMinutes();
	var s = today.getSeconds();
	var y = today.getFullYear();
	var d = today.getDate();

	m = correctTime(m);
	s = correctTime(s);
	d = correctTime(d);


	var days_array = ["Sun", "Mon", "Tue", "Wed", "Thr", "Fri", "Sat"];
	var months_array = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	document.getElementById('time').innerHTML = h + ":" + m + ":" + s;
	document.getElementById('date').innerHTML = days_array[today.getDay()] + ", " + d + " " + months_array[today.getMonth()] + " " + y;
	setTimeout(startTime, 500);
})
<!-- ------------------------------------------------------------
$(function startWeather() {
	var e = "http://api.openweathermap.org/data/2.5/weather?id=769106&units=metric&APPID=b2618169573c7650ef35a93cfbd09e99";
	$.get(e,function(data){
	document.getElementById('temperature').innerHTML = "Temperature: " + data.main.temp.toFixed(1) + " &degC";
	document.getElementById('humidity').innerHTML = "Humidity: " + data.main.humidity + "%";
	document.getElementById('weather_general').innerHTML = "Conditions: " + data.weather[0].main;
	if (data.rain == undefined) {vrain = "0"} else {vrain = data.rain}
	document.getElementById('rain').innerHTML = "Rain: " + vrain + " L";
		},"json");
	var weather_timeout = setTimeout(startWeather, 600000);
})
<!-- ------------------------------------------------------------
<!-- OTHER FUNCTIONS------------------------------------
<!-- ------------------------------------------------------------
function turn_off(i) {
	var fliper = "#flip_" + i;
	var slide = "#slider_" + i;
	if ($(fliper).val() == 'on') {$(slide).slider("enable");} 
	else {$(slide).slider("disable");}
}
<!-- ------------------------------------------------------------
function correctTime(i) {
	if (i < 10) {i = "0" + i};
	return i;
}	
<!-- ------------------------------------------------------------
function displaySummary() {
	var zbior_status = [];
	var zbior_time = [];
	var fliper, slide, text_status, text_time;
	for (var i = 1; i < 7; i++) {
		fliper= "#flip_" + i;
		slide = "#slider_" + i;
		zbior_status[i-1]=$(fliper).val();
		zbior_time[i-1]=$(slide).val();
		text_status = "tSectionM_" + i;
		text_time = "tTimeM_" + i;
		document.getElementById(text_time).innerHTML = zbior_time[i-1];
		document.getElementById(text_status).innerHTML = zbior_status[i-1];
	}
	for (var i = 1; i < 7; i++) {
		fliper= "#flip_" + (i+6);
		slide = "#slider_" + (i+6);
		zbior_status[i-1]=$(fliper).val();
		zbior_time[i-1]=$(slide).val();
		text_status = "tSectionA_" + i;
		text_time = "tTimeA_" + i;
		document.getElementById(text_time).innerHTML = zbior_time[i-1];
		document.getElementById(text_status).innerHTML = zbior_status[i-1];
	}
}
<!-- ------------------------------------------------------------
function run_me() {
	$.getJSON('_sprinkler');
}
<!-- ------------------------------------------------------------
function save_me() {
	var statusM = [];
	var timeM = [];
	var statusA = [];
	var timeA = [];
	var Schedule = [];
	displaySummary();
	for (var i = 1; i < 7; i++) {
		var text_statusM, text_timeM, text_statusA, text_timeA;
		text_statusM = "tSectionM_" + i;
		text_timeM = "tTimeM_" + i;
		text_statusA = "tSectionA_" + i;
		text_timeA = "tTimeA_" + i;
		
		timeM[i-1] = document.getElementById(text_timeM).innerHTML; 
		timeA[i-1] = document.getElementById(text_timeA).innerHTML; 
		if (document.getElementById(text_statusM).innerHTML == 'on') 
			{statusM[i-1] = "1"} 
		else {statusM[i-1] = "0"};
		if (document.getElementById(text_statusA).innerHTML == 'on') 
			{statusA[i-1] = "1"} 
		else {statusA[i-1] = "0"};
	}
	for (var i = 0; i < 24; i++) {
		var vSchedule;
		var vCheck = "#check_" + i;
		if ($(vCheck).prop('checked') == true) {vSchedule = 1;}
		else {vSchedule = 0;}
		Schedule[i]= vSchedule;
	}
	$.getJSON('_SaveSettings',{statusM1: statusM[0], statusM2: statusM[1], statusM3: statusM[2], statusM4: statusM[3], 
	statusM5: statusM[4], statusM6: statusM[5], timeM1: timeM[0], timeM2: timeM[1], timeM3: timeM[2], timeM4: timeM[3],
	timeM5: timeM[4], timeM6: timeM[5], statusA1: statusA[0], statusA2: statusA[1], statusA3: statusA[2], statusA4: statusA[3], 
	statusA5: statusA[4], statusA6: statusA[5], timeA1: timeA[0], timeA2: timeA[1], timeA3: timeA[2], timeA4: timeA[3],
	timeA5: timeA[4], timeA6: timeA[5], Schedule0: Schedule[0], Schedule1: Schedule[1], Schedule2: Schedule[2], Schedule3: Schedule[3], 
	Schedule4: Schedule[4], Schedule5: Schedule[5], Schedule6: Schedule[6], Schedule7: Schedule[7], Schedule8: Schedule[8], Schedule9: Schedule[9], 
	Schedule10: Schedule[10], Schedule11: Schedule[11], Schedule12: Schedule[12], Schedule13: Schedule[13], Schedule14: Schedule[14], Schedule15: Schedule[15], 
	Schedule16: Schedule[16], Schedule17: Schedule[17], Schedule18: Schedule[18], Schedule19: Schedule[19], Schedule20: Schedule[20], Schedule21: Schedule[21], 
	Schedule22: Schedule[22], Schedule23: Schedule[23]});
}
<!-- ------------------------------------------------------------
function stop_me() {
	$.getJSON('/_stop');
}
<!-- ------------------------------------------------------------
function manual() {
	$.getJSON('/_automatic')
}
<!-- ------------------------------------------------------------
function load_me () {
		$.getJSON('/_LoadSettings', function(data) {
		var sectionStateM = data.exStateM;
		var sectionTimeM = data.exTimeM;
		var Schedule = data.exSchedule;
		var sectionStateA = data.exStateA;
		var sectionTimeA = data.exTimeA;
		var flipStateM, fliperM, slideM, flipStateA, fliperA, slideA, vCheck;
		for (var i = 1; i < 7; i++) {
			fliperM = "#flip_" + i;
			slideM = "#slider_" + i;
			fliperA = "#flip_" + (i+6);
			slideA = "#slider_" + (i+6);
			if (sectionStateM[i-1]==1) {flipStateM='on';}
			else {flipStateM='off';}
			if (sectionStateA[i-1]==1) {flipStateA='on';}
			else {flipStateA='off';}
			$(fliperM).val(flipStateM).slider('refresh');
			$(slideM).val(sectionTimeM[i-1]).slider('refresh');
			$(fliperA).val(flipStateA).slider('refresh');
			$(slideA).val(sectionTimeA[i-1]).slider('refresh');
			turn_off(i);
			turn_off(i+6);
			}
		for (var i = 0; i < 24; i++) {
			vCheck = "#check_" + i;
			if (Schedule[i] == 1) {$(vCheck).prop('checked', true);}
			else {$(vCheck).prop('checked', false);}
			$(vCheck).checkboxradio('refresh');
			}
		displaySummary();
	})
}
