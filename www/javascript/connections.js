$.template("connection", '<li data-key="${key}">${name}</li>');
$.template("img", '<img src="${src}" />');
$.template("option", '<option value="${value}">${text}</option>');

var connections = new Lawnchair("connections");

var renderConnections = function() {
  $("#connection-list").empty();
	connections.all(function(connection) {
		$.tmpl("connection", connection).appendTo("#connection-list");
	});
	$("#connection-list").listview('refresh');
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

  $("[data-key]").click(function() {
    connections.get($(this).attr("data-key"), function(connection) {
      sendToCampfire(connection.subdomain, connection.token, connection.room, connection.message);
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
        { u: "https://" + $("#username").val() + ":" + $("#password").val() + "@" + $("#subdomain").val() + ".campfirenow.com/users/me.json" },
        function(data) {
          $("#token").val(data.user.api_auth_token);

          getCampfireRooms($("#subdomain").val(), $("#token").val(), function(rooms) {
            $.each(rooms, function(index, room) {
              $.tmpl("option", { value: room.id, text: room.name }).appendTo("#room");
              $("#room").selectmenu('refresh');
            });
          });
        }
      );
    }
  });
});
