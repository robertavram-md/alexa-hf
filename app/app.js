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
const { mixedType, charType, charType2, charType3, charType4, numberType } = require('./questionTypes.js');

// =================================================================================
// App Logic
// =================================================================================
app.setHandler({
    'LAUNCH': function () {

        this.toIntent('GetFirstSurveyIntent');
    },
    'GetFirstSurveyIntent': function () {
        let inputs = this.getInputs();
        console.log("INPUTS: ", inputs);
        if (this.user().data.mainQuestionIndex <= -1) {
            this.user().data.mainQuestionIndex = 0;
        }
        if (this.user().data.subQuestionIndex <= -1) {
            this.user().data.subQuestionIndex = 0;
        }
        if (survey !== undefined) {



            let speech, mainQuestion, subQuestion;

            if (this.user().data.mainQuestionIndex === undefined && this.user().data.subQuestionIndex === undefined) {
                this.user().data.mainQuestionIndex = 0;
                this.user().data.subQuestionIndex = 0;
                this.user().data.prevIntent;
            }
            if (this.user().data.mainQuestionIndex === survey.surveyQuestions.length) {

                this.user().data = {};
                this.tell("survey finished");
            } else {

                try {
                    if (this.user().data.subQuestionIndex === survey.surveyQuestions[this.user().data.mainQuestionIndex].surveyQuestions.length) {
                        console.log("When reset indexes to read main question")
                        this.user().data.subQuestionsFinished = true;
                        this.user().data.mainQuestionIndex++;
                        this.user().data.subQuestionIndex = 0;
                        this.user().data.prevIntent = false;
                    }
                } catch (error) {
                    console.log("try_catch error: ", error);
                }

                for (let i = this.user().data.mainQuestionIndex; i < survey.surveyQuestions.length; i++) {


                    if (survey.surveyQuestions[i].hasOwnProperty('surveyQuestions')) {
                        this.user().data.hardQuestion = true;
                        delete this.user().data.simpleQueston;

                        for (let j = this.user().data.subQuestionIndex; j < survey.surveyQuestions[i].surveyQuestions.length; j++) {

                            subQuestion = survey.surveyQuestions[i].surveyQuestions[j].question;
                            mainQuestion = survey.surveyQuestions[i].question;

                            if (this.user().data.prevIntent === true) {

                                console.log("Time to read sub question")
                                // checkUserInput.call(this);
                                this.ask(subQuestion);
                                this.user().data.subQuestionIndex++;

                            } else if (this.user().data.prevIntent === false) {
                                console.log("if null");
                                // checkUserInput.call(this);
                                mainQuestion = survey.surveyQuestions[i].question;

                                this.ask(mainQuestion);

                            } else {
                                console.log("if no prev intent");

                                this.ask(mainQuestion);
                                delete this.user().data.subQuestionsFinished;

                            }

                            break;
                        }
                        break;
                    }
                    else {

                        this.user().data.simpleQueston = true;
                        delete this.user().data.hardQuestion;


                        if (survey.surveyQuestions[i] !== undefined) {

                            console.log("this.user().data.simpleQueston = true");
                            mainQuestion = survey.surveyQuestions[i].question;
                            this.user().data.mainQuestionIndex++;
                            this.ask(`${mainQuestion}`);


                        }
                        else {
                            this.tell("Survey finished");
                            this.user().data = {};
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
        if (this.user().data.simpleQueston === true) {
            this.ask("You can only answer with this variants: bla-bla-blah");
        } else if (this.user().data.hardQuestion === true) {
            this.user().data.prevIntent = true;
            this.toIntent('GetFirstSurveyIntent');
        }

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
            if (this.user().data.hardQuestion === true && this.user().data.prevIntent === true) {
                this.user().data.subQuestionIndex--;
                delete this.user().data.prevIntent;
            } else if (this.user().data.simpleQueston === true) {
                this.user().data.mainQuestionIndex--;
            }
            this.tell("ok");
        }

    },
});

module.exports.app = app;

function getQuestionAnswers() {

}



function checkUserInput() {
    let prevMainQuestion, prevSubQuestion;
    if (this.user().data.mainQuestionIndex === 0) {
        prevMainQuestion = 0;
    } else {
        prevMainQuestion = this.user().data.mainQuestionIndex - 1;
    }

    if (this.user().data.subQuestionIndex === 0) {
        prevSubQuestion = 0;
        console.log("if subqindex === 0 : ", this.user().data.subQuestionIndex);
    } else {
        prevSubQuestion = this.user().data.subQuestionIndex - 1;
        console.log("if subqindex !== 0 : ", this.user().data.subQuestionIndex);
    }

    let inputs = this.getInputs();
    console.log("slot: ", inputs);
    if (Object.keys(inputs).length > 0 && (inputs['customAnswer'].value !== undefined)) {
        if (!survey.surveyQuestions[prevMainQuestion].hasOwnProperty('surveyQuestions')) {
            let arr = survey.surveyQuestions[prevMainQuestion].questionAnswers;
            // console.log("arr: ", arr);

            console.log("ARR.LENGTH: ", arr.length)
            for (let i = 0; i < arr.length; i++) {
                console.log("I: , ", i);
                try {
                    if (inputs['customAnswer'].value !== undefined && inputs['customAnswer'].value !== '?') {

                        console.log("customAnswerHere ", inputs['customAnswer'].value);
                        // console.log("ARR[ELEMENT]: ", element);
                        if (inputs['customAnswer'].value.toLowerCase() === arr[i].answer.toLowerCase()) {
                            console.log("MATCHED");
                            return 'matched';
                            break;

                        } else {
                            // console.log("NOT MATCHED");
                            return 'not matched';
                        }
                    }
                } catch (error) {
                    console.log("error: ", error);
                }
            }
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
