var weatherStatus = {
  0 : {
    name :  'tornado',
    image : 'images/' 
  },
  1 : {
    name :  'tropical storm',
    image : 'images/' 
  },
  2 : {
    name :  'hurricane',
    image : 'images/' 
  },
  3 : {
    name :  'severe thunderstorms',
    image : 'images/15.png' 
  },
  4 : {
    name :  'thunderstorms',
    image : 'images/16.png' 
  },
  5 : {
    name :  'mixed rain and snow',
    image : 'images/29.png' 
  },
  6 : {
    name :  'mixed snow and sleet',
    image : 'images/29.png' 
  },
  7 : {
    name :  'mixed rain and sleet',
    image : 'images/29.png' 
  },
  8 : {
    name :  'freezing drizzle',
    image : 'images/21.png' 
  },
  9 : {
    name :  'drizzle',
    image : 'images/14.png' 
  },
  10 : {
    name :  'freezing rain',
    image : 'images/21.png' 
  },
  11 : {
    name :  'showers',
    image : 'images/13.png' 
  },
  12 : {
    name :  'showers',
    image : 'images/13.png' 
  },
  13 : {
    name :  'snow flurries',
    image : 'images/29.png' 
  },
  14 : {
    name :  'light snow showers',
    image : 'images/19.png' 
  },
  15 : {
    name :  'blowing snow',
    image : 'images/22.png' 
  },
  16 : {
    name :  'snow',
    image : 'images/23.png' 
  },
  17 : {
    name :  'hail',
    image : 'images/26.png' 
  },
  18 : {
    name :  'sleet',
    image : 'images/20.png' 
  },
  19 : {
    name :  'dust',
    image : 'images/20.png' 
  },
  20 : {
    name :  'foggy',
    image : 'images/11.png' 
  },
  
  21 : {
    name :  'haze',
    image : 'images/11.png' 
  },
  22 : {
    name :  'smoky',
    image : 'images/11.png' 
  },
  23 : {
    name :  'blustery',
    image : 'images/08.png' 
  },
  24 : {
    name :  'windy',
    image : 'images/32.png' 
  },
  25 : {
    name :  'cold',
    image : 'images/31.png' 
  },
  26 : {
    name :  'cloudy',
    image : 'images/08.png' 
  },
  27 : {
    name :  'mostly cloudy (night)',
    image : 'images/39.png' 
  },
  28 : {
    name :  'mostly cloudy (day)',
    image : 'images/07.png' 
  },
  29 : {
    name :  'partly cloudy (night)',
    image : 'images/36.png' 
  },
  30 : {
    name :  'partly cloudy (day)',
    image : 'images/04.png' 
  },

  31 : {
    name :  'clear (night)',
    image : 'images/33.png' 
  },
  32 : {
    name :  'sunny',
    image : 'images/01.png' 
  },
  33 : {
    name :  'fair (night)',
    image : 'images/34.png' 
  },
  34 : {
    name :  'fair (day)',
    image : 'images/02.png' 
  },
  35 : {
    name :  'mixed rain and hail',
    image : 'images/26.png' 
  },
  36 : {
    name :  'hot',
    image : 'images/30.png' 
  },
  37 : {
    name :  'isolated thunderstorms',
    image : 'images/15.png' 
  },
  38 : {
    name :  'scattered thunderstorms',
    image : 'images/16.png' 
  },
  39 : {
    name :  'scattered thunderstorms',
    image : 'images/16.png' 
  },
  40 : {
    name :  'scattered showers',
    image : 'images/14.png' 
  },

  41 : {
    name :  'heavy snow',
    image : 'images/23.png' 
  },
  42 : {
    name :  'scattered snow showers',
    image : 'images/21.png' 
  },
  43 : {
    name :  'heavy snow',
    image : 'images/23.png' 
  },
  44 : {
    name :  'partly cloudy',
    image : 'images/04.png' 
  },
  45 : {
    name :  'thundershowers',
    image : 'images/15.png' 
  },
  46 : {
    name :  'snow showers',
    image : 'images/29.png' 
  },
  47 : {
    name :  'isolated thundershowers',
    image : 'images/15.png' 
  },
  3200 : {
    name :  'not available',
    image : 'images/error.png' 
  }
};

function callback(data){
    // alert("asdasdads");
    var forecast = data.query.results.channel.item.forecast;
    var status = weatherStatus[forecast[0].code];
    document.getElementById("resultado").innerHTML = JSON.stringify(status); 
    document.getElementById("resultado").innerHTML +='<img src="style/'+status.image+'">'
}

