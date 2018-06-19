const http = require('http')
function httpGet(url, callback){
    http.get(url, (resp) => {
        let data = '';
       
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
       
        // The whole response has been received. Print out the result.
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

module.exports = httpGet