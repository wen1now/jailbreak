main = document.getElementById('game');
levelpacknum = 2;

drawMenu = function(){
	main.innerHTML = '';
	for (var i = 0; i < levelpacknum; i++) {
		//if (levelpacks['pack'+i].vis){
		main.innerHTML += '<div onclick="drawlevelpack('+(i+1)+')" class="choicebutton levelpackbutton">'+(i+1)+'</div>';
		//}
	}
}

drawlevelpack = function(index){
	main.innerHTML = '';
	pack_index = index;
	for (var i = 0; i < levelpacks['pack'+index].length; i++){
		//if (levelpacks['pack'+index][i].vis){
			main.innerHTML += '<div onclick="drawlevel_('+i+')" class="choicebutton levelbutton">'+(i+1)+'</div>';
		//}
	}
}

drawlevel_ = function(index){
	level_index = index;
	loadlevel(levelpacks['pack'+pack_index][level_index]);
}

class Entity {
	constructor(x,y,color,pushable,type,solid){
		this.color = color;
		this.x = x;//x,y coordinates are inverted be careful
		this.y = y;
		this.pushable = pushable;
		this.type = type;
		this.solid = solid;
	}

	setdirections(){
		this.dirs = [null,null,null,null];
		var loop = true;
		var counter = 1;
		while (loop){
			var sum=0;//if all goes well this should be a redundant variable
			for (var j in [0,0,0,0]){
				if (!this.dirs[j]){
					var i=[[-counter,0],[0,counter],[counter,0],[0,-counter]][j];
					if (level[this.x+i[0]] === undefined){sum++} else {
						if (level[this.x+i[0]][this.y+i[1]] === undefined){sum++} else {
							for (var k in level[this.x+i[0]][this.y+i[1]]){
								if (level[this.x+i[0]][this.y+i[1]][k].solid){
									this.dirs[j] = level[this.x+i[0]][this.y+i[1]][k].color;
								}
							}
						}
					}
				}
			}
			if (this.dirs.every(function(x){return (x!=null)})){
				loop = false;
			}
			if (sum==4){loop = false}
			counter++;
		}
	}

}

istrue = function(boolean){
	return boolean;
}

loadlevel = function(string){
    main.innerHTML='<canvas id="canvas" width="1000" height="700"></canvas>';
	x=string.split('\n');
	gameover = false;
	win = false;
	lastattempted = string;
	level = [];
	enemylist = [];
	walllist = [];
	finishlist = [];
	leveltemplate = [];
	for (var i = 0; i<x.length; i++){
		level.push([]);
		leveltemplate.push([]);
		var j=0;
		for (var j_ = 0; j_<x[i].length; j_++){
			level[i].push([]);
			leveltemplate[i].push(0);
			t=x[i][j_];
			if (t=='X'){
				var entity = new Entity(i,j,'#000',false,'enemy',true);
				entity.chase = 'black';
				level[i][j].push(entity);
				enemylist.push(entity);
			} else if (t=='#'){
				var entity = new Entity(i,j,'#666',false,'wall',true);
				level[i][j].push(entity);
				walllist.push(entity);
			} else if (t=='-'){
				var entity = new Entity(i,j,'green',true,'finish',false);
				level[i][j].push(entity);
				finishlist.push(entity);
			} else if (t=='='){
				var entity= new Entity(i,j,'#999',false,'wall',true);
				level[i][j].push(entity);
				walllist.push(entity);//wayyy too hacky. needs fixing probably
				                      //If I had the time I'd set this to transparent but meh
			} else if (t=='@'){
				player = new Entity(i,j,'black',false,'player',true);
				level[i][j].push(player);
			} else if (t==' '){
				level[i].pop();
				leveltemplate[i].pop();
				j--;
			}
			j++;
		}
	}
	drawlevel(50)
}

