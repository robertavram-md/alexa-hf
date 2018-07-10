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
const survey = require('../survey_data/survey.json');

// =================================================================================
// App Logic
// =================================================================================
app.setHandler({
    'LAUNCH': function () {
        this.toIntent('GetFirstSurveyIntent');
    },
    'GetFirstSurveyIntent': function () {
        if (survey !== undefined) {
            let inputs = this.getInputs();
            // let { mainQuestionIndex, subQuestionIndex } = this.user().data;
            console.log("slots: ", inputs);
            let speech, mainQuestion, subQuestion;

            if (this.user().data.mainQuestionIndex === undefined && this.user().data.subQuestionIndex === undefined) {
                this.user().data.mainQuestionIndex = 0;
                this.user().data.subQuestionIndex = 0;
                this.user().data.prevIntent;
            }
            if (this.user().data.mainQuestionIndex === survey.surveyQuestions.length) {
                console.log("survey finished");
                this.tell("survey finished");
            } else {
                for (let i = this.user().data.mainQuestionIndex; i < survey.surveyQuestions.length; i++) {

                    if (survey.surveyQuestions[i].hasOwnProperty('surveyQuestions')) {

                        mainQuestion = survey.surveyQuestions[i].question;


                        if (this.user().data.subQuestionIndex === survey.surveyQuestions[i].surveyQuestions.length) {
                            console.log("go to main question")
                            this.user().data.subQuestionsFinished = true;
                            this.user().data.mainQuestionIndex++;
                            this.user().data.subQuestionIndex = 0;

                        }
                        for (let j = this.user().data.subQuestionIndex; j < survey.surveyQuestions[i].surveyQuestions.length; j++) {

                            subQuestion = survey.surveyQuestions[i].surveyQuestions[j].question;

                            this.user().data.subQuestionsFinished = false;


                            if (this.user().data.prevIntent && !this.user().data.subQuestionsFinished) {
                                this.ask(subQuestion);
                                this.user().data.subQuestionIndex++;
                                // this.user().data.prevIntent = false;
                            } else {
                                console.log("mainQuestion: ")
                                this.ask(mainQuestion);
                            }

                            break;
                        }
                        break;
                    }
                    else {

                        mainQuestion = survey.surveyQuestions[i].question;
                        this.ask(`${mainQuestion}`);
                        this.user().data.mainQuestionIndex++;

                        break;

                    }
                }
            }
        }
    },
    'ToAnswersIntent': function () {
        // console.log("this: ", this.requestObj.request.intent.name);
        this.user().data.prevIntent = true;
        this.toIntent('GetFirstSurveyIntent');
    },
    'AMAZON.RepeatIntent': function () {
        this.ask("Repeat");
    }
});

module.exports.app = app;
