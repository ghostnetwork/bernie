
rightNowUTCToString = function() {
  var now = new Date();
  var utcDay = now.getUTCDay();
  var utcMonth = now.getUTCMonth();
  var utcDate = now.getUTCDate();
  var utcYear = now.getFullYear();
  var utcHours = now.getUTCHours();
  var utcMins = now.getUTCMinutes();
  var utcSecs = now.getUTCSeconds();
  var utcMillis = now.getUTCMilliseconds();
  
  var day = dayToShortString(utcDay);
  var month = monthToShortString(utcMonth);
  var result = day + ' ' 
             + month + ' ' 
             + padWithZeros(utcDate.toString(), 2) + ' ' 
             + utcYear + ' ' 
             + padWithZeros(utcHours.toString(), 2) + ':' 
             + padWithZeros(utcMins.toString(), 2) + ':' 
             + padWithZeros(utcSecs.toString(), 2) + ':' 
             + padWithZeros(utcMillis.toString(), 3);
  return result;
}

monthToString = function(month) {
  switch(month) {
    case  0: return "January";
    case  1: return "February";
    case  2: return "March";
    case  3: return "April";
    case  4: return "May";
    case  5: return "June";
    case  6: return "July";
    case  7: return "August";
    case  8: return "September";
    case  9: return "October";
    case 10: return "November";
    case 11: return "December";
    default: return null;
  }
}

monthToShortString = function(month) {
  switch(month) {
    case  0: return "Jan";
    case  1: return "Feb";
    case  2: return "Mar";
    case  3: return "Apr";
    case  4: return "May";
    case  5: return "Jun";
    case  6: return "Jul";
    case  7: return "Aug";
    case  8: return "Sep";
    case  9: return "Oct";
    case 10: return "Nov";
    case 11: return "Dec";
    default: return null;
  }
}

dayToString = function(day) {
  switch(day) {
    case 0: return "Sunday";
    case 1: return "Monday";
    case 2: return "Tuesday";
    case 3: return "Wednesday";
    case 4: return "Thursday";
    case 5: return "Friday";
    case 6: return "Saturday";
  }
}

dayToShortString = function(day) {
  switch(day) {
    case 0: return "Sun";
    case 1: return "Mon";
    case 2: return "Tue";
    case 3: return "Wed";
    case 4: return "Thu";
    case 5: return "Fri";
    case 6: return "Sat";
  }
}

leftPadWithZeros = function(text, length) {
  var result = text;
  if (typeof result == 'undefined' || notExisty(result)) return result;

  for (var i = 0; result.length < length; i++) {
    result += '0';
  }
  return result;
}

padWithZeros = function(text, length) {
  var result = '';
  if (typeof text == 'undefined' || notExisty(text)) return text;

  var numToAdd = length - text.length;
  // console.log('text: ' + text);
  // console.log('text.length: ' + text.length);
  // console.log('length: ' + length);
  // console.log('numToAdd: ' + numToAdd);
  
  for (var i = 0; i < numToAdd; i++) {
    result += '0';
  }
  result += text;

  return result;
}