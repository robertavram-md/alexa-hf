'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const { App } = require('jovo-framework');
const fs = require('fs');


const config = {
    logging: true,
};

const app = new App(config);

let path = './survey_data/survey.json';
let content = function () {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        })
    })
}


// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    'LAUNCH': function () {
        content().then(survey => {
            this.user().data.surveyObject = JSON.parse(survey);
        });

        this.toIntent('GetFirstSurveyIntent');
    },
    'GetFirstSurveyIntent': function () {
        if (this.user().data.surveyObject !== undefined) {
            let speech, mainQuestion, subQuestion;

            if (this.user().data.mainQuestionIndex === undefined && this.user().data.subQuestionIndex === undefined) {
                this.user().data.mainQuestionIndex = 0;
                this.user().data.subQuestionIndex = 0;
            }
            if (this.user().data.mainQuestionIndex === this.user().data.surveyObject.surveyQuestions.length) {
                console.log("survey finished");
                this.tell("survey finished");

            } else {
                for (let i = this.user().data.mainQuestionIndex; i < this.user().data.surveyObject.surveyQuestions.length; i++) {

                    if (this.user().data.surveyObject.surveyQuestions[i].hasOwnProperty('surveyQuestions')) {

                        mainQuestion = this.user().data.surveyObject.surveyQuestions[i].question;

                        for (let j = this.user().data.subQuestionIndex; j < this.user().data.surveyObject.surveyQuestions[i].surveyQuestions.length; j++) {

                            subQuestion = this.user().data.surveyObject.surveyQuestions[i].surveyQuestions[j].question;

                            this.tell(subQuestion);

                            this.user().data.subQuestionIndex++;

                            if (this.user().data.subQuestionIndex === this.user().data.surveyObject.surveyQuestions[i].surveyQuestions.length) {
                                this.user().data.subQuestionsFinished = true;
                                this.user().data.mainQuestionIndex++;
                                this.user().data.subQuestionIndex = 0;
                                console.log("go to next question");
                            }
                            break;
                        }
                        break;
                    }
                    else {

                        mainQuestion = this.user().data.surveyObject.surveyQuestions[i].question;
                        this.tell(`${mainQuestion}`);
                        this.user().data.mainQuestionIndex++;

                        break;

                    }
                }
            }
        }
    }
});

module.exports.app = app;
