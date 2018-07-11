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
        if (this.user().data.mainQuestionIndex <= -1) {
            this.user().data.mainQuestionIndex = 0;
        }
        if (survey !== undefined) {

            // let { mainQuestionIndex, subQuestionIndex } = this.user().data;

            let speech, mainQuestion, subQuestion;

            if (this.user().data.mainQuestionIndex === undefined && this.user().data.subQuestionIndex === undefined) {
                this.user().data.mainQuestionIndex = 0;
                this.user().data.subQuestionIndex = 0;
                this.user().data.prevIntent;
            }
            if (this.user().data.mainQuestionIndex - 1 === survey.surveyQuestions.length) {
                console.log("survey finished");
                this.tell("survey finished");
            } else {

                for (let i = this.user().data.mainQuestionIndex; i < survey.surveyQuestions.length; i++) {

                    if (survey.surveyQuestions[i].hasOwnProperty('surveyQuestions')) {

                        if (this.user().data.subQuestionIndex === survey.surveyQuestions[i].surveyQuestions.length) {
                            console.log("When reset indexes to read main question")
                            this.user().data.subQuestionsFinished = true;
                            this.user().data.mainQuestionIndex++;
                            this.user().data.subQuestionIndex = 0;
                            this.user().data.prevIntent = null;
                        }
                        for (let j = this.user().data.subQuestionIndex; j < survey.surveyQuestions[i].surveyQuestions.length; j++) {

                            checkUserInput.call(this, i, j);

                            subQuestion = survey.surveyQuestions[i].surveyQuestions[j].question;
                            mainQuestion = survey.surveyQuestions[i].question;

                            this.user().data.subQuestionsFinished;

                            console.log("MAIN QUESTION: ", mainQuestion, '\nSUB QUESTION :', subQuestion);
                            if (this.user().data.prevIntent) {

                                console.log("Time to read sub question")
                                checkUserInput.call(this, i, j);
                                this.ask(subQuestion);
                                this.user().data.subQuestionIndex++;

                            } else if (this.user().data.prevIntent === null) {
                                console.log("if null");
                                checkUserInput.call(this, i, j);
                                mainQuestion = survey.surveyQuestions[i + 1].question;
                                this.ask(mainQuestion);
                                this.user().data.subQuestionIndex = 0;
                                this.user().data.toWithoutProperty = true;
                                this.user().data.toSimpleQuestions = true;
                                // this.user().data.mainQuestionIndex++;
                            } else {
                                console.log("if no prev intent");
                                this.ask(mainQuestion);
                                checkUserInput.call(this, i, j);
                            }

                            break;
                        }
                        break;
                    }
                    else {
                        console.log("Without property");
                        if (survey.surveyQuestions[i + 1] !== undefined) {
                            this.user().data.mainQuestionIndex++;
                            mainQuestion = survey.surveyQuestions[i + 1].question;
                            this.ask(`${mainQuestion}`);
                            checkUserInput.call(this, i, j);
                        } else {
                            this.tell("Survey finished");
                        }
                        // }

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
    },
    'END': function () {
        console.log("***********STOPPED***************");
        console.log("REASON: ", this.requestObj.request.reason);
        if (this.requestObj.request.reason === 'EXCEEDED_MAX_REPROMPTS') {
            this.tell("Come later");
            this.user().data.subQuestionIndex--;
        } else {
            if (this.user().data.prevIntent) {
                console.log("subQuestionIndex-- if PrevIntent True");
                this.user().data.subQuestionIndex--;
                delete this.user().data.prevIntent;
            }

            if (this.user().data.prevIntent === null && this.user().data.toWithoutProperty === true && this.user().data.toSimpleQuestions && !this.user().subQuestionsFinished) {
                this.user().data.mainQuestionIndex--;
            }

            if (this.user().data.subQuestionsFinished && this.user().data.prevIntent) {
                this.user().data.mainQuestionIndex--;
                delete this.user().data.subQuestionsFinished;
                delete this.user().data.prevIntent;
            }

            if (this.user().data.prevIntent === null && this.user().data.toWithoutProperty === true) {
                // this.user().data.mainQuestionIndex--;
                delete this.user().data.subQuestionsFinished;
                delete this.user().data.prevIntent;
                delete this.user().data.toWithoutProperty;
            }

            if (this.user().data.toSimpleQuestions) {
                this.user().data.mainQuestionIndex--;
            }
            this.tell("ok");
        }

    },
});

module.exports.app = app;

function checkUserInput(i, j) {
    let inputs = this.getInputs();
    console.log("slot: ", inputs);
    if (Object.keys(inputs).length > 0 && (inputs['numberAnswer'].value !== undefined || inputs['customAnswer'].value !== undefined)) {

        if (survey.surveyQuestions[i].hasOwnProperty('surveyQuestions')) {
            let arr = survey.surveyQuestions[i].surveyQuestions[j].questionAnswers;
            console.log("arr: ", arr);
            for (let k = 0; k < arr.length; k++) {

                if (inputs['numberAnswer'].value !== undefined) {
                    if (inWords(inputs['numberAnswer'].value).replace(/ /g, '') === arr[k].answer.toLowerCase()) {
                        console.log("matchedValue = ", arr[k].answer);
                    }
                } else if (inputs['numberAnswer'].value !== '?') {
                    console.log("WRONG SLOT VALUE")
                }

            }

        } else {
            console.log("NO PROPERTY");
        }
    }
}

let a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
let b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function inWords(num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + ' ' : '';
    return str;
}
