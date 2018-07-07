
    const canvas = document.getElementById("tetris");
    let end = 0;
    const context = canvas.getContext('2d');
    context.scale(20,20);

    const scoreTable = {
      highest: [],
      updateEnd: function(currentScore){
        for(let i = 0; i < this.highest.length; i++){
          if(currentScore > this.highest[i]){
            this.highest[i] = currentScore;
            i = 4;
            let save =  JSON.stringify(this.highest);

            let xhr = new XMLHttpRequest;
            xhr.open('PUT','https://jsonblob.com/api/jsonBlob/62fcdc92-600d-11e8-823e-45853e38ce15', true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(save);

          }
        }
      },
      displayScore: function(){
        let places = document.getElementById('scores').children;
        
        for(let i = 0; i < places.length; i++){
          places[i].innerText = (i + 1) + ". " + this.highest[i];          
        }
      },
      updateStart: function(){
        let xhr2 = new XMLHttpRequest;
        xhr2.open('GET', 'https://jsonblob.com/api/jsonBlob/62fcdc92-600d-11e8-823e-45853e38ce15', false);
        xhr2.send();
        if (xhr2.status != 200) {
            console.log( xhr2.status + ': ' + xhr2.statusText ); 
          } else {
             this.highest = JSON.parse(xhr2.responseText);
             console.log(this.highest)
          }
      }
    }


    const matrix = [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ];

    function collide(arena, player){
      const [m, o] = [player.matrix, player.pos];
      for(let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
          if(m[y][x] !== 0 &&
             (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
            return true;
          }
        }
      }
      return false;
    }

    const colors = [
      null,
      "red",
      "blue",
      "violet",
      "pink",
      "green",
      "orange",
      "purple"
    ]

    function createMatrix(w, h){
      const matrix = [];
      while (h--){
        matrix.push(new Array(w).fill(0))
      }
      return matrix;
    }

    function createFigure(type){
      if(type === "O") {
        return [
                [1, 1],
                [1, 1]
              ];
      } else if(type === "I") {
        return [
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0],
                [0, 2, 0, 0]

              ];
      } else if(type === "S") {
        return [
                [0, 3, 3],
                [3, 3, 0],
                [0, 0, 0]
              ];
      } else if(type === "Z") {
        return [
                [4, 4, 0],
                [0, 4, 4],
                [0, 0, 0]
              ];
      } else if(type === "L") {
        return [
                [0, 5, 0],
                [0, 5, 0],
                [0, 5, 5]
              ];
      } else if(type === "J") {
        return [
                [0, 6, 0],
                [0, 6, 0],
                [6, 6, 0]
              ];
      } else if(type === "T") {
        return [
                [0, 0, 0],
                [7, 7, 7],
                [0, 7, 0]
              ];
      }
    }

    function draw(){
      context.fillStyle = '#000';
      context.fillRect(0, 0,canvas.width, canvas.height);
      drawMatrix(arena, {x:0, y:0})
      drawMatrix(player.matrix, player.pos);
    }
    function drawMatrix(matrix,offset){
      matrix.forEach(function(row, y){
        row.forEach(function(value, x){
          if(value !== 0){
            context.fillStyle = colors[value];
            context.fillRect(offset.x + x,offset.y + y,1,1);
          }
        });


      });
    };

    function fade(element, duration) {
      element.style.opacity = 0;
      let op = 0;
      intervalID = setInterval(function(){
          element.style.opacity = op;
          op += 0.08;
          if(element.style.opacity > 1){
            clearInterval(intervalID)
          }
      },15 * duration);
    }
    function gameOver(){
        gameOverSound.play();
        updateScore();
        canvas.style.opacity = 0.3;
        end = 1;
        document.getElementById('startCount').innerText = "GAME OVER";
        document.getElementById('startCount').style.display = "block";
        document.getElementById('startBut').style.display = "block";
        scoreTable.updateEnd();
        scoreTable.updateStart();
        scoreTable.displayScore();
        gameOverSound2.play();
    }

    function lineBurn(){
      let lineCount = 0;
      function burnAction(){
      for(let y = arena.length -1; y > 0; --y){
        let burn = arena[y].every( (val, i, arr) => val > 0);
        if(burn){
          if(lineCount == 0){ lineCount = 1};
          arena[y].map( (x, i, ar) => ar[i] = 0);
          for(let x = y; x > 0; --x){
            arena[x] = arena[x-1];
          }

          lineCount *= 2;
          lineClearSound.play();
          burnAction();
          }
        }
      }
      burnAction();
      player.score += lineCount * 10;

/*      let intervalSpeed = Math.trunc(player.score / 200);
      dropInterval = 1000 - intervalSpeed * 100; */
      


    }

    function merge(arena, player){
        player.matrix.forEach(function(row, y){
          row.forEach(function(value, x){
            if(value !== 0){
              arena[y + player.pos.y][x + player.pos.x] = value;
            }
          });
        });
    }


    function playerDrop(){
      player.pos.y++;
      dropSound.play();
      if(collide(arena, player)){
        landSound.play();
        player.pos.y--;
        merge(arena, player);
        lineBurn();
        resetFigure();
        updateScore();

        
      }
      dropCounter = 0;
    }

    function playerMove(direction){
      dropSound.play();
      player.pos.x += direction;
      if(collide(arena,player) ){
        player.pos.x -= direction;
      }
    }

    function resetFigure(){
      let type = 'OISZLJT';
      player.matrix = createFigure(type[Math.floor(type.length * Math.random())]);
      player.pos.y = 0;
      player.pos.x = (Math.floor(arena[0].length / 2) - (Math.floor(player.matrix[0].length / 2)));
      if(collide(arena,player)){        
        gameOver();
      }
    }

    function resetGame(){
      end = 0;
      canvas.style.opacity = 1;
      arena.forEach(row => row.fill(0));
      updateScore();
      resetFigure();
      update();
    }

    function playerRotate(direction){
      rotateSound.play();
      let pos = player.pos.x;
      let offset  = 1;
      rotate(player.matrix,direction);
      while(collide(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1: -1))
        if (offset > player.matrix[0].length){
          rotate(player.matrix, -dir);
          player.pos.x = pos;
        }
      }
    }

    function rotate(matrix,direction){
        for(let y = 0; y < matrix.length; y++){
        for(let x = 0; x < y; x++){
          [
            matrix[x][y],
            matrix[y][x]
          ] = [
            matrix[y][x],
            matrix[x][y]
          ];
        }
      }

      if(direction > 0) {
        matrix.forEach(function(row){ row.reverse() })
      }else{
        matrix.reverse();
      }

    }

    function Sound(src){
      this.sound = document.createElement("audio");
      this.sound.src = src;
      this.sound.setAttribute("preload", "auto");
      this.sound.setAttribute("controls", "none");
      this.sound.style.display = "none";
      document.body.appendChild(this.sound);
      this.play = function(){
          this.sound.play();
      }
      this.stop = function(){
          this.sound.pause();
      }    
    }
                                                              //Sound variables
    let openSound = new Sound('sound/open.ogg');
    let dropSound = new Sound('sound/drop.ogg');
    let landSound = new Sound('sound/land.ogg');
    let rotateSound = new Sound('sound/rotate.ogg');
    let gameOverSound = new Sound('sound/gameOver.mp3');
    let gameOverSound2 = new Sound('sound/gameOver2.mp3');
    let lineClearSound = new Sound('sound/lineClear.mp3');
                                                              //END of sound variables

    let dropCounter = 0;
    let dropInterval = 1000;

    let lastTime = 0;
    let lastId;
    function update(time = 0){
      
      let deltaTime = time - lastTime;
      lastTime = time;
      
      dropCounter += deltaTime;
      if (dropCounter > dropInterval){
        playerDrop();
      }
      
        draw();
        if(end == 0){
          lastId = requestAnimationFrame(update);
        }

      
    }
    //update finish
    function updateScore(){
      document.getElementById('currentScore').innerText = "Score: " + player.score;
    }

    const arena = createMatrix(12,20);



    const player = {
      pos:{x:0, y:0},
      matrix: null,
      score: 0
    }

    document.addEventListener('keydown',function(event){
      if (event.keyCode == 37){ 
          playerMove(-1);
      }else if (event.keyCode == 39){ 
           playerMove(1);
      }else if (event.keyCode == 40){
          playerDrop();
      }else if(event.keyCode == 38){
        playerRotate(1);
      }else if(event.keyCode == 81){
        playerRotate(-1);
      }else if(event.keyCode == 13){
        update();
      }

    })