drawlevel = function(size /*size is the size each square*/){
	/*
	todraw = [];
	for (var i = levelheight - 1; i >= 0; i--) {
		todraw.push([]);
		for (var j = levelwidth - 1; j >= 0; j--) {
			todraw[i].push(null);
		}
	}
	*/
	if (size == undefined){
		size = 50;
	}
	var canvas = document.getElementById('canvas');
	var c = canvas.getContext('2d');
	c.clearRect(0, 0, 1000, 1000);
	c.lineWidth = size/10;
	c.lineCap = "round";
	c.beginPath();
	for (var i in finishlist){
		e = finishlist[i];
		c.fillStyle = e.color;
		c.fillRect(e.y*size,e.x*size,size,size);
	}
	for (var i in enemylist){
		e = enemylist[i];
		c.strokeStyle = e.color;
		c.moveTo((e.y+0.1)*size,(e.x+0.1)*size);
		c.lineTo((e.y+0.9)*size,(e.x+0.9)*size);
		c.moveTo((e.y+0.9)*size,(e.x+0.1)*size);
		c.lineTo((e.y+0.1)*size,(e.x+0.9)*size);
	}
	c.stroke();
	for (var i in walllist){
		e = walllist[i];
		c.fillStyle = e.color;
		c.fillRect(e.y*size,e.x*size,size,size);
	}
	c.drawImage(document.getElementById("player"),player.y*size,player.x*size,size,size);
}

function move(x,y,dir/*direction: 0,1,2,3 = up right down left respectively*/){
	var canmove = true;
	if (gameover){canmove = false}
	for (var k in level[x][y]){//need to fix this with boxes
		if (!level[x][y][k].pushable){canmove = false}
	}
	if (canmove){
		changelocation(player,x,y);
		moveEnemies();
		drawlevel();
	}
	for (var i in level[player.x][player.y]){
		if (level[player.x][player.y][i].type=='enemy'){
			gameover = true;
		}
		if (level[player.x][player.y][i].type=='finish'){
			gameover = true;
			win = true;
		}
	}
}

d=[[-1,0],[0,1],[1,0],[0,-1]];
function moveEnemies(){
	for (var i in leveltemplate){
		for (var j in leveltemplate[i]){
			leveltemplate[i][j] = 0;
		}
	}
	for (var i in enemylist){
		enemylist[i].setdirections();
		var s = 0;
		for (k in enemylist[i].dirs){
			if (enemylist[i].dirs[k] == enemylist[i].chase){
				s++
			}
		}
		enemylist[i].togo = undefined;
		if (s==1){
			enemylist[i].togo = enemylist[i].dirs.indexOf(enemylist[i].chase);
			var m = d[enemylist[i].togo];
			leveltemplate[enemylist[i].x + m[0]][enemylist[i].y + m[1]]++;
		}
	}
	for (var i in enemylist){
		if (enemylist[i].togo !== undefined){
			var m = d[enemylist[i].togo];
			if (leveltemplate[enemylist[i].x + m[0]][enemylist[i].y + m[1]] == 1){
				changelocation(enemylist[i],enemylist[i].x + m[0],enemylist[i].y + m[1])
			}
		}
	}
}

function changelocation(obj,newx,newy){
	for (var k in level[obj.x][obj.y]){
		if (level[obj.x][obj.y][k] == obj){
			level[obj.x][obj.y].splice(parseInt(k),1)
		}
	}
	obj.x = newx;
	obj.y = newy;
	level[newx][newy].push(obj);
}

document.onkeydown = checkKey;

function checkKey(e){
    e = e || window.event;
    if (e.keyCode == '37' || e.keyCode == '65') {
        // left  arrow
        move(player.x,player.y-1,3);
    } else if (e.keyCode == '38' || e.keyCode == '87') {
        // up    arrow
        move(player.x-1,player.y,0);
    } else if (e.keyCode == '39' || e.keyCode == '68') {
    	// right arrow 
        move(player.x,player.y+1,1);
    } else if (e.keyCode == '40' || e.keyCode == '83') {
    	// down  arrow
        move(player.x+1,player.y,2);
    } else if (e.keyCode == '82') {
    	// 'r' key
    	loadlevel(lastattempted);
    }
}

levelpacks = new Object();
levelpacks.pack1 = [
`#######
 #@....-=
 #....X#
 #.....#
 ##...##
 #######
`
]	

levelpacks.pack2 = [
`######
 #@...-=
 #...X#
 #..X.#
 #....#
 ######
`,
`########
 #.....X#
 #.....X#
 #.....X#
 #@....X-=
 ########
 ########
 `,
`############
 #......XXXX-=
 #.....######
 #.....######
 #.....######
 #@....######
 ############
`
]


drawMenu()