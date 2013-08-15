/*
 * JavaScript ID3 Tag Reader 0.1.2
 * Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 */

var ID3 = {};

(function() {

	ID3.genres = [
		"Blues","Classic Rock","Country","Dance","Disco","Funk","Grunge",
		"Hip-Hop","Jazz","Metal","New Age","Oldies","Other","Pop","R&B",
		"Rap","Reggae","Rock","Techno","Industrial","Alternative","Ska",
		"Death Metal","Pranks","Soundtrack","Euro-Techno","Ambient",
		"Trip-Hop","Vocal","Jazz+Funk","Fusion","Trance","Classical",
		"Instrumental","Acid","House","Game","Sound Clip","Gospel",
		"Noise","AlternRock","Bass","Soul","Punk","Space","Meditative",
		"Instrumental Pop","Instrumental Rock","Ethnic","Gothic",
		"Darkwave","Techno-Industrial","Electronic","Pop-Folk",
		"Eurodance","Dream","Southern Rock","Comedy","Cult","Gangsta",
		"Top 40","Christian Rap","Pop/Funk","Jungle","Native American",
		"Cabaret","New Wave","Psychadelic","Rave","Showtunes","Trailer",
		"Lo-Fi","Tribal","Acid Punk","Acid Jazz","Polka","Retro",
		"Musical","Rock & Roll","Hard Rock","Folk","Folk-Rock",
		"National Folk","Swing","Fast Fusion","Bebob","Latin","Revival",
		"Celtic","Bluegrass","Avantgarde","Gothic Rock","Progressive Rock",
		"Psychedelic Rock","Symphonic Rock","Slow Rock","Big Band",
		"Chorus","Easy Listening","Acoustic","Humour","Speech","Chanson",
		"Opera","Chamber Music","Sonata","Symphony","Booty Bass","Primus",
		"Porn Groove","Satire","Slow Jam","Club","Tango","Samba",
		"Folklore","Ballad","Power Ballad","Rhythmic Soul","Freestyle",
		"Duet","Punk Rock","Drum Solo","Acapella","Euro-House","Dance Hall"
	];


	var files = [];

	function readFileData(url, callback) {
		BinaryAjax(
			url,
			function(http) {
				var tags = readTagsFromData(http.binaryResponse);
				files[url] = tags;
				if (callback) callback();
			},
			null,
			[-128, 128] // range = [start, length], -128 means length-128
		)
	}

	function readTagsFromData(data) {
		//var offset = data.getLength() - 128;

		var offset = 0;

		var header = data.getStringAt(offset, 3);
		if (header == "TAG") {
			var title = data.getStringAt(offset + 3, 30).replace(/\0/g, "");
			var artist = data.getStringAt(offset + 33, 30).replace(/\0/g, "");
			var album = data.getStringAt(offset + 63, 30).replace(/\0/g, "");
			var year = data.getStringAt(offset + 93, 4).replace(/\0/g, "");

			var trackFlag = data.getByteAt(offset + 97 + 28);
			if (trackFlag == 0) {
				var comment = data.getStringAt(offset + 97, 28).replace(/\0/g, "");
				var track = data.getByteAt(offset + 97 + 29);
			} else {
				var comment = "";
				var track = 0;
			}

			var genreIdx = data.getByteAt(offset + 97 + 30);
			if (genreIdx < 255) {
				var genre = ID3.genres[genreIdx];
			} else {
				var genre = "";
			}

			return {
				title : title,
				artist : artist,
				album : album,
				year : year,
				comment : comment,
				track : track,
				genre : genre
			}
		} else {
			return {};
		}
	}


	ID3.loadTags = function(url, cb) {
		if (!files[url]) {
			readFileData(url, cb);
		} else {
			if (cb) cb();
		}
	}

	ID3.getAllTags = function(url) {
		if (!files[url]) return null;

		var tags = {};
		for (var a in files[url]) {
			if (files[url].hasOwnProperty(a))
				tags[a] = files[url][a];
		}
		return tags;
	}

	ID3.getTag = function(url, tag) {
		if (!files[url]) return null;

		return files[url][tag];
	}


})();

