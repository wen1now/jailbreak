main = document.getElementById('game');
levelpacknum = 5;
playing = false;

document.getElementById("tooltip").style.visibility = "hidden";

drawMenu = function(){
	main.innerHTML = '';
	document.getElementById("information").innerHTML = "";
	document.getElementById("sizeincrease").style.visibility = "hidden";
	document.getElementById("sizedecrease").style.visibility = "hidden";
	playing = false;
	levelpacks.checkunlocks();
	for (var i = 0; i < levelpacknum; i++) {
		if (levelpacks['pack'+(i+1)].vis){
			main.innerHTML += '<div onclick="drawlevelpack('+(i+1)+')" class="choicebutton levelpackbutton" onmouseenter="hoveringlevelpack('+i+')" onmouseleave="hidetooltip()" id="levelpack'+i+'">'+(i+1)+'</div>';
		} else {
			main.innerHTML += '<div class="choicebutton lock" onmouseenter="hoveringlevelpacklock('+i+')" onmouseleave="hidetooltip()" id="levelpack'+i+'"><img src="lock.png" width = "35px" height = "40px" margin="0px"></div>';

		}
	}
	drawScore();
}

drawScore = function(){
	document.getElementById("score").innerHTML = "Keys: "+points;
}


pack_index = undefined;	
drawlevelpack = function(index){
	document.getElementById("information").innerHTML = "Act "+index;
	hidetooltip();
	pack_index = parseInt(index);
	drawlevelpack_real();
}

drawlevelpack_real = function(){
	var index = pack_index;
	main.innerHTML = '';
	checkunlocks();
	for (var i = 0; i < levelpacks['pack'+index].length; i++){
		if (levelpacks['pack'+index][i].vis||levelpacks['pack'+index][i].completed){
			if (levelpacks['pack'+index][i].completed){
				main.innerHTML += '<div onclick="drawlevel_('+i+')" class="choicebutton levelbutton">'+(i+1)+'</div>';
			} else {
				main.innerHTML += '<div onclick="drawlevel_('+i+')" class="choicebutton unfinishedlevelbutton" onmouseenter="hoveringlevelpoints('+i+')" onmouseleave="hidetooltip()" id="level'+i+'">'+(i+1)+'</div>';				
			}
		} else {
			main.innerHTML += '<div class="choicebutton lock" onmouseenter="hoveringlevel('+i+')" onmouseleave="hidetooltip()" id="level'+i+'"><img src="lock.png" width = "35px" height = "40px" margin="0px"></div>';
		}
	}
}

drawlevel_ = function(index){
	hidetooltip();
	level_index = parseInt(index);
	loadlevel(levelpacks['pack'+pack_index][level_index].level);
	document.getElementById("information").innerHTML = "Act "+pack_index+": level "+(index+1);
	document.getElementById("sizeincrease").style.visibility = "visible";
	document.getElementById("sizedecrease").style.visibility = "visible";
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
				} else {sum++}
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
    main.innerHTML='<canvas id="canvas" width="1200px" height="1200px"></canvas>';
	x=string.split('\n');
	gameover = false;
	win = false;
	lastattempted = string;
	undolist = [];
	level = [];
	enemylist = [];
	walllist = [];
	finishlist = [];
	leveltemplate = [];
	boxlist = [];
	var i = 0;
	for (var i_ = 0; i_<x.length; i_++){
		level.push([]);
		leveltemplate.push([]);
		var j = 0;
		for (var j_ = 0; j_<x[i_].length; j_++){
			level[i].push([]);
			leveltemplate[i].push(0);
			t=x[i_][j_];
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
				var entity = new Entity(i,j,'green',false,'finish',false);
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
			} else if (t=='b'){
				var entity= new Entity(i,j,'#a65',true,'box',true);
				level[i][j].push(entity);
				boxlist.push(entity);
			} else if (t==' '){
				level[i].pop();
				leveltemplate[i].pop();
				j--;
			}
			j++;
		}
		if (level[i].length==0){level.pop()}
		else {i++}
	}
	playing = true;
	drawlevel(50);
}

