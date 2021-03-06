const cursor_black = 'https://laekov.com.cn/l/cursor/b2.png';
const cursor_red = 'https://laekov.com.cn/l/cursor/red.png';
const cursor_blue = 'https://laekov.com.cn/l/cursor/blue.png';
const cursor_green = 'https://laekov.com.cn/l/cursor/green.png';

var map = 0;
var points = [];
var selected_pos = 0;
var selected_dest = 0;
var mass = 0;
var found_taxis = [];
var optim_path = 0;

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
					icon: cursor_red,
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
					icon: cursor_blue,
					position: points[e.data.name].lnglat,
					offset: new AMap.Pixel(0, 0)
				});
				marker_dest.setMap(map);
			}	
		});

		$('#msg').html('Loaded');
		$('#show_loc').show();
		$('#find_taxi').show();
	});

	$('#show_loc').click(function() {
		if (path_orig !== 0) {
			map.clearMap();
		}
		if (mass !== 0) {
			mass.setMap(map);
		}
	});
	$('#show_loc').hide();
	$('#find_taxi').hide();

	$('#hide_loc').click(function() {
		if (mass !== 0) {
			mass.setMap(null);
		}
		map.clearMap();
	});

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

	var showTaxi = function(id) {
		if (path_orig !== 0) {
			map.clearMap();
		}

		var opath = createPoly(optim_path, 9, '#cccc00');
		opath.setMap(map);

		var lines = [];
		var t = found_taxis[id];
		lines.push('k: ' + t.k);
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
		
		var origp = [];
		origp.push(points[t.taxi_pos].lnglat);
		for (var i = 0; i < t.route_orig.length; ++i) {
			origp.push(points[t.route_orig[i]].lnglat);
		}
		path_orig = createPoly(origp, 7, '#33ffff');
		path_orig.setMap(map);

		var newp = [];
		newp.push(points[t.taxi_pos].lnglat);
		for (var i = 0; i < t.route_new.length; ++i) {
			newp.push(points[t.route_new[i]].lnglat);
		}
		path_new = createPoly(newp, 4, '#ff11ff');
		path_new.setMap(map);

		map.setFitView([path_orig, path_new]);

		for (var i = 0; i < t.dests.length; ++i) {
			var marker = new AMap.Marker({
				icon: cursor_black,
				position: points[t.dests[i]].lnglat,
				offset: new AMap.Pixel(0, 0)
			});
			marker.setMap(map);
		}

		marker_user = new AMap.Marker({
			icon: cursor_red,
			position: points[t.user_pos].lnglat,
			offset: new AMap.Pixel(0, 0)
		});
		marker_user.setMap(map);

		marker_dest = new AMap.Marker({
			icon: cursor_blue,
			position: points[$('#loc_dest').val()].lnglat,
			offset: new AMap.Pixel(0, 0)
		});
		marker_dest.setMap(map);

		marker_taxi = new AMap.Marker({
			icon: cursor_green,
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
			var optimpos = JSON.parse(res_s[res_s.length - 2]);
			optim_path = [];
			for (var i = 0; i < optimpos.length; ++i) {
				optim_path.push(points[optimpos[i]].lnglat);
			}
			for (var i = 1; i < res_s.length - 2; ++i) {
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

	$('#clear_src').click(function() {
		$('#loc_src').val('');
	});
	$('#clear_dst').click(function() {
		$('#loc_dest').val('');
	});

	$('#rand_src').click(function() {
		$('#loc_src').val(Math.floor(Math.random() * points.length));
	});
	$('#rand_dst').click(function() {
		$('#loc_dest').val(Math.floor(Math.random() * points.length));
	});
});

