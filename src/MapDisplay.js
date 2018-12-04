import React, {Component} from 'react';
import {Map, InfoWindow, GoogleApiWrapper} from 'google-maps-react';
import NoMapDisplay from './NoMapDisplay';

const MAP_KEY ="AIzaSyDd-9Qwxgg4xbWnVNfa5Cuo8L8V0L3DazQ";
const FS_CLIENT ="IHQCX3B3RPQDB3CUZV4SSGKIP1L04RUPQQCAPFGBF0CVXOIH"
const FS_SECRET="PRWAMTQKHDCELT5OFS3OGNFLPWZTPSIVOYBM2QWKHPMLP1E2"
const FS_VERSION="20180323"

class MapDisplay extends Component  {
  state = {
    map: null,
    markers: [],
    markerProps: [],
    activeMarker: null,
    activeMarkerProps: null,
    showimgInfoWindow: false
    // firstDrop: true,
  };

  componentDidMount = ()  =>  {
  }

  componentWillReceiveProps = (props) => {
    this.setState({firstDrop: false});

  // Change in the number of locations, update the markers
  if (this.state.markers.length !== props.locations.length)  {
      this.closeInfoWindow();
      this.updateMarkers(props.locations);
      this.setState({activeMarker: null});

      return;
  }

  // The selected item is not the same as the active marker, close the info window
  if (!props.selectedIndex || (this.state.activeMarker &&
      (this.state.markers[props.selectedIndex] !== this.state.activeMarker)))  {
        this.closeInfoWindow();
      }

      // Make sure there is a selected index
      if (props.selectedIndex === null || typeof(props.selectedIndex) === "undefined") {
            return;
        };

      // Treat the marker as being clicked
      this.onMarkerClick(this.state.markerProps[props.selectedIndex], this.state.markers[props.selectedIndex]);
    }

    mapReady = (props, map) =>  {
      // Save the map reference in state and prepare location markers
      this.setState({map});
      this.updateMarkers(this.props.locations);
    }

    closeInfoWindow = () => {
      // Disable active marker animations
      this.state.activeMarker && this
        .state
        .activeMarker
        .setAnimation(null);
      this.setState({showimgInfoWindow:false, activeMarker: null, activeMarkerProps: null});
    }



    getBusinessInfo = (props, data)  => {
      // look for matching venue in foursquare
      return data
        .response
        .venues
       .filter(item => item.name.includes(props.name) || props.name.includes(item.name));
}



    onMarkerClick = (props, marker, e) => {
      // close info windows
      this.closeInfoWindow();


    // Fetch FourSquare data for selected venue
    let url = `https://api.foursquare.com/v2/venues/search?client_id=${FS_CLIENT}&client_secret=${FS_SECRET}&v=${FS_VERSION}&radius=100&ll=${props.position.lat},${props.position.lng}&llAcc=100`;
    let headers = new Headers();
    let request = new Request(url, {
        method: 'GET',
        headers
    });

    // Create props for active marker
    let activeMarkerProps;
    fetch(request)
      .then(response => response.json())
      .then(result => {
        // Get business reference for venue
        let theatre = this.getBusinessInfo(props, result);
                activeMarkerProps = {
                    ...props,
                    foursquare: theatre[0]
                };

        // get list of images for venue if data is available
        if(activeMarkerProps.foursquare) {
          let url = `https://api.foursquare.com/v2/venues/${theatre[0].id}/photos?client_id=${FS_CLIENT}&client_secret=${FS_SECRET}&v=${FS_VERSION}`;
          fetch(url)
            .then(response => response.json())
            .then(result => {
                activeMarkerProps = {
                  ...activeMarkerProps,
                  images: result.response.photos
                };

                if (this.state.activeMarker)
                this.state.activeMarker.setAnimation(null);
                marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
                this.setState({showimgInfoWindow: true, activeMarker: marker, activeMarkerProps});
                })
          } else {
              marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
              this.setState({showimgInfoWindow: true, activeMarker: marker, activeMarkerProps});
              }
            })

            // FourSquare error
            .catch(error => {
              alert(
                "An error ocurred trying to fetch FourSquare data. " + error
              );
            });
            // google maps error
            window.gm_authFailure = () => {
              alert("An error occurred while trying to load Google Map");
            };

          }

    updateMarkers = (locations) =>  {
      //If all locations have been filtered then return locations
      if(!locations)
        return;

        // Remove any existing markers from the map
        this
          .state
          .markers
          .forEach(marker => marker.setMap(null));


    // Iterate over locations to create parallel references to marker properties
    // and the markers that can be used for reference in interacions.
    // Add markers to the map.
    let markerProps = [];
    let markers = locations.map((location, index) => {
          let mProps = {
              key: index,
              index,
              name: location.name,
              position: location.pos,
              url: location.url
            };
          markerProps.push(mProps);

          let animation = this.state.firstDrop ? this.props.google.maps.Animation.DROP : null;
          let marker = new this
              .props
              .google
              .maps
              .Marker({position: location.pos, map: this.state.map, animation});
          marker.addListener('click', () =>  {
            this.onMarkerClick(mProps, marker, null);
          });
          return marker;
        })

      this.setState({markers, markerProps});
    }


  render = () =>  {
    const style = {
      width: '100%',
      height: '100%'
    }
    const center = {
      lat: this.props.lat,
      lng: this.props.lon
    }
    let amProps = this.state.activeMarkerProps;
    return (
      <Map
        role="application"
        aria-label="map"
        onReady={this.mapReady}
        google={this.props.google}
        zoom={this.props.zoom}
        style={style}
        initialCenter={center}
        onClick={this.closeInfoWindow}>
        <InfoWindow
            marker={this.state.activeMarker}
            visible={this.state.showimgInfoWindow}
            onClose={this.closeInfoWindow}>
            <div>
              <h3>{amProps && amProps.name}</h3>
              {amProps && amProps.url
              ? (
                <a href={amProps.url}>See website</a>
              )
              : ""}
              {amProps && amProps.images
              ? (
                <div><img
                    alt={amProps.name + " venue picture"}
                    src={amProps.images.items[0].prefix + "100x100" + amProps.images.items[0].suffix}/>
                    <p>Image from Foursquare</p></div>
              )
              : ""
  }


        </div>
        </InfoWindow>
        </Map>
    )
  }
}

export default GoogleApiWrapper({apiKey: MAP_KEY, LoadingContainer: NoMapDisplay})(MapDisplay)
