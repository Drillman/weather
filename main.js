const mongoose = require('mongoose')
const db = mongoose.connection
const Weather = require('./weatherData')
const async = require('async')
const http = require('http')
const cities = [
    {city:"Paris", country:"fr", "cityId": 2988507},
    {city:"Lyon", country:"fr"},
    {city:"Milan", country:"it"},
    {city:"Rome", country:"it"},
    {city:"Madrid", country:"es"}
]

mongoose.connect('mongodb://user:user123@ds161780.mlab.com:61780/weather-mongoose')
    db.on('error', console.error.bind(console, 'connection error:'))
    db.on('open', function(){
        console.log('Connection is done')
        init()
    })

function init(){
    async.series([
        function(callback){
            creatForecast(function(err, res){
                callback(err, res)
            })
        },
        function(callback){
            getAvgTempCountry(function(err, res){
                callback(err, res)
            })
        }
    ], function(err, results){
        if(err) console.error(err)
        console.log(results)
    })
}

function creatForecast(callback){
    async.eachSeries(cities, function(city, callback){
        let url = "http://api.openweathermap.org/data/2.5/forecast?q="+ city.city +","+ city.country +"&appid=0a54aa3d12e60f2116b65140a09246b1"
        httpGet(url, function(err,data){
            if(err) callback(err)
            console.log(data.city.name)
            let list = data.list
            async.eachSeries(list, function(forecast, callback){
                let newForecast = new Weather({
                    temp: forecast.main.temp - 273.15,
                    time: new Date(toDate(forecast.dt_txt)),
                    city: data.city.name,
                    country: data.city.country
                })
                newForecast.save(function(err){
                    if(err)callback(err)
                    callback()
                })
            }, function(err){
                if(err) callback(err)
                console.log('Documents created for '+data.city.name)
                callback()
            })  
        })
    },
    function(err){
        callback(err, 'Documents created')
    })
}

function getAvgTempCountry(callback){
    Weather.aggregate([
        {$group: {
            _id: "$country",
            temperature: {$avg: "$temp"},
            observations: {$sum:1}
        }},
        {$sort: {
            temperature: -1
        }}
    ])
    .exec(function(err, forecasts){
        callback(err, forecasts)
    })
}

function toDate(string){
    let res = string.replace(' ', 'T')
    res += "Z"
    return res
}

function httpGet(url, callback){
    http.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
            try{
                data = JSON.parse(data)
            }
            catch(e){
                callback(e, null)
            }
            callback(null, data);
        });
       
    }).on("error", (err) => {
        callback(err, null)
    });
}