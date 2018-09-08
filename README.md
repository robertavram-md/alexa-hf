

HOW TO INSTALL:

```
Run in your Terminal:



1. git clone https://github.com/robertavram-md/alexa-hf.git .
2. npm i
3. npm i -g jovo-cli
4. log in with amazon account at https://developer.amazon.com/alexa/console/
5. create new custom skill
6. proceed to your skill -> endpoint -> aws labmda arn -> copy your skill-id ( it looks like amzn1.ask.skill.XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX )
7. open your project folder, and follow to [folderName]/platforms/alexaSkill/.ask/and open 'config' file.
8. change "skill_id" field with your skill-id (what you copied at step #6)

Run in your Terminal:

9. jovo deploy
10. jovo run
```
