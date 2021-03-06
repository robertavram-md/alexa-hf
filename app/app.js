'use strict';

const { App } = require('jovo-framework');
const fs = require('fs');
const crypto = require('crypto');
const DataRequests = require('./api/apiData');
const data = require('../data.json');
const r = new DataRequests();

const config = {
    logging: true,
};
const app = new App(config);

let answerTypes = data.answerTypes[0];
let answers = data.answers[0];
const CronJob = require('cron').CronJob;
new CronJob('00 59 * * * *', () => {
    r.getAnswersData().then(data => {
        let obj = {
            answerTypes: [],
            answers: []
        }
        obj.answerTypes.push(JSON.parse(data[0]))
        obj.answers.push(JSON.parse(data[1]))
        let json = JSON.stringify(obj);
        fs.writeFile('data.json', json, 'utf-8', (err) => {
            if (err) console.log("err: ", err);
            console.log("saved");
        });
    });
}, null, true, null);

app.setHandler({
    'LAUNCH': async function () {
        if (this.user().data.surveyFinished === true) {
            await r.getSurveyQuestions().then(result => {
                this.user().data.survey = result;
            });
            this.toIntent('GetFirstSurveyIntent');
            delete this.user().data.surveyFinished;
        } else if (this.user().data.surveyFinished === undefined && this.user().data.mainQuestionIndex >= 0) {
            this.followUpState('CheckSurvey').ask('You have a questionnaire partially completed. Do you want to to resume the survey or start a new one?')
        } else {
            await r.getSurveyQuestions().then(result => {
                this.user().data.survey = result;
            });
            this.toIntent('GetFirstSurveyIntent');
        }
    },
    'CheckSurvey': {
        'ResumeSurveyIntent': function () {
            this.toIntent('GetFirstSurveyIntent');
        },
        'StartNewSurveyIntent': async function () {
            this.user().data = {};
            await r.getSurveyQuestions().then(result => {
                this.user().data.survey = result;
            });
            this.toIntent('GetFirstSurveyIntent');
        },
    },
    'GetFirstSurveyIntent': function () {
        this.removeState();
        const { survey } = this.user().data;
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

            try {
                if (survey[this.user().data.mainQuestionIndex].surveyQuestions.length > 0 && this.user().data.prevIntent === true) {
                    if (this.user().data.subQuestionIndex === survey[this.user().data.mainQuestionIndex].surveyQuestions.length) {
                        this.user().data.subQuestionsFinished = true;
                        this.user().data.mainQuestionIndex++;
                        this.user().data.subQuestionIndex = 0;
                        // this.user().data.prevIntent = false;
                        delete this.user().data.prevIntent;
                        if (this.user().data.mainQuestionIndex === survey.length) {
                            this.user().data.changeIndex = true;
                        }
                    }
                }
            } catch (error) {
                console.log("try_catch error: ", error);
            }
            if (this.user().data.changeIndex === true) {
                this.user().data.mainQuestionIndex--;
            }
            for (let i = this.user().data.mainQuestionIndex; i < survey.length; i++) {
                if (survey[i].surveyQuestions.length > 0) {
                    this.user().data.hardQuestion = true;
                    delete this.user().data.simpleQueston;
                    for (let j = this.user().data.subQuestionIndex; j < survey[i].surveyQuestions.length; j++) {
                        subQuestion = survey[i].surveyQuestions[j].text;
                        mainQuestion = survey[i].text;
                        if (this.user().data.prevIntent === true) {
                            checkUserInput.call(this, (prevMainQuestion, prevSubQuestion, inputs) => {
                                if (prevMainQuestion !== undefined && prevSubQuestion !== undefined && inputs !== undefined) {
                                    let answerValue = compareUserInputAndAnswer.call(this, prevMainQuestion, prevSubQuestion, inputs);
                                    if (answerValue !== undefined) {
                                        let userAnswer = {
                                            questionId: answerValue.question,
                                            answerId: answerValue.answerId,
                                            userId: crypto.createHash('md5').update(this.getUserId()).digest('hex'),
                                            device: this.alexaSkill().getDeviceId()
                                        }
                                        r.sendUserAnswers(userAnswer).then(data => {
                                            console.log("sended: ", data);
                                        })
                                        this.ask(subQuestion);
                                        delete this.user().data.hardQCheck;
                                        this.user().data.questionToRepeat = subQuestion;
                                        this.user().data.subQuestionIndex++;
                                        this.user().data.correctSubAnswer = true;
                                    } else {
                                        let valuesToRead = getQuestionAnswers.call(this, prevMainQuestion, prevSubQuestion);
                                        if (valuesToRead !== undefined) {
                                            this.ask(`Sorry, this answer is not valid. You can only choose from: ${valuesToRead}. What's your choice? `);
                                            this.user().data.correctSubAnswer = false;
                                        }
                                    }
                                } else {
                                    if (this.user().data.simpleQueston !== true) {
                                        this.user().data.subQuestionIndex++;
                                    }
                                    this.user().data.questionToRepeat = subQuestion;
                                    this.ask(subQuestion);
                                    delete this.user().data.hardQCheck;
                                }
                            })
                        } else {
                            checkUserInput.call(this, (prevMainQuestion, prevSubQuestion, inputs) => {
                                if (prevMainQuestion !== undefined && prevSubQuestion !== undefined && inputs) {
                                    let answerValue = compareUserInputAndAnswer.call(this, prevMainQuestion, prevSubQuestion, inputs);
                                    console.log("answerValue: ", answerValue);
                                    if (answerValue !== undefined) {
                                        
                                        if (this.user().data.changeIndex === true) {
                                            this.user().data = {};
                                            this.user().data.surveyFinished = true;
                                            let userAnswer = {
                                                questionId: answerValue.question,
                                                answerId: answerValue.answerId,
                                                userId: crypto.createHash('md5').update(this.getUserId()).digest('hex'),
                                                device: this.alexaSkill().getDeviceId(),
                                                isCompleted: true
                                            }
                                            r.sendUserAnswers(userAnswer).then(data => {
                                                console.log("finished :", data);
                                            })
                                            this.tell("survey finished, thank you for your answer!!!");
                                            return false;
                                        } else {
                                            let userAnswer = {
                                                questionId: answerValue.question,
                                                answerId: answerValue.answerId,
                                                userId: crypto.createHash('md5').update(this.getUserId()).digest('hex'),
                                                device: this.alexaSkill().getDeviceId()
                                            }
                                            r.sendUserAnswers(userAnswer).then(data => {
                                                console.log("sended:", data);
                                            })
                                        }
                                            console.log("reeasd");
                                            this.ask(mainQuestion);
                                            this.user().data.hardQCheck = true;
                                       
                                        this.user().data.questionToRepeat = mainQuestion;
                                        this.user().data.correctMainAnswer = true;
                                        delete this.user().data.subQuestionsFinished;
                                    } else if (answerValue === undefined && this.user().data.hardQCheck === true ) {
                                        this.ask("Sorry, I did not catch that. To hear the instructions again say 'repeat'. To start with questions, say proceed to questions'. If you want to exit survey now say 'stop'");
                                    } else {
                                        let valuesToRead = getQuestionAnswers.call(this, prevMainQuestion, prevSubQuestion);
                                        if (valuesToRead !== undefined) {
                                            this.ask(`Sorry, this answer is not valid. You can only choose from: ${valuesToRead}. What's your choice? `);
                                            this.user().data.correctMainAnswer = false;
                                        }
                                    }
                                } else {
                                    console.log("test123");
                                    if (this.user().data.hardQuestion !== true) {
                                        this.user().data.mainQuestionIndex++;
                                    }
                                    this.ask(mainQuestion);
                                    this.user().data.hardQCheck = true;
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
                    if (survey[i] !== undefined) {
                        mainQuestion = survey[i].text;
                        checkUserInput.call(this, (prevMainQuestion, prevSubQuestion, inputs) => {
                            if (prevMainQuestion !== undefined && prevSubQuestion !== undefined && inputs !== undefined) {
                                let answerValue = compareUserInputAndAnswer.call(this, prevMainQuestion, prevSubQuestion, inputs);
                                delete this.user().data.subQuestionsFinished;
                                if (answerValue !== undefined) {
                                    if (this.user().data.changeIndex === true) {
                                        this.user().data = {};
                                        this.user().data.surveyFinished = true;
                                        let userAnswer = {
                                            questionId: answerValue.question,
                                            answerId: answerValue.answerId,
                                            userId: crypto.createHash('md5').update(this.getUserId()).digest('hex'),
                                            device: this.alexaSkill().getDeviceId(),
                                            isCompleted: true
                                        }
                                        r.sendUserAnswers(userAnswer).then(data => {
                                            console.log("finished :", data);
                                        })
                                        this.tell("survey finished, thank you for your answer!!!");
                                        return false;
                                    } else {
                                        let userAnswer = {
                                            questionId: answerValue.question,
                                            answerId: answerValue.answerId,
                                            userId: crypto.createHash('md5').update(this.getUserId()).digest('hex'),
                                            device: this.alexaSkill().getDeviceId()
                                        }
                                        r.sendUserAnswers(userAnswer).then(data => {
                                            console.log("sended", data);
                                        });
                                    }
                                    this.user().data.mainQuestionIndex++;
                                    this.user().data.correctMainAnswer = true;
                                    this.ask(mainQuestion);
                                    if (this.user().data.mainQuestionIndex === survey.length) {
                                        this.user().data.changeIndex = true;
                                    }
                                    this.user().data.questionToRepeat = mainQuestion;
                                } else {
                                    let valuesToRead = getQuestionAnswers.call(this, prevMainQuestion, prevSubQuestion);
                                    if (valuesToRead !== undefined) {
                                        this.ask(`Sorry, this answer is not valid. You can only choose from: ${valuesToRead}. What's your choice? `);
                                        this.user().data.correctMainAnswer = false;
                                    }

                                }
                            } else {
                                if (this.user().data.subQuestionsFinished === undefined) {
                                    this.user().data.mainQuestionIndex++;
                                    if (this.user().data.mainQuestionIndex === survey.length) {
                                        this.user().data.changeIndex = true;
                                    }
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
    },
    'ToAnswersIntent': function () {
        this.removeState();
        if (this.user().data.simpleQueston === true) {
            this.ask("You can only answer with this variants");
        } else if (this.user().data.hardQuestion === true) {
            this.user().data.prevIntent = true;
            this.toIntent('GetFirstSurveyIntent');
        }
    },
    'AMAZON.RepeatIntent': function () {
        this.ask(this.user().data.questionToRepeat);
    },
    'END': function () {
        delete this.user().data.changeIndex;
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

function getAnswerTypeId(answerTypeText) {
    for (let i = 0; i < answerTypes.length; i++) {
        if (answerTypeText === answerTypes[i].name) {
            return answerTypes[i].id;
        }
    }
}

function getQuestionAnswers(prevMainQuestion, prevSubQuestion) {
    const { survey } = this.user().data
    if (this.user().data.prevIntent === true && this.user().data.mainQuestionIndex > 0) {
        prevMainQuestion += 1;
    } else if (this.user().data.changeIndex === true) {
        prevMainQuestion += 1;
    }
    if (survey[prevMainQuestion].surveyQuestions.length === 0) {
        let answerType = survey[prevMainQuestion].answerTypeName;
        let answerTypeId = getAnswerTypeId(answerType);
        let answersStringToRead = [];
        for (let m = 0; m < answers.length; m++) {
            if (answers[m].answerTypeId === answerTypeId) {
                answersStringToRead.push(answers[m].name)
            }
        }
        if (answersStringToRead.length > 0) {
            return answersStringToRead;
        }
    } else {
        let answerType = survey[prevMainQuestion].answerTypeName;
        let answerTypeId = getAnswerTypeId(answerType);
        let answersStringToRead = [];

        for (let m = 0; m < answers.length; m++) {
            if (answers[m].answerTypeId === answerTypeId) {
                answersStringToRead.push(answers[m].name)
            }
        }
        if (answersStringToRead.length > 0) {
            return answersStringToRead;
        }
    }

}

function getAnswersListById(id) {
    let answersArr = [];
    for (let i = 0; i < answers.length; i++) {
        if (id === answers[i].answerTypeId) {
            let answerObj = {
                answerName: answers[i].name,
                answerId: answers[i].id,
            }
            answersArr.push(answerObj);
        }
    }
    return answersArr;
}

function compareUserInputAndAnswer(prevMainQuestion, prevSubQuestion, inputs) {

    const { survey } = this.user().data;

    if (this.user().data.prevIntent === true && this.user().data.mainQuestionIndex > 0) {
        prevMainQuestion += 1;
    } else if (this.user().data.changeIndex === true) {
        prevMainQuestion += 1;
    }
    try {
        if (this.user().data.changeIndex === true || this.user().data.subQuestionsFinished === true) {
            prevSubQuestion = survey[prevMainQuestion].surveyQuestions.length - 1;
        }
        if (survey[prevMainQuestion].surveyQuestions.length > 0) {
            let answerType = survey[prevMainQuestion].answerTypeName;
            if (answerType !== undefined) {
                let answerTypeId = getAnswerTypeId(answerType);
                let answersArr = getAnswersListById(answerTypeId);
                for (let n = 0; n < answersArr.length; n++) {
                    if (answersArr[n].answerName.toLowerCase() === inputs['customAnswer'].key.toLowerCase()) {
                        let questionAndAnswerObj = {
                            question: survey[prevMainQuestion].surveyQuestions[prevSubQuestion].id,
                            answerId: answersArr[n].answerId
                        }
                        return questionAndAnswerObj;
                        break;
                    }
                }
            }
        } else {
            let answerType = survey[prevMainQuestion].answerTypeName;
            if (answerType !== undefined) {
                let answerTypeId = getAnswerTypeId(answerType);
                let answersArr = getAnswersListById(answerTypeId);
                for (let n = 0; n < answersArr.length; n++) {
                    if (answersArr[n].answerName.toLowerCase() === inputs['customAnswer'].key.toLowerCase()) {
                        let questionAndAnswerObj = {
                            question: survey[prevMainQuestion].id,
                            answerId: answersArr[n].answerId
                        }
                        return questionAndAnswerObj;
                        break;
                    }
                }
            }
        }
    }
    catch (err) {
        console.log("compareUserInputAndAnswerError: ", err);
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
        callback(prevMainQuestion, prevSubQuestion, inputs);
    } else {
        callback();
    }
}
