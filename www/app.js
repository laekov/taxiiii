var map = 0;
var points = [];
var selected_pos = 0;
var selected_dest = 0;
var mass = 0;
var found_taxis = [];

var path_orig = 0;
var path_new = 0;
var marker_user = 0;
var marker_dest = 0;
var marker_taxi = 0;


$(document).ready(function() {
	map = new AMap.Map('map_container', {
		resizeEnable: true,
		zoom:12, 
		center: [116.397428, 39.90923] 
	});

	$.get('/data/road.cnode', function(res) {
		res = res.split('\n');
		for (var i in res) {
			line = res[i].split(' ');
			if (line.length != 3) {
				continue;
			}
			points.push({
				id: Number(line[0]),
				name: line[0],
				lnglat: [Number(line[1]), Number(line[2])],
			});
		}
		mass = new AMap.MassMarks(points, {
			style: {
				url: 'https://a.amap.com/jsapi_demos/static/images/mass1.png',
				anchor: new AMap.Pixel(4, 4),
				size: new AMap.Size(7, 7),
				opacity: 0.4
			},
			cursor: 'pointer',
		});

		var marker = new AMap.Marker({content: ' ', map: map});
		mass.on('mouseover', function (e) {
			marker.setPosition(e.data.lnglat);
			marker.setLabel({content: e.data.name});
		});
		mass.on('click', function(e) {
			if ($('#loc_src').val() === '') {
				$('#loc_src').val(e.data.name);

				if (marker_user !== 0) {
					marker_user.setMap(null);
				}
				marker_user = new AMap.Marker({
					icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
					position: points[e.data.name].lnglat,
					offset: new AMap.Pixel(0, 0)
				});
				marker_user.setMap(map);

			} else {
				$('#loc_dest').val(e.data.name);

				if (marker_dest !== 0) {
					marker_dest.setMap(null);
				}
				marker_dest = new AMap.Marker({
					icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
					position: points[e.data.name].lnglat,
					offset: new AMap.Pixel(0, 0)
				});
				marker_dest.setMap(map);
			}	
		});

		$('#msg').html('Loaded');
		$('#show_loc').show();
		$('#show_loc').click();
	});

	$('#show_loc').click(function() {
		if (path_orig !== 0) {
			path_orig.setMap(null);
			path_new.setMap(null);
			marker_user.setMap(null);
			marker_dest.setMap(null);
			marker_taxi.setMap(null);
		}
		if (mass !== 0) {
			mass.setMap(map);
		}
	});
	$('#show_loc').hide();
	$('#hide_loc').click(function() {
		if (mass !== 0) {
			mass.setMap(null);
		}
	});

	var showTaxi = function(id) {
		if (path_orig !== 0) {
			path_orig.setMap(null);
			path_new.setMap(null);
			marker_user.setMap(null);
			marker_dest.setMap(null);
			marker_taxi.setMap(null);
		}

		var lines = [];
		var t = found_taxis[id];
		lines.push('k: ' + t.route_orig.length);
		lines.push('d1: ' + t.d1);
		lines.push('d2: ' + t.d2);
		lines.push('d3: ' + t.d3);
		lines.push('d4: ' + t.d4);
		var desc = lines.join(', ');
		$('#msg').html(desc);
		for (var i = 0; i < found_taxis.length; ++i) {
			if (i == id) {
				$('#taxi_' + i).addClass('active');
			} else {
				$('#taxi_' + i).removeClass('active');
			}
			$('#taxi_' + i).find('#taxi_info').html(desc);
		}

		var createPoly = function(path, line, color) {
			return new AMap.Polyline({
				path: path,
				outlineColor: '#ffeeff',
				borderWeight: 3,
				strokeColor: color, 
				strokeOpacity: 1,
				strokeWeight: line,
				strokeStyle: "solid",
				strokeDasharray: [10, 5],
				lineJoin: 'round',
				lineCap: 'round',
				zIndex: 50,
			});
		};

		var origp = [];
		origp.push(points[t.taxi_pos].lnglat);
		for (var i = 0; i < t.route_orig.length; ++i) {
			origp.push(points[t.route_orig[i]].lnglat);
		}
		path_orig = createPoly(origp, 7, '#3366ff');
		path_orig.setMap(map);

		var newp = [];
		newp.push(points[t.taxi_pos].lnglat);
		newp.push(points[t.user_pos].lnglat);
		for (var i = 0; i < t.route_new.length; ++i) {
			newp.push(points[t.route_new[i]].lnglat);
		}
		path_new = createPoly(newp, 4, '#ff3366');
		path_new.setMap(map);

		map.setFitView([path_orig, path_new]);

		marker_user = new AMap.Marker({
			icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
			position: points[t.user_pos].lnglat,
			offset: new AMap.Pixel(0, 0)
		});
		marker_user.setMap(map);

		marker_dest = new AMap.Marker({
			icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",
			position: points[$('#loc_dest').val()].lnglat,
			offset: new AMap.Pixel(0, 0)
		});
		marker_dest.setMap(map);

		marker_taxi = new AMap.Marker({
			icon: "//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",
			position: points[t.taxi_pos].lnglat,
			offset: new AMap.Pixel(0, 0)
		});
		marker_taxi.setMap(map);

	};

	var reloadResult = function() {
		$('#res_list').html('');
		for (var i = 0; i < found_taxis.length; ++i) {
			var t = found_taxis[i];
			var ele = $('#sample_cand').clone();
			ele.attr('id', 'taxi_' + i);
			ele.find('#taxi_id').html('Taxi ' + t.taxi_id);
			ele.click(function() {
				showTaxi($(this).attr('id').substr(5));
			});
			$('#res_list').append(ele);
		}
	};

	$('#find_taxi').click(function() {
		var src = $('#loc_src').val();
		var dest = $('#loc_dest').val();
		mass.setMap(null);
		var time_beg = Date.now();
		$.get('/query/' + src + '/' + dest, function(res) {
			var time_end = Date.now();
			found_taxis = [];
			var res_s = res.split('\n');
			for (var i = 0; i < res_s.length; ++i) {
				try {
					found_taxis.push(JSON.parse(res_s[i].replace(/,]/g, ']')));
				} catch (e) {
				}
			}
			$('#msg').html('Found ' + found_taxis.length
				   + ' result in ' + (time_end - time_beg) + ' ms');
			reloadResult();
		});
	});
});