function gameStart(){

    let dropCounter = 0;
    let dropInterval = 800;
    let counter = 3;
    let lastTime = 0;
    let lastId;
    let tetImg = document.getElementById('tetrisImg1');
    let starButton = document.getElementById('startBut');
    tetImg.style.opacity = 0
    starButton.style.opacity = 0
    document.addEventListener('keydown',function open(event){
      if(event.keyCode == 32){
        fade(tetImg,10);
        fade(starButton,10);
        document.getElementById('space').style.display ='none';
        openSound.play();
        document.removeEventListener('keydown',open)
      }
   })
    //Load the scoretable and tetris image
;
    scoreTable.updateStart();
    scoreTable.displayScore();
    
    

    function updateCounter(time = 0){ 
      let deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if (dropCounter > dropInterval){
        if(counter == 0){
          document.getElementById('startCount').style.fontSize = 1.5 + "em";
          document.getElementById('startCount').innerHTML = "Let's go, <p> BABY!";
          counter -= 1;
          dropCounter = 0;
        }else if( counter > 0){
          document.getElementById('startCount').innerText = counter;
          counter -= 1;
          dropCounter = 0;
        }else if( counter == -1){
          cancelAnimationFrame(lastId);
          counter = -2;
          document.getElementById('startCount').style.display = 'none';
          resetGame();
        }
      }
      if(counter >= -1){
        lastId = requestAnimationFrame(updateCounter);
      }
    }; 
// function Update ends;
      
      document.getElementById('startBut').addEventListener('click',function(){
        document.getElementById('tetrisImg').style.display = 'none';
        document.getElementById('startBut').style.display = 'none';
        document.getElementById('startCount').style.display = 'block';
        counter = 3;
        updateCounter();
        
      });
}

gameStart();

