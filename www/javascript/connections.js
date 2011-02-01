// $.template("connection", '<li data-key="${key}">${name}<span href="#connections" class="delete">Delete</span></li>');

$.template("connection", '    \
  <li data-key="${key}">      \
  	<h3><a href="#">${name}</a></h3>   \
  	<p>${message}</p>         \
  	<p>Campfire: ${room}</p>  \
  	<a href="#edit" class="edit" data-rel="dialog" data-transition="pop" data-icon="gear">Edit</a>   \
  </li>                       \
');                           

$.template("img", '<img src="${src}" />');
$.template("option", '<option value="${value}">${text}</option>');

var connections = new Lawnchair("connections");

var renderConnections = function() {
  $("#connection-list").empty();
	connections.all(function(connection) {
		$.tmpl("connection", connection).appendTo("#connection-list");
	});
	$("#connection-list").listview('refresh');

  $("#connection-list li h3 a").click(function() {
    connections.get($(this).attr("data-key"), function(connection) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $.getJSON(
          "http://www.mapquestapi.com/directions/v1/route?key=Fmjtd%7Cluu72gu2ll%2Cb5%3Do5-5yts0&callback=?",
          { from: position.coords.latitude + "," + position.coords.longitude, to: connection.lat + "," + connection.lng },
          function(data) {
            sendToCampfire(connection.subdomain, connection.token, connection.room, connection.message.replace("{min}", Math.round(data.route.time / 60)));
          }
        );
      });
    });
  });

  $("#connection-list li .edit").click(function() {
    connections.get($(this).parents("li").attr("data-key"), function(connection) {
      $("#edit #name").val(connection.name);
      $("#edit #message").val(connection.message);
      $("#edit #location").val(connection.location);
      $("#edit #subdomain").val(connection.subdomain);
      $("#edit #username").val(connection.username);
      $("#edit #password").val(connection.password);
    });
  });
};

var getLatLngMap = function(callback) {
   $.getJSON(
    "http://www.mapquestapi.com/geocoding/v1/address?callback=?&key=Fmjtd%7Cluu72gu2ll%2Cb5%3Do5-5yts0",
    { location: $("#location").val() },
    function(data) {
      callback(data.results[0].locations[0].latLng.lat, data.results[0].locations[0].latLng.lng, data.results[0].locations[0].mapUrl);
    }
  );
};

var getCampfireRooms = function(subdomain, token, callback) {
  $.getJSON(
    "http://pure-rain-331.heroku.com?jsonp=?",
    { u: "https://" + token + ":X@" + subdomain + ".campfirenow.com/rooms.json" },
    function(data) {
      callback(data.rooms);
    }
  );
};

var sendToCampfire = function(subdomain, token, room, message) {
  $.getJSON(
    "http://pure-rain-331.heroku.com?jsonp=?",
    { m: "post", u: "https://" + token + ":X@" + subdomain + ".campfirenow.com/room/" + room + "/speak.json?message[type]=TextMessage&message[body]=" + encodeURI(message) }
  );
};

$(function() {
  renderConnections();
  
  $("#add-connection").live("click", function() {
    getLatLngMap(function(lat, lng, mapUrl) {
      connections.save({
        name: $("#name").val(),
        message: $("#message").val(),
        location: $("#location").val(),
        lat: lat, lng: lng,
        mapUrl: mapUrl,
        subdomain: $("#subdomain").val(),
        username: $("#username").val(),
        password: $("#password").val(),
        token: $("#token").val(),
        room: $("#room").val()
      });
  	  renderConnections();
	  });
  });

  $("#location").live("change", function() {
    getLatLngMap(function(lat, lng, mapUrl) {
      $("#location").after($.tmpl("img", { src: mapUrl }));
    });
  });

  $("#subdomain, #username, #password").live("change", function() {
    if($("#subdomain").val() && $("#username").val() && $("#password").val()) {
      $.getJSON(
        "http://pure-rain-331.heroku.com?jsonp=?",
        { u: "https://" + encodeURIComponent($("#username").val())+ ":" + encodeURIComponent($("#password").val()) + "@" + $("#subdomain").val() + ".campfirenow.com/users/me.json" },
        function(data) {
          $("#token").val(data.user.api_auth_token);

          getCampfireRooms($("#subdomain").val(), $("#token").val(), function(rooms) {
            $("#room").empty();
            $.each(rooms, function(index, room) {
              $.tmpl("option", { value: room.id, text: room.name }).appendTo("#room");
            });
            $("#room").selectmenu('refresh', true);
          });
        }
      );
    }
  });
});