size = 40;
drawlevel = function( /*size is the size each square*/){
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
	c.clearRect(0, 0, 1200, 1200);
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
	for (var i in boxlist){
		e = boxlist[i];
		c.fillStyle = e.color;
		c.fillRect((e.y+0.1)*size,(e.x+0.1)*size,size*0.8,size*0.8);
	}
	c.drawImage(document.getElementById("player"),player.y*size,player.x*size,size,size);
}

sizeincrease = function(){
	size *= 1.1;
	drawlevel();
}

sizedecrease = function(){
	size /= 1.1;
	drawlevel();
}

stringlevel = function(){
	string = ''
	for (var i in level){
		for (var j in level[i]){
			space=true;
			for (var k in level[i][j]){
				if (level[i][j][k].type == 'enemy'){string+='X';space=false}
				if (level[i][j][k].type == 'player'){string+='@';space=false}
				if (level[i][j][k].color == '#666'){string+='#';space=false}
				if (level[i][j][k].type == 'finish'){string+='-';space=false}
				if (level[i][j][k].type == 'box'){string+='b';space=false}
			}
			if (space){string+='.'}
		}
		string+='\n'
	}
	return string;
}

undo = function(){
	if (undolist.length>0){
		var temp = lastattempted;
		var temp_ = undolist.slice();
		loadlevel(undolist.pop());
		undolist = temp_;
		undolist.pop()
		lastattempted = temp;
		drawlevel(50);
	}
}

undolist = []
function move(x,y,dir/*direction: 0,1,2,3 = up right down left respectively*/){
	var canmove = true;
	var pushing = [];
	if (gameover){canmove = false}
	for (var k in level[x][y]){//need to fix this with boxes
		if (level[x][y][k].solid){
			if (level[x][y][k].pushable){
				pushing.push(level[x][y][k]);//.push() geddit? hahahaa
				for (var k_ in level[x+d[dir][0]][y+d[dir][1]]){
					if (level[x+d[dir][0]][y+d[dir][1]][k_].solid){
						canmove = false;
					}
				}
			} else {canmove = false}
		}
	}
	if (canmove){
		//FIX THIS LATER!
		undolist.push(stringlevel());
		changelocation(player,x,y);
		for (var k in pushing){
			changelocation(pushing[k],x+d[dir][0],y+d[dir][1])
		}
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
			playing = false;
			if (!levelpacks['pack'+pack_index][level_index].completed){
				points += levelpacks['pack'+pack_index][level_index].onwin;
			}
			levelpacks['pack'+pack_index][level_index].completed = true;
			save();
			drawScore();
			setTimeout(nextlevel,500);
		}
	}
}

nextlevel = function (){
	if (level_index+1<levelpacks['pack'+pack_index].length &&
		levelpacks['pack'+pack_index][level_index+1].unlock<=points){
		drawlevel_(level_index+1)
	} else {drawMenu()}
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
    if (playing){
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
	    } else if (e.keyCode == '85' || e.keyCode == '90') {
	    	// 'r' key
	    	undo();
	    }
	}
}

hoveringlevel = function(index){
	var a = document.getElementById('level'+index);
	var t = document.getElementById('tooltip');
	var s = a.getBoundingClientRect();
	t.style.top = s.top+'px';
	t.style.left = s.left + 70+'px';
	t.innerHTML = "Unlock at "+levelpacks['pack'+pack_index][index].unlock+" key(s)";
	t.style.visibility = "visible";
}

hoveringlevelpoints = function(index){
	var a = document.getElementById('level'+index);
	var t = document.getElementById('tooltip');
	var s = a.getBoundingClientRect();
	t.style.top = s.top+'px';
	t.style.left = s.left + 70+'px';
	t.innerHTML = "Complete for "+levelpacks['pack'+pack_index][index].onwin+" key(s)";
	t.style.visibility = "visible";	
}

hoveringlevelpacklock = function(index){
	var a = document.getElementById('levelpack'+index);
	var t = document.getElementById('tooltip');
	var s = a.getBoundingClientRect();
	t.style.top = s.top+'px';
	t.style.left = s.left + 70+'px';
	t.innerHTML = "Unlock at "+levelpacks['pack'+(index+1)].unlock+	" keys";
	t.style.visibility = "visible";
}

