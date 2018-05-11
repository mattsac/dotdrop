/* Purposely done without jQuery to show I don't need to rely on one particular framework. */

var yourScore = 0;
var speed = 10;
var dropTimer = 1000;
var dotsObj = [];
var dotCounter = 0;
var dotColors = ['#ff00ff', '#00ffff', '#00ff00', '#ff0000', '#ffffff' ];
var highScore = '';

//variable intialized by functions
var highScoreBoardScore, yourScoreBoardScore, speedSetting, startPauseButton, timerCount, newDotInterval, dropDotInterval, timerObj, gameTimerTimeout, gameArea, overlay;

function init() {
  timerCount = 60;
  yourScore = 0;
  
  //breaking by viewport as looping through getElementsByClassName will slower than id a little.  A jQuery find might work here, but need to test performance.
  if (viewport.is('sm')) {
    highScoreBoardScore = document.getElementById('highScoreBoardScoreSM');
    yourScoreBoardScore = document.getElementById('yourScoreBoardScoreSM');
    speedSetting = document.getElementById('speedSM');
    timerObj = document.getElementById('gameTimerSM');
    startPauseButton = document.getElementById('startPauseSM');
    gameArea = document.getElementById('gameAreaSM');
    overlay = document.getElementById('overlaySM');
  }
  else {
    highScoreBoardScore = document.getElementById('highScoreBoardScoreMD');
    yourScoreBoardScore = document.getElementById('yourScoreBoardScoreMD');
    speedSetting = document.getElementById('speedMD');
    timerObj = document.getElementById('gameTimerMD');
    startPauseButton = document.getElementById('startPauseMD');
    gameArea = document.getElementById('gameAreaMD');
    overlay = document.getElementById('overlayMD');
  }

  
  
  highScoreBoardScore.innerText = highScore;
  gameArea.style.height = window.innerHeight + 'px';
  overlay.style.width = gameArea.offsetWidth + 'px';
  overlay.style.height = window.innerHeight + 'px';
  overlay.style.top = gameArea.offsetTop;
  overlay.style.left = gameArea.offsetLeft;
  speedSetting.addEventListener('change', setSpeed);
  document.getElementById('instrLink').addEventListener('touchend', changeInstrLinkText);
  startPauseButton.addEventListener('click', startStopGame);
}

function startStopGame() {
  highScoreBoardScore.parentElement.className = 'highScoreBoard';
  overlay.innerText = '';
  yourScoreBoardScore.innerHTML = yourScore;
  
  if (this.value == 1) {
    //start game
    gameTimer();
    this.value = 0;
    this.innerHTML = '||';
    this.setAttribute('aria-label', 'Pause Game');
    newDotInterval = window.setInterval(newDot, dropTimer);
    dropDotInterval = window.setInterval(dropDots, dropTimer/10);
    overlay.style.display = 'none';    
  }
  else {
    //pause game
    clearTimeout(gameTimerTimeout);
    this.value = 1;
    this.innerHTML = '&#9658;';
    this.setAttribute('aria-label', 'Start Game');
    clearInterval(dropDotInterval);
    clearInterval(newDotInterval);
    overlay.style.display = 'block';    
  }
}

function gameTimer() {
  timerObj.innerHTML = timerCount;
  timerCount--;
  if (timerCount < 0) {
    endGame();
  }
  else {
    gameTimerTimeout = setTimeout(gameTimer, 1000);
  }
}

function endGame() {
  var newHighScore = false;
  if (yourScore > highScore) {
    highScore = yourScore;
    newHighScore = true;
  }
  clearInterval(dropDotInterval);
  clearInterval(newDotInterval);
  startPauseButton.removeEventListener('click', startStopGame);
  startPauseButton.addEventListener('click', startStopGame);
  startPauseButton.value = 1;
  startPauseButton.innerHTML = '&#9658;';
  startPauseButton.setAttribute('aria-label', 'Start Game');
  for (var x=0; x<dotsObj.length; x++) {
    popDot(dotsObj[x]);
  }
  if (newHighScore) {
    highScoreBoardScore.parentElement.className = 'highScoreBoard newHighScore';
    overlay.innerHTML = 'Game Over<p>New High Score!</p>'; 
  }
  else {
    overlay.innerText = 'Game Over'; 
  }
  overlay.style.display = 'block'; 
  init(true);
}

