var aircraft = {
	type: "aircraft",
	list: {
		orca: {
			name: "orca",
			label: "Orca Assault Craft",
			speed: 40,
			turnSpeed: 8,
			armor: 3,
			primaryWeapon: "rocket",
			cost: 1200,
			sight: 0,
			maxAmmunition: 6,
			ammunition: 6,
			dependency: ["helipad"],
			constructedIn: ["helipad"],
			owner: "gdi",
			hitPoints: 125,
			directions: 32,
			deathAnimation: "frag1",
			spriteImages: [{name: "stand", count: 32}, {name: "attack", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -18,
			selectOffsetX: -7,
			selectOffsetY: -16,
			pixelHeight: 25,
			pixelWidth: 36,
			firesTwice: true,
			softCollisionRadius: 8,
			hardCollisionRadius: 5
		},
		c17: {
			name: "orca",
			label: "Orca Assault Craft",
			speed: 40,
			turnSpeed: 5,
			armor: 2,
			cannotTurnSharp: true,
			primaryWeapon: "napalm",
			cost: 800,
			sight: 0,
			salvos: 2,
			z: 1,
			maxAmmunition: 5,
			ammunition: 5,
			owner: "both",
			hitPoints: 25,
			directions: 32,
			deathAnimation: "frag1",
			spriteImages: [{name: "stand", count: 32}],
			action: "stand",
			pixelOffsetX: -24,
			pixelOffsetY: -24,
			selectOffsetX: -7,
			selectOffsetY: -16,
			pixelHeight: 48,
			pixelWidth: 48,
			firesTwice: false,
			softCollisionRadius: 7,
			hardCollisionRadius: 10,
			processOrders: function() {
				this.lifeCode = getLifeCode(this);
				if (this.lifeCode == "dead") {
					game.remove(this);
					game.add({type: "effects", name: this.deathAnimation, x: this.x, y: this.y - this.z});
					sounds.play("xplosml2");
					game.kills[this.attackedBy]++;
					game.deaths[this.player]++;
					return
				}
				this.sight = this.z == 0 ? 1 : 0;
				this.lastMovementX = 0;
				this.lastMovementY = 0;
				if (this.weapon && this.weapon.cooldown > 0) {
					this.weapon.cooldown--
				}
				switch (this.orders.type) {
					case"bomb":
						this.moveTo(this.orders.to);
						if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < 3) {
							if (this.ammunition > 0 && this.weapon.cooldown <= 0) {
								this.ammunition--;
								this.weapon.fire(this)
							} else if (this.ammunition === 0 && this.salvos === 0) {
								this.orders = {type: "exit", to: this.orders.from}
							}
						} else {
							this.moveTo(this.orders.to)
						}
						break;
					case"exit":
						if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < .2) {
							game.remove(this)
						} else {
							this.moveTo(this.orders.to)
						}
						break
				}
			}
		},
		apache: {
			name: "apache",
			label: "Apache Attack Helicopter",
			speed: 40,
			turnSpeed: 4,
			armor: 3,
			primaryWeapon: "chaingun",
			cost: 1200,
			sight: 0,
			maxAmmunition: 6,
			ammunition: 6,
			dependency: ["helipad"],
			constructedIn: ["helipad"],
			owner: "nod",
			hitPoints: 125,
			directions: 32,
			deathAnimation: "frag1",
			spriteImages: [{name: "stand", count: 32}],
			pixelOffsetX: -23,
			pixelOffsetY: -20,
			selectOffsetX: -13,
			selectOffsetY: -16,
			pixelHeight: 29,
			pixelWidth: 46,
			softCollisionRadius: 8,
			hardCollisionRadius: 5
		},
		chinook: {
			name: "chinook",
			label: "Chinook Assault Craft",
			speed: 30,
			turnSpeed: 5,
			armor: 2,
			cost: 1500,
			sight: 0,
			maxCargo: 5,
			z: 1,
			dependency: ["helipad"],
			constructedIn: ["helipad"],
			owner: "both",
			hitPoints: 90,
			directions: 32,
			deathAnimation: "frag1",
			spriteImages: [{name: "stand", count: 32}, {name: "load", count: 4}],
			pixelOffsetX: -24,
			pixelOffsetY: -24,
			selectOffsetX: -12,
			selectOffsetY: -12,
			pixelHeight: 48,
			pixelWidth: 48,
			softCollisionRadius: 10,
			hardCollisionRadius: 8,
			animate: function() {
				this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
				if (this.action == "load") {
					this.imageList = this.spriteArray["load"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					if (this.animationIndex < this.imageList.count - 1) {
						this.animationIndex++
					}
				} else if (this.action == "close") {
					this.imageList = this.spriteArray["load"];
					this.imageOffset = this.imageList.offset + this.imageList.count - 1 - this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.action = "move";
						this.animationIndex = 0
					}
				} else {
					this.imageList = this.spriteArray["stand"];
					this.imageOffset = this.imageList.offset + Math.floor(this.direction)
				}
			}
		}
	},
	defaults: {
		action: "stand",
		z: 0,
		orders: {type: "stand"},
		direction: 32,
		animationIndex: 0,
		selected: false,
		path: undefined,
		lastMovementX: 0,
		lastMovementY: 0,
		spriteSheet: undefined,
		findEnemyInRange: findEnemyInRange,
		checkCollision: checkCollision,
		moveTo: function (goal) {
			if (this.helipad) {
				if (this.helipad.docked == this) {
					this.helipad.docked = undefined
				}
				this.helipad = undefined
			}
			this.lastMovementX = 0;
			this.lastMovementY = 0;
			var destination = {x: goal.x, y: goal.y, type: goal.type};
			if (destination.type == "buildings") {
				destination.y = goal.cgY;
				destination.x = goal.cgX
			}
			if (this.z < 1) {
				this.z += 1 / 16
			}
			var newDirection = findAngle(destination, this, this.directions);
			var turnAmount = Math.abs(angleDiff(this.direction, newDirection, this.directions));
			if (turnAmount >= 1 && !(this.firing && this.name == "c17")) {
				this.turnTo(newDirection)
			}
			var movement, angleRadians;
			this.colliding = false;
			if (this.z >= 1 && (this.cannotTurnSharp || Math.abs(angleDiff(newDirection, this.direction, this.directions)) < this.directions / 4)) {
				var distance = Math.sqrt(Math.pow(destination.x - this.x, 2) + Math.pow(destination.y - this.y, 2));
				movement = this.speed / game.gridSize / game.speedAdjustmentFactor;
				if (distance < movement) {
					distance = movement
				}
				angleRadians = this.direction / this.directions * 2 * Math.PI;
				this.lastMovementX = -roundFloating(movement * Math.sin(angleRadians));
				this.lastMovementY = -roundFloating(movement * Math.cos(angleRadians));
				this.x = this.x + this.lastMovementX;
				this.y = this.y + this.lastMovementY
			}
			return true
		},
		processOrders: function() {
			this.lifeCode = getLifeCode(this);
			if (this.lifeCode == "dead") {
				game.remove(this);
				game.add({type: "effects", name: this.deathAnimation, x: this.x, y: this.y - this.z});
				sounds.play("xplosml2");
				game.kills[this.attackedBy]++;
				return
			}
			this.sight = this.z == 0 ? 1 : 0;
			var enemy;
			this.lastMovementX = 0;
			this.lastMovementY = 0;
			this.firing = false;
			if (this.weapon && this.weapon.cooldown > 0) {
				this.weapon.cooldown--
			}
			switch (this.orders.type) {
				case"stand":
					if (this.z == 0) {
						break
					}
					if (!isEmptySpot(this)) {
						this.orders = {
							type: "move",
							to: findClosestEmptySpot({x: Math.floor(this.x) + .5, y: Math.floor(this.y) + .5})
						};
						break
					}
					if (this.name == "chinook" && this.direction != 0) {
						this.turnTo(0);
						break
					}
					if (this.z > 0) {
						this.z -= 1 / 16
					}
					break;
				case"load":
					if (this.z > 0) {
						this.orders.type = "stand";
						break
					}
					if (this.cargo.length == this.maxCargo) {
						this.orders.type == "stand";
						this.action = "close";
						break
					}
					if (this.action != "load") {
						this.action = "load";
						this.animationIndex = 0
					}
					this.orders.type = "stand";
					break;
				case"finish-load":
					if (this.orders.counter == undefined) {
						this.orders.counter = 50
					}
					if (this.orders.counter) {
						this.orders.counter--
					} else {
						this.action = "close";
						this.animationIndex = 0;
						this.orders.type = "stand"
					}
					break;
				case"unload":
					if (this.cargo.length === 0) {
						this.orders.type = "stand";
						break
					}
					if (this.action !== "load") {
						this.action = "load";
						this.animationIndex = 0
					} else {
						if (this.animationIndex == this.imageList.count - 1) {
							var emptySpot = findClosestEmptySpot(this);
							var x = emptySpot.x - .5;
							var y = emptySpot.y;
							var toggle = false;
							while (this.cargo.length) {
								var soldier = this.cargo.pop();
								soldier.x = x;
								soldier.y = y + (toggle ? .25 : 0);
								toggle = !toggle;
								x = x + .25;
								game.add(soldier)
							}
							this.orders = {type: "finish-load"}
						}
					}
					break;
				case"hunt":
				case"guard":
					enemy = this.findEnemyInRange();
					if (this.primaryWeapon && enemy) {
						this.orders = {type: "attack", to: enemy, lastOrder: this.orders}
					}
					break;
				case"patrol":
					if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < .2) {
						this.orders = {type: "patrol", from: this.orders.to, to: this.orders.from}
					} else {
						this.moveTo(this.orders.to)
					}
					enemy = this.findEnemyInRange();
					break;
				case"move":
					this.action = "stand";
					if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < .2) {
						this.orders = {type: "stand"}
					} else {
						this.moveTo(this.orders.to)
					}
					break;
				case"return":
					this.action = "stand";
					if (!this.orders.helipad) {
						this.orders.helipad = this.findHelipadInRange(false) || this.findHelipadInRange(true);
						if (!this.orders.helipad) {
							this.orders = {type: "stand"};
							break
						}
					}
					if (Math.pow(this.orders.helipad.cgX - this.x, 2) + Math.pow(this.orders.helipad.cgY - this.y, 2) < .1) {
						this.helipad = this.orders.helipad;
						this.x = this.orders.helipad.cgX;
						this.y = this.orders.helipad.cgY;
						this.orders = {type: "dock"}
					} else {
						if (Math.sqrt(Math.pow(this.orders.helipad.cgX - this.x, 2) + Math.pow(this.orders.helipad.cgY - this.y, 2)) < 3) {
							if (!this.orders.helipad.docked) {
								this.orders.helipad.docked = this
							}
							if (this.orders.helipad.docked != this) {
								this.orders.helipad = this.findHelipadInRange(false);
								if (!this.orders.helipad) {
									this.orders = {type: "stand"};
									break
								}
							}
						}
						this.moveTo(this.orders.helipad)
					}
					break;
				case"dock":
					this.action = "stand";
					if (this.z > 0) {
						this.z -= 1 / 16
					}
					break;
				case"attack":
					if (!this.orders.to || !this.canAttackEnemy(this.orders.to) || !this.ammunition) {
						this.orders = {type: "return"};
						return
					}
					this.action = "stand";
					if (this.z < 1) {
						this.z += 1 / 16;
						return
					}
					if (Math.pow(this.orders.to.cgX - this.x, 2) + Math.pow(this.orders.to.cgY - this.y, 2) < Math.pow(this.weapon.range - 1, 2)) {
						this.action = "attack";
						var newDirection = findAngle(this.orders.to, this, this.directions);
						var turnAmount = Math.abs(angleDiff(this.direction, newDirection, this.directions));
						if (turnAmount > 2) {
							this.turnTo(newDirection)
						} else {
							if (this.weapon.cooldown <= 0 && this.ammunition) {
								this.weapon.fire(this, this.direction, this.orders.to);
								this.ammunition--
							}
						}
					} else {
						this.moveTo(this.orders.to)
					}
					break
			}
			this.cgX = this.x;
			this.cgY = this.y
		},
		findHelipadInRange: function (docked) {
			var lastDistance;
			var lastItem;
			if (!docked) {
				for (var i = 0; i < game.buildings.length; i++) {
					var item = game.buildings[i];
					if (item.name == "helipad" && item.player == this.player && !item.docked) {
						var distance = Math.pow(item.cgX - this.x, 2) + Math.pow(item.y - this.y, 2);
						if (!lastItem || lastDistance > distance) {
							lastDistance = distance;
							lastItem = item
						}
					}
				}
			} else {
				for (var i = 0; i < game.buildings.length; i++) {
					var item = game.buildings[i];
					if (item.name == "helipad" && item.player == this.player) {
						var distance = Math.pow(item.cgX - this.x, 2) + Math.pow(item.y - this.y, 2);
						if (!lastItem || lastDistance > distance) {
							lastDistance = distance;
							lastItem = item
						}
					}
				}
			}
			return lastItem
		},
		canAttackEnemy: canAttackEnemy,
		drawSelection: function() {
			var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft + this.selectOffsetX;
			var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop + this.selectOffsetY;
			game.foregroundContext.drawImage(this.selectImage, x, y);
			var selectBarHeight = 4;
			var selectBarWidth = this.selectImage.width;
			game.foregroundContext.beginPath();
			game.foregroundContext.rect(x, y - selectBarHeight - 3, selectBarWidth * this.life / this.hitPoints, selectBarHeight);
			if (this.lifeCode == "healthy") {
				game.foregroundContext.fillStyle = "lightgreen"
			} else if (this.lifeCode == "damaged") {
				game.foregroundContext.fillStyle = "yellow"
			} else {
				game.foregroundContext.fillStyle = "red"
			}
			game.foregroundContext.fill();
			game.foregroundContext.beginPath();
			game.foregroundContext.strokeStyle = "black";
			game.foregroundContext.rect(x, y - selectBarHeight - 3, selectBarWidth, selectBarHeight);
			game.foregroundContext.stroke();
			if (this.name == "orca") {
				game.foregroundContext.beginPath();
				game.foregroundContext.fillStyle = "lightyellow";
				game.foregroundContext.strokeStyle = "black";
				for (var i = 0; i < this.maxAmmunition; i++) {
					game.foregroundContext.rect(x + 3 + i * 3.5, y + 18, 3, 3);
					if (i < this.ammunition) {
						game.foregroundContext.fill()
					}
					game.foregroundContext.stroke()
				}
			} else if (this.name == "chinook") {
				game.foregroundContext.beginPath();
				game.foregroundContext.fillStyle = "red";
				game.foregroundContext.strokeStyle = "black";
				for (var i = 0; i < this.maxCargo; i++) {
					game.foregroundContext.rect(x + 2 + i * 4, y + 18, 4, 4);
					if (i < this.cargo.length) {
						game.foregroundContext.fill()
					}
					game.foregroundContext.stroke()
				}
			}
			if (game.debugMode) {
				game.foregroundContext.fillText(this.orders.type, x + 9, y)
			}
		},
		draw: function() {
			this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
			this.interpolatedY = this.y - this.z + game.movementInterpolationFactor * this.lastMovementY;
			var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth + this.pixelOffsetX || y < -this.pixelHeight + this.pixelOffsetY || x > game.viewportWidth + this.pixelWidth - this.pixelOffsetX || y > game.viewportHeight + this.pixelHeight - this.pixelOffsetY) {
				return
			}
			game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x + this.pixelOffsetX, y + this.pixelOffsetY, this.pixelWidth, this.pixelHeight);
			if (this.selected) {
				this.drawSelection()
			}
		},
		animate: function() {
			this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
			this.imageList = this.spriteArray[this.name == "orca" ? this.action : "stand"];
			this.imageOffset = this.imageList.offset + Math.floor(this.direction)
		},
		turnTo: function (toDirection) {
			if (toDirection > this.direction && toDirection - this.direction < this.directions / 2 || toDirection < this.direction && this.direction - toDirection > this.directions / 2) {
				this.direction = this.direction + this.turnSpeed / 10
			} else {
				this.direction = this.direction - this.turnSpeed / 10
			}
			if (this.direction > this.directions - 1) {
				this.direction -= this.directions - 1
			} else if (this.direction < 0) {
				this.direction += this.directions - 1
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		if (name == "chinook") {
			item.cargo = []
		}
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		$.extend(item, details);
		item.weapon = weapons.add({name: item.primaryWeapon});
		if (item.percentLife) {
			item.life = item.hitPoints * item.percentLife;
			delete item.percentLife
		} else {
			item.life = item.hitPoints
		}
		return item
	},
	load: function (name) {
		var item = this.list[name];
		console.log("Loading", name, "...");
		item.spriteCanvas = document.createElement("canvas");
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function (image) {
			createSpriteSheetCanvas(image, item.spriteCanvas, name == "harvester" || name == "mcv" ? "colormap" : "grayscale")
		});
		item.spriteArray = [];
		item.spriteCount = 0;
		item.selectImage = loader.loadImage("images/" + "sidebar/select-1-1.png");
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var buildings = {
	type: "buildings",
	list: {
		helipad: {
			z: -1,
			name: "helipad",
			label: "Helipad",
			cost: 1500,
			powerOut: 10,
			powerIn: 0,
			sight: 3,
			hasBib: true,
			hitPoints: 800,
			armor: 1,
			dependency: ["construction-yard", "power-plant|advanced-power-plant", "barracks|hand-of-nod"],
			owner: "both",
			spriteImages: [{name: "healthy-reload-ammo", count: 7}, {
				name: "damaged-reload-ammo",
				count: 7
			}, {name: "ultra-damaged", count: 1}, {name: "build", count: 20}, {
				name: "healthy",
				count: 1,
				spriteCount: 0
			}, {name: "damaged", count: 1, spriteCount: 7}],
			gridShape: [[1, 1], [1, 1]],
			pixelWidth: 48,
			pixelHeight: 48,
			gridBuild: [[1, 1], [1, 1], [1, 1]],
			orders: {type: "auto-load"}
		},
		"power-plant": {
			name: "power-plant",
			label: "Power Plant",
			cost: 300,
			powerOut: 100,
			powerIn: 0,
			sight: 2,
			hasBib: true,
			hitPoints: 400,
			armor: 1,
			dependency: ["construction-yard"],
			owner: "both",
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 4}, {
				name: "healthy",
				count: 4
			}, {name: "ultra-damaged", count: 1}],
			gridShape: [[1, 0], [1, 1]],
			pixelWidth: 48,
			pixelHeight: 48,
			gridBuild: [[1, 0], [1, 1], [1, 1]]
		},
		"advanced-power-plant": {
			name: "advanced-power-plant",
			label: "Advanced Power Plant",
			cost: 700,
			powerOut: 200,
			powerIn: 0,
			sight: 2,
			hasBib: true,
			hitPoints: 600,
			armor: 1,
			dependency: ["construction-yard", "power-plant|advanced-power-plant"],
			owner: "both",
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 4}, {
				name: "healthy",
				count: 4
			}, {name: "ultra-damaged", count: 1}],
			gridShape: [[1, 0], [1, 1]],
			pixelWidth: 48,
			pixelHeight: 48,
			gridBuild: [[1, 0], [1, 1], [1, 1]]
		},
		"construction-yard": {
			name: "construction-yard",
			label: "Construction Yard",
			powerIn: 15,
			powerOut: 30,
			cost: 5e3,
			sight: 3,
			hitPoints: 800,
			dependency: undefined,
			hasBib: true,
			armor: 1,
			owner: "both",
			spriteImages: [{name: "build", count: 32}, {name: "damaged", count: 4}, {
				name: "damaged-construct",
				count: 20
			}, {name: "healthy", count: 4}, {name: "healthy-construct", count: 20}, {name: "ultra-damaged", count: 1}],
			gridShape: [[1, 1, 1], [1, 1, 1]],
			pixelWidth: 72,
			pixelHeight: 48,
			gridBuild: [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
		},
		barracks: {
			name: "barracks",
			label: "Barracks",
			powerIn: 20,
			cost: 300,
			sight: 3,
			hasBib: true,
			hitPoints: 800,
			armor: 1,
			dependency: ["construction-yard", "power-plant|advanced-power-plant"],
			owner: "gdi",
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 10}, {
				name: "healthy",
				count: 10
			}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[1, 1], [0, 0]],
			gridBuild: [[1, 1], [1, 1], [1, 1]]
		},
		"repair-facility": {
			name: "repair-facility",
			label: "Repair Facility",
			powerIn: 30,
			cost: 1200,
			sight: 3,
			hasBib: true,
			z: -1,
			armor: 1,
			tiberiumStorage: 1500,
			orders: {type: "auto-repair"},
			hitPoints: 800,
			dependency: ["construction-yard", "power-plant|advanced-power-plant"],
			owner: "both",
			spriteImages: [{name: "build", count: 20}, {name: "repair-healthy", count: 7}, {
				name: "repair-damaged",
				count: 7
			}, {name: "healthy", count: 1, spriteCount: 20}, {
				name: "damaged",
				count: 1,
				spriteCount: 27
			}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 72,
			pixelHeight: 72,
			gridShape: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
			gridBuild: [[0, 1, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]]
		},
		"communications-center": {
			name: "communications-center",
			label: "Communications Center",
			powerIn: 40,
			cost: 1e3,
			sight: 3,
			hasBib: true,
			hitPoints: 1e3,
			armor: 1,
			dependency: ["construction-yard", "power-plant|advanced-power-plant", "refinery"],
			owner: "both",
			spriteImages: [{name: "healthy", count: 16}, {name: "damaged", count: 16}, {
				name: "ultra-damaged",
				count: 1
			}, {name: "build", count: 20}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[1, 1], [1, 1]],
			gridBuild: [[1, 1], [1, 1], [1, 1]]
		},
		"advanced-communications-tower": {
			name: "advanced-communications-tower",
			label: "Advanced Communications Tower",
			powerIn: 200,
			cost: 2800,
			sight: 10,
			hasBib: true,
			hitPoints: 1e3,
			armor: 1,
			dependency: ["construction-yard", "power-plant|advanced-power-plant", "refinery", "communications-center"],
			owner: "gdi",
			spriteImages: [{name: "healthy", count: 16}, {name: "damaged", count: 16}, {
				name: "ultra-damaged",
				count: 1
			}, {name: "build", count: 20}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[1, 1], [1, 1]],
			gridBuild: [[1, 1], [1, 1], [1, 1]]
		},
		"temple-of-nod": {
			name: "temple-of-nod",
			label: "Temple of Nod",
			powerIn: 200,
			cost: 2800,
			sight: 10,
			hasBib: true,
			hitPoints: 1e3,
			armor: 2,
			dependency: ["construction-yard", "power-plant|advanced-power-plant", "refinery", "communications-center"],
			owner: "nod",
			spriteImages: [{name: "healthy-launch", count: 5}, {
				name: "damaged-launch",
				count: 5
			}, {name: "ultra-damaged", count: 1}, {name: "build", count: 36}, {
				name: "healthy",
				count: 1,
				spriteCount: 0
			}, {name: "damaged", count: 1, spriteCount: 5}],
			pixelWidth: 72,
			pixelHeight: 72,
			gridShape: [[0, 0, 0], [1, 1, 1], [1, 1, 1]],
			gridBuild: [[0, 0, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]]
		},
		"tiberium-silo": {
			name: "tiberium-silo",
			label: "Tiberium Silo",
			powerIn: 10,
			cost: 150,
			sight: 2,
			hasBib: true,
			tiberiumStorage: 1500,
			armor: 1,
			hitPoints: 150,
			dependency: ["construction-yard", "refinery"],
			owner: "both",
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 5}, {
				name: "healthy",
				count: 5
			}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 24,
			gridShape: [[1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		refinery: {
			name: "refinery",
			label: "Tiberium Refinery",
			powerIn: 40,
			powerOut: 10,
			cost: 2e3,
			sight: 3,
			hasBib: true,
			tiberiumStorage: 1e3,
			armor: 1,
			hitPoints: 800,
			dependency: ["construction-yard", "power-plant|advanced-power-plant"],
			owner: "both",
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 12}, {
				name: "damaged-docking",
				count: 7
			}, {name: "damaged-loading", count: 5}, {name: "damaged-undocking", count: 6}, {
				name: "healthy",
				count: 12
			}, {name: "healthy-docking", count: 7}, {name: "healthy-loading", count: 5}, {
				name: "healthy-undocking",
				count: 6
			}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 72,
			pixelHeight: 72,
			z: -.5,
			gridShape: [[0, 1, 0], [1, 1, 1]],
			gridBuild: [[0, 1, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]]
		},
		"hand-of-nod": {
			name: "hand-of-nod",
			label: "Hand of Nod",
			powerIn: 20,
			cost: 300,
			sight: 3,
			hasBib: true,
			hitPoints: 800,
			armor: 1,
			dependency: ["construction-yard", "power-plant|advanced-power-plant"],
			owner: "nod",
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 1}, {
				name: "healthy",
				count: 1
			}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 72,
			gridShape: [[0, 0], [1, 1], [0, 1]],
			gridBuild: [[0, 0], [1, 1], [1, 1], [1, 1]]
		},
		"civilian-building-01": {
			name: "civilian-building-01",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 5,
			cost: 0,
			sight: 1,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-02": {
			name: "civilian-building-02",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 5,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-03": {
			name: "civilian-building-03",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 5,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 1], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-04": {
			name: "civilian-building-04",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 5,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-05": {
			name: "civilian-building-05",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 5,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 24,
			gridShape: [[1, 1]],
			gridBuild: [[1, 1]]
		},
		"civilian-building-06": {
			name: "civilian-building-06",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 24,
			gridShape: [[1, 1]],
			gridBuild: [[1, 1]]
		},
		"civilian-building-07": {
			name: "civilian-building-07",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 24,
			gridShape: [[1, 1]],
			gridBuild: [[1, 1]]
		},
		"civilian-building-08": {
			name: "civilian-building-08",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 24,
			pixelHeight: 24,
			gridShape: [[1]],
			gridBuild: [[1]]
		},
		"civilian-building-09": {
			name: "civilian-building-09",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 24,
			pixelHeight: 24,
			gridShape: [[1]],
			gridBuild: [[1]]
		},
		"civilian-building-10": {
			name: "civilian-building-10",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 24,
			pixelHeight: 24,
			gridShape: [[1]],
			gridBuild: [[1]]
		},
		"civilian-building-11": {
			name: "civilian-building-11",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 24,
			pixelHeight: 24,
			gridShape: [[1]],
			gridBuild: [[1]]
		},
		"civilian-building-20": {
			name: "civilian-building-20",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 3}, {name: "damaged", count: 3}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-21": {
			name: "civilian-building-21",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 3}, {name: "damaged", count: 3}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-22": {
			name: "civilian-building-22",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 3}, {name: "damaged", count: 3}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-23": {
			name: "civilian-building-23",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-24": {
			name: "civilian-building-24",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-25": {
			name: "civilian-building-25",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 5,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-26": {
			name: "civilian-building-26",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 24,
			gridShape: [[1, 1]],
			gridBuild: [[1, 1]]
		},
		"civilian-building-27": {
			name: "civilian-building-27",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 3}, {name: "damaged", count: 3}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"civilian-building-30": {
			name: "civilian-building-30",
			label: "Civilian Building",
			powerIn: 0,
			powerOut: 20,
			cost: 0,
			sight: 2,
			hitPoints: 200,
			dependency: undefined,
			owner: "none",
			action: "stand",
			hasBib: false,
			spriteImages: [{name: "healthy", count: 3}, {name: "damaged", count: 3}, {name: "ultra-damaged", count: 1}],
			pixelWidth: 48,
			pixelHeight: 48,
			gridShape: [[0, 0], [1, 1]],
			gridBuild: [[1, 1], [1, 1]]
		},
		"weapons-factory": {
			name: "weapons-factory",
			label: "Weapons Factory",
			powerIn: 30,
			powerOut: 0,
			cost: 2e3,
			sight: 3,
			owner: "gdi",
			dependency: ["construction-yard", "power-plant|advanced-power-plant", "refinery"],
			armor: 2,
			hitPoints: 200,
			hasBib: true,
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 1}, {
				name: "damaged-base",
				count: 1
			}, {name: "damaged-construct", count: 9}, {name: "healthy", count: 1}, {
				name: "healthy-base",
				count: 1
			}, {name: "healthy-construct", count: 9}, {name: "ultra-damaged", count: 0}, {
				name: "ultra-damaged-base",
				count: 1
			}],
			pixelWidth: 72,
			pixelHeight: 72,
			gridShape: [[1, 1, 1], [1, 1, 1]],
			gridBuild: [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
		},
		airstrip: {
			name: "airstrip",
			label: "Air Strip",
			powerIn: 30,
			powerOut: 0,
			cost: 2e3,
			sight: 5,
			owner: "nod",
			dependency: ["construction-yard", "power-plant|advanced-power-plant", "refinery"],
			armor: 3,
			hitPoints: 500,
			hasBib: true,
			spriteImages: [{name: "healthy", count: 16}, {name: "damaged", count: 16}, {
				name: "ultra-damaged",
				count: 1
			}, {name: "build", count: 14}],
			pixelWidth: 96,
			pixelHeight: 48,
			gridShape: [[1, 1, 1, 1], [1, 1, 1, 1]],
			gridBuild: [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]
		}
	},
	defaults: {
		action: "stand",
		type: "buildings",
		armor: 1,
		z: 0,
		powerOut: 0,
		powerIn: 0,
		orders: {type: "stand"},
		animationIndex: 0,
		selected: false,
		processOrders: function() {
			if (this.timeBomb) {
				this.timeBomb--;
				if (this.timeBomb == 0) {
					this.life = 0
				}
			}
			this.lifeCode = getLifeCode(this);
			if (this.lifeCode == "dead") {
				if (!this.exploding) {
					this.exploding = true;
					var removeItem = this;
					game.remove(removeItem);
					game.add({type: "effects", name: "fball1", x: this.cgX, y: this.cgY, background: this});
					sounds.play("crumble");
					if (this.attackedBy) {
						game.kills[this.attackedBy]++;
						game.deaths[this.player]++
					}
				}
				return
			}
			if (this.action == "build" || this.action == "sell") {
				return
			}
			switch (this.orders.type) {
				case"auto-load":
					if (this.action == "build" || this.action == "sell") {
						return
					}
					if (!this.docked || this.lifeCode == "ultra-damaged") {
						this.action = "stand"
					} else if (this.docked && this.docked.ammunition == this.docked.maxAmmunition) {
						this.action = "stand"
					} else if (this.docked && this.action != "reload-ammo" && this.action != "build" && this.action != "sell" && this.docked.z == 0) {
						this.action = "reload-ammo";
						this.animationIndex = 0
					}
					break;
				case"auto-repair":
					if (this.lifeCode == "ultra-damaged" || this.lifeCode == "dead") {
						return
					}
					this.orders.repairTargets = [];
					for (var i = game.vehicles.length - 1; i >= 0; i--) {
						var vehicle = game.vehicles[i];
						if (vehicle.team == this.team && vehicle.player == this.player && vehicle.life < vehicle.hitPoints && vehicle.lifeCode !== "dead" && vehicle.x >= this.x + .5 && vehicle.y >= this.y + .5 && vehicle.x <= this.x + 2.5 && vehicle.y <= this.y + 2.5) {
							this.orders.repairTargets.push(vehicle)
						}
					}
					if (this.orders.repairTargets.length > 0) {
						this.action = "repair-vehicle";
						for (var i = this.orders.repairTargets.length - 1; i >= 0; i--) {
							var item = this.orders.repairTargets[i];
							var cashSpent = .5;
							if (game.cash[this.player] > cashSpent) {
								game.cash[this.player] -= cashSpent;
								item.life += cashSpent * 2 * item.hitPoints / item.cost;
								if (item.life > item.hitPoints) {
									item.life = item.hitPoints
								}
							}
						}
					} else {
						this.action = "stand"
					}
					break;
				case"sell":
					if (this.animationIndex === 0) {
						sounds.play("sell")
					}
					this.repairing = false;
					this.action = "sell";
					break;
				case"repair":
					this.orders = {type: "stand"};
					this.repairing = true;
					sounds.play("button");
					break;
				case"stop-repair":
					this.orders = {type: "stand"};
					this.repairing = false;
					sounds.play("button");
					break;
				case"harvest":
					if (this.action == "stand") {
						this.animationIndex = 0;
						this.action = "docking"
					}
					break
			}
		},
		drawSelection: function() {
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
			game.foregroundContext.drawImage(this.selectImage, x, y);
			var selectBarHeight = 4;
			game.foregroundContext.beginPath();
			game.foregroundContext.rect(x, y - selectBarHeight - 3, this.pixelWidth * this.life / this.hitPoints, selectBarHeight);
			if (this.lifeCode == "healthy") {
				game.foregroundContext.fillStyle = "lightgreen"
			} else if (this.lifeCode == "damaged") {
				game.foregroundContext.fillStyle = "yellow"
			} else {
				game.foregroundContext.fillStyle = "red"
			}
			game.foregroundContext.fill();
			game.foregroundContext.beginPath();
			game.foregroundContext.strokeStyle = "black";
			game.foregroundContext.rect(x, y - selectBarHeight - 3, this.pixelWidth, selectBarHeight);
			game.foregroundContext.stroke()
		},
		draw: function() {
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth || y < -this.pixelHeight - (this.hasBib ? 24 : 0) || x > game.viewportWidth || y > game.viewportHeight) {
				return
			}
			if (this.hasBib) {
				game.foregroundContext.drawImage(this.bibSpriteSheet, this.bibOffsetX, this.bibOffsetY, this.pixelWidth, 48, x, y + this.pixelHeight - 24, this.pixelWidth, 48)
			}
			if (this.baseImage && this.action != "build" && this.action != "sell") {
				game.foregroundContext.drawImage(this.spriteCanvas, this.baseImage.offset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
			}
			game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);
			if (this.selected) {
				this.drawSelection()
			}
			if (this.repairing) {
				game.foregroundContext.globalAlpha = sidebar.textBrightness;
				game.foregroundContext.drawImage(sidebar.repairImageBig, x + (this.pixelWidth - sidebar.repairImageBig.width) / 2, y + (this.pixelHeight - sidebar.repairImageBig.height) / 2);
				game.foregroundContext.globalAlpha = 1
			}
		},
		releaseHarvester: function() {
			this.action = "stand";
			this.animationIndex = 0;
			this.orders.harvester.orders.type = "harvest";
			this.orders.harvester.player = this.player;
			this.orders.harvester.team = this.team;
			this.orders.harvester.percentLife = this.orders.harvester.life / this.orders.harvester.hitPoints;
			game.add(this.orders.harvester);
			if (this.nextHarvester) {
				this.nextHarvester = undefined
			}
			this.orders = {type: "stand"}
		},
		animate: function() {
			if (this.lifeCode == "dead") {
				this.imageList = this.spriteArray["ultra-damaged"];
				this.imageOffset = this.imageList.offset;
				return
			}
			this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
			if (this.nextHarvester && this.orders.harvester != this.nextHarvester && this.nextHarvester.lifeCode == "dead") {
				this.nextHarvester = undefined;
			}
			this.baseImage = this.spriteArray[this.lifeCode + "-base"];
			switch (this.action) {
				case "stand":
					if (this.name == "tiberium-silo") {
						this.imageList = this.spriteArray[this.lifeCode];
						this.imageOffset = this.imageList.offset + 0;
					} else {
						this.imageList = this.spriteArray[this.lifeCode];
						this.imageOffset = this.imageList.offset + this.animationIndex;
						this.animationIndex++;
						if (this.animationIndex >= this.imageList.count) {
							this.animationIndex = 0;
						}
					}
					break;
				case "repair-vehicle":
					this.imageList = this.spriteArray["repair-" + this.lifeCode];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
					}
					break;
				case "reload-ammo":
					this.imageList = this.spriteArray[this.lifeCode + "-reload-ammo"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.docked.ammunition++;
						if (this.docked.ammunition == this.docked.maxAmmunition) {
							this.action = "stand";
						}
					}
					break;
				case "build":
					this.imageList = this.spriteArray["build"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.action = "stand";
						if (this.name == "refinery") {
							game.add({
								name: "harvester",
								orders: {type: "harvest"},
								type: "vehicles",
								team: this.team,
								player: this.player,
								direction: 14,
								x: this.x + .5,
								y: this.y + 2.5
							})
						} else if (this.name == "helipad") {
							var unitName = this.team == "gdi" ? "orca" : "apache";
							this.docked = game.add({
								name: unitName,
								type: "aircraft",
								player: this.player,
								team: this.team,
								x: this.x + 1,
								y: this.y + 1,
								direction: 24,
								helipad: this,
								orders: {type: "dock"}
							})
						}
					}
					break;
				case "docking":
					if (this.lifeCode == "ultra-damaged" || this.lifeCode == "dead") {
						this.releaseHarvester();
						break;
					}
					this.imageList = this.spriteArray[this.lifeCode + "-docking"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.action = "loading";
					}
					break;
				case "loading":
					if (this.lifeCode == "ultra-damaged") {
						this.releaseHarvester();
						break;
					}
					this.imageList = this.spriteArray[this.lifeCode + "-loading"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.orders.harvester.tiberium--;
						game.cash[this.player] += 50;
						if (this.orders.harvester.tiberium <= 0) {
							this.action = "undocking";
						}
					}
					break;
				case "undocking":
					if (this.lifeCode == "ultra-damaged") {
						this.releaseHarvester();
						break;
					}
					this.imageList = this.spriteArray[this.lifeCode + "-undocking"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.releaseHarvester();
					}
					break;
				case "construct":
					this.imageList = this.spriteArray[this.lifeCode + "-construct"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.action = "stand";
					}
					break;
				case "launch":
					this.imageList = this.spriteArray[this.lifeCode + "-launch"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.action = "stand";
					}
					break;
				case "sell":
					this.imageList = this.spriteArray["build"];
					if (typeof this.imageList != 'undefined') {
						if (typeof this.imageList.offset != 'undefined') {
							this.imageOffset = this.imageList.offset + (this.imageList.count - this.animationIndex - 1);
						}
						this.animationIndex++;
						if (this.animationIndex >= this.imageList.count) {
							this.animationIndex = 0;
							game.remove(this);
							game.cash[this.player] += this.cost / 2;
							this.action = "stand";
						}
					}
					break;
			}
			if (this.repairing) {
				if (this.life >= this.hitPoints) {
					this.repairing = false;
					this.life = this.hitPoints;
				} else {
					var cashSpent = .5;
					if (game.cash[this.player] > cashSpent) {
						game.cash[this.player] -= cashSpent;
						this.life += cashSpent * 2 * this.hitPoints / this.cost;
					}
				}
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		if (details.percentLife) {
			item.life = item.hitPoints * details.percentLife;
			delete item.percentLife
		} else {
			item.life = item.hitPoints
		}
		$.extend(item, details);
		item.cgX = item.x + item.pixelWidth / 2 / game.gridSize;
		item.cgY = item.y + item.gridShape.length / 2;
		item.softCollisionRadius = item.pixelWidth / 2;
		item.hardCollisionRadius = item.pixelWidth / 4;
		return item
	},
	load: function (name) {
		var item = this.list[name];
		console.log("Loading", name, "...");
		item.type = this.type;
		item.spriteCanvas = document.createElement("canvas");
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function (image) {
			createSpriteSheetCanvas(image, item.spriteCanvas, "colormap")
		});
		item.selectImage = loader.loadImage("images/" + "sidebar/select-" + item.pixelWidth / game.gridSize + "-" + item.pixelHeight / game.gridSize + ".png");
		item.spriteArray = [];
		item.spriteCount = 0;
		item.bibSpriteSheet = loader.loadImage("images/" + this.type + "/bib-sprite-sheet.png");
		item.bibOffsetX = item.pixelWidth == 72 ? 48 : item.pixelWidth == 96 ? 119 : 0;
		item.bibOffsetY = maps.currentMapData.theater == "desert" ? 48 : 0;
		item.gridWidth = item.gridShape[0].length;
		item.gridHeight = item.gridShape.length;
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (typeof item.spriteImages[i].spriteCount !== "undefined") {
				item.spriteCount = item.spriteImages[i].spriteCount
			}
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

!function() {
	var lastTime = 0;
	var vendors = ["ms", ";", "webkit", "o"];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
		window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"]
	}
	if (!window.requestAnimationFrame)window.requestAnimationFrame = function (callback, element) {
		var currTime = (new Date).getTime();
		var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		var id = window.setTimeout(function() {
			callback(currTime + timeToCall)
		}, timeToCall);
		lastTime = currTime + timeToCall;
		return id;
	};

	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function (id) {
			clearTimeout(id);
		}
	}
}();

if (!Array.prototype.remove) {
	Array.prototype.remove = function (e) {
		var t, _ref;
		if ((t = this.indexOf(e)) > -1) {
			return [].splice.apply(this, [t, t - t + 1].concat(_ref = [])), _ref
		}
	}
}

var loader = {
	loaded: true, loadedCount: 0, totalCount: 0, init: function() {
		var mp3Support, oggSupport;
		var audio = document.createElement("audio");
		if (audio.canPlayType) {
			mp3Support = "" !== audio.canPlayType("audio/mpeg");
			oggSupport = "" !== audio.canPlayType('audio/ogg; codecs="vorbis"')
		} else {
			mp3Support = false;
			oggSupport = false
		}
		loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
		var webMSupport, h264Support;
		var video = document.createElement("video");
		if (video.canPlayType) {
			h264Support = "" !== (video.canPlayType('video/mp4; codecs="avc1.42E01E"') || video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));
			webMSupport = "" !== video.canPlayType('video/webm; codecs="vp8, vorbis"')
		} else {
			h264Support = false;
			webMSupport = false
		}
		loader.videoFileExtn = webMSupport ? ".webm" : h264Support ? ".mp4" : undefined
	},
	loadImage: function (url, callback) {
		this.totalCount++;
		loader.updateStatus();
		this.loaded = false;
		$("#loadingscreen").show();
		var image = new Image;
		image.src = url;
		image.onload = function (ev) {
			loader.itemLoaded(ev);
			if (callback) {
				callback(image)
			}
		};
		return image
	},
	soundFileExtn: ".ogg", loadSound: function (url) {
		var audio = new Audio;
		if (!loader.soundFileExtn) {
			return audio
		}
		this.totalCount++;
		loader.updateStatus();
		this.loaded = false;
		$("#loadingscreen").show();
		audio.addEventListener("canplaythrough", loader.itemLoaded, false);
		audio.preload = "auto";
		audio.src = url + loader.soundFileExtn;
		audio.load();
		return audio
	},
	loadVideo: function (url) {
		var videoObject = document.createElement("video");
		if (!loader.videoFileExtn) {
			return videoObject;
		}
		this.totalCount++;
		loader.updateStatus();
		this.loaded = false;
		$("#loadingscreen").show();
		videoObject.addEventListener("canplaythrough", loader.itemLoaded, false);
		videoObject.preload = "auto";
		videoObject.src = url + loader.videoFileExtn;
		videoObject.load();
		return videoObject;
	},
	itemLoaded: function (e) {
		e.target.removeEventListener("canplaythrough", loader.itemLoaded, false);
		e.target.removeEventListener("canplay", loader.itemLoaded, false);
		e.target.removeEventListener("loadeddata", loader.itemLoaded, false);
		loader.loadedCount++;
		loader.updateStatus();
		if (loader.loadedCount === loader.totalCount) {
			loader.loaded = true;
			loader.loadedCount = 0;
			loader.totalCount = 0;
			$("#loadingscreen").hide();
			if (loader.onload) {
				loader.onload();
				loader.onload = undefined
			}
		}
	},
	updateStatus: function() {
		$("#loadingmessage").html("Loading " + loader.loadedCount + " of " + loader.totalCount + "...");
		var progress = loader.totalCount ? Math.round(100 * loader.loadedCount / loader.totalCount) : 100;
		$("#progressbar")[0].value = progress
	}
};

var colors = [[0, 0, 0], [193, 0, 173], [0, 175, 171], [0, 182, 0], [16, 16, 16], [252, 255, 50], [255, 49, 77], [186, 79, 0], [191, 0, 0], [0, 255, 255], [93, 0, 255], [30, 0, 175], [0, 0, 0], [85, 85, 85], [170, 170, 170], [255, 255, 255], [255, 216, 133], [255, 207, 143], [255, 208, 134], [255, 207, 129], [255, 208, 115], [255, 191, 108], [255, 192, 83], [252, 174, 75], [252, 175, 51], [247, 148, 10], [232, 117, 0], [217, 90, 0], [201, 60, 0], [183, 40, 0], [171, 12, 0], [153, 0, 0], [0, 200, 225], [55, 164, 205], [75, 139, 185], [87, 112, 168], [75, 139, 185], [55, 164, 205], [30, 182, 225], [255, 255, 255], [255, 255, 255], [0, 189, 0], [127, 0, 0], [127, 0, 0], [109, 0, 0], [100, 0, 0], [109, 0, 0], [19, 0, 0], [17, 12, 12], [10, 17, 12], [17, 11, 20], [11, 16, 20], [20, 20, 24], [33, 28, 28], [21, 33, 28], [32, 32, 28], [23, 28, 32], [27, 32, 36], [36, 36, 40], [50, 39, 40], [37, 49, 44], [53, 48, 44], [40, 39, 48], [41, 52, 52], [51, 57, 52], [71, 55, 56], [24, 71, 38], [47, 66, 38], [35, 66, 56], [51, 70, 55], [45, 83, 59], [68, 69, 59], [106, 80, 53], [56, 55, 69], [52, 69, 68], [49, 63, 111], [67, 73, 68], [88, 71, 72], [67, 87, 71], [83, 91, 71], [104, 89, 84], [79, 104, 74], [59, 104, 84], [84, 103, 84], [100, 103, 74], [121, 102, 74], [99, 107, 88], [120, 106, 88], [95, 120, 87], [116, 119, 91], [77, 120, 96], [78, 119, 117], [99, 124, 100], [122, 117, 117], [147, 86, 78], [143, 113, 86], [141, 121, 108], [99, 137, 90], [111, 137, 99], [110, 153, 115], [131, 140, 103], [152, 139, 102], [148, 152, 101], [131, 139, 116], [147, 156, 114], [175, 150, 114], [137, 170, 114], [169, 174, 117], [85, 117, 168], [143, 114, 172], [70, 134, 146], [114, 143, 137], [4, 4, 8], [20, 19, 28], [34, 44, 53], [50, 73, 76], [61, 89, 98], [77, 110, 118], [91, 130, 138], [106, 150, 158], [61, 31, 18], [98, 40, 24], [134, 39, 31], [170, 28, 28], [194, 27, 9], [221, 0, 0], [249, 0, 0], [255, 0, 0], [141, 141, 65], [159, 166, 86], [179, 191, 115], [198, 215, 144], [181, 167, 130], [149, 129, 116], [121, 100, 101], [0, 116, 114], [0, 95, 102], [0, 77, 94], [0, 59, 81], [0, 51, 73], [24, 72, 34], [24, 90, 41], [35, 106, 53], [42, 127, 64], [116, 99, 42], [150, 123, 57], [190, 147, 71], [229, 171, 92], [255, 154, 31], [255, 215, 40], [112, 75, 53], [137, 92, 69], [175, 120, 85], [33, 29, 53], [64, 64, 64], [165, 146, 123], [184, 206, 0], [170, 185, 0], [202, 219, 0], [0, 162, 45], [0, 107, 18], [205, 255, 255], [144, 208, 211], [213, 199, 172], [220, 211, 193], [195, 254, 0], [127, 238, 0], [109, 213, 0], [202, 202, 202], [72, 72, 72], [179, 177, 233], [159, 128, 0], [143, 112, 0], [119, 87, 0], [79, 33, 21], [145, 0, 0], [253, 218, 110], [229, 194, 95], [204, 173, 84], [184, 152, 71], [142, 115, 48], [102, 77, 30], [59, 45, 17], [17, 12, 3], [198, 178, 88], [173, 157, 77], [146, 141, 69], [126, 120, 58], [110, 104, 51], [89, 88, 40], [72, 70, 33], [57, 53, 26], [218, 218, 218], [190, 190, 190], [161, 161, 161], [133, 133, 133], [109, 109, 109], [80, 80, 80], [52, 52, 52], [24, 24, 24], [222, 221, 230], [195, 192, 211], [166, 162, 191], [134, 130, 158], [102, 98, 126], [73, 70, 94], [45, 42, 61], [20, 19, 28], [255, 199, 111], [182, 111, 70], [136, 173, 200], [95, 87, 139], [95, 62, 102], [149, 72, 97], [124, 47, 72], [150, 144, 79], [126, 120, 53], [255, 138, 146], [255, 118, 126], [0, 112, 152], [0, 83, 123], [0, 158, 146], [0, 129, 118], [0, 101, 89], [118, 134, 176], [90, 146, 201], [137, 137, 133], [149, 150, 132], [169, 149, 140], [173, 177, 139], [139, 132, 184], [154, 131, 184], [155, 145, 188], [170, 146, 171], [169, 148, 188], [201, 184, 137], [170, 147, 196], [180, 171, 204], [208, 178, 203], [234, 216, 231], [29, 25, 6], [37, 33, 10], [41, 37, 14], [47, 50, 17], [55, 58, 25], [63, 66, 29], [71, 74, 37], [79, 82, 45], [88, 91, 53], [91, 100, 61], [99, 108, 69], [107, 116, 83], [115, 124, 91], [123, 131, 103], [131, 139, 116], [255, 255, 255]];

var palettes = {
	gdi: [176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191],
	nod: [127, 126, 125, 124, 122, 46, 120, 47, 125, 124, 123, 122, 42, 121, 120, 120],
	yellow: [176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191],
	red: [127, 126, 125, 124, 122, 46, 120, 47, 125, 124, 123, 122, 42, 121, 120, 120],
	teal: [2, 119, 118, 135, 136, 138, 112, 12, 118, 135, 136, 137, 138, 139, 114, 112],
	orange: [24, 25, 26, 27, 29, 31, 46, 47, 26, 27, 28, 29, 30, 31, 43, 47],
	green: [5, 165, 166, 167, 159, 142, 140, 199, 166, 167, 157, 3, 159, 143, 142, 141],
	gray: [161, 200, 201, 202, 204, 205, 206, 12, 201, 202, 203, 204, 205, 115, 198, 114],
	neutral: [176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191],
	darkgray: [14, 195, 196, 13, 169, 198, 199, 112, 14, 195, 196, 13, 169, 198, 199, 112],
	brown: [146, 152, 209, 151, 173, 150, 173, 183, 146, 152, 209, 151, 173, 150, 173, 183]
};

function createSpriteSheetCanvas(image, canvas, type) {
	var colorCount = 2;
	if (game.type == "multiplayer") {
		colorCount = multiplayer.players.length;
	}
	canvas.width = image.width;
	canvas.height = image.height * colorCount;
	var context = canvas.getContext("2d");
	for (var i = 0; i < colorCount; i++) {
		context.drawImage(image, 0, image.height * i)
	}
	var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
	var imgDataArray = imgData.data;
	var size = imgDataArray.length / 4;
	var rThreshold = 25;
	var gThreshold = 25;
	var bThreshold = 25;
	var paletteOriginal = palettes["yellow"];
	if (game.type == "singleplayer") {
		var paletteFinal;
		if (type == "colormap") {
			paletteFinal = palettes["red"];
		} else {
			paletteFinal = palettes["gray"];
		}
		for (var p = size / 2; p < size; p++) {
			var r = imgDataArray[p * 4];
			var g = imgDataArray[p * 4 + 1];
			var b = imgDataArray[p * 4 + 2];
			var a = imgDataArray[p * 4 + 2];
			for (var i = 16 - 1; i >= 0; i--) {
				var colorOriginal = colors[paletteOriginal[i]];
				var colorFinal = colors[paletteFinal[i]];
				if (Math.abs(r - colorOriginal[0]) < rThreshold && Math.abs(g - colorOriginal[1]) < gThreshold && Math.abs(b - colorOriginal[2]) < bThreshold) {
					imgDataArray[p * 4 + 0] = colorFinal[0];
					imgDataArray[p * 4 + 1] = colorFinal[1];
					imgDataArray[p * 4 + 2] = colorFinal[2];
					break;
				}
			}
		}
	} else {
		for (var j = 0; j < colorCount; j++) {
			var paletteFinal = palettes[multiplayer.players[j].color];
			for (var p = size * j / colorCount; p < size * (j + 1) / colorCount; p++) {
				var r = imgDataArray[p * 4];
				var g = imgDataArray[p * 4 + 1];
				var b = imgDataArray[p * 4 + 2];
				var a = imgDataArray[p * 4 + 2];
				for (var i = 16 - 1; i >= 0; i--) {
					var colorOriginal = colors[paletteOriginal[i]];
					var colorFinal = colors[paletteFinal[i]];
					if (Math.abs(r - colorOriginal[0]) < rThreshold && Math.abs(g - colorOriginal[1]) < gThreshold && Math.abs(b - colorOriginal[2]) < bThreshold) {
						imgDataArray[p * 4 + 0] = colorFinal[0];
						imgDataArray[p * 4 + 1] = colorFinal[1];
						imgDataArray[p * 4 + 2] = colorFinal[2];
						break;
					}
				}
			}
		}
	}
	context.putImageData(imgData, 0, 0);
	return canvas;
}

function getLifeCode(object) {
	var lifePercent = roundFloating(object.life / object.hitPoints);
	var lifeCode;
	if (lifePercent > .5) {
		lifeCode = "healthy";
	} else if (lifePercent > .25) {
		lifeCode = "damaged";
	} else if (lifePercent > .05) {
		lifeCode = "ultra-damaged";
	} else {
		lifeCode = "dead";
	}
	return lifeCode;
}

function roundFloating(number) {
	return Math.round(number * 1e4) / 1e4;
}

var explosionSound = {
	frag1: "xplobig4",
	frag3: "xplobig6",
	vehhit1: "xplos",
	vehhit2: "xplos",
	vehhit3: "xplos",
	atomsfx: "nukexplo",
	fball1: "xplos",
	"art-exp1": "xplosml2",
	napalm1: "flamer2",
	napalm2: "flamer2",
	napalm3: "flamer2"
};

var effects = {
	type: "effects",
	list: {
		piff: {imageCount: 4, pixelWidth: 9, pixelHeight: 13},
		piffpiff: {imageCount: 7, pixelWidth: 15, pixelHeight: 15},
		vehhit1: {imageCount: 17, pixelWidth: 30, pixelHeight: 17},
		vehhit2: {imageCount: 22, pixelWidth: 21, pixelHeight: 17},
		vehhit3: {imageCount: 14, pixelWidth: 19, pixelHeight: 13},
		"art-exp1": {imageCount: 22, pixelWidth: 41, pixelHeight: 35},
		napalm1: {imageCount: 14, pixelWidth: 22, pixelHeight: 18},
		napalm2: {imageCount: 14, pixelWidth: 41, pixelHeight: 40},
		napalm3: {imageCount: 14, pixelWidth: 72, pixelHeight: 72},
		frag1: {imageCount: 14, pixelWidth: 45, pixelHeight: 33},
		frag3: {imageCount: 22, pixelWidth: 41, pixelHeight: 28},
		fball1: {imageCount: 18, pixelWidth: 67, pixelHeight: 44},
		smokey: {imageCount: 7, pixelWidth: 19, pixelHeight: 17},
		smoke: {
			imageCount: 91, pixelWidth: 23, pixelHeight: 23, animationIndex: 0, draw: function() {
				this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
				this.interpolatedY = this.y + game.movementInterpolationFactor * this.lastMovementY;
				var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft;
				var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop;
				if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth || y > game.viewportHeight) {
					return
				}
				game.foregroundContext.drawImage(this.spriteSheet, this.animationIndex * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x - this.pixelWidth / 2, y - this.pixelHeight + 3, this.pixelWidth, this.pixelHeight)
			}
		},
		"minigun-fire": {imageCount: 6, pixelWidth: 18, pixelHeight: 17, directions: 8},
		chem: {imageCount: 13, pixelWidth: 79, pixelHeight: 79, directions: 8},
		flame: {imageCount: 13, pixelWidth: 79, pixelHeight: 79, directions: 8},
		flare: {imageCount: 92, pixelWidth: 42, pixelHeight: 31, loop: 60},
		"sam-fire": {
			pixelWidth: 55, pixelHeight: 35, directions: 8, imageCount: 16, draw: function() {
				if (this.animationIndex < 0) {
					this.animationIndex = 0
				}
				var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
				var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
				if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth || y > game.viewportHeight) {
					return
				}
				game.foregroundContext.drawImage(this.spriteSheet, (this.direction * this.imageCount + this.animationIndex) * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
			}
		},
		"laser-fire": {
			imageCount: 5, spriteSheet: true, draw: function() {
				var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
				var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
				var targetX = Math.round(this.targetX * game.gridSize) - game.viewportX + game.viewportLeft;
				var targetY = Math.round(this.targetY * game.gridSize) - game.viewportY + game.viewportTop;
				game.foregroundContext.beginPath();
				game.foregroundContext.moveTo(x, y);
				game.foregroundContext.lineTo(targetX, targetY);
				game.foregroundContext.strokeStyle = "red";
				game.foregroundContext.stroke()
			}
		},
		atomsfx: {imageCount: 27, pixelWidth: 78, pixelHeight: 121},
		atomsmoke: {imageCount: 33, pixelWidth: 24, pixelHeight: 48},
		ioncannon: {
			imageCount: 15, pixelWidth: 72, pixelHeight: 191, draw: function() {
				if (this.animationIndex < 0) {
					this.animationIndex = 0
				}
				var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
				var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
				game.foregroundContext.drawImage(this.spriteSheet, (this.direction * this.imageCount + this.animationIndex) * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x - this.pixelWidth / 2, y - this.pixelHeight + 12, this.pixelWidth, this.pixelHeight)
			}
		}
	},
	defaults: {
		animationIndex: -1, direction: 0, lastMovementY: 0, lastMovementX: 0, z: 0, animate: function() {
			this.animationIndex++;
			if (this.animationIndex >= this.imageCount) {
				this.animationIndex = 0;
				if (!this.loop) {
					game.remove(this);
					if (this.oncomplete) {
						this.oncomplete()
					}
				} else {
					this.animationIndex = this.loop
				}
			}
		}, draw: function() {
			if (this.animationIndex < 0) {
				this.animationIndex = 0
			}
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round((this.y - this.z) * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth + this.pixelWidth || y > game.viewportHeight + this.pixelHeight) {
				return
			}
			if (this.background && this.animationIndex <= this.imageCount / 3) {
				this.background.draw()
			}
			game.foregroundContext.drawImage(this.spriteSheet, (this.direction * this.imageCount + this.animationIndex) * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x - this.pixelWidth / 2, y - this.pixelHeight / 2, this.pixelWidth, this.pixelHeight)
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		$.extend(item, details);
		return item
	},
	load: function (name) {
		var item = this.list[name];
		if (item.spriteSheet) {
			return
		}
		item.name = name;
		item.type = this.type;
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png")
	},
	loadAll: function() {
		var names = Object.keys(this.list).sort();
		for (var i = names.length - 1; i >= 0; i--) {
			this.load(names[i])
		}
	}
};

var fog = {
	fogGrid: [], canvas: document.createElement("canvas"), init: function() {
		this.context = this.canvas.getContext("2d");
		this.canvas.width = maps.currentMapData.width * game.gridSize;
		this.canvas.height = maps.currentMapData.height * game.gridSize;
		this.context.fillStyle = "rgba(0,0,0,1)";
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		var fogGrid = [];
		for (var i = 0; i < maps.currentMapData.height; i++) {
			fogGrid[i] = [];
			for (var j = 0; j < maps.currentMapData.width; j++) {
				fogGrid[i][j] = 1
			}
		}
		for (var l = game.players.length - 1; l >= 0; l--) {
			this.fogGrid[game.players[l]] = $.extend(true, [], fogGrid)
		}
	}, isPointOverFog: function (x, y) {
		if (y < 0 || y / game.gridSize >= maps.currentMapData.height || x < 0 || x / game.gridSize >= maps.currentMapData.width) {
			return true
		}
		return this.fogGrid[game.player][Math.floor(y / game.gridSize)][Math.floor(x / game.gridSize)] == 1
	}, animate: function() {
		fog.context.globalCompositeOperation = "destination-out";
		for (var i = game.items.length - 1; i >= 0; i--) {
			var item = game.items[i];
			for (var l = game.players.length - 1; l >= 0; l--) {
				player = game.players[l];
				if (item.player == player || item.firing) {
					var x = Math.floor(item.cgX);
					var y = Math.floor(item.cgY);
					var x0, y0, x1, y1;
					if (item.player === player) {
						x0 = x - item.sight < 0 ? 0 : x - item.sight;
						y0 = y - item.sight < 0 ? 0 : y - item.sight;
						x1 = x + item.sight > maps.currentMapData.width - 1 ? maps.currentMapData.width - 1 : x + item.sight;
						y1 = y + item.sight > maps.currentMapData.height - 1 ? maps.currentMapData.height - 1 : y + item.sight
					} else {
						x0 = x - 1 < 0 ? 0 : x - 1;
						y0 = y - 1 < 0 ? 0 : y - 1;
						x1 = x + 1 > maps.currentMapData.width - 1 ? maps.currentMapData.width - 1 : x + 1;
						y1 = y + 1 > maps.currentMapData.height - 1 ? maps.currentMapData.height - 1 : y + 1
					}
					for (var j = x0; j <= x1; j++) {
						for (var k = y0; k <= y1; k++) {
							if (j > x0 && j < x1 || k > y0 && k < y1) {
								if (game.player == player && this.fogGrid[player][k][j]) {
									this.context.fillStyle = "rgba(100,0,0,0.9)";
									this.context.beginPath();
									this.context.arc(j * game.gridSize + 12, k * game.gridSize + 12, 16, 0, 2 * Math.PI, false);
									this.context.fill();
									this.context.fillStyle = "rgba(100,0,0,0.7)";
									this.context.beginPath();
									this.context.arc(j * game.gridSize + 12, k * game.gridSize + 12, 18, 0, 2 * Math.PI, false);
									this.context.fill();
									this.context.fillStyle = "rgba(100,0,0,0.5)";
									this.context.beginPath();
									this.context.arc(j * game.gridSize + 12, k * game.gridSize + 12, 24, 0, 2 * Math.PI, false);
									this.context.fill()
								}
								this.fogGrid[player][k][j] = 0
							}
						}
					}
				}
			}
		}
		fog.context.globalCompositeOperation = "source-over"
	}, draw: function() {
		game.foregroundContext.drawImage(this.canvas, game.viewportX, game.viewportY, game.viewportWidth, game.viewportHeight, game.viewportLeft, game.viewportTop, game.viewportWidth, game.viewportHeight)
	}
};

var game = {
	canvasWidth: 640,
	canvasHeight: 535,
	gridSize: 24,
	init: function() {
		$(window).resize(game.resize);
		game.resize();
		$("#fullscreenbutton").click(game.startFullScreen);
		$(document).bind("webkitfullscreenchange mozfullscreenchange fullscreenchange", game.fullScreenChanged);
		loader.init();
		videos.init();
		menus.load();
		sounds.load();
		sidebar.load();
		mouse.load();
		bullets.loadAll();
		effects.loadAll();
		game.backgroundContext = $(".gamebackgroundcanvas")[0].getContext("2d");
		game.foregroundContext = $(".gameforegroundcanvas")[0].getContext("2d");
		if (loader.loaded) {
			menus.show("game-type")
		} else {
			loader.onload = function() {
				menus.show("game-type")
			}
		}

		//game.foregroundContext.imageSmoothingEnabled = false;
	},
	fullScreen: false,
	aspectRatio: 640 / 535,
	scaleFactor: 1,
	startFullScreen: function() {
		var gameinterfacescreen = $(".fullscreencontainer")[0];
		if (gameinterfacescreen.requestFullScreen) {
			gameinterfacescreen.requestFullScreen();
		} else if (gameinterfacescreen.mozRequestFullScreen) {
			gameinterfacescreen.mozRequestFullScreen();
		} else if (gameinterfacescreen.webkitRequestFullScreen) {
			gameinterfacescreen.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		} else if (gameinterfacescreen.requestFullscreen) {
			gameinterfacescreen.requestFullscreen();
		}
	},
	fullScreenChanged: function() {
		game.fullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
		game.resize();
	},
	resize: function() {
		var $window = $(window);
		var windowWidth = $window.width();
		var windowHeight = $window.height();
		var maxPossibleHeight = windowHeight;
		var maxPossibleWidth = windowWidth;
		if (!game.fullScreen) {
			$(".gamecontainer").css("border", "");
			maxPossibleHeight = maxPossibleHeight - $("footer").height() - 10;
			maxPossibleWidth = maxPossibleWidth - $(".leftpanel").width() - $(".rightpanel").width() - 10;
		} else {
			$(".gamecontainer").css("border", "none");
			maxPossibleHeight = maxPossibleHeight - 10;
			maxPossibleWidth = maxPossibleWidth - 10;
		}
		var newWidth, newHeight;
		if (windowWidth >= 1100) {
			if (maxPossibleWidth / maxPossibleHeight > game.aspectRatio) {
				newWidth = Math.floor(maxPossibleHeight * game.aspectRatio);
				newHeight = maxPossibleHeight;
			} else {
				newHeight = Math.floor(maxPossibleWidth / game.aspectRatio);
				newWidth = maxPossibleWidth;
			}
			game.scaleFactor = 640 / newWidth;
			$(".gamecontainer").width(newWidth).height(newHeight);
			$(".gamelayer").width(newWidth).height(newHeight);
			$(".middlepanel").width(newWidth);
			menus.reposition(newWidth, newHeight);
		}
	},
	viewportX: 0,
	viewportY: 0,
	viewportTop: 35,
	viewportLeft: 0,
	viewportHeight: 481,
	viewportAdjustX: 0,
	viewportAdjustY: 0,
	screenWidth: 640,
	screenHeight: 535,
	animationTimeout: 100,
	animationInterval: undefined,
	createGrids: function() {
		if (!game.terrainGrid) {
			game.buildingLandscapeChanged = true;
			var terrainGrid = Array(maps.currentMapTerrain.length);
			for (var i = 0; i < maps.currentMapTerrain.length; i++) {
				terrainGrid[i] = Array(maps.currentMapTerrain[i].length);
				for (var j = 0; j < maps.currentMapTerrain[i].length; j++) {
					if (maps.currentMapTerrain[i][j]) {
						terrainGrid[i][j] = 1;
					} else {
						terrainGrid[i][j] = 0;
					}
				}
			}
			for (var i = game.trees.length - 1; i >= 0; i--) {
				var item = game.trees[i];
				if (!item.gridShape) {
					console.log(item.name);
				}
				for (var j = item.gridShape.length - 1; j >= 0; j--) {
					for (var k = item.gridShape[j].length - 1; k >= 0; k--) {
						if (item.gridShape[j][k] == 1) {
							try {
								terrainGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = 1;
							} catch (e) {
							}
						}
					}
				}
			}
			game.terrainGrid = terrainGrid;
		}
		if (game.buildingLandscapeChanged) {
			game.obstructionGrid = $.extend(true, [], game.terrainGrid);
			for (var i = game.buildings.length - 1; i >= 0; i--) {
				var item = game.buildings[i];
				for (var j = item.gridShape.length - 1; j >= 0; j--) {
					for (var k = item.gridShape[j].length - 1; k >= 0; k--) {
						if (item.gridShape[j][k] == 1) {
							game.obstructionGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = item.name;
						}
					}
				}
			}
			for (var i = game.turrets.length - 1; i >= 0; i--) {
				var item = game.turrets[i];
				for (var j = item.gridShape.length - 1; j >= 0; j--) {
					for (var k = item.gridShape[j].length - 1; k >= 0; k--) {
						if (item.gridShape[j][k] == 1) {
							game.obstructionGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = item.name;
						}
					}
				}
			}
			for (var i = game.walls.length - 1; i >= 0; i--) {
				var item = game.walls[i];
				for (var j = item.gridShape.length - 1; j >= 0; j--) {
					for (var k = item.gridShape[j].length - 1; k >= 0; k--) {
						if (item.gridShape[j][k] == 1) {
							game.obstructionGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = item.name;
						}
					}
				}
			}
		}
		if (!game.foggedObstructionGrid) {
			game.foggedObstructionGrid = {}
		}
		for (var l = game.players.length - 1; l >= 0; l--) {
			var player = game.players[l];
			var fogGrid = fog.fogGrid[player];
			if (!game.foggedObstructionGrid[player]) {
				game.foggedObstructionGrid[player] = $.extend(true, [], game.obstructionGrid);
			}
			for (var j = game.foggedObstructionGrid[player].length - 1; j >= 0; j--) {
				for (var k = game.foggedObstructionGrid[player][j].length - 1; k >= 0; k--) {
					game.foggedObstructionGrid[player][j][k] = fogGrid[j][k] == 1 ? 0 : game.obstructionGrid[j][k] === 0 ? 0 : 1;
				}
			}
		}
		if (sidebar.deployMode || game.selectedMCVs.length > 0) {
			game.foggedBuildableGrid = game.createFoggedBuildableGrid(game.player);
		}
	},
	createFoggedBuildableGrid: function (player) {
		var fogGrid = fog.fogGrid[player];
		var foggedBuildableGrid = $.extend(true, [], game.terrainGrid);
		for (var j = foggedBuildableGrid.length - 1; j >= 0; j--) {
			for (var k = foggedBuildableGrid[j].length - 1; k >= 0; k--) {
				foggedBuildableGrid[j][k] = fogGrid[j][k] == 1 ? 1 : game.terrainGrid[j][k];
			}
		}
		for (var i = game.buildings.length - 1; i >= 0; i--) {
			var item = game.buildings[i];
			for (var j = item.gridBuild.length - 1; j >= 0; j--) {
				for (var k = item.gridBuild[j].length - 1; k >= 0; k--) {
					if (item.gridBuild[j][k] == 1) {
						foggedBuildableGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = 1;
					}
				}
			}
		}
		for (var i = game.turrets.length - 1; i >= 0; i--) {
			var item = game.turrets[i];
			for (var j = item.gridBuild.length - 1; j >= 0; j--) {
				for (var k = item.gridBuild[j].length - 1; k >= 0; k--) {
					if (item.gridBuild[j][k] == 1) {
						foggedBuildableGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = 1;
					}
				}
			}
		}
		for (var i = game.walls.length - 1; i >= 0; i--) {
			var item = game.walls[i];
			for (var j = item.gridBuild.length - 1; j >= 0; j--) {
				for (var k = item.gridBuild[j].length - 1; k >= 0; k--) {
					if (item.gridBuild[j][k] == 1) {
						foggedBuildableGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = 1;
					}
				}
			}
		}
		for (var i = game.tiberium.length - 1; i >= 0; i--) {
			var item = game.tiberium[i];
			for (var j = item.gridBuild.length - 1; j >= 0; j--) {
				for (var k = item.gridBuild[j].length - 1; k >= 0; k--) {
					if (item.gridBuild[j][k] == 1) {
						foggedBuildableGrid[Math.floor(item.y) + j][Math.floor(item.x) + k] = 1;
					}
				}
			}
		}
		for (var i = game.vehicles.length - 1; i >= 0; i--) {
			var item = game.vehicles[i];
			if (item.name === "mcv" && item.selected && mouse.objectUnderMouse == item && item.player == game.player) {
			} else {
				var yFloor = Math.floor(item.y);
				var xFloor = Math.floor(item.x);
				if (yFloor >= 0 && yFloor <= foggedBuildableGrid.length && xFloor >= 0 && xFloor < foggedBuildableGrid[0].length) {
					foggedBuildableGrid[Math.floor(item.y)][Math.floor(item.x)] = 1;
				}
			}
		}
		for (var i = game.infantry.length - 1; i >= 0; i--) {
			var item = game.infantry[i];
			var yFloor = Math.floor(item.y);
			var xFloor = Math.floor(item.x);
			if (yFloor >= 0 && yFloor <= foggedBuildableGrid.length && xFloor >= 0 && xFloor < foggedBuildableGrid[0].length) {
				foggedBuildableGrid[Math.floor(item.y)][Math.floor(item.x)] = 1;
			}
		}
		for (var i = game.aircraft.length - 1; i >= 0; i--) {
			var item = game.aircraft[i];
			var yFloor = Math.floor(item.y);
			var xFloor = Math.floor(item.x);
			if (item.z < 1 / 8 && yFloor >= 0 && yFloor <= foggedBuildableGrid.length && xFloor >= 0 && xFloor < foggedBuildableGrid[0].length) {
				foggedBuildableGrid[Math.floor(item.y)][Math.floor(item.x)] = 1;
			}
		}
		return foggedBuildableGrid
	},
	canBuildOnFoggedGrid: function (building, foggedBuildableGrid) {
		var buildingType = window[building.type].list[building.name];
		var grid = $.extend(true, [], buildingType.gridBuild);
		var canBuildHere = true;
		for (var y = 0; y < grid.length; y++) {
			for (var x = 0; x < grid[y].length; x++) {
				if (grid[y][x] == 1) {
					if (foggedBuildableGrid[building.y + y][building.x + x] !== 0) {
						return false;
					}
				}
			}
		}
		return true;
	},
	animationLoop: function() {
		mouse.setCursor();
		sidebar.animate();
		game.createGrids();
		game.buildingLandscapeChanged = false;
		triggers.process();
		for (var i = game.items.length - 1; i >= 0; i--) {
			var item = game.items[i];
			if (item.processOrders) {
				item.processOrders();
			}
			item.animate();
			if (item.preRender) {
				item.preRender();
			}
		}
		for (var i = game.effects.length - 1; i >= 0; i--) {
			game.effects[i].animate();
		}
		for (var i = game.bullets.length - 1; i >= 0; i--) {
			game.bullets[i].animate();
		}
		fog.animate();
		game.sortedItemsArray = $.extend([], game.items);
		game.sortedItemsArray.sort(function (a, b) {
			var by = b.cgY ? b.cgY : b.y;
			var ay = a.cgY ? a.cgY : a.y;
			return (b.z - a.z) * 1.25 + (by - ay) + (by == ay ? a.x - b.x : 0);
		});
		game.lastAnimationTime = (new Date).getTime();
	},
	drawingLoop: function() {
		game.foregroundContext.clearRect(0, 0, game.screenWidth, game.screenHeight);
		sidebar.draw();
		game.lastDrawTime = (new Date).getTime();
		if (game.lastAnimationTime) {
			game.movementInterpolationFactor = (game.lastDrawTime - game.lastAnimationTime) / game.animationTimeout - 1;
			if (game.movementInterpolationFactor > 0) {
				game.movementInterpolationFactor = 0;
			}
		} else {
			game.movementInterpolationFactor = -1;
		}

		game.foregroundContext.save();
		game.foregroundContext.beginPath();
		game.viewportWidth = sidebar.visible ? game.screenWidth - sidebar.width : game.screenWidth;
		game.foregroundContext.rect(game.viewportLeft, game.viewportTop, game.viewportWidth - game.viewportLeft, game.viewportHeight);
		game.foregroundContext.clip();
		mouse.handlePanning();
		maps.draw();
		for (var i = game.sortedItemsArray.length - 1; i >= 0; i--) {
			game.sortedItemsArray[i].draw();
		}
		for (var i = game.effects.length - 1; i >= 0; i--) {
			game.effects[i].draw();
		}
		for (var i = game.bullets.length - 1; i >= 0; i--) {
			game.bullets[i].draw();
		}
		fog.draw();
		if (sidebar.deployMode && sidebar.deployBuilding) {
			var buildingType = sidebar.deployBuilding;
			var grid = $.extend(true, [], buildingType.gridBuild);
			sidebar.canBuildHere = true;
			sidebar.tooFarAway = true;
			for (var i = game.buildings.length - 1; i >= 0; i--) {
				var building = game.buildings[i];
				if (building.player == game.player) {
					if (Math.abs(building.x + building.gridWidth / 2 - mouse.gridX - buildingType.gridWidth / 2) < building.gridWidth / 2 + buildingType.gridWidth / 2 + 2 && Math.abs(building.y + building.gridHeight / 2 - mouse.gridY - buildingType.gridHeight / 2) < building.gridHeight / 2 + buildingType.gridHeight / 2 + 3) {
						sidebar.tooFarAway = false;
						break;
					}
				}
			}
			for (var i = game.turrets.length - 1; i >= 0; i--) {
				var building = game.turrets[i];
				if (building.player == game.player) {
					if (Math.abs(building.x + building.gridWidth / 2 - mouse.gridX - buildingType.gridWidth / 2) < building.gridWidth / 2 + buildingType.gridWidth / 2 + 2 && Math.abs(building.y + building.gridHeight / 2 - mouse.gridY - buildingType.gridHeight / 2) < building.gridHeight / 2 + buildingType.gridHeight / 2 + 3) {
						sidebar.tooFarAway = false;
						break;
					}
				}
			}
			for (var y = 0; y < grid.length; y++) {
				for (var x = 0; x < grid[y].length; x++) {
					if (grid[y][x] == 1) {
						if (sidebar.tooFarAway || mouse.gridY + y < 0 || mouse.gridY + y >= game.foggedBuildableGrid.length || mouse.gridX + x < 0 || mouse.gridX + x >= game.foggedBuildableGrid[mouse.gridY + y].length || game.foggedBuildableGrid[mouse.gridY + y][mouse.gridX + x] !== 0) {
							game.highlightGrid(mouse.gridX + x, mouse.gridY + y, 1, 1, sidebar.placementRedImage);
							sidebar.canBuildHere = false;
						} else {
							game.highlightGrid(mouse.gridX + x, mouse.gridY + y, 1, 1, sidebar.placementWhiteImage);
						}
					}
				}
			}
		}
		if (game.showEnding) {
			var endingImage = game.showEnding == "success" ? sidebar.missionAccomplished : sidebar.missionFailed;
			game.foregroundContext.drawImage(endingImage, game.viewportLeft + game.viewportWidth / 2 - endingImage.width / 2, game.viewportTop + game.viewportHeight / 2 - endingImage.height / 2)
		}
		game.foregroundContext.restore();

		if (game.type === "multiplayer" && !game.replay) {
			game.foregroundContext.fillStyle = "rgb(40,40,40)";
			game.foregroundContext.fillText("C: " + game.gameTick, game.canvasWidth - 200, game.canvasHeight - 5);
			game.foregroundContext.fillText("S: " + multiplayer.lastReceivedTick, game.canvasWidth - 100, game.canvasHeight - 5);
			if (multiplayer.gameLagging) {
				game.foregroundContext.fillText("Server Syncing...", 150, game.canvasHeight - 5)
			}
			game.foregroundContext.fillStyle = "rgb(100,100,100)";
			game.foregroundContext.fillText("L: " + multiplayer.averageLatency + " ms", 20, game.canvasHeight - 5)
		}
		if (game.replay) {
			var replayTop = sidebar.top;
			game.foregroundContext.drawImage(sidebar.replayMenuImage, 0, replayTop);
			if (game.type !== "singleplayer") {
				game.foregroundContext.fillStyle = "black";
				game.foregroundContext.fillRect(0, sidebar.top + 87, 130, 32)
			}
			game.foregroundContext.fillStyle = "lightgreen";
			game.foregroundContext.font = "16px Command";
			game.foregroundContext.globalAlpha = sidebar.textBrightness;
			game.foregroundContext.fillText("R E P L A Y", 32, replayTop + 20);
			game.foregroundContext.globalAlpha = 1
		}
		mouse.draw();
		if (game.running) {
			game.drawingInterval = requestAnimationFrame(game.drawingLoop)
		}
		if (!game.fps) {
			game.fps = []
		}
		game.fps.push(new Date);
		if (game.fps.length > 51) {
			game.fps.shift();
			var fps = Math.round(5e4 / (game.fps[50] - game.fps[0]));
			mouse.context.fillStyle = "rgb(100,100,100)";
			mouse.context.fillText("FPS: " + fps, 100, game.canvasHeight - 5)
		}
	},
	highlightGrid: function (i, j, width, height, optionalImage) {
		var gridSize = game.gridSize;
		if (optionalImage && $(optionalImage).is("img")) {
			game.foregroundContext.drawImage(optionalImage, i * gridSize + game.viewportAdjustX, j * gridSize + game.viewportAdjustY, width * gridSize, height * gridSize);
		} else {
			if (optionalImage) {
				game.foregroundContext.fillStyle = optionalImage;
			} else {
				game.foregroundContext.fillStyle = "rgba(225,225,225,0.5)";
			}
			game.foregroundContext.fillRect(i * gridSize + game.viewportAdjustX, j * gridSize + game.viewportAdjustY, width * gridSize, height * gridSize);
		}
	},
	remove: function (item) {
		item.lifeCode = "dead";
		if (item.selected) {
			item.selected = false;
			for (var j = game.selectionArrays.length - 1; j >= 0; j--) {
				var type = game.selectionArrays[j];
				for (var i = game[type].length - 1; i >= 0; i--) {
					if (game[type][i].uid == item.uid) {
						game[type].splice(i, 1);
						break;
					}
				}
			}
		}
		for (var i = game.items.length - 1; i >= 0; i--) {
			if (game.items[i].uid == item.uid) {
				game.items.splice(i, 1);
				break;
			}
		}
		for (var i = game.attackableItems.length - 1; i >= 0; i--) {
			if (game.attackableItems[i].uid == item.uid) {
				game.attackableItems.splice(i, 1);
				break;
			}
		}
		for (var j = game.controlGroups.length - 1; j >= 0; j--) {
			var group = game.controlGroups[j];
			if (group) {
				for (var i = group.length - 1; i >= 0; i--) {
					if (group[i].uid == item.uid) {
						group.splice(i, 1);
						break;
					}
				}
			}
		}
		for (var i = game[item.type].length - 1; i >= 0; i--) {
			if (game[item.type][i].uid == item.uid) {
				game[item.type].splice(i, 1);
				break;
			}
		}
		if (item.type == "buildings" || item.type == "turrets" || item.type == "walls") {
			game.buildingLandscapeChanged = true;
		}
	},
	add: function (item) {
		var object;
		game.counter++;
		if (item.uid == undefined) {
			item.uid = game.counter;
		}
		if (item.type == "buildings" || item.type == "turrets" || item.type == "walls") {
			game.buildingLandscapeChanged = true;
		}
		switch (item.type) {
			case "infantry":
			case "vehicles":
			case "ships":
			case "buildings":
			case "turrets":
			case "walls":
			case "aircraft":
				object = window[item.type].add(item);
				game[item.type].push(object);
				game.items.push(object);
				game.attackableItems.push(object);
				break;
			case "tiberium":
			case "trees":
				object = window[item.type].add(item);
				game[item.type].push(object);
				game.items.push(object);
				break;
			case "triggers":
			case "effects":
			case "bullets":
				object = window[item.type].add(item);
				game[item.type].push(object);
				break;
			default:
				console.log("Did not add " + item.type + " : " + item.name);
				break;
		}
		return object
	},
	gameSpeed: 5,
	scrollSpeed: 5,
	speedAdjustmentFactor: 6,
	selectionArrays: ["selectedItems", "selectedUnits", "selectedVehicles", "selectedAttackers", "selectedHarvesters", "selectedEngineers", "selectedInfantry", "selectedCommandos", "selectedMCVs", "selectedAircraft"],
	itemArrays: ["attackableItems", "vehicles", "ships", "infantry", "buildings", "turrets", "effects", "bullets", "walls", "aircraft", "items", "trees", "tiberium", "triggers", "controlGroups", "permissions", "attackedPlayers", "discoveredPlayers"],
	resetTypes: function() {
		game.counter = 1;
		game.showEnding = false;
		game.terrainGrid = undefined;
		game.foggedObstructionGrid = undefined;
		game.refreshBackground = true;
		for (var i = game.itemArrays.length - 1; i >= 0; i--) {
			game[game.itemArrays[i]] = [];
		}
		for (var j = game.selectionArrays.length - 1; j >= 0; j--) {
			game[game.selectionArrays[j]] = [];
		}
	},
	selectItem: function (item, shiftPressed, multipleSelection) {
		if (shiftPressed && item.selected) {
			item.selected = false;
			for (var j = game.selectionArrays.length - 1; j >= 0; j--) {
				game[game.selectionArrays[j]].remove(item);
			}
			return;
		}
		item.selected = true;
		this.selectedItems.push(item);
		if (item.type != "buildings" && item.type != "turrets" && item.type != "ships" && item.type != "walls" && item.player == game.player) {
			this.selectedUnits.push(item);
			if (!multipleSelection && !game.replay) {
				if (item.name == "commando") {
					sounds.play("commando_select");
				} else {
					sounds.play(item.type + "_select");
				}
			}
			if (item.type == "vehicles") {
				this.selectedVehicles.push(item);
			}
			if (item.primaryWeapon) {
				this.selectedAttackers.push(item);
			}
			if (item.name == "harvester") {
				this.selectedHarvesters.push(item);
			}
			if (item.type == "aircraft") {
				this.selectedAircraft.push(item);
			}
			if (item.type == "infantry") {
				this.selectedInfantry.push(item);
			}
			if (item.name == "engineer") {
				this.selectedEngineers.push(item);
			}
			if (item.name == "commando") {
				this.selectedCommandos.push(item);
			}
			if (item.name == "mcv") {
				this.selectedMCVs.push(item);
			}
		}
	},
	clearSelection: function() {
		for (var i = this.selectedItems.length - 1; i >= 0; i--) {
			this.selectedItems[i].selected = false;
			this.selectedItems.splice(i, 1);
		}
		for (var j = game.selectionArrays.length - 1; j >= 0; j--) {
			game[game.selectionArrays[j]].length = 0;
		}
	},
	click: function (ev, rightClick) {
		if (game.replay) {
			if (mouse.x >= 22 && mouse.x <= 124) {
				if (mouse.y >= 60 && mouse.y <= 85) {
					if (mouse.x >= 22 && mouse.x <= 52) {
						sounds.play("button");
						window[game.type].pauseReplay();
					} else if (mouse.x >= 56 && mouse.x <= 88) {
						sounds.play("button");
						window[game.type].resumeReplay();
					} else if (mouse.x >= 92 && mouse.x <= 124) {
						if (game.gameSpeed >= 8) {
							sounds.play("scold");
						} else {
							sounds.play("button");
							window[game.type].fastForwardReplay();
						}
					}
				} else if (mouse.y >= 94 && mouse.y <= 116) {
					sounds.play("button");
					window[game.type].exitReplay();
					return;
				} else if (game.type === "singleplayer" && mouse.y >= 126 && mouse.y <= 148) {
					sounds.play("button");
					singleplayer.resumeGameFromHere();
					return;
				}
			}
		}
		var clickedObject = mouse.objectUnderMouse;
		if (rightClick) {
			this.clearSelection();
			sidebar.repairMode = false;
			sidebar.deployMode = false;
			sidebar.sellMode = false;
			return;
		} else if (sidebar.deployMode) {
			if (sidebar.deploySpecial) {
				sidebar.finishDeployingSpecial();
			} else if (sidebar.deployBuilding) {
				if (sidebar.canBuildHere) {
					sidebar.finishDeployingBuilding();
				} else {
					sounds.play("cannot_deploy_here");
				}
			}
		} else if (!rightClick && !mouse.dragSelect) {
			var commandUids = [];
			if (clickedObject && clickedObject.name == "mcv" && mouse.cursor == mouse.cursors["build_command"] && !game.replay) {
				game.sendCommand([clickedObject.uid], {type: "deploy"});
			} else if (clickedObject && clickedObject.name == "apc" && mouse.cursor == mouse.cursors["build_command"] && !game.replay) {
				game.sendCommand([clickedObject.uid], {type: "unload"});
			} else if (clickedObject && clickedObject.name == "chinook" && mouse.cursor == mouse.cursors["build_command"] && !game.replay) {
				game.sendCommand([clickedObject.uid], {type: "unload"});
			} else if (clickedObject && mouse.cursor == mouse.cursors["sell"] && clickedObject.orders.type != "sell") {
				game.sendCommand([clickedObject.uid], {type: "sell"});
			} else if (clickedObject && clickedObject.name == "apc" && game.selectedInfantry.length > 0 && mouse.cursor == mouse.cursors["load"] && !game.replay) {
				for (var i = game.selectedInfantry.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedInfantry[i].uid);
				}
				if (game.selectedCommandos.length > 0) {
					sounds.play("commando_move");
				} else {
					sounds.play("infantry_move");
				}
				game.sendCommand(commandUids, {type: "load", uidto: clickedObject.uid});
				game.sendCommand([clickedObject.uid], {type: "load"});
			} else if (clickedObject && clickedObject.name == "chinook" && game.selectedInfantry.length > 0 && mouse.cursor == mouse.cursors["load"] && !game.replay) {
				for (var i = game.selectedInfantry.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedInfantry[i].uid);
				}
				if (game.selectedCommandos.length > 0) {
					sounds.play("commando_move");
				} else {
					sounds.play("infantry_move");
				}
				game.sendCommand(commandUids, {type: "load", uidto: clickedObject.uid});
				game.sendCommand([clickedObject.uid], {type: "load"});
			} else if (clickedObject && mouse.cursor == mouse.cursors["repair"]) {
				if (clickedObject.repairing) {
					game.sendCommand([clickedObject.uid], {type: "stop-repair"});
				} else {
					game.sendCommand([clickedObject.uid], {type: "repair"});
				}
			} else if (clickedObject && game.selectedCommandos.length > 0 && mouse.cursor == mouse.cursors["detonate"] && !game.replay) {
				for (var i = game.selectedCommandos.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedCommandos[i].uid);
				}
				sounds.play("commando_move");
				game.sendCommand(commandUids, {type: "infiltrate", uidto: clickedObject.uid})
			} else if (clickedObject && game.selectedEngineers.length > 0 && mouse.cursor == mouse.cursors["load"] && !game.replay) {
				for (var i = game.selectedEngineers.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedEngineers[i].uid);
				}
				sounds.play("infantry_move");
				game.sendCommand(commandUids, {type: "infiltrate", uidto: clickedObject.uid})
			} else if (clickedObject && game.selectedVehicles.length > 0 && clickedObject.player == game.player && clickedObject.name == "repair-facility" && !game.replay) {
				for (var i = game.selectedVehicles.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedVehicles[i].uid);
				}
				sounds.play("vehicles_move");
				game.sendCommand(commandUids, {
					type: "move",
					to: {
						x: Math.round(16 * mouse.gameX / game.gridSize) / 16,
						y: Math.round(16 * mouse.gameY / game.gridSize) / 16
					}
				})
			} else if (clickedObject && game.selectedHarvesters.length > 0 && clickedObject.name == "tiberium" && !game.replay) {
				for (var i = game.selectedHarvesters.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedHarvesters[i].uid);
				}
				sounds.play("vehicles_move");
				game.sendCommand(commandUids, {type: "harvest", uidtiberium: clickedObject.uid})
			} else if (clickedObject && game.selectedAircraft.length > 0 && clickedObject.player == game.player && clickedObject.name == "helipad" && !game.replay) {
				for (var i = game.selectedAircraft.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedAircraft[i].uid);
				}
				sounds.play("vehicles_move");
				game.sendCommand(commandUids, {type: "return", uidhelipad: clickedObject.uid})
			} else if (clickedObject && game.selectedHarvesters.length > 0 && clickedObject.player == game.player && clickedObject.name == "refinery" && !game.replay) {
				for (var i = game.selectedHarvesters.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedHarvesters[i].uid);
				}
				sounds.play("vehicles_move");
				game.sendCommand(commandUids, {type: "harvest-return", uidrefinery: clickedObject.uid})
			} else if (clickedObject && game.selectedAttackers.length > 0 && mouse.objectUnderMouse.player != game.player && !mouse.objectUnderMouse.unattackable && !game.replay) {
				for (var i = game.selectedAttackers.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedAttackers[i].uid);
				}
				if (game.selectedCommandos.length > 0) {
					sounds.play("commando_move");
				} else {
					sounds.play(game.selectedAttackers[0].type + "_move");
				}
				game.sendCommand(commandUids, {type: "attack", uidto: clickedObject.uid})
			} else if (clickedObject && !clickedObject.unselectable) {
				if (!ev.shiftKey) {
					this.clearSelection();
				}
				if (!clickedObject.unselectable) {
					this.selectItem(clickedObject, ev.shiftKey);
				}
			} else if (this.selectedUnits.length > 0 && !game.replay) {
				for (var i = game.selectedUnits.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedUnits[i].uid);
				}
				if (game.selectedCommandos.length > 0) {
					sounds.play("commando_move");
				} else {
					sounds.play(game.selectedUnits[0].type + "_move");
				}
				game.sendCommand(commandUids, {
					type: "move",
					to: {
						x: Math.round(16 * mouse.gameX / game.gridSize) / 16,
						y: Math.round(16 * mouse.gameY / game.gridSize) / 16
					}
				})
			}
		}
	},
	sendCommand: function (commandUids, command) {
		if (game.replay) {
			return
		}
		if (game.type === "singleplayer") {
			singleplayer.sendCommand(commandUids, command)
		} else {
			multiplayer.sendCommand(commandUids, command)
		}
	},
	getItemByUid: function (uid) {
		for (var i = game.items.length - 1; i >= 0; i--) {
			var item = game.items[i];
			if (item.uid === uid) {
				return item
			}
		}
	},
	receiveCommand: function (commandUids, command) {
		if (commandUids == "sidebar") {
			sidebar.processOrders(command);
			return
		}
		for (var i = commandUids.length - 1; i >= 0; i--) {
			var item = game.getItemByUid(commandUids[i]);
			if (item) {
				var orders = $.extend(true, {}, command);
				orders.to = orders.uidto ? game.getItemByUid(orders.uidto) : orders.to;
				orders.refinery = orders.uidrefinery ? game.getItemByUid(orders.uidrefinery) : undefined;
				orders.tiberium = orders.uidtiberium ? game.getItemByUid(orders.uidtiberium) : undefined;
				orders.helipad = orders.uidhelipad ? game.getItemByUid(orders.uidhelipad) : undefined;
				item.orders = orders;
				item.animationIndex = 0
			}
		}
	},
	reset: function() {
		game.foregroundContext.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
		game.backgroundContext.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
		mouse.context.clearRect(0, 0, game.canvasWidth, game.canvasHeight)
	},
	count: function (type, player, uid, name) {
		if (!player) {
			return game[type].length
		} else {
			if (!uid) {
				var count = 0;
				if (type) {
					for (var i = 0; i < game[type].length; i++) {
						if (game[type][i].player == player && (!name || name === game[type][i].name)) {
							count++
						}
					}
				} else {
					for (var i = 0; i < game.attackableItems.length; i++) {
						if (game.attackableItems[i].player == player) {
							count++
						}
					}
				}
				return count
			} else {
				var count = 0;
				for (var i = 0; i < game.attackableItems.length; i++) {
					if (game.attackableItems[i].player == player && game.attackableItems[i].uid == uid) {
						count++;
						break
					}
				}
				return count
			}
		}
	},
	keyPressed: function (ev) {
		if (!game.running && !videos.running) {
			return
		}
		var keyCode = ev.which;
		var ctrlPressed = ev.ctrlKey;
		if (videos.running) {
			if (keyCode == 27) {
				videos.stop()
			}
			return
		}
		if (game.running) {
			if (game.type == "multiplayer" && !game.replay) {
				$inputbox = $("#gameinterfacescreen .input-message");
				if (game.chatMode) {
					if (keyCode == 13 || keyCode == 27) {
						if (keyCode == 27) {
							$inputbox.hide();
							game.chatMode = false
						} else if (keyCode == 13) {
							if ($inputbox.val() != "") {
								multiplayer.sendMessageToPlayers($inputbox.val());
								$inputbox.val("");
								$inputbox.focus()
							} else {
								$inputbox.hide();
								game.chatMode = false
							}
						}
					} else {
						return
					}
				} else {
					if ((keyCode == 13 || keyCode == 115) && !game.chatMode) {
						game.chatMode = true;
						$inputbox.val("");
						$inputbox.show();
						$inputbox.focus()
					}
				}
			}
			if (keyCode >= 37 && keyCode <= 40) {
				if (keyCode >= 37 && keyCode <= 40) {
					switch (keyCode) {
						case 37:
							game.leftKeyPressed = true;
							break;
						case 38:
							game.upKeyPressed = true;
							break;
						case 39:
							game.rightKeyPressed = true;
							break;
						case 40:
							game.downKeyPressed = true;
							break
					}
				}
			} else if (keyCode >= 48 && keyCode <= 57) {
				var keyNumber = keyCode - 48;
				if (ctrlPressed) {
					if (game.selectedItems.length > 0) {
						game.controlGroups[keyNumber] = $.extend([], game.selectedItems);
						console.log("Control Group", keyNumber, "now has", game.controlGroups[keyNumber].length, "items")
					}
				} else {
					if (game.controlGroups[keyNumber]) {
						game.clearSelection();
						var lastUnit;
						for (var i = game.controlGroups[keyNumber].length - 1; i >= 0; i--) {
							var item = game.controlGroups[keyNumber][i];
							if (item.lifeCode == "dead") {
								game.controlGroups[keyNumber].splice(i, 1)
							} else {
								if (item.type == "infantry" || item.type == "vehicles") {
									lastUnit = item
								}
								game.selectItem(item, ev.shiftKey, true)
							}
						}
						if (lastUnit && !game.replay) {
							sounds.play(lastUnit.type + "_select")
						}
					}
				}
			} else if (keyCode == 71 && game.selectedAttackers.length) {
				var commandUids = [];
				for (var i = game.selectedAttackers.length - 1; i >= 0; i--) {
					commandUids.push(game.selectedAttackers[i].uid)
				}
				game.sendCommand(commandUids, {type: "guard"});
				sounds.play(game.selectedAttackers[0].type + "_move")
			} else if (keyCode == 32 && game.running) {
				if (game.type == "singleplayer") {
					singleplayer.gameOptions()
				} else {
					multiplayer.gameOptions()
				}
			} else if (keyCode == 72 && game.running) {
				var homeBase;
				for (var i = game.buildings.length - 1; i >= 0; i--) {
					if (game.buildings[i].player == game.player && game.buildings[i].name == "construction-yard") {
						homeBase = game.buildings[i];
						if (homeBase.primaryBuilding) {
							break
						}
					}
				}
				if (!homeBase) {
					for (var i = game.vehicles.length - 1; i >= 0; i--) {
						if (game.vehicles[i].player == game.player && game.vehicles[i].name == "mcv") {
							homeBase = game.vehicles[i]
						}
					}
				}
				if (homeBase) {
					var x = homeBase.x * game.gridSize;
					var y = homeBase.y * game.gridSize;
					game.viewportX = Math.max(0, Math.min(x - game.viewportWidth / 2, maps.currentMapImage.width - game.viewportWidth));
					game.viewportY = Math.max(0, Math.min(y - game.viewportHeight / 2, maps.currentMapImage.height - game.viewportHeight));
					game.viewportAdjustX = 0;
					game.viewportAdjustY = 0;
					game.viewportDeltaX = 0;
					game.viewportDeltaY = 0;
					game.refreshBackground = true
				}
			} else {
				return
			}
		}
		ev.preventDefault();
		ev.stopPropagation();
		return false
	},
	keyReleased: function (ev) {
		var keyCode = ev.which;
		if (keyCode >= 37 && keyCode <= 40) {
			switch (keyCode) {
				case 37:
					game.leftKeyPressed = false;
					break;
				case 38:
					game.upKeyPressed = false;
					break;
				case 39:
					game.rightKeyPressed = false;
					break;
				case 40:
					game.downKeyPressed = false;
					break
			}
		}
	}
};

var infantry = {
	type: "infantry",
	list: {
		minigunner: {
			name: "minigunner",
			label: "Minigunner",
			speed: 8,
			primaryWeapon: "m16",
			cost: 100,
			sight: 1,
			hitPoints: 50,
			spriteSheet: undefined,
			directions: 8,
			dependency: ["barracks|hand-of-nod"],
			constructedIn: ["barracks", "hand-of-nod"],
			owner: "both",
			spriteImages: [{
				name: "stand",
				count: 8
			} , {
				name: "guard",
				count: 8
			} , {
				name: "run",
				count: 6,
				direction: true
			} , {
				name: "fire",
				count: 8,
				direction: true
			} , {
				name: "down",
				count: 2,
				direction: true
			} , {
				name: "prone-move",
				count: 4,
				direction: true
			} , {
				name: "up",
				count: 2,
				direction: true
			} , {
				name: "prone-fire",
				count: 8,
				totalCount: 8,
				direction: true
			} , {
				name: "idle-1",
				count: 16
			} , {
				name: "idle-2",
				count: 16
			} , {
				name: "fist-combat-left",
				count: 47
			} , {
				name: "fist-combat-right",
				count: 47
			} , {
				name: "die-normal",
				count: 8
			} , {
				name: "die-frag",
				count: 8
			} , {
				name: "die-explode-close",
				count: 8
			} , {
				name: "die-explode-far",
				count: 12
			} , {
				name: "die-fire",
				count: 18
			} , {
				name: "wave",
				count: 3,
				direction: true
			} , {
				name: "greet",
				count: 3,
				direction: true
			} , {
				name: "salute",
				count: 3,
				direction: true
			} , {
				name: "bow",
				count: 3,
				direction: true
			} , {
				name: "prone",
				count: 1,
				totalCount: 4,
				direction: true,
				spriteCount: 144
			}]
		},
		grenadier: {
			name: "grenadier",
			label: "Grenadier",
			speed: 10,
			primaryWeapon: "grenade",
			cost: 160,
			sight: 1,
			hitPoints: 50,
			spriteSheet: undefined,
			directions: 8,
			dependency: ["barracks|hand-of-nod"],
			constructedIn: ["barracks", "hand-of-nod"],
			owner: "gdi",
			proneFireIndex: 6,
			fireIndex: 14,
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fire", count: 20, direction: true}, {
				name: "down",
				count: 2,
				direction: true
			}, {name: "prone-move", count: 4, direction: true}, {
				name: "up",
				count: 2,
				direction: true
			}, {name: "prone-fire", count: 8, totalCount: 12, direction: true}, {
				name: "die-normal",
				count: 8
			}, {name: "die-frag", count: 8}, {name: "die-explode-close", count: 8}, {
				name: "die-explode-far",
				count: 12
			}, {name: "die-fire", count: 18}, {name: "wave", count: 3, direction: true}, {
				name: "greet",
				count: 3,
				direction: true
			}, {name: "salute", count: 3, direction: true}, {name: "bow", count: 3, direction: true}, {
				name: "prone",
				count: 1,
				totalCount: 4,
				direction: true,
				spriteCount: 144
			}]
		},
		bazooka: {
			name: "bazooka",
			label: "Bazooka",
			speed: 8,
			primaryWeapon: "rocket",
			cost: 300,
			sight: 2,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			dependency: ["barracks|hand-of-nod"],
			constructedIn: ["barracks", "hand-of-nod"],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fire", count: 8, direction: true}, {
				name: "down",
				count: 2,
				direction: true
			}, {name: "prone-move", count: 4, direction: true}, {
				name: "up",
				count: 2,
				direction: true
			}, {name: "prone-fire", count: 10, totalCount: 10, direction: true}, {
				name: "idle-1",
				count: 16
			}, {name: "idle-2", count: 16}, {name: "fist-combat-left", count: 47}, {
				name: "fist-combat-right",
				count: 47
			}, {name: "die-normal", count: 8}, {name: "die-frag", count: 8}, {
				name: "die-explode-close",
				count: 8
			}, {name: "die-explode-far", count: 12}, {name: "die-fire", count: 18}, {
				name: "wave",
				count: 3,
				direction: true
			}, {name: "greet", count: 3, direction: true}, {name: "salute", count: 3, direction: true}, {
				name: "bow",
				count: 3,
				direction: true
			}, {name: "prone", count: 1, totalCount: 4, direction: true, spriteCount: 144}]
		},
		"flame-thrower": {
			name: "flame-thrower",
			label: "Flame Thrower",
			speed: 10,
			primaryWeapon: "infantryflamer",
			cost: 200,
			sight: 1,
			hitPoints: 70,
			spriteSheet: undefined,
			directions: 8,
			dependency: ["barracks|hand-of-nod"],
			constructedIn: ["barracks", "hand-of-nod"],
			owner: "nod",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fire", count: 16, direction: true}, {
				name: "down",
				count: 2,
				direction: true
			}, {name: "prone-move", count: 4, direction: true}, {
				name: "up",
				count: 2,
				direction: true
			}, {name: "prone-fire", count: 16, totalCount: 16, direction: true}, {
				name: "idle-1",
				count: 16
			}, {name: "idle-2", count: 16}, {name: "die-normal", count: 8}, {
				name: "die-frag",
				count: 8
			}, {name: "die-explode-close", count: 8}, {name: "die-explode-far", count: 12}, {
				name: "die-fire",
				count: 18
			}, {name: "prone", count: 1, totalCount: 16, direction: true, spriteCount: 256}]
		},
		"chem-warrior": {
			name: "chem-warrior",
			label: "Chem Warrior",
			speed: 8,
			primaryWeapon: "chemspray",
			cost: 300,
			sight: 1,
			hitPoints: 70,
			spriteSheet: undefined,
			directions: 8,
			dependency: ["barracks|hand-of-nod", "communications-center"],
			constructedIn: ["barracks", "hand-of-nod"],
			owner: "nod",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fire", count: 16, direction: true}, {
				name: "down",
				count: 2,
				direction: true
			}, {name: "prone-move", count: 4, direction: true}, {
				name: "up",
				count: 2,
				direction: true
			}, {name: "prone-fire", count: 16, totalCount: 16, direction: true}, {
				name: "idle-1",
				count: 16
			}, {name: "idle-2", count: 16}, {name: "die-normal", count: 8}, {
				name: "die-frag",
				count: 8
			}, {name: "die-explode-close", count: 8}, {name: "die-explode-far", count: 12}, {
				name: "die-fire",
				count: 18
			}, {name: "prone", count: 1, totalCount: 16, direction: true, spriteCount: 256}]
		},
		commando: {
			name: "commando",
			label: "Commando",
			speed: 10,
			primaryWeapon: "sniper",
			cost: 1e3,
			sight: 5,
			hitPoints: 80,
			spriteSheet: undefined,
			directions: 8,
			canInfiltrate: true,
			dependency: ["barracks|hand-of-nod", "communications-center"],
			constructedIn: ["barracks", "hand-of-nod"],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fire", count: 4, direction: true}, {
				name: "down",
				count: 2,
				direction: true
			}, {name: "prone-move", count: 4, direction: true}, {
				name: "up",
				count: 2,
				direction: true
			}, {name: "prone-fire", count: 4, totalCount: 4, direction: true}, {
				name: "idle-1",
				count: 16
			}, {name: "idle-2", count: 16}, {name: "die-normal", count: 8}, {
				name: "die-frag",
				count: 8
			}, {name: "die-explode-close", count: 8}, {name: "die-explode-far", count: 12}, {
				name: "die-fire",
				count: 18
			}, {name: "prone", count: 1, totalCount: 4, direction: true, spriteCount: 160}]
		},
		engineer: {
			name: "engineer",
			label: "Engineer",
			speed: 8,
			cost: 500,
			sight: 2,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			dependency: ["barracks|hand-of-nod"],
			constructedIn: ["barracks", "hand-of-nod"],
			owner: "both",
			canInfiltrate: true,
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "down", count: 2, direction: true}, {name: "prone-move", count: 4, direction: true}, {
				name: "up",
				count: 2,
				direction: true
			}, {name: "idle-1", count: 16}, {name: "die-normal", count: 8}, {
				name: "die-frag",
				count: 8
			}, {name: "die-explode-close", count: 8}, {name: "die-explode-far", count: 12}, {
				name: "die-fire",
				count: 18
			}, {name: "wave", count: 3, direction: true}, {name: "greet", count: 3, direction: true}, {
				name: "salute",
				count: 3,
				direction: true
			}, {name: "prone", count: 1, totalCount: 4, spriteCount: 66, direction: true}]
		},
		"civilian-1": {
			name: "civilian-1",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: "pistol",
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-2": {
			name: "civilian-2",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: undefined,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-3": {
			name: "civilian-3",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: undefined,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-4": {
			name: "civilian-4",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: undefined,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-5": {
			name: "civilian-5",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: undefined,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-6": {
			name: "civilian-6",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: undefined,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-7": {
			name: "civilian-7",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: "pistol",
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-8": {
			name: "civilian-9",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: undefined,
			hitPoints: 25,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-9": {
			name: "civilian-9",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: "pistol",
			hitPoints: 5,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		},
		"civilian-10": {
			name: "civilian-10",
			label: "Civilian",
			speed: 10,
			cost: 10,
			sight: 0,
			primaryWeapon: undefined,
			hitPoints: 50,
			spriteSheet: undefined,
			directions: 8,
			constructedIn: [],
			owner: "both",
			spriteImages: [{name: "stand", count: 8}, {name: "guard", count: 8, spriteCount: 0}, {
				name: "prone",
				count: 1,
				totalCount: 6,
				direction: true,
				spriteCount: 8
			}, {name: "prone-move", count: 6, direction: true, spriteCount: 8}, {
				name: "run",
				count: 6,
				direction: true
			}, {name: "fist-combat-left", count: 43}, {name: "fist-combat-right", count: 42}, {
				name: "idle-1",
				count: 10
			}, {name: "idle-2", count: 6}, {name: "fire", count: 4, direction: true}, {
				name: "prone-fire",
				count: 4,
				direction: true,
				spriteCount: 205
			}, {name: "executed", count: 6, spriteCount: 277}, {
				name: "die-normal",
				count: 8,
				spriteCount: 329
			}, {name: "die-frag", count: 8, spriteCount: 337}, {
				name: "die-explode-close",
				count: 8,
				spriteCount: 337
			}, {name: "die-explode-far", count: 12, spriteCount: 345}, {name: "die-fire", count: 18, spriteCount: 357}]
		}
	},
	defaults: {
		action: "stand",
		z: 0,
		orders: {type: "stand"},
		direction: 4,
		armor: 0,
		animationIndex: 0,
		fireIndex: 0,
		proneFireIndex: 0,
		selected: false,
		lastMovementX: 0,
		lastMovementY: 0,
		nearCount: 0,
		crushable: true,
		pixelOffsetX: -26,
		pixelOffsetY: -16,
		selectOffsetX: -16,
		selectOffsetY: -10,
		pixelHeight: 39,
		pixelWidth: 50,
		softCollisionRadius: 4,
		hardCollisionRadius: 2,
		path: undefined,
		turnTo: function (toDirection) {
			var turnDirection = angleDiff(this.direction, toDirection, this.directions);
			if (turnDirection) {
				var turnAmount = turnDirection / Math.abs(turnDirection);
				this.direction = wrapDirection(this.direction + turnAmount, this.directions)
			}
		},
		checkCollision: checkCollision,
		moveTo: moveTo,
		canAttackEnemy: canAttackEnemy,
		findEnemyInRange: findEnemyInRange,
		hasReached: function() {
			if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < 9) {
				if (this.colliding) {
					this.nearCount++
				}
			} else {
				this.nearCount = 0
			}
			if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < .25 || Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < 1 && this.nearCount > 10 || Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < 4 && this.nearCount > 20 || Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < 9 && this.nearCount > 30) {
				this.nearCount = 0;
				return true
			}
			return false
		},
		processOrders: function() {
			this.lifeCode = getLifeCode(this);
			if (this.lifeCode == "dead" && this.orders.type != "die") {
				this.unselectable = true;
				if (this.selected) {
					game.selectItem(this, true)
				}
				this.orders = {type: "die"};
				this.action = this.infantryDeath;
				this.animationIndex = 0;
				switch (this.infantryDeath) {
					case"die-normal":
					case"die-frag":
					case"die-explode-close":
					case"die-explode-far":
						sounds.play("infantry_die");
						break;
					case"die-fire":
						sounds.play("infantry_die_fire");
						break;
					case"die-squish":
						this.action = "die-normal";
						sounds.play("infantry_die_squish");
						break
				}
			}
			this.lastMovementX = 0;
			this.lastMovementY = 0;
			this.firing = false;
			if (this.weapon && this.weapon.cooldown > 0) {
				this.weapon.cooldown--
			}
			if (this.attacked) {
				this.attacked = false;
				this.prone = true;
				this.attackedCycles = 50
			}
			if (this.prone) {
				this.attackedCycles--;
				if (this.attackedCycles <= 0) {
					this.prone = false
				}
			}
			var newDirection;
			var nearestEnemy;
			switch (this.orders.type) {
				case"stand":
					if (this.prone) {
						this.action = "prone"
					} else {
						this.action = "stand"
					}
					this.moving = false;
					if (this.weapon) {
						var enemy = this.findEnemyInRange();
						if (enemy) {
							this.orders = {type: "attack", to: enemy, lastOrder: {type: this.orders.type}}
						}
					}
					break;
				case"move":
					this.moving = true;
					if (this.hasReached()) {
						if (this.orders.lastOrder) {
							this.orders = this.orders.lastOrder
						} else {
							this.orders = {type: "stand"}
						}
					} else {
						if (this.prone) {
							this.action = "prone-move"
						} else {
							this.action = "run"
						}
						if (!this.moveTo(this.orders.to)) {
							this.orders = {type: "stand"}
						}
					}
					break;
				case"attack":
					if (!this.orders.to || this.orders.to.lifeCode == "dead" || this.orders.to.player == this.player || !this.canAttackEnemy(this.orders.to)) {
						if (this.orders.lastOrder) {
							this.orders = this.orders.lastOrder
						} else {
							this.orders = {type: "guard"}
						}
						return
					}
					if (Math.pow(this.orders.to.cgX - this.x, 2) + Math.pow(this.orders.to.cgY - this.y, 2) < Math.pow(this.weapon.range - 1 + this.orders.to.hardCollisionRadius / game.gridSize, 2)) {
						this.moving = false;
						if (this.action == "prone-move" || this.action == "run") {
							this.animationIndex = 0;
							if (this.prone) {
								this.action = "prone"
							} else {
								this.action = "stand"
							}
						}
						newDirection = findAngle(this.orders.to, this, this.directions);
						if (newDirection != this.direction) {
							if (this.prone) {
								this.action = "prone"
							} else {
								this.action = "guard"
							}
							this.turnTo(newDirection)
						} else {
							if (this.weapon.cooldown <= 0) {
								if (this.action != "prone-fire" && this.action != "fire") {
									this.animationIndex = 0
								}
								if (this.prone) {
									this.action = "prone-fire";
									if (this.proneFireIndex == this.animationIndex) {
										this.weapon.fire(this, this.direction, this.orders.to)
									}
								} else {
									this.action = "fire";
									if (this.fireIndex == this.animationIndex) {
										this.weapon.fire(this, this.direction, this.orders.to)
									}
								}
							}
						}
					} else {
						this.moving = true;
						if (this.prone) {
							this.action = "prone-move"
						} else {
							this.action = "run"
						}
						if (!this.moveTo(this.orders.to)) {
							if (this.orders.lastOrder) {
								this.orders = this.orders.lastOrder
							} else {
								this.orders = {type: "guard"}
							}
						}
					}
					break;
				case"area guard":
					if (!this.orders.to) {
						this.orders.to = {x: this.x, y: this.y}
					}
					if (this.weapon) {
						nearestEnemy = this.findEnemyInRange();
						if (nearestEnemy) {
							this.orders = {type: "attack", lastOrder: this.orders, to: nearestEnemy};
							return
						}
					} else {
						this.orders = {type: "panic"}
					}
					if (this.orders.to && !this.hasReached() && this.moveTo(this.orders.to)) {
						this.moving = true;
						if (this.prone) {
							this.action = "prone-move"
						} else {
							this.action = "run"
						}
					} else {
						if (this.prone) {
							this.action = "prone"
						} else {
							this.action = "guard"
						}
						this.moving = false
					}
					break;
				case"guard":
				case"hunt":
					if (this.weapon) {
						nearestEnemy = this.findEnemyInRange();
						if (nearestEnemy) {
							this.orders = {type: "attack", lastOrder: this.orders, to: nearestEnemy};
							return
						} else {
							if (this.prone) {
								this.action = "prone"
							} else {
								this.action = "guard"
							}
							this.moving = false
						}
					} else {
						this.orders = {type: "panic"}
					}
					break;
				case"die":
					break;
				case"sticky":
					if (this.prone) {
						if (this.weapon) {
						} else {
							this.orders = {type: "panic"}
						}
					}
					break;
				case"panic":
					this.prone = true;
					this.action = "prone-move";
					if (!this.orders.to || this.hasReached() || !this.moveTo(this.orders.to)) {
						this.orders.to = {x: this.x + game.gameTick % 5 - 2, y: this.y + game.gameTick % 3 - 1}
					}
					break;
				case"load":
					if (!this.orders.to || this.orders.to.lifeCode == "dead" || this.orders.to.cargo.length >= this.orders.to.maxCargo) {
						this.orders = {type: "stand"};
						break
					}
					var target = {x: this.orders.to.cgX, y: this.orders.to.cgY + .4};
					var distanceFromTarget = Math.sqrt(Math.pow(target.x - this.x, 2) + Math.pow(target.y - this.y, 2));
					this.distanceFromTarget = distanceFromTarget;
					if (distanceFromTarget < 3) {
						this.orders.to.orders = {type: "load"}
					}
					if (distanceFromTarget < 1.3) {
						this.moving = false;
						newDirection = findAngle(this.orders.to, this, this.directions);
						if (newDirection != this.direction) {
							if (this.prone) {
								this.action = "prone-move"
							} else {
								this.action = "run"
							}
							this.turnTo(newDirection)
						} else {
							if (this.orders.to.action == "load") {
								this.orders.to.cargo.push(this);
								this.orders.to.orders = {type: "finish-load"};
								this.orders = {type: "stand"};
								game.remove(this)
							} else {
								this.orders.to.orders = {type: "load"}
							}
						}
					} else {
						this.moving = true;
						if (this.prone) {
							this.action = "prone-move"
						} else {
							this.action = "run"
						}
						if (!this.moveTo(target)) {
							this.orders = {type: "stand"}
						}
					}
					break;
				case"infiltrate":
					if (!this.orders.to || this.orders.to.lifeCode == "dead" || this.orders.to.player == this.player) {
						this.orders = {type: "stand"};
						break
					}
					var destination = {};
					destination.y = this.orders.to.y + this.orders.to.gridShape.length - .5;
					destination.cgX = this.orders.to.cgX;
					if (this.x < this.orders.to.cgX) {
						destination.x = this.orders.to.x + .5
					} else {
						destination.x = this.orders.to.x + this.orders.to.gridShape[0].length - .5
					}
					var distanceCorner = Math.pow(destination.x - this.x, 2) + Math.pow(destination.y - this.y, 2);
					var distanceCG = Math.pow(destination.cgX - this.x, 2) + Math.pow(destination.y - this.y, 2);
					if (this.name == "engineer") {
						if (distanceCorner < 1 || distanceCG < 1) {
							if (!this.orders.counter) {
								this.orders.counter = 5
							} else {
								this.orders.counter--;
								if (this.orders.counter > 1) {
									this.moveToDestination()
								} else {
									if (this.orders.to.team == "gdi") {
										sounds.play("gdi_building_captured")
									} else {
										sounds.play("nod_building_captured")
									}
									this.orders.to.originalteam = this.orders.to.originalteam || this.orders.to.team;
									this.orders.to.player = this.player;
									this.orders.to.team = this.team;
									game.remove(this)
								}
							}
						} else {
							this.moveToDestination()
						}
					} else {
						if (distanceCorner < 1.5 || distanceCG < 1.5) {
							if (!this.orders.counter) {
								sounds.play("commando_bomb");
								this.orders.counter = 25
							} else {
								this.orders.counter--;
								if (this.orders.counter > 2 && distanceCorner > 1 && distanceCG > 1) {
									this.moveToDestination()
								} else if (this.orders.counter > 1) {
									if (this.prone) {
										this.action = "prone"
									} else {
										this.action = "stand"
									}
								} else {
									this.orders.to.timeBomb = 20;
									this.orders = {type: "move", to: findClosestEmptySpot(this, {minimumRadius: 2})}
								}
							}
						} else {
							this.moveToDestination()
						}
					}
					break
			}
		},
		moveToDestination: function() {
			this.moving = true;
			if (this.prone) {
				this.action = "prone-move"
			} else {
				this.action = "run"
			}
			if (!this.moveTo(this.orders.to)) {
				this.moving = "false";
				newDirection = findAngle(this.orders.to, this, this.directions);
				this.turnTo(newDirection);
				if (this.prone) {
					this.action = "prone"
				} else {
					this.action = "stand"
				}
			}
		},
		drawSelection: function() {
			var x = this.selectOffsetX - this.pixelOffsetX;
			var y = this.selectOffsetY - this.pixelOffsetY;
			this.context.drawImage(this.selectImage, x, y);
			var selectBarHeight = 3;
			var selectBarWidth = 12;
			this.context.beginPath();
			this.context.rect(x + 9, y - selectBarHeight, selectBarWidth * this.life / this.hitPoints, selectBarHeight);
			if (this.lifeCode == "healthy") {
				this.context.fillStyle = "lightgreen"
			} else if (this.lifeCode == "damaged") {
				this.context.fillStyle = "yellow"
			} else {
				this.context.fillStyle = "red"
			}
			this.context.fill();
			this.context.beginPath();
			this.context.strokeStyle = "black";
			this.context.rect(x + 9, y - selectBarHeight, selectBarWidth, selectBarHeight);
			this.context.stroke()
		},
		preRender: function() {
			/*var x = 0;
			var y = 0;
			this.context.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
			this.context.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);*/

			this.context.clearRect(0, 0, this.pixelWidth, this.pixelHeight);
			this.context.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, 0, 0, this.pixelWidth, this.pixelHeight);

			if (this.selected) {
				this.drawSelection();
			}
		},
		draw: function() {
			if (this.action == "hide") {
				return;
			}
			var interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
			var interpolatedY = this.y + game.movementInterpolationFactor * this.lastMovementY;
			var x = Math.round(interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(interpolatedY * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth + this.pixelWidth || y > game.viewportHeight + this.pixelHeight) {
				return;
			}
			game.foregroundContext.drawImage(this.canvas, x + this.pixelOffsetX, y + this.pixelOffsetY);
		},
		animate: function() {
			this.cgX = this.x;
			this.cgY = this.y;
			this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
			switch (this.action) {
				case"run":
				case"fire":
				case"prone":
				case"prone-move":
				case"prone-fire":
				case"down":
				case"up":
					this.imageList = this.spriteArray[this.action + "-" + this.direction];
					if (!this.imageList) {
						alert("no action called : " + this.action)
					}
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						if (this.action == "up") {
							this.action = "stand"
						}
						if (this.action == "down") {
							this.action = "prone"
						}
						if (this.action == "fire") {
							this.action = "guard"
						}
						if (this.action == "prone-fire") {
							this.action = "prone"
						}
					}
					break;
				case"die-normal":
				case"die-frag":
				case"die-explode-close":
				case"die-explode-far":
				case"die-fire":
					this.imageList = this.spriteArray[this.action];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						if (!this.deadCount) {
							this.deadCount = 0
						}
						this.deadCount++;
						this.animationIndex = this.imageList.count - 1;
						if (this.deadCount >= 15) {
							game.remove(this);
							game.kills[this.attackedBy]++;
							game.deaths[this.player]++
						}
					}
					break;
				case"guard":
					this.imageList = this.spriteArray["guard"];
					if (!this.imageList) {
						alert(this.name)
					}
					this.imageOffset = this.imageList.offset + this.direction;
					break;
				case"stand":
					this.imageList = this.spriteArray["stand"];
					this.imageOffset = this.imageList.offset + this.direction;
					break;
				case"hide":
					break;
				default:
					alert("no action called : " + this.action);
					console.log(this.name);
					break
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		if (details.percentLife) {
			item.life = item.hitPoints * details.percentLife;
			delete item.percentLife
		} else {
			item.life = item.hitPoints
		}
		$.extend(item, details);
		if (item.primaryWeapon) {
			item.weapon = weapons.add({name: item.primaryWeapon})
		}
		item.canvas = document.createElement("canvas");
		item.canvas.width = item.pixelWidth;
		item.canvas.height = item.pixelHeight;
		item.context = item.canvas.getContext("2d");
		return item
	},
	load: function (name) {
		var item = this.list[name];
		console.log("Loading", name, "...");
		item.type = this.type;
		item.spriteCanvas = document.createElement("canvas");
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function (image) {
			createSpriteSheetCanvas(image, item.spriteCanvas, "grayscale")
		});
		item.selectImage = sidebar.selectImageSmall;
		item.spriteArray = [];
		item.spriteCount = 0;
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var totalImageCount = item.spriteImages[i].totalCount || item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (typeof item.spriteImages[i].spriteCount !== "undefined") {
				item.spriteCount = item.spriteImages[i].spriteCount
			}
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += totalImageCount
				}
			} else {
				if (typeof item.spriteImages[i].spriteCount !== "undefined") {
					item.spriteCount = item.spriteImages[i].spriteCount
				}
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var maps = {
	gdi: ["scg01ea", "scg02ea", "scg03ea"],
	nod: ["scb01ea", "scb02ea"],
	multiplayer: ["green-acres", "sand-trap", "lost-arena", "river-raid", "eye-of-the-storm"],
	load: function (mapName, onloadEventHandler, savedGame) {
		$.ajax({
			url: "maps/" + mapName + ".js", dataType: "json", success: function (data) {
				maps.loadMapData(mapName, data, onloadEventHandler, savedGame)
			}, error: function (data, status) {
				menus.showMessageBox(status, data, function() {
					menus.show("game-type")
				})
			}
		})
	},
	draw: function() {
		if (game.refreshBackground) {
			game.backgroundContext.drawImage(maps.currentMapImage, game.viewportX, game.viewportY, game.viewportWidth - 1, game.viewportHeight, game.viewportLeft, game.viewportTop, game.viewportWidth, game.viewportHeight - 1);
			game.refreshBackground = false
		}
	},
	currentMapData: undefined,
	loadMapData: function (mapName, data, onloadEventHandler, savedGame) {
		game.backgroundContext.fillStyle = "black";
		game.backgroundContext.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
		game.foregroundContext.fillStyle = "black";
		game.foregroundContext.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
		mouse.context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
		maps.currentMapData = data;
		maps.currentMapImage = loader.loadImage("images/maps/" + mapName + ".jpg");
		game.resetTypes();
		maps.currentMapTerrain = [];
		for (var i = 0; i < data.height; i++) {
			maps.currentMapTerrain[i] = Array(data.width);
		}
		if (data.videos) {
			for (var videoType in data.videos) {
				videos.load(data.videos[videoType]);
			}
		}
		var terrainTypes = Object.keys(data.terrain).sort();
		for (var tt = terrainTypes.length - 1; tt >= 0; tt--) {
			var terrainType = terrainTypes[tt];
			var terrainArray = data.terrain[terrainType];
			for (var i = terrainArray.length - 1; i >= 0; i--) {
				maps.currentMapTerrain[terrainArray[i][1]][terrainArray[i][0]] = terrainType;
			}
		}
		if (game.type === "multiplayer" || data.name == "testbed") {
			data.requirements = $.extend(data.requirements, {
				infantry: ["minigunner", "engineer", "bazooka", "grenadier", "flame-thrower", "chem-warrior", "commando"],
				vehicles: ["apc", "flame-tank", "stealth-tank", "mammoth-tank", "harvester", "mcv", "jeep", "recon-bike", "buggy", "light-tank", "medium-tank", "mobile-rocket-launch-system", "ssm-launcher", "artillery"],
				aircraft: ["orca", "apache", "chinook"],
				turrets: ["gun-turret", "guard-tower", "obelisk", "advanced-guard-tower", "sam-site"],
				buildings: ["refinery", "construction-yard", "power-plant", "helipad", "advanced-power-plant", "barracks", "tiberium-silo", "communications-center", "advanced-communications-tower", "temple-of-nod", "hand-of-nod", "airstrip", "weapons-factory", "repair-facility"],
				tiberium: ["tiberium"],
				walls: ["sandbag", "chain-link", "concrete-wall"],
				special: ["nuclear-strike", "ion-cannon"]
			});
			data.buildable = {
				infantry: ["bazooka", "grenadier", "engineer", "minigunner", "flame-thrower", "chem-warrior", "commando"],
				turrets: ["gun-turret", "guard-tower", "obelisk", "advanced-guard-tower", "sam-site"],
				aircraft: ["orca", "apache", "chinook"],
				buildings: ["power-plant", "advanced-power-plant", "communications-center", "advanced-communications-tower", "temple-of-nod", "tiberium-silo", "barracks", "hand-of-nod", "refinery", "airstrip", "weapons-factory", "repair-facility", "helipad"],
				vehicles: ["apc", "stealth-tank", "flame-tank", "mammoth-tank", "harvester", "jeep", "recon-bike", "buggy", "light-tank", "medium-tank", "mcv", "mobile-rocket-launch-system", "ssm-launcher", "artillery"],
				walls: ["sandbag", "chain-link", "concrete-wall"],
				special: ["nuclear-strike", "ion-cannon"]
			}
		}
		if (game.type === "multiplayer") {
			data.startingunits = {
				nod: {
					vehicles: [{name: "buggy", dx: 0, dy: .5, direction: 16}, {
						name: "mcv",
						dx: 2,
						dy: .5,
						direction: 16
					}],
					infantry: [{name: "minigunner", dx: 4.25, dy: .25}, {
						name: "minigunner",
						dx: 4.75,
						dy: .75
					}, {name: "minigunner", dx: 4.75, dy: .25}, {name: "minigunner", dx: 4.25, dy: .75}]
				},
				gdi: {
					vehicles: [{name: "jeep", dx: 0, dy: .5, direction: 16}, {
						name: "mcv",
						dx: 2,
						dy: .5,
						direction: 16
					}],
					infantry: [{name: "minigunner", dx: 4.25, dy: .25}, {
						name: "minigunner",
						dx: 4.75,
						dy: .75
					}, {name: "minigunner", dx: 4.75, dy: .25}, {name: "minigunner", dx: 4.25, dy: .75}]
				}
			}
		}
		var requirementsTypes = Object.keys(data.requirements).sort();
		for (var rt = requirementsTypes.length - 1; rt >= 0; rt--) {
			var type = requirementsTypes[rt];
			var requirementArray = data.requirements[type];
			for (var i = 0; i < requirementArray.length; i++) {
				var name = requirementArray[i];
				if (window[type]) {
					window[type].load(name);
				} else {
					console.log("Not loading type :", type);
				}
			}
		}
		if (game.type === "singleplayer") {
			singleplayer.initializeLevel(data);
			game.viewportX = data.x * game.gridSize;
			game.viewportY = data.y * game.gridSize;
		} else {
			multiplayer.initializeLevel(data);
		}
		fog.init();
		if (loader.loaded) {
			onloadEventHandler();
		} else {
			loader.onload = onloadEventHandler;
		}
	}
};

var menus = {
	list: {
		"game-type": {
			background: "none", images: ["game-type-menu.png"], onshow: function() {
				setTimeout(game.reset, 200)
			}
		},
		"select-campaign": {
			background: "black",
			images: ["select-transmission-animation.gif", "select-transmission.png"],
			onshow: function() {
				sounds.startStruggle()
			}
		},
		"message-box": {background: "none", images: ["message-box.jpg"]},
		"load-mission": {background: "none", images: ["load-mission-menu.png"]},
		"replay-game": {
			background: "none", images: ["replay-game-menu.png"], onshow: function() {
				setTimeout(game.reset, 200)
			}
		},
		"delete-mission": {background: "none", images: ["delete-mission-menu.png"]},
		"save-mission": {background: "none", images: ["save-mission-menu.png"]},
		"singleplayer-game-options": {background: "none", images: ["game-options-menu.png"]},
		"multiplayer-game-options": {background: "none", images: ["multiplayer-game-options-menu.png"]},
		"abort-mission": {background: "none", images: ["abort-mission-menu.png"]},
		"restate-mission": {background: "none", images: ["restate-mission-menu.png"]},
		"game-controls": {background: "none", images: ["game-controls-menu.png", "slider.png"]},
		"mission-ended": {background: "none"},
		"sound-controls": {background: "none", images: ["sound-controls-menu.png", "slider-small.png"]},
		"join-network-game": {
			background: "none", images: ["join-network-game-menu.png"], onshow: function() {
				$("#join-network-game-menu-div .player-name").focus();
				$("#join-network-game-menu-div input").attr("disabled", false)
			}
		},
		"start-network-game": {
			background: "none", images: ["start-network-game-menu.png"], onshow: function() {
				$("#start-network-game-menu-div input").attr("disabled", false)
			}
		},
		"joined-network-game": {background: "none", images: ["joined-network-game-menu.png"]}
	},
	notYetImplemented: function (feature) {
		var plural = feature.substring(feature.length - 1) == "s";
		menus.showMessageBox(feature + " " + (plural ? "Are" : "Is") + " Coming Soon", feature + " " + (plural ? "have" : "has") + " not yet been implemented completely.")
	},
	load: function() {
		for (var menuName in menus.list) {
			var menu = menus.list[menuName];
			if (menu.images) {
				for (var i = menu.images.length - 1; i >= 0; i--) {
					loader.loadImage("images/menu/" + menu.images[i])
				}
			}
		}
		$("#game-type-menu-div .singleplayer-game").click(singleplayer.start);
		$("#game-type-menu-div .load-game").click(function() {
			$("#load-mission-menu-div .cancel-button").unbind("click").click(function() {
				menus.show("game-type")
			});
			singleplayer.updateSavedMissionList();
			menus.show("load-mission")
		});
		$("#singleplayer-game-options-menu-div .load-mission-button").click(function() {
			$("#load-mission-menu-div .cancel-button").unbind("click").click(function() {
				menus.show("singleplayer-game-options")
			});
			singleplayer.updateSavedMissionList();
			menus.show("load-mission")
		});
		$("#load-mission-menu-div .load-button").click(function() {
			singleplayer.loadMission($("#load-mission-menu-div .mission-list").prop("selectedIndex"))
		});
		$("#game-type-menu-div .multiplayer-game").click(function() {
			multiplayer.start()
		});
		$("#game-type-menu-div .view-game-replay").click(function() {
			singleplayer.updateSavedMissionList();
			multiplayer.updateSavedMissionList();
			menus.show("replay-game")
		});
		$("#replay-game-menu-div .load-button").click(function() {
			var replayIndex = $("#replay-game-menu-div .mission-list").prop("selectedIndex");
			if (replayIndex > -1) {
				var savedGames = [];
				var savedGamesString = localStorage.savedGames;
				if (savedGamesString) {
					savedGames = JSON.parse(savedGamesString)
				}
				if (replayIndex < savedGames.length) {
					singleplayer.loadMission(replayIndex, true)
				} else {
					multiplayer.loadMultiplayerReplay(replayIndex - savedGames.length)
				}
			} else {
				menus.showMessageBox("Nothing Selected", "Please select a saved game to replay")
			}
		});
		$("#replay-game-menu-div .cancel-button").click(function() {
			menus.show("game-type")
		});
		$("#replay-game-menu-div .save-button").click(function() {
			var replayIndex = $("#replay-game-menu-div .mission-list").prop("selectedIndex");
			if (replayIndex > -1) {
				var savedGames = [];
				var savedGamesString = localStorage.savedGames;
				if (savedGamesString) {
					savedGames = JSON.parse(savedGamesString)
				}
				var savedGame;
				if (replayIndex < savedGames.length) {
					savedGame = JSON.stringify(savedGames[replayIndex])
				} else {
					savedGame = localStorage.lastMultiplayerGame
				}
				window.location = "data:application/x-json;base64," + btoa(savedGame)
			} else {
				menus.showMessageBox("Nothing Selected", "Please select a game to save")
			}
		});
		$("#select-campaign-menu-div .gdi-campaign").click(function() {
			singleplayer.beginCampaign("gdi");
			sounds.stopStruggle()
		});
		$("#select-campaign-menu-div .nod-campaign").click(function() {
			singleplayer.beginCampaign("nod");
			sounds.stopStruggle()
		});
		$("#multiplayer-game-options-menu-div .resume-game-button").click(menus.hide);
		$("#multiplayer-game-options-menu-div .sound-controls-button").click(function() {
			menus.show("sound-controls")
		});
		$("#multiplayer-game-options-menu-div .abort-game-button").click(multiplayer.surrender);
		$("#singleplayer-game-options-menu-div .resume-mission-button").click(singleplayer.resumeLevel);
		$("#singleplayer-game-options-menu-div .abort-mission-button").click(function() {
			menus.show("abort-mission")
		});
		$("#abort-mission-menu-div .yes-button").click(function() {
			sounds.play("battle_control_terminated");
			singleplayer.exitLevel()
		});
		$("#abort-mission-menu-div .restart-button").click(function() {
			menus.hide();
			sounds.stopMusic();
			game.reset();
			singleplayer.loadLevel()
		});
		$("#abort-mission-menu-div .no-button").click(function() {
			menus.show("singleplayer-game-options")
		});
		$("#singleplayer-game-options-menu-div .restate-mission-button").click(singleplayer.restateMission);
		$("#restate-mission-menu-div .options-button").click(function() {
			menus.show("singleplayer-game-options")
		});
		$("#restate-mission-menu-div .video-button").click(function() {
			if (maps.currentMapData.videos && maps.currentMapData.videos.briefing) {
				menus.hide();
				videos.play(maps.currentMapData.videos.briefing, singleplayer.restateMission)
			}
		});
		$("#singleplayer-game-options-menu-div .game-controls-button").click(function() {
			menus.show("game-controls")
		});
		$("#game-controls-menu-div .visual-controls-button").click(function() {
			menus.notYetImplemented("Visual Controls")
		});
		$("#game-controls-menu-div .sound-controls-button").click(function() {
			menus.show("sound-controls")
		});
		$("#sound-controls-menu-div .musicvolume").noUiSlider("init", {
			handles: 1,
			scale: [0, 10],
			connect: true,
			step: 1,
			start: 10,
			change: function() {
				var value = $(this).noUiSlider("value")[1];
				sounds.setMusicVoume(value / 10)
			}
		});
		$("#sound-controls-menu-div .soundvolume").noUiSlider("init", {
			handles: 1,
			scale: [0, 10],
			start: 10,
			change: function() {
				var value = $(this).noUiSlider("value")[1];
				sounds.setAudioVoume(value / 10)
			}
		});
		$("#sound-controls-menu-div .stop-button").click(function() {
			sounds.stopMusic()
		});
		$("#sound-controls-menu-div .play-button").click(function() {
			var selectedSong = $("#sound-controls-menu-div .music-tracks-list").prop("selectedIndex");
			sounds.playMusic(selectedSong)
		});
		$("#sound-controls-menu-div .shuffle-button").click(function() {
			sounds.toggleShuffle();
			$("#sound-controls-menu-div .shuffle-button").val(sounds.shuffle ? "On" : "Off")
		});
		$("#sound-controls-menu-div .repeat-button").click(function() {
			sounds.toggleRepeat();
			$("#sound-controls-menu-div .repeat-button").val(sounds.repeat ? "On" : "Off")
		});
		$("#sound-controls-menu-div .options-button").click(function() {
			if (game.type == "multiplayer") {
				menus.show("multiplayer-game-options")
			} else {
				menus.show("singleplayer-game-options")
			}
		});
		$("#game-controls-menu-div .options-button").click(function() {
			if (game.type == "multiplayer") {
				menus.show("multiplayer-game-options")
			} else {
				menus.show("singleplayer-game-options")
			}
		});
		$("#start-network-game-menu-div .gamespeed").noUiSlider("init", {
			handles: 1,
			scale: [0, 6],
			connect: false,
			step: 1,
			start: 2,
			change: function() {
				var value = $(this).noUiSlider("value")[0];
				multiplayer.gameSpeed = value * .25 + .5
			}
		});
		$("#game-controls-menu-div .gamespeed").noUiSlider("init", {
			handles: 1,
			scale: [0, 6],
			connect: false,
			step: 1,
			start: 2,
			change: function() {
				var value = $(this).noUiSlider("value")[0];
				singleplayer.gameSpeed = value * .25 + .5
			}
		});
		$("#game-controls-menu-div .scrollspeed").noUiSlider("init", {
			handles: 1,
			scale: [0, 6],
			step: 1,
			start: 2,
			change: function() {
				var value = $(this).noUiSlider("value")[1];
				game.scrollSpeed = value * .25 + .5
			}
		});
		$("#singleplayer-game-options-menu-div .save-mission-button").click(function() {
			singleplayer.updateSavedMissionList();
			menus.show("save-mission");
			$(".mission-name").focus()
		});
		$("#save-mission-menu-div .mission-list").change(function() {
			if ($("#save-mission-menu-div .mission-list").prop("selectedIndex") > 0) {
				$("#save-mission-menu-div .mission-name").val($("#save-mission-menu-div .mission-list option:selected").html())
			}
			$("#save-mission-menu-div .mission-name").focus()
		});
		$("#save-mission-menu-div .save-button").click(function() {
			menus.notYetImplemented("Save Mission");
			singleplayer.saveMission($("#save-mission-menu-div .mission-list").prop("selectedIndex"), $("#save-mission-menu-div .mission-name").val())
		});
		$("#save-mission-menu-div .cancel-button").click(function() {
			menus.show("singleplayer-game-options")
		});
		$("#singleplayer-game-options-menu-div .delete-mission-button").click(function() {
			singleplayer.updateSavedMissionList();
			menus.show("delete-mission")
		});
		$("#delete-mission-menu-div .delete-button").click(function() {
			singleplayer.deleteMission($("#delete-mission-menu-div .mission-list").prop("selectedIndex"))
		});
		$("#delete-mission-menu-div .cancel-button").click(function() {
			menus.show("singleplayer-game-options")
		});
		$("#join-network-game-menu-div .join-multiplayer-button").click(multiplayer.joinExistingGame);
		$("#join-network-game-menu-div .cancel-multiplayer-button").click(multiplayer.cancel);
		$("#join-network-game-menu-div .new-multiplayer-button").click(multiplayer.createNewGame);
		$("#join-network-game-menu-div .games-list").change(multiplayer.selectGame);
		var sendMessage = function (container) {
			if (container == "#join-network-game-menu-div") {
				multiplayer.sendMessageToLobby($(container + " .input-message").val())
			} else {
				multiplayer.sendMessageToPlayers($(container + " .input-message").val())
			}
			$(container + " .input-message").val("");
			$(container + " .input-message").focus()
		};
		$("#joined-network-game-menu-div .input-message").keydown(function (ev) {
			if (ev.which == 13 && this.value != "") {
				sendMessage("#joined-network-game-menu-div")
			}
		});
		$("#join-network-game-menu-div .input-message").keydown(function (ev) {
			if (ev.which == 13 && this.value != "") {
				sendMessage("#join-network-game-menu-div")
			}
		});
		$("#start-network-game-menu-div .input-message").keydown(function (ev) {
			if (ev.which == 13 && this.value != "") {
				sendMessage("#start-network-game-menu-div")
			}
		});
		$("#joined-network-game-menu-div .send-message-button").click(function() {
			sendMessage("#joined-network-game-menu-div")
		});
		$("#join-network-game-menu-div .send-message-button").click(function() {
			sendMessage("#join-network-game-menu-div")
		});
		$("#start-network-game-menu-div .send-message-button").click(function() {
			sendMessage("#start-network-game-menu-div")
		});
		$("#start-network-game-menu-div .cancel-multiplayer-button").click(multiplayer.cancelNewGame);
		$("#start-network-game-menu-div .reject-player-button").click(multiplayer.rejectPlayer);
		$("#joined-network-game-menu-div .cancel-multiplayer-button").click(multiplayer.cancelJoinedGame);
		$("#start-network-game-menu-div .start-multiplayer-button").click(function() {
			var credits = parseInt($("#start-network-game-menu-div .starting-credits").val(), 10);
			if (isNaN(credits) || credits < 0) {
				menus.showMessageBox("Invalid Starting Credits", "Please enter a valid value for starting credits.", function() {
					$("#start-network-game-menu-div .starting-credits").focus()
				});
				return
			}
			var level = $("#start-network-game-menu-div .scenarios").val();
			multiplayer.startNewGame({credits: credits, level: level, gameSpeed: multiplayer.gameSpeed})
		})
	},
	reposition: function (containerWidth, containerHeight) {
		$("#select-campaign-menu-div").width(containerWidth).height(containerHeight);
		$(".game-menu").each(function (index, element) {
			var $menu = $(this);
			$menu.css({
				top: Math.round((containerHeight - $menu.height()) / 2),
				left: Math.round((containerWidth - $menu.width()) / 2)
			})
		})
	},
	show: function (menuName) {
		if (menuName === "game-type") {
			game.reset()
		}
		menus.hide();
		$("#menu-container").show();
		$("#menu-container").css("background", menus.list[menuName].background);
		$("#" + menuName + "-menu-div").show();
		if (menus.list[menuName].onshow) {
			menus.list[menuName].onshow()
		}
	},
	isActive: function (menuName) {
		return $("#" + menuName + "-menu-div").is(":visible")
	},
	hide: function() {
		$("#menu-container").css("background", "none");
		$("#menu-container").hide();
		$(".game-menu").hide();
		$("#message-box-menu-div").hide();
		$("#message-box-container").hide()
	},
	showMessageBox: function (title, content, onclickhandler) {
		$("#message-box-container").show();
		$("#message-box-container").css("background", menus.list["message-box"].background);
		$("#message-box-menu-div").show();
		$("#message-box-menu-div .message-box-title").html(title);
		$("#message-box-menu-div .message-box-content").html(content);
		$("#message-box-menu-div .message-box-ok").unbind("click").click(function() {
			$("#message-box-menu-div").hide();
			$("#message-box-container").hide();
			if (onclickhandler) {
				onclickhandler()
			}
		})
	}
};

!function ($) {
	$.fn.noUiSlider = function (method, options) {
		function neg(a) {
			return a < 0
		}

		function abs(a) {
			return Math.abs(a)
		}

		function roundTo(a, b) {
			return Math.round(a / b) * b
		}

		function dup(a) {
			return jQuery.extend(true, {}, a)
		}

		var defaults, methods, helpers, options = options || [], functions, touch = "ontouchstart" in document.documentElement;
		defaults = {
			handles: 2,
			connect: true,
			scale: [0, 100],
			start: [25, 75],
			to: 0,
			handle: 0,
			change: "",
			end: "",
			step: false,
			save: false,
			click: true
		};
		helpers = {
			scale: function (a, b, c) {
				var d = b[0], e = b[1];
				if (neg(d)) {
					a = a + abs(d);
					e = e + abs(d)
				} else {
					a = a - d;
					e = e - d
				}
				return a * c / e
			}, deScale: function (a, b, c) {
				var d = b[0], e = b[1];
				e = neg(d) ? e + abs(d) : e - d;
				return a * e / c + d
			}, connect: function (api) {
				if (api.connect) {
					if (api.handles.length > 1) {
						api.connect.css({left: api.low.left(), right: api.slider.innerWidth() - api.up.left()})
					} else {
						api.low ? api.connect.css({left: api.low.left(), right: 0}) : api.connect.css({
							left: 0,
							right: api.slider.innerWidth() - api.up.left()
						})
					}
				}
			}, left: function() {
				return parseFloat($(this).css("left"))
			}, call: function (f, t, n) {
				if (typeof f == "function") {
					f.call(t, n)
				}
			}, bounce: function (api, n, c, handle) {
				var go = false;
				if (handle.is(api.up)) {
					if (api.low && n < api.low.left()) {
						n = api.low.left();
						go = true
					}
				} else {
					if (api.up && n > api.up.left()) {
						n = api.up.left();
						go = true
					}
				}
				if (n > api.slider.innerWidth()) {
					n = api.slider.innerWidth();
					go = true
				} else if (n < 0) {
					n = 0;
					go = true
				}
				return [n, go]
			}
		};
		methods = {
			init: function() {
				return this.each(function() {
					var s, slider, api;
					slider = $(this).css("position", "relative");
					api = new Object;
					api.options = $.extend(defaults, options);
					s = api.options;
					typeof s.start == "object" ? 1 : s.start = [s.start];
					api.slider = slider;
					api.low = $('<div class="noUi-handle noUi-lowerHandle"><div></div></div>');
					api.up = $('<div class="noUi-handle noUi-upperHandle"><div></div></div>');
					api.connect = $('<div class="noUi-midBar"></div>');
					s.connect ? api.connect.appendTo(api.slider) : api.connect = false;
					if (s.knobs) {
						s.handles = s.knobs
					}
					if (s.handles === 1) {
						if (s.connect === true || s.connect === "lower") {
							api.low = false;
							api.up = api.up.appendTo(api.slider);
							api.handles = [api.up]
						} else if (s.connect === "upper" || !s.connect) {
							api.low = api.low.prependTo(api.slider);
							api.up = false;
							api.handles = [api.low]
						}
					} else {
						api.low = api.low.prependTo(api.slider);
						api.up = api.up.appendTo(api.slider);
						api.handles = [api.low, api.up]
					}
					if (api.low) {
						api.low.left = helpers.left
					}
					if (api.up) {
						api.up.left = helpers.left
					}
					api.slider.children().css("position", "absolute");
					$.each(api.handles, function (index) {
						$(this).css({
							left: helpers.scale(s.start[index], api.options.scale, api.slider.innerWidth()),
							zIndex: index + 1
						}).children().bind(touch ? "touchstart.noUi" : "mousedown.noUi", functions.start)
					});
					if (s.click) {
						api.slider.click(functions.click).find("*:not(.noUi-midBar)").click(functions.flse)
					}
					helpers.connect(api);
					api.options = s;
					api.slider.data("api", api)
				})
			}, move: function() {
				var api, bounce, to, handle, scale;
				api = dup($(this).data("api"));
				api.options = $.extend(api.options, options);
				if (api.options.knob) {
					api.options.handle = api.options.knob
				}
				handle = api.options.handle;
				handle = api.handles[handle == "lower" || handle == 0 || typeof handle == "undefined" ? 0 : 1];
				bounce = helpers.bounce(api, helpers.scale(api.options.to, api.options.scale, api.slider.innerWidth()), handle.left(), handle);
				handle.css("left", bounce[0]);
				if (handle.is(api.up) && handle.left() == 0 || handle.is(api.low) && handle.left() == api.slider.innerWidth()) {
					handle.css("zIndex", parseInt(handle.css("zIndex")) + 2)
				}
				if (options.save === true) {
					api.options.scale = options.scale;
					$(this).data("api", api)
				}
				helpers.connect(api);
				helpers.call(api.options.change, api.slider, "move");
				helpers.call(api.options.end, api.slider, "move")
			}, value: function() {
				var val1, val2, api;
				api = dup($(this).data("api"));
				api.options = $.extend(api.options, options);
				val1 = api.low ? Math.round(helpers.deScale(api.low.left(), api.options.scale, api.slider.innerWidth())) : false;
				val2 = api.up ? Math.round(helpers.deScale(api.up.left(), api.options.scale, api.slider.innerWidth())) : false;
				if (options.save) {
					api.options.scale = options.scale;
					$(this).data("api", api)
				}
				return [val1, val2]
			}, api: function() {
				return $(this).data("api")
			}, disable: function() {
				return this.each(function() {
					$(this).addClass("disabled")
				})
			}, enable: function() {
				return this.each(function() {
					$(this).removeClass("disabled")
				})
			}
		}, functions = {
			start: function (e) {
				if (!$(this).parent().parent().hasClass("disabled")) {
					e.preventDefault();
					$("body").bind("selectstart.noUi", functions.flse);
					$(this).addClass("noUi-activeHandle");
					$(document).bind(touch ? "touchmove.noUi" : "mousemove.noUi", functions.move);
					touch ? $(this).bind("touchend.noUi", functions.end) : $(document).bind("mouseup.noUi", functions.end)
				}
			}, move: function (e) {
				var a, b, h, api, go = false, handle, bounce;
				h = $(".noUi-activeHandle");
				api = h.parent().parent().data("api");
				handle = h.parent().is(api.low) ? api.low : api.up;
				a = e.pageX - Math.round(api.slider.offset().left);
				if (isNaN(a)) {
					a = e.originalEvent.touches[0].pageX - Math.round(api.slider.offset().left)
				}
				b = handle.left();
				bounce = helpers.bounce(api, a, b, handle);
				a = bounce[0];
				go = bounce[1];
				if (api.options.step && !go) {
					var v1 = api.options.scale[0], v2 = api.options.scale[1];
					if (neg(v2)) {
						v2 = abs(v1 - v2);
						v1 = 0
					}
					v2 = v2 + -1 * v1;
					var con = helpers.scale(api.options.step, [0, v2], api.slider.innerWidth());
					if (Math.abs(b - a) >= con) {
						a = a < b ? b - con : b + con;
						go = true
					}
				} else {
					go = true
				}
				if (a === b) {
					go = false
				}
				if (go) {
					handle.css("left", a);
					if (handle.is(api.up) && handle.left() == 0 || handle.is(api.low) && handle.left() == api.slider.innerWidth()) {
						handle.css("zIndex", parseInt(handle.css("zIndex")) + 2)
					}
					helpers.connect(api);
					helpers.call(api.options.change, api.slider, "slide")
				}
			}, end: function() {
				var handle, api;
				handle = $(".noUi-activeHandle");
				api = handle.parent().parent().data("api");
				$(document).add("body").add(handle.removeClass("noUi-activeHandle").parent()).unbind(".noUi");
				helpers.call(api.options.end, api.slider, "slide")
			}, click: function (e) {
				if (!$(this).hasClass("disabled")) {
					var api = $(this).data("api");
					var s = api.options;
					var c = e.pageX - api.slider.offset().left;
					c = s.step ? roundTo(c, helpers.scale(s.step, s.scale, api.slider.innerWidth())) : c;
					if (api.low && api.up) {
						c < (api.low.left() + api.up.left()) / 2 ? api.low.css("left", c) : api.up.css("left", c)
					} else {
						api.handles[0].css("left", c)
					}
					helpers.connect(api);
					helpers.call(s.change, api.slider, "click");
					helpers.call(s.end, api.slider, "click")
				}
			}, flse: function() {
				return false
			}
		};
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
		} else if (typeof method === "object" || !method) {
			return methods.init.apply(this, arguments)
		} else {
			$.error("No such method: " + method)
		}
	}
}(jQuery);

var mouse = {
	cursors: [],
	cursorCount: 0,
	load: function() {
		mouse.canvas = $(".mousecanvas")[0];
		mouse.context = mouse.canvas.getContext("2d");
		mouse.spriteImage = loader.loadImage("images/mouse.png");
		mouse.blankCursor = loader.loadImage("images/blank.gif");
		mouse.defaultCursor = loader.loadImage("images/default-cursor.gif");
		mouse.loadCursor("default");
		mouse.loadCursor("pan_top", 15, 0);
		mouse.loadCursor("pan_top_right", 30, 0);
		mouse.loadCursor("pan_right", 30, 12);
		mouse.loadCursor("pan_bottom_right", 30, 24);
		mouse.loadCursor("pan_bottom", 15, 24);
		mouse.loadCursor("pan_bottom_left", 0, 24);
		mouse.loadCursor("pan_left", 0, 12);
		mouse.loadCursor("pan_top_left", 0, 0);
		mouse.loadCursor("no_default");
		mouse.loadCursor("move", 15, 12);
		mouse.loadCursor("no_move", 15, 12);
		mouse.loadCursor("select", 15, 12, 6);
		mouse.loadCursor("attack", 15, 12, 8);
		mouse.loadCursor("unknown");
		mouse.loadCursor("unknown");
		mouse.loadCursor("unknown");
		mouse.loadCursor("repair", 15, 0, 24);
		mouse.loadCursor("build_command", 15, 12, 9);
		mouse.loadCursor("sell", 15, 12, 24);
		mouse.loadCursor("unknown");
		mouse.loadCursor("unknown");
		mouse.loadCursor("blue_attack", 15, 12, 8);
		mouse.loadCursor("nuke_attack", 15, 12, 7);
		mouse.loadCursor("green_attack", 15, 12, 16);
		mouse.loadCursor("load", 15, 12, 3, 2);
		mouse.loadCursor("detonate", 15, 12, 3);
		mouse.loadCursor("no_sell", 15, 12);
		mouse.loadCursor("no_repair", 15, 0);
		mouse.loadCursor("little_detonate", 15, 12, 3);
		mouse.loadCursor("no_pan_top", 15, 0);
		mouse.loadCursor("no_pan_top_right", 30, 0);
		mouse.loadCursor("no_pan_right", 30, 12);
		mouse.loadCursor("no_pan_bottom_right", 30, 24);
		mouse.loadCursor("no_pan_bottom", 15, 24);
		mouse.loadCursor("no_pan_bottom_left", 0, 24);
		mouse.loadCursor("no_pan_left", 0, 12);
		mouse.loadCursor("no_pan_top_left", 0, 0);
		mouse.loadCursor("unknown");
		mouse.loadCursor("unknown");
		mouse.loadCursor("another_attack", 15, 12, 8);
		mouse.loadCursor("another_load", 15, 12, 3, 2);
		mouse.loadCursor("unknown");
		mouse.loadCursor("unknown");
		mouse.loadCursor("unknown");
		mouse.loadCursor("unknown");
		mouse.loadCursor("another_sell", 15, 12, 24);
		mouse.cursor = mouse.cursors["default"];
		mouse.listenEvents()
	},
	loadCursor: function (name, x, y, imageCount, cursorSpeed) {
		if (!x && !y) {
			x = 0;
			y = 0
		}
		if (!cursorSpeed) {
			cursorSpeed = 1
		}
		if (!imageCount) {
			imageCount = 1
		}
		this.cursors[name] = {
			x: x,
			y: y,
			name: name,
			count: imageCount,
			spriteOffset: this.cursorCount,
			cursorSpeed: cursorSpeed
		};
		this.cursorCount += imageCount;
	},
	click: function (ev, rightClick) {
		if (!game.running) {
			return;
		}
		if (mouse.y <= game.viewportTop && mouse.y > game.viewportTop - 15) {
			if (mouse.x >= 0 && mouse.x < 160) {
				if (game.replay) {
				} else {
					if (game.type == "singleplayer") {
						singleplayer.gameOptions();
					} else {
						multiplayer.gameOptions();
					}
				}
			} else if (mouse.x >= 320 && mouse.x < 480) {
			} else if (mouse.x >= 480 && mouse.x < 640) {
				sidebar.visible = !sidebar.visible;
				game.refreshBackground = true;
			}
		} else if (mouse.y >= game.viewportTop && mouse.y <= game.viewportTop + game.viewportHeight) {
			if (sidebar.visible && mouse.x > sidebar.left) {
				sidebar.click(ev, rightClick);
			} else {
				game.click(ev, rightClick);
			}
		}
	},
	listenEvents: function() {
		console.log('listenEvents');

		var $mouseCanvas = $('.mousecanvas');
		$mouseCanvas.mousemove(function (ev) {
			var movementX = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
			var movementY = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;
			var offset = $mouseCanvas.offset();
			mouse.x = Math.round((ev.pageX - offset.left) * game.scaleFactor);
			mouse.y = Math.round((ev.pageY - offset.top) * game.scaleFactor);
			mouse.gameX = mouse.x - game.viewportAdjustX;
			mouse.gameY = mouse.y - game.viewportAdjustY;
			mouse.gridX = Math.floor(mouse.gameX / game.gridSize);
			mouse.gridY = Math.floor(mouse.gameY / game.gridSize);
			if (mouse.buttonPressed) {
				if (game.running && (Math.abs(mouse.dragX - mouse.gameX) > 4 || Math.abs(mouse.dragY - mouse.gameY) > 4)) {
					mouse.dragSelect = true;
				}
			} else {
				mouse.dragSelect = false;
			}
			mouse.draw();
		});
		$mouseCanvas.click(function (ev) {
			mouse.click(ev, false);
			mouse.dragSelect = false;

			var $canvas = $(this);
			var canvas = $(this).get()[0];

			var lockAquired = true;
			var hasPointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

			if (hasPointerLock && !lockAquired) {
				console.log('hasPointerLock');

				var pointerlockerror = function(ev) {
					console.log(ev);
				}

				var changeCallback = function(ev) {
					console.log('changeCallback');

					lockAquired = true;

					var entryCoordinates = {x:-1, y:-1};

					var moveCallback = function(ev) {
						console.log('moveCallback');

						var movementX = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
						var movementY = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;

						entryCoordinates.x = entryCoordinates.x + movementX;
						entryCoordinates.y = entryCoordinates.y + movementY;

						mouse.x = entryCoordinates.x;
						mouse.y = entryCoordinates.y;

						/*var offset = $canvas.offset();

						mouse.x = Math.round((ev.pageX - offset.left) * game.scaleFactor);
						mouse.y = Math.round((ev.pageY - offset.top) * game.scaleFactor);
						mouse.gameX = mouse.x - game.viewportAdjustX;
						mouse.gameY = mouse.y - game.viewportAdjustY;
						mouse.gridX = Math.floor(mouse.gameX / game.gridSize);
						mouse.gridY = Math.floor(mouse.gameY / game.gridSize);

						if (mouse.buttonPressed) {
							if (game.running && (Math.abs(mouse.dragX - mouse.gameX) > 4 || Math.abs(mouse.dragY - mouse.gameY) > 4)) {
								mouse.dragSelect = true;
							}
						} else {
							mouse.dragSelect = false;
						}*/

						mouse.draw();
					};

					if (document.pointerLockElement === canvas || document.mozPointerLockElement === canvas || document.webkitPointerLockElement === canvas) {
						document.addEventListener('mousemove', moveCallback, false);
					} else {
						document.removeEventListener('mousemove', moveCallback, false);
						entryCoordinates = {x:-1, y:-1};
					}
				};

				document.addEventListener('pointerlockchange', changeCallback, false);
				document.addEventListener('mozpointerlockchange', changeCallback, false);
				document.addEventListener('webkitpointerlockchange', changeCallback, false);

				canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
				canvas.requestPointerLock();
			}

			return false;
		});
		$mouseCanvas.mousedown(function (ev) {
			if (ev.which == 1) {
				mouse.buttonPressed = true;
				mouse.dragX = mouse.gameX;
				mouse.dragY = mouse.gameY;
				ev.preventDefault();
			}
			return false;
		});
		$mouseCanvas.bind("contextmenu", function (ev) {
			mouse.click(ev, true);
			return false;
		});
		$mouseCanvas.mouseup(function (ev) {
			if (ev.which == 1) {
				if (mouse.dragSelect && !game.showMessage) {
					if (!ev.shiftKey) {
						game.clearSelection();
					}
					var x1 = Math.min(mouse.gameX, mouse.dragX);
					var y1 = Math.min(mouse.gameY, mouse.dragY);
					var x2 = Math.max(mouse.gameX, mouse.dragX);
					var y2 = Math.max(mouse.gameY, mouse.dragY);
					var lastUnit;
					for (var i = game.items.length - 1; i >= 0; i--) {
						var unit = game.items[i];
						if (unit.type != "buildings" && unit.type != "turrets" && !unit.unselectable && unit.player == game.player && x1 <= unit.x * game.gridSize && x2 >= unit.x * game.gridSize && y1 <= (unit.y - unit.z) * game.gridSize && y2 >= (unit.y - unit.z) * game.gridSize) {
							game.selectItem(unit, ev.shiftKey, true);
							lastUnit = unit;
						}
					}
					if (lastUnit && !game.replay) {
						if (game.selectedCommandos.length > 0) {
							sounds.play("commando_select");
						} else {
							sounds.play(lastUnit.type + "_select");
						}
					}
				}
				mouse.buttonPressed = false;
			}
			return false;
		});
		$mouseCanvas.mouseleave(function (ev) {
			mouse.insideCanvas = false;
			mouse.draw();
		});
		$mouseCanvas.mouseenter(function (ev) {
			mouse.buttonPressed = false;
			mouse.insideCanvas = true;
		});
		$(document).keydown(function (ev) {
			game.keyPressed(ev);
		});
		$(document).keyup(function (ev) {
			game.keyReleased(ev);
		})
	},
	cursorLoop: 0,
	underMouse: function() {
		if (mouse.y < game.viewportTop || mouse.y > game.viewportTop + game.viewportHeight || fog.isPointOverFog(mouse.gameX, mouse.gameY)) {
			return false
		}
		var selection = false;
		for (var i = game.items.length - 1; i >= 0; i--) {
			var item = game.items[i];
			if (item.type == "buildings" || item.type == "turrets" || item.type == "walls" || item.type == "tiberium") {
				if (item.x <= mouse.gameX / game.gridSize && item.x >= (mouse.gameX - item.pixelWidth) / game.gridSize && item.y <= mouse.gameY / game.gridSize && item.y >= (mouse.gameY - item.pixelHeight) / game.gridSize) {
					if (item.z > -1) {
						return item
					} else {
						selection = item
					}
				}
			} else {
				if (item.lifeCode != "dead" && item.type != "trees" && Math.pow(item.x - mouse.gameX / game.gridSize, 2) + Math.pow(item.y - item.z - mouse.gameY / game.gridSize, 2) < Math.pow((item.softCollisionRadius + 4) / game.gridSize, 2)) {
					if (!item.cloaked || item.player == game.player) {
						return item
					}
				}
			}
		}
		return selection
	},
	setCursor: function() {
		mouse.cursor = mouse.cursors["default"];
		mouse.tooltip = undefined;
		this.objectUnderMouse = undefined;
		if (!game.running) {
			return
		}
		if (mouse.y < game.viewportTop) {
			mouse.cursor = mouse.cursors["default"]
		} else if (mouse.y >= game.viewportTop && mouse.y <= game.viewportTop + game.viewportHeight) {
			this.objectUnderMouse = mouse.underMouse();
			if (mouse.panDirection && mouse.panDirection !== "") {
				mouse.cursor = mouse.cursors[mouse.panDirection]
			} else if (sidebar.visible && mouse.x > sidebar.left) {
				mouse.cursor = mouse.cursors["default"];
				var button = sidebar.hoveredButton();
				if (game.running && button) {
					var tooltipName = button.label;
					var tooltipCost = "$" + button.cost;
					mouse.tooltip = button.type != "special" ? [tooltipName, tooltipCost] : [tooltipName]
				}
			} else if (sidebar.deployMode) {
				if (sidebar.deploySpecial) {
					switch (sidebar.deploySpecial.name) {
						case"nuclear-strike":
							mouse.cursor = mouse.cursors["nuke_attack"];
							break;
						case"ion-cannon":
							mouse.cursor = mouse.cursors["green_attack"];
							break;
						case"air-strike":
							mouse.cursor = mouse.cursors["blue_attack"];
							break
					}
				}
			} else if (sidebar.repairMode) {
				if (this.objectUnderMouse && this.objectUnderMouse.player == game.player && (this.objectUnderMouse.type === "buildings" || this.objectUnderMouse.type === "turrets") && this.objectUnderMouse.life < this.objectUnderMouse.hitPoints) {
					mouse.cursor = mouse.cursors["repair"]
				} else {
					mouse.cursor = mouse.cursors["no_repair"]
				}
			} else if (sidebar.sellMode) {
				if (this.objectUnderMouse && this.objectUnderMouse.player == game.player && (this.objectUnderMouse.type == "buildings" || this.objectUnderMouse.type == "turrets")) {
					this.cursor = this.cursors["sell"]
				} else {
					this.cursor = this.cursors["no_sell"]
				}
			} else {
				if (this.objectUnderMouse && game.selectedUnits.length == 1 && this.objectUnderMouse.selected && this.objectUnderMouse.name == "mcv" && this.objectUnderMouse.player == game.player && !game.replay) {
					if (this.objectUnderMouse.canBuildHere) {
						mouse.cursor = mouse.cursors["build_command"]
					} else {
						mouse.cursor = mouse.cursors["default"]
					}
				} else if (this.objectUnderMouse && game.selectedUnits.length == 1 && this.objectUnderMouse.selected && this.objectUnderMouse.name == "apc" && this.objectUnderMouse.player == game.player && !game.replay) {
					if (this.objectUnderMouse.cargo.length > 0) {
						mouse.cursor = mouse.cursors["build_command"]
					} else {
						mouse.cursor = mouse.cursors["default"]
					}
				} else if (this.objectUnderMouse && game.selectedUnits.length == 1 && this.objectUnderMouse.selected && this.objectUnderMouse.name == "chinook" && this.objectUnderMouse.player == game.player && !game.replay) {
					if (this.objectUnderMouse.cargo.length > 0 && this.objectUnderMouse.z == 0) {
						mouse.cursor = mouse.cursors["build_command"]
					} else {
						mouse.cursor = mouse.cursors["default"]
					}
				} else if (this.objectUnderMouse && game.selectedInfantry.length > 0 && this.objectUnderMouse.player == game.player && this.objectUnderMouse.name == "apc" && this.objectUnderMouse.cargo.length < this.objectUnderMouse.maxCargo && !game.replay) {
					mouse.cursor = mouse.cursors["load"]
				} else if (this.objectUnderMouse && game.selectedInfantry.length > 0 && this.objectUnderMouse.player == game.player && this.objectUnderMouse.name == "chinook" && this.objectUnderMouse.cargo.length < this.objectUnderMouse.maxCargo && !game.replay) {
					mouse.cursor = mouse.cursors["load"]
				} else if (this.objectUnderMouse && game.selectedAircraft.length > 0 && this.objectUnderMouse.player == game.player && this.objectUnderMouse.name == "helipad" && !game.replay) {
					mouse.cursor = mouse.cursors["load"]
				} else if (this.objectUnderMouse && game.selectedHarvesters.length > 0 && this.objectUnderMouse.name == "tiberium" && !game.replay) {
					mouse.cursor = mouse.cursors["attack"]
				} else if (this.objectUnderMouse && game.selectedHarvesters.length > 0 && this.objectUnderMouse.player == game.player && this.objectUnderMouse.name == "refinery" && !game.replay) {
					mouse.cursor = mouse.cursors["load"]
				} else if (this.objectUnderMouse && game.selectedVehicles.length > 0 && this.objectUnderMouse.player == game.player && this.objectUnderMouse.name == "repair-facility" && !game.replay) {
					mouse.cursor = mouse.cursors["load"]
				} else if (this.objectUnderMouse && game.selectedCommandos.length > 0 && (this.objectUnderMouse.type == "buildings" || this.objectUnderMouse.type == "turrets") && this.objectUnderMouse.player != game.player && !game.replay) {
					mouse.cursor = mouse.cursors["detonate"]
				} else if (this.objectUnderMouse && game.selectedEngineers.length > 0 && this.objectUnderMouse.type == "buildings" && this.objectUnderMouse.player != game.player && !game.replay) {
					mouse.cursor = mouse.cursors["load"]
				} else if (this.objectUnderMouse && game.selectedAttackers.length > 0 && this.objectUnderMouse.player != game.player && !this.objectUnderMouse.unattackable && !game.replay) {
					mouse.cursor = mouse.cursors["attack"]
				} else if (this.objectUnderMouse && !this.objectUnderMouse.unselectable && !this.objectUnderMouse.selected) {
					mouse.cursor = mouse.cursors["select"]
				} else if (fog.isPointOverFog(mouse.gameX, mouse.gameY) && game.selectedAircraft.length > 0) {
					mouse.cursor = mouse.cursors["no_move"]
				} else if (game.selectedUnits.length > 0 && !game.replay) {
					try {
						if (!game.foggedObstructionGrid[game.player][Math.floor(mouse.gridY)][Math.floor(mouse.gridX)]) {
							mouse.cursor = mouse.cursors["move"]
						} else {
							mouse.cursor = mouse.cursors["no_move"]
						}
					} catch (x) {
						mouse.cursor = mouse.cursors["no_move"]
					}
				} else {
					mouse.cursor = mouse.cursors["default"]
				}
			}
		}
		mouse.cursorLoop++;
		if (mouse.cursorLoop >= mouse.cursor.cursorSpeed * mouse.cursor.count) {
			mouse.cursorLoop = 0
		}
		mouse.draw()
	},
	draw: function() {
		mouse.context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
		if (mouse.insideCanvas) {
			var imageNumber = mouse.cursor.spriteOffset + Math.floor(mouse.cursorLoop / mouse.cursor.cursorSpeed);
			mouse.context.drawImage(mouse.spriteImage, 30 * imageNumber, 0, 30, 24, mouse.x - mouse.cursor.x, mouse.y - mouse.cursor.y, 30, 24);
			if (this.dragSelect) {
				var x = Math.min(this.gameX, this.dragX);
				var y = Math.min(this.gameY, this.dragY);
				var width = Math.abs(this.gameX - this.dragX);
				var height = Math.abs(this.gameY - this.dragY);
				mouse.context.strokeStyle = "white";
				mouse.context.strokeRect(x + game.viewportAdjustX, y + game.viewportAdjustY, width, height);
			}
			if (this.tooltip) {
				var tooltipHeight = 14 * this.tooltip.length + 3;
				var tooltipWidth = this.tooltip[0].length * 6;
				var x = Math.round(this.x);
				if (x + tooltipWidth > sidebar.left + sidebar.width) {
					x = sidebar.width + sidebar.left - tooltipWidth;
				}
				var y = Math.round(this.y + 16);
				mouse.context.fillStyle = "black";
				mouse.context.fillRect(x, y, tooltipWidth, tooltipHeight);
				mouse.context.strokeStyle = "darkgreen";
				mouse.context.strokeRect(x, y, tooltipWidth, tooltipHeight);
				mouse.context.fillStyle = "darkgreen";
				mouse.context.font = "12px Command";
				for (var i = 0; i < this.tooltip.length; i++) {
					mouse.context.fillText(this.tooltip[i], x + 4, y + 14 + i * 14);
				}
			}
		}
	},
	panDirection: "",
	panningThreshold: 24,
	panningVelocity: 12,
	handlePanning: function() {
		var panDirection = "";
		game.viewportDeltaX = 0;
		game.viewportDeltaY = 0;
		if (mouse.insideCanvas || game.upKeyPressed || game.downKeyPressed || game.leftKeyPressed || game.rightKeyPressed) {
			if (game.upKeyPressed || mouse.y <= game.viewportTop + mouse.panningThreshold && mouse.y >= game.viewportTop) {
				game.viewportDeltaY = -mouse.panningVelocity * game.scrollSpeed;
				panDirection += "_top"
			} else if (game.downKeyPressed || mouse.y >= game.viewportTop + game.viewportHeight - mouse.panningThreshold && mouse.y <= game.viewportTop + game.viewportHeight && !(sidebar.visible && mouse.x >= 500 && mouse.x <= 632 && mouse.y - sidebar.top >= 455 && mouse.y - sidebar.top <= 480)) {
				game.viewportDeltaY = mouse.panningVelocity * game.scrollSpeed;
				panDirection += "_bottom"
			} else {
				game.viewportDeltaY = 0;
				panDirection += ""
			}
			if (game.leftKeyPressed || mouse.x < mouse.panningThreshold && mouse.y >= game.viewportTop && mouse.y <= game.viewportTop + game.viewportHeight) {
				game.viewportDeltaX = -mouse.panningVelocity * game.scrollSpeed;
				panDirection += "_left"
			} else if (game.rightKeyPressed || mouse.x > game.screenWidth - mouse.panningThreshold && mouse.y >= game.viewportTop && mouse.y <= game.viewportTop + game.viewportHeight) {
				game.viewportDeltaX = mouse.panningVelocity * game.scrollSpeed;
				panDirection += "_right"
			} else {
				game.viewportDeltaX = 0;
				panDirection += ""
			}
		}
		if (game.viewportX + game.viewportDeltaX < 0 || game.viewportX + game.viewportDeltaX + game.screenWidth + (sidebar.visible ? -sidebar.width : 0) > maps.currentMapImage.width) {
			game.viewportDeltaX = 0
		}
		if (!sidebar.visible && game.viewportX + game.screenWidth > maps.currentMapImage.width) {
			game.viewportX = maps.currentMapImage.width - game.screenWidth;
			game.viewportDeltaX = 0
		}
		if (game.viewportY + game.viewportDeltaY < 0 || game.viewportY + game.viewportDeltaY + game.viewportHeight > maps.currentMapImage.height) {
			game.viewportDeltaY = 0
		}
		if (panDirection !== "") {
			if (game.viewportDeltaX === 0 && game.viewportDeltaY === 0) {
				panDirection = "no_pan" + panDirection
			} else {
				panDirection = "pan" + panDirection
			}
		}
		mouse.panDirection = panDirection;
		game.viewportX += game.viewportDeltaX;
		game.viewportY += game.viewportDeltaY;
		if (game.viewportDeltaX || game.viewportDeltaY) {
			game.refreshBackground = true
		}
		game.viewportAdjustX = game.viewportLeft - game.viewportX;
		game.viewportAdjustY = game.viewportTop - game.viewportY
	}
};

var AStar = function() {
	function diagonalSuccessors($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
		if ($N) {
			$E && !grid[N][E] && (result[i++] = {x: E, y: N});
			$W && !grid[N][W] && (result[i++] = {x: W, y: N})
		}
		if ($S) {
			$E && !grid[S][E] && (result[i++] = {x: E, y: S});
			$W && !grid[S][W] && (result[i++] = {x: W, y: S})
		}
		return result
	}

	function diagonalSuccessorsFree($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
		$N = N > -1;
		$S = S < rows;
		$E = E < cols;
		$W = W > -1;
		if ($E) {
			$N && !grid[N][E] && (result[i++] = {x: E, y: N});
			$S && !grid[S][E] && (result[i++] = {x: E, y: S})
		}
		if ($W) {
			$N && !grid[N][W] && (result[i++] = {x: W, y: N});
			$S && !grid[S][W] && (result[i++] = {x: W, y: S})
		}
		return result
	}

	function nothingToDo($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
		return result
	}

	function successors(find, x, y, grid, rows, cols) {
		var N = y - 1, S = y + 1, E = x + 1, W = x - 1, $N = N > -1 && !grid[N][x], $S = S < rows && !grid[S][x], $E = E < cols && !grid[y][E], $W = W > -1 && !grid[y][W], result = [], i = 0;
		$N && (result[i++] = {x: x, y: N});
		$E && (result[i++] = {x: E, y: y});
		$S && (result[i++] = {x: x, y: S});
		$W && (result[i++] = {x: W, y: y});
		return find($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i)
	}

	function diagonal(start, end, f1, f2) {
		return f2(f1(start.x - end.x), f1(start.y - end.y))
	}

	function euclidean(start, end, f1, f2) {
		var x = start.x - end.x, y = start.y - end.y;
		return f2(x * x + y * y)
	}

	function manhattan(start, end, f1, f2) {
		return f1(start.x - end.x) + f1(start.y - end.y)
	}

	function AStar(grid, start, end, f) {
		var cols = grid[0].length, rows = grid.length, limit = cols * rows, f1 = Math.abs, f2 = Math.max, list = {}, result = [], open = [{
			x: start[0],
			y: start[1],
			f: 0,
			g: 0,
			v: start[0] + start[1] * cols
		}], length = 1, adj, distance, find, i, j, max, min, current, next;
		end = {x: end[0], y: end[1], v: end[0] + end[1] * cols};
		switch (f) {
			case "Diagonal":
				find = diagonalSuccessors;
			case "DiagonalFree":
				distance = diagonal;
				break;
			case "Euclidean":
				find = diagonalSuccessors;
			case "EuclideanFree":
				f2 = Math.sqrt;
				distance = euclidean;
				break;
			default:
				distance = manhattan;
				find = nothingToDo;
				break;
		}
		find || (find = diagonalSuccessorsFree);
		do {
			max = limit;
			min = 0;
			for (i = 0; i < length; ++i) {
				if ((f = open[i].f) < max) {
					max = f;
					min = i;
				}
			}
			current = open.splice(min, 1)[0];
			if (current.v != end.v) {
				--length;
				next = successors(find, current.x, current.y, grid, rows, cols);
				for (i = 0, j = next.length; i < j; ++i) {
					(adj = next[i]).p = current;
					adj.f = adj.g = 0;
					adj.v = adj.x + adj.y * cols;
					if (!(adj.v in list)) {
						adj.f = (adj.g = current.g + distance(adj, current, f1, f2)) + distance(adj, end, f1, f2);
						open[length++] = adj;
						list[adj.v] = 1;
					}
				}
			} else {
				i = length = 0;
				do {
					result[i++] = {x: current.x, y: current.y}
				} while (current = current.p);
				result.reverse();
			}
		} while (length);
		return result;
	}

	return AStar;
}();

function checkCollision() {
	var collisionObjects = [];
	var movement = 1 * this.speed / game.gridSize / game.speedAdjustmentFactor;
	var angleRadians = this.direction / this.directions * 2 * Math.PI;
	var newX = this.x - roundFloating(movement * Math.sin(angleRadians));
	var newY = this.y - roundFloating(movement * Math.cos(angleRadians));
	for (var i = game.obstructionGrid.length - 1; i >= 0; i--) {
		if (Math.abs(i + .5 - newY) < 3) {
			for (var j = game.obstructionGrid[i].length - 1; j >= 0; j--) {
				if (game.obstructionGrid[i][j] && Math.abs(j - newX + .5) < 3) {
					if (Math.pow(j + .5 - newX, 2) + Math.pow(i + .5 - newY, 2) < Math.pow(this.hardCollisionRadius / game.gridSize + .5, 2)) {
						collisionObjects.push({
							collisionType: "ultra-hard",
							withItem: {type: "wall", x: j + .5, y: i + .5}
						})
					} else if (Math.pow(j + .5 - newX, 2) + Math.pow(i + .5 - newY, 2) < Math.pow(this.softCollisionRadius / game.gridSize + .5, 2)) {
						collisionObjects.push({collisionType: "hard", withItem: {type: "wall", x: j + .5, y: i + .5}})
					} else if (Math.pow(j + .5 - newX, 2) + Math.pow(i + .5 - newY, 2) < Math.pow(this.softCollisionRadius / game.gridSize + .7, 2)) {
						collisionObjects.push({collisionType: "soft", withItem: {type: "wall", x: j + .5, y: i + .5}})
					}
				}
			}
		}
	}
	for (var i = game.items.length - 1; i >= 0; i--) {
		var item = game.items[i];
		var itemX, itemY;
		var crushableEnemy = false;
		if (item != this && item.type != "buildings" && (item.type == "infantry" || item.type == "vehicles") && Math.abs(item.x - newX) < 4 && Math.abs(item.y - newY) < 4) {
			var crushableEnemy = this.crusher && this.player !== item.player && item.crushable;
			if (false) {
				var itemMovement = item.speed / game.gridSize / game.speedAdjustmentFactor;
				var itemAngleRadians = item.direction / item.directions * 2 * Math.PI;
				itemX = item.x - roundFloating(itemMovement * Math.sin(itemAngleRadians));
				itemY = item.y - roundFloating(itemMovement * Math.cos(itemAngleRadians))
			} else {
				itemX = item.x;
				itemY = item.y
			}
			if (Math.pow(itemX - newX, 2) + Math.pow(itemY - newY, 2) < Math.pow((this.hardCollisionRadius + item.hardCollisionRadius) / game.gridSize, 2)) {
				if (crushableEnemy) {
					item.life = 0;
					item.infantryDeath = "die-squish"
				} else {
					collisionObjects.push({collisionType: "hard", withItem: item})
				}
			} else if (Math.pow(itemX - newX, 2) + Math.pow(itemY - newY, 2) < Math.pow((this.softCollisionRadius + item.hardCollisionRadius) / game.gridSize, 2)) {
				if (crushableEnemy) {
					item.life = 0;
					item.infantryDeath = "die-squish"
				} else {
					collisionObjects.push({collisionType: "soft-hard", withItem: item})
				}
			} else if (Math.pow(itemX - newX, 2) + Math.pow(itemY - newY, 2) < Math.pow((this.softCollisionRadius + item.softCollisionRadius) / game.gridSize, 2)) {
				if (crushableEnemy) {
				} else {
					collisionObjects.push({collisionType: "soft", withItem: item})
				}
			}
		}
	}
	return collisionObjects
}

function findClosestEmptySpot(point, opt) {
	var options = opt || {};
	var x = point.x;
	var y = point.y;
	for (var radius = options.minimumRadius || 1; radius < 10; radius++) {
		for (var i = -radius; i <= radius; i++) {
			for (var j = radius; j >= -radius; j--) {
				if (Math.abs(i) > radius - 1 && Math.abs(j) > radius - 1 && isEmptySpot({x: x + i, y: y + j})) {
					return {x: x + i, y: y + j};
				}
			}
		}
	}
}

function isEmptySpot(point) {
	if (!(point.x >= 0 && point.x <= game.obstructionGrid[0].length - 1 && point.y >= 0 && point.y <= game.obstructionGrid.length - 1 && !game.obstructionGrid[Math.floor(point.y)][Math.floor(point.x)])) {
		return false
	}
	for (var i = game.vehicles.length - 1; i >= 0; i--) {
		var item = game.vehicles[i];
		if (item != point && Math.abs(point.x - item.x) < 1 && Math.abs(point.y - item.y) < 1) {
			return false;
		}
	}
	for (var i = game.infantry.length - 1; i >= 0; i--) {
		var item = game.infantry[i];
		if (item != point && Math.abs(point.x - item.x) < 1 && Math.abs(point.y - item.y) < 1) {
			return false;
		}
	}
	for (var i = game.aircraft.length - 1; i >= 0; i--) {
		var item = game.aircraft[i];
		if (item != point && item.z < 1 / 8 && Math.abs(point.x - item.x) < 1 && Math.abs(point.y - item.y) < 1) {
			return false;
		}
	}
	return true;
}

function moveTo(goal) {
	this.lastMovementX = 0;
	this.lastMovementY = 0;
	var destination = {x: goal.x, y: goal.y, type: goal.type};
	if (destination.type == "buildings" || destination.type == "turrets") {
		if (this.name == "engineer" || this.name == "commando") {
			destination.y = goal.y + goal.gridShape.length - .5;
			if (goal.gridShape[0].length == 2) {
				if (this.x < goal.cgX) {
					destination.x = goal.x + .5
				} else {
					destination.x = goal.x + 1.5
				}
			} else {
				destination.x = goal.cgX
			}
		} else {
			if (this.y < goal.cgY) {
				destination.y = goal.y + .5
			} else {
				destination.y = goal.y + goal.gridShape.length - .5
			}
			if (this.x < goal.cgX) {
				destination.x = goal.x + .5
			} else {
				destination.x = goal.x + goal.gridShape[0].length - .5
			}
		}
	}
	var start = [Math.floor(this.x), Math.floor(this.y)];
	var end = [Math.floor(destination.x), Math.floor(destination.y)];
	if (this.start && this.start.x === start.x && this.start.y === start.y && this.destination && this.destination.x === destination.x && this.destination.y === destination.y && this.path && !game.buildingLandscapeChanged) {
	} else {
		var grid;
		if (game.type == "singleplayer") {
			if (this.player === game.player) {
				grid = $.extend(true, [], game.foggedObstructionGrid[this.player])
			} else {
				grid = $.extend(true, [], game.obstructionGrid)
			}
		} else {
			grid = $.extend(true, [], game.foggedObstructionGrid[this.player])
		}
		if (destination.type == "turrets" || destination.type == "buildings") {
			grid[Math.floor(destination.y)][Math.floor(destination.x)] = 0
		}
		var newDirection;
		if (start[1] < 0 || start[1] >= grid.length || start[0] < 0 || start[0] > grid[0].length) {
			this.path = [];
			newDirection = findAngle(destination, this, this.directions)
		} else {
			this.path = AStar(grid, start, end, "Euclidean");
			this.start = start;
			this.end = end;
			if (this.path.length > 1) {
				newDirection = findAngle(this.path[1], this.path[0], this.directions)
			} else if (start == end && !grid[start[1]][start[0]]) {
				newDirection = findAngle(destination, this, this.directions)
			} else {
				return false;
			}
		}
	}
	var collisionObjects = this.checkCollision();
	var movement, angleRadians;
	if (collisionObjects.length > 0) {
		this.colliding = true;
		if (this.path.length > 0) {
			collisionObjects.push({
				collisionType: "attraction",
				withItem: {x: this.path[1].x + .5, y: this.path[1].y + .5}
			})
		}
		var forceVector = {x: 0, y: 0};
		var hardCollision = false;
		var softHardCollision = false;
		for (var i = collisionObjects.length - 1; i >= 0; i--) {
			var collObject = collisionObjects[i];
			var objectAngleRadians = findAngle(collObject.withItem, this, this.directions) * 2 * Math.PI / this.directions;
			var forceMagnitude = 0;
			switch (collObject.collisionType) {
				case "ultra-hard":
					forceMagnitude = 8;
					hardCollision = true;
					break;
				case "hard":
					forceMagnitude = 3;
					hardCollision = true;
					break;
				case "soft-hard":
					forceMagnitude = 2;
					break;
				case "soft":
					forceMagnitude = 1;
					break;
				case "attraction":
					forceMagnitude = -.25;
					break
			}
			forceVector.x += roundFloating(forceMagnitude * Math.sin(objectAngleRadians));
			forceVector.y += roundFloating(forceMagnitude * Math.cos(objectAngleRadians))
		}
		newDirection = findAngle(forceVector, {x: 0, y: 0}, this.directions);
		if (!hardCollision) {
			movement = this.speed / game.gridSize / game.speedAdjustmentFactor;
			angleRadians = this.direction / this.directions * 2 * Math.PI;
			this.lastMovementX = -roundFloating(movement * Math.sin(angleRadians));
			this.lastMovementY = -roundFloating(movement * Math.cos(angleRadians));
			var newX = this.x + this.lastMovementX;
			var newY = this.y + this.lastMovementY;
			this.x = newX;
			this.y = newY;
			this.turnTo(newDirection);
		} else {
			this.turnTo(newDirection);
		}
	} else {
		this.colliding = false;
		if (Math.abs(angleDiff(newDirection, this.direction)) < this.directions / 4) {
			movement = this.speed / game.gridSize / game.speedAdjustmentFactor;
			if (this.prone) {
				movement = movement / 2;
			}
			angleRadians = this.direction / this.directions * 2 * Math.PI;
			this.lastMovementX = -roundFloating(movement * Math.sin(angleRadians));
			this.lastMovementY = -roundFloating(movement * Math.cos(angleRadians));
			this.x = this.x + this.lastMovementX;
			this.y = this.y + this.lastMovementY;
		}
		if (this.direction != newDirection) {
			this.turnTo(newDirection);
		}
	}
	return true;
}

function findEnemyInRange() {
	if (!this.primaryWeapon) {
		console.log("why am i looking for enemy if i cant do anything??", this.name, this.orders.type);
		return;
	}
	if (this.name == "commando") {
		return;
	}
	var sightBonus = 0;
	if (this.type == "vehicles" || this.type == "infantry") {
		sightBonus = 1;
	}
	if (this.orders && this.orders.type == "guard") {
		sightBonus = 2;
	}
	if (this.orders && this.orders.type == "area guard") {
		sightBonus = 3;
	}
	if (this.orders && this.orders.type == "hunt") {
		sightBonus = 50;
	}
	var range = this.weapon ? this.weapon.range : this.sight;
	var rangeSquared = Math.pow(range + sightBonus, 2);
	var lastDistance;
	var lastItem = undefined;
	var allies = maps.currentMapData.allies ? maps.currentMapData.allies[this.player] : "None";
	for (var i = 0; i < game.attackableItems.length; i++) {
		var item = game.attackableItems[i];
		if (item.player != this.player && item.player != "Neutral" && item.player != allies && item.player !== undefined && item.type != "trees" && item.type != "walls" && this.canAttackEnemy(item)) {
			var distance = Math.pow((item.cgX || item.x) - this.x, 2) + Math.pow((item.cgY || item.y) - this.y, 2);
			if (distance <= rangeSquared && (!lastItem || lastDistance > distance)) {
				lastDistance = distance;
				lastItem = item;
			}
		}
	}
	return lastItem;
}

function canAttackEnemy(item) {
	if (item == this) {
		return false;
	}
	if (item.cloaked) {
		if (this.type == "infantry" || this.type == "turrets" || this.type == "vehicles") {
			var distance = Math.pow((item.cgX || item.x) - this.cgX, 2) + Math.pow((item.cgY || item.y) - this.cgY, 2);
			if (distance > 2.5) {
				return false;
			}
		} else {
			return false;
		}
	}
	if (item.lifeCode == "dead") {
		return false;
	}
	if (item.type == "walls" && !warheads[bullets[item.weapon.projectile]].walls) {
		return false;
	}
	if (item.type == "trees" && !warheads[bullets[item.weapon.projectile]].wood) {
		return false;
	}
	if (item.type == "ships" && this.type != "turrets") {
		return false;
	}
	if (item.type == "aircraft" && item.z > 0 && !this.weapon.canAttackAir) {
		return false;
	}
	if ((item.type != "aircraft" || item.z <= 0) && this.name == "sam-site") {
		return false;
	}
	return true;
}

function findAngle(object, unit, directions) {
	var dy = (object.cgY || object.y) - (unit.cgY || unit.y);
	var dx = (object.cgX || object.x) - (unit.cgX || unit.x);
	var angle = wrapDirection(directions / 2 + Math.round(Math.atan2(dx, dy) * directions / (2 * Math.PI)), directions);
	return angle;
}

function wrapDirection(direction, directions) {
	if (direction < 0) {
		direction += directions;
	}
	if (direction >= directions) {
		direction -= directions;
	}
	return direction;
}

function addAngle(angle, increment, base) {
	angle = angle + increment;
	if (angle > base - 1) {
		angle -= base;
	}
	if (angle < 0) {
		angle += base;
	}
	return angle;
}

function angleDiff(angle1, angle2, directions) {
	if (angle1 >= directions / 2) {
		angle1 = angle1 - directions;
	}
	if (angle2 >= directions / 2) {
		angle2 = angle2 - directions;
	}
	var diff = angle2 - angle1;
	if (diff < -directions / 2) {
		diff += directions;
	}
	if (diff > directions / 2) {
		diff -= directions;
	}
	return diff;
}

var multiplayer = {
	websocket_url: "wss://zadarkside.ro",
	websocket: undefined,
	gameSpeed: 1,
	start: function() {
		$(".messages").html("");
		game.type = "multiplayer";
		var WebSocketObject = window.WebSocket || window.MozWebSocket;
		if (!WebSocketObject) {
			menus.showMessageBox("WebSockets Not Available", "Your browser does not support HTML5 WebSockets. Multiplayer will not work.", function() {
				menus.show("game-type")
			});
			return
		}

		try {
			this.websocket = new WebSocketObject(this.websocket_url);
		} catch (e) {
			console.log(e);
		}

		this.websocket.onmessage = multiplayer.handleWebSocketMessage;
		var connectionErrorMessage = function (evt) {
			if (!game.running) {
				menus.showMessageBox("Multiplayer Server Not Available", "Problem connecting with C&amp;C-HTML5 multiplayer server. <br><br>The server may either have too many connected players or has been switched off for maintenance.<br><br>Please try again later.", function() {
					menus.show("game-type")
				})
			} else {
				multiplayer.pauseLevel();
				menus.showMessageBox("Connection Lost", "You have got disconnected from the C&amp;C-HTML5 multiplayer server. <br><br> This may be because of network connectivity issues, or the server may have been switched off for maintenance.", function() {
					menus.show("game-type")
				})
			}
		};
		this.websocket.onclose = connectionErrorMessage;
		this.websocket.onerror = connectionErrorMessage;
		this.websocket.onopen = function() {
			menus.show("join-network-game")
		}
	},
	gameOptions: function() {
		menus.show("multiplayer-game-options")
	},
	pauseLevel: function() {
		sounds.stopMusic();
		game.running = false;
		clearInterval(game.animationInterval)
	},
	handleWebSocketMessage: function (message) {
		var messageObject = JSON.parse(message.data);
		switch (messageObject.type) {
			case"room_list":
				multiplayer.updateRoomStatus(messageObject.status);
				multiplayer.updatePlayerList();
				break;
			case"latency_ping":
				multiplayer.sendWebSocketMessage({type: "latency_pong", userAgent: navigator.userAgent});
				break;
			case"system_message":
				var systemMessageHTML = "<p style='color:white'>SYSTEM: " + messageObject.details + "</p>";
				$(".messages").append($(systemMessageHTML));
				multiplayer.showInGameMessages();
				$(".messages").each(function() {
					$(this).animate({scrollTop: $(this).prop("scrollHeight")})
				});
				sounds.play("system_message");
				break;
			case"lobby_message":
				var lobbyMessageHTML = "<p style='color:" + messageObject.color + "'>" + messageObject.from + ": " + messageObject.details + "</p>";
				$("#join-network-game-menu-div .messages").append($(lobbyMessageHTML));
				$(".messages").each(function() {
					$(this).animate({scrollTop: $(this).prop("scrollHeight")})
				});
				if (menus.isActive("join-network-game")) {
					sounds.play("lobby_message")
				}
				break;
			case"chat_message":
				var messageHTML = "<p style='color:" + messageObject.color + "'>" + messageObject.from + ": " + messageObject.details + "</p>";
				$(".messages").append($(messageHTML));
				multiplayer.showInGameMessages();
				$(".messages").each(function() {
					$(this).animate({scrollTop: $(this).prop("scrollHeight")})
				});
				if (menus.isActive("start-network-game" || menus.isActive("joined-network-game"))) {
					sounds.play("lobby_message")
				} else {
					sounds.play("chat_message")
				}
				break;
			case"create_new_game_fail":
				menus.showMessageBox("Could Not Create Game", messageObject.details);
				$("#join-network-game-menu-div input[type='button']").attr("disabled", false);
				break;
			case"create_new_game_success":
				multiplayer.playerId = messageObject.playerId;
				multiplayer.roomId = messageObject.roomId;
				multiplayer.color = messageObject.color;
				multiplayer.team = messageObject.team;
				menus.show("start-network-game");
				$(".input-message").css("color", multiplayer.color);
				menus.showMessageBox("Game Created", "New game created (" + messageObject.roomName + "). You need at least one other player to join before starting the game.", function() {
					$("#start-network-game-menu-div .starting-credits").focus()
				});
				break;
			case"join_existing_game_fail":
				menus.showMessageBox("Could Not Join Game", messageObject.details);
				$("#join-network-game-menu-div input[type='button']").attr("disabled", false);
				break;
			case"kicked_from_game":
				menus.show("join-network-game");
				menus.showMessageBox("Kicked Out From Game", messageObject.details);
				break;
			case"join_existing_game_success":
				menus.show("joined-network-game");
				menus.showMessageBox("Game Joined", "You have joined the game (" + messageObject.roomName + "). Wait for the host to start the game.");
				multiplayer.playerId = messageObject.playerId;
				multiplayer.roomId = messageObject.roomId;
				multiplayer.color = messageObject.color;
				multiplayer.team = messageObject.team;
				$(".input-message").css("color", multiplayer.color);
				break;
			case"start_game_fail":
				menus.showMessageBox("Could Not Start Game", messageObject.details);
				$("#start-network-game-menu-div input").attr("disabled", false);
				break;
			case"init_game":
				multiplayer.initializeMultiplayer(messageObject.details);
				break;
			case"start_playing_game":
				multiplayer.startLevel();
				multiplayer.showInGameMessages();
				break;
			case"game_tick":
				multiplayer.lastReceivedTick = messageObject.gameTick;
				multiplayer.commands[messageObject.gameTick] = messageObject.commands;
				break;
			case"end_defeat":
				multiplayer.endGame("failure");
				break;
			case"end_victory":
				multiplayer.endGame("success");
				break;
			case"report_desync":
				multiplayer.sendDeSyncReport();
				break;
			case"end_desync":
				multiplayer.endGame("desync");
				break
		}
	},
	showInGameMessages: function() {
		if (game.running) {
			$("#gameinterfacescreen .messages").fadeIn();
			$(".messages").each(function() {
				$(this).animate({scrollTop: $(this).prop("scrollHeight")})
			});
			clearTimeout(multiplayer.chatHideTimeout);
			multiplayer.chatHideTimeout = setInterval(function() {
				$("#gameinterfacescreen .messages").fadeOut(1e3)
			}, 1e4)
		} else {
			$(".messages").each(function() {
				$(this).animate({scrollTop: $(this).prop("scrollHeight")})
			})
		}
	},
	surrender: function (message) {
		multiplayer.sendWebSocketMessage({type: "surrender"})
	},
	saveMission: function() {
		var savedGame = {
			gameTick: game.gameTick,
			player: game.player,
			commands: multiplayer.commands,
			level: multiplayer.currentLevel,
			players: multiplayer.players,
			credits: multiplayer.credits
		};
		localStorage.lastMultiplayerGame = JSON.stringify(savedGame);
		return savedGame
	},
	sendDeSyncReport: function() {
		var report = {savedGame: multiplayer.saveMission(), items: []};
		for (var i = game.items.length - 1; i >= 0; i--) {
			var item = game.items[i];
			report.items.unshift({
				uid: item.uid,
				name: item.name,
				team: item.team,
				player: item.player,
				type: item.type,
				x: item.x,
				y: item.y
			})
		}
		multiplayer.sendWebSocketMessage({type: "desync_report", report: report})
	},
	updateSavedMissionList: function() {
		var savedGameString = localStorage.lastMultiplayerGame;
		if (savedGameString || multiplayer.debugSavedGame) {
			var savedGame;
			if (multiplayer.debugSavedGame) {
				savedGame = multiplayer.debugSavedGame;
				savedGameString = JSON.stringify(multiplayer.debugSavedGame)
			} else if (savedGameString) {
				savedGame = JSON.parse(savedGameString)
			}
			if (savedGameString) {
				var savedGameDescription = "Map: " + maps.multiplayer[savedGame.level] + " Players: " + savedGame.players.length;
				$("#replay-game-menu-div .mission-list").append("<option value='-1'>[MULTIPLAYER] " + savedGameDescription + "</option>")
			}
		}
	},
	endGame: function (type) {
		multiplayer.pauseLevel();
		multiplayer.websocket.onopen = null;
		multiplayer.websocket.onclose = null;
		multiplayer.websocket.onerror = null;
		multiplayer.websocket.close();
		$("#gameinterfacescreen .messages").hide();
		$("#gameinterfacescreen .input-message").hide();
		menus.show("mission-ended");
		var sweetMessage = "<br><br>If you enjoyed playing this game, please take the time to tell all your friends about C&amp;C - HTML5.";
		multiplayer.saveMission();
		if (type == "success") {
			sounds.play("mission_accomplished");
			game.showEnding = "success";
			setTimeout(function() {
				menus.showMessageBox("Victory", "Congratulations! You have won the match." + sweetMessage, function() {
					menus.show("game-type")
				})
			}, 3e3)
		} else if (type == "failure") {
			sounds.play("mission_failure");
			game.showEnding = "failure";
			setTimeout(function() {
				menus.showMessageBox("Failure", "You have lost the match." + sweetMessage, function() {
					menus.show("game-type")
				})
			}, 3e3)
		} else if (type == "desync") {
			menus.showMessageBox("Game Out of Sync", 'Your game has gone out of sync with the other player. The administrator has been notified and he will review your game as soon as possible. <br><br>If the problem persists, please wait and watch the <a href="http://www.facebook.com/CommandConquerHtml5" target="_blank">C&amp;C - HTML5 Facebook Page</a> for updates.', function() {
				menus.show("game-type")
			})
		}
	},
	startLevel: function() {
		game.gameTick = 0;
		multiplayer.commands = [];
		sidebar.init();
		multiplayer.resumeLevel();
		sounds.playMusic()
	},
	resumeLevel: function() {
		menus.hide();
		game.running = true;
		game.animationInterval = setInterval(multiplayer.animationLoop, game.animationTimeout / game.gameSpeed);
		game.animationLoop();
		game.refreshBackground = true;
		game.drawingLoop()
	},
	animationLoop: function() {
		if (game.gameTick <= multiplayer.lastReceivedTick) {
			multiplayer.gameLagging = false;
			var commands = multiplayer.commands[game.gameTick];
			if (commands) {
				for (var i = 0; i < multiplayer.commands[game.gameTick].length; i++) {
					var commandObject = commands[i];
					game.receiveCommand(commandObject.uids, commandObject.command)
				}
			}
			game.animationLoop();
			if (!multiplayer.sentCommandForTick) {
				multiplayer.sendCommand()
			}
			game.gameTick++;
			multiplayer.sentCommandForTick = false
		} else {
			multiplayer.gameLagging = true
		}
	},
	initializeMultiplayer: function (details) {
		menus.hide();
		game.type = "multiplayer";
		game.gameSpeed = details.gameSpeed || 1;
		multiplayer.currentLevel = details.level;
		multiplayer.players = details.players;
		multiplayer.credits = details.credits;
		var mapName = game.type + "/" + maps[game.type][multiplayer.currentLevel];
		maps.load(mapName, function() {
			multiplayer.sendWebSocketMessage({type: "initialized_game"})
		})
	},
	replaySavedLevelInteractive: function (savedGame) {
		game.gameTick = 0;
		multiplayer.commands = $.extend(true, [], savedGame.commands);
		game.team = savedGame.player.team;
		sidebar.init();
		sounds.muteAudio = false;
		menus.hide();
		game.running = true;
		game.replay = true;
		game.replayTick = savedGame.gameTick;
		multiplayer.animationLoopReplay();
		game.refreshBackground = true;
		game.drawingLoop();
		this.resumeReplay()
	},
	pauseReplay: function() {
		clearInterval(game.animationInterval)
	},
	exitReplay: function() {
		game.running = false;
		game.replay = false;
		clearInterval(game.animationInterval);
		menus.show("game-type")
	},
	resumeReplay: function() {
		clearInterval(game.animationInterval);
		game.gameSpeed = 1;
		game.animationInterval = setInterval(function() {
			if (game.gameTick <= game.replayTick) {
				multiplayer.animationLoopReplay()
			} else {
				multiplayer.pauseReplay()
			}
		}, game.animationTimeout / game.gameSpeed)
	},
	fastForwardReplay: function() {
		clearInterval(game.animationInterval);
		game.gameSpeed *= 2;
		if (game.gameSpeed > 8) {
			game.gameSpeed = 8
		}
		game.animationInterval = setInterval(function() {
			if (game.gameTick <= game.replayTick) {
				multiplayer.animationLoopReplay()
			} else {
				multiplayer.pauseReplay()
			}
		}, game.animationTimeout / game.gameSpeed)
	},
	animationLoopReplay: function() {
		game.gameTick++;
		if (multiplayer.commands.length > game.gameTick && multiplayer.commands[game.gameTick]) {
			for (var i = 0; i < multiplayer.commands[game.gameTick].length; i++) {
				var commandObject = multiplayer.commands[game.gameTick][i];
				game.receiveCommand(commandObject.uids, commandObject.command)
			}
		}
		game.animationLoop()
	},
	loadMultiplayerReplay: function (index) {
		menus.hide();
		game.type = "multiplayer";
		game.gameSpeed = 1;
		var savedGame;
		if (multiplayer.debugSavedGame) {
			savedGame = multiplayer.debugSavedGame
		} else {
			savedGame = JSON.parse(localStorage.lastMultiplayerGame)
		}
		multiplayer.currentLevel = savedGame.level;
		multiplayer.players = savedGame.players;
		multiplayer.credits = savedGame.credits;
		multiplayer.playerId = savedGame.player;
		var mapName = game.type + "/" + maps[game.type][multiplayer.currentLevel];
		maps.load(mapName, function() {
			multiplayer.replaySavedLevelInteractive(savedGame)
		})
	},
	initializeLevel: function (data) {
		game.colorHash = {};
		game.players = [];
		game.kills = {};
		game.deaths = {};
		game.cash = {};
		game.player = multiplayer.playerId;
		var startingTypes = Object.keys(data.starting).sort();
		for (var st = startingTypes.length - 1; st >= 0; st--) {
			var type = startingTypes[st];
			var startingArray = data.starting[type];
			for (var i = 0; i < startingArray.length; i++) {
				var item = startingArray[i];
				item.type = type;
				game.add(item)
			}
		}
		for (var i = 0; i < multiplayer.players.length; i++) {
			var player = multiplayer.players[i];
			game.colorHash[player.playerId] = {index: i, color: player.color, team: player.team};
			game.players.push(player.playerId);
			game.kills[player.playerId] = 0;
			game.deaths[player.playerId] = 0;
			game.cash[player.playerId] = multiplayer.credits;
			var spawnLocation = data.spawns[player.spawn];
			if (player.playerId === multiplayer.playerId) {
				game.viewportX = spawnLocation.viewportx * game.gridSize;
				game.viewportY = spawnLocation.viewporty * game.gridSize;
				multiplayer.averageLatency = player.averageLatency;
				game.team = player.team
			}
			var startingUnits = Object.keys(data.startingunits[player.team]).sort();
			for (var su = startingUnits.length - 1; su >= 0; su--) {
				var type = startingUnits[su];
				var startingArray = data.startingunits[player.team][type];
				for (var j = 0; j < startingArray.length; j++) {
					var item = $.extend(true, [], startingArray[j]);
					item.type = type;
					item.x = item.dx + spawnLocation.x;
					item.y = item.dy + spawnLocation.y;
					item.player = player.playerId;
					item.team = player.team;
					game.add(item)
				}
			}
		}
	},
	updateRoomStatus: function (roomStatus) {
		multiplayer.roomStatus = roomStatus;
		$(".games-list").empty();
		for (var i = 0; i < multiplayer.roomStatus.length; i++) {
			var room = multiplayer.roomStatus[i];
			$(".games-list").append($("<option>").attr("value", room.roomId).attr("selected", room.roomId == multiplayer.roomId).text(room.roomName + (room.status == "running" ? " (RUNNING)" : "")))
		}
	},
	selectGame: function() {
		multiplayer.roomId = $("#join-network-game-menu-div .games-list option:selected").val();
		multiplayer.updatePlayerList()
	},
	updatePlayerList: function() {
		var playerSelect = $(".player-list");
		playerSelect.empty();
		if (multiplayer.roomId) {
			for (var i = 0; i < multiplayer.roomStatus.length; i++) {
				var room = multiplayer.roomStatus[i];
				if (room.roomId == multiplayer.roomId) {
					for (var j = 0; j < room.players.length; j++) {
						var player = room.players[j];
						playerSelect.append($("<option style='color:" + player.color + "'>").attr("value", player.id).text(player.name + " (" + player.team.toUpperCase() + ")"))
					}
				}
			}
		}
	},
	trimmedPlayerName: function() {
		var name = $.trim($("#join-network-game-menu-div .player-name").val().replace(/\W/g, ""));
		$("#join-network-game-menu-div .player-name").val(name);
		return name
	},
	createNewGame: function() {
		var name = multiplayer.trimmedPlayerName();
		if (name === "") {
			menus.showMessageBox("Name not entered", "You need to enter your name before creating a new game.", function() {
				$("#join-network-game-menu-div .player-name").focus()
			});
			return
		}
		$("#join-network-game-menu-div input[type='button']").attr("disabled", true);
		var color = $("input:radio[name=multiplayer-team-color]:checked").val();
		var team = $("input:radio[name=multiplayer-team]:checked").val();
		multiplayer.sendWebSocketMessage({type: "create_new_game", name: name, color: color, team: team})
	},
	cancelNewGame: function() {
		multiplayer.sendWebSocketMessage({type: "cancel_new_game"});
		menus.show("join-network-game");
		menus.showMessageBox("Game Cancelled", "The game has been cancelled.")
	},
	rejectPlayer: function() {
		var playerId = $("#start-network-game-menu-div .player-list").val();
		if (!playerId) {
			menus.showMessageBox("", "You must select a player to reject.");
			return
		}
		if (playerId == multiplayer.playerId) {
			menus.showMessageBox("", "You can't reject yourself! You might develop serious self-esteem problems.");
			return
		}
		multiplayer.sendWebSocketMessage({type: "reject_player", playerId: playerId})
	},
	joinExistingGame: function() {
		var name = multiplayer.trimmedPlayerName();
		if (name === "") {
			menus.showMessageBox("Name not entered", "You need to enter your name before joining a game.", function() {
				$("#join-network-game-menu-div .player-name").focus()
			});
			return
		}
		var roomId = $("#join-network-game-menu-div .games-list option:selected").val();
		if (!roomId) {
			menus.showMessageBox("No Game Selected", "Please select a game to join. <br><br>If there are no games for you to join, please try starting a new game so your friends can join.");
			return
		}
		$("#join-network-game-menu-div input[type='button']").attr("disabled", true);
		var color = $("input:radio[name=multiplayer-team-color]:checked").val();
		var team = $("input:radio[name=multiplayer-team]:checked").val();
		multiplayer.sendWebSocketMessage({
			type: "join_existing_game",
			name: name,
			color: color,
			team: team,
			roomId: roomId
		})
	},
	cancelJoinedGame: function() {
		multiplayer.sendWebSocketMessage({type: "cancel_joined_game"});
		menus.show("join-network-game")
	},
	cancel: function() {
		multiplayer.websocket.onopen = null;
		multiplayer.websocket.onclose = null;
		multiplayer.websocket.onerror = null;
		multiplayer.websocket.close();
		menus.show("game-type")
	},
	sendWebSocketMessage: function (messageObject) {
		this.websocket.send(JSON.stringify(messageObject))
	},
	sendMessageToPlayers: function (message) {
		multiplayer.sendWebSocketMessage({type: "message_to_players", message: message})
	},
	sendMessageToLobby: function (message) {
		var name = multiplayer.trimmedPlayerName();
		var color = $("input:radio[name=multiplayer-team-color]:checked").val();
		if (name === "") {
			menus.showMessageBox("Name not entered", "You need to enter your name before sending a message.", function() {
				$("#join-network-game-menu-div .player-name").focus()
			});
			return
		}
		multiplayer.sendWebSocketMessage({type: "message_to_lobby", message: message, name: name, color: color})
	},
	startNewGame: function (details) {
		$("#start-network-game-menu-div input").attr("disabled", true);
		multiplayer.sendWebSocketMessage({type: "start_game", details: details})
	},
	getGameHash: function() {
		var gameHash = "_" + game.gameTick + "_" + game.items.length + "_" + game.infantry.length + "_" + (game.infantry.length ? game.infantry[game.infantry.length - 1].uid + "_" : "0_") + game.vehicles.length + "_" + (game.vehicles.length ? game.vehicles[game.vehicles.length - 1].uid + "_" : "0_") + game.buildings.length + "_" + (game.buildings.length ? game.buildings[game.buildings.length - 1].uid + "_" : "0_") + game.counter + "_";
		return gameHash
	},
	sendCommand: function (commandUids, command) {
		multiplayer.sentCommandForTick = true;
		var gameHash = multiplayer.getGameHash();
		multiplayer.sendWebSocketMessage({
			type: "command",
			uids: commandUids,
			command: command,
			gameTick: game.gameTick,
			hash: gameHash
		})
	}
};

var ships = {
	type: "ships",
	list: {
		gunboat: {
			name: "gunboat",
			label: "Gun Boat",
			speed: 8,
			turnSpeed: 1,
			armor: 3,
			primaryWeapon: "boatmissile",
			cost: 300,
			sight: 5,
			hitPoints: 700,
			direction: 0,
			directions: 2,
			turretDirection: 0,
			turretDirections: 32,
			animationIndex: 0,
			wakeAnimationIndex: 0,
			firesTwice: true,
			spriteImages: [{name: "move-healthy-0", count: 32}, {
				name: "move-damaged-0",
				count: 32
			}, {name: "move-ultra-damaged-0", count: 32}, {name: "move-healthy-1", count: 32}, {
				name: "move-damaged-1",
				count: 32
			}, {name: "move-ultra-damaged-1", count: 32}],
			pixelOffsetX: -25,
			pixelOffsetY: -10,
			pixelHeight: 19,
			pixelWidth: 51,
			wakePixelHeight: 8,
			wakePixelWidth: 85,
			softCollisionRadius: 25,
			animate: function() {
				this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
				if (this.lifeCode == "dead") {
					game.remove(this);
					game.add({type: "effects", name: "frag3", x: this.x + .5, y: this.y + .5});
					sounds.play("xplosml2");
					game.kills[this.attackedBy]++;
					game.deaths[this.player]++;
					return
				}
				this.imageList = this.spriteArray["move-" + this.lifeCode + "-" + this.direction];
				var td = Math.round(this.turretDirection);
				if (td >= this.turretDirections) {
					td -= this.turretDirections
				}
				this.imageOffset = this.imageList.offset + td;
				this.wakeImageList = this.wakeSpriteArray["wake-" + (1 - this.direction)];
				this.wakeImageOffset = this.wakeImageList.offset + this.wakeAnimationIndex;
				this.wakeAnimationIndex++;
				if (this.wakeAnimationIndex >= this.wakeImageList.count) {
					this.wakeAnimationIndex = 0
				}
				this.cgX = this.x;
				this.cgY = this.y
			},
			draw: function() {
				this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
				this.interpolatedY = this.y + game.movementInterpolationFactor * this.lastMovementY;
				var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft;
				var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop;
				if (x < -this.pixelWidth + this.pixelOffsetX || y < -this.pixelHeight + this.pixelOffsetY || x > game.viewportWidth + this.pixelWidth - this.pixelOffsetX || y > game.viewportHeight + this.pixelHeight - this.pixelOffsetY) {
					return
				}
				var wakeXOffset = (this.pixelWidth - this.wakePixelWidth) / 2;
				var wakeYOffset = this.pixelHeight - this.wakePixelHeight;
				game.foregroundContext.drawImage(this.wakeSpriteSheet, this.wakeImageOffset * this.wakePixelWidth, 0, this.wakePixelWidth, this.wakePixelHeight, x + this.pixelOffsetX + wakeXOffset, y + this.pixelOffsetY + wakeYOffset, this.wakePixelWidth, this.wakePixelHeight);
				game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x + this.pixelOffsetX, y + this.pixelOffsetY, this.pixelWidth, this.pixelHeight);
				if (this.selected) {
					this.drawSelection()
				}
			},
			processOrders: function() {
				this.lifeCode = getLifeCode(this);
				this.lastMovementY = 0;
				this.lastMovementX = 0;
				switch (this.orders.type) {
					case"patrol":
						var newDirection;
						if (Math.abs(this.x - this.orders.to.x) < .5) {
							this.orders = {type: "patrol", from: this.orders.to, to: this.orders.from}
						} else {
							this.moveTo(this.orders.to)
						}
						if (this.weapon.cooldown > 0) {
							this.weapon.cooldown = this.weapon.cooldown - 1
						}
						var enemy = this.findEnemyInRange();
						this.enemy = enemy;
						if (enemy) {
							newDirection = findAngle(enemy, this, this.turretDirections);
							if (Math.abs(angleDiff(this.turretDirection, newDirection)) > 1) {
								this.aimTo(newDirection)
							}
						} else {
							this.aimTo(this.direction * 16 + 8)
						}
						if (enemy && this.weapon.cooldown <= 0) {
							if (Math.abs(angleDiff(this.turretDirection, newDirection)) < 8) {
								this.weapon.fire(this, this.turretDirection, enemy)
							}
						}
						break
				}
			},
			drawSelection: function() {
				var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft + this.pixelOffsetX;
				var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop + this.pixelOffsetY;
				game.foregroundContext.drawImage(this.selectImage, x, y);
				var selectBarHeight = 4;
				game.foregroundContext.beginPath();
				game.foregroundContext.rect(x, y - selectBarHeight - 3, this.pixelWidth * this.life / this.hitPoints, selectBarHeight);
				if (this.lifeCode == "healthy") {
					game.foregroundContext.fillStyle = "lightgreen"
				} else if (this.lifeCode == "damaged") {
					game.foregroundContext.fillStyle = "yellow"
				} else {
					game.foregroundContext.fillStyle = "red"
				}
				game.foregroundContext.fill();
				game.foregroundContext.beginPath();
				game.foregroundContext.strokeStyle = "black";
				game.foregroundContext.rect(x, y - selectBarHeight - 3, this.pixelWidth, selectBarHeight);
				game.foregroundContext.stroke()
			},
			findEnemyInRange: findEnemyInRange,
			moveTo: function (destination) {
				var start = this;
				var end = destination;
				if (Math.abs(start.x - end.x) > .2) {
					var newDirection = start.x < end.x ? 1 : 0;
					if (this.direction != newDirection) {
						this.direction = newDirection
					} else {
						var movement = this.speed / game.gridSize / game.speedAdjustmentFactor;
						this.lastMovementX = this.direction === 0 ? -movement : movement;
						this.x = this.x + this.lastMovementX
					}
				}
			}
		},
		hovercraft: {
			name: "hovercraft",
			label: "Hovercraft",
			speed: 30,
			turnSpeed: 127,
			armor: 2,
			unselectable: true,
			cargo: [],
			cost: 300,
			sight: 3,
			hitPoints: 400,
			directions: 4,
			spriteImages: [{name: "move", count: 1, direction: true}],
			pixelOffsetX: -24,
			pixelOffsetY: -24,
			z: -1,
			pixelHeight: 48,
			pixelWidth: 48,
			softCollisionRadius: 24,
			animate: function() {
				this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
				this.imageList = this.spriteArray["move-" + this.direction];
				this.imageOffset = this.imageList.offset;
				for (var i = this.cargo.length - 1; i >= 0; i--) {
					var unit = this.cargo[i];
					switch (unit.type) {
						case"infantry":
							unit.x = this.x + Math.floor(i / 2) / 2 - .25;
							unit.y = this.y + i % 2 / 2 - .25;
							if (!unit.hitPoints) {
								unit = infantry.add(unit);
								unit.direction = Math.floor(this.direction * unit.directions / this.directions);
								this.cargo[i] = unit
							}
							unit.animate();
							unit.preRender();
							break;
						case"vehicles":
							unit.x = this.x;
							unit.y = this.y;
							if (!unit.hitPoints) {
								unit = vehicles.add(unit);
								unit.direction = Math.floor(this.direction * unit.directions / this.directions);
								unit.turretDirection = Math.floor(this.direction * unit.directions / this.directions);
								this.cargo[i] = unit
							}
							unit.animate();
							break
					}
				}
				this.cgX = this.x;
				this.cgY = this.y
			},
			draw: function() {
				this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
				this.interpolatedY = this.y + game.movementInterpolationFactor * this.lastMovementY;
				var x = Math.floor(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft;
				var y = Math.floor(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop;
				if (x < -this.pixelWidth + this.pixelOffsetX || y < -this.pixelHeight + this.pixelOffsetY || x > game.viewportWidth + this.pixelWidth - this.pixelOffsetX || y > game.viewportHeight + this.pixelHeight - this.pixelOffsetY) {
					return
				}
				game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x + this.pixelOffsetX, y + this.pixelOffsetY, this.pixelWidth, this.pixelHeight);
				for (var i = this.cargo.length - 1; i >= 0; i--) {
					var unit = this.cargo[i];
					if (unit.draw) {
						unit.lastMovementY = this.lastMovementY;
						unit.lastMovementX = this.lastMovementX;
						unit.draw()
					}
				}
			},
			processOrders: function() {
				this.lastMovementY = 0;
				this.lastMovementX = 0;
				switch (this.orders.type) {
					case"unload":
						if (Math.abs(this.x - this.orders.to.x) < .5 && Math.abs(this.y - this.orders.to.y) < .5) {
							if (this.cargo.length > 0) {
								for (var i = this.cargo.length - 1; i >= 0; i--) {
									var unit = this.cargo.pop();
									unit.lastMovementY = this.lastMovementY;
									unit.lastMovementX = this.lastMovementX;
									unit.orders = {type: "move", to: {x: unit.x, y: unit.y - 3}};
									game.add(unit)
								}
							}
							var hovercraft = this;
							var to = this.orders.from;
							this.orders = {type: "waitforreturn", to: to, timer: 25}
						} else {
							this.moveTo(this.orders.to)
						}
						break;
					case"waitforreturn":
						if (this.orders.timer > 0) {
							this.orders.timer--
						} else {
							this.orders.type = "return"
						}
						break;
					case"return":
						if (Math.abs(this.x - this.orders.to.x) < .5 && Math.abs(this.y - this.orders.to.y) < .5) {
							game.remove(this)
						} else {
							this.moveTo(this.orders.to)
						}
						break
				}
			},
			moveTo: function (destination) {
				var start = this;
				var end = destination;
				if (Math.abs(start.x - end.x) > .5 || Math.abs(this.y - this.orders.to.y) > .5) {
					if (start.x < end.x) {
						newDirection = 3
					} else if (start.x > end.x) {
						newDirection = 1
					} else if (start.y < end.y) {
						newDirection = 2
					} else if (start.y > end.y) {
						newDirection = 0
					}
					if (this.direction != newDirection) {
						this.direction = newDirection
					} else {
						var movement = this.speed / game.gridSize / game.speedAdjustmentFactor;
						this.lastMovementX = this.direction === 1 ? -movement : this.direction === 3 ? movement : 0;
						this.lastMovementY = this.direction === 0 ? -movement : this.direction === 2 ? movement : 0;
						this.x = this.x + this.lastMovementX;
						this.y = this.y + this.lastMovementY
					}
				} else {
					console.log("Reached close to destination", start, end)
				}
			}
		}
	},
	defaults: {
		z: 0,
		lastMovementX: 0,
		lastMovementY: 0,
		direction: 0,
		selected: false,
		path: undefined,
		spriteSheet: undefined,
		canAttackEnemy: canAttackEnemy,
		aimTo: function (toDirection) {
			if (toDirection > this.turretDirection && toDirection - this.turretDirection < this.turretDirections / 2 || toDirection < this.turretDirection && this.turretDirection - toDirection > this.turretDirections / 2) {
				this.turretDirection += this.turnSpeed / 20
			} else {
				this.turretDirection -= this.turnSpeed / 20
			}
			if (this.turretDirection > this.turretDirections - 1) {
				this.turretDirection -= this.turretDirections - 1
			} else if (this.turretDirection < 0) {
				this.turretDirection += this.turretDirections - 1
			}
		},
		turnTo: function (toDirection) {
			if (toDirection > this.direction && toDirection - this.direction < this.directions / 2 || toDirection < this.direction && this.direction - toDirection > this.directions / 2) {
				this.direction = this.direction + this.turnSpeed / 10
			} else {
				this.direction = this.direction - this.turnSpeed / 10
			}
			if (this.direction > this.directions - 1) {
				this.direction -= this.directions - 1
			} else if (this.direction < 0) {
				this.direction += this.directions - 1
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		if (details.percentLife) {
			item.life = item.hitPoints * details.percentLife
		} else {
			item.life = item.hitPoints
		}
		$.extend(item, details);
		item.weapon = weapons.add({name: item.primaryWeapon});
		return item
	},
	load: function (name) {
		var item = this.list[name];
		console.log("Loading", name, "...");
		item.spriteCanvas = document.createElement("canvas");
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function (image) {
			createSpriteSheetCanvas(image, item.spriteCanvas, "colormap")
		});
		item.spriteArray = [];
		item.spriteCount = 0;
		if (name == "gunboat") {
			item.wakeSpriteSheet = loader.loadImage("images/" + this.type + "/gunboat-wake-sprite-sheet.png");
			item.wakeSpriteArray = {
				"wake-0": {name: "wake-0", count: 6, offset: 0},
				"wake-1": {name: "wake-1", count: 6, offset: 6}
			};
			item.selectImage = loader.loadImage("images/" + "sidebar/select-2-1.png")
		}
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var sidebar = {
	visible: false,
	width: 160,
	iconWidth: 64,
	iconHeight: 48,
	constructing: {},
	power: {},
	load: function() {
		this.top = game.viewportTop - 2;
		this.left = game.canvasWidth - this.width;
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext("2d");
		this.tabsImage = loader.loadImage("images/sidebar/tabs.png");
		this.sidebarImage = loader.loadImage("images/sidebar/sidebar.png");
		this.primaryBuildingImage = loader.loadImage("images/sidebar/primary.png");
		this.readyImage = loader.loadImage("images/sidebar/ready.png");
		this.holdImage = loader.loadImage("images/sidebar/hold.png");
		this.placementWhiteImage = loader.loadImage("images/sidebar/placement-white.gif");
		this.placementRedImage = loader.loadImage("images/sidebar/placement-red.gif");
		this.powerIndicator = loader.loadImage("images/sidebar/power/power_indicator2.png");
		this.repairButtonPressed = loader.loadImage("images/sidebar/buttons/repair-pressed.png");
		this.sellButtonPressed = loader.loadImage("images/sidebar/buttons/sell-pressed.png");
		this.mapButtonPressed = loader.loadImage("images/sidebar/buttons/map-pressed.png");
		this.mapButtonNotPressed = loader.loadImage("images/sidebar/buttons/map-not-pressed.png");
		this.repairImageBig = loader.loadImage("images/sidebar/repair-big.png");
		this.repairImageSmall = loader.loadImage("images/sidebar/repair-small.png");
		this.selectImageBig = loader.loadImage("images/sidebar/select-big.png");
		this.selectImageSmall = loader.loadImage("images/sidebar/select-small.png");
		this.iconsSpriteSheet = loader.loadImage("images/sidebar/icons-sprite-sheet.png");
		this.missionAccomplished = loader.loadImage("images/sidebar/mission-accomplished.png");
		this.missionFailed = loader.loadImage("images/sidebar/mission-failed.png");
		this.replayMenuImage = loader.loadImage("images/menu/replay-controls-menu.png");
		this.nodRadar = loader.loadImage("images/sidebar/nod-radar.png");
	},
	init: function() {
		this.visible = false;
		var iconSpriteList = ["advanced-communications-tower", "advanced-guard-tower", "advanced-power-plant", "air-strike", "airstrip", "apache", "apc", "artillery", "barb-wire", "barracks", "chain-link", "chem-warrior", "commando", "communications-center", "concrete-wall", "engineer", "flame-tank", "flame-thrower", "grenadier", "guard-tower", "gunboat", "hand-of-nod", "harvester", "helipad", "hover-craft", "ion-cannon", "jeep", "light-tank", "mammoth-tank", "mcv", "medium-tank", "minigunner", "mobile-rocket-launch-system", "buggy", "nuclear-strike", "obelisk", "orca", "power-plant", "recon-bike", "refinery", "repair-facility", "bazooka", "sam-site", "sandbag", "ssm-launcher", "stealth-tank", "air-strike", "temple-of-nod", "tiberium-silo", "chinook", "gun-turret", "weapons-factory", "wooden-fence"];
		var iconSprites = [];
		for (var i = 0; i < iconSpriteList.length; i++) {
			iconSprites[iconSpriteList[i]] = {offset: i * this.iconWidth, index: i, name: iconSpriteList[i]}
		}
		this.mapCanvas = document.createElement("canvas");
		this.mapContext = this.mapCanvas.getContext("2d");
		this.mapCanvas.width = 148;
		this.mapCanvas.height = 132;
		this.tempMapCanvas = document.createElement("canvas");
		this.tempMapContext = this.tempMapCanvas.getContext("2d");
		this.tempMapCanvas.width = 148;
		this.tempMapCanvas.height = 132;
		var data = maps.currentMapData;
		this.iconList = [];
		this.leftButtons = [];
		this.rightButtons = [];
		this.leftButtonOffset = 0;
		this.rightButtonOffset = 0;
		this.repairMode = false;
		this.sellMode = false;
		this.mapMode = false;
		this.deployMode = false;
		this.mapEnabled = false;
		this.constructing = [];
		this.power = [];
		var buildableTypes = Object.keys(data.buildable).sort();
		for (var bt = buildableTypes.length - 1; bt >= 0; bt--) {
			var type = buildableTypes[bt];
			var requirementArray = data.buildable[type];
			for (var i = 0; i < requirementArray.length; i++) {
				var name = requirementArray[i];
				var details = window[type].list[name];
				if (details.dependency) {
					var iconObject = {
						name: name,
						offset: iconSprites[name].offset,
						type: type,
						details: details,
						dependency: details.dependency,
						constructedIn: details.constructedIn,
						owner: details.owner,
						cost: details.cost,
						label: details.label,
						satisfied: false
					};
					this.iconList.push(iconObject);
				}
			}
		}
	},
	textBrightness: 1,
	checkSpecial: function() {
		for (var i = this.iconList.length - 1; i >= 0; i--) {
			var icon = this.iconList[i];
			if (icon.type == "special") {
				if (icon.satisfied) {
					if (icon.details.needsPower) {
						if (sidebar.power[game.player].powerIn <= sidebar.power[game.player].powerOut) {
							if (icon.status !== "building" && icon.status !== "ready") {
								game.sendCommand("sidebar", {
									type: "build",
									item: {
										player: game.player,
										cost: icon.cost,
										constructedIn: icon.constructedIn,
										type: icon.type,
										name: icon.name
									}
								});
								icon.status = "building"
							}
						} else {
							if (icon.status != "disabled" && sidebar.constructing[game.player] && sidebar.constructing[player][icon.name]) {
								game.sendCommand("sidebar", {
									type: "cancel",
									item: {player: game.player, type: icon.type, name: icon.name}
								})
							}
							icon.status = "disabled";
						}
					} else {
						if (icon.status !== "building" && icon.status !== "ready") {
							game.sendCommand("sidebar", {
								type: "build",
								item: {
									player: game.player,
									cost: icon.cost,
									constructedIn: icon.constructedIn,
									type: icon.type,
									name: icon.name
								}
							});
							icon.status = "building";
						}
					}
				} else {
					if (icon.status != "disabled" && sidebar.constructing && sidebar.constructing.hasOwnProperty(game.player) && sidebar.constructing[player].hasOwnProperty(icon.name)) {
						game.sendCommand("sidebar", {
							type: "cancel",
							item: {player: game.player, type: icon.type, name: icon.name}
						})
					}
					icon.status = "disabled";
				}
			}
		}
	},
	animate: function() {
		this.textBrightness -= .1;
		if (this.textBrightness < 0) {
			this.textBrightness = 1;
		}
		sidebar.checkDependencies();
		sidebar.checkPower();
		sidebar.checkSpecial();
		var havePower = sidebar.power[game.player].powerIn <= sidebar.power[game.player].powerOut;
		if (havePower) {
			sidebar.lowPower = false;
		} else {
			if (!sidebar.lowPower) {
				sidebar.lowPower = true;
				sounds.play("low_power");
			}
		}
		var canRunRadar = sidebar.isDependencySatisfied(["communications-center|advanced-communications-tower"], "both", "radar");
		if (canRunRadar && havePower) {
			if (!sidebar.mapEnabled) {
				sidebar.mapEnabled = true;
				sidebar.mapMode = true;
				sounds.play("communications_center_enabled");
			}
		} else {
			if (sidebar.mapEnabled) {
				sidebar.mapEnabled = false;
				sidebar.mapMode = false;
				sounds.play("power_down");
			}
		}
		sidebar.animateMap();
		var constructingPlayers = Object.keys(sidebar.constructing).sort();
		for (var cp = constructingPlayers.length - 1; cp >= 0; cp--) {
			var player = constructingPlayers[cp];
			var constructingItems = Object.keys(sidebar.constructing[player]).sort();
			for (var ci = constructingItems.length - 1; ci >= 0; ci--) {
				var itemName = constructingItems[ci];
				var item = sidebar.constructing[player][itemName];
				if (item.status == "building") {
					var constructingBuildingCount = 1;
					var deltaCost = 2;
					if (sidebar.power[player].powerIn > sidebar.power[player].powerOut) {
						deltaCost = deltaCost / (1 + 20 * (1 - Math.pow(sidebar.power[player].powerOut / sidebar.power[player].powerIn, 2)))
					}
					if (deltaCost <= game.cash[item.player] || item.spent <= game.cash[item.player] || item.type == "special") {
						item.spent -= deltaCost;
						if (item.type !== "special") {
							game.cash[item.player] -= deltaCost
						} else {
							if (sidebar.power[player].powerIn > sidebar.power[player].powerOut) {
								item.spent = item.cost
							}
						}
						if (item.spent < 0) {
							game.cash[item.player] -= item.spent;
							item.spent = 0;
							item.status = "ready";
							if (item.type == "buildings" || item.type == "turrets" || item.type == "walls") {
								if (item.player == game.player) {
									sounds.play("construction_complete");
									var buttons = this.leftButtons;
									var button;
									for (var i = buttons.length - 1; i >= 0; i--) {
										button = buttons[i];
										if (button.name == item.name) {
											break
										}
									}
									button.status = "ready"
								}
							} else if (item.type == "infantry" || item.type == "vehicles" || item.type == "aircraft") {
								if (item.player == game.player) {
									sounds.play("unit_ready");
									var dependency = window[item.type].list[item.name].dependency;
									for (var i = this.iconList.length - 1; i >= 0; i--) {
										if (this.iconList[i].dependency[0] == dependency[0]) {
											this.iconList[i].status = undefined
										}
									}
								}
								sidebar.finishDeployingUnit(item)
							} else if (item.type == "special") {
								if (item.player == game.player) {
									var buttons = this.rightButtons;
									var button;
									for (var i = buttons.length - 1; i >= 0; i--) {
										button = buttons[i];
										if (button.name == item.name) {
											break
										}
									}
									if (button.details.readySound) {
										sounds.play(button.details.readySound)
									}
									button.status = "ready"
								}
							}
						}
						item.percentComplete = 1 - item.spent / item.cost
					}
				}
			}
		}
	},
	minimapWidth: 148,
	minimapHeight: 132,
	minimapSquareWidth: 132,
	minimapImageSize: 128,
	animateMap: function() {
		if (sidebar.mapEnabled && sidebar.mapMode) {
			var squareWidth = this.minimapHeight;
			var squareLeft = (this.minimapWidth - squareWidth) / 2;
			var squareTop = (this.minimapHeight - squareWidth) / 2;
			var imageWidth = this.minimapImageSize;
			var imageHeight = this.minimapImageSize;
			var imageTop = squareTop + (squareWidth - imageWidth) / 2;
			var imageLeft = squareLeft + (squareWidth - imageHeight) / 2;
			if (maps.currentMapImage.width > maps.currentMapImage.height) {
				imageHeight = maps.currentMapImage.height / maps.currentMapImage.width * imageWidth;
				imageTop += (imageWidth - imageHeight) / 2;
				this.minimapScale = maps.currentMapImage.width / this.minimapImageSize
			} else {
				imageWidth = maps.currentMapImage.width / maps.currentMapImage.height * imageHeight;
				imageLeft += (imageHeight - imageWidth) / 2;
				this.minimapScale = maps.currentMapImage.height / this.minimapImageSize
			}
			this.minimapImageWidth = imageWidth;
			this.minimapImageHeight = imageHeight;
			this.minimapImageTop = imageTop;
			this.minimapImageLeft = imageLeft;
			if (game.gameTick % 10 == 0) {
				this.tempMapContext.fillStyle = "rgb(80,80,80)";
				this.tempMapContext.fillRect(0, 0, this.minimapWidth, this.minimapHeight);
				this.tempMapContext.drawImage(maps.currentMapImage, 0, 0, maps.currentMapImage.width, maps.currentMapImage.height, imageLeft, imageTop, imageWidth, imageHeight);
				var drawItemOnMap = function (item, size) {
					var color = game.colorHash[item.player] ? game.colorHash[item.player].color : console.log(item.name, item);
					sidebar.tempMapContext.fillStyle = color;
					sidebar.tempMapContext.fillRect(imageLeft + item.x * imageWidth / maps.currentMapData.width - size / 2, imageTop + item.y * imageHeight / maps.currentMapData.height - size / 2, size, size)
				};
				for (var i = game.buildings.length - 1; i >= 0; i--) {
					drawItemOnMap(game.buildings[i], 2)
				}
				for (var i = game.turrets.length - 1; i >= 0; i--) {
					drawItemOnMap(game.turrets[i], 2)
				}
				for (var i = game.vehicles.length - 1; i >= 0; i--) {
					drawItemOnMap(game.vehicles[i], 1)
				}
				for (var i = game.infantry.length - 1; i >= 0; i--) {
					drawItemOnMap(game.infantry[i], 1)
				}
				for (var i = game.aircraft.length - 1; i >= 0; i--) {
					drawItemOnMap(game.aircraft[i], 1)
				}
				this.tempMapContext.drawImage(fog.canvas, 0, 0, maps.currentMapImage.width, maps.currentMapImage.height, imageLeft, imageTop, imageWidth, imageHeight)
			}
			this.mapContext.drawImage(this.tempMapCanvas, 0, 0);
			this.mapContext.strokeStyle = "green";
			this.mapContext.strokeRect(imageLeft + game.viewportX * imageWidth / maps.currentMapImage.width, imageTop + game.viewportY * imageHeight / maps.currentMapImage.height, game.viewportWidth * imageWidth / maps.currentMapImage.width, game.viewportHeight * imageHeight / maps.currentMapImage.height)
		} else {
			if (game.type === "multiplayer") {
				this.mapContext.fillStyle = "black";
				this.mapContext.fillRect(0, 0, 148, 132);
				this.mapContext.font = "12px Command";
				this.mapContext.fillStyle = "gray";
				this.mapContext.fillText("Name:", 4, 9);
				this.mapContext.fillText("Kills:", 104, 9);
				this.mapContext.fillRect(0, 12, 148, 1);
				for (var i = multiplayer.players.length - 1; i >= 0; i--) {
					var player = multiplayer.players[i];
					this.mapContext.fillStyle = player.color;
					this.mapContext.fillText(player.name, 4, 25 + i * 12);
					this.mapContext.fillText(game.kills[player.playerId], 104, 25 + i * 12)
				}
			} else {
				this.mapContext.clearRect(0, 0, this.minimapWidth, this.minimapHeight)
			}
		}
	},
	drawMap: function() {
		if (!sidebar.mapEnabled) {
			if (game.type === "multiplayer") {
				game.foregroundContext.drawImage(this.mapCanvas, this.left + 6, this.top + 5)
			} else if (game.team === "nod") {
				game.foregroundContext.drawImage(this.nodRadar, this.left, this.top)
			}
		} else {
			game.foregroundContext.drawImage(this.mapCanvas, this.left + 6, this.top + 5)
		}
	},
	draw: function() {
		game.foregroundContext.drawImage(this.tabsImage, 0, this.top - this.tabsImage.height + 2);
		game.foregroundContext.fillStyle = "lightgreen";
		game.foregroundContext.font = "12px Command";
		var c = (Math.round(game.cash[game.player]) + "").split("").join(" ");
		game.foregroundContext.fillText(c, 400 - c.length * 5 / 2, 31);
		if (sidebar.visible) {
			game.foregroundContext.drawImage(this.sidebarImage, this.left, this.top);
			sidebar.drawMap();
			if (sidebar.repairMode) {
				game.foregroundContext.drawImage(this.repairButtonPressed, this.left + 4, this.top + 145)
			}
			if (sidebar.sellMode) {
				game.foregroundContext.drawImage(this.sellButtonPressed, this.left + 57, this.top + 145)
			}
			if (sidebar.mapEnabled) {
				if (sidebar.mapMode) {
					game.foregroundContext.drawImage(this.mapButtonPressed, this.left + 110, this.top + 145)
				} else {
					game.foregroundContext.drawImage(this.mapButtonNotPressed, this.left + 110, this.top + 145)
				}
			}
			sidebar.drawButtons();
			sidebar.drawPower()
		}
	},
	powerOut: 0,
	powerIn: 0,
	powerScale: 5,
	checkPower: function() {
		for (var l = game.players.length - 1; l >= 0; l--) {
			var player = game.players[l];
			if (!sidebar.power[player]) {
				sidebar.power[player] = {}
			}
			sidebar.power[player].powerIn = 0;
			sidebar.power[player].powerOut = 0
		}
		for (var i = game.buildings.length - 1; i >= 0; i--) {
			var building = game.buildings[i];
			if (building.lifeCode != "ultra-damaged") {
				sidebar.power[building.player].powerOut += building.powerOut;
				sidebar.power[building.player].powerIn += building.powerIn
			}
		}
		for (var i = game.turrets.length - 1; i >= 0; i--) {
			var turret = game.turrets[i];
			if (turret.lifeCode != "ultra-damaged" && turret.lifeCode != "dead") {
				sidebar.power[turret.player].powerOut += turret.powerOut;
				sidebar.power[turret.player].powerIn += turret.powerIn
			}
		}
	},
	hoveredButton: function() {
		var clickY = mouse.y - sidebar.top;
		var clickX = mouse.x;
		if (clickY >= 165 && clickY <= 455) {
			var buttonPosition = 0;
			for (var i = 0; i < 6; i++) {
				if (clickY >= 165 + i * 48 && clickY <= 165 + i * 48 + 48) {
					buttonPosition = i;
					break
				}
			}
			var buttonSide, buttonPressedIndex, buttons;
			if (clickX >= 500 && clickX <= 564) {
				buttonSide = "left";
				buttonPressedIndex = this.leftButtonOffset + buttonPosition;
				buttons = sidebar.leftButtons
			} else if (clickX >= 570 && clickX <= 634) {
				buttonSide = "right";
				buttonPressedIndex = this.rightButtonOffset + buttonPosition;
				buttons = sidebar.rightButtons
			}
			if (buttons && buttons.length > buttonPressedIndex) {
				var buttonPressed = buttons[buttonPressedIndex];
				return buttonPressed
			}
		}
	},
	isDependencySatisfied: function (dependency, owner, name) {
		if (!dependency) {
			return false
		}
		for (var i = dependency.length - 1; i >= 0; i--) {
			var multiDependencies = dependency[i].split("|");
			var satisfied = false;
			for (var k = multiDependencies.length - 1; k >= 0; k--) {
				var currentDependency = multiDependencies[k];
				for (var j = game.permissions.length - 1; j >= 0; j--) {
					var permission = game["permissions"][j];
					if (permission.player == game.player && permission.name == currentDependency) {
						satisfied = true;
						break
					}
				}
				for (var j = game.buildings.length - 1; j >= 0; j--) {
					var building = game["buildings"][j];
					if (building.player == game.player && building.name == currentDependency && (i > 0 || owner == "both" || owner == building.originalteam || owner == building.team)) {
						satisfied = true;
						break
					}
				}
				for (var j = game.turrets.length - 1; j >= 0; j--) {
					var turret = game["turrets"][j];
					if (turret.player == game.player && turret.name == currentDependency && (i > 0 || owner == "both" || owner == turret.originalteam || owner == turret.team)) {
						satisfied = true;
						break
					}
				}
			}
			if (!satisfied) {
				return false
			}
		}
		return true
	},
	checkDependencies: function() {
		var newConstructionOptions = false;
		for (var i = this.iconList.length - 1; i >= 0; i--) {
			var icon = this.iconList[i];
			var buttonArray = icon.type == "buildings" || icon.type == "turrets" || icon.type == "walls" ? this.leftButtons : this.rightButtons;
			if (sidebar.isDependencySatisfied(icon.dependency, icon.owner, icon.name)) {
				if (!icon.satisfied) {
					icon.satisfied = true;
					newConstructionOptions = true;
					if (buttonArray.indexOf(icon) > -1) {
						alert("wft" + icon.name)
					}
					buttonArray.push(icon)
				}
			} else {
				if (icon.satisfied) {
					icon.satisfied = false;
					if (icon.status !== undefined && icon.status !== "disabled" && icon.type != "special") {
						game.sendCommand("sidebar", {
							type: "cancel",
							item: {player: game.player, type: icon.type, name: icon.name}
						});
						for (var i = this.iconList.length - 1; i >= 0; i--) {
							if (this.iconList[i].dependency[0] == icon.dependency[0]) {
								this.iconList[i].status = undefined
							}
						}
					}
					buttonArray.remove(icon)
				}
			}
		}
		if (newConstructionOptions) {
			sidebar.visible = true;
			sounds.play("new_construction_options")
		}
		if (this.leftButtonOffset + 6 > this.leftButtons.length) {
			this.leftButtonOffset = Math.max(0, this.leftButtons.length - 6)
		}
		if (this.rightButtonOffset + 6 > this.rightButtons.length) {
			this.rightButtonOffset = Math.max(0, this.rightButtons.length - 6)
		}
	},
	leftButtonOffset: 0,
	rightButtonOffset: 0,
	disabledStyle: "rgba(200,200,200,0.6)",
	drawButtonLabel: function (labelImage, x, y) {
		var labelOffsetX = this.iconWidth / 2 - labelImage.width / 2;
		var labelOffsetY = this.iconHeight / 2;
		game.foregroundContext.globalAlpha = this.textBrightness;
		game.foregroundContext.drawImage(labelImage, x + labelOffsetX, y + labelOffsetY);
		game.foregroundContext.globalAlpha = 1
	},
	drawPower: function() {
		var red = "rgba(174,52,28,0.7)";
		var orange = "rgba(250,100,0,0.6)";
		var green = "rgba(84,252,84,0.3)";
		var offsetX = this.left;
		var offsetY = this.top + 160;
		var barHeight = 320;
		var barWidth = 20;
		var powerIn = sidebar.power[game.player].powerIn;
		var powerOut = sidebar.power[game.player].powerOut;
		if (powerOut / powerIn >= 1.1) {
			game.foregroundContext.fillStyle = green
		} else if (powerOut / powerIn >= 1) {
			game.foregroundContext.fillStyle = orange
		} else if (powerOut < powerIn) {
			game.foregroundContext.fillStyle = red
		}
		game.foregroundContext.fillRect(offsetX + 8, offsetY + barHeight - powerOut / this.powerScale, barWidth - 14, powerOut / this.powerScale);
		game.foregroundContext.drawImage(this.powerIndicator, offsetX, offsetY + barHeight - powerIn / this.powerScale)
	},
	drawButton: function (side, index) {
		var buttons = side == "left" ? this.leftButtons : this.rightButtons;
		var offset = side == "left" ? this.leftButtonOffset : this.rightButtonOffset;
		var button = buttons[index + offset];
		var xOffset = side == "left" ? 500 : 570;
		var yOffset = 165 + this.top + index * this.iconHeight;
		game.foregroundContext.drawImage(sidebar.iconsSpriteSheet, button.offset, 0, this.iconWidth, this.iconHeight, xOffset, yOffset, this.iconWidth, this.iconHeight);
		var percentComplete;
		if (button.status == "ready") {
			this.drawButtonLabel(this.readyImage, xOffset, yOffset + 5)
		} else if (button.status == "disabled") {
			game.foregroundContext.fillStyle = sidebar.disabledStyle;
			game.foregroundContext.fillRect(xOffset, yOffset, this.iconWidth, this.iconHeight)
		} else if (button.status == "building") {
			percentComplete = 0;
			if (sidebar.constructing[game.player] && sidebar.constructing[game.player][button.name]) {
				percentComplete = sidebar.constructing[game.player][button.name].percentComplete
			}
			sidebar.context.clearRect(0, 0, this.iconWidth, this.iconHeight);
			sidebar.context.fillStyle = sidebar.disabledStyle;
			sidebar.context.beginPath();
			sidebar.context.moveTo(this.iconWidth / 2, this.iconHeight / 2);
			sidebar.context.arc(this.iconWidth / 2, this.iconHeight / 2, 40, Math.PI * 2 * percentComplete - Math.PI / 2, 3 * Math.PI / 2);
			sidebar.context.moveTo(this.iconWidth / 2, this.iconHeight / 2);
			sidebar.context.fill();
			game.foregroundContext.drawImage(sidebar.canvas, 0, 0, this.iconWidth, this.iconHeight, xOffset, yOffset, this.iconWidth, this.iconHeight)
		} else if (button.status == "hold") {
			percentComplete = 0;
			if (sidebar.constructing[game.player] && sidebar.constructing[game.player][button.name]) {
				percentComplete = sidebar.constructing[game.player][button.name].percentComplete
			}
			sidebar.context.clearRect(0, 0, this.iconWidth, this.iconHeight);
			sidebar.context.fillStyle = sidebar.disabledStyle;
			sidebar.context.beginPath();
			sidebar.context.moveTo(this.iconWidth / 2, this.iconHeight / 2);
			sidebar.context.arc(this.iconWidth / 2, this.iconHeight / 2, 40, Math.PI * 2 * percentComplete - Math.PI / 2, 3 * Math.PI / 2);
			sidebar.context.moveTo(this.iconWidth / 2, this.iconHeight / 2);
			sidebar.context.fill();
			game.foregroundContext.drawImage(sidebar.canvas, 0, 0, this.iconWidth, this.iconHeight, xOffset, yOffset, this.iconWidth, this.iconHeight);
			this.drawButtonLabel(this.holdImage, xOffset, yOffset)
		}
	},
	drawButtons: function() {
		var maxLeft = this.leftButtons.length > 6 ? 6 : this.leftButtons.length;
		for (var i = 0; i < maxLeft; i++) {
			this.drawButton("left", i)
		}
		var maxRight = this.rightButtons.length > 6 ? 6 : this.rightButtons.length;
		for (var i = 0; i < maxRight; i++) {
			this.drawButton("right", i)
		}
	},
	click: function (ev, rightClick) {
		if (game.replay) {
			return
		}
		var clickY = mouse.y - this.top;
		var clickX = mouse.x;
		var imageTop = 5 + this.minimapImageTop;
		var imageLeft = this.left + 6 + this.minimapImageLeft;
		var imageWidth = this.minimapImageWidth;
		var imageHeight = this.minimapImageHeight;
		if (this.mapEnabled && clickX >= imageLeft && clickY >= imageTop && clickX <= imageLeft + imageWidth && clickY <= imageTop + imageHeight) {
			var x = (clickX - imageLeft) * this.minimapScale;
			var y = (clickY - imageTop) * this.minimapScale;
			game.viewportX = Math.max(0, Math.min(x - game.viewportWidth / 2, maps.currentMapImage.width - game.viewportWidth));
			game.viewportY = Math.max(0, Math.min(y - game.viewportHeight / 2, maps.currentMapImage.height - game.viewportHeight));
			game.viewportAdjustX = 0;
			game.viewportAdjustY = 0;
			game.viewportDeltaX = 0;
			game.viewportDeltaY = 0;
			game.refreshBackground = true
		} else if (clickY >= 146 && clickY <= 160) {
			if (clickX >= 485 && clickX <= 530) {
				sounds.play("button");
				this.repairMode = !this.repairMode;
				if (this.repairMode) {
					game.clearSelection()
				}
				this.sellMode = false;
				this.deployMode = false
			} else if (clickX >= 538 && clickX <= 582) {
				sounds.play("button");
				this.sellMode = !this.sellMode;
				if (this.sellMode) {
					game.clearSelection()
				}
				this.repairMode = false;
				this.deployMode = false
			} else if (clickX >= 590 && clickX <= 635) {
				if (this.mapEnabled) {
					sounds.play("button");
					this.mapMode = !this.mapMode;
					this.repairMode = false;
					this.sellMode = false;
					this.deployMode = false
				}
			}
		} else if (clickY >= 455 && clickY <= 480) {
			if (clickX >= 500 && clickX <= 530) {
				if (this.leftButtonOffset > 0) {
					this.leftButtonOffset--;
					sounds.play("button")
				}
			} else if (clickX >= 532 && clickX <= 562) {
				if (this.leftButtonOffset + 6 < this.leftButtons.length) {
					this.leftButtonOffset++;
					sounds.play("button")
				}
			} else if (clickX >= 570 && clickX <= 600) {
				if (this.rightButtonOffset > 0) {
					this.rightButtonOffset--;
					sounds.play("button")
				}
			} else if (clickX >= 602 && clickX <= 632) {
				if (this.rightButtonOffset + 6 < this.rightButtons.length) {
					this.rightButtonOffset++;
					sounds.play("button")
				}
			}
		} else if (clickY >= 165 && clickY <= 455) {
			var buttonPosition = 0;
			for (var i = 0; i < 6; i++) {
				if (clickY >= 165 + i * 48 && clickY <= 165 + i * 48 + 48) {
					buttonPosition = i;
					break
				}
			}
			var buttonSide, buttonPressedIndex, buttons;
			if (clickX >= 500 && clickX <= 564) {
				buttonSide = "left";
				buttonPressedIndex = this.leftButtonOffset + buttonPosition;
				buttons = this.leftButtons
			} else if (clickX >= 570 && clickX <= 634) {
				buttonSide = "right";
				buttonPressedIndex = this.rightButtonOffset + buttonPosition;
				buttons = this.rightButtons
			}
			if (buttons && buttons.length > buttonPressedIndex) {
				var buttonPressed = buttons[buttonPressedIndex];
				if (!buttonPressed.status && !rightClick) {
					for (var i = buttons.length - 1; i >= 0; i--) {
						if (buttons[i].dependency[0] == buttonPressed.dependency[0]) {
							buttons[i].status = "disabled"
						}
					}
					buttonPressed.status = "building";
					sounds.play("building");
					game.sendCommand("sidebar", {
						type: "build",
						item: {
							player: game.player,
							cost: buttonPressed.cost,
							constructedIn: buttonPressed.constructedIn,
							type: buttonPressed.type,
							name: buttonPressed.name
						}
					})
				} else if (buttonPressed.status == "building" && !rightClick) {
					sounds.play("not_ready")
				} else if (buttonPressed.status == "building" && rightClick) {
					if (buttonPressed.type !== "special") {
						buttonPressed.status = "hold";
						sounds.play("on_hold");
						game.sendCommand("sidebar", {
							type: "hold",
							item: {player: game.player, type: buttonPressed.type, name: buttonPressed.name}
						})
					}
				} else if (buttonPressed.status == "hold" && !rightClick) {
					buttonPressed.status = "building";
					sounds.play("building");
					game.sendCommand("sidebar", {
						type: "resume",
						item: {player: game.player, type: buttonPressed.type, name: buttonPressed.name}
					})
				} else if (buttonPressed.status == "hold" && rightClick) {
					buttonPressed.status = undefined;
					sounds.play("cancelled");
					game.sendCommand("sidebar", {
						type: "cancel",
						item: {player: game.player, type: buttonPressed.type, name: buttonPressed.name}
					});
					for (var i = this.iconList.length - 1; i >= 0; i--) {
						if (this.iconList[i].dependency[0] == buttonPressed.dependency[0]) {
							this.iconList[i].status = undefined
						}
					}
				} else if (buttonPressed.status == "ready" && !rightClick) {
					if (buttonPressed.type == "buildings" || buttonPressed.type == "turrets" || buttonPressed.type == "walls") {
						sidebar.deployMode = true;
						game.clearSelection();
						sidebar.repairMode = false;
						sidebar.sellMode = false;
						sidebar.deployBuilding = buttonPressed.details;
						sidebar.deploySpecial = undefined
					} else if (buttonPressed.type == "infantry" || buttonPressed.type == "vehicles") {
					} else if (buttonPressed.type === "special") {
						sounds.play("select_target");
						sidebar.deployMode = true;
						sidebar.deploySpecial = buttonPressed.details;
						sidebar.deployBuilding = undefined
					}
				} else if (buttonPressed.status == "disabled") {
					if (buttonPressed.type !== "special") {
						sounds.play("building_in_progress")
					}
				}
			}
		}
	},
	processOrders: function (commandObject) {
		switch (commandObject.type) {
			case"build":
				var item = commandObject.item;
				item.status = "building";
				item.spent = item.cost;
				item.percentComplete = 0;
				if (!sidebar.constructing[item.player]) {
					sidebar.constructing[item.player] = {}
				}
				var playerConstructing = sidebar.constructing[item.player];
				playerConstructing[item.name] = item;
				if (game.replay && item.player == game.player && item.type !== "special") {
					sounds.play("building");
					var dependency = window[item.type].list[item.name].dependency;
					for (var i = this.iconList.length - 1; i >= 0; i--) {
						if (this.iconList[i].dependency[0] == dependency[0]) {
							this.iconList[i].status = this.iconList[i].name !== item.name ? "disabled" : "building"
						}
					}
				}
				break;
			case"cancel":
				var playerConstructing = sidebar.constructing[commandObject.item.player];
				var item = playerConstructing[commandObject.item.name];
				game.cash[item.player] += item.cost - item.spent;
				delete this.constructing[item.player][item.name];
				if (game.replay && item.player == game.player && item.type !== "special") {
					sounds.play("cancelled")
				}
				break;
			case"hold":
				var playerConstructing = sidebar.constructing[commandObject.item.player];
				var item = playerConstructing[commandObject.item.name];
				item.status = "hold";
				if (game.replay && item.player == game.player && item.type !== "special") {
					sounds.play("on_hold")
				}
				break;
			case"resume":
				var playerConstructing = sidebar.constructing[commandObject.item.player];
				var item = playerConstructing[commandObject.item.name];
				item.status = "building";
				if (game.replay && item.player == game.player && item.type !== "special") {
					sounds.play("building")
				}
				break;
			case"deploy-building":
				var item = commandObject.item;
				delete item.uid;
				game.add(item);
				if (sidebar.constructing[item.player] && sidebar.constructing[item.player][item.name]) {
					delete sidebar.constructing[item.player][item.name]
				}
				if (item.player === game.player) {
					var dependency = window[item.type].list[item.name].dependency;
					for (var i = this.iconList.length - 1; i >= 0; i--) {
						if (this.iconList[i].dependency[0] == dependency[0]) {
							this.iconList[i].status = undefined
						}
					}
					sounds.play("construction")
				}
				break;
			case"deploy-special":
				var item = commandObject.item;
				var object = window[item.type].list[item.name];
				delete sidebar.constructing[item.player][item.name];
				if (item.player === game.player) {
					if (object.firedSound) {
						sounds.play(object.firedSound)
					}
				}
				var constructedAt = undefined;
				for (var i = 0; i < game.buildings.length; i++) {
					if (object.constructedIn.indexOf(game.buildings[i].name) > -1 && game.buildings[i].player == item.player) {
						constructedAt = game.buildings[i];
						if (constructedAt.primaryBuilding) {
							break
						}
					}
				}
				if (constructedAt && item.name == "nuclear-strike") {
					constructedAt.action = "launch";
					constructedAt.animationIndex = 0;
					sounds.play("nukemisl");
					game.add({type: "effects", name: "atomsmoke", x: constructedAt.x + 1.5, y: constructedAt.y});
					game.add({
						type: "bullets",
						name: "atombomb",
						x: constructedAt.x + 1.5,
						y: constructedAt.y,
						target: {x: item.x, y: item.y},
						from: constructedAt.player
					})
				} else if (item.name == "ion-cannon") {
					sounds.play("ion1");
					game.add({type: "effects", name: "ioncannon", x: item.x, y: item.y});
					game.add({
						type: "bullets",
						name: "ioncannon",
						x: item.x,
						y: item.y,
						z: .1,
						delay: 8,
						from: constructedAt.player,
						target: {x: item.x, y: item.y}
					})
				} else if (item.name == "air-strike") {
					game.add({
						type: "aircraft",
						name: "c17",
						x: maps.currentMapData["air-strike-from"].x,
						y: maps.currentMapData["air-strike-from"].y,
						team: game.team,
						player: game.player,
						selectable: false,
						orders: {
							type: "bomb",
							to: {x: item.x, y: item.y},
							from: {
								x: maps.currentMapData["air-strike-from"].x,
								y: maps.currentMapData["air-strike-from"].y
							}
						}
					})
				}
				break
		}
	},
	finishDeployingBuilding: function() {
		for (var i = 0; i < game.buildings.length; i++) {
			if (game.buildings[i].name == "construction-yard" && game.buildings[i].player == game.player) {
				game.buildings[i].status = "construct";
				game.buildings[i].animationIndex = 0;
				break
			}
		}
		game.sendCommand("sidebar", {
			type: "deploy-building",
			item: {
				name: sidebar.deployBuilding.name,
				player: game.player,
				team: game.team,
				type: sidebar.deployBuilding.type,
				x: mouse.gridX,
				y: mouse.gridY,
				action: "build"
			}
		});
		for (var i = this.iconList.length - 1; i >= 0; i--) {
			if (this.iconList[i].name == this.deployBuilding.name) {
				this.iconList[i].status = "disabled"
			}
		}
		sidebar.deployMode = false;
		sidebar.deployBuilding = null
	},
	finishDeployingSpecial: function() {
		game.sendCommand("sidebar", {
			type: "deploy-special",
			item: {
				name: sidebar.deploySpecial.name,
				player: game.player,
				team: game.team,
				type: sidebar.deploySpecial.type,
				x: mouse.gameX / game.gridSize,
				y: mouse.gameY / game.gridSize
			}
		});
		for (var i = this.iconList.length - 1; i >= 0; i--) {
			if (this.iconList[i].name == this.deploySpecial.name) {
				this.iconList[i].status = "disabled"
			}
		}
		sidebar.deployMode = false;
		sidebar.deploySpecial = null
	},
	finishDeployingUnit: function (unit) {
		var constructedAt;
		for (var i = 0; i < game.buildings.length; i++) {
			if (unit.constructedIn.indexOf(game.buildings[i].name) > -1 && game.buildings[i].player == unit.player) {
				constructedAt = game.buildings[i];
				if (constructedAt.primaryBuilding) {
					break
				}
			}
		}
		delete sidebar.constructing[unit.player][unit.name];
		if (constructedAt) {
			if (unit.type == "infantry") {
				if (constructedAt.name == "barracks") {
					var side = constructedAt.side ? .5 : 1.25;
					var extraStep = game.obstructionGrid.length > constructedAt.y + 3 && game.obstructionGrid[constructedAt.y + 3][constructedAt.x + Math.floor(side)] ? 2.5 : 3.5;
					game.add({
						name: unit.name,
						type: unit.type,
						player: constructedAt.player,
						team: constructedAt.team,
						x: constructedAt.x + side,
						y: constructedAt.y + 1.25,
						direction: 4,
						orders: {type: "move", to: {x: constructedAt.x + side, y: constructedAt.y + extraStep}}
					})
				} else {
					var side = constructedAt.side ? .5 : 1.25;
					var extraStep = game.obstructionGrid.length > constructedAt.y + 4 && game.obstructionGrid[constructedAt.y + 4][constructedAt.x + Math.floor(side)] ? 3.5 : 4.5;
					game.add({
						name: unit.name,
						type: unit.type,
						player: constructedAt.player,
						team: constructedAt.team,
						x: constructedAt.x + .5,
						y: constructedAt.y + 2.5,
						direction: 4,
						orders: {type: "move", to: {x: constructedAt.x + side, y: constructedAt.y + extraStep}}
					})
				}
				constructedAt.side = !constructedAt.side
			} else if (unit.type == "vehicles") {
				if (constructedAt.name == "weapons-factory") {
					var side = .5;
					var point = {x: constructedAt.x + side, y: constructedAt.y + 2.5};
					var destination = findClosestEmptySpot(point);
					game.add({
						name: unit.name,
						type: unit.type,
						player: constructedAt.player,
						team: constructedAt.team,
						direction: 16,
						x: point.x,
						y: point.y,
						orders: {type: "move", to: destination}
					});
					constructedAt.action = "construct";
					constructedAt.animationIndex = 0
				} else {
					var side = constructedAt.side ? .5 : 1.25;
					var extraStep = game.obstructionGrid.length > constructedAt.y + 3 && game.obstructionGrid[constructedAt.y + 3][constructedAt.x + Math.floor(side)] ? 2.5 : 3.5;
					var point = {x: constructedAt.x + side, y: constructedAt.y + 2.5};
					var destination = findClosestEmptySpot(point);
					game.add({
						name: unit.name,
						type: unit.type,
						player: constructedAt.player,
						team: constructedAt.team,
						x: point.x,
						y: point.y,
						direction: 16,
						orders: {type: "move", to: destination}
					})
				}
				constructedAt.side = !constructedAt.side
			} else if (unit.type == "aircraft") {
				if (constructedAt.name == "helipad") {
					var xDistanceFromSide = Math.min(constructedAt.x, maps.currentMapData.width - constructedAt.x);
					var yDistanceFromSide = Math.min(constructedAt.y, maps.currentMapData.height - constructedAt.y);
					var xSpawn, ySpawn;
					if (xDistanceFromSide > yDistanceFromSide) {
						ySpawn = yDistanceFromSide == constructedAt.y ? 0 : maps.currentMapData.height;
						xSpawn = constructedAt.x
					} else {
						ySpawn = constructedAt.y;
						xSpawn = xDistanceFromSide == constructedAt.x ? 0 : maps.currentMapData.width
					}
					game.add({
						name: unit.name,
						type: unit.type,
						player: constructedAt.player,
						team: constructedAt.team,
						x: xSpawn,
						y: ySpawn,
						direction: 16,
						z: 1,
						orders: {type: "move", to: {x: constructedAt.cgX, y: constructedAt.cgY}}
					})
				}
			}
		}
	}
};

var singleplayer = {
	start: function() {
		menus.show("select-campaign")
	},
	beginCampaign: function (faction) {
		sounds.play(faction + "_selected");
		game.type = "singleplayer";
		singleplayer.currentFaction = faction;
		singleplayer.currentLevel = 0;
		singleplayer.loadLevel()
	},
	gameSpeed: 1,
	currentFaction: undefined,
	currentLevel: undefined,
	updateSavedMissionList: function() {
		var savedGamesString = localStorage.savedGames;
		$(".mission-list").empty();
		$("#save-mission-menu-div .mission-list").append("<option selected>[EMPTY SLOT]</option>");
		if (savedGamesString) {
			var savedGames = JSON.parse(savedGamesString);
			for (var i = 0; i < savedGames.length; i++) {
				$(".mission-list").append("<option>" + savedGames[i].name + "</option>")
			}
		}
	},
	replaySavedLevelInteractive: function (savedGame) {
		game.gameTick = 0;
		singleplayer.commands = $.extend(true, [], savedGame.commands);
		game.team = singleplayer.currentFaction;
		sidebar.init();
		sounds.muteAudio = false;
		menus.hide();
		game.running = true;
		game.replay = true;
		game.replayTick = savedGame.gameTick;
		singleplayer.animationLoop();
		game.refreshBackground = true;
		game.drawingLoop();
		singleplayer.resumeReplay()
	},
	pauseReplay: function() {
		clearInterval(game.animationInterval)
	},
	exitReplay: function() {
		game.running = false;
		game.replay = false;
		clearInterval(game.animationInterval);
		menus.show("game-type")
	},
	resumeReplay: function() {
		clearInterval(game.animationInterval);
		game.gameSpeed = 1;
		game.animationInterval = setInterval(function() {
			if (game.gameTick <= game.replayTick) {
				singleplayer.animationLoop()
			} else {
				singleplayer.pauseReplay()
			}
		}, game.animationTimeout / game.gameSpeed)
	},
	resumeGameFromHere: function() {
		clearInterval(game.animationInterval);
		game.replay = false;
		game.running = true;
		game.gameSpeed = singleplayer.gameSpeed;
		singleplayer.commands = singleplayer.commands.slice(0, game.gameTick);
		game.animationInterval = setInterval(singleplayer.animationLoop, game.animationTimeout / game.gameSpeed);
		game.refreshBackground = true
	},
	fastForwardReplay: function() {
		clearInterval(game.animationInterval);
		game.gameSpeed *= 2;
		if (game.gameSpeed > 8) {
			game.gameSpeed = 8
		}
		game.animationInterval = setInterval(function() {
			if (game.gameTick <= game.replayTick) {
				singleplayer.animationLoop()
			} else {
				singleplayer.pauseReplay()
			}
		}, game.animationTimeout / game.gameSpeed)
	},
	loadMission: function (index, interactive) {
		if (index < 0) {
			menus.showMessageBox("Nothing Selected", "Please select a mission to load");
			return
		}
		sounds.stopMusic();
		var savedGamesString = localStorage.savedGames;
		var savedGames = JSON.parse(savedGamesString);
		var savedGame = savedGames[index];
		singleplayer.currentFaction = savedGame.faction;
		singleplayer.currentLevel = savedGame.level;
		game.type = "singleplayer";
		var mapName = game.type + "/" + singleplayer.currentFaction + "/" + maps[singleplayer.currentFaction][singleplayer.currentLevel];
		maps.load(mapName, function() {
			if (interactive) {
				singleplayer.replaySavedLevelInteractive(savedGame)
			} else {
				singleplayer.replaySavedLevel(savedGame);
				singleplayer.resumeLevel();
				sounds.playMusic()
			}
		}, savedGame)
	},
	replaySavedLevel: function (savedGame) {
		game.gameTick = 0;
		singleplayer.commands = $.extend(true, [], savedGame.commands);
		game.team = singleplayer.currentFaction;
		sidebar.init();
		sounds.muteAudio = true;
		do {
			singleplayer.animationLoop()
		} while (game.gameTick < savedGame.gameTick);
		sounds.muteAudio = false;
		game.viewportX = savedGame.viewportX;
		game.viewportY = savedGame.viewportY
	},
	startLevel: function() {
		game.gameTick = 0;
		singleplayer.commands = [];
		game.team = singleplayer.currentFaction;
		sidebar.init();
		if (maps.currentMapData.videos && maps.currentMapData.videos.briefing) {
			videos.play(maps.currentMapData.videos.briefing, function() {
				singleplayer.resumeLevel();
				sounds.playMusic()
			})
		} else {
			singleplayer.resumeLevel();
			sounds.playMusic()
		}
	},
	deleteMission: function (index) {
		if (index < 0) {
			menus.showMessageBox("Nothing Selected", "Please select a mission to delete");
			return
		}
		var savedGamesString = localStorage.savedGames;
		var savedGames = JSON.parse(savedGamesString);
		savedGames.splice(index, 1);
		localStorage.savedGames = JSON.stringify(savedGames);
		singleplayer.updateSavedMissionList();
		menus.show("singleplayer-game-options")
	},
	saveMission: function (index, name) {
		name = name.trim();
		if (name === "") {
			menus.showMessageBox("No Name Given", "Please enter a name for the saved mission");
			return
		}
		var savedGamesString = localStorage.savedGames;
		var savedGames;
		if (savedGamesString) {
			savedGames = JSON.parse(savedGamesString)
		} else {
			savedGames = []
		}
		if (index <= 0) {
			index = savedGames.length
		} else {
			index = index - 1
		}
		for (var i = singleplayer.commands.length - 1; i >= 0; i--) {
			if (!singleplayer.commands[i]) {
				singleplayer.commands[i] = 0
			}
		}
		var savedGame = {
			gameTick: game.gameTick,
			viewportX: game.viewportX,
			viewportY: game.viewportY,
			name: name,
			faction: singleplayer.currentFaction,
			level: singleplayer.currentLevel,
			commands: singleplayer.commands
		};
		console.log("Game paused at tick", game.gameTick);
		savedGames[index] = savedGame;
		localStorage.savedGames = JSON.stringify(savedGames);
		singleplayer.updateSavedMissionList();
		menus.show("singleplayer-game-options")
	},
	loadLevel: function() {
		if (maps[singleplayer.currentFaction].length <= singleplayer.currentLevel) {
			menus.showMessageBox("Notice", "This was the last mission in this campaign. More are currently in BETA TESTING.", function() {
				menus.show("game-type")
			})
		} else {
			var mapName = game.type + "/" + singleplayer.currentFaction + "/" + maps[singleplayer.currentFaction][singleplayer.currentLevel];
			maps.load(mapName, singleplayer.startLevel)
		}
	},
	initializeLevel: function (data) {
		game.colorHash = {
			GoodGuy: {index: 0, color: "yellow", team: "gdi"},
			BadGuy: {index: 1, color: "red", team: "nod"},
			Neutral: {index: 0, color: "yellow", team: "civilian"}
		};
		game.players = ["GoodGuy", "BadGuy", "Neutral"];
		game.kills = [];
		game.deaths = [];
		for (var i = game.players.length - 1; i >= 0; i--) {
			game.kills[game.players[i]] = 0;
			game.deaths[game.players[i]] = 0
		}
		var startingTypes = Object.keys(data.starting).sort();
		for (var st = startingTypes.length - 1; st >= 0; st--) {
			var type = startingTypes[st];
			var startingArray = data.starting[type];
			for (var i = 0; i < startingArray.length; i++) {
				var item = startingArray[i];
				item.type = type;
				game.add(item)
			}
		}
		game.team = data.team;
		game.player = data.player;
		game.cash = $.extend([], data.cash)
	},
	gameOptions: function() {
		singleplayer.pauseLevel();
		menus.show("singleplayer-game-options")
	},
	pauseLevel: function() {
		game.running = false;
		clearInterval(game.animationInterval)
	},
	resumeLevel: function() {
		menus.hide();
		game.running = true;
		game.gameSpeed = singleplayer.gameSpeed;
		game.animationInterval = setInterval(singleplayer.animationLoop, game.animationTimeout / game.gameSpeed);
		singleplayer.animationLoop();
		game.refreshBackground = true;
		game.drawingLoop()
	},
	sendCommand: function (commandUids, command) {
		if (singleplayer.commands.length <= game.gameTick + 1) {
			singleplayer.commands[game.gameTick + 1] = [{commandUids: commandUids, command: command}]
		} else {
			singleplayer.commands[game.gameTick + 1].push({commandUids: commandUids, command: command})
		}
	},
	animationLoop: function() {
		game.gameTick++;

		/*if (singleplayer.commands.length > game.gameTick && singleplayer.commands[game.gameTick]) {
			for (var i = 0; i < singleplayer.commands[game.gameTick].length; i++) {
				var commandObject = singleplayer.commands[game.gameTick][i];
				game.receiveCommand(commandObject.commandUids, commandObject.command)
			}
		}*/

		var tick = game.gameTick;
		var cl = singleplayer.commands.length;
		if (typeof singleplayer.commands[tick] != 'undefined') {
			var ct = singleplayer.commands[tick];
			if (typeof singleplayer.commands[tick].length != 'undefined') {
				var ctl = singleplayer.commands[tick].length;
			}
		}

		if (cl > game.gameTick && ct) {
			for (var i = 0; i < ctl; i++) {
				var commandObject = ct[i];
				game.receiveCommand(commandObject.commandUids, commandObject.command)
			}
		}

		game.animationLoop()
	},
	exitLevel: function() {
		sounds.stopMusic();
		menus.show("game-type")
	},
	endLevel: function (success) {
		sounds.stopMusic();
		menus.show("mission-ended");
		singleplayer.pauseLevel();
		mouse.setCursor();
		if (success) {
			sounds.play("mission_accomplished");
			game.showEnding = "success";
			setTimeout(function() {
				singleplayer.currentLevel++;
				singleplayer.loadLevel();
				game.showEnding = false;
			}, 5e3)
		} else {
			sounds.play("mission_failure");
			game.showEnding = "failure";
			setTimeout(function() {
				menus.show("game-type");
			}, 5e3)
		}
	},
	restateMission: function() {
		$("#restate-mission-menu-div .mission-briefing").html(maps.currentMapData.briefing);
		menus.show("restate-mission")
	}
};

var sounds = {
	list: {
		building_in_progress: ["voice/building_in_progress"],
		insufficient_funds: ["voice/insufficient_funds"],
		building: ["voice/building"],
		on_hold: ["voice/on_hold"],
		cancelled: ["voice/cancelled"],
		cannot_deploy_here: ["voice/cannot_deploy_here"],
		new_construction_options: ["voice/new_construction_options"],
		construction_complete: ["voice/construction_complete"],
		not_ready: ["voice/not_ready"],
		reinforcements_have_arrived: ["voice/reinforcements_have_arrived"],
		low_power: ["voice/low_power"],
		unit_ready: ["voice/unit_ready"],
		gdi_selected: ["voice/gdi_selected"],
		nod_selected: ["voice/nod_selected"],
		battle_control_terminated: ["voice/battle_control_terminated"],
		gdi_building_captured: ["voice/gdi_building_captured"],
		nod_building_captured: ["voice/nod_building_captured"],
		mission_accomplished: ["voice/mission_accomplished"],
		mission_failure: ["voice/mission_failure"],
		construction: ["sounds/construction"],
		crumble: ["sounds/crumble"],
		sell: ["sounds/sell"],
		button: ["sounds/button"],
		scold: ["sounds/scold1"],
		vehicles_select: ["talk/ready_and_waiting", "talk/vehicle_reporting", "talk/awaiting_orders"],
		vehicles_move: ["talk/affirmative", "talk/moving_out", "talk/acknowledged", "talk/over_and_out"],
		rocket2: ["sounds/rocket2"],
		rocket1: ["sounds/rocket1"],
		tnkfire6: ["sounds/tnkfire6"],
		tnkfire2: ["sounds/tnkfire2"],
		mgun2: ["sounds/mgun2"],
		mgun11: ["sounds/mgun11"],
		gun18: ["sounds/gun18"],
		gun8: ["sounds/gun8"],
		ramgun2: ["sounds/ramgun2"],
		commando_select: ["talk/yeah1", "talk/yes1", "talk/yo1"],
		commando_move: ["talk/gotit1", "talk/onit1", "talk/rokroll1"],
		commando_bomb: ["talk/bombit1"],
		commando_killed: ["talk/keepem1", "talk/laugh1", "talk/lefty1", "talk/tuffguy1"],
		commando_die: ["talk/ramyell1"],
		"stealth-tank-appear": ["sounds/trans1"],
		"stealth-tank-disappear": ["sounds/trans1"],
		flamer2: ["sounds/flamer2"],
		obelray1: ["sounds/obelray1"],
		obelpowr: ["sounds/obelpowr"],
		nukemisl: ["sounds/nukemisl"],
		nukexplo: ["sounds/nukexplo"],
		ion1: ["sounds/ion1"],
		xplos: ["sounds/xplos"],
		xplode: ["sounds/xplode"],
		xplobig4: ["sounds/xplobig4"],
		xplobig6: ["sounds/xplobig6"],
		xplosml2: ["sounds/xplosml2"],
		sammotr2: ["sounds/sammotr2"],
		toss: ["sounds/toss"],
		infantry_select: ["talk/reporting", "talk/unit_reporting", "talk/awaiting_orders"],
		infantry_move: ["talk/affirmative", "talk/yes_sir", "talk/acknowledged", "talk/right_away"],
		infantry_die: ["sounds/nuyell1", "sounds/nuyell3", "sounds/nuyell4", "sounds/nuyell5"],
		infantry_die_fire: ["sounds/yell1"],
		infantry_die_squish: ["sounds/squish2"],
		music: ["ost/aoi", "ost/befeared", "ost/target", "ost/justdoit", "ost/ccthang"],
		struggle: ["sounds/struggle"],
		chat_message: ["sounds/tone16"],
		lobby_message: ["sounds/tone2"],
		communications_center_enabled: ["sounds/comcntr1"],
		power_down: ["sounds/powrdn1"],
		nuclear_weapon_available: ["voice/nuclear_weapon_available"],
		nuclear_weapon_launched: ["voice/nuclear_weapon_launched"],
		nuclear_warhead_approaching: ["voice/nuclear_warhead_approaching"],
		select_target: ["voice/select_target"],
		ion_cannon_ready: ["voice/ion_cannon_ready"],
		ion_cannon_charging: ["voice/ion_cannon_charging"],
		air_strike_ready: ["voice/airstrike_ready"]
	},
	shuffle: false,
	toggleShuffle: function() {
		sounds.shuffle = !sounds.shuffle
	},
	repeat: false,
	toggleRepeat: function() {
		sounds.repeat = !sounds.repeat
	},
	loaded: {},
	audioVolume: 1,
	setAudioVoume: function (volume) {
		sounds.audioVolume = volume
	},
	startStruggle: function() {
		sounds.struggleSound = sounds.loaded["struggle"].audioObjects[0];
		sounds.struggleSound.loop = true;
		sounds.struggleSound.volume = sounds.audioVolume / 3;
		sounds.struggleSound.play()
	},
	stopStruggle: function() {
		sounds.struggleSound.pause()
	},
	muteAudio: false,
	toggleAudio: function() {
		sounds.muteAudio = !sounds.muteAudio;
		$("#muteaudiobutton").val(sounds.muteAudio ? "Unmute Audio" : "Mute Audio")
	},
	muteMusic: false,
	toggleMusic: function() {
		sounds.muteMusic = !sounds.muteMusic;
		$("#mutemusicbutton").val(sounds.muteMusic ? "Unmute Music" : "Mute Music");
		if (sounds.muteMusic) {
			sounds.pauseMusic()
		}
	},
	musicVoume: 1,
	currentMusic: undefined,
	lastMusicTrack: 0,
	setMusicVoume: function (volume) {
		sounds.musicVoume = volume;
		if (sounds.currentMusic) {
			sounds.currentMusic.volume = sounds.musicVoume
		}
	},
	playMusic: function (songId) {
		if (sounds.muteMusic) {
			return
		}
		sounds.stopMusic();
		if (typeof songId === "number" && songId > -1) {
			sounds.lastMusicTrack = songId
		}
		var musicList = sounds.loaded["music"].audioObjects;
		sounds.currentMusic = musicList[sounds.lastMusicTrack];
		sounds.lastMusicTrack++;
		if (sounds.lastMusicTrack >= musicList.length) {
			sounds.lastMusicTrack = 0
		}
		sounds.resumeMusic()
	},
	pauseMusic: function() {
		if (sounds.currentMusic) {
			sounds.currentMusic.pause();
			$(sounds.currentMusic).unbind("ended")
		}
	},
	resumeMusic: function() {
		if (sounds.currentMusic) {
			sounds.currentMusic.volume = sounds.musicVoume;
			sounds.currentMusic.play();
			var currentMusic = sounds.currentMusic;
			$(currentMusic).bind("ended", function() {
				$(currentMusic).unbind("ended");
				sounds.currentMusic = undefined;
				sounds.playMusic()
			})
		}
	},
	stopMusic: function() {
		if (sounds.currentMusic) {
			sounds.currentMusic.pause();
			sounds.currentMusic.currentTime = 0;
			$(sounds.currentMusic).unbind("ended");
			sounds.currentMusic = undefined
		}
	},
	load: function() {
		$("#muteaudiobutton").click(sounds.toggleAudio);
		$("#mutemusicbutton").click(sounds.toggleMusic);
		for (var soundName in this.list) {
			var sound = {};
			sound.audioObjects = [];
			for (var i = 0; i < this.list[soundName].length; i++) {
				sound.audioObjects.push(loader.loadSound("audio/" + this.list[soundName][i]))
			}
			this.loaded[soundName] = sound
		}
	},
	play: function (soundName) {
		if (sounds.muteAudio) {
			return
		}
		var sound = sounds.loaded[soundName];
		if (sound && sound.audioObjects && sound.audioObjects.length > 0) {
			if (!sound.counter || sound.counter >= sound.audioObjects.length) {
				sound.counter = 0
			}
			var audioObject = sound.audioObjects[sound.counter];
			sound.counter++;
			audioObject.currentTime = 0;
			audioObject.volume = sounds.audioVolume;
			audioObject.play();
			return audioObject
		}
	}
};

var special = {
	type: "special",
	list: {
		"nuclear-strike": {
			name: "nuclear-strike",
			label: "Nuclear Strike",
			dependency: ["temple-of-nod", "power-plant|advanced-power-plant"],
			constructedIn: ["temple-of-nod"],
			owner: "nod",
			cost: 5e3,
			needsPower: true,
			readySound: "nuclear_weapon_available",
			firedSound: "nuclear_weapon_launched",
			arrivedSound: "nuclear_warhead_approaching"
		},
		"ion-cannon": {
			name: "ion-cannon",
			label: "Ion Cannon",
			dependency: ["advanced-communications-tower", "power-plant|advanced-power-plant"],
			constructedIn: ["advanced-communications-tower"],
			owner: "gdi",
			cost: 5e3,
			needsPower: true,
			readySound: "ion_cannon_ready",
			firedSound: "ion_cannon_charging"
		},
		"air-strike": {
			name: "air-strike",
			label: "Air Strike",
			readySound: "air_strike_ready",
			dependency: ["advanced-communications-tower|air-strike-available", "power-plant|advanced-power-plant|air-strike-available"],
			constructedIn: ["advanced-communications-tower", "construction-yard"],
			owner: "gdi",
			cost: 3e3
		}
	},
	load: function (name) {
		var item = this.list[name];
		console.log("Loading", name, "...");
		item.type = this.type
	}
};

var trees = {
	type: "trees",
	list: {
		"tree-01": {
			name: "tree-01",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-02": {
			name: "tree-02",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-03": {
			name: "tree-03",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-05": {
			name: "tree-05",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-06": {
			name: "tree-06",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-07": {
			name: "tree-07",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: 0,
			hitPoints: 600,
			armor: 1,
			gridShape: [[1, 0]],
			gridBuild: [[1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-08": {
			name: "tree-08",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 24,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-11": {
			name: "tree-11",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-12": {
			name: "tree-12",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-16": {
			name: "tree-16",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-17": {
			name: "tree-17",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [1, 0]],
			gridBuild: [[0, 0], [1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"desert-tree-04": {
			name: "desert-tree-04",
			label: "Tree",
			pixelWidth: 23,
			pixelHeight: 23,
			pixelOffsetX: 0,
			pixelOffsetY: 0,
			hitPoints: 600,
			armor: 1,
			gridShape: [[1]],
			gridBuild: [[1]],
			spriteImages: [{name: "default", count: 10}]
		},
		"desert-tree-09": {
			name: "desert-tree-09",
			label: "Tree",
			pixelWidth: 47,
			pixelHeight: 23,
			pixelOffsetX: 0,
			pixelOffsetY: 0,
			hitPoints: 600,
			armor: 1,
			gridShape: [[1, 0]],
			gridBuild: [[1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"desert-tree-08": {
			name: "desert-tree-08",
			label: "Tree",
			pixelWidth: 48,
			pixelHeight: 25,
			pixelOffsetX: 0,
			pixelOffsetY: -1,
			hitPoints: 600,
			armor: 1,
			gridShape: [[1, 0]],
			gridBuild: [[1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"desert-tree-18": {
			name: "desert-tree-18",
			label: "Tree",
			pixelWidth: 71,
			pixelHeight: 47,
			pixelOffsetX: -23,
			pixelOffsetY: -23,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0], [0, 1]],
			gridBuild: [[0, 0], [0, 1]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-cluster-01": {
			name: "tree-cluster-01",
			label: "Tree",
			pixelWidth: 72,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0, 0], [1, 1, 0]],
			gridBuild: [[0, 0, 0], [1, 1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-cluster-02": {
			name: "tree-cluster-02",
			label: "Tree",
			pixelWidth: 72,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0, 0], [1, 1, 0]],
			gridBuild: [[0, 0, 0], [1, 1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-cluster-03": {
			name: "tree-cluster-03",
			label: "Tree",
			pixelWidth: 72,
			pixelHeight: 48,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 1, 1], [1, 1, 0]],
			gridBuild: [[0, 1, 1], [1, 1, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-cluster-04": {
			name: "tree-cluster-04",
			label: "Tree",
			pixelWidth: 96,
			pixelHeight: 72,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0]],
			gridBuild: [[0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0]],
			spriteImages: [{name: "default", count: 10}]
		},
		"tree-cluster-05": {
			name: "tree-cluster-05",
			label: "Tree",
			pixelWidth: 96,
			pixelHeight: 72,
			pixelOffsetX: 0,
			pixelOffsetY: -24,
			hitPoints: 600,
			armor: 1,
			gridShape: [[0, 0, 1, 0], [1, 1, 1, 0], [0, 1, 1, 0]],
			gridBuild: [[0, 0, 1, 0], [1, 1, 1, 0], [0, 1, 1, 0]],
			spriteImages: [{name: "default", count: 10}]
		}
	},
	defaults: {
		z: 0,
		unselectable: true,
		unattackable: true,
		processOrders: function() {
			this.lifeCode = getLifeCode(this)
		},
		draw: function() {
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth || y > game.viewportHeight) {
				return
			}
			game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
		},
		animate: function() {
			if (this.lifeCode == "dead") {
				game.remove(this);
				return
			}
			this.imageOffset = 0
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		item.life = item.hitPoints;
		$.extend(item, details);
		item.cgX = item.x + item.pixelWidth / 2 / game.gridSize;
		item.cgY = item.y + item.pixelHeight / game.gridSize;
		item.softCollisionRadius = item.pixelHeight / 2;
		return item
	},
	load: function (name) {
		console.log("Loading", name, "...");
		var item = this.list[name];
		if (item.spriteCanvas) {
			return
		}
		item.type = this.type;
		item.spriteCanvas = document.createElement("canvas");
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function (image) {
			createSpriteSheetCanvas(image, item.spriteCanvas, "colormap")
		});
		item.spriteArray = [];
		item.spriteCount = 0;
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var triggers = {
	timeConversionFactor: 80,
	process: function() {
		if (game.gameTick === 1 || game.gameTick % triggers.timeConversionFactor === 0) {
			for (var i = game.triggers.length - 1; i >= 0; i--) {
				var trigger = game.triggers[i];
				if (trigger.triggered) {
					game.triggers.splice(i, 1)
				} else {
					trigger.process()
				}
			}
		}
	},
	add: function (item) {
		switch (item.action) {
			case "add":
				item.triggerFunction = function() {
					item.triggered = true;
					if (item.reinforcements) {
						sounds.play("reinforcements_have_arrived")
					}
					for (var i = item.items.length - 1; i >= 0; i--) {
						game.add(item.items[i])
					}
				};
				break;
			case "hunt":
				item.triggerFunction = function() {
					item.triggered = true;
					for (var i = game.items.length - 1; i >= 0; i--) {
						var unit = game.items[i];
						if (unit.player == item.player && (unit.type == "infantry" || unit.type == "vehicles")) {
							unit.orders = {type: "hunt"}
						}
					}
				};
				break;
			case "air-strike-available":
				item.triggerFunction = function() {
					item.triggered = true;
					game.permissions.push({name: "air-strike-available", player: game.player})
				};
				break;
			case "function":
				item.triggerFunction = function() {
					item.triggered = true;
					eval(item.function)
				};
				break;
			case "success":
				item.triggerFunction = function() {
					item.triggered = true;
					singleplayer.endLevel(true)
				};
				break;
			case "failure":
				item.triggerFunction = function() {
					item.triggered = true;
					singleplayer.endLevel(false)
				};
				break;
			case "surrender":
				item.triggerFunction = function() {
					item.triggered = true;
					multiplayer.surrender()
				};
				break;
			case "light-flare":
				item.triggerFunction = function() {
					item.triggered = true;
					game.add({type: "effects", name: "flare", x: item.x, y: item.y});
					game.add({type: "walls", name: "vision", x: item.x, y: item.y, player: item.player})
				};
				break;
			case "destroy-trigger":
				item.triggerFunction = function() {
					item.triggered = true;
					for (var i = game.triggers.length - 1; i >= 0; i--) {
						if (game.triggers[i].nickname.toUpperCase() === item.target.toUpperCase()) {
							game.triggers[i].triggered = true;
							break
						}
					}
				};
				break;
			case "rebuild-base":
				item.triggerFunction = function() {
					if (game.count("buildings", item.player, undefined, "construction-yard") > 0) {
						var playerFoggedBuildableGrid = game.createFoggedBuildableGrid(item.player);
						for (var i = item.base.length - 1; i >= 0; i--) {
							var building = item.base[i];
							if (game.canBuildOnFoggedGrid(building, playerFoggedBuildableGrid)) {
								building.player = item.player;
								building.team = item.team;
								building.action = "build";
								game.sendCommand("sidebar", {type: "deploy-building", item: building})
							}
						}
					} else {
						item.triggered = true
					}
				};
				break;
			case "create-team":
				item.triggerFunction = function() {
					for (var i = item.units.length - 1; i >= 0; i--) {
						var unit = item.units[i];
						unit.x = item.x + i / 2;
						unit.y = item.y + i % 2;
						unit.orders = {type: "hunt"};
						game.add(unit)
					}
					item.triggered = true
				};
				break;
			case "auto-create":
				item.triggerFunction = function() {
					var units = item.teams[Math.floor(item.teams.length * Math.random())];
					for (var i = units.length - 1; i >= 0; i--) {
						var unit = units[i];
						unit.x = item.x + i / 2;
						unit.y = item.y + i % 2;
						unit.orders = {type: "hunt"};
						game.add(unit)
					}
					item.triggered = true
				};
				break;
			default:
				item.triggered = true;
				console.log("Unknown action", item);
				break
		}
		switch (item.name) {
			case "timed":
				if (item.loop) {
					item.resetTime = item.time
				}
				item.process = function() {
					item.time--;
					if (item.time <= 0) {
						item.triggerFunction();
						if (item.loop) {
							item.time = item.resetTime;
							item.triggered = false
						} else {
							item.triggered = true
						}
					}
				};
				break;
			case "enters":
				item.region = {};
				for (var i = item.area.length - 1; i >= 0; i--) {
					var point = item.area[i];
					if (item.region.x1 === undefined || item.region.x1 > point.x) {
						item.region.x1 = point.x
					}
					if (item.region.y1 === undefined || item.region.y1 > point.y) {
						item.region.y1 = point.y
					}
					if (item.region.x2 === undefined || item.region.x2 < point.x) {
						item.region.x2 = point.x
					}
					if (item.region.y2 === undefined || item.region.y2 < point.y) {
						item.region.y2 = point.y
					}
				}
			case "enter":
				item.process = function() {
					var triggered = false;
					for (var i = game.items.length - 1; i >= 0; i--) {
						var unit = game.items[i];
						if (unit.player == item.player && unit.name !== "c17" && unit.x >= item.region.x1 && unit.x <= item.region.x2 && unit.y >= item.region.y1 && unit.y <= item.region.y2) {
							triggered = true;
							break
						}
					}
					if (triggered) {
						item.triggered = true;
						item.triggerFunction()
					}
				};
				break;
			case "n-units-destroyed":
				item.process = function() {
					if (game.deaths[item.player] >= item.count) {
						item.triggered = true;
						item.triggerFunction()
					}
				};
				break;
			case "all-destroyed":
				item.process = function() {
					if (game.count("infantry", item.player) === 0 && game.count("vehicles", item.player) === 0 && game.count("buildings", item.player) === 0 && game.count("turrets", item.player) === 0 && game.count("aircraft", item.player) === 0) {
						item.triggered = true;
						item.triggerFunction()
					}
				};
				break;
			case "destroyed":
				item.process = function() {
					var triggered = true;
					if (item.buildings) {
						for (var i = item.buildings.length - 1; i >= 0; i--) {
							if (game.count("buildings", item.player, undefined, item.buildings[i]) > 0) {
								triggered = false;
								break
							}
						}
					}
					if (triggered) {
						item.triggered = true;
						item.triggerFunction()
					}
				};
				break;
			case "condition":
				item.process = function() {
					if (eval(item.condition)) {
						item.triggerFunction();
						if (item.loop) {
							item.triggered = false
						}
					}
				};
				break;
			case "repeat-condition":
				item.process = function() {
					if (eval(item.condition)) {
						item.triggerFunction();
						item.triggered = false
					}
				};
				break;
			case "discovered":
			case "attacked":
				item.process = function() {
					if (game.attackedPlayers[item.player]) {
						item.triggerFunction();
						item.triggered = true
					}
				};
				break;
			default:
				console.log("Unprocessed trigger", item);
				item.process = function() {
				};
				break
		}
		return item
	}
};

var turrets = {
	type: "turrets",
	list: {
		"gun-turret": {
			name: "gun-turret",
			label: "Gun Turret",
			powerIn: 20,
			primaryWeapon: "turretcannon",
			cost: 600,
			hitPoints: 400,
			sight: 5,
			turnSpeed: 5,
			armor: 3,
			directions: 32,
			direction: 7,
			dependency: ["construction-yard", "hand-of-nod", "power-plant|advanced-power-plant"],
			owner: "nod",
			pixelWidth: 24,
			pixelHeight: 24,
			selectOffsetX: 0,
			selectOffsetY: 0,
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 32}, {
				name: "healthy",
				count: 32
			}, {name: "ultra-damaged", count: 32, spriteCount: 20}],
			gridShape: [[1]],
			gridBuild: [[1]]
		},
		"guard-tower": {
			name: "guard-tower",
			label: "Guard Tower",
			powerIn: 10,
			primaryWeapon: "chaingun",
			cost: 500,
			hitPoints: 400,
			sight: 3,
			turnSpeed: undefined,
			armor: 3,
			directions: 32,
			dependency: ["construction-yard", "barracks", "power-plant|advanced-power-plant"],
			owner: "gdi",
			pixelWidth: 24,
			pixelHeight: 24,
			selectOffsetX: 0,
			selectOffsetY: 0,
			spriteImages: [{name: "build", count: 20}, {name: "damaged", count: 1}, {
				name: "healthy",
				count: 1
			}, {name: "ultra-damaged", count: 1}],
			gridShape: [[1]],
			gridBuild: [[1]]
		},
		obelisk: {
			name: "obelisk",
			label: "Obelisk of Light",
			powerIn: 150,
			requiresPower: true,
			primaryWeapon: "laser",
			cost: 1500,
			hitPoints: 400,
			sight: 5,
			turnSpeed: undefined,
			armor: 2,
			directions: 32,
			dependency: ["construction-yard", "communications-center", "power-plant|advanced-power-plant"],
			owner: "nod",
			pixelWidth: 24,
			pixelHeight: 48,
			selectOffsetX: 0,
			selectOffsetY: 0,
			spriteImages: [{name: "healthy", count: 4}, {name: "damaged", count: 4}, {
				name: "ultra-damaged",
				count: 1
			}, {name: "build", count: 20}],
			gridShape: [[0], [1]],
			gridBuild: [[0], [1]]
		},
		"advanced-guard-tower": {
			name: "advanced-guard-tower",
			label: "Advanced Guard Tower",
			powerIn: 20,
			requiresPower: true,
			primaryWeapon: "agtmissile",
			cost: 1e3,
			hitPoints: 600,
			sight: 4,
			turnSpeed: undefined,
			armor: 2,
			directions: 32,
			dependency: ["construction-yard", "communications-center", "power-plant|advanced-power-plant"],
			owner: "gdi",
			pixelWidth: 24,
			pixelHeight: 48,
			selectOffsetX: 0,
			selectOffsetY: 0,
			spriteImages: [{name: "healthy", count: 1}, {name: "damaged", count: 1}, {
				name: "ultra-damaged",
				count: 1
			}, {name: "build", count: 14}],
			gridShape: [[0], [1]],
			gridBuild: [[0], [1]]
		},
		"sam-site": {
			name: "sam-site",
			label: "SAM Site",
			powerIn: 20,
			requiresPower: true,
			primaryWeapon: "sammissile",
			cost: 750,
			hitPoints: 400,
			sight: 3,
			turnSpeed: 5,
			armor: 3,
			directions: 32,
			firesTwice: true,
			dependency: ["construction-yard", "barracks|hand-of-nod", "power-plant|advanced-power-plant"],
			owner: "nod",
			pixelWidth: 48,
			pixelHeight: 24,
			selectOffsetX: 0,
			selectOffsetY: 0,
			orders: {type: "sam-guard"},
			action: "hidden",
			spriteImages: [{name: "healthy-rising", count: 17}, {
				name: "healthy",
				count: 32
			}, {name: "healthy-dropping", count: 15}, {name: "damaged-rising", count: 17}, {
				name: "damaged",
				count: 32
			}, {name: "damaged-dropping", count: 15}, {name: "ultra-damaged", count: 1}, {
				name: "build",
				count: 30
			}, {name: "healthy-hidden", count: 1, spriteCount: 0}, {
				name: "damaged-hidden",
				count: 1,
				spriteCount: 64
			}, {name: "ultra-damaged-hidden", count: 1, spriteCount: 128}],
			gridShape: [[1, 1]],
			gridBuild: [[1, 1]]
		}
	},
	defaults: {
		z: 0,
		powerIn: 0,
		powerOut: 0,
		action: "guard",
		type: "turrets",
		orders: {type: "stand"},
		animationIndex: 0,
		direction: 0,
		selected: false,
		findEnemyInRange: findEnemyInRange,
		canAttackEnemy: canAttackEnemy,
		turnTo: function (newDirection) {
			var turnDirection = angleDiff(this.direction, newDirection, this.directions);
			if (turnDirection) {
				if (this.turnSpeed) {
					var turnAmount = turnDirection / Math.abs(turnDirection) * this.turnSpeed / 10;
					this.direction = wrapDirection(this.direction + turnAmount, this.directions)
				} else {
					this.direction = newDirection
				}
			}
		},
		processOrders: function() {
			if (this.timeBomb) {
				this.timeBomb--;
				if (this.timeBomb == 0) {
					this.life = 0
				}
			}
			this.lifeCode = getLifeCode(this);
			if (this.lifeCode == "dead") {
				game.remove(this);
				game.add({type: "effects", name: "frag3", x: this.cgX, y: this.cgY, background: this});
				sounds.play("crumble");
				game.kills[this.attackedBy]++;
				game.deaths[this.player]++;
				return
			}
			if (this.action == "build" || this.action == "sell") {
				return
			}
			if (this.weapon.cooldown > 0) {
				this.weapon.cooldown--
			}
			switch (this.orders.type) {
				case "sell":
					if (this.animationIndex === 0) {
						sounds.play("sell")
					}
					this.repairing = false;
					this.action = "sell";
					break;
				case "repair":
					if (this.name == "sam-site") {
						this.orders = {type: "sam-guard"}
					} else {
						this.orders = {type: "stand"}
					}
					this.repairing = true;
					sounds.play("button");
					break;
				case "sam-guard":
					this.firing = false;
					if (this.lifeCode == "ultra-damaged" || this.lifeCode == "dead") {
						this.action == "hidden";
						break
					}
					var newDirection;
					var enemy;
					if (sidebar.power[this.player].powerIn <= sidebar.power[this.player].powerOut) {
						enemy = this.findEnemyInRange()
					}
					if (enemy) {
						if (this.action == "hidden") {
							this.action = "rise";
							sounds.play("sammotr2");
							this.animationIndex = 0;
							break
						}
						if (this.action == "guard") {
							newDirection = findAngle(enemy, {x: this.x + 1, y: this.y + .5}, this.directions);
							if (this.direction != newDirection) {
								this.turnTo(newDirection);
								break
							}
							if (Math.abs(angleDiff(this.direction, newDirection, this.directions)) < 3) {
								if (this.weapon.cooldown <= 0) {
									this.weapon.fire(this, this.direction, enemy)
								}
							}
						}
					} else {
						if (this.action == "guard") {
							if (this.direction != 0) {
								this.turnTo(0);
								break
							}
							this.action = "drop";
							sounds.play("sammotr2");
							this.animationIndex = 0
						}
					}
					break;
				default:
					if (this.lifeCode == "ultra-damaged" && this.requiresPower) {
						break
					}
					this.firing = false;
					var newDirection;
					var enemy;
					if (!this.requiresPower || sidebar.power[this.player].powerIn <= sidebar.power[this.player].powerOut) {
						enemy = this.findEnemyInRange()
					}
					if (enemy) {
						newDirection = findAngle(enemy, {x: this.x + .5, y: this.y + .5}, this.directions);
						var turnDirection = angleDiff(this.direction, newDirection, this.directions);
						if (turnDirection) {
							if (this.turnSpeed) {
								var turnAmount = turnDirection / Math.abs(turnDirection) * this.turnSpeed / 10;
								this.direction = wrapDirection(this.direction + turnAmount, this.directions)
							} else {
								this.direction = newDirection
							}
						}
					}
					if (enemy && this.weapon.cooldown <= 0) {
						if (this.direction === newDirection) {
							this.weapon.fire(this, this.direction, enemy)
						}
					} else {
						if (this.name == "obelisk" && this.weapon.cooldown == 60) {
							sounds.play("obelpowr")
						}
					}
					break
			}
		},
		drawSelection: function() {
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft + this.selectOffsetX;
			var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop + this.selectOffsetY;
			game.foregroundContext.drawImage(this.selectImage, x, y);
			var selectBarHeight = 4;
			game.foregroundContext.beginPath();
			game.foregroundContext.rect(x, y - selectBarHeight - 3, this.pixelWidth * this.life / this.hitPoints, selectBarHeight);
			if (this.lifeCode == "healthy") {
				game.foregroundContext.fillStyle = "lightgreen"
			} else if (this.lifeCode == "damaged") {
				game.foregroundContext.fillStyle = "yellow"
			} else {
				game.foregroundContext.fillStyle = "red"
			}
			game.foregroundContext.fill();
			game.foregroundContext.beginPath();
			game.foregroundContext.strokeStyle = "black";
			game.foregroundContext.rect(x, y - selectBarHeight - 3, this.pixelWidth, selectBarHeight);
			game.foregroundContext.stroke()
		},
		draw: function() {
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth || y > game.viewportHeight) {
				return
			}
			game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight);
			if (this.selected) {
				this.drawSelection()
			}
			if (this.repairing) {
				game.foregroundContext.globalAlpha = sidebar.textBrightness;
				game.foregroundContext.drawImage(sidebar.repairImageBig, x + (this.pixelWidth - sidebar.repairImageBig.width) / 2, y + (this.pixelHeight - sidebar.repairImageBig.height) / 2);
				game.foregroundContext.globalAlpha = 1
			}
		},
		animate: function() {
			if (this.lifeCode == "dead") {
				this.imageList = this.spriteArray["ultra-damaged"];
				if (this.name == "gun-turret" || this.name == "sam-site") {
					this.imageOffset = this.imageList.offset + Math.floor(this.direction)
				} else {
					this.imageOffset = this.imageList.offset
				}
				return
			}
			this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
			switch (this.action) {
				case "rise":
					this.imageList = this.spriteArray[this.lifeCode + "-rising"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.action = "guard"
					}
					break;
				case "drop":
					this.imageList = this.spriteArray[this.lifeCode + "-dropping"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						this.action = "hidden"
					}
					break;
				case"hidden":
					this.imageList = this.spriteArray[this.lifeCode + "-hidden"];
					this.imageOffset = this.imageList.offset;
					break;
				case "guard":
					this.imageList = this.spriteArray[this.lifeCode];
					if (this.name == "gun-turret" || this.name == "sam-site") {
						this.imageOffset = this.imageList.offset + Math.floor(this.direction)
					} else {
						this.imageOffset = this.imageList.offset
					}
					break;
				case "build":
					this.imageList = this.spriteArray["build"];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						if (this.name == "sam-site") {
							this.action = "hidden"
						} else {
							this.action = "guard"
						}
					}
					break;
				case "sell":
					this.imageList = this.spriteArray["build"];
					this.imageOffset = this.imageList.offset + (this.imageList.count - this.animationIndex - 1);
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.animationIndex = 0;
						game.remove(this);
						game.cash[this.player] += this.cost / 2;
						this.action = "guard"
					}
					break
			}
			if (this.repairing) {
				if (this.life >= this.hitPoints) {
					this.repairing = false;
					this.life = this.hitPoints
				} else {
					var cashSpent = .5;
					if (game.cash[this.player] > cashSpent) {
						game.cash[this.player] -= cashSpent;
						this.life += cashSpent * 2 * this.hitPoints / this.cost
					}
				}
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		if (details.percentLife) {
			item.life = item.hitPoints * details.percentLife;
			delete item.percentLife
		} else {
			item.life = item.hitPoints
		}
		$.extend(item, details);
		item.cgX = item.x + item.pixelWidth / 2 / game.gridSize;
		item.cgY = item.y + item.pixelHeight / 2 / game.gridSize;
		item.softCollisionRadius = item.pixelWidth / 2;
		item.hardCollisionRadius = item.pixelWidth / 4;
		item.weapon = weapons.add({name: item.primaryWeapon});
		return item
	},
	load: function (name) {
		var item = this.list[name];
		console.log("Loading", name, "...");
		item.type = this.type;
		item.spriteCanvas = document.createElement("canvas");
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function (image) {
			createSpriteSheetCanvas(image, item.spriteCanvas, "colormap")
		});
		item.selectImage = loader.loadImage("images/" + "sidebar/select-" + item.pixelWidth / game.gridSize + "-" + item.pixelHeight / game.gridSize + ".png");
		item.spriteArray = [];
		item.spriteCount = 0;
		item.gridWidth = item.gridShape[0].length;
		item.gridHeight = item.gridShape.length;
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (typeof item.spriteImages[i].spriteCount !== "undefined") {
				item.spriteCount = item.spriteImages[i].spriteCount
			}
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var vehicles = {
	type: "vehicles",
	list: {
		"flame-tank": {
			name: "flame-tank",
			label: "Flame Tank",
			speed: 18,
			turnSpeed: 5,
			armor: 3,
			primaryWeapon: "tankflamer",
			cost: 800,
			sight: 4,
			dependency: ["weapons-factory|airstrip", "communications-center"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "nod",
			hitPoints: 300,
			crusher: true,
			directions: 32,
			firesTwice: true,
			deathAnimation: "napalm3",
			spriteImages: [{name: "move", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -14,
			selectOffsetY: -12,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		"stealth-tank": {
			name: "stealth-tank",
			label: "Stealth Tank",
			speed: 30,
			turnSpeed: 5,
			armor: 2,
			primaryWeapon: "rocket",
			alpha: 1,
			cloaked: false,
			cloakTimeout: 0,
			cost: 900,
			sight: 4,
			dependency: ["weapons-factory|airstrip", "communications-center"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "nod",
			hitPoints: 110,
			crusher: true,
			directions: 32,
			firesTwice: true,
			deathAnimation: "frag3",
			spriteImages: [{name: "move", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -14,
			selectOffsetY: -10,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4,
			draw: function() {
				this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
				this.interpolatedY = this.y + game.movementInterpolationFactor * this.lastMovementY;
				var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft;
				var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop;
				if (x < -this.pixelWidth + this.pixelOffsetX || y < -this.pixelHeight + this.pixelOffsetY || x > game.viewportWidth + this.pixelWidth - this.pixelOffsetX || y > game.viewportHeight + this.pixelHeight - this.pixelOffsetY) {
					return
				}
				if (this.player == game.player) {
					game.foregroundContext.globalAlpha = .5 + this.alpha / 2;
					game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x + this.pixelOffsetX, y + this.pixelOffsetY, this.pixelWidth, this.pixelHeight);
					game.foregroundContext.globalAlpha = 1;
					if (this.selected) {
						this.drawSelection()
					}
				} else {
					if (this.cloaked) {
					} else {
						game.foregroundContext.globalAlpha = this.alpha;
						game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x + this.pixelOffsetX, y + this.pixelOffsetY, this.pixelWidth, this.pixelHeight);
						game.foregroundContext.globalAlpha = 1;
						if (this.selected) {
							this.drawSelection()
						}
					}
				}
			}
		},
		"recon-bike": {
			name: "recon-bike",
			label: "Recon Bike",
			speed: 40,
			turnSpeed: 10,
			armor: 1,
			primaryWeapon: "rocket",
			cost: 500,
			sight: 2,
			dependency: ["weapons-factory|airstrip"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "nod",
			hitPoints: 160,
			directions: 32,
			deathAnimation: "frag1",
			spriteImages: [{name: "move", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -12,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		buggy: {
			name: "buggy",
			label: "Nod Buggy",
			speed: 30,
			turnSpeed: 10,
			armor: 2,
			primaryWeapon: "machinegun",
			cost: 300,
			sight: 2,
			dependency: ["weapons-factory|airstrip"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "nod",
			hitPoints: 140,
			directions: 32,
			hasTurret: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			deathAnimation: "frag1",
			spriteImages: [{name: "move", count: 32}, {name: "turret", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -12,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		jeep: {
			name: "jeep",
			label: "Hum-vee",
			dependency: ["weapons-factory|airstrip"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "gdi",
			speed: 30,
			turnSpeed: 10,
			armor: 2,
			primaryWeapon: "machinegun",
			cost: 400,
			sight: 2,
			hitPoints: 150,
			directions: 32,
			hasTurret: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			deathAnimation: "frag1",
			spriteImages: [{name: "move", count: 32}, {name: "turret", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -12,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		apc: {
			name: "apc",
			label: "Armored Personnel Carrier",
			dependency: ["weapons-factory|airstrip", "barracks|hand-of-nod"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "both",
			speed: 30,
			turnSpeed: 10,
			armor: 2,
			primaryWeapon: "machinegun",
			cost: 700,
			sight: 4,
			hitPoints: 200,
			directions: 32,
			crusher: true,
			isTransport: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			deathAnimation: "frag3",
			maxCargo: 5,
			spriteImages: [{name: "move", count: 32}, {name: "load-left", count: 3}, {name: "load-right", count: 3}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -10,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			animationIndex: 0,
			hardCollisionRadius: 4,
			animate: function() {
				this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
				if (this.action == "load") {
					this.imageList = this.spriteArray["load-" + (this.direction < 16 ? "right" : "left")];
					this.imageOffset = this.imageList.offset;
					this.animationIndex = 0
				} else if (this.action == "close") {
					this.imageList = this.spriteArray["load-" + (this.direction < 16 ? "right" : "left")];
					this.imageOffset = this.imageList.offset + this.animationIndex;
					this.animationIndex++;
					if (this.animationIndex >= this.imageList.count) {
						this.action = "move"
					}
				} else {
					this.imageList = this.spriteArray["move"];
					this.imageOffset = this.imageList.offset + Math.floor(this.direction)
				}
				this.damageSmoke()
			}
		},
		"mobile-hq": {
			name: "mobile-hq",
			label: "Mobile HQ",
			dependency: undefined,
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "both",
			speed: 18,
			turnSpeed: 5,
			armor: 2,
			cost: 600,
			sight: 5,
			hitPoints: 110,
			directions: 32,
			hasTurret: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			turretDirection: 0,
			autoRotatingTurret: true,
			deathAnimation: "frag3",
			spriteImages: [{name: "move", count: 32}, {name: "turret", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -12,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		"ssm-launcher": {
			name: "ssm-launcher",
			label: "SSM Launcher",
			dependency: ["weapons-factory|airstrip", "obelisk"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "nod",
			speed: 18,
			turnSpeed: 5,
			primaryWeapon: "honestjohn",
			armor: 2,
			cost: 750,
			sight: 4,
			ammunition: 2,
			maxAmmunition: 2,
			hitPoints: 120,
			directions: 32,
			hasTurret: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			deathAnimation: "frag3",
			spriteImages: [{name: "move", count: 32}, {name: "turret-2", count: 32}, {
				name: "turret-1",
				count: 32
			}, {name: "turret-0", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -12,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		artillery: {
			name: "artillery",
			label: "Artillery",
			dependency: ["weapons-factory|airstrip"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "nod",
			speed: 18,
			turnSpeed: 2.5,
			primaryWeapon: "artilleryshell",
			armor: 2,
			cost: 450,
			sight: 4,
			hitPoints: 75,
			directions: 32,
			deathAnimation: "art-exp1",
			spriteImages: [{name: "move", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -12,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		"mobile-rocket-launch-system": {
			name: "mobile-rocket-launch-system",
			label: "Mobile Rocket Launch System",
			dependency: ["weapons-factory|airstrip", "advanced-communications-tower|temple-of-nod"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "both",
			speed: 18,
			turnSpeed: 2.5,
			firesTwice: true,
			primaryWeapon: "mrlsmissile",
			armor: 2,
			cost: 450,
			sight: 4,
			hitPoints: 75,
			directions: 32,
			deathAnimation: "art-exp1",
			spriteImages: [{name: "move", count: 32}, {name: "turret-low", count: 32}, {
				name: "turret-high",
				count: 32
			}],
			hasTurret: true,
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -12,
			selectOffsetY: -12,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		"light-tank": {
			name: "light-tank",
			label: "Light Tank",
			speed: 18,
			turnSpeed: 5,
			armor: 3,
			primaryWeapon: "lightcannon",
			cost: 600,
			sight: 3,
			dependency: ["weapons-factory|airstrip"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "nod",
			hitPoints: 300,
			crusher: true,
			directions: 32,
			hasTurret: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			deathAnimation: "frag1",
			spriteImages: [{name: "move", count: 32}, {name: "turret", count: 32}],
			pixelOffsetX: -12,
			pixelOffsetY: -12,
			selectOffsetX: -14,
			selectOffsetY: -10,
			pixelHeight: 24,
			pixelWidth: 24,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		"medium-tank": {
			name: "medium-tank",
			label: "Medium Tank",
			speed: 18,
			turnSpeed: 5,
			armor: 3,
			primaryWeapon: "mediumcannon",
			cost: 800,
			sight: 3,
			dependency: ["weapons-factory|airstrip"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "gdi",
			hitPoints: 400,
			crusher: true,
			directions: 32,
			hasTurret: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			deathAnimation: "frag1",
			spriteImages: [{name: "move", count: 32}, {name: "turret", count: 32}],
			pixelOffsetX: -18,
			pixelOffsetY: -18,
			selectOffsetX: -14,
			selectOffsetY: -10,
			pixelHeight: 36,
			pixelWidth: 36,
			softCollisionRadius: 7,
			hardCollisionRadius: 4
		},
		"mammoth-tank": {
			name: "mammoth-tank",
			label: "Mammoth Tank",
			speed: 12,
			turnSpeed: 5,
			armor: 3,
			primaryWeapon: "heavycannon",
			secondaryWeapon: "mammothtusk",
			cost: 1500,
			sight: 4,
			firesTwice: true,
			dependency: ["weapons-factory|airstrip", "repair-facility"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "gdi",
			hitPoints: 600,
			crusher: true,
			directions: 32,
			hasTurret: true,
			turretPixelOffsetX: 0,
			turretPixelOffsetY: 0,
			deathAnimation: "art-exp1",
			spriteImages: [{name: "move", count: 32}, {name: "turret", count: 32}],
			pixelOffsetX: -24,
			pixelOffsetY: -24,
			selectOffsetX: -12,
			selectOffsetY: -18,
			pixelHeight: 48,
			pixelWidth: 48,
			softCollisionRadius: 12,
			hardCollisionRadius: 8
		},
		harvester: {
			name: "harvester",
			label: "Tiberium Harvester",
			dependency: ["weapons-factory|airstrip", "refinery"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "both",
			turnSpeed: 5,
			speed: 12,
			armor: 2,
			cost: 1400,
			hitPoints: 600,
			sight: 2,
			directions: 32,
			crusher: true,
			tiberium: 0,
			deathAnimation: "fball1",
			spriteImages: [{
				name: "move",
				count: 32
			} , {
				name: "harvest-0",
				count: 4
			} , {
				name: "harvest-4",
				count: 4
			} , {
				name: "harvest-8",
				count: 4
			} , {
				name: "harvest-12",
				count: 4
			} , {
				name: "harvest-16",
				count: 4
			} , {
				name: "harvest-20",
				count: 4
			} , {
				name: "harvest-24",
				count: 4
			} , {
				name: "harvest-28",
				count: 4
			}],
			pixelOffsetX: -24,
			pixelOffsetY: -24,
			selectOffsetX: -12,
			selectOffsetY: -14,
			pixelHeight: 48,
			pixelWidth: 48,
			softCollisionRadius: 8,
			hardCollisionRadius: 4,
			processOrders: function() {
				this.lifeCode = getLifeCode(this);
				if (this.lifeCode == "dead") {
					game.remove(this);
					game.add({type: "effects", name: this.deathAnimation, x: this.x, y: this.y});
					if (explosionSound[this.deathAnimation]) {
						sounds.play(explosionSound[this.deathAnimation])
					}
					game.kills[this.attackedBy]++;
					game.deaths[this.player]++;
					return
				}
				this.lastMovementX = 0;
				this.lastMovementY = 0;
				switch (this.orders.type) {
					case "stand":
						this.action = "move";
						break;
					case "move":
						this.action = "move";
						if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < .2) {
							this.orders = {type: "stand"}
						} else {
							this.moveTo(this.orders.to)
						}
						break;
					case "harvest":
						this.action = "move";
						if (!this.orders.tiberium || this.orders.tiberium.stage <= 0) {
							this.orders.tiberium = this.findTiberiumInRange()
						}
						if (!this.orders.tiberium) {
							console.log("could not find any tiberium")
						}
						if (this.tiberium >= 10 || !this.orders.tiberium) {
							this.orders.type = "harvest-return"
						}
						if (this.orders.tiberium) {
							if (Math.sqrt(Math.pow(this.orders.tiberium.cgX - this.x, 2) + Math.pow(this.orders.tiberium.cgY - this.y, 2)) < 1) {
								var newDirection = findAngle({
									x: this.orders.tiberium.cgX,
									y: this.orders.tiberium.cgY
								}, this, this.directions);
								var harvestDirection = Math.floor(newDirection / 4) * 4 % this.directions;
								if (this.direction != harvestDirection) {
									this.turnTo(harvestDirection)
								} else {
									this.action = "harvest-" + harvestDirection
								}
							} else {
								var moved = this.moveTo({x: this.orders.tiberium.cgX, y: this.orders.tiberium.cgY});
								if (!moved) {
									this.orders.tiberium = undefined;
									console.log("could not reach the tiberium")
								}
							}
						}
						break;
					case "harvest-return":
						this.action = "move";
						if (!this.orders.refinery || this.orders.refinery.player != this.player || this.orders.refinery.lifeCode == "dead" || this.orders.refinery.lifeCode == "ultra-damaged") {
							this.orders.refinery = this.findRefineryInRange()
						}
						if (this.orders.refinery && this.orders.refinery.lifeCode != "ultra-damaged" && this.orders.refinery.lifeCode != "dead" && this.orders.refinery.player == this.player) {
							var busy = this.orders.refinery.nextHarvester && this.orders.refinery.nextHarvester !== this;
							var destination = {
								x: this.orders.refinery.x + .5 + (busy ? 2 : 0),
								y: this.orders.refinery.y + 2.5
							};
							if (this.tiberium > 0 && Math.sqrt(Math.pow(destination.x - this.x, 2) + Math.pow(destination.y - this.y, 2)) < 4 && !busy) {
								if (!this.orders.refinery.nextHarvester) {
									this.orders.refinery.nextHarvester = this
								}
							}
							if (this.tiberium > 0 && Math.sqrt(Math.pow(destination.x - this.x, 2) + Math.pow(destination.y - this.y, 2)) < 1 && !busy) {
								this.x = destination.x;
								this.y = destination.y;
								if (this.direction != 14) {
									this.turnTo(14)
								} else {
									this.orders.refinery.orders = {type: "harvest", harvester: this};
									game.remove(this)
								}
							} else {
								this.moveTo(destination)
							}
						} else {
							this.orders.refinery = undefined
						}
						break
				}
				this.cgX = this.x;
				this.cgY = this.y
			},
			findRefineryInRange: function() {
				var lastDistance;
				var lastItem;
				for (var i = 0; i < game.buildings.length; i++) {
					var item = game.buildings[i];
					if (item.name == "refinery" && item.player == this.player && item.lifeCode != "ultra-damaged" && item.lifeCode != "dead") {
						var distance = Math.pow(item.cgX - this.x, 2) + Math.pow(item.y - this.y, 2);
						if (!lastItem || lastDistance > distance) {
							lastDistance = distance;
							lastItem = item
						}
					}
				}
				return lastItem
			},
			findTiberiumInRange: function() {
				var lastDistance;
				var lastItem;
				for (var i = 0; i < game.tiberium.length; i++) {
					var item = game.tiberium[i];
					var distance = Math.pow(item.cgX - this.x, 2) + Math.pow(item.cgY - this.y, 2);
					if (!lastItem || lastDistance > distance) {
						lastDistance = distance;
						lastItem = item
					}
				}
				return lastItem
			},
			animate: function() {
				if (this.lifeCode !== "dead") {
					this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
					this.imageList = this.spriteArray[this.action];
					if (this.action == "move") {
						this.imageOffset = this.imageList.offset + wrapDirection(Math.round(this.direction), this.directions)
					} else {
						if (!this.imageList) {
							console.log(this)
						}
						this.imageOffset = this.imageList.offset + this.animationIndex;
						this.animationIndex++;
						if (this.animationIndex >= this.imageList.count) {
							this.animationIndex = 0;
							this.orders.tiberium.stage--;
							this.tiberium++;
							if (this.orders.tiberium.stage <= 0) {
								this.orders.tiberium = undefined
							}
						}
					}
				}
				this.damageSmoke()
			}
		},
		mcv: {
			name: "mcv",
			label: "Mobile Construction Vehicle",
			dependency: ["weapons-factory|airstrip", "advanced-communications-tower|temple-of-nod"],
			constructedIn: ["weapons-factory", "airstrip"],
			owner: "both",
			speed: 12,
			turnSpeed: 5,
			armor: 2,
			cost: 5e3,
			crusher: true,
			deathAnimation: "frag3",
			sight: 2,
			hitPoints: 600,
			directions: 32,
			spriteImages: [{name: "move", count: 32}],
			pixelOffsetX: -24,
			pixelOffsetY: -24,
			selectOffsetX: -12,
			selectOffsetY: -14,
			pixelHeight: 48,
			pixelWidth: 48,
			softCollisionRadius: 12,
			hardCollisionRadius: 8,
			animate: function() {
				this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
				this.imageList = this.spriteArray["move"];
				this.imageOffset = this.imageList.offset + wrapDirection(Math.round(this.direction), this.directions);
				this.damageSmoke()
			}
		}
	},
	defaults: {
		action: "move",
		orders: {type: "stand"},
		direction: 4,
		turretDirection: 4,
		animationIndex: 0,
		selected: false,
		path: undefined,
		lastMovementX: 0,
		lastMovementY: 0,
		spriteSheet: undefined,
		findEnemyInRange: findEnemyInRange,
		canAttackEnemy: canAttackEnemy,
		checkCollision: checkCollision,
		moveTo: moveTo,
		z: 0,
		damageSmoke: function() {
			if (this.name == "stealth-tank") {
				return
			}
			if (this.lifeCode == "damaged" || this.lifeCode == "ultra-damaged") {
				if (!this.smoke || this.smoke.lifeCode == "dead") {
					this.smoke = game.add({name: "smoke", type: "effects", x: this.x, y: this.y, loop: 60})
				}
				this.smoke.x = this.x;
				this.smoke.y = this.y;
				this.smoke.lastMovementX = this.lastMovementX;
				this.smoke.lastMovementY = this.lastMovementY
			} else {
				if (this.smoke) {
					game.remove(this.smoke)
				}
			}
		},
		stealthCloak: function() {
			if (!this.cloaked) {
				if (this.cloakTimeout > 0) {
					this.cloakTimeout--
				} else {
					this.action = "cloak";
					this.cloakTimeout = 20
				}
			}
		},
		stealthUncloak: function() {
			this.action = "uncloak";
			this.cloakTimeout = 20
		},
		processOrders: function() {
			this.lifeCode = getLifeCode(this);
			if (this.lifeCode == "dead") {
				game.remove(this);
				game.add({type: "effects", name: this.deathAnimation, x: this.x, y: this.y});
				if (explosionSound[this.deathAnimation]) {
					sounds.play(explosionSound[this.deathAnimation])
				}
				game.kills[this.attackedBy]++;
				return
			}
			if (this.attacked) {
				this.attacked = false;
				if (this.name == "stealth-tank") {
					this.stealthUncloak()
				}
			}
			var enemy;
			this.lastMovementX = 0;
			this.lastMovementY = 0;
			this.firing = false;
			if (this.name == "mcv") {
				this.canBuildHere = true;
				if (this.selected && this.player == game.player && this === mouse.objectUnderMouse) {
					var buildingType = buildings.list["construction-yard"];
					var grid = buildingType.gridBuild;
					var thisy = Math.floor(this.y) - 1;
					var thisx = Math.floor(this.x) - 1;
					for (var y = 0; y < grid.length; y++) {
						for (var x = 0; x < grid[y].length; x++) {
							if (grid[y][x] == 1) {
								if (!this.canBuildHere) {
									break
								}
								if (thisy + y < 0 || thisy + y >= game.foggedBuildableGrid.length || thisx + x < 0 || thisx + x >= game.foggedBuildableGrid[thisy + y].length || game.foggedBuildableGrid[thisy + y][thisx + x] !== 0) {
									this.canBuildHere = false;
									break
								}
							}
						}
					}
				}
			}
			if (this.weapon && this.weapon.cooldown > 0) {
				this.weapon.cooldown--;
				if (this.name == "ssm-launcher") {
					if (this.ammunition == 0 && this.weapon.cooldown == 0) {
						this.ammunition = 2;
						this.weapon.cooldown = this.weapon.rateOfFire
					}
				}
			}
			if (this.weapon2 && this.weapon2.cooldown > 0) {
				this.weapon2.cooldown--
			}
			if (this.name == "mobile-rocket-launch-system") {
				this.action = "move"
			}
			switch (this.orders.type) {
				case "guard":
				case "hunt":
					if (this.name == "apc") {
						this.action = "move"
					}
				case "stand":
					if (this.primaryWeapon) {
						enemy = this.findEnemyInRange();
						if (enemy) {
							this.orders = {type: "attack", to: enemy, lastOrder: this.orders}
						}
						if (this.name == "stealth-tank") {
							this.stealthCloak()
						}
					}
					break;
				case "patrol":
					if (this.name == "apc") {
						this.action = "move"
					}
					if (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2) < .2) {
						this.orders = {type: "patrol", from: this.orders.to, to: this.orders.from}
					} else {
						this.moveTo(this.orders.to)
					}
					if (this.primaryWeapon) {
						enemy = this.findEnemyInRange();
						if (enemy) {
							this.orders = {type: "attack", to: enemy, lastOrder: this.orders}
						}
						if (this.name == "stealth-tank") {
							this.stealthCloak()
						}
					}
					this.orders = {type: "attack", to: enemy, lastOrder: this.orders};
					break;
				case "move":
					if (this.name == "apc") {
						this.action = "move"
					} else if (this.name == "stealth-tank") {
						this.stealthCloak()
					}
					if (Math.sqrt(Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2)) < .2) {
						this.orders = {type: "stand"}
					} else {
						var moved = this.moveTo(this.orders.to);
						if (!this.autoRotatingTurret && this.turretDirection != Math.floor(this.direction)) {
							this.aimTo(Math.floor(this.direction))
						}
						if (!moved) {
							this.orders = {type: "stand"}
						}
					}
					break;
				case "attack":
					if (this.name == "apc") {
						this.action = "move"
					} else if (this.name == "stealth-tank") {
						this.stealthCloak()
					}
					if (!this.orders.to || this.orders.to.lifeCode == "dead" || this.orders.to.player == this.player || !this.canAttackEnemy(this.orders.to)) {
						if (this.orders.lastOrder) {
							this.orders = this.orders.lastOrder
						} else {
							this.orders = {type: "guard"}
						}
						return
					}
					var newDirection = findAngle(this.orders.to, this, this.directions);
					if (this.hasTurret) {
						if (newDirection != this.turretDirection) {
							this.aimTo(newDirection)
						}
					}
					if (Math.pow(this.orders.to.cgX - this.x, 2) + Math.pow(this.orders.to.cgY - this.y, 2) < Math.pow(this.weapon.range + this.orders.to.hardCollisionRadius / game.gridSize - 1, 2)) {
						if (this.hasTurret) {
							if (newDirection != this.turretDirection) {
								this.aimTo(newDirection)
							} else {
								if (this.name == "mobile-rocket-launch-system") {
									this.action = "attack"
								}
								if (this.name == "mammoth-tank") {
									if (this.orders.to.type == "infantry" || this.orders.to.type == "aircraft") {
										if (this.weapon2.cooldown <= 0) {
											this.weapon2.fire(this, Math.floor(this.turretDirection), this.orders.to)
										}
									} else {
										if (this.weapon.cooldown <= 0) {
											this.weapon.fire(this, Math.floor(this.turretDirection), this.orders.to)
										}
									}
								} else {
									if (this.weapon.cooldown <= 0) {
										if (this.name == "ssm-launcher") {
											if (this.ammunition > 0) {
												this.ammunition--;
												this.weapon.fire(this, Math.floor(this.turretDirection), this.orders.to)
											}
										} else {
											this.weapon.fire(this, Math.floor(this.turretDirection), this.orders.to)
										}
									}
								}
							}
						} else {
							if (newDirection != this.direction) {
								this.turnTo(newDirection)
							} else {
								if (this.name == "stealth-tank") {
									this.stealthUncloak();
									if (this.alpha == 1 && this.weapon.cooldown <= 0) {
										this.weapon.fire(this, Math.floor(this.direction), this.orders.to)
									}
								} else {
									if (this.weapon.cooldown <= 0) {
										this.weapon.fire(this, Math.floor(this.direction), this.orders.to)
									}
								}
							}
						}
					} else {
						this.moveTo(this.orders.to)
					}
					break;
				case "load":
					if (this.cargo.length == this.maxCargo) {
						this.orders.type == "stand";
						this.action = "close";
						break
					}
					var newDirection;
					if (Math.abs(angleDiff(28, this.direction, this.directions)) < Math.abs(angleDiff(4, this.direction, this.directions))) {
						newDirection = 28
					} else {
						newDirection = 4
					}
					if (this.direction != newDirection) {
						this.turnTo(newDirection)
					} else {
						this.action = "load";
						this.orders.type = "stand"
					}
					break;
				case "finish-load":
					if (this.orders.counter == undefined) {
						this.orders.counter = 50
					}
					if (this.orders.counter) {
						this.orders.counter--
					} else {
						this.action = "close";
						this.animationIndex = 0;
						this.orders.type = "stand"
					}
					break;
				case "unload":
					if (this.cargo.length === 0) {
						this.orders.type = "stand";
						break
					}
					var newDirection;
					if (Math.abs(angleDiff(28, this.direction, this.directions)) < Math.abs(angleDiff(4, this.direction, this.directions))) {
						newDirection = 28
					} else {
						newDirection = 4
					}
					if (this.direction != newDirection) {
						this.turnTo(newDirection)
					} else {
						this.action = "load";
						var emptySpot = findClosestEmptySpot(this);
						var x = emptySpot.x - .5;
						var y = emptySpot.y;
						var toggle = false;
						while (this.cargo.length) {
							var soldier = this.cargo.pop();
							soldier.x = x;
							soldier.y = y + (toggle ? .25 : 0);
							toggle = !toggle;
							x = x + .25;
							game.add(soldier)
						}
						this.orders = {type: "finish-load"}
					}
					break;
				case "deploy":
					if (this.direction != 14) {
						this.turnTo(14)
					} else {
						if (!this.canBuildHere) {
							if (game.player === this.player) {
								sounds.play("cannot_deploy_here")
							}
							this.orders = {type: "stand"};
							return
						}
						game.remove(this);
						game.add({
							name: "construction-yard",
							type: "buildings",
							x: Math.floor(this.x) - 1,
							y: Math.floor(this.y) - 1,
							action: "build",
							team: this.team,
							player: this.player,
							percentLife: this.life / this.hitPoints
						});
						if (game.player === this.player) {
							sounds.play("construction")
						}
					}
					break
			}
			this.cgX = this.x;
			this.cgY = this.y
		},
		drawSelection: function() {
			var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft + this.selectOffsetX;
			var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop + this.selectOffsetY;
			game.foregroundContext.drawImage(this.selectImage, x, y);
			var selectBarHeight = 4;
			var selectBarWidth = this.selectImage.width;
			game.foregroundContext.beginPath();
			game.foregroundContext.rect(x, y - selectBarHeight - 3, selectBarWidth * this.life / this.hitPoints, selectBarHeight);
			if (this.lifeCode == "healthy") {
				game.foregroundContext.fillStyle = "lightgreen"
			} else if (this.lifeCode == "damaged") {
				game.foregroundContext.fillStyle = "yellow"
			} else {
				game.foregroundContext.fillStyle = "red"
			}
			game.foregroundContext.fill();
			game.foregroundContext.beginPath();
			game.foregroundContext.strokeStyle = "black";
			game.foregroundContext.rect(x, y - selectBarHeight - 3, selectBarWidth, selectBarHeight);
			game.foregroundContext.stroke();
			if (this.name == "apc") {
				game.foregroundContext.beginPath();
				game.foregroundContext.fillStyle = "lightyellow";
				game.foregroundContext.strokeStyle = "black";
				for (var i = 0; i < this.maxCargo; i++) {
					game.foregroundContext.rect(x + 2 + i * 4, y + 18, 4, 4);
					if (i < this.cargo.length) {
						game.foregroundContext.fill()
					}
					game.foregroundContext.stroke()
				}
			}
			if (game.debugMode) {
				game.foregroundContext.fillText(this.orders.type, x + 9, y)
			}
		},
		draw: function() {
			this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
			this.interpolatedY = this.y + game.movementInterpolationFactor * this.lastMovementY;
			var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth + this.pixelOffsetX || y < -this.pixelHeight + this.pixelOffsetY || x > game.viewportWidth + this.pixelWidth - this.pixelOffsetX || y > game.viewportHeight + this.pixelHeight - this.pixelOffsetY) {
				return
			}
			game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x + this.pixelOffsetX, y + this.pixelOffsetY, this.pixelWidth, this.pixelHeight);
			if (this.hasTurret) {
				game.foregroundContext.drawImage(this.spriteCanvas, this.turretImageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x + this.pixelOffsetX, y + this.pixelOffsetY - 3, this.pixelWidth, this.pixelHeight)
			}
			if (this.selected) {
				this.drawSelection()
			}
		},
		animate: function() {
			this.spriteColorOffset = game.colorHash[this.player].index * this.pixelHeight;
			this.imageList = this.spriteArray["move"];
			this.imageOffset = this.imageList.offset + Math.floor(this.direction);
			if (this.name == "stealth-tank") {
				if (this.action == "cloak") {
					if (this.alpha == 1) {
						sounds.play("stealth-tank-disappear")
					}
					if (this.alpha > 0) {
						this.alpha -= 1 / 8
					} else {
						this.cloaked = true
					}
				} else if (this.action == "uncloak") {
					if (this.alpha <= 0) {
						sounds.play("stealth-tank-appear")
					}
					this.cloaked = false;
					if (this.alpha < 1) {
						this.alpha += 1 / 8
					}
				}
			}
			if (this.hasTurret) {
				if (this.autoRotatingTurret) {
					this.turretDirection = wrapDirection(this.turretDirection + 1, this.directions)
				}
				if (this.name == "ssm-launcher") {
					this.turretImageList = this.spriteArray["turret-" + this.ammunition]
				} else if (this.name == "mobile-rocket-launch-system") {
					if (this.action == "attack") {
						this.turretImageList = this.spriteArray["turret-high"]
					} else {
						this.turretImageList = this.spriteArray["turret-low"]
					}
				} else {
					this.turretImageList = this.spriteArray["turret"]
				}
				this.turretImageOffset = this.turretImageList.offset + Math.floor(this.turretDirection)
			}
			this.damageSmoke()
		},
		turnTo: function (toDirection) {
			if (toDirection > this.direction && toDirection - this.direction < this.directions / 2 || toDirection < this.direction && this.direction - toDirection > this.directions / 2) {
				this.direction = this.direction + this.turnSpeed / 10
			} else {
				this.direction = this.direction - this.turnSpeed / 10
			}
			if (this.direction > this.directions - 1) {
				this.direction -= this.directions - 1
			} else if (this.direction < 0) {
				this.direction += this.directions - 1
			}
		},
		aimTo: function (toDirection) {
			if (toDirection > this.turretDirection && toDirection - this.turretDirection < this.directions / 2 || toDirection < this.turretDirection && this.turretDirection - toDirection > this.directions / 2) {
				this.turretDirection++
			} else {
				this.turretDirection--
			}
			if (this.turretDirection > this.directions - 1) {
				this.turretDirection = 0
			} else if (this.turretDirection < 0) {
				this.turretDirection = this.directions - 1
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		if (name == "apc") {
			item.cargo = []
		}
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		$.extend(item, details);
		if (item.primaryWeapon) {
			item.weapon = weapons.add({name: item.primaryWeapon})
		}
		if (item.secondaryWeapon) {
			item.weapon2 = weapons.add({name: item.secondaryWeapon})
		}
		if (item.percentLife) {
			item.life = item.hitPoints * item.percentLife;
			delete item.percentLife
		} else {
			item.life = item.hitPoints
		}
		return item
	},
	load: function (name) {
		var item = this.list[name];
		console.log("Loading", name, "...");
		item.spriteCanvas = document.createElement("canvas");
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function (image) {
			createSpriteSheetCanvas(image, item.spriteCanvas, name == "harvester" || name == "mcv" ? "colormap" : "grayscale")
		});
		item.spriteArray = [];
		item.spriteCount = 0;
		item.selectImage = loader.loadImage("images/" + "sidebar/select-1-1.png");
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var videos = {
	loaded: {},
	currentVideo: undefined,
	musicPlaying: false,
	running: false,
	init: function() {
		videos.context = $(".videocanvas")[0].getContext("2d");
		videos.context.fillStyle = "black";
		videos.context.scale(2, 2)
	},
	play: function (videoName, onFinishHandler) {
		mouse.setCursor();
		menus.hide();
		videos.musicPlaying = sounds.currentMusic && !sounds.currentMusic.paused && !sounds.currentMusic.ended;
		if (videos.musicPlaying) {
			sounds.pauseMusic()
		}
		this.onFinishHandler = onFinishHandler;
		var videoObject = this.loaded[videoName];
		this.currentVideo = videoObject;
		videoObject.volume = sounds.audioVolume;
		videos.running = true;
		videoObject.play();
		videos.context.fillRect(0, 0, game.canvasWidth, game.canvasHeight);
		requestAnimationFrame(videos.draw)
	},
	draw: function() {
		if (videos.running && videos.currentVideo && !videos.currentVideo.paused && !videos.currentVideo.ended) {
			videos.context.drawImage(videos.currentVideo, 0, 0, videos.currentVideo.videoWidth, videos.currentVideo.videoWidth, 0, 55, 320, 312);
			requestAnimationFrame(videos.draw)
		}
	},
	stop: function() {
		if (videos.currentVideo && videos.running) {
			videos.currentVideo.pause();
			videos.currentVideo.currentTime = 0
		}
		videos.ended()
	},
	ended: function() {
		videos.running = false;
		videos.context.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
		if (this.onFinishHandler) {
			this.onFinishHandler()
		}
		if (videos.musicPlaying) {
			sounds.resumeMusic()
		}
	},
	load: function (videoName) {
		if (!(videoName in videos.loaded)) {
			videos.loaded[videoName] = loader.loadVideo("videos/" + videoName);
			videos.loaded[videoName].addEventListener("ended", function() {
				videos.ended()
			})
		}
	}
};

var walls = {
	type: "walls",
	list: {
		sandbag: {
			name: "sandbag",
			label: "Sandbag Wall",
			cost: 50,
			hitPoints: 1,
			sight: 0,
			armor: 2,
			pixelWidth: 24,
			pixelHeight: 24,
			spriteImages: [],
			gridShape: [[1]],
			gridBuild: [[1]],
			dependency: ["construction-yard"],
			owner: "both"
		},
		"chain-link": {
			name: "chain-link",
			label: "Chainlink Fence",
			cost: 75,
			hitPoints: 1,
			sight: 0,
			armor: 2,
			pixelWidth: 24,
			pixelHeight: 24,
			spriteImages: [],
			gridShape: [[1]],
			gridBuild: [[1]],
			dependency: ["construction-yard"],
			owner: "both"
		},
		"concrete-wall": {
			name: "concrete-wall",
			label: "Concrete Wall",
			cost: 100,
			hitPoints: 1,
			sight: 0,
			armor: 2,
			pixelWidth: 24,
			pixelHeight: 24,
			spriteImages: [],
			gridShape: [[1]],
			gridBuild: [[1]],
			dependency: ["construction-yard"],
			owner: "both"
		},
		"barb-wire": {
			name: "barb-wire",
			label: "Barbwire Fence",
			cost: 25,
			hitPoints: 1,
			sight: 0,
			armor: 2,
			pixelWidth: 24,
			pixelHeight: 24,
			spriteImages: [],
			gridShape: [[1]],
			gridBuild: [[1]],
			dependency: ["construction-yard"],
			owner: "both"
		},
		"wooden-fence": {
			name: "wooden-fence",
			label: "Wooden Fence",
			cost: 25,
			hitPoints: 1,
			sight: 0,
			armor: 2,
			pixelWidth: 24,
			pixelHeight: 24,
			spriteImages: [],
			gridShape: [[1]],
			gridBuild: [[1]],
			dependency: ["construction-yard"],
			owner: "both"
		},
		vision: {
			name: "vision",
			sight: 2,
			counter: 2,
			pixelWidth: 24,
			pixelHeight: 24,
			gridShape: [[1]],
			gridBuild: [[1]]
		}
	},
	defaults: {
		selected: false,
		unselectable: true,
		unattackable: true,
		z: 0,
		processOrders: function() {
			if (this.name == "vision") {
				return
			}
			this.lifeCode = getLifeCode(this)
		},
		draw: function() {
			if (this.name == "vision") {
				return
			}
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth || y > game.viewportHeight) {
				return
			}
			game.foregroundContext.drawImage(this.spriteCanvas, this.imageOffset * this.pixelWidth, this.spriteColorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
		},
		animate: function() {
			if (this.name == "vision") {
				this.counter--;
				if (!this.counter) {
					game.remove(this)
				}
				return
			}
			this.spriteColorOffset = 0;
			if (this.lifeCode == "dead") {
				game.remove(this);
				return
			}
			var hasAbove = this.y > 0 ? game.obstructionGrid[this.y - 1][this.x] == this.name : false;
			var hasBelow = this.y < game.obstructionGrid.length - 1 ? game.obstructionGrid[this.y + 1][this.x] == this.name : false;
			var hasLeft = this.x > 0 ? game.obstructionGrid[this.y][this.x - 1] == this.name : false;
			var hasRight = this.x < game.obstructionGrid[this.y].length - 1 ? game.obstructionGrid[this.y][this.x + 1] == this.name : false;
			this.imageOffset = (this.lifeCode == "healthy" ? 0 : 16) + (hasAbove ? 1 : 0) + (hasRight ? 2 : 0) + (hasBelow ? 4 : 0) + (hasLeft ? 8 : 0)
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		item.life = item.hitPoints;
		$.extend(item, details);
		item.cgX = item.x + item.pixelWidth / 2 / game.gridSize;
		item.cgY = item.y + item.pixelHeight / 2 / game.gridSize;
		item.softCollisionRadius = item.pixelWidth / 2;
		return item
	},
	load: function (name) {
		var item = this.list[name];
		if (item.spriteCanvas) {
			return
		}
		console.log("Loading", name, "...");
		item.type = this.type;
		item.spriteCanvas = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png");
		item.spriteArray = [];
		item.spriteCount = 0;
		item.gridWidth = item.gridShape[0].length;
		item.gridHeight = item.gridShape.length;
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var tiberium = {
	type: "tiberium",
	list: {
		tiberium: {
			name: "tiberium",
			label: "Tiberium Ore",
			pixelWidth: 24,
			pixelHeight: 24,
			spriteImages: [{name: "default", count: 12}],
			gridShape: [[0]],
			gridBuild: [[1]]
		}
	},
	defaults: {
		z: -2,
		stage: 12,
		selected: false,
		unselectable: true,
		unattackable: true,
		processOrders: function() {
		},
		draw: function() {
			var x = Math.round(this.x * game.gridSize) - game.viewportX + game.viewportLeft;
			var y = Math.round(this.y * game.gridSize) - game.viewportY + game.viewportTop;
			if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth || y > game.viewportHeight) {
				return
			}
			if (this.stage) {
				game.foregroundContext.drawImage(this.spriteSheet, (this.stage - 1) * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
			}
		},
		animate: function() {
			this.spriteColorOffset = 0;
			if (this.stage <= 0) {
				game.remove(this);
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		$.extend(item, details);
		item.cgX = item.x + .5;
		item.cgY = item.y + .5;
		item.softCollisionRadius = item.pixelWidth / 2;
		return item
	},
	load: function (name) {
		console.log("Loading", name, "...");
		var item = this.list[name];
		item.type = this.type;
		item.spriteSheet = loader.loadImage("images/" + this.type + "/" + name + "-sprite-sheet.png", function() {
		});
		item.spriteArray = [];
		item.spriteCount = 0;
		for (var i = 0; i < item.spriteImages.length; i++) {
			var constructImageCount = item.spriteImages[i].count;
			var constructImageName = item.spriteImages[i].name;
			if (item.spriteImages[i].direction) {
				for (var j = 0; j < item.directions; j++) {
					item.spriteArray[constructImageName + "-" + j] = {
						name: constructImageName + "-" + j,
						count: constructImageCount,
						offset: item.spriteCount
					};
					item.spriteCount += constructImageCount
				}
			} else {
				item.spriteArray[constructImageName] = {
					name: constructImageName,
					count: constructImageCount,
					offset: item.spriteCount
				};
				item.spriteCount += constructImageCount
			}
		}
	}
};

var weapons = {
	list: {
		sniper: {
			name: "sniper",
			damage: 125,
			projectile: "invisiblesniper",
			rateOfFire: 40,
			range: 5.5,
			sound: "ramgun2"
		},
		chaingun: {
			name: "chaingun",
			projectile: "invisibleheavy",
			damage: 25,
			rateOfFire: 50,
			range: 4,
			sound: "gun8",
			fire: function (from, direction, target) {
				from.firing = true;
				this.cooldown = this.rateOfFire;
				game.add({
					type: "bullets",
					name: this.projectile,
					targetDistance: this.range,
					x: from.x,
					y: from.y,
					direction: direction,
					directions: from.directions,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		pistol: {
			name: "pistol",
			damage: 1,
			rateOfFire: 7,
			range: 1.75,
			sound: "gun18",
			muzzleFlash: undefined,
			projectile: "invisible"
		},
		m16: {
			name: "m16",
			damage: 8,
			projectile: "invisible",
			rateOfFire: 20,
			range: 2,
			sound: "mgun2",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				from.firing = true;
				this.cooldown = this.rateOfFire;
				game.add({
					type: "bullets",
					name: this.projectile,
					x: from.x,
					y: from.y,
					direction: direction,
					directions: from.directions,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		rocket: {
			name: "rocket",
			projectile: "heatseeker",
			damage: 30,
			rateOfFire: 60,
			secondaryRateOfFire: 10,
			range: 4,
			sound: "rocket",
			muzzleFlash: undefined,
			canAttackAir: true,
			fire: function (from, direction, target) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				var directionConverted = from.name == "bazooka" ? direction * 4 : direction;
				var height = from.name == "orca" ? 3 / 4 : 1 / 4;
				var weapon = this;
				var turretXOffset = 0;
				var turretYOffset = 0;
				game.add({
					type: "bullets",
					targetDistance: weapon.range,
					name: weapon.projectile,
					x: from.x + turretXOffset,
					y: from.y + turretYOffset,
					z: height,
					direction: directionConverted,
					target: target,
					weapon: weapon,
					from: from.player,
					delay: 5
				});
				sounds.play(weapon.sound)
			}
		},
		infantryflamer: {
			name: "infantryflamer",
			projectile: "flameburst",
			damage: 35,
			rateOfFire: 50,
			range: 2,
			sound: "flamer2",
			muzzleFlash: "flame",
			fire: function (from, direction, target) {
				from.firing = true;
				this.cooldown = this.rateOfFire;
				game.add({
					type: "bullets",
					name: this.projectile,
					targetDistance: this.range,
					x: from.x,
					y: from.y,
					direction: direction,
					directions: from.directions,
					target: target,
					weapon: this,
					from: from.player
				});
				if (this.muzzleFlash) {
					game.add({
						type: "effects",
						name: this.muzzleFlash,
						direction: direction,
						x: from.x,
						y: from.y,
						z: 0,
						weapon: this
					})
				}
				sounds.play(this.sound)
			}
		},
		tankflamer: {
			name: "tankflamer",
			projectile: "flameburst",
			damage: 50,
			rateOfFire: 50,
			secondaryRateOfFire: 10,
			range: 2,
			sound: "flamer2",
			muzzleFlash: "flame",
			fire: function (from, direction, target) {
				from.firing = true;
				this.cooldown = this.rateOfFire;
				game.add({
					type: "bullets",
					name: this.projectile,
					targetDistance: this.range,
					x: from.x,
					y: from.y,
					direction: direction,
					directions: from.directions,
					target: target,
					weapon: this,
					from: from.player
				});
				if (this.muzzleFlash) {
					game.add({
						type: "effects",
						name: this.muzzleFlash,
						direction: wrapDirection(Math.round(direction / 4), 8),
						x: from.x,
						y: from.y,
						z: -1 / 8,
						weapon: this
					})
				}
				sounds.play(this.sound)
			}
		},
		chemspray: {
			name: "chemspray",
			projectile: "chemburst",
			damage: 80,
			rateOfFire: 70,
			range: 2,
			sound: "flamer2",
			muzzleFlash: "chem",
			fire: function (from, direction, target) {
				from.firing = true;
				this.cooldown = this.rateOfFire;
				game.add({
					type: "bullets",
					name: this.projectile,
					targetDistance: this.range,
					x: from.x,
					y: from.y,
					direction: direction,
					directions: from.directions,
					target: target,
					weapon: this,
					from: from.player
				});
				if (this.muzzleFlash) {
					game.add({
						type: "effects",
						name: this.muzzleFlash,
						direction: direction,
						x: from.x,
						y: from.y,
						z: 0,
						weapon: this
					})
				}
				sounds.play(this.sound)
			}
		},
		grenade: {
			name: "grenade",
			projectile: "bomb",
			damage: 50,
			rateOfFire: 60,
			range: 3.25,
			sound: "toss",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				from.firing = true;
				this.cooldown = this.rateOfFire;
				var fireDirection = findAngle(target, from, 32);
				var fireDistance = Math.sqrt(Math.pow((target.cgX || target.x) - from.x, 2) + Math.pow((target.cgY || target.y) - from.y, 2));
				var weapon = this;
				var turretXOffset = 0;
				var turretYOffset = 0;
				game.add({
					type: "bullets",
					targetDistance: fireDistance,
					peakDistance: fireDistance / 2,
					name: weapon.projectile,
					x: from.x + turretXOffset,
					y: from.y + turretYOffset,
					direction: fireDirection,
					target: target,
					weapon: weapon,
					from: from.player
				});
				sounds.play(weapon.sound)
			}
		},
		lightcannon: {
			name: "lightcannon",
			projectile: "cannon",
			damage: 25,
			rateOfFire: 60,
			range: 4,
			sound: "tnkfire3",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				this.cooldown = this.rateOfFire;
				from.firing = true;
				var fireDistance = Math.sqrt(Math.pow((target.cgX || target.x) - from.x, 2) + Math.pow((target.cgY || target.y) - from.y, 2));
				if (fireDistance > this.range) {
					fireDistance = this.range
				}
				game.add({
					type: "bullets",
					targetDistance: fireDistance,
					name: this.projectile,
					x: from.x,
					y: from.y,
					direction: direction,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		mediumcannon: {
			name: "mediumcannon",
			projectile: "cannon",
			damage: 30,
			rateOfFire: 50,
			range: 4.75,
			sound: "tnkfire4",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				this.cooldown = this.rateOfFire;
				from.firing = true;
				var fireDistance = Math.sqrt(Math.pow((target.cgX || target.x) - from.x, 2) + Math.pow((target.cgY || target.y) - from.y, 2));
				if (fireDistance > this.range) {
					fireDistance = this.range
				}
				game.add({
					type: "bullets",
					targetDistance: fireDistance,
					name: this.projectile,
					x: from.x,
					y: from.y,
					direction: direction,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		heavycannon: {
			name: "heavycannon",
			projectile: "cannon",
			damage: 40,
			rateOfFire: 80,
			secondaryRateOfFire: 5,
			range: 4.75,
			sound: "tnkfire6",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				var fireDistance = Math.sqrt(Math.pow((target.cgX || target.x) - from.x, 2) + Math.pow((target.cgY || target.y) - from.y, 2));
				if (fireDistance > this.range) {
					fireDistance = this.range
				}
				game.add({
					type: "bullets",
					targetDistance: fireDistance,
					name: this.projectile,
					x: from.x,
					y: from.y,
					direction: direction,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		turretcannon: {
			name: "turretcannon",
			projectile: "cannon",
			damage: 40,
			rateOfFire: 60,
			range: 6,
			sound: "tnkfire6",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				this.cooldown = this.rateOfFire;
				from.firing = true;
				var fireDistance = Math.sqrt(Math.pow((target.cgX || target.x) - from.x, 2) + Math.pow((target.cgY || target.y) - from.y, 2));
				if (fireDistance > this.range) {
					fireDistance = this.range
				}
				game.add({
					type: "bullets",
					targetDistance: fireDistance,
					name: this.projectile,
					x: from.x + .5,
					y: from.y + .5,
					direction: direction,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		mammothtusk: {
			name: "mammothtusk",
			projectile: "heatseeker2",
			damage: 75,
			rateOfFire: 80,
			secondaryRateOfFire: 5,
			canAttackAir: true,
			range: 6,
			sound: "rocket1",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				var weapon = this;
				var turretXOffset = 0;
				var turretYOffset = 0;
				game.add({
					type: "bullets",
					targetDistance: weapon.range,
					name: weapon.projectile,
					x: from.x + turretXOffset,
					y: from.y + turretYOffset,
					z: 1 / 2,
					direction: from.turretDirection,
					target: target,
					weapon: weapon,
					from: from.player
				});
				sounds.play(weapon.sound)
			}
		},
		mrlsmissile: {
			name: "mrlsmissile",
			projectile: "heatseeker3",
			damage: 75,
			rateOfFire: 80,
			secondaryRateOfFire: 10,
			range: 6,
			sound: "rocket1",
			canAttackAir: true,
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				var weapon = this;
				var turretXOffset = 0;
				var turretYOffset = 0;
				game.add({
					type: "bullets",
					targetDistance: weapon.range,
					name: weapon.projectile,
					x: from.x + turretXOffset,
					y: from.y + turretYOffset,
					direction: from.turretDirection,
					target: target,
					weapon: weapon,
					from: from.player
				});
				sounds.play(weapon.sound)
			}
		},
		artilleryshell: {
			name: "artilleryshell",
			projectile: "ballistic",
			damage: 150,
			rateOfFire: 65,
			range: 6,
			sound: "tnkfire2",
			muzzleFlash: undefined,
			fire: function (from, direction, target) {
				this.cooldown = this.rateOfFire;
				from.firing = true;
				var fireDistance = Math.sqrt(Math.pow((target.cgX || target.x) - from.x, 2) + Math.pow((target.cgY || target.y) - from.y, 2));
				if (fireDistance > this.range) {
					fireDistance = this.range
				}
				game.add({
					type: "bullets",
					targetDistance: fireDistance,
					peakDistance: fireDistance / 2,
					name: this.projectile,
					x: from.x,
					y: from.y,
					direction: direction,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		machinegun: {
			name: "machinegun",
			damage: 15,
			rateOfFire: 30,
			range: 4,
			sound: "mgun11",
			muzzleFlash: undefined,
			projectile: "invisible"
		},
		boatmissile: {
			name: "boatmissile",
			projectile: "heatseeker2",
			damage: 60,
			rateOfFire: 35,
			secondaryRateOfFire: 5,
			range: 7.5,
			sound: "rocket2",
			muzzleFlash: undefined,
			fire: function (from, direction, target, firstShot) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				var weapon = this;
				var turretXOffset = ((from.pixelWidth - 20) * from.direction + 10 + from.pixelOffsetX) / game.gridSize;
				var turretYOffset = from.pixelOffsetY / game.gridSize;
				game.add({
					type: "bullets",
					targetDistance: weapon.range,
					name: weapon.projectile,
					x: from.x + turretXOffset,
					y: from.y + turretYOffset,
					direction: from.turretDirection,
					target: target,
					weapon: weapon,
					from: from.player
				});
				sounds.play(weapon.sound)
			}
		},
		agtmissile: {
			name: "agtmissile",
			projectile: "heatseeker2",
			damage: 60,
			rateOfFire: 40,
			secondaryRateOfFire: 5,
			range: 6.5,
			sound: "rocket2",
			muzzleFlash: undefined,
			canAttackAir: true,
			fire: function (from, direction, target) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				game.add({
					type: "bullets",
					targetDistance: this.range,
					name: this.projectile,
					x: from.x + .5,
					y: from.y + 2,
					z: .5,
					delay: 0,
					direction: from.direction,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		napalm: {
			name: "napalm",
			projectile: "bomblet",
			damage: 100,
			rateOfFire: 20,
			secondaryRateOfFire: 2,
			range: 4.5,
			fire: function (from) {
				from.firing = true;
				if (from.ammunition === 0) {
					from.salvos--;
					this.cooldown = this.rateOfFire;
					from.firing = false;
					if (from.salvos) {
						from.ammunition = from.maxAmmunition
					}
				} else {
					this.cooldown = this.secondaryRateOfFire
				}
				game.add({type: "bullets", name: this.projectile, x: from.x, y: from.y, z: .9, weapon: this})
			}
		},
		laser: {
			name: "laser",
			damage: 200,
			rateOfFire: 90,
			range: 7.5,
			sound: "obelray1",
			muzzleFlash: undefined,
			projectile: "lasershot",
			fire: function (from, direction, target) {
				from.firing = true;
				this.cooldown = this.rateOfFire;
				game.add({
					type: "bullets",
					name: this.projectile,
					targetDistance: this.range,
					x: from.x,
					y: from.y,
					direction: direction,
					directions: from.directions,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		},
		sammissile: {
			name: "sammissile",
			projectile: "bigheatseeker",
			damage: 50,
			rateOfFire: 50,
			secondaryRateOfFire: 10,
			range: 7.5,
			sound: "rocket2",
			muzzleFlash: "sam-fire",
			canAttackAir: true,
			fire: function (from, direction, target) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				game.add({
					type: "bullets",
					targetDistance: this.range,
					name: this.projectile,
					x: from.x + 1,
					y: from.y + .5,
					z: .5,
					delay: 0,
					direction: from.direction,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound);
				if (this.muzzleFlash) {
					game.add({
						type: "effects",
						name: this.muzzleFlash,
						direction: Math.round(direction / 4),
						x: from.x,
						y: from.y,
						weapon: this
					})
				}
			}
		},
		honestjohn: {
			name: "honestjohn",
			projectile: "flamemissile",
			damage: 100,
			rateOfFire: 200,
			secondaryRateOfFire: 100,
			range: 10,
			sound: "rocket1",
			fire: function (from, direction, target) {
				from.firing = true;
				if (from.firesTwice) {
					if (!this.firstSalvo) {
						this.firstSalvo = true;
						this.cooldown = this.secondaryRateOfFire
					} else {
						this.firstSalvo = false;
						this.cooldown = this.rateOfFire
					}
				} else {
					this.cooldown = this.rateOfFire
				}
				game.add({
					type: "bullets",
					targetDistance: this.range,
					name: this.projectile,
					x: from.x,
					y: from.y,
					z: .5,
					delay: 0,
					direction: from.turretDirection,
					target: target,
					weapon: this,
					from: from.player
				});
				sounds.play(this.sound)
			}
		}
	},
	defaults: {
		cooldown: 0,
		fire: function (from, direction, target) {
			from.firing = true;
			this.cooldown = this.rateOfFire;
			game.add({
				type: "bullets",
				name: this.projectile,
				targetDistance: this.range,
				x: from.x,
				y: from.y,
				direction: direction,
				directions: from.directions,
				target: target,
				weapon: this,
				from: from.player
			});
			if (this.muzzleFlash) {
				game.add({
					type: "effects",
					name: this.muzzleFlash,
					direction: direction,
					x: from.x,
					y: from.y,
					weapon: this
				})
			}
			sounds.play(this.sound)
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		$.extend(item, details);
		return item
	}
};

var bullets = {
	type: "bullets",
	list: {
		invisiblesniper: {name: "invisiblesniper", explosion: "piff", warhead: "hollowpoint"},
		invisible: {name: "invisible", explosion: "piff", warhead: "smallarms"},
		cannon: {
			name: "cannon",
			explosion: "vehhit3",
			warhead: "armorpiercing",
			rotationSpeed: 0,
			bulletSpeed: 100,
			count: 1,
			innacurate: false,
			smokeTrail: false,
			image: "120mm",
			directions: 32,
			pixelWidth: 24,
			pixelHeight: 24
		},
		ballistic: {
			name: "ballistic",
			explosion: "art-exp1",
			warhead: "highexplosive",
			ballisticCurve: true,
			rotationSpeed: 0,
			bulletSpeed: 30,
			count: 1,
			delay: 6,
			innacurate: true,
			smokeTrail: false,
			image: "120mm",
			directions: 32,
			pixelWidth: 24,
			pixelHeight: 24
		},
		heatseeker2: {
			name: "heatseeker2",
			explosion: "frag1",
			rotationSpeed: 5,
			bulletSpeed: 60,
			inaccurate: true,
			smokeTrail: true,
			image: "dragon",
			directions: 32,
			count: 1,
			warhead: "highexplosive",
			pixelWidth: 15,
			pixelHeight: 15
		},
		heatseeker3: {
			name: "heatseeker3",
			explosion: "frag1",
			rotationSpeed: 7,
			bulletSpeed: 60,
			inaccurate: true,
			smokeTrail: true,
			image: "dragon",
			directions: 32,
			count: 1,
			warhead: "highexplosive",
			pixelWidth: 15,
			pixelHeight: 15
		},
		bigheatseeker: {
			name: "bigheatseeker",
			explosion: "vehhit1",
			rotationSpeed: 10,
			bulletSpeed: 100,
			inaccurate: false,
			smokeTrail: true,
			image: "missile",
			directions: 32,
			count: 32,
			warhead: "armorpiercing",
			pixelWidth: 15,
			pixelHeight: 15
		},
		flameburst: {name: "flameburst", warhead: "fire", bulletSpeed: 40},
		chemburst: {name: "chemburst", warhead: "highexplosive", bulletSpeed: 40},
		bomblet: {
			name: "bomblet",
			explosion: "napalm2",
			warhead: "fire",
			bulletSpeed: 12,
			count: 7,
			innacurate: false,
			smokeTrail: false,
			image: "bomblet",
			pixelWidth: 7,
			pixelHeight: 7,
			lastMovementX: 0,
			lastMovementY: 0,
			animate: function() {
				if (this.delay) {
					this.delay--
				}
				var x, y;
				if (this.count) {
					this.offsetIndex++;
					if (this.offsetIndex >= this.count) {
						this.offsetIndex = 0
					}
				} else {
					this.offsetIndex = 0
				}
				this.z -= 1 / 16;
				if (this.z <= 0) {
					for (var i = game.attackableItems.length - 1; i >= 0; i--) {
						var item = game.attackableItems[i];
						if (item.indestructible) {
							continue
						}
						var itemX = item.cgX;
						var itemY = item.cgY;
						if (Math.floor(itemX - this.x) < 3 && Math.floor(itemY - this.y) < 3) {
							var leastDistance = Math.pow(Math.pow(itemX - this.x, 2) + Math.pow(itemY - this.y, 2), .5) * game.gridSize;
							if (leastDistance > item.softCollisionRadius) {
								leastDistance -= item.softCollisionRadius
							}
							var damage = this.weapon.damage * warheads[this.warhead].damageVersusArmor[item.armor] / 100;
							var damageFactor = Math.pow(.5, Math.floor(leastDistance / warheads[this.warhead].spread));
							if (damageFactor > .125) {
								item.life -= item.prone ? damage * damageFactor / 2 : damage * damageFactor;
								if (item.life <= 0) {
									item.life = 0
								}
								item.attacked = true;
								game.attackedPlayers[item.player] = true;
								item.attackedBy = this.from;
								if (item.type == "infantry") {
									item.infantryDeath = warheads[this.warhead].infantryDeath
								}
							}
						}
					}
					game.remove(this);
					if (this.explosion) {
						game.add({type: "effects", name: this.explosion, x: this.x, y: this.y - this.z})
					}
					if (explosionSound[this.explosion]) {
						sounds.play(explosionSound[this.explosion])
					}
				}
			}
		},
		bomb: {
			name: "bomb",
			explosion: "vehhit2",
			warhead: "highexplosive",
			bulletSpeed: 20,
			ballisticCurve: true,
			image: "bomb",
			count: 8,
			directions: 32,
			inaccurate: true,
			smokeTrail: false,
			pixelWidth: 8,
			pixelHeight: 8
		},
		heatseeker: {
			name: "heatseeker",
			explosion: "vehhit2",
			rotationSpeed: 5,
			bulletSpeed: 60,
			inaccurate: false,
			smokeTrail: true,
			image: "dragon",
			directions: 32,
			count: 32,
			warhead: "armorpiercing",
			pixelWidth: 15,
			pixelHeight: 15
		},
		flamemissile: {
			name: "flamemissile",
			explosion: "napalm3",
			rotationSpeed: 10,
			bulletSpeed: 40,
			inaccurate: false,
			smokeTrail: true,
			image: "missile",
			directions: 32,
			count: 32,
			warhead: "fire",
			pixelWidth: 15,
			pixelHeight: 15
		},
		invisibleheavy: {name: "invisibleheavy", explosion: "piffpiff", warhead: "highexplosive"},
		atombomb: {
			name: "atombomb",
			warhead: "nuke",
			image: "atombomb",
			explosion: "atomsfx",
			bulletSpeed: 100,
			animationIndex: 0,
			animationCount: 4,
			pixelWidth: 48,
			pixelHeight: 48,
			direction: 1,
			animate: function() {
				this.animationIndex++;
				if (this.animationIndex >= this.animationCount) {
					this.animationIndex = 0
				}
				var movement = this.bulletSpeed / game.gridSize / game.speedAdjustmentFactor;
				this.lastMovementX = 0;
				if (this.direction == 1) {
					this.offsetIndex = this.animationCount + this.animationIndex;
					this.z += movement;
					this.lastMovementY = -movement;
					if (this.z > 40) {
						this.direction = -1;
						this.x = this.target.x;
						this.y = this.target.y;
						sounds.play("nuclear_warhead_approaching")
					}
				} else {
					this.offsetIndex = this.animationIndex;
					this.z -= movement;
					this.lastMovementY = movement;
					if (this.z <= 0) {
						for (var i = game.attackableItems.length - 1; i >= 0; i--) {
							var item = game.attackableItems[i];
							if (item.indestructible) {
								continue
							}
							var itemX = item.cgX;
							var itemY = item.cgY;
							if (Math.floor(itemX - this.x) < 3 && Math.floor(itemY - this.y) < 3) {
								var leastDistance = Math.sqrt(Math.pow(itemX - this.x, 2) + Math.pow(itemY - this.y, 2)) * game.gridSize;
								if (leastDistance > item.softCollisionRadius) {
									leastDistance -= item.softCollisionRadius
								}
								var damage = 1e3 * warheads[this.warhead].damageVersusArmor[item.armor] / 100;
								var damageFactor = Math.pow(.5, Math.floor(leastDistance / warheads[this.warhead].spread));
								if (damageFactor > .125) {
									item.life -= item.prone ? damage * damageFactor / 2 : damage * damageFactor;
									if (item.life < 0) {
										item.life = 0
									}
									item.attacked = true;
									game.attackedPlayers[item.player] = true;
									item.attackedBy = this.from;
									if (item.type == "infantry") {
										item.infantryDeath = warheads[this.warhead].infantryDeath
									}
								}
							}
						}
						if (explosionSound[this.explosion]) {
							sounds.play(explosionSound[this.explosion])
						}
						game.remove(this);
						var bomb = this;
						game.add({
							type: "effects", name: this.explosion, x: this.x, y: this.y, oncomplete: function() {
							}
						})
					}
				}
			},
			draw: function() {
				this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
				this.interpolatedY = this.y - this.z + game.movementInterpolationFactor * this.lastMovementY;
				var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft - this.pixelWidth / 2;
				var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop - this.pixelHeight / 2;
				if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth + this.pixelHeight || y > game.viewportHeight + this.pixelHeight) {
					return
				}
				game.foregroundContext.drawImage(this.spriteSheet, this.offsetIndex * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
			}
		},
		lasershot: {
			name: "lasershot",
			explosion: undefined,
			warhead: "super",
			rotationSpeed: 0,
			bulletSpeed: undefined,
			inaccurate: false,
			smokeTrail: false,
			animate: function() {
				if (this.delay) {
					this.delay--
				}
				var thisX = this.x;
				var thisY = this.y;
				var targetX = this.target.cgX;
				var targetY = this.target.cgY;
				this.x = targetX;
				this.y = targetY;
				for (var i = game.attackableItems.length - 1; i >= 0; i--) {
					var item = game.attackableItems[i];
					if (item.indestructible) {
						continue
					}
					var itemX = item.cgX;
					var itemY = item.cgY;
					if (Math.floor(itemX - this.x) < 3 && Math.floor(itemY - this.y) < 3) {
						var leastDistance = Math.pow(Math.pow(itemX - this.x, 2) + Math.pow(itemY - this.y, 2), .5) * game.gridSize;
						if (leastDistance > item.softCollisionRadius) {
							leastDistance -= item.softCollisionRadius
						}
						var damage = this.weapon.damage * warheads[this.warhead].damageVersusArmor[item.armor] / 100;
						var damageFactor = Math.pow(.5, Math.floor(leastDistance / warheads[this.warhead].spread));
						if (damageFactor > .125) {
							item.life -= item.prone ? damage * damageFactor / 2 : damage * damageFactor;
							item.attacked = true;
							game.attackedPlayers[item.player] = true;
							item.attackedBy = this.from;
							if (item.life < 0) {
								item.life = 0
							}
							if (item.type == "infantry") {
								item.infantryDeath = warheads[this.warhead].infantryDeath
							}
						}
					}
				}
				game.remove(this);
				game.add({
					type: "effects",
					name: "laser-fire",
					x: thisX + .4,
					y: thisY + .4,
					targetX: targetX,
					targetY: targetY
				})
			}
		},
		ioncannon: {
			name: "ioncannon",
			warhead: "ioncannon",
			animate: function() {
				if (this.delay) {
					this.delay--
				}
				for (var i = game.attackableItems.length - 1; i >= 0; i--) {
					var item = game.attackableItems[i];
					if (item.indestructible) {
						continue
					}
					var itemX = item.cgX;
					var itemY = item.cgY;
					if (Math.floor(itemX - this.x) < 3 && Math.floor(itemY - this.y) < 3) {
						var leastDistance = Math.pow(Math.pow(itemX - this.x, 2) + Math.pow(itemY - this.y, 2), .5) * game.gridSize;
						if (leastDistance > item.softCollisionRadius) {
							leastDistance -= item.softCollisionRadius
						}
						var damage = 750 * warheads[this.warhead].damageVersusArmor[item.armor] / 100;
						var damageFactor = Math.pow(.5, Math.floor(leastDistance / warheads[this.warhead].spread));
						if (damageFactor > .125) {
							item.life -= item.prone ? damage * damageFactor / 2 : damage * damageFactor;
							if (item.life < 0) {
								item.life = 0
							}
							item.attacked = true;
							game.attackedPlayers[item.player] = true;
							item.attackedBy = this.from;
							if (item.type == "infantry") {
								item.infantryDeath = warheads[this.warhead].infantryDeath
							}
						}
					}
				}
				game.remove(this)
			}
		}
	},
	defaults: {
		direction: 0,
		distanceTravelled: 0,
		z: 0,
		delay: 2,
		offsetIndex: 0,
		animate: function() {
			if (this.delay) {
				this.delay--
			}
			var x, y;
			x = this.target.cgX || this.target.x;
			y = this.target.cgY || this.target.y;
			this.lastMovementY = 0;
			this.lastMovementX = 0;
			if (this.rotationSpeed) {
				newDirection = findAngle({x: x, y: y}, this, this.directions);
				var turnDirection = angleDiff(this.direction, newDirection, this.directions);
				if (turnDirection) {
					var turnAmount = turnDirection / Math.abs(turnDirection) * this.rotationSpeed / 10;
					this.direction = wrapDirection(this.direction + turnAmount, this.directions)
				}
				this.offsetIndex = Math.floor(this.direction)
			} else {
				if (this.count) {
					this.offsetIndex++;
					if (this.offsetIndex >= this.count) {
						this.offsetIndex = 0
					}
				} else {
					this.offsetIndex = 0
				}
			}
			var bulletHasReached = false;
			if (!this.bulletSpeed) {
				bulletHasReached = true;
				this.x = x;
				this.y = y
			} else {
				if (Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) < .4 && this.z == this.target.z) {
					bulletHasReached = true
				}
			}
			if (this.bulletSpeed && !bulletHasReached) {
				var movement = this.bulletSpeed / game.gridSize / game.speedAdjustmentFactor;
				var angleRadians = this.direction / this.directions * 2 * Math.PI;
				var deltaZ = 0;
				if (this.ballisticCurve) {
					var time = this.distanceTravelled / movement;
					var g = movement * movement / this.peakDistance;
					var v = movement;
					deltaZ = v - g * time
				} else if (this.target.z > this.z) {
					deltaZ = 1 / 8
				} else if (this.target.z < this.z) {
					deltaZ = -1 / 8
				}
				this.z += deltaZ;
				this.lastMovementX = -movement * Math.sin(angleRadians);
				this.lastMovementY = -movement * Math.cos(angleRadians);
				var newX = this.x + this.lastMovementX;
				var newY = this.y + this.lastMovementY;
				this.lastMovementY -= deltaZ;
				this.distanceTravelled += movement;
				this.targetDistance -= movement;
				if (this.smokeTrail && !this.delay) {
					game.add({type: "effects", name: "smokey", x: this.x, y: this.y - this.z})
				}
				this.x = newX;
				this.y = newY
			}
			if (bulletHasReached || this.targetDistance < 0) {
				for (var i = game.attackableItems.length - 1; i >= 0; i--) {
					var item = game.attackableItems[i];
					if (item.indestructible) {
						continue
					}
					var itemX = item.cgX;
					var itemY = item.cgY;
					if (Math.floor(itemX - this.x) < 3 && Math.floor(itemY - this.y) < 3) {
						var leastDistance = Math.pow(Math.pow(itemX - this.x, 2) + Math.pow(itemY - this.y, 2), .5) * game.gridSize;
						if (leastDistance > item.softCollisionRadius) {
							leastDistance -= item.softCollisionRadius
						}
						var damage = this.weapon.damage * warheads[this.warhead].damageVersusArmor[item.armor] / 100;
						var damageFactor = Math.pow(.5, Math.floor(leastDistance / warheads[this.warhead].spread));
						if (damageFactor > .125) {
							item.life -= item.prone ? damage * damageFactor / 2 : damage * damageFactor;
							if (item.life <= 0) {
								item.life = 0;
								if (this.name == "invisiblesniper" && this.from == game.player && item.type == "infantry") {
									setTimeout(function() {
										sounds.play("commando_killed")
									}, 600)
								}
							}
							item.attacked = true;
							game.attackedPlayers[item.player] = true;
							item.attackedBy = this.from;
							if (item.type == "infantry") {
								item.infantryDeath = warheads[this.warhead].infantryDeath
							}
						}
					}
				}
				game.remove(this);
				if (this.explosion) {
					game.add({type: "effects", name: this.explosion, x: this.x, y: this.y - this.z})
				}
				if (explosionSound[this.explosion]) {
					sounds.play(explosionSound[this.explosion])
				}
			}
		},
		draw: function() {
			if (this.delay) {
				return
			}
			if (this.image) {
				this.interpolatedX = this.x + game.movementInterpolationFactor * this.lastMovementX;
				this.interpolatedY = this.y - this.z + game.movementInterpolationFactor * this.lastMovementY;
				var x = Math.round(this.interpolatedX * game.gridSize) - game.viewportX + game.viewportLeft - this.pixelWidth / 2;
				var y = Math.round(this.interpolatedY * game.gridSize) - game.viewportY + game.viewportTop - this.pixelHeight / 2;
				if (x < -this.pixelWidth || y < -this.pixelHeight || x > game.viewportWidth + this.pixelWidth || y > game.viewportHeight + this.pixelHeight) {
					return
				}
				game.foregroundContext.drawImage(this.spriteSheet, this.offsetIndex * this.pixelWidth, 0, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
			}
		}
	},
	add: function (details) {
		var item = {};
		var name = details.name;
		$.extend(item, this.defaults);
		$.extend(item, this.list[name]);
		$.extend(item, details);
		if (details.target) {
			var target = details.target;
			var targetEnemy = Math.pow(Math.pow(item.x - target.cgX, 2) + Math.pow(item.y - target.cgY, 2), .5) + 1;
			item.target = target;
			if (!item.targetDistance || targetEnemy < item.targetDistance) {
				item.targetDistance = targetEnemy
			}
		}
		return item
	},
	load: function (name) {
		var item = this.list[name];
		if (item.spriteSheet) {
			return
		}
		item.name = name;
		item.type = this.type;
		if (item.image) {
			item.spriteSheet = loader.loadImage("images/" + this.type + "/" + item.image + "-sprite-sheet.png")
		}
	},
	loadAll: function() {
		var names = Object.keys(this.list).sort();
		for (var i = names.length - 1; i >= 0; i--) {
			this.load(names[i])
		}
	}
};

var warheads = {
	smallarms: {
		name: "smallarms",
		spread: 2,
		wood: false,
		walls: false,
		infantryDeath: "die-normal",
		damageVersusArmor: [100, 50, 56.25, 25, 25, 0]
	},
	highexplosive: {
		name: "highexplosive",
		spread: 6,
		wood: true,
		walls: true,
		infantryDeath: "die-frag",
		damageVersusArmor: [87.5, 75, 56.25, 25, 100, 0]
	},
	armorpiercing: {
		name: "armorpiercing",
		spread: 6,
		wood: true,
		walls: true,
		infantryDeath: "die-explode-far",
		damageVersusArmor: [25, 75, 75, 100, 50, 0]
	},
	fire: {
		name: "fire",
		spread: 8,
		wood: true,
		walls: false,
		infantryDeath: "die-fire",
		damageVersusArmor: [87.5, 100, 68.75, 25, 50, 0]
	},
	"super": {
		name: "super",
		spread: 4,
		wood: false,
		walls: false,
		infantryDeath: "die-fire",
		damageVersusArmor: [100, 100, 100, 100, 100, 0]
	},
	ioncannon: {
		spread: 7,
		wood: true,
		walls: true,
		infantryDeath: "die-fire",
		damageVersusArmor: [100, 100, 75, 75, 75, 0]
	},
	hollowpoint: {
		name: "hollowpoint",
		spread: 4,
		wood: false,
		walls: false,
		infantryDeath: "die-normal",
		damageVersusArmor: [100, 3.125, 3.125, 3.125, 3.125, 0]
	},
	nuke: {
		name: "nuke",
		spread: 8,
		wood: true,
		walls: false,
		infantryDeath: "die-fire",
		damageVersusArmor: [87.5, 100, 68.75, 25, 50, 0]
	}
};