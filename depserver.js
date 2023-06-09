const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyDs2AicXiqugqpo-Yx-vVIVCqXq-5l3Gnw',
  Promise: Promise
});



const app = express()
// adding Helmet to enhance API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())



// defining default endpoint
app.get('/', (req, res) => {
  res.send('default get route');
});

// defining an endpoint to return optimized links
app.post('/ol', (req, res) => {
  let reqList = req.body.splitAddressList;
  //console.log(reqList)
  let origin = reqList[0];
  const lastIndex = reqList.length - 1;
  let destination = reqList[lastIndex];
  reqList.shift()
  reqList.pop()
  console.log(reqList)
  origin = origin.replace(/\+/g, ' ');
  destination = destination.replace(/\+/g, ' ');
  var waypts = [];
  for (let i = 0; i < reqList.length; i++) {
    let element = reqList[i].replace(/\+/g, ' ');
    waypts.push(element);
  }


  //origin = '"' + origin + '"'
  //destination = '"' + destination + '"'
  console.log(origin)
  console.log(destination)
  console.log(waypts)
  let preTimeInMinutes = 0;

  googleMapsClient.directions({ origin: origin, destination: destination, waypoints: waypts, mode: "driving" })
    .asPromise()
    .then((preOptResponse) => {
      const preOptRoute = preOptResponse.json.routes[0];
      const preTimeInSeconds = preOptRoute.legs.reduce((acc, leg) => acc + leg.duration.value, 0);
      const preDistanceInMeters = preOptRoute.legs.reduce((acc, leg) => acc + leg.distance.value, 0);
      const preTimeInMinutes = preTimeInSeconds / 60;
      console.log('pretime:' + preTimeInMinutes);

      return googleMapsClient.directions({ origin: origin, destination: destination, waypoints: waypts, optimize: true, mode: "driving" })
        .asPromise()
        .then((postOptResponse) => {
          const postOptRoute = postOptResponse.json.routes[0];
          const postTimeInSeconds = postOptRoute.legs.reduce((acc, leg) => acc + leg.duration.value, 0);
          const postDistanceInMeters = postOptRoute.legs.reduce((acc, leg) => acc + leg.distance.value, 0);
          const postTimeInMinutes = postTimeInSeconds / 60;
          console.log('post time' + postTimeInMinutes);

          const routeOrder = postOptResponse.json.routes[0].waypoint_order;
          const output = routeOrder.map(i => reqList[i].replaceAll(' ', '+'));
          origin = origin.replaceAll(' ', '+');
          destination = destination.replaceAll(' ', '+');
          output.unshift(origin);
          output.push(destination);
          let urlstr = output.join('_');
          urlstr = urlstr.replaceAll('_', '/');
          urlstr = urlstr.replace(/[!'()*;:@&=$?%#\[\]]/g, function(c) {
            return '%' + c.charCodeAt(0).toString(16);
          });
          urlstr = "https://www.google.com/maps/dir/" + urlstr;
          const diffTimeInMinutes = preTimeInMinutes - postTimeInMinutes;
          const diffDistanceInMeters = preDistanceInMeters - postDistanceInMeters;
          const diffDistanceInKm = diffDistanceInMeters / 1000;
          const formattedTime = `${Math.floor(diffTimeInMinutes / 60)} hr ${Math.round(diffTimeInMinutes % 60)} min`;
          console.log("url " + urlstr)
          res.send({ link: urlstr, timeDifference: formattedTime, distanceSaved: `${diffDistanceInKm} km` });
        });
    })
    .catch((err) => {
      if (err.json && err.json.status) {
        console.log(err.json.status);
        if (err.json.status === 'NOT_FOUND') {
          res.send({ link: '', timeDifference: '', distanceSaved: '' });
        }
      } else {
        console.log('Error:', err);
      }
    });
  /* googleMapsClient.directions({origin: origin, destination: destination, waypoints:waypts, optimize:true, mode: "driving"})
      .asPromise()
      .then((response) => {
      //console.log(response)
      //console.log(response.json.routes[0].waypoint_order)
      const route = response.json.routes[0];
      const preTimeInSeconds = route.legs.reduce((acc, leg) => acc + leg.duration.value, 0);
      const preTimeInMinutes = preTimeInSeconds / 60;
      console.log(preTimeInMinutes);
      const routeOrder = response.json.routes[0].waypoint_order;
      for(let i = 0; i < reqList.length; i++){
        reqList[i] = reqList[i].replaceAll(' ', '+');
      }
      const output = routeOrder.map(i => reqList[i]);
      origin = origin.replaceAll(' ', '+');
      destination = destination.replaceAll(' ', '+');
      output.unshift(origin)
      output.push(destination)
      let urlstr = output.join('_')
      urlstr = urlstr.replaceAll('_', '/')
      urlstr = "https://www.google.com/maps/dir/" + urlstr
      urlstr = JSON.stringify(urlstr)
      res.send(urlstr);
      })
      .catch((err) => {
      console.log(err.json.status);
      }); */

  // client
  //   .directions({
  //     params: {
  //       origin: origin,
  //       destination: destination, //{placeId: "ChIJh1a5WhEMa0gRY1JU4PEam8Q"},
  //       waypoints: waypts,
  //       optimize: true,
  //       travelMode: 'DRIVING',
  //       key: process.env.GOOGLE_MAPS_API_KEY
  //     },
  //     timeout: 10000, // milliseconds
  //   })
  //   .then((r) => {
  //     console.log("got r")
  //     const routeOrder = r.data.routes[0].waypoint_order;
  //     for(let i = 0; i < reqList.length; i++){
  //       reqList[i] = reqList[i].replaceAll(' ', '+');
  //     }
  //     const n = reqList.length
  //     reorder(reqList, routeOrder, n)
  //     console.log(reqList)
  //   })
  //   .catch((e) => {
  //     console.log('Directions request failed due to ' + e);
  //     for (var key in e.config.data) {
  //       if (e.config.data.hasOwnProperty(key)) {
  //           console.log(key)
  //       }
  //   }
  //   });


});

//localhost testing block (uncomment if doing local testing)
// starting the server
app.listen(3001, () => {
  console.log('listening on port 3001');
});

//prod listen statement
// app.listen(process.env.PORT, () => {
//   console.log('listening on port ' + process.env.PORT);
// });

/**
  directionsService.route(request, function(response, status) {
  if (status === 'OK') {
    directionsDisplay.setDirections(response);
    const routeOrder = Object.values(response.routes[0].waypoint_order)
    for(let i = 0; i < cleanList.length; i++){
      cleanList[i].replaceAll(' ', '+');
    }
    const n = cleanList.length
    reorder(cleanList, routeOrder, n)
    console.log(cleanList)
  } else {
    window.alert('Directions request failed due to ' + status);
  }
})
 */
