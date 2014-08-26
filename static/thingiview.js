Thingiview = function(containerId) {
  scope = this;
  
  this.containerId  = containerId;
  var container     = document.getElementById(containerId);
  
  // var stats    = null;
  var camera   = null;
  var scene    = null;
  var renderer = null;
  var object   = null;
  var plane    = null;
  
  var ambientLight     = null;
  var directionalLight = null;
  var pointLight       = null;
  
  var targetXRotation             = 0;
  var targetXRotationOnMouseDown  = 0;
  var mouseX                      = 0;
  var mouseXOnMouseDown           = 0;

  var targetYRotation             = 0;
  var targetYRotationOnMouseDown  = 0;
  var mouseY                      = 0;
  var mouseYOnMouseDown           = 0;

  var mouseDown                  = false;
  var mouseOver                  = false;
  
  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2

  var view         = null;
  var infoMessage  = null;
  var progressBar  = null;
  var alertBox     = null;
  
  var timer        = null;

  var rotateTimer    = null;
  var rotateListener = null;
  var wasRotating    = null;

  var cameraView = 'diagonal';
  var cameraZoom = 0;
  var rotate = false;
  var backgroundColor = '#606060';
  var objectMaterial = 'solid';
  var objectColor = 0xffffff;
  var showPlane = true;
  var isWebGl = false;

  if (document.defaultView && document.defaultView.getComputedStyle) {
    var width  = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('width'));
    var height = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('height'));  
  } else {
    var width  = parseFloat(container.currentStyle.width);
    var height = parseFloat(container.currentStyle.height);
  }

  var geometry;

  this.initScene = function() {
    container.style.position = 'relative';
    container.innerHTML      = '';

  	camera = new THREE.Camera(45, width/ height, 1, 100000);
  	camera.updateMatrix();

  	scene  = new THREE.Scene();

    ambientLight = new THREE.AmbientLight(0x202020);
    scene.addLight(ambientLight);
    
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
    directionalLight.position.x = 1;
    directionalLight.position.y = 1;
    directionalLight.position.z = 2;
    directionalLight.position.normalize();
    scene.addLight(directionalLight);
    
    pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.x = 0;
    pointLight.position.y = -25;
    pointLight.position.z = 10;
    scene.addLight(pointLight);

    progressBar = document.createElement('div');
    progressBar.style.position = 'absolute';
    progressBar.style.top = '0px';
    progressBar.style.left = '0px';
    progressBar.style.backgroundColor = 'red';
    progressBar.style.padding = '5px';
    progressBar.style.display = 'none';
    progressBar.style.overflow = 'visible';
    progressBar.style.whiteSpace = 'nowrap';
    progressBar.style.zIndex = 100;
    container.appendChild(progressBar);
    
    alertBox = document.createElement('div');
    alertBox.id = 'alertBox';
    alertBox.style.position = 'absolute';
    alertBox.style.top = '25%';
    alertBox.style.left = '25%';
    alertBox.style.width = '50%';
    alertBox.style.height = '50%';
    alertBox.style.backgroundColor = '#dddddd';
    alertBox.style.padding = '10px';
    // alertBox.style.overflowY = 'scroll';
    alertBox.style.display = 'none';
    alertBox.style.zIndex = 100;
    container.appendChild(alertBox);
    
    // load a blank object
    // this.loadSTLString('');

    if (showPlane) {
      loadPlaneGeometry();
    }
    
    this.setCameraView(cameraView);
    this.setObjectMaterial(objectMaterial);

    testCanvas = document.createElement('canvas');
    try {
      if (testCanvas.getContext('experimental-webgl')) {
        // showPlane = false;
        isWebGl = true;
        renderer = new THREE.WebGLRenderer();
        // renderer = new THREE.CanvasRenderer();
      } else {
        renderer = new THREE.CanvasRenderer();
      }
    } catch(e) {
      renderer = new THREE.CanvasRenderer();
      // log("failed webgl detection");
    }

    // renderer.setSize(container.innerWidth, container.innerHeight);

  	renderer.setSize(width, height);
    renderer.domElement.style.backgroundColor = backgroundColor;
  	container.appendChild(renderer.domElement);

    // stats = new Stats();
    // stats.domElement.style.position  = 'absolute';
    // stats.domElement.style.top       = '0px';
    // container.appendChild(stats.domElement);

    // TODO: figure out how to get the render window to resize when window resizes
    // window.addEventListener('resize', onContainerResize(), false);
    // container.addEventListener('resize', onContainerResize(), false);

    // renderer.domElement.addEventListener('mousemove',      onRendererMouseMove,     false);    
  	window.addEventListener('mousemove',      onRendererMouseMove,     false);    
    renderer.domElement.addEventListener('mouseover',      onRendererMouseOver,     false);
    renderer.domElement.addEventListener('mouseout',       onRendererMouseOut,      false);
  	renderer.domElement.addEventListener('mousedown',      onRendererMouseDown,     false);
    // renderer.domElement.addEventListener('mouseup',        onRendererMouseUp,       false);
    window.addEventListener('mouseup',        onRendererMouseUp,       false);

  	renderer.domElement.addEventListener('touchstart',     onRendererTouchStart,    false);
  	renderer.domElement.addEventListener('touchend',       onRendererTouchEnd,      false);
  	renderer.domElement.addEventListener('touchmove',      onRendererTouchMove,     false);

    renderer.domElement.addEventListener('DOMMouseScroll', onRendererScroll,        false);
  	renderer.domElement.addEventListener('mousewheel',     onRendererScroll,        false);
  	renderer.domElement.addEventListener('gesturechange',  onRendererGestureChange, false);
  }

  // FIXME
  // onContainerResize = function(event) {
  //   width  = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('width'));
  //   height = parseFloat(document.defaultView.getComputedStyle(container,null).getPropertyValue('height'));
  // 
  //   // log("resized width: " + width + ", height: " + height);
  // 
  //   if (renderer) {
  //     renderer.setSize(width, height);
  //     camera.projectionMatrix = THREE.Matrix4.makePerspective(70, width / height, 1, 10000);
  //     sceneLoop();
  //   }    
  // };
  
  onRendererScroll = function(event) {
    event.preventDefault();

    var rolled = 0;

    if (event.wheelDelta === undefined) {
      // Firefox
      // The measurement units of the detail and wheelDelta properties are different.
      rolled = -40 * event.detail;
    } else {
      rolled = event.wheelDelta;
    }

    if (rolled > 0) {
      // up
      scope.setCameraZoom(+10);
    } else {
      // down
      scope.setCameraZoom(-10);
    }
  }

  onRendererGestureChange = function(event) {
    event.preventDefault();

    if (event.scale > 1) {
      scope.setCameraZoom(+5);
    } else {
      scope.setCameraZoom(-5);
    }
  }

  onRendererMouseOver = function(event) {
    mouseOver = true;
    // targetRotation = object.rotation.z;
    if (timer == null) {
      // log('starting loop');
      timer = setInterval(sceneLoop, 1000/60);
    }
  }

  onRendererMouseDown = function(event) {
    // log("down");

    event.preventDefault();
  	mouseDown = true;
    
    if(scope.getRotation()){
      wasRotating = true;
      scope.setRotation(false);
    } else {
      wasRotating = false;
    }
    
  	mouseXOnMouseDown = event.clientX - windowHalfX;
  	mouseYOnMouseDown = event.clientY - windowHalfY;

  	targetXRotationOnMouseDown = targetXRotation;
  	targetYRotationOnMouseDown = targetYRotation;
  }

  onRendererMouseMove = function(event) {
    // log("move");

    if (mouseDown) {
  	  mouseX = event.clientX - windowHalfX;
      // targetXRotation = targetXRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;
  	  xrot = targetXRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

  	  mouseY = event.clientY - windowHalfY;
      // targetYRotation = targetYRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;
  	  yrot = targetYRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.02;
  	  
  	  targetXRotation = xrot;
  	  targetYRotation = yrot;
	  }
  }

  onRendererMouseUp = function(event) {
    // log("up");
    if (mouseDown) {
      mouseDown = false;
      if (!mouseOver) {
        clearInterval(timer);
        timer = null;
      }
      if (wasRotating) {
        scope.setRotation(true);
      }
    }
  }

  onRendererMouseOut = function(event) {
    if (!mouseDown) {
      clearInterval(timer);
      timer = null;
    }
    mouseOver = false;
  }

  onRendererTouchStart = function(event) {
    targetXRotation = object.rotation.z;
    targetYRotation = object.rotation.x;

    timer = setInterval(sceneLoop, 1000/60);

  	if (event.touches.length == 1) {
  		event.preventDefault();

  		mouseXOnMouseDown = event.touches[0].pageX - windowHalfX;
  		targetXRotationOnMouseDown = targetXRotation;

  		mouseYOnMouseDown = event.touches[0].pageY - windowHalfY;
  		targetYRotationOnMouseDown = targetYRotation;
  	}
  }

  onRendererTouchEnd = function(event) {
    clearInterval(timer);
    timer = null;
    // targetXRotation = object.rotation.z;
    // targetYRotation = object.rotation.x;
  }

  onRendererTouchMove = function(event) {
  	if (event.touches.length == 1) {
  		event.preventDefault();

  		mouseX = event.touches[0].pageX - windowHalfX;
  		targetXRotation = targetXRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;

  		mouseY = event.touches[0].pageY - windowHalfY;
  		targetYRotation = targetYRotationOnMouseDown + (mouseY - mouseYOnMouseDown) * 0.05;
  	}
  }

  sceneLoop = function() {
    if (object) {
      // if (view == 'bottom') {
      //   if (showPlane) {
      //     plane.rotation.z = object.rotation.z -= (targetRotation + object.rotation.z) * 0.05;
      //   } else {
      //     object.rotation.z -= (targetRotation + object.rotation.z) * 0.05;
      //   }
      // } else {
      //   if (showPlane) {
      //     plane.rotation.z = object.rotation.z += (targetRotation - object.rotation.z) * 0.05;
      //   } else {
      //     object.rotation.z += (targetRotation - object.rotation.z) * 0.05;
      //   }
      // }

      if (showPlane) {
        plane.rotation.z = object.rotation.z = (targetXRotation - object.rotation.z) * 0.2;
        plane.rotation.x = object.rotation.x = (targetYRotation - object.rotation.x) * 0.2;
      } else {
        object.rotation.z = (targetXRotation - object.rotation.z) * 0.2;
        object.rotation.x = (targetYRotation - object.rotation.x) * 0.2;
      }

      // log(object.rotation.x);

      camera.updateMatrix();
      object.updateMatrix();
      
      if (showPlane) {
        plane.updateMatrix();
      }

    	renderer.render(scene, camera);
      // stats.update();
    }
  }

  rotateLoop = function() {
    // targetRotation += 0.01;
    targetXRotation += 0.05;
    sceneLoop();
  }

  this.getShowPlane = function(){
    return showPlane;
  }

  this.setShowPlane = function(show) {
    showPlane = show;
    
    if (show) {
      if (scene && !plane) {
        loadPlaneGeometry();
      }
      plane.material[0].opacity = 1;
      // plane.updateMatrix();
    } else {
      if (scene && plane) {
        // alert(plane.material[0].opacity);
        plane.material[0].opacity = 0;
        // plane.updateMatrix();
      }
    }
    
    sceneLoop();
  }

  this.getRotation = function() {
    return rotateTimer !== null;
  }

  this.setRotation = function(rotate) {
    rotation = rotate;
    
    if (rotate) {
      rotateTimer = setInterval(rotateLoop, 1000/60);
    } else {
      clearInterval(rotateTimer);
      rotateTimer = null;
    }

    scope.onSetRotation();
  }

  this.onSetRotation = function(callback) {
    if(callback === undefined){
      if(rotateListener !== null){
        try{
          rotateListener(scope.getRotation());
        } catch(ignored) {}
      }
    } else {
      rotateListener = callback;
    }
  }

  this.setCameraView = function(dir) {
    cameraView = dir;

    targetXRotation       = 0;
    targetYRotation       = 0;

    if (object) {
      object.rotation.x = 0;
      object.rotation.y = 0;
      object.rotation.z = 0;
    }

    if (showPlane && object) {
      plane.rotation.x = object.rotation.x;
      plane.rotation.y = object.rotation.y;
      plane.rotation.z = object.rotation.z;
    }
    
    if (dir == 'top') {
      // camera.position.y = 0;
      // camera.position.z = 100;
      // camera.target.position.z = 0;
      if (showPlane) {
        plane.flipSided = false;
      }
    } else if (dir == 'side') {
      // camera.position.y = -70;
      // camera.position.z = 70;
      // camera.target.position.z = 0;
      targetYRotation = -4.5;
      if (showPlane) {
        plane.flipSided = false;
      }
    } else if (dir == 'bottom') {
      // camera.position.y = 0;
      // camera.position.z = -100;
      // camera.target.position.z = 0;
      if (showPlane) {
        plane.flipSided = true;
      }
    } else {
      // camera.position.y = -70;
      // camera.position.z = 70;
      // camera.target.position.z = 0;
      if (showPlane) {
        plane.flipSided = false;
      }
    }

    mouseX            = targetXRotation;
    mouseXOnMouseDown = targetXRotation;
    
    mouseY            = targetYRotation;
    mouseYOnMouseDown = targetYRotation;
    
    scope.centerCamera();
    
    sceneLoop();
  }

  this.setCameraZoom = function(factor) {
    cameraZoom = factor;
    
    if (cameraView == 'bottom') {
      if (camera.position.z + factor > 0) {
        factor = 0;
      }
    } else {
      if (camera.position.z - factor < 0) {
        factor = 0;
      }
    }
    
    if (cameraView == 'top') {
      camera.position.z -= factor;
    } else if (cameraView == 'bottom') {
      camera.position.z += factor;
    } else if (cameraView == 'side') {
      camera.position.y += factor;
      camera.position.z -= factor;
    } else {
      camera.position.y += factor;
      camera.position.z -= factor;
    }

    sceneLoop();
  }

  this.getObjectMaterial = function() {
    return objectMaterial;
  }

  this.setObjectMaterial = function(type) {
    objectMaterial = type;

    loadObjectGeometry();
  }

  this.setBackgroundColor = function(color) {
    backgroundColor = color
    
    if (renderer) {
      renderer.domElement.style.backgroundColor = color;
    }
  }

  this.setObjectColor = function(color) {
    objectColor = parseInt(color.replace(/\#/g, ''), 16);
    
    loadObjectGeometry();
  }

  this.loadSTL = function(url) {
    scope.newWorker('loadSTL', url);
  }

  this.loadOBJ = function(url) {
    scope.newWorker('loadOBJ', url);
  }
  
  this.loadSTLString = function(STLString) {
    scope.newWorker('loadSTLString', STLString);
  }
  
  this.loadSTLBinary = function(STLBinary) {
    scope.newWorker('loadSTLBinary', STLBinary);
  }
  
  this.loadOBJString = function(OBJString) {
    scope.newWorker('loadOBJString', OBJString);
  }

  this.loadJSON = function(url) {
    scope.newWorker('loadJSON', url);
  }

  this.loadPLY = function(url) {
    scope.newWorker('loadPLY', url);
  }
  
  this.loadPLYString = function(PLYString) {
    scope.newWorker('loadPLYString', PLYString);
  }

  this.loadPLYBinary = function(PLYBinary) {
    scope.newWorker('loadPLYBinary', PLYBinary);
  }

  this.centerCamera = function() {
    if (geometry) {
      // Using method from http://msdn.microsoft.com/en-us/library/bb197900(v=xnagamestudio.10).aspx
      // log("bounding sphere radius = " + geometry.boundingSphere.radius);

      // look at the center of the object
      camera.target.position.x = geometry.center_x;
      camera.target.position.y = geometry.center_y;
      camera.target.position.z = geometry.center_z;

      // set camera position to center of sphere
      camera.position.x = geometry.center_x;
      camera.position.y = geometry.center_y;
      camera.position.z = geometry.center_z;

      // find distance to center
      distance = geometry.boundingSphere.radius / Math.sin((camera.fov/2) * (Math.PI / 180));

      // zoom backwards about half that distance, I don't think I'm doing the math or backwards vector calculation correctly?
      // scope.setCameraZoom(-distance/1.8);
      // scope.setCameraZoom(-distance/1.5);
      scope.setCameraZoom(-distance/1.9);

      directionalLight.position.x = geometry.min_y * 2;
      directionalLight.position.y = geometry.min_y * 2;
      directionalLight.position.z = geometry.max_z * 2;

      pointLight.position.x = geometry.center_y;
      pointLight.position.y = geometry.center_y;
      pointLight.position.z = geometry.max_z * 2;
    } else {
      // set to any valid position so it doesn't fail before geometry is available
      camera.position.y = -70;
      camera.position.z = 70;
      camera.target.position.z = 0;
    }
  }

  this.loadArray = function(array) {
    log("loading array...");
    geometry = new STLGeometry(array);
    loadObjectGeometry();
    scope.setRotation(false);
    scope.setRotation(true);
    scope.centerCamera();
    log("finished loading " + geometry.faces.length + " faces.");
  }

  this.newWorker = function(cmd, param) {
    scope.setRotation(false);
  	
    var worker = new WorkerFacade(thingiurlbase + '/thingiloader.js');
    
    worker.onmessage = function(event) {
      if (event.data.status == "complete") {
        progressBar.innerHTML = 'Initializing geometry...';
        // scene.removeObject(object);
        geometry = new STLGeometry(event.data.content);
        loadObjectGeometry();
        progressBar.innerHTML = '';
        progressBar.style.display = 'none';

        scope.setRotation(false);
        scope.setRotation(true);
        log("finished loading " + geometry.faces.length + " faces.");
        scope.centerCamera();
      } else if (event.data.status == "complete_points") {
        progressBar.innerHTML = 'Initializing points...';

        geometry = new THREE.Geometry();

        var material = new THREE.ParticleBasicMaterial( { color: 0xff0000, opacity: 1 } );

        // material = new THREE.ParticleBasicMaterial( { size: 35, sizeAttenuation: false} );
        // material.color.setHSV( 1.0, 0.2, 0.8 );
        
        for (i in event.data.content[0]) {
        // for (var i=0; i<10; i++) {
          vector = new THREE.Vector3( event.data.content[0][i][0], event.data.content[0][i][1], event.data.content[0][i][2] );
          geometry.vertices.push( new THREE.Vertex( vector ) );
        }

        particles = new THREE.ParticleSystem( geometry, material );
        particles.sortParticles = true;
        particles.updateMatrix();
        scene.addObject( particles );
                                
        camera.updateMatrix();
        renderer.render(scene, camera);
        
        progressBar.innerHTML = '';
        progressBar.style.display = 'none';

        scope.setRotation(false);
        scope.setRotation(true);
        log("finished loading " + event.data.content[0].length + " points.");
        // scope.centerCamera();
      } else if (event.data.status == "progress") {
        progressBar.style.display = 'block';
        progressBar.style.width = event.data.content;
        // log(event.data.content);
      } else if (event.data.status == "message") {
        progressBar.style.display = 'block';
        progressBar.innerHTML = event.data.content;
        log(event.data.content);
      } else if (event.data.status == "alert") {
        scope.displayAlert(event.data.content);
      } else {
        alert('Error: ' + event.data);
        log('Unknown Worker Message: ' + event.data);
      }
    }

    worker.onerror = function(error) {
      log(error);
      error.preventDefault();
    }

    worker.postMessage({'cmd':cmd, 'param':param});
  }

  this.displayAlert = function(msg) {
    msg = msg + "<br/><br/><center><input type=\"button\" value=\"Ok\" onclick=\"document.getElementById('alertBox').style.display='none'\"></center>"
    
    alertBox.innerHTML = msg;
    alertBox.style.display = 'block';
    
    // log(msg);
  }

  function loadPlaneGeometry() {
    // TODO: switch to lines instead of the Plane object so we can get rid of the horizontal lines in canvas renderer...
    plane = new THREE.Mesh(new Plane(100, 100, 10, 10), new THREE.MeshBasicMaterial({color:0xafafaf,wireframe:true}));
    scene.addObject(plane);
  }

  function loadObjectGeometry() {
    if (scene && geometry) {
      if (objectMaterial == 'wireframe') {
        // material = new THREE.MeshColorStrokeMaterial(objectColor, 1, 1);
        material = new THREE.MeshBasicMaterial({color:objectColor,wireframe:true});
      } else {
        if (isWebGl) {
          // material = new THREE.MeshPhongMaterial(objectColor, objectColor, 0xffffff, 50, 1.0);
          // material = new THREE.MeshColorFillMaterial(objectColor);
          // material = new THREE.MeshLambertMaterial({color:objectColor});
          material = new THREE.MeshLambertMaterial({color:objectColor, shading: THREE.FlatShading});
        } else {
          // material = new THREE.MeshColorFillMaterial(objectColor);
          material = new THREE.MeshLambertMaterial({color:objectColor, shading: THREE.FlatShading});
        }
      }

      // scene.removeObject(object);      

      if (object) {
        // shouldn't be needed, but this fixes a bug with webgl not removing previous object when loading a new one dynamically
        object.materials = [new THREE.MeshBasicMaterial({color:0xffffff, opacity:0})];
        scene.removeObject(object);        
        // object.geometry = geometry;
        // object.materials = [material];
      }

      object = new THREE.Mesh(geometry, material);
  		scene.addObject(object);

      if (objectMaterial != 'wireframe') {
        object.overdraw = true;
        object.doubleSided = true;
      }
      
      object.updateMatrix();
    
      targetXRotation = 0;
      targetYRotation = 0;

      sceneLoop();
    }
  }

};

var STLGeometry = function(stlArray) {
  // log("building geometry...");
	THREE.Geometry.call(this);

	var scope = this;

  // var vertexes = stlArray[0];
  // var normals  = stlArray[1];
  // var faces    = stlArray[2];

  for (var i=0; i<stlArray[0].length; i++) {    
    v(stlArray[0][i][0], stlArray[0][i][1], stlArray[0][i][2]);
  }

  for (var i=0; i<stlArray[1].length; i++) {
    f3(stlArray[1][i][0], stlArray[1][i][1], stlArray[1][i][2]);
  }

  function v(x, y, z) {
    // log("adding vertex: " + x + "," + y + "," + z);
    scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
  }

  function f3(a, b, c) {
    // log("adding face: " + a + "," + b + "," + c)
    scope.faces.push( new THREE.Face3( a, b, c ) );
  }

  // log("computing centroids...");
  this.computeCentroids();
  // log("computing normals...");
  // this.computeNormals();
	this.computeFaceNormals();
	this.sortFacesByMaterial();
  // log("finished building geometry");

  scope.min_x = 0;
  scope.min_y = 0;
  scope.min_z = 0;
  
  scope.max_x = 0;
  scope.max_y = 0;
  scope.max_z = 0;
  
  for (var v = 0, vl = scope.vertices.length; v < vl; v ++) {
		scope.max_x = Math.max(scope.max_x, scope.vertices[v].position.x);
		scope.max_y = Math.max(scope.max_y, scope.vertices[v].position.y);
		scope.max_z = Math.max(scope.max_z, scope.vertices[v].position.z);
		                                    
		scope.min_x = Math.min(scope.min_x, scope.vertices[v].position.x);
		scope.min_y = Math.min(scope.min_y, scope.vertices[v].position.y);
		scope.min_z = Math.min(scope.min_z, scope.vertices[v].position.z);
}

  scope.center_x = (scope.max_x + scope.min_x)/2;
  scope.center_y = (scope.max_y + scope.min_y)/2;
  scope.center_z = (scope.max_z + scope.min_z)/2;
}

STLGeometry.prototype = new THREE.Geometry();
STLGeometry.prototype.constructor = STLGeometry;

function log(msg) {
  if (this.console) {
    console.log(msg);
  }
}

/* A facade for the Web Worker API that fakes it in case it's missing. 
Good when web workers aren't supported in the browser, but it's still fast enough, so execution doesn't hang too badly (e.g. Opera 10.5).
By Stefan Wehrmeyer, licensed under MIT
*/

var WorkerFacade;
if(!!window.Worker){
    WorkerFacade = (function(){
        return function(path){
            return new window.Worker(path);
        };
    }());
} else {
    WorkerFacade = (function(){
        var workers = {}, masters = {}, loaded = false;
        var that = function(path){
            var theworker = {}, loaded = false, callings = [];
            theworker.postToWorkerFunction = function(args){
                try{
                    workers[path]({"data":args});
                }catch(err){
                    theworker.onerror(err);
                }
            };
            theworker.postMessage = function(params){
                if(!loaded){
                    callings.push(params);
                    return;
                }
                theworker.postToWorkerFunction(params);
            };
            masters[path] = theworker;
            var scr = document.createElement("SCRIPT");
            scr.src = path;
            scr.type = "text/javascript";
            scr.onload = function(){
                loaded = true;
                while(callings.length > 0){
                    theworker.postToWorkerFunction(callings[0]);
                    callings.shift();
                }
            };
            document.body.appendChild(scr);
            
            var binaryscr = document.createElement("SCRIPT");
            binaryscr.src = thingiurlbase + '/binaryReader.js';
            binaryscr.type = "text/javascript";
            document.body.appendChild(binaryscr);
            
            return theworker;
        };
        that.fake = true;
        that.add = function(pth, worker){
            workers[pth] = worker;
            return function(param){
                masters[pth].onmessage({"data": param});
            };
        };
        that.toString = function(){
            return "FakeWorker('"+path+"')";
        };
        return that;
    }());
}

/* Then just use WorkerFacade instead of Worker (or alias it)

The Worker code must should use a custom function (name it how you want) instead of postMessage.
Put this at the end of the Worker:

if(typeof(window) === "undefined"){
    onmessage = nameOfWorkerFunction;
    customPostMessage = postMessage;
} else {
    customPostMessage = WorkerFacade.add("path/to/thisworker.js", nameOfWorkerFunction);
}

*/
