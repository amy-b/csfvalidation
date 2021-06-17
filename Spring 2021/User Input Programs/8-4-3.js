
if (!validationProps.previous) {
  validationProps.previous = {}; // id => {logLength: 1, background: "white"}
}

if (!validationProps.successCriteria) {
  validationProps.successCriteria = {
    madePrompt: false,
    answeredPrompt: false,
    enteredBlank: false,
    printedText: false,
    logIncreased: false,
    madeTitle: false,
    containsInput: false,
    usedJoinBlocks: false,
    madeSprite: false,
    spriteHasBehavior: false
  };
}

var allPrompts = getPromptVars();
var promptVars = Object.keys(allPrompts);
var printLog = getPrintLog();
var spriteIds = getSpriteIdsInUse();
var animations = getAnimationsInUse();
if(!validationProps.failTime){
  validationProps.failTime = 30;
}
var appActive = false;
var unanswered=false;


//check for the first time they made a prompt
if(!validationProps.successCriteria.madePrompt){
  validationProps.successCriteria.madePrompt = promptVars.length>=1;
} //delay validation if they have an unanswered prompt
if(validationProps.successCriteria.madePrompt&&!validationProps.successCriteria.answeredPrompt){
  validationProps.failTime = 300;
  for(var prop in promptVars){
    if(allPrompts[promptVars[prop]]==null){
      unanswered=true;
      appActive=true;
      validationProps.failTime = World.frameCount+1;
    } else if(allPrompts[promptVars[prop]]==""){
      validationProps.successCriteria.enteredBlank=true;
    }
  } 
  if(!unanswered){
    validationProps.successCriteria.answeredPrompt=true;
    validationProps.failTime = World.frameCount + 60;
  }
}

//any printed text?
if(printLog.length){
  validationProps.successCriteria.printedText=true;
  //more than last frame?
  if(printLog.length>validationProps.previous.logLength){
    validationProps.successCriteria.logIncreased=true;
  }
}
validationProps.previous = {
  logLength: printLog.length
};


//go through all the printed text and all prompts to see if they ever printed the text entered
for (var i = 0; i < printLog.length; i++) {
  for (var prop in promptVars) {
    var enteredText=allPrompts[promptVars[prop]];
    if(enteredText){
      enteredText=enteredText.toString();
    }
    var printedText=printLog[i].toString();
    if(printedText.includes(enteredText)){
      validationProps.successCriteria.containsInput = true;
      if(printedText!=enteredText){
        validationProps.successCriteria.usedJoinBlocks = true;
      }
    }
  }
} 


//check for a title screen
if(!validationProps.successCriteria.madeTitle){
  validationProps.successCriteria.madeTitle = (getTitle().title!=undefined) || (getTitle().subtitle!=undefined);
}

//go through the title screen text and all prompts to see if they ever printed the text entered
if (validationProps.successCriteria.answeredPrompt&&(getTitle().subtitle || getTitle().title)) {
  for (var prop in promptVars) {
    var enteredText=allPrompts[promptVars[prop]];
    var printedText1=getTitle().title;
    var printedText2=getTitle().subtitle;
    if(printedText1.includes(enteredText)){
      validationProps.successCriteria.containsInput = true;
      if(printedText!=enteredText){
        validationProps.successCriteria.usedJoinBlocks = true;
      }
    }
    if(printedText2.includes(enteredText)){
      validationProps.successCriteria.containsInput = true;
      if(printedText!=enteredText){
        validationProps.successCriteria.usedJoinBlocks = true;
      }
    }
  }
} 


validationProps.successCriteria.madeSprite=spriteIds.length >= 1;

for (var i = 0; i < animations.length; i++) {
  if(getNumBehaviorsForAnimation(animations[i]) >= 1){
    validationProps.successCriteria.spriteHasBehavior = true;  
  }
}

//Set the successTime the first time they've passed the main criteria
if(validationProps.successCriteria.answeredPrompt&&
   validationProps.successCriteria.containsInput&&
   validationProps.successCriteria.spriteHasBehavior&&
   !validationProps.successTime){
  validationProps.successTime=World.frameCount;
}

if(validationProps.successTime){
  if(unanswered ||keyDown('up') || keyDown('down') || keyDown('left') || keyDown('right') || keyDown('space') || mouseDown('left')){
    validationProps.successTime=World.frameCount;
  }
}

var failTime=validationProps.failTime;

if (!validationProps.successTime && World.frameCount > failTime) {
  console.log(validationProps.successCriteria);
  if (!validationProps.successCriteria.madePrompt) {
    console.log('chatbotAddPrompt');
    levelFailure(3, 'chatbotAddPrompt');
  } else if (!validationProps.successCriteria.answeredPrompt) {
    console.log('chatbotAnswerPrompt');
    levelFailure(3, 'chatbotAnswerPrompt');
  } else if (validationProps.successCriteria.madeTitle &&
             !validationProps.successCriteria.printedText &&
             !validationProps.successCriteria.containsInput) {
    console.log('chatbotTitleVariable');
    levelFailure(3, 'chatbotTitleVariable');
  } else if (!validationProps.successCriteria.containsInput) {
    if (!validationProps.successCriteria.printedText){
    console.log('chatbotAddtext');
      levelFailure(3, 'chatbotAddtext');
    } else if(!validationProps.successCriteria.logIncreased){
    console.log('chatbotPrintWhenAnswered');
      levelFailure(3, 'chatbotPrintWhenAnswered');
    } else {
    console.log('chatbotPrintVariable');
      levelFailure(3, 'chatbotPrintVariable');
    } 
  } else if(!validationProps.successCriteria.madeSprite){
    console.log('chatbotNoSprites');
    levelFailure(3, 'chatbotNoSprites');
  } else if(!validationProps.successCriteria.spriteHasBehavior){
    console.log("chatbotNoBehavior");
    levelFailure(3, "chatbotNoBehavior");
  } else {
    console.log(validationProps);
    levelFailure(3, "errorLoadingAnimation");
  }
}

var waitTime = 100;
if (World.frameCount - validationProps.successTime >= waitTime) {
  console.log('Prompt success' + World.frameCount);
  levelFailure(0, 'promptExplore');
}

push();
if(!validationProps.successTime&&World.frameCount){
  fill(rgb(118,102,160));
  rect(0,390,(World.frameCount*400/failTime),10);
} else if(World.frameCount-validationProps.successTime){
   fill(rgb(0,173,188));
  rect(0,390,((World.frameCount-validationProps.successTime)*400/waitTime),10);
}
pop();