hoveringlevelpack = function(index){
	var a = document.getElementById('levelpack'+index);
	var t = document.getElementById('tooltip');
	var s = a.getBoundingClientRect();
	t.style.top = s.top+'px';
	t.style.left = s.left + 70+'px';
	var l = 0;
	for (var i in levelpacks['pack'+(index+1)]){
		if (levelpacks['pack'+(index+1)][i].completed){
			l++;
		}
	}
	t.innerHTML = "Completed: "+l+'/'+levelpacks['pack'+(index+1)].length;
	t.style.visibility = "visible";
}

hidetooltip = function(){
	document.getElementById('tooltip').style.visibility = "hidden";
}

points = 0;

save = function(){
	//it *should* save the game here at some point
	//stuff to save: which levels have been completed, player's current point number
	var levels = []
	for (var i = 1; i <= levelpacknum; i++) {
		for (var j = 0; j < levelpacks['pack'+i].length; j++){
			if (levelpacks['pack'+i][j].completed){levels.push(levelpacks['pack'+i][j].id)}
		}
	}
    localStorage.setItem("jailbreak_save", JSON.stringify(levels));
}

delsave = function(){
    localStorage.removeItem("jailbreak_save");
}

load = function(){
	//load the game too, that seems necessary
    if (localStorage.getItem("jailbreak_save")){
        var levels = JSON.parse(localStorage.getItem("jailbreak_save"));
		for (var i = 1; i <= levelpacknum; i++) {
			for (var j = 0; j < levelpacks['pack'+i].length; j++){
				if (levels.includes(levelpacks['pack'+i][j].id)){
					levelpacks['pack'+i][j].completed = true;
					points += levelpacks['pack'+i][j].onwin;
				}
			}
		}
    }
}

setup = function(){
	for (var i = 1; i <= levelpacknum; i++) {
		for (var j = 0; j < levelpacks['pack'+i].length; j++){
			levelpacks['pack'+i][j].completed = false;
			levelpacks['pack'+i][j].vis = false;
			if (levelpacks['pack'+i][j].onwin === undefined){levelpacks['pack'+i][j].onwin = 1}
		}
	}
}

checkunlocks = function(){
	for (var i = 0; i < levelpacknum; i++) {
		for (var j = 0; j < levelpacks['pack'+(i+1)].length; j++){
			if (points >= levelpacks['pack'+(i+1)][j].unlock){
				levelpacks['pack'+(i+1)][j].vis = true;
			}
		}
	}
}


levelpacks = new Object();
//theme: no special rule i.e beginner levels
levelpacks.checkunlocks = function(){
	for (var i = 0; i < levelpacknum; i++) {
		if (points >= levelpacks['pack'+(i+1)].unlock){
			levelpacks['pack'+(i+1)].vis = true;
		}
	}
}

levelpacks.setupunlocks = function(){
	for (var i = 0; i < levelpacknum; i++) {
		if (levelpacks['pack'+(i+1)].unlock===undefined){
			levelpacks['pack'+(i+1)].unlock = 0;
		}
		levelpacks['pack'+(i+1)].vis = false;
	}
}

levelpacks.pack1 = [{
	id: '000',
	unlock: 0,
	onwin: 1,
	level:
`
#######
#@....-=
#....X#
#.....#
##...##
#######
`
},{
	id: 'somelevel',
	unlock: 1,
	onwin: 1,
	level:
`
#######
#.....#
#...#.#
#....@#
###.###
###X###
###-###
`
},{
	id: '9723597293#uniqueidamirite',
	unlock: 2,
	onwin: 1,
	level:
`
#########
#...#..@#
#.#...#.#
#...#...#
#X#...#.#
-X..#X..#
#########
`
}
]

