
var Engine = function(el, Experiment) {
  // container infos
  this.el = el[0];

  this.width = this.el.offsetWidth;
  this.height = this.el.offsetHeight;

  var deltaTop = this.el.offsetTop;
  var deltaLeft = this.el.offsetLeft;

  // an Array of inputs
  this.inputs = [];

  // WHY SHOULD NAME BE A FUNCTION???

  // CanvasInfos
  this.canvas =  null;
  this.ctx =  null;

  this.start = function() {
    // We call the run function
    run.bind(this)();
  };

  this.destroy = function() {
    // Notify gameObject
    this.gameObject.destroy();
    // kill it!
    this.gameObject = null;
  };

  this.reset = function() {
    // we call game object reseter
    this.gameObject.reset();
  };

  this.getImage = function() {
    return this.canvas.toDataURL();
  };

  // The current Date
  this.now = 0;

  // Device capture Time
  this.captureTime = 0;


  /**
   * Private Methods
   */
  
  function initCanvas() {
    // create The Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width =  this.width;
    this.canvas.height =  this.height;

    // we clean the DOM
    this.el.innerHTML = '';
    // append canvas to DOM
    this.el.appendChild(this.canvas);

    // get 2d Context
    this.ctx = this.canvas.getContext('2d');
  }

  function initGameObject() {
    this.gameObject = new Experiment(this);
    this.gameObject.init();
  }

  function initInputListener() {
    
    // Multitouch Events!
    this.canvas.addEventListener('touchstart', manageTouch.bind(this));
    this.canvas.addEventListener('touchmove', manageTouch.bind(this));
    this.canvas.addEventListener('touchend', manageTouch.bind(this));
    this.canvas.addEventListener('touchleave', manageTouch.bind(this));
    this.canvas.addEventListener('touchcancel', manageTouch.bind(this));
    this.canvas.addEventListener('touchenter', manageTouch.bind(this));

    this.canvas.addEventListener('mousedown', mouseDown.bind(this));
    this.canvas.addEventListener('mousemove', mouseMove.bind(this));
    this.canvas.addEventListener('mouseup', mouseUp.bind(this));
    this.canvas.addEventListener('mouseout', mouseUp.bind(this));
  }

  /**
   * Inputs methods
   */
  var lastCapture = 0;
  function manageTouch(event) {
    var inputs = [];
    for (var i = 0; i < event.targetTouches.length; ++i) {
      var type = event.type;

      if (type === 'touchstart') {
        type = 'start';
        lastCapture = 0;
      } else if (type === 'touchmove') {
        type = 'move';

        var now = new Date().getTime();

        if (lastCapture) {
          this.captureTime = lastCapture - now;
        }

        lastCapture = now;
      } else  {
        type = 'up';
        lastCapture = 0;
      }


      targetTouche = event.targetTouches[i];
      inputs.push({
        x : targetTouche.clientX - deltaLeft - window.scrollX,
        y : targetTouche.clientY - deltaTop + window.scrollY,
        id : targetTouche.identifier,
        type : type
      });
    }
    event.preventDefault();
    event.stopPropagation();
    this.inputs = inputs;
  }

  var mouseIsDown = 0;
  var mouseId = 0;


  function mouseDown(event) {
    mouseIsDown = 1;
    lastCapture = 0;
    this.inputs = [{
      x : event.clientX - deltaLeft - window.scrollX,
      y : event.clientY - deltaTop + window.scrollY,
      id : ++mouseId,
      type : 'down'
    }];
  }


  function mouseMove(event) {
    if (mouseIsDown) {
      this.inputs = [{
        x : event.clientX - deltaLeft - window.scrollX,
        y : event.clientY - deltaTop + window.scrollY,
        id : mouseId,
        type : 'move'
      }];
    }

    var now = new Date().getTime();

    if (lastCapture) {
      this.captureTime = lastCapture - now;
    }

    lastCapture = now;

  }

  function mouseUp(event) {
    mouseIsDown = 0;
    lastCapture = 0;
    this.inputs = [{
      x : event.clientX - deltaLeft - window.scrollX,
      y : event.clientY - deltaTop + window.scrollY,
      id : mouseId,
      type : 'up'
    }];
  }


  function run() {
    requestAnimFrame(run.bind(this));
    // update inputs!
    this.now = new Date().getTime();

    // run game
    this.gameObject.run();
  }

  // Paul irish requestAnimFramePolyfill
  var requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
       window.webkitRequestAnimationFrame ||
       window.mozRequestAnimationFrame ||
       window.oRequestAnimationFrame ||
       window.msRequestAnimationFrame ||
       function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
         window.setTimeout(callback, 1000/60);
       };
  })();

  // Call the initers
  initCanvas.bind(this)();
  initInputListener.bind(this)();
  initGameObject.bind(this)();

};


