
const fs = require("fs");
const requests = require('request');
const express = require('express');
const app = express();
const path = require('path');
let csc = require('country-state-city').City;
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded());
app.use(express.json());
app.use(express.urlencoded());

const hostname = "127.0.0.1";
const port = 30004;

const replaceval = (tempval, orgval) => {

  let celsiustemp = orgval.main.temp;
  let celsiustempmin = orgval.main.temp_min;
  let celsiustempmax = orgval.main.temp_max;

  celsiustempmin = Math.round(celsiustempmin - 273.15);
  celsiustempmax = Math.round(celsiustempmax - 273.15);
  celsiustemp = Math.round(celsiustemp - 273.15);

  let temperature = tempval.replace("{%tempval%}", celsiustemp);
  temperature = temperature.replace("{%tempmin%}", celsiustempmin);
  temperature = temperature.replace("{%tempmax%}", celsiustempmax);
  temperature = temperature.replace("{%location%}", orgval.name);
  temperature = temperature.replace("{%country%}", orgval.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgval.weather[0].main);
  temperature = temperature.replace("{%condition%}", orgval.weather[0].description);

  return temperature;
};
const staticpath = path.join(__dirname, "../public");

var homefile = fs.readFileSync('./CityTemp.html', "utf-8");
var getcity = fs.readFileSync('./index.html', 'utf-8');

app.get('/', (req, res) => {
  res.write(getcity);
  res.send();
})
app.post('/city', (req, res) => {
  let CityName = req.body;
  let Mycity = CityName.myCity;

  // let AllCities = csc.getAllCities();
  // for (i = 0; i < AllCities.length; i++) {
  //   if (Mycity == AllCities[i].name) {


  // console.log(AllCities[i].name)
        // alert('element found');

      requests(`https://api.openweathermap.org/data/2.5/weather?q=${Mycity}&appid=8d6f32fdf266ea94b8800f70e65813c8`)

        .on('data', (chunk) => {
          const objdata = JSON.parse(chunk);
          var arrData = [objdata];//converted object to array of objects 
          let realdata = arrData.map((val) => replaceval(homefile, val)).join("");
          res.write(realdata);
        })

        .on('end', (err) => {
          if (err) return console.log("connection lost due to", err);
          res.end();
        });
    // }
    // else {
    //      alert("your details are recieved");
    // }
  
});
app.use(express.static(staticpath));

app.use(express.static('./'));

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
