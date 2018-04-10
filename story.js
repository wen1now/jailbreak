main = document.getElementById('main');
if (localStorage.getItem("jailbreak_story")){
	num = parseInt(localStorage.getItem("jailbreak_story"));
} else {num = 1}

//"A golden key can open any door" is a nice saying

titles = [
"Act I:   beginning with a single step",
"Act II:  between a rock and a hard place",
"Act III: endless labyrinth",
"Act IV:  'robox'",
"Act V:   deja vu"]
texts = ["Having led a civil war on the planet Ankyria, you, the light and hope of the revolution, have finally been caught. After being tried and convicted of treason, you were sent to the darkest penitentiary in the system (system = star system) (what a cliche). It's up to you now to learn how to fight and defend against the robotic guards that seem hell-bent on keeping you here. (Un?)fortunately, whoever programmed those guards seems to find it amusing to give you false hope in the sense that they are mind-numbingly simple-minded yet at the same time, indestructible.",
"Rather than being straightforward, this prison is a labyrinth. Layer upon layer, passageways within passageways. You stumble around the corner, and are immediately assailed by yet another pack of those unrelentless robotic guards. Luckily you've picked up a new trick or two, and waltz through them with ease. As you bypass them, you reach the exit which contains yet another batch of those strangely shaped keys. How curious.",
"Reading the inscriptions helpfully drawn on the steel walls of this place, it slowly dawns on you: A whole wing of this infernal prison was designed by a single architect - a modern Daedalus. You contemplate this even as you dart through yet more enemies. The tiredness sets in and the rooms begin blurring in front of your eyes; you find yourself at a room that looks identical in almost every aspect. Intended to confuse you no doubt.",
"The unending sea of greys finally ends with this.. this <i>box</i>. What is it even supposed to be? You look at it. Flawlessly polished to a smooth iridescent sheen, the box is impossible to grip, impossible to pull, impossible to lift. You hurl yourself against it only to shift it negligibly. Wait no - as you watch, you realise it seemingly glides with minimal friction. After what seems like a few minutes, it finally comes to a rest. The robots don't seem to notice. You sigh as you realise what this means - another sector to get through.",
"You feel like you've been here before. The maze designers aren't making it easy - although the previous rooms have been designed purely for aesthetics, these rooms are dastardly deviously difficult. You retrace your old steps only to realise that there's an extra enemy there cutting off your escape... you try to lure enemies into forgotten configurations only to realise that those subsidiaries prevent you from reaching the exit. The endlessness is taking its toll; you close your eyes and take in a few breaths. You can make it."]
finale = ["<p><i>To be continued...</i></p>"]

for (var i = 0; i<num; i++){
	if (titles[i] && texts[i]){
		main.innerHTML += "<h3>"+titles[i]+"</h3>";
		main.innerHTML += "<p>"+texts[i]+"</p>";
	}
}

main.innerHTML += finale;