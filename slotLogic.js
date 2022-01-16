

// Images are loaded in
var bgr = new Image()
bgr.src = 'images/bgrE.png'

var face = new Image();
face.src = 'https://github.com/AlbinGyllander/slot/blob/5e681411098e4beb41cd6b0e9f23fdd377a61972/images/faceanim.png'

var j = new Image()
j.src = 'https://github.com/AlbinGyllander/slot/blob/5e681411098e4beb41cd6b0e9f23fdd377a61972/images/janim.png'

var k = new Image()
k.src = 'https://github.com/AlbinGyllander/slot/blob/5e681411098e4beb41cd6b0e9f23fdd377a61972/images/kanim.png'

var k2 = new Image()
k2.src = 'https://github.com/AlbinGyllander/slot/blob/5e681411098e4beb41cd6b0e9f23fdd377a61972/images/k2anim.png'

var q = new Image()
q.src = 'https://github.com/AlbinGyllander/slot/blob/5e681411098e4beb41cd6b0e9f23fdd377a61972/images/qanim.png'

var ten = new Image()
ten.src = 'https://github.com/AlbinGyllander/slot/blob/318cb3ef382e1a27fad8a99affbc52b1d32de7e0/images/10anim.png'

//drawing the canvas that handles the spins
var canvas = document.getElementById('canvas')
ctx = canvas.getContext('2d')

//drawing canvas that handles the frame. From the beginning it was planned to create buttons as canvas objects but it created issues with animation redrawing ontop
var canvasButton = document.getElementById('canvasBox');
context = canvasButton.getContext('2d');

// this specifies how commen certain tiles/images/symbols are. As one can see: face is less common as the others.
reelSelection = [face,j,q,q,j,k2,k2,k,k,ten,ten]

//this specifies the number of tiles in a reel
reelLength = 30

// width of a tile, used when drawing the images
tileWidth = canvas.width / 5

//when first loaded the position of a specific reel is 0 but as it spins it was important to handle different postions for each reel
var reelPosition = [0,0,0,0,0]

//This is how much the player starts off with 
var startingCredits = 20000

//these are the information presented to the user such as balance and win
var creditP = document.getElementById('credit')
var winP = document.getElementById('win')
var winBox = document.getElementById('winBox')

//the win is naturally hidden until the player wins
winBox.style.visibility = 'hidden';

//this function draws a reel. It takes three arguments: which reel it pertains to, what the RNG has returned and the length it should draw. In certian cases there is a need to only draw i.e 3 rows but in most cases it draws the entire length of the reelLength.
function generateReel(x_position,tiles,length=reelLength){
	//clearing the canvas before drawing new.
	ctx.clearRect(x_position*200,0,200,600)
	
	// a loop that draws each row in a specific reel.
	for(let y_position = 0;y_position < length;y_position++){
		// drawImage: source of image, x position of source image, y position within source image, width of image in source, heigth of image in source, row position, reel position, width, length
		ctx.drawImage(tiles[x_position][y_position],0,0,240,240,(tileWidth * x_position) ,(tileWidth * y_position) ,tileWidth,tileWidth)

	}

}

//functions that draw the initial canvas the player is presented before spinning. 
function startInnit(){
	//updates the current balance/credit
	creditP.innerHTML = startingCredits
	//generates RNG reels
	var reels = getReels()
	//draws the initial canvas
	for(let x =0; x < 5; x++){
		generateReel(x,reels)
	}
	//draws the background
	context.drawImage(bgr,0,0,bgr.width,bgr.height,0,0,canvasButton.width ,canvasButton.height)	


}
// generating RNG reels
function getReels(){
	// this creates nested arrays of tiles 
	reels = new Array
	for(let i = 0; i < 5; i++) {
		subReel = new Array
		for(let o= 0; o < reelLength; o++) {
			// this is essentially the RNG function, amending random tiles to the specified reel, O in this case
			subReel.push(reelSelection[Math.floor(Math.random() * reelSelection.length)])
		}
		reels[i] = subReel
	}
	return reels
}

