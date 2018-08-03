module.exports.mixedType = [
    {
        "answerValue": "1",
        "answer": "one"
    },
    {
        "answerValue": "2",
        "answer": "two"
    },
    {
        "answerValue": "3",
        "answer": "three"
    },
    {
        "answerValue": "4",
        "answer": "Four"
    },
    {
        "answerValue": "5",
        "answer": "Five"
    },
    {
        "answerValue": "0",
        "answer": "Limited for other reasons"
    },
    {
        "answerValue": "0#",
        "answer": "Did not do the activity"
    }
];

module.exports.charType = [
    {
        "answerValue": "1",
        "answer": "Every morning"
    },
    {
        "answerValue": "2",
        "answer": "three or more times per week but not every day"
    },
    {
        "answerValue": "3",
        "answer": "one to two times per week"
    },
    {
        "answerValue": "4",
        "answer": "less than once a week"
    },
    {
        "answerValue": "5#",
        "answer": "never over the past two weeks"
    }
];

module.exports.charType2 = [
    {
        "answerValue": "1",
        "answer": "all of the time"
    },
    {
        "answerValue": "2",
        "answer": "several times per day"
    },
    {
        "answerValue": "3",
        "answer": "at least once a day"
    },
    {
        "answerValue": "4",
        "answer": "three or more times per week but not every day"
    },
    {
        "answerValue": "5",
        "answer": "one to two times per week"
    },
    {
        "answerValue": "6#",
        "answer": "less than once a week"
    }
];

module.exports.charType3 = [
    {
        "answerValue": "1",
        "answer": "all of the time"
    },
    {
        "answerValue": "2",
        "answer": "several times per day"
    },
    {
        "answerValue": "3",
        "answer": "at least once a day"
    },
    {
        "answerValue": "4",
        "answer": "three or more times per week but not every day"
    },
    {
        "answerValue": "5",
        "answer": "one to two times per week"
    },
    {
        "answerValue": "6",
        "answer": "less than once a week"
    },
    {
        "answerValue": "7#",
        "answer": "never over the past two weeks"
    }
];

module.exports.charType4 = [
    {
        "answerValue": "1",
        "answer": "Every night"
    },
    {
        "answerValue": "2",
        "answer": "three or more times per week but not every day"
    },
    {
        "answerValue": "3",
        "answer": "one to two times per week"
    },
    {
        "answerValue": "4",
        "answer": "less than once a week"
    },
    {
        "answerValue": "5#",
        "answer": "never over the past two weeks"
    }
];

module.exports.numberType = [
    {
        "answerValue": "1",
        "answer": "One"
    },
    {
        "answerValue": "2",
        "answer": "two"
    },
    {
        "answerValue": "3",
        "answer": "three"
    },
    {
        "answerValue": "4",
        "answer": "four"
    },
    {
        "answerValue": "5#",
        "answer": "five"
    }
]


const survey = [
    {
        "description": "Over  the  past  two  weeks,  how  many  times  did  you  have  swelling  in  your  feet,  ankles  or  legs  when  you  woke  up  in  the  morning?",
        "id": 26,
        "shortText": "Over  the  past  two  weeks,  how  many  times  did  you  have  swelling  in  your  feet,  ankles  or  legs  when  you  woke  up  in  the  morning?",
        "repromptText": "Over  the  past  two  weeks,  how  many  times  did  you  have  swelling  in  your  feet,  ankles  or  legs  when  you  woke  up  in  the  morning?",
        "text": "Over  the  past  two  weeks,  how  many  times  did  you  have  swelling  in  your  feet,  ankles  or  legs  when  you  woke  up  in  the  morning?  Please  select  from  one  of  the  following  choices:  Every  morning,  three  or  more  times  per  week  but  not  every  day,  one  to  two  times  per  week,  less  than  once  a  week,  or  never  over  the  past  two  weeks.  If  you  want  me  to  repeat  these  choices,  please  say  repeat.",
        "surveyQuestions": [],
        "answerTypeName": "charType"
    },
    {
        "description": "Heart  failure  affects  different  people  in  different  ways.",
        "id": 22,
        "shortText": "Heart  failure  affects  different  people  in  different  ways.",
        "repromptText": "Heart  failure  affects  different  people  in  different  ways.",
        "text": "Heart  failure  affects  different  people  in  different  ways.  Some  feel  shortness  of  breath  while  others  feel  fatigue.  Please  indicate  how  much  you  were  limited  by  heart  failure in  your  ability  to  do  the  following  activities  over  the  past  2  weeks. If  you  need  me  to  repeat  the  question,  say  repeat. Say  answer questions, if you are ready now.",
        "surveyQuestions": [
            {
                "description": "On  a  scale  from  one  to  five - one  being  extremely  limited  and  five  being",
                "id": 23,
                "shortText": "On  a  scale  from  one  to  five - one  being  extremely  limited  and  five  being",
                "repromptText": "On  a  scale  from  one  to  five - one  being  extremely  limited  and  five  being",
                "text": "On  a  scale  from  one  to  five - one  being  extremely  limited  and  five  being  not  at  all  limited - how much you were limited while showering or bathing. <break time='750ms' /> You  may  also  say did  not  do  the  activity or limited for other reasons.'"
            },
            {
                "description": "Walking one block on level ground",
                "id": 24,
                "shortText": "Walking one block on level ground",
                "repromptText": "Walking one block on level ground",
                "text": "Walking one block on level ground"
            },
            {
                "description": "Hurrying or jogging, as if to catch a bus",
                "id": 25,
                "shortText": "Hurrying or jogging, as if to catch a bus",
                "repromptText": "Hurrying or jogging, as if to catch a bus",
                "text": "Hurrying or jogging, as if to catch a bus"
            }
        ],
        "answerTypeName": "mixedType"
    }
]