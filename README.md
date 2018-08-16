

HOW TO INSTALL:

`
In terminal run:



git clone https://github.com/robertavram-md/alexa-hf.git .



npm i



npm i -g jovo-cli



log in with amazon account at https://developer.amazon.com/alexa/console/



create new custom skill



proceed to your skill -> endpoint -> aws labmda arn -> copy your skill-id ( it looks like amzn1.ask.skill.XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX )



open your project folder, and follow to [folderName]/platforms/alexaSkill/.ask/and open 'config' file.



change "skil_id" field with your skill-id (what you copied at step #6)



run in your terminal
9. jovo deploy
10. jovo run
`