//the function is called to animate a win. It takes three arguments: what row the animation should play at, what symbol such as "face" or "k" that that should animate and how many tiles make up the win
function animate(rowNum,image,tileCount){
	// needs to start at one to avoid a blank for the first frame
	frameCount = 1
	// this is the function that generates one frame.
	function repeatAnimationTile(){
		for(let o = 0;o<tileCount;o++){
			//the image (source) is actually just a very wide image making a spritesheet from a gif. The framecount determines what part of that image is to be displayed at a certain time. 
			ctx.drawImage(image,240 * frameCount,0,240,240,(tileWidth * o) ,(tileWidth * rowNum) ,tileWidth,tileWidth)	
		}

		frameCount+=1
		// to stop the animation the number of rendered frames is equal to the total number of possible frames or the user play another spin before this animation has finished.
		if (frameCount >= image.width / image.height || document.getElementById('spinBtn').hasAttribute('disabled')){
			cancelAnimationFrame(animationFrameTile);
			return true
		}else{
			//the timeout slows the rendering down to look better
			setTimeout(() => {
				//this repeats the rendering until it meets the conditions as stated above.
		    	animationFrameTile = requestAnimationFrame(repeatAnimationTile);
			}, 1000/30);
						
		}
	}

	//initiating the first frame rendering
	requestAnimationFrame(repeatAnimationTile); 

}
//a function to see wether the current spin is a win and in that case how much the player have won.
function checkWinning(){
	//a count of symbols in row from left to right
	winnings = new Array
	//this loop loops thourgh all rows and checks how many tiles that are in row from left to right. It return
	for(let row = 0;row<3;row++){
		inrow = 1
		//loops through reels
		for(let reel = 0;reel<4;reel++){
			//checks if reel to the right is the same and if not it breaks.
			if(reels[reel][row] != reels[reel+1][row]){
				break
			} else{
				inrow +=1
			}
		}
		winnings.push(inrow)

	}
	
	//determines what symbol hace won. By finding the largest number in 'winnings' which is the biggest win. 
	winningImg = reels[0][winnings.indexOf(Math.max(...winnings))]

	//checks if the spin is a win. The number sets how many in row tiles one need to have in order for it to count as a win.
	if(winnings[winnings.indexOf(Math.max(...winnings))] == 1){
		return false
	} else{
		//sets the opacity of the canvas in order to further highlight the winning tiles.
		ctx.globalAlpha = 0.5;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1.0;
		
		//animates winning tiles
		animate(winnings.indexOf(Math.max(...winnings)),winningImg,winnings[winnings.indexOf(Math.max(...winnings))])
		
		//changes the balance. At the time of writing (13/1/22) i just set the number of in row tiles times 10 as the win but in order to make the game more sophisticated i would recommend changes it so that for example a less common symbol pays out more.
		startingCredits+=winnings[winnings.indexOf(Math.max(...winnings))]*10
		creditP.innerHTML = startingCredits
		
		// calls for the popup displaying the win
		popUpWin(String(winnings[winnings.indexOf(Math.max(...winnings))]*10))
		
		return true
	}
}

//a function that determines the position of the reel
function getY(x){
	// it is an exponential function that speed of the reel in the beginning then slows it down towards the end
	return ( -4400 * ((1/5) ** ((x -0.87) / 100))) + 25.32
}

// a function that creates a bounce effect before the actual spin
function getBounce(x,u = 10){
	return 1*(10*(x**2)) -4400 -((100)*x)
	
}
//displays the popup for the winning amount
function popUpWin(amount){
	winP.innerHTML = '$' + amount
	winBox.style.visibility = "visible";
}

//the function that handles the spin
function spin(){
	// on each spin, the "winBox" or popup is hidden
	winBox.style.visibility = 'hidden';

	//deducting the bet. At the moment (13/1/22) is always 10 but this is something to improve so the player can choose how much to bet
	startingCredits-=10
	
	//updates the current balance
	creditP.innerHTML = startingCredits
	
	//removes the darkend canvas that highlights a win
	ctx.globalAlpha = 0;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1.0;

	//disable the spin button so that the player cannot spin again while it is already spinning
	document.getElementById('spinBtn').setAttribute('disabled','disabled')
	
	// starting position so that the tiles are rendered above the canvas instead of underneath
	startingPosition = -1 * (200 * reelLength)

	//moves the canvas to its starting position
	ctx.setTransform(1, 0, 0, 1, 0, startingPosition );
	
	// a way to count iterations of the animation which is used to determine the correct position of the reel
	iterval = [0,0,0,0,0]
	
	// a function that spin a specific reel
	function spinReel(reelNum){
		// the repeated frame renderer
		function repeatSpinReel(){
			// if the last reel has reached the bottom the entire animation stops
			if (iterval[4] >= 160 ){
				// allow the player to play again
				document.getElementById('spinBtn').removeAttribute('disabled')

				// cancel the current animation
				cancelAnimationFrame(reelSpinAnimation);
				
				//check winnings 
				checkWinning()
				return true
			} else{
				// how many iterations of frames the bounce should last for
				bounceLength = 10
				
				//determing if a specific reel has reached its bottom and in that case set its position to the acutal bottom. It was really hard to find a getY-function that returned the EXACT postion it should stop at which meant that the symbol somtimes stopped a few pixels before or after the bottom of the canvas which didn't look good. In order to combat this, this function determines when the bottom is reached as close as possible and then set it to postion 0, the EXACT bottom.
				if(getY(iterval[reelNum]*2) >= 0 ){
								
					reelPosition[reelNum] =0
					return

				}else {
					//this makes the reel go up for a bit then start spinning from there. 
					if (iterval[reelNum] < bounceLength){
						reelPosition[reelNum] = getBounce(iterval[reelNum],bounceLength)
						iterval[reelNum]+= 0.2
					} else{
						//this is just the normal spin. The reelPosition is determined by the getY function
						reelPosition[reelNum] = getY(iterval[reelNum]*2)
						iterval[reelNum]+=1
					}
					//set the actual reel to its proper position
					ctx.setTransform(1, 0, 0, 1, 0,reelPosition[reelNum]);
				
					//draw a new reel at its new position. 
					generateReel(reelNum,reels)
					
					//loop again 	
					reelSpinAnimation = requestAnimationFrame(repeatSpinReel);
				}
		
			}		
		}
		requestAnimationFrame(repeatSpinReel);	
	}
	//start the spin for each reel with a bit of delay for each
	for(let h = 0;h<5;h++){
		setTimeout(() => {
			spinReel(h)	
		}, 240 * h);
	}

				
	//generate a fresh set of reels with the RNG	
	var reels = getReels()

}



