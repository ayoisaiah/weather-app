(function () {

  "use strict";

  $(document).ajaxStart(function () {
    $(".loading-indicator").fadeIn();
  });

  $(document).ajaxStop(function () {
    $(".loading-indicator").fadeOut();
  });

    const App = {
      city: {
        address: undefined,
        longitude: 0,
        latitude: 0
      },
      weatherForecast: {},
      icons: []
    };

    // Update Icons for weather cards

    function skycons (icon) {
      const skycons = new Skycons({"color": "#333"});
      let canvas = document.getElementsByClassName("canvas");

      for (let i = 0; i < canvas.length; i++) {
        skycons.add(canvas[i], icon[i]);
      }

      skycons.play();
    }

    function getCurrentLocation () {

      // Use HTML5 Geolocation API if supported by browser
      if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {
          App.city.latitude = position.coords.latitude;
          App.city.longitude = position.coords.longitude;
          geoLocate("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + App.city.latitude + "," + App.city.longitude + "&key=AIzaSyD1i1YJ34RoVggnitqt4KQ5E4OqjN6XdmA", "geolocation");
        });

      } else {

          // Alternate IP Address method

          $.ajax({
            url: "http://ipinfo.io",
            dataType: "jsonp",
            success: function (data) {
              App.city.longitude = data.loc.split(",")[1];
              App.city.latitude = data.loc.split(",")[0];
            }
          }).done(function () {
            geoLocate("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + App.city.latitude + "," + App.city.longitude + "&key=AIzaSyD1i1YJ34RoVggnitqt4KQ5E4OqjN6XdmA", "ip");

          });

      }

    }

    getCurrentLocation();

    // Fetch location data from Google Maps API

    function geoLocate (url, call) {

      $.ajax({
        url: url,
        success: function (res) {
            if (call == "search") {
              App.city.address = res.results[0].formatted_address;
            } else {
              App.city.address = res.results[0].address_components[res.results[0].address_components.length - 2].long_name + ", " + res.results[0].address_components[res.results[0].address_components.length - 1].long_name;
            }
            App.city.longitude = res.results[0].geometry.location.lng;
            App.city.latitude = res.results[0].geometry.location.lat;
        }
      }).done(function() {
        getWeatherInfo();
      });

    }

    // Fetch weather data from DarkSky

    function getWeatherInfo () {

      const long = App.city.longitude;
      const lat = App.city.latitude;
      const url = "https://api.darksky.net/forecast/8877941a6145fd159c584b8f95b52bb9/" + lat + "," + long + "?callback=?";

      $.ajax({
        url: url,
        dataType: "jsonp",
        success: function (json) {
          App.weatherForecast = json;
        }
      }).done(function () {
        updateWeatherInfo(App.weatherForecast);
      });

    }

    // Update app with fresh weather information

    function updateWeatherInfo(data) {

      $(".today-grid, .tomorrow, .later").empty();

      currently(data.currently);
      hourly(data.hourly);
      later(data.daily);

      skycons(App.icons);

    }

    // Update current weather information (featured section on `Today` tab)

    function currently (current) {

      $(".location").text(App.city.address);
      $(".temperature").text(convertTemperature(current.temperature));
      $(".description").text(current.summary);
      $(".humidity").text("Humidity: " + (current.humidity * 100).toFixed(0) + "%");
      $(".wind").text("Wind: " + current.windSpeed + " m/s");
      $(".pressure").text("Pressure: " + current.pressure + " hPa");
      $(".last-updated").text("Last Updated: " + convertTimeStamp(current.time).time);

      App.icons.push(current.icon);

    }

    // Data for Weather cards on `Today` and `Tomorrow` tabs

    function hourly(hour) {

      for (let i = 1; i < (48 - convertTimeStamp(App.weatherForecast.currently.time).time.slice(0, 2)); i++) {

        let hourlyData = {
          temperature: "Temperature: " + convertTemperature(hour.data[i].temperature),
          description: hour.data[i].summary,
          wind: "Wind: " + hour.data[i].windSpeed + " m/s",
          pressure: "Pressure: " + hour.data[i].pressure + " hPa",
          humidity: "Humidity: " + (hour.data[i].humidity * 100).toFixed(0) + "%",
          date: convertTimeStamp(hour.data[i].time).fullDate,
          time: convertTimeStamp(hour.data[i].time).time,
          currentDay: convertTimeStamp(hour.data[i].time).currentDay,
          icon: hour.data[i].icon
        };

        App.icons.push(hourlyData.icon);

        let currentDay = convertTimeStamp(App.weatherForecast.currently.time).fullDate.slice(0, 2);

        let tab = (parseInt(currentDay) == hourlyData.date.slice(0, 2)) ? ".today-grid" : ".tomorrow";

        updateDom(hourlyData, tab);
      }
    }

    // Data for Weather cards on `Later` Tab

    function later(daily) {

      for (let i = 2; i <= 7; i++) {

        let dailyData = {
          temperature: "Temperature: " + convertTemperature(daily.data[i].temperatureMin) + " - " + convertTemperature(daily.data[i].temperatureMax),
          description: daily.data[i].summary,
          wind: "Wind: " + daily.data[i].windSpeed + " m/s",
          pressure: "Pressure: " + daily.data[i].pressure + " hPa",
          humidity: "Humidity: " + (daily.data[i].humidity * 100).toFixed(0) + "%",
          date: convertTimeStamp(daily.data[i].time).fullDate,
          time: convertTimeStamp(daily.data[i].time).time,
          currentDay: convertTimeStamp(daily.data[i].time).currentDay,
          icon: daily.data[i].icon
        };

        App.icons.push(dailyData.icon);

        updateDom(dailyData, ".later");
      }

    }

    // Weather Cards

    function updateDom (data, element) {

      $(element).append('<div class="mdl-grid tab-row">' +
    '<div class="mdl-cell mdl-cell--3-offset-desktop mdl-cell--6-col">' +
        '<div class="mdl-card weather-card mdl-shadow--2dp">' +
            '<div class="mdl-grid full-width">' +
              '<div class="mdl-cell mdl-cell--6-col">' +
                '<div class="basic-weather-info">' +
                  '<div class="main-info">' +
                    '<span class="date">' + data.currentDay + " " + data.date + " - " + data.time + '</span>' +
                    '<span class="description">' + data.description + '</span>' +
                  '</div>' +
                  '<span class="temperature">' + data.temperature + '</span>' +
                  '<span class="wind">' + data.wind + '</span>' +
                  '<span class="pressure">' + data.pressure + '</span>' +
                  '<span class="humidity">' + data.humidity + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="mdl-cell mdl-cell--6-col">' +

                '<div class="animated-icon">' +
                  '<canvas class="canvas" width="200" height="200"></canvas>' +
                '</div>' +

              '</div>' +
              '</div>' +
              '</div>' +
              '</div>' +
          '</div>');
    }

    // Some Event Listeners

    $("#search-form").on("submit", function(event) {
      event.preventDefault();
      const city = $("#search-field").val().trim();
      findForecast(city);
      document.querySelector("#search-form").reset();
      document.querySelector("#dialog").close();
    });

    $(".search-button").click(function (e) {
      e.preventDefault();
      $("#search-form").submit();
    });

    $(".refresh-weather").click(function (e) {
      e.preventDefault();
      getWeatherInfo(App.city.longitude, App.city.latitude);
    });

    $(".celsius, .fahrenheit").on("click", function () {
      getWeatherInfo(App.city.longitude, App.city.latitude);
    });

    // Search Function

    function findForecast (city) {
      geoLocate("https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "&key= AIzaSyD1i1YJ34RoVggnitqt4KQ5E4OqjN6XdmA", "search");
    }

    // Search Dialog Stuff

    (function () {
      const dialog = document.querySelector("#dialog");

      if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
      }

      $(".search-icon").click(function(e) {
        dialog.showModal();
      });

      $(".dialog-close").click(function(e) {
        dialog.close();
      });

    })();

    // Convert Fahrenheit to Celsius

    function convertTemperature (temp) {
      if ($(".celsius").is(":checked")) {
        return ((temp - 32) * (5/9)).toFixed(0) + "°C";
      } else {
        return (temp.toFixed(0)  + "F");
      }
    }

    // Convert UNIX Timestamp to human-readable time

    function convertTimeStamp (timestamp) {

      let date = new Date(timestamp * 1000),
        days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        currentDay = days[date.getDay()],
        year = date.getFullYear(),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2),
        hours = ("0" + date.getHours()).slice(-2),
        minutes = ("0" + date.getMinutes()).slice(-2),
        seconds = ("0" + date.getSeconds()).slice(-2);

        return {
          currentDay: currentDay,
          fullDate: day + "." + month + "." + year,
          time: hours + ":" + minutes
        };
    }
    
})();
