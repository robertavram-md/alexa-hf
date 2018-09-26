const request = require('request');

let SurveyRequests = require('./api');
let r = new SurveyRequests();

class DataRequests{
    getSurvey() {
        return r.getData('http://149.28.47.110/api/surveys/');
    }

    getSurveyQuestions() {
        return this.getSurvey().then(survey => {
            let s = JSON.parse(survey);
            return r.getData(`http://149.28.47.110/api/questions/${s[0].id}`).then(q => {
                return JSON.parse(q);
            })
        })
    }

    sendUserAnswers(body) {
        return r.postData('http://149.28.47.110/api/user_answer/', body);
    }
    
    getAnswersData() {
        let urlToFetch = ['http://149.28.47.110/api/answerTypes/','http://149.28.47.110/api/answers/' ];
        let answersData = [];
        for(let i = 0; i < 2; i++) {
            answersData.push(() => r.getData(urlToFetch[i]));
        }
        let promisesArr = answersData.map(answerData => answerData());
        return Promise.all(promisesArr).then(result => {
            return result;
        })
    }
}

module.exports = DataRequests;

