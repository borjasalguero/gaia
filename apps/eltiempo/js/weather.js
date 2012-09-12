var query = escape('select item from weather.forecast where location="SPXX0050" and u="c"'),
    url = "http://query.yahooapis.com/v1/public/yql?callback=callback&q=" + query + "&format=json"; 

alert(query);


var headID = document.getElementsByTagName("head")[0];         
var newScript = document.createElement('script');
newScript.type = 'text/javascript';
newScript.src = url;
headID.appendChild(newScript);
// $.getJSON(url, function(data) {
//   console.log( data );
// });