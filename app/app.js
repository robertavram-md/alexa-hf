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
const questionTypes = require('./questionTypes');

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
        if (this.user().data.subQuestionIndex <= -1) {
            this.user().data.subQuestionIndex = 0;
        }
        if (survey !== undefined) {

            // let { mainQuestionIndex, subQuestionIndex } = this.user().data;

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
                    // console.log("SURVEY HAS OWN PROPERTY: ", survey.surveyQuestions[this.user().data.mainQuestionIndex].hasOwnProperty('surveyQuestions'));
                    if (survey.surveyQuestions[this.user().data.mainQuestionIndex].hasOwnProperty('surveyQuestions') !== false) {

                        if (this.user().data.subQuestionIndex === survey.surveyQuestions[this.user().data.mainQuestionIndex].surveyQuestions.length) {
                            console.log("When reset indexes to read main question")
                            this.user().data.subQuestionsFinished = true;
                            this.user().data.mainQuestionIndex++;
                            this.user().data.subQuestionIndex = 0;
                            this.user().data.prevIntent = false;
                        }
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
                                checkUserInput.call(this, (prevMainQuestion, prevSubQuestion, inputs) => {
                                    if (prevMainQuestion !== undefined && prevSubQuestion !== undefined && inputs !== undefined) {
                                        console.log("SUBQUESTIONS VALIDATION");
                                        let answerValue = compareUserInputAndAnswer.call(this, prevMainQuestion, prevSubQuestion, inputs);
                                        if(answerValue !== undefined) {
                                            console.log("SUBQ_ANSWER_VAUE: ", answerValue);

                                            this.ask(subQuestion);

                                            this.user().data.questionToRepeat = subQuestion;
                                            
                                            this.user().data.subQuestionIndex++;
                                            this.user().data.correctSubAnswer = true;
                                        } else {
                                            let valuesToRead = getQuestionAnswers.call(this, prevMainQuestion, prevSubQuestion);
                                            if(valuesToRead !== undefined ) {
                                                console.log("VALUES TO READ :", valuesToRead);
                                                this.ask(`Sorry, this answer is not valid. You can only choose from: ${valuesToRead}. What's your choice? `);
                                                this.user().data.correctSubAnswer = false;
                                            } 
                                        }

                                    } else {
                                        console.log("NOT DEFINED SUBQUESTION");
                                        if (this.user().data.simpleQueston !== true) {
                                            this.user().data.mainQuestionIndex++;
                                        }

                                        this.user().data.questionToRepeat = subQuestion;
                                        this.ask(subQuestion);
                                    }

                                })
                               

                            } else if (this.user().data.prevIntent === false) {
                                console.log("if null");
                                // checkUserInput.call(this);
                                mainQuestion = survey.surveyQuestions[i].question;

                                // this.ask(mainQuestion);

                                checkUserInput.call(this, (prevMainQuestion, prevSubQuestion, inputs) => {

                                    console.log("ARGUMENTS: ", prevMainQuestion, "/", prevSubQuestion, "/", inputs);
                                    if (prevMainQuestion !== undefined && prevSubQuestion !== undefined && inputs) {
                                        // console.log("PREVSUBQUESTION: ", prevSubQuestion);
                                        let answerValue = compareUserInputAndAnswer.call(this, prevMainQuestion, prevSubQuestion, inputs);
                                        if (answerValue !== undefined) {
                                            console.log("SAVE ANSWER TO DB");
                                            console.log("answerValue :", answerValue);
                                            // this.user().data.mainQuestionIndex++;
                                            this.ask(mainQuestion);

                                            this.user().data.questionToRepeat = mainQuestion;

                                            this.user().data.correctMainAnswer = true;
                                            delete this.user().data.subQuestionsFinished;
                                        } else {
                                            let valuesToRead = getQuestionAnswers.call(this, prevMainQuestion, prevSubQuestion);
                                            if (valuesToRead !== undefined) {
                                                console.log("VALUES TO READ :", valuesToRead);
                                                this.ask(`Sorry, this answer is not valid. You can only choose from: ${valuesToRead}. What's your choice? `);
                                                this.user().data.correctMainAnswer = false;
                                            }

                                        }
                                    } else {
                                        console.log("NOT DEFINED");
                                        if (this.user().data.hardQuestion !== true) {
                                            this.user().data.mainQuestionIndex++;
                                        }
                                        this.ask(mainQuestion);

                                        this.user().data.questionToRepeat = mainQuestion;
                                    }

                                });

                            } else {
                                console.log("if no prev intent");
                                // this.ask(mainQuestion);
                                // delete this.user().data.subQuestionsFinished;

                                // ******************
                                checkUserInput.call(this, (prevMainQuestion, prevSubQuestion, inputs) => {

                                    console.log("ARGUMENTS: ", prevMainQuestion, "/", prevSubQuestion, "/", inputs);
                                    if (prevMainQuestion !== undefined && prevSubQuestion !== undefined && inputs) {
                                        // console.log("PREVSUBQUESTION: ", prevSubQuestion);
                                        let answerValue = compareUserInputAndAnswer.call(this, prevMainQuestion, prevSubQuestion, inputs);
                                        if (answerValue !== undefined) {
                                            console.log("SAVE ANSWER TO DB");
                                            console.log("answerValue :", answerValue);
                                            // this.user().data.mainQuestionIndex++;
                                            this.ask(mainQuestion);

                                            this.user().data.questionToRepeat = mainQuestion;

                                            this.user().data.correctMainAnswer = true;
                                            delete this.user().data.subQuestionsFinished;
                                        } else {
                                            let valuesToRead = getQuestionAnswers.call(this, prevMainQuestion, prevSubQuestion);
                                            if (valuesToRead !== undefined) {
                                                console.log("VALUES TO READ :", valuesToRead);
                                                this.ask(`Sorry, this answer is not valid. You can only choose from: ${valuesToRead}. What's your choice? `);
                                                this.user().data.correctMainAnswer = false;
                                            }

                                        }
                                    } else {
                                        console.log("NOT DEFINED");
                                        if (this.user().data.hardQuestion !== true) {
                                            this.user().data.mainQuestionIndex++;
                                        }
                                        this.ask(mainQuestion);

                                        this.user().data.questionToRepeat = mainQuestion;
                                    }

                                });
                            }

                            break;
                        }
                        break;
                    }
                    else {
                        this.user().data.simpleQueston = true;
                        delete this.user().data.hardQuestion;

                        delete this.user().data.subQuestionsFinished;

                        if (survey.surveyQuestions[i] !== undefined) {
                            console.log("this.user().data.simpleQueston = true");
                            mainQuestion = survey.surveyQuestions[i].question;

                            checkUserInput.call(this, (prevMainQuestion, prevSubQuestion, inputs) => {

                                console.log("ARGUMENTS: ", prevMainQuestion, "/", prevSubQuestion, "/", inputs);
                                if (prevMainQuestion !== undefined && prevSubQuestion !== undefined && inputs !== undefined) {
                                    console.log("PREVSUBQUESTION: ", prevSubQuestion);
                                    let answerValue = compareUserInputAndAnswer.call(this, prevMainQuestion, prevSubQuestion, inputs);
                                    if (answerValue !== undefined) {
                                        console.log("SAVE ANSWER TO DB");
                                        console.log("answerValue :", answerValue);

                                        this.user().data.mainQuestionIndex++;

                                        this.user().data.correctMainAnswer = true;
                                        this.ask(mainQuestion);

                                        this.user().data.questionToRepeat = mainQuestion;

                                    } else {
                                        let valuesToRead = getQuestionAnswers.call(this, prevMainQuestion, prevSubQuestion);
                                        if (valuesToRead !== undefined) {
                                            console.log("VALUES TO READ :", valuesToRead);
                                            this.ask(`Sorry, this answer is not valid. You can only choose from: ${valuesToRead}. What's your choice? `);
                                            this.user().data.correctMainAnswer = false;
                                        }

                                    }
                                } else {
                                    console.log("NOT DEFINED simpleQuestion");
                                    if (this.user().data.subQuestionsFinished === undefined) {
                                        console.log("this.user().data.hardQuestion !== true")
                                        this.user().data.mainQuestionIndex++;
                                    }
                                    this.ask(mainQuestion);

                                    this.user().data.questionToRepeat = mainQuestion;
                                }

                            });
                        }
                        else {
                            this.tell("Survey finished");
                            this.user().data = {};
                        }

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
        this.ask(this.user().data.questionToRepeat);
    },
    'END': function () {
        console.log("***********STOPPED***************");
        console.log("REASON: ", this.requestObj.request.reason);
        if (this.requestObj.request.reason === 'EXCEEDED_MAX_REPROMPTS' && this.user().data.correctMainAnswer === false) {
            this.tell("Come later");
            this.user().data.mainQuestionIndex--;
            delete this.user().data.correctMainAnswer;

        } else if (this.requestObj.request.reason === 'EXCEEDED_MAX_REPROMTS' && this.user().data.correctSubAnswer === false) {
            this.tell("Come later");
            this.user().data.subQuestionIndex--;
            delete this.user().data.correctSubAnswer;
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



function getQuestionAnswers(prevMainQuestion, prevSubQuestion) {
    if (survey.surveyQuestions[prevMainQuestion].hasOwnProperty('surveyQuestions') !== true) {
        let answerType = survey.surveyQuestions[prevMainQuestion].answerType;

        let answersStringToRead = [];
        
        for (let m = 0; m < questionTypes[answerType].length; m++) {
            answersStringToRead.push(questionTypes[answerType][m].answer);
        }
        if (answersStringToRead.length > 0) {
            return answersStringToRead;
        }
    } else {
        let answerType = survey.surveyQuestions[prevMainQuestion].surveyQuestions[prevSubQuestion].answerType;

        let answersStringToRead = [];

        for(let m = 0; m < questionTypes[answerType].length; m++) {
            answersStringToRead.push(questionTypes[answerType][m].answer);
        }

        if(answersStringToRead.length > 0) {
            return answersStringToRead;
        }
    }
}


function compareUserInputAndAnswer(prevMainQuestion, prevSubQuestion, inputs) {

    if (survey.surveyQuestions[prevMainQuestion].hasOwnProperty('surveyQuestions') !== true) {
        let answerType = survey.surveyQuestions[prevMainQuestion].answerType;
        console.log("ANSWER_TYPE :", answerType);
        if (answerType !== undefined) {
      
            for (let n = 0; n < questionTypes[answerType].length; n++) {
                // console.log("n:", questionTypes[answerType][n]);
                console.log("comparingValues : ", questionTypes[answerType][n].answer.toLowerCase(), "/", inputs['customAnswer'].key.toLowerCase());
                let answerValues = [];
                if (questionTypes[answerType][n].answer.toLowerCase() === inputs['customAnswer'].key.toLowerCase()) {
                    console.log("inputs['customAnswer'].key.toLowerCase() :", questionTypes[answerType][n].answer);
                    let questionAndAnswerObj = {
                        question: survey.surveyQuestions[prevMainQuestion].questionId,
                        answer: questionTypes[answerType][n].answerValue
                    }
                    return questionAndAnswerObj;
                    break;
                }
            }
        }
    } else {
        let answerType = survey.surveyQuestions[prevMainQuestion].surveyQuestions[prevSubQuestion].answerType;
        console.log("WHERE UNDEFINED: ", answerType);
        if (answerType !== undefined) { 
            for (let n = 0; n < questionTypes[answerType].length; n++) {
                // console.log("n:", questionTypes[answerType][n]);
                console.log("comparingValues : ", questionTypes[answerType][n].answer.toLowerCase(), "/", inputs['customAnswer'].key.toLowerCase());
                let answerValues = [];
                if (questionTypes[answerType][n].answer.toLowerCase() === inputs['customAnswer'].key.toLowerCase()) {
                    console.log("inputs['customAnswer'].key.toLowerCase() :", questionTypes[answerType][n].answer);
                    let questionAndAnswerObj = {
                        question: survey.surveyQuestions[prevMainQuestion].questionId,
                        answer: questionTypes[answerType][n].answerValue
                    }
                    console.log("questionAndAnswerObj: ", questionAndAnswerObj);
                    return questionAndAnswerObj;
                    break;
                }
            }
        }
    }
}

function checkUserInput(callback) {
    let prevMainQuestion, prevSubQuestion;

    if (this.user().data.mainQuestionIndex === 0) {
        prevMainQuestion = 0;
    } else {
        prevMainQuestion = this.user().data.mainQuestionIndex - 1;
    }

    if (this.user().data.subQuestionIndex === 0) {
        prevSubQuestion = 0;
    } else {
        prevSubQuestion = this.user().data.subQuestionIndex - 1;
    }
    
    let inputs = this.getInputs();
    if (Object.keys(inputs).length > 0) {
        console.log("slots here");
        callback(prevMainQuestion, prevSubQuestion, inputs);
    } else {
        console.log("there is no slots here");
        callback();
    }
}
