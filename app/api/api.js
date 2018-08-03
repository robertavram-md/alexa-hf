const request = require('request');

class SurveyApi {
    getData(url) {
        return new Promise((resolve, reject) => {
            let options = {
                method: "GET",
                url: url,
                headers: {
                    "Content-type": "application/json",
                    "authorization": "Token d861efdadb51d035509be95d3c56280e3f9dec5e"
                }
            }

            request(options, (error, response, body) => {
                if(!error) {
                    resolve(body);
                } else {
                    reject(error);
                }
            }) 
        })
    }

    postData(url, data) {
        return new Promise((resolve, reject) => {
            let options = {
                method: "POST",
                url: url,
                headers: {
                    "Content-type": "application/json",
                    "authorization": "Token d861efdadb51d035509be95d3c56280e3f9dec5e"
                },
                body: JSON.stringify(data)
            }

            request(options, (error, response, body) => {
                if(!error) {
                    resolve(body);
                } else {
                    reject(error);
                }
            })

        })
    }
}

module.exports = SurveyApi;