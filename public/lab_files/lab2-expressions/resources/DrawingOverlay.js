// Constructs a new drawing overlay.
function DrawingOverlay(element, height, visible) {
    this.element = element;
    this.prevX = null;
    this.prevY = null;

    this.canvas = document.createElement("canvas");
    if (!this.canvas) return;
    
    // <canvas id="drawingoverlay_slide4" width="1600" height="1200"></canvas>
    this.canvas.className = "drawingoverlay";
    this.canvas.id = "drawingoverlay_" + (element.id ? element.id : (int) (Math.random() * 1000000));
    if (element.scrollWidth) {
        this.canvas.width = element.scrollWidth;
    } else {
        this.canvas.width = screen.width;
    }
    
    if (height) {
        this.canvas.height = height;
    } else if (element.scrollHeight) {
        this.canvas.height = element.scrollHeight;
    } else {
        this.canvas.height = screen.height;
    }
    
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";
    this.canvas.style.zIndex = "99999";
    if (!visible) {
        // this.canvas.style.display = "none";   // initially hidden
    }
    
    this.canvas.overlay     = this;
    this.canvas.onmousedown = this.drawMouseDown;
    this.canvas.onmouseup   = this.drawMouseUp;
    this.canvas.onmousemove = this.drawMouseMove;
    
    element.appendChild(this.canvas);
}

DrawingOverlay.prototype.clear = function() {
    if (this.canvas) {
        var g = this.canvas.getContext("2d");
        g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

DrawingOverlay.prototype.setVisible = function(visible) {
    if (visible) {
        this.canvas.style.display = "block";
    } else {
        this.canvas.style.display = "none";
    }
};

DrawingOverlay.prototype.drawMouseDown = function(event) {
    if (!event) event = window.event;
    if (event.button && event.button > 0) {
        this.overlay.clear();
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        return false;
    }

    this.overlay.prevX = event.pageX;
    this.overlay.prevY = event.pageY;
}

DrawingOverlay.prototype.drawMouseUp = function(event) {
    if (!event) event = window.event;
    this.overlay.prevX = null;
    this.overlay.prevY = null;
};

DrawingOverlay.prototype.drawMouseMove = function(event) {
    if (!event) event = window.event;
    if (this.overlay.prevX === null || this.overlay.prevY === null) return;

    if (!this.getContext) return;
    var x = event.pageX;
    var y = event.pageY;

    // red line 5px thick
    var g = this.getContext("2d");
    g.lineWidth = 5;
    g.fillStyle =   "#FF0000";
    g.strokeStyle = "#FF0000";
    
    g.beginPath();
    g.moveTo(this.overlay.prevX, this.overlay.prevY);
    g.lineTo(x, y);
    g.stroke();
    
    // $("dumptarget").innerHTML = prevX + "," + prevY + " -> " + x + "," + y;
    this.overlay.prevX = x;
    this.overlay.prevY = y;
};
