var brushSize = 5;
var brushSizeSlider = document.getElementById("brushSize");

brushSizeSlider.oninput = function () {
    brushSize = parseInt(this.value);
    this.nextElementSibling.value = this.value;
    localStorage.setItem("brushSize", "" + this.value);
}

var brushDensity = 1;
var brushDensitySlider = document.getElementById("brushDensity");

brushDensitySlider.oninput = function () {
    brushDensity = parseFloat(this.value) / 10 * parseFloat(this.value) / 10 * parseFloat(this.value) / 10;
    this.nextElementSibling.value = parseFloat(this.value / 10);
    localStorage.setItem("brushDensity", "" + this.value);
}

class Tools {
    constructor() {
        this.selectedAnt = null;
        this.position = new Vec2(0.0, 0.0);
        this.lastPosition = new Vec2(0.0, 0.0);

    }
    selectedAnt;
    lastPosition; position;


    mouseUp(mouseX, mouseY) {

        HOME.selected = false;
        if (this.selectedAnt != null) {
            this.selectedAnt.selected = false;

            var flingVelocity = this.position.add(this.lastPosition.mul(-1));
            console.log("fling " + flingVelocity + " " + flingVelocity.sqMagnitude());
            if (flingVelocity.sqMagnitude() > 0.0001) {
                console.log("FLING");
                this.selectedAnt.vx = flingVelocity.normal().x;
                this.selectedAnt.vy = flingVelocity.normal().y;
                this.selectedAnt.vz = flingVelocity.magnitude() / 4;
            }
            this.position = new Vec2(0.0, 0.0);
            this.lastPosition = new Vec2(0.0, 0.0);


        }
        this.selectedAnt = null;

    }
    mouseDown(mouseX, mouseY) {
        if (ANT_LAB.selectedTool == PICKUP_TOOL) {
            if (HOME.collide(mouseX, mouseY) && !ANT_LAB.started) {
                HOME.selected = true;
                this.moveHome(mouseX, mouseY);
            }
            else if (this.selectedAnt == null) {
                for (let i = 0; i < ants.length; i++) {
                    if (ants[i].collide(mouseX, mouseY)) {
                        this.selectedAnt = ants[i];
                        this.selectedAnt.selected = true;
                        this.moveAnt(mouseX, mouseY);
                        break;
                    }
                }
            }
        }

        this.position = new Vec2(mouseX, mouseY);
        this.lastPosition = new Vec2(mouseX, mouseY);


    }

    pickupTool(mouseX, mouseY) {
        //console.log(this.selectedAnt);
        if (this.selectedAnt == null) {
            if (HOME.selected) {
                this.moveHome(mouseX, mouseY);
            }
        }
        else {
            this.moveAnt(mouseX, mouseY);
        }
        this.lastPosition = this.position;
        this.position = new Vec2(mouseX, mouseY)
    }

    squishTool(mouseX, mouseY) {
        for (let i = 0; i < ants.length; i++) {
            var squishRadius = brushSize / width * 2;
            if (squishRadius * squishRadius > ants[i].sqDistance(mouseX, mouseY)) {
                ants[i].squish();
            }
        }
    }


    moveHome(mouseX, mouseY) {
        HOME.x = mouseX;
        HOME.y = mouseY;
    }

    moveAnt(mouseX, mouseY) {
        this.selectedAnt.x = mouseX;
        this.selectedAnt.y = mouseY;
        this.selectedAnt.vz = 0;
        this.selectedAnt.vy = 0;
        this.selectedAnt.vx = 0;
        this.selectedAnt.z = 5 / height;
    }


    drawFood(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].food = 1;
            }
        }
    }

    drawObstacle(mouseX, mouseY) {

        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].obstacle = 1;
                selectedCells[i].homingPh = 0;
                selectedCells[i].foodPh = 0;
                selectedCells[i].food = 0;
            }
        }
    }

    erase(mouseX, mouseY) {
        var x = Math.min(Math.round((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(Math.round((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].food = 0;
                selectedCells[i].obstacle = 0;
                selectedCells[i].foodPh = 0;
                selectedCells[i].homingPh = 0;
            }
        }
    }

    drawHomingPh(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity) {
                selectedCells[i].homingPh = 1;
            }
        }
    }

    drawFoodPh(mouseX, mouseY) {
        var x = Math.min(parseInt((mouseX + 1.0) * width / 2), width - 1);
        var y = Math.min(parseInt((mouseY + 1.0) * height / 2), height - 1);
        var selectedCells = this.getCells(x, y);
        for (let i = 0; i < selectedCells.length; i++) {
            if (Math.random() < brushDensity && selectedCells[i].obstacle == 0) {
                selectedCells[i].foodPh = 1;
            }
        }
    }


    getCells(x, y) {
        var selectedCells = [];
        for (let i = -brushSize; i <= brushSize; i++) {
            for (let j = -brushSize; j < brushSize; j++) {
                if (i * i + j * j < brushSize * brushSize) {
                    selectedCells.push(this.getCell(x, y, i, j));
                }
            }
        }
        return selectedCells;
    }

    getCell(x, y, a, b) {
        var i = y + b + (x + a) * height;
        if (i < cells.length && i > 0) {
            return cells[i];
        }
        return new Cell();
    }


}