//'normal' levels
levelpacks.pack2 = [{
	id: 'dash',
	unlock: 3,
	onwin: 2,
	level:
`
######
#@...-=
#...X#
#..X.#
#....#
######
`
},{
    id: 'a new possibility',
	unlock: 4,
	onwin: 1,
    level:
`
########
#.....X-
#.#....#
#@....X#
#..X...#
########
`
},{
	id: '001',
	unlock: 5,
	onwin: 3,
	level:
`
########
#.....X#
#.....X#
#.....X#
#@....X-=
########
`
},{
	id: 'nottoobad',
	unlock: 8,
	onwin: 4,
	level:
`
#########
#@......-
#.#.#.#X#
#.X...#X#
#.#.#.#X#
#.X.....#
#.#.#.#.#
#.X.....#
#########
`
},{
	id: '002',
	unlock: 12,
	onwin: 4,
	level:
`
############
#......XXXX-=
#.....######
#.....######
#.....######
#@....######
############
`
},{
	id: 'Ihopethisisunique',
	unlock: 16,
	onwin: 3,
	level:
`
##########
#.....XXX-
#....#XXX#
#....#...#
#....#...#
#........#
#@.......#
##########
`
},{
    id: 'levelben',
	unlock: 16,
	onwin: 1,
    level:
`
#########
#......X#
#.#...#.#
#...@..X-
#.#...#.#
#......X#
#########
`
},{

    id: 'anotherlevelwhichneedsauniqueid',
	unlock: 16,
	onwin: 1,
    level:
`
############
#@.........#
#...X...X..-
#.X...X...X#
#..........#
############
`
}]
levelpacks.pack2.unlock = 3;



//Will hu levels
levelpacks.pack3 = [{
	id: 'veryeasylevel',
	unlock: 5,
	onwin: 1,
	level:
`
#-#######
#XX.....#
#@......#
#XX.....#
#########
`
},{
	id: "Too Many Cooks I",
	unlock: 5,
	onwin: 1,
	level:
`
#########
#...@..X#
#..X.X.X#
#X......#
#.....X.#
#.X.....#
#.......#
#...X...#
####-####
`
},{
	id: "Too Many Cooks II",
	unlock: 11,
	onwin: 3,
	level:
`
#########
#...@..X-
#..X.X.X#
#X......#
#.....X.#
#.X.....#
#.......#
#...X...#
#########
`
},{
	id: 'lounge',
	unlock: 9,
	onwin: 2,
	level:
`
#########
#@......#
#.......#
#......X#
#.XXX..X#
####-####
`
},{
	id: 'lounge2',
	unlock: 15,
	onwin: 3,
	level:
`
#########
###X##X##
###.##.##
#@......#
#.......#
#......X#
#.XXX..X#
####-####
`
}]
levelpacks.pack3.unlock = 5;

//next world at 20 things

levelpacks.pack4 = [{
	id: 'box1',
	unlock: 20,
	onwin: 2,
	level:
`
########
#X....X-
###.@###
#....bX#
#.#..#.#
#......#
####...#
########
`
},{
	id: 'box2',
	unlock: 22,
	onwin: 2,
	level:
`
#######
#X...X#
#X...X-
#X...X#
#..b..#
#..b..#
##.@.##
#######
`
},{
	id: 'box3+',
	unlock: 24,
	onwin: 2,
	level:
`
#######-#
#X.X.X.X#
#.#.#.#.X
#.......#
#.#.#.#.#
#.......#
#b#b#b#b#
#......@#
#########
`
}]
levelpacks.pack4.unlock = 20;

levelpacks.pack5 = [{
	id: '002_',
	unlock: 27,
	onwin: 1,
	level:
`
###########
#.....XXXX-
#.....#####
#.....#####
#.....#####
#@....#####
###########
`
},{
    id: 'levelben_',
	unlock: 32,
	onwin: 2,
    level:
`
#########
#......X#
#.#...###
#...@..X-
#.#...###
#......X#
#########
`
},{
    id: 'DedicatedToWensSecondBrotherWhoeverHeIs',
	unlock: 36,
	onwin: 4,
    level:
`
#########
#....XXX-
#.#.###X#
#.....#X#
#.#.#.#X#
#.......#
#.#.#.#.#
#@......#
#########
`
}]
levelpacks.pack5.unlock = 24;

levelpacks.setupunlocks();
setup();
load();
save();


drawMenu()