function getSpeed() {
  return parseInt(speedSetting.value, 10)/10;
}

function setSpeed() {
  speed = parseInt(speedSetting.value, 10);
}

function scorePoint() {
  yourScore += parseInt(this.dataset.value);
  yourScoreBoardScore.innerHTML = yourScore;
  
  popDot(this);
}
    
function popDot(dotElm) {
  var popNum = Math.round((Math.random() * 1) + 1);
  
  dotElm.addEventListener('transitionend', function() {
    removeDot(dotElm);  
  });
  dotElm.addEventListener('webkitTransitionEnd', function() {
    removeDot(dotElm);  
  });
  dotElm.addEventListener('oTransitionEnd', function() {
    removeDot(dotElm);  
  });
  dotElm.addEventListener('MSTransitionEnd', function() {
    removeDot(dotElm);  
  });
  
  dotElm.className = dotElm.className + ' pop';
  var audio = document.getElementById('audio' + popNum);

  audio.load();
  var playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.then(_ => {
    })
    .catch(error => {
    });
  }
}

function removeDot(dotElm) {
  dotElm.remove();
}

function getRandomDot() {
  return Math.round((Math.random() * 10) + 1) * 10;
}

function getDotValue(dotSize) {
   return 11 - (dotSize * 0.1); 
}

function newDot() {
  var dotSize = getRandomDot();
  var dotValue = getDotValue(dotSize);
  var dotLeftPosition = Math.floor(Math.random() * (gameArea.offsetWidth - dotSize));
  var dotTopPosition = gameArea.offsetTop;

  var dot = document.createElement('span');
  dot.setAttribute('class', 'dot');
  dot.setAttribute('data-value', dotValue);
  dot.setAttribute('id','dotNum'+dotCounter++);
  dot.style.width = dotSize + 'px';
  dot.style.height = dotSize + 'px';
  dot.style.top = dotTopPosition  + 'px';
  dot.style.left = dotLeftPosition + 'px';
  dot.style.background = 'radial-gradient(circle at '+(dotSize-10)+'px '+dotSize/3+'px, '+dotColors[Math.floor(Math.random() * dotColors.length)]+', #000)';
  gameArea.appendChild(dot);
  dot.addEventListener('click', scorePoint);
}

function dropDots() {
  dotsObj = document.getElementsByClassName('dot');
  
  for (var x=0; x<dotsObj.length; x++) {
    var dotCurrentTopPosition = dotsObj[x].offsetTop;
    var dotCurrentBottomPosition = dotCurrentTopPosition + dotsObj[x].offsetHeight;
    if (dotCurrentBottomPosition >= window.innerHeight) {
      dotsObj[x].remove();
    } 
    else {
      dotsObj[x].style.top = dotCurrentTopPosition + getSpeed() + 'px';    
    }
  }
}

function changeInstrLinkText() {
  var instructions = document.getElementById('instructions');
  
  if (instructions.className == 'collapse') {
    this.firstElementChild.innerText = '...less';
  }
  else {
    this.firstElementChild.innerText = 'more...';
  }
}

/**
 * helper to detect viewport sizes in javascript
 * usage examples: 
 *  viewport.is('xs')
 *  viewport.isEqualOrGreaterThan('md')
 *
 * Created by steve80 - https://gist.github.com/steveh80/288a9a8bd4c3de16d799
 */

var viewport = (function() {
	var viewPorts = ['xs', 'sm', 'md', 'lg'];

	var viewPortSize = function() {
		return window.getComputedStyle(document.body, ':before').content.replace(/"/g, '');
	}

	var is = function(size) {
		if ( viewPorts.indexOf(size) == -1 ) throw "no valid viewport name given";
		return viewPortSize() == size;
	}

	var isEqualOrGreaterThan = function(size) {
		if ( viewPorts.indexOf(size) == -1 ) throw "no valid viewport name given";
		return viewPorts.indexOf(viewPortSize()) >= viewPorts.indexOf(size);
	}

	// Public API
	return {
		is: is,
		isEqualOrGreaterThan: isEqualOrGreaterThan
	}

})();

//Init Game
window.onload = function() {
  init();
};