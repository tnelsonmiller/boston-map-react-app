import React, {Component} from 'react';
import './App.css';
import locations from './data/locations.json';
import MapDisplay from './MapDisplay';
import ListDrawer from './ListDrawer';

class App extends Component  {
  state = {
    lat: 42.349980,
    lon: -71.066170,
    zoom: 16,
    all: locations,
    open: false,
    filtered: null
    // selectedIndex: null
    // mapScriptAvailable: true,
  }

styles = {
  menuButton: {
    marginLeft: 10,
    marginRight: 20,
    position: "absolute",
    left: 10,
    top: 20,
    background: "white",
    padding:10
  },
  hide: {
    display: 'none'
  },
  header: {
    marginTop: "0px"
  }
};

componentDidMount = ()  =>  {
  this.setState({
    ...this.state,
    filtered: this.filterLocations(this.state.all, "")
  });
}

toggleDrawer = () =>  {
  // Toggle the value to control whether drawer is displayed
  this.setState({
    open: !this.state.open
  });
}

updateQuery = (query) =>  {
  //Update the query value and filter the list of locations
  this.setState({
    ...this.state,
    selectedIndex: null,
    filtered: this.filterLocations(this.state.all, query)
  });
}

filterLocations = (locations, query) => {
  // Filter locations to match query string
return locations.filter(location => location.name.toLowerCase().includes(query.toLowerCase()));
}

clickListItem = (index) => {
  // Set state to reflect the selected location array index
  this.setState({ selectedIndex: index, open: !this.state.open })
}

render = () =>  {
  return (
    <div className="App">
      <div>
      <h1>Boston, MA Theatre District</h1>
      <button onClick={this.toggleDrawer} style={this.styles.menuButton} aria-label="Filter Locations">
      <i className="fa fa-bars"></i>
      </button>


      </div>
      <MapDisplay
        lat={this.state.lat}
        lon={this.state.lon}
        zoom={this.state.zoom}
        locations={this.state.filtered}
        selectedIndex={this.state.selectedIndex}
        clickListItem={this.clickListItem} />
        <ListDrawer
        locations={this.state.filtered}
        open={this.state.open}
        toggleDrawer={this.toggleDrawer}
        filterLocations={this.updateQuery}
        clickListItem={this.clickListItem} />
      </div>
    );
  }
}

export default App;
