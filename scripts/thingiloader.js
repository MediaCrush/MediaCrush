Thingiloader = function(event) {
  // Code from https://developer.mozilla.org/En/Using_XMLHttpRequest#Receiving_binary_data
  this.load_binary_resource = function(url) {
  	var req = new XMLHttpRequest();
  	req.open('GET', url, false);
  	// The following line says we want to receive data as Binary and not as Unicode
  	req.overrideMimeType('text/plain; charset=x-user-defined');
  	req.send(null);
  	if (req.status != 200) return '';

  	return req.responseText;
  };

  this.loadSTL = function(url) {
    var looksLikeBinary = function(reader) {
      // STL files don't specify a way to distinguish ASCII from binary.
      // The usual way is checking for "solid" at the start of the file --
      // but Thingiverse has seen at least one binary STL file in the wild
      // that breaks this.

      // The approach here is different: binary STL files contain a triangle
      // count early in the file.  If this correctly predicts the file's length,
      // it is most probably a binary STL file.

      reader.seek(80);  // skip the header
      var count = reader.readUInt32();

      var predictedSize = 80 /* header */ + 4 /* count */ + 50 * count;
      return reader.getSize() == predictedSize;
    };

    workerFacadeMessage({'status':'message', 'content':'Downloading ' + url});  
    var file = this.load_binary_resource(url);
    var reader = new BinaryReader(file);

    if (looksLikeBinary(reader)) {
      this.loadSTLBinary(reader);
    } else {
      this.loadSTLString(file);
    }
  };

  this.loadOBJ = function(url) {
    workerFacadeMessage({'status':'message', 'content':'Downloading ' + url});  
    var file = this.load_binary_resource(url);
    this.loadOBJString(file);
  };

  this.loadJSON = function(url) {
    workerFacadeMessage({'status':'message', 'content':'Downloading ' + url});
    var file = this.load_binary_resource(url);
    this.loadJSONString(file);
  };
  
  this.loadPLY = function(url) {
    workerFacadeMessage({'status':'message', 'content':'Downloading ' + url});  
  
    var file = this.load_binary_resource(url);
    
    if (file.match(/format ascii/i)) {
      this.loadPLYString(file);
    } else {
      this.loadPLYBinary(file);
    }
  };

  this.loadSTLString = function(STLString) {
    workerFacadeMessage({'status':'message', 'content':'Parsing STL String...'});  
    workerFacadeMessage({'status':'complete', 'content':this.ParseSTLString(STLString)});
  };

  this.loadSTLBinary = function(STLBinary) {
    workerFacadeMessage({'status':'message', 'content':'Parsing STL Binary...'});
    workerFacadeMessage({'status':'complete', 'content':this.ParseSTLBinary(STLBinary)});
  };

  this.loadOBJString = function(OBJString) {
    workerFacadeMessage({'status':'message', 'content':'Parsing OBJ String...'});
    workerFacadeMessage({'status':'complete', 'content':this.ParseOBJString(OBJString)});
  };

  this.loadJSONString = function(JSONString) {
    workerFacadeMessage({'status':'message', 'content':'Parsing JSON String...'});
    workerFacadeMessage({'status':'complete', 'content':eval(JSONString)});
  };
  
  this.loadPLYString = function(PLYString) {
    workerFacadeMessage({'status':'message', 'content':'Parsing PLY String...'});  
    workerFacadeMessage({'status':'complete_points', 'content':this.ParsePLYString(PLYString)});
  };

  this.loadPLYBinary = function(PLYBinary) {
    workerFacadeMessage({'status':'message', 'content':'Parsing PLY Binary...'});  
    workerFacadeMessage({'status':'complete_points', 'content':this.ParsePLYBinary(PLYBinary)});
  };

  this.ParsePLYString = function(input) {
    var properties = [];
    var vertices = [];
    var colors = [];

    var vertex_count = 0;
    
    var header = /ply\n([\s\S]+)\nend_header/ig.exec(input)[1];
    var data = /end_header\n([\s\S]+)$/ig.exec(input)[1];
    
    // workerFacadeMessage({'status':'message', 'content':'header:\n' + header});  
    // workerFacadeMessage({'status':'message', 'content':'data:\n' + data});  

    header_parts = header.split("\n");
    
    for (i in header_parts) {
      if (/element vertex/i.test(header_parts[i])) {
        vertex_count = /element vertex (\d+)/i.exec(header_parts[i])[1];
      } else if (/property/i.test(header_parts[i])) {
        properties.push(/property (.*) (.*)/i.exec(header_parts[i])[2]);
      }
    }
    
    // workerFacadeMessage({'status':'message', 'content':'properties: ' + properties});

    data_parts = data.split("\n");
    
    for (i in data_parts) {
      data_line = data_parts[i];
      data_line_parts = data_line.split(" ");
      
      vertices.push([
        parseFloat(data_line_parts[properties.indexOf("x")]), 
        parseFloat(data_line_parts[properties.indexOf("y")]), 
        parseFloat(data_line_parts[properties.indexOf("z")]) 
      ]);
      
      colors.push([ 
        parseInt(data_line_parts[properties.indexOf("red")]), 
        parseInt(data_line_parts[properties.indexOf("green")]), 
        parseInt(data_line_parts[properties.indexOf("blue")]) 
      ]);
    }

    // workerFacadeMessage({'status':'message', 'content':'vertices: ' + vertices});

    return [vertices, colors];
  };

  this.ParsePLYBinary = function(input) {
    return false;
  };

  this.ParseSTLBinary = function(input) {
    // Skip the header.
    input.seek(80);

    // Load the number of vertices.
    var count = input.readUInt32();

    // During the parse loop we maintain the following data structures:
    var vertices = [];   // Append-only list of all unique vertices.
    var vert_hash = {};  // Mapping from vertex to index in 'vertices', above.
    var faces    = [];   // List of triangle descriptions, each a three-element
                         // list of indices in 'vertices', above.

    for (var i = 0; i < count; i++) {
      if (i % 100 == 0) {
        workerFacadeMessage({
            'status':'message',
            'content':'Parsing ' + (i+1) + ' of ' + count + ' polygons...'
          });
        workerFacadeMessage({
            'status':'progress',
            'content':parseInt(i / count * 100) + '%'
          });
      }
      
      // Skip the normal (3 single-precision floats)
      input.seek(input.getPosition() + 12);

      var face_indices = [];
      for (var x = 0; x < 3; x++) {
        var vertex = [input.readFloat(), input.readFloat(), input.readFloat()];
      
        var vertexIndex = vert_hash[vertex];
        if (vertexIndex == null) {
          vertexIndex = vertices.length;
          vertices.push(vertex);
          vert_hash[vertex] = vertexIndex;
        }

        face_indices.push(vertexIndex);
      }
      faces.push(face_indices);
    
      // Skip the "attribute" field (unused in common models)
      input.readUInt16();
    }

    return [vertices, faces];
  };

  // build stl's vertex and face arrays
  this.ParseSTLString = function(STLString) {
    var vertexes  = [];
    var faces     = [];
  
    var face_vertexes = [];
    var vert_hash = {}

    // console.log(STLString);

    // strip out extraneous stuff
    STLString = STLString.replace(/\r/, "\n");
    STLString = STLString.replace(/^solid[^\n]*/, "");
    STLString = STLString.replace(/\n/g, " ");
    STLString = STLString.replace(/facet normal /g,"");
    STLString = STLString.replace(/outer loop/g,"");  
    STLString = STLString.replace(/vertex /g,"");
    STLString = STLString.replace(/endloop/g,"");
    STLString = STLString.replace(/endfacet/g,"");
    STLString = STLString.replace(/endsolid[^\n]*/, "");
    STLString = STLString.replace(/\s+/g, " ");
    STLString = STLString.replace(/^\s+/, "");

    // console.log(STLString);

    var facet_count = 0;
    var block_start = 0;

    var points = STLString.split(" ");

    workerFacadeMessage({'status':'message', 'content':'Parsing vertices...'});
    for (var i=0; i<points.length/12-1; i++) {
      if ((i % 100) == 0) {
        workerFacadeMessage({'status':'progress', 'content':parseInt(i / (points.length/12-1) * 100) + '%'});
      }
    
      var face_indices = [];
      for (var x=0; x<3; x++) {
        var vertex = [parseFloat(points[block_start+x*3+3]), parseFloat(points[block_start+x*3+4]), parseFloat(points[block_start+x*3+5])];

        var vertexIndex = vert_hash[vertex];
        if (vertexIndex == null) {
          vertexIndex = vertexes.length;
          vertexes.push(vertex);
          vert_hash[vertex] = vertexIndex;
        }

        face_indices.push(vertexIndex);
      }
      faces.push(face_indices);
    
      block_start = block_start + 12;
    }

    return [vertexes, faces];
  };

  this.ParseOBJString = function(OBJString) {
    var vertexes  = [];
    var faces     = [];

    var lines = OBJString.split("\n");
  
    // var normal_position = 0;
  
    for (var i=0; i<lines.length; i++) {
      workerFacadeMessage({'status':'progress', 'content':parseInt(i / lines.length * 100) + '%'});
    
      line_parts = lines[i].replace(/\s+/g, " ").split(" ");
    
      if (line_parts[0] == "v") {
        vertexes.push([parseFloat(line_parts[1]), parseFloat(line_parts[2]), parseFloat(line_parts[3])]);
      } else if (line_parts[0] == "f") {
        faces.push([parseFloat(line_parts[1].split("/")[0])-1, parseFloat(line_parts[2].split("/")[0])-1, parseFloat(line_parts[3].split("/")[0]-1), 0])
      }
    }
  
    return [vertexes, faces];
  };

  switch(event.data.cmd) {
    case "loadSTL":
    this.loadSTL(event.data.param);
    break;
    case "loadSTLString":
    this.loadSTLString(event.data.param);
    break;
    case "loadSTLBinary":
    this.loadSTLBinary(event.data.param);
    break;
    case "loadOBJ":
    this.loadOBJ(event.data.param);
    break;
    case "loadOBJString":
    this.loadOBJString(event.data.param);
    break;
    case "loadJSON":
    this.loadJSON(event.data.param);
    break;
    case "loadPLY":
    this.loadPLY(event.data.param);
    break;
    case "loadPLYString":
    this.loadPLYString(event.data.param);
    break;
    case "loadPLYBinary":
    this.loadPLYBinary(event.data.param);
    break;
  }  

};

if (typeof(window) === "undefined") {
    onmessage = Thingiloader;
    workerFacadeMessage = postMessage;
    importScripts('binaryReader.js');
} else {
    workerFacadeMessage = WorkerFacade.add(thingiurlbase + "/thingiloader.js", Thingiloader);
}