var RandomPoints = function(engine) {
  /**
   * engine has the following proprieties
   * engine.width : the width of the experience
   * engine.height : the height of the experience
   * engine.ctx : the 2d context of main canvas
   * engine.canvas : the main canvas (used image saved to server!)
   * engine.inputs : an array of current input
   *                 An input is an object containing :
   *                 {x,y} : the coordinate of input
   *                 id : a unique id relative with this input (unique per 'touch')
   */
  
  this.engine = engine;


  var WIDTH = this.engine.width / 40 | 0;
  var LEFT_MARGIN = (this.engine.width - WIDTH * 40) / 2 + 20;
  var HEIGHT = this.engine.height / 40 | 0;
  var TOP_MARGIN = (this.engine.height - HEIGHT * 40) / 2 + 20;

  var TOP = 0;
  var BOTTOM = 1;
  var LEFT = 2;
  var RIGHT = 3;

  var POINTS_ARRAY = [];

  var PARTICLES = [];

  var COLORS = ['#ADDED0', '#FF9955', '#FED291', '#CBCBCB'];
  var SOURCE_ID = 0;

  for (var x = 0; x < WIDTH; ++x) {
    POINTS_ARRAY[x] = [];
    for (var y = 0; y < HEIGHT; ++y) {
      POINTS_ARRAY[x][y] = Math.random() * 4 | 0;
    }
  }


  /**
   * This function is called after we created your pobject
   */
  this.init = function() {
    // Init your experience here
    
    // example : we paint canvas with blue color
    this.engine.ctx.fillStyle = '#fff';
    this.engine.ctx.fillRect(0,0, this.engine.width, this.engine.height);
    

  };

  var ctx = engine.ctx;


  /**
   * This function is called every frames
   */
  this.run = function () {
    // you should manage input, render and animation here
    // TIPS : Just create functions, avoid code wall!
    
    // example : we run throught input and draw red squares
   
    this.input();
    this.animate();
    this.render();


  };

  var SOURCE = null;
  var knowID = [];
  this.input = function() {
    for (var i = 0; i < engine.inputs.length; ++i) {
      var input = engine.inputs[i];
      if ( knowID.indexOf(input.id) === -1) {
        knowID.push(input.id);
        var x = (input.x - LEFT_MARGIN + 20) / 40 | 0;
        var y = (input.y - TOP_MARGIN + 20) / 40  | 0;
        if (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT) {
          SOURCE_ID++;
          SOURCE = {
            x : x * 40,
            y : y * 40,
            color: COLORS[SOURCE_ID % COLORS.length],
            life : 200
          };

          $('#tutorial').css({display : 'none'});
        }
      }
    } 
  };
  var MAXP = 1000;
  this.animate = function() {
    console.log(SOURCE);
    if (SOURCE && SOURCE.life) {
      SOURCE.life--;
      PARTICLES.push({
        x : SOURCE.x,
        y : SOURCE.y,
        xs : 0,
        ys : 0,
        color : SOURCE.color,
      });
    }

    if (PARTICLES.length > MAXP) {
      PARTICLES.splice(0, 1);
    }
    POINTS_ARRAY[Math.random() * WIDTH | 0][Math.random() * HEIGHT | 0] = Math.random() * 4 | 0;
    POINTS_ARRAY[Math.random() * WIDTH | 0][Math.random() * HEIGHT | 0] = Math.random() * 4 | 0;
    POINTS_ARRAY[Math.random() * WIDTH | 0][Math.random() * HEIGHT | 0] = Math.random() * 4 | 0;
    POINTS_ARRAY[Math.random() * WIDTH | 0][Math.random() * HEIGHT | 0] = Math.random() * 4 | 0;
    POINTS_ARRAY[Math.random() * WIDTH | 0][Math.random() * HEIGHT | 0] = Math.random() * 4 | 0;
    for (var i = 0; i < PARTICLES.length; ++i) {
      var p = PARTICLES[i];

      if (p.x % 40 == 0 && p.y % 40 == 0) {
        var x = p.x / 40;
        var y = p.y / 40;
  
        if (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT) {
          var d = POINTS_ARRAY[x][y];
          if (d === TOP) {
            p.xs = 0;
            p.ys = -1;
          }
          if (d === BOTTOM) {
            p.xs = 0;
            p.ys = 1;
          }
          if (d === LEFT) {
            p.xs = -1;
            p.ys = 0;
          }
          if (d === RIGHT) {
            p.xs = 1;
            p.ys = 0;
          }
        }
      }

      p.x += p.xs;
      p.y += p.ys;
    }
  };

  this.render = function() {
    var ctx = this.engine.ctx;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,this.engine.width, this.engine.height);
    ctx.strokeStyle = '#888';

    for (var x = 0; x < WIDTH; ++x) {
      for (var y = 0; y < HEIGHT; ++y) {
        var p = POINTS_ARRAY[x][y];
        var ox = x * 40 + LEFT_MARGIN;
        var oy = y * 40 + TOP_MARGIN;

        ctx.beginPath();
        ctx.arc(ox, oy, 3, 0, Math.PI * 2, false);


        if (p == TOP) {
          ctx.moveTo(ox, oy-3);
          ctx.lineTo(ox, oy-15);
          ctx.lineTo(ox - 2, oy - 12);
          ctx.moveTo(ox, oy - 15);
          ctx.lineTo(ox + 2, oy - 12);
        }

        if (p == BOTTOM) {
          ctx.moveTo(ox, oy+3);
          ctx.lineTo(ox, oy+15);
          ctx.lineTo(ox - 2, oy+12);
          ctx.moveTo(ox, oy+15);
          ctx.lineTo(ox + 2, oy+12);
        }

        if (p == LEFT) {
          ctx.moveTo(ox - 3, oy);
          ctx.lineTo(ox -15, oy);
          ctx.lineTo(ox -12, oy - 3);
          ctx.moveTo(ox -15, oy);
          ctx.lineTo(ox -12, oy + 3);
        }

        if (p == RIGHT) {
          ctx.moveTo(ox + 3, oy);
          ctx.lineTo(ox + 15, oy);
          ctx.lineTo(ox + 12, oy - 3);
          ctx.moveTo(ox + 15, oy);
          ctx.lineTo(ox + 12, oy + 3);
        }

        ctx.stroke();
      }
    }

    ctx.fillStyle = '#eee';
    for (var i = 0; i < PARTICLES.length; ++i) {
      var p = PARTICLES[i];
      var ox = p.x + LEFT_MARGIN;
      var oy = p.y + TOP_MARGIN;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(ox, oy, 10, 0, Math.PI * 2, false);
      ctx.fill();
    }

 
  };
};


var engine = new Engine($('#container'), RandomPoints);
engine.start();
