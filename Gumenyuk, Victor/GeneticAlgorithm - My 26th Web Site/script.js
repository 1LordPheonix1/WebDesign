// Simulation arrays
let vehicles = [];
let predators = [];
let vChildren = [];
let pChildren = [];
let plants = [];
let poison = [];

// Simulation constants
let numPlants = 200, numPoison = 30, numVehicles = 15, numPredators = 5;
let plantsRate = 0.3, poisonRate = 0.1;
let maxPoison = 500;
let currentPoisonRate = poisonRate;

// Simulation Parameters
let debug; // Debug Checkbox
let simulationData = []; // Parameters
let generateBtn; // Start Button

// Vehicle Parameters
let vehicleData = []; // Parameters

// Genetic Parameters
let geneticData = []; // Parameters

// Setup
function setup() {
	// Get parameter data
	getParameterData();
	getVehicleData();
	getGeneticData();

	createCanvas(1280, 720);

	//Create Elements
	createElements();

	// Debug checkbox
	debug = select('#debug');
	generateBtn = select('#genBtn');
}

// Add plants
function mousePressed() {
	plants.push(createVector(mouseX, mouseY));
}

// Simulation Loop
function draw() {
	background(51);

	// Add more plants and poison
	if(random(1) < plantsRate) {plants.push(createVector(random(width), random(height)));}
	if(random(1) < currentPoisonRate) {poison.push(createVector(random(width), random(height)));}

	// Draw plants
	fill(0, 255, 0);
	noStroke();
	for(let i=0; i<plants.length; i++) {
		ellipse(plants[i].x, plants[i].y, 6, 6);
	}

	// Draw Poison
	fill(255, 0, 0);
	noStroke();
	for(let i=0; i<poison.length; i++) {
		ellipse(poison[i].x, poison[i].y, 6, 6);
	}

	// Vehicle functions
	for(let i=vehicles.length-1; i>= 0; i--) {
		vehicles[i].boundaries();
		vehicles[i].behaviors(plants, poison);
		vehicles[i].update();
		vehicles[i].display();

		let child = vehicles[i].cloneSelf();
		if(child !== null) {
			vChildren.push(child);
		}

		if(vehicles[i].dead()) {
			plants.push(createVector(vehicles[i].pos.x, vehicles[i].pos.y));
			vehicles.splice(i, 1);
		}
	}

	// Predator functions
	for(let i=predators.length-1; i>= 0; i--) {
		predators[i].boundaries();
		predators[i].behaviors(vehicles, poison);
		predators[i].update();
		predators[i].display();

		let child = predators[i].cloneSelf();
		if(child !== null) {
			pChildren.push(child);
		}

		if(predators[i].dead()) {
			plants.push(createVector(predators[i].pos.x, predators[i].pos.y));
			predators.splice(i, 1);
		}
	}

	// Add children to vehicle array
	for(let i=0; i<vChildren.length; i++) {
		vehicles.push(vChildren[i]);
	}

	// Add children to predator array
	for(let i=0; i<pChildren.length; i++) {
		predators.push(pChildren[i]);
	}

	// Reset children
	vChildren = [];
	pChildren = [];

	// If too many poison, lower poison rate
	if(poison.length > maxPoison) {
		currentPoisonRate = 0;
	} else if(poison.length < maxPoison) {
		currentPoisonRate = poisonRate;
	}
}

function generateSimulation() {
	// Reset
	vehicles = [];
	predators = [];
	vChildren = [];
	pChildren = [];
	plants = [];
	poison = [];
	vehicleData = [];
	simulationData = [];
	getParameterData();
	getVehicleData();
	getGeneticData();
	background(51);
	createElements();

}

function getVehicleData() {
	// Get parameter data
	let parameterChilds = document.getElementById("parameters2").children;
	for(let i=0; i<parameterChilds.length; i+= 2) {
		vehicleData.push(parameterChilds[i].value * 1);
	}
}

function getGeneticData() {
	// Get parameter data
	let parameterChilds = document.getElementById("parameters3").children;
	for(let i=0; i<parameterChilds.length; i+= 2) {
		geneticData.push(parameterChilds[i].value * 1);
	}
}

function getParameterData() {
	// Get parameter data
	let parameterChilds = document.getElementById("parameters").children;
	for(let i=0; i<parameterChilds.length; i+= 2) {
		simulationData.push(parameterChilds[i].value * 1);
	}
	numVehicles = simulationData[0]; numPlants = simulationData[1]; 
	numPoison = simulationData[2]; plantsRate = simulationData[3]; 
	poisonRate = simulationData[4]; maxPoison = simulationData[5]; // Initialize
}

function createElements() {
	// Create Vehicles
	for(let i=0; i<numVehicles; i++) {
		vehicles.push(new Vehicle(random(width), random(height)));
	}

	// Create Predators
	for(let i=0; i<numPredators; i++) {
		predators.push(new Predator(random(width), random(height)));
	}

	// Create plants & poison
	for(let i=0; i<numPlants; i++) {
		plants.push(createVector(random(width), random(height)));
	}
	for(let i=0; i<numPoison; i++) {
		poison.push(createVector(random(width), random(height)));
	}
}