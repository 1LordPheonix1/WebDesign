class Vehicle{
	constructor(x, y, dna) {
		// Position and speed
		this.pos = createVector(x, y);
		this.vel = createVector(random(vehicleData[0], vehicleData[1]), random(vehicleData[0], vehicleData[1]));
		this.acc = createVector(0, 0);
		this.r = 4; // Size
		this.maxspeed = vehicleData[2];
		this.maxforce = vehicleData[3];

		// Health & nutrition
		this.maxHealth = vehicleData[4];
		this.currentHealth = this.maxHealth;
		this.healthRate = vehicleData[5];
		this.nutritionalValue = [vehicleData[6], vehicleData[7]]; // plant, poison;

		// Mutation
		this.mr = vehicleData[9]; // mutation rate
		this.mrPercent = [geneticData[2], geneticData[5], geneticData[8], geneticData[11]]; // percent adjusted per dna[i];

		// Minimums and maximums for each index in dna array
		this.mins =  [geneticData[0], geneticData[3], geneticData[6],  geneticData[9]];
		this.maxes = [geneticData[1],  geneticData[4],  geneticData[7], geneticData[10]];
		// DNA
		// dna[0] = plant Attractiveness
		// dna[1] = poison Attractiveness
		// dna[2] = plant perception
		// dna[3] = poison perception
		this.dna = [];
		if(dna == undefined) {
			for(let i=0; i<this.mins.length; i++) {
				this.dna[i] = random(this.mins[i], this.maxes[i]);
				if(random(1) < this.mr) {
					// Mutation
					let percent = this.mrPercent[i]/100;
					let lowest = percent * this.mins[i];
					let highest = percent * this.maxes[i];
					let mrAmount = map(random(1), 0, 1, lowest, highest);
					
					// Check if within constraints
					if(mrAmount + this.dna[i] < this.mins[i]) {
						this.dna[i] = this.mins[i];
					} else if(mrAmount + this.dna[i] > this.maxes[i]) {
						this.dna[i] = this.maxes[i];
					} else {
						this.dna[i] += mrAmount;
					}
				}
			}
		} else {
			this.dna = dna;
		}

		// Reproduction rate
		this.reproductionRate = vehicleData[8];
	}

	// Mutate DNA 
	mutate() {
		for(let i=0 ; i<this.mins.length; i++) {
			if(random(1) < this.mr) {
				let percent = this.mrPercent[i]/100;
				let lowest = percent * this.mins[i];
				let highest = percent * this.maxes[i];
				let mrAmount = map(random(1), 0, 1, lowest, highest);
				
				// Check if within constraints
				if(mrAmount + this.dna[i] < this.mins[i]) {
					this.dna[i] = this.mins[i];
				} else if(mrAmount + this.dna[i] > this.maxes[i]) {
					this.dna[i] = this.maxes[i];
				} else {
					this.dna[i] += mrAmount;
				}
			}
		}
	}

	// Update
	update() {
		this.currentHealth -= this.healthRate;
		this.vel.add(this.acc);
		this.vel.limit(this.maxspeed);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}

	// Change this.acc
	applyForce(force) {
		this.acc.add(force);
	}

	// Behaviors function
	// Factors: food, poison
	behaviors(food, poison) {
		let foodSteer = this.eat(food, 0);
		let poisonSteer = this.eat(poison, 1);

		foodSteer.mult(this.dna[0]);
		poisonSteer.mult(this.dna[1]);

		this.applyForce(foodSteer);
		this.applyForce(poisonSteer);
	}

	// Eating function
	// index is 0 for food, 1 for poison
	eat(list, index) {
		let record = Infinity;
		let closestIndex = -1;
		for(let i=0; i<list.length; i++) {
			let d = this.pos.dist(list[i]);
			if(d < record && d < this.dna[index+2]) {
				record = d;
				closestIndex = i;
			}
		}

		if(record < this.maxspeed) {
			list.splice(closestIndex, 1);
			this.currentHealth += this.nutritionalValue[index];
			if(this.currentHealth > this.maxHealth) {
				this.currentHealth = this.maxHealth;
			}
		} else if(closestIndex > -1) {
			return this.seek(list[closestIndex]);
		}

		return createVector(0, 0);
	}

	// Child creation function
	cloneSelf() {
		if (random(1) < this.reproductionRate) {
			let newChild = new Vehicle(this.pos.x, this.pos.y, this.dna);
			newChild.mutate();
			return newChild;
		} else {
			return null;
		}
	}

	// Calculates steering force
	// STEER = DESIRED - VELOCITY;
	seek(target) {
		// Desired
		let desired = p5.Vector.sub(target, this.pos);
		desired.setMag(this.maxspeed);

		// Steering
		let steer = p5.Vector.sub(desired, this.vel);
		steer.limit(this.maxforce);

		return steer;
	}

	// Is the vehicle dead
	dead() {
		return (this.currentHealth < 0);
	}

	// Display
	display() {
		let theta = this.vel.heading() + PI/2;
		push();
			translate(this.pos.x, this.pos.y);
			rotate(theta);

			// Visualize dna info
			if(debug.checked()) {
				noFill();
				stroke(0,255,0);
				strokeWeight(2);
				line(0, 0, 0, -this.dna[0]*20);
				ellipse(0, 0, this.dna[2]*2, this.dna[2]*2);
				stroke(255,0,0);
				line(0, 0, 0, -this.dna[1]*20);
				ellipse(0, 0, this.dna[3]*2, this.dna[3]*2);
			}

			// Draw triangle in direction of velocity

			// Color based on health
			let g = color(0, 255, 0);
			let r = color(255, 0, 0);
			let health = map(this.currentHealth, 0, this.maxHealth, 0, 1);
			var col = lerpColor(r, g, health);
			fill(col);
			noStroke();
			strokeWeight(1);
			beginShape();
				vertex(0, -this.r*2);
				vertex(-this.r, this.r*2);
				vertex(this.r, this.r*2);
			endShape(CLOSE);

		pop();
	}

	// Boundaries
	boundaries() {
		let d = 25;
		let desired = null;

		if(this.pos.x < d) {
			desired = createVector(this.maxspeed, this.vel.y);
		} else if(this.pos.x > width-d) {
			desired = createVector(-this.maxspeed, this.vel.y);
		}

		if(this.pos.y < d) {
			desired = createVector(this.vel.x, this.maxspeed);
		} else if(this.pos.y > height-d) {
			desired = createVector(this.vel.x, -this.maxspeed);
		}

		if(desired !== null) {
			desired.normalize();
			desired.mult(this.maxspeed);
			let steer = p5.Vector.sub(desired, this.vel);
			steer.limit(this.maxforce);
			this.applyForce(steer);
		}
	}
}