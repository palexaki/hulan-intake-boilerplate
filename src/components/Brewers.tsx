import React from "react";
import { api, beerTypeName, Brewer as BrewerData, Beer } from "../api/api";
import Modal from "./Modal";
import "../styles/Brewers.css";

type BrewersState = {
  brewers: BrewerData[];
  beers: Beer[];
  selectedBrewer?: BrewerData;
}

export class Brewers extends React.Component<{}, BrewersState> {
  constructor(props) {
    super(props);
    this.state = {
      brewers: [],
      beers: []
    }
  }

  componentDidMount() {
    api.getBrewers(true)
       .then((res: BrewerData[]) => this.setState({ brewers: res }));
    api.getBeers()
       .then((res) => this.setState({ beers: res }));
  }

  handleBrewerClick(brewer: BrewerData) {
    this.setState({
      selectedBrewer: brewer,
    })
  }

  handleBrewerDelete(brewer: BrewerData) {
    api.deleteBrewer(brewer)
       .then(b => {
         if (brewer) {
          const brewers = this.state.brewers.filter(i => i.id !== brewer.id);
          this.setState({
            brewers: brewers
          })
         }
       })
  }

  handleEditClick(brewer: BrewerData) {
    let brewers: BrewerData[];
    if (!brewer.beers) {
      brewer.beers = brewer.beerIds.map(id => this.state.beers.find(beer => id === beer.id));
    }
    if (this.state.brewers.some(i => brewer.id === i.id)) {
      brewers = this.state.brewers.map(i => i.id === brewer.id ? brewer : i);
    } else {
      brewers = this.state.brewers.concat([brewer]);
    }
    this.setState({
      brewers: brewers,
    })
    this.handleEditClose();
  }

  handleEditClose() {
    this.setState({
      selectedBrewer: null,
    })
  }

  render() {
    return (
      <div>
        <button onClick={() => this.handleBrewerClick({
          id: "new",
          name: "",
          city: "",
          beerIds: []
        })}>+</button>
        {this.state.brewers
             .map(brewer => <Brewer key={brewer.id} brewer={brewer}
                              onEdit={() => this.handleBrewerClick(brewer)}
                              onDelete={() => this.handleBrewerDelete(brewer)} />)}

        <Modal onClose={() => this.handleEditClose()} show={Boolean(this.state.selectedBrewer)}>
         <BrewerEdit
           beers={this.state.beers}
           brewer={this.state.selectedBrewer}
           onSubmit={(brewer) => this.handleEditClick(brewer)}/>
        </Modal>
      </div>
    );
  }
}

type BrewerProps = {
  brewer: BrewerData;
  onEdit: () => void;
  onDelete: () => void;
}

function Brewer(props: BrewerProps): React.ReactElement {
  const brewer = props.brewer;
  return (
    <div className="brewer">
      <div className="brewer-details">
        <div className="brewer-name">{brewer.name}</div>
        <div className="brewer-city">{brewer.city}</div>
      </div>
      <div className="brewer-beers">
        {brewer.beers ? brewer.beers.map(beer =>
          <div key={beer.id} className="brewer-beer">
            <div className="beer-name"> - {beer.name}</div>
            <div className="beer-description-short">
              {beerTypeName(beer.type) + " - " + beer.percentage.toString() + "%"}
            </div>
          </div>) : undefined}
      </div>
      <div className="edit-buttons">
        <button onClick={() => props.onEdit()}>Edit</button>
        <button onClick={() => props.onDelete()}>Delete</button>
      </div>
    </div>
  );
}

type BrewerEditProps = {
  brewer: BrewerData;
  onSubmit: (brewer: BrewerData) => void;
  beers: Beer[];
}

type BrewerEditState = {
  brewer: BrewerData;
}

class BrewerEdit extends React.Component<BrewerEditProps, BrewerEditState> {
  constructor(props: BrewerEditProps) {
    super(props);
    this.state = {
      brewer: props.brewer,
    };
  }

  handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    let brewer: Promise<BrewerData>;
    if (this.state.brewer.id === "new") {
      brewer = api.createBrewer(this.state.brewer);
    } else {
      brewer = api.updateBrewer(this.state.brewer);
    }
    brewer.then((b) => this.props.onSubmit(b));
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    const brewer: BrewerData = Object.assign({}, this.state.brewer);
    if ((name === "name" || name === "city") && typeof value === "string") {
      brewer[name] = value;
    } else if ((name === "beerIds") && value !== "") {
      let beerIds = brewer.beerIds;
      beerIds = beerIds.includes(value)
                     ? beerIds.filter(i => i != value)
                     : beerIds.concat([value]);

      // Database does not have internal consistency, so we remove beers that do not exist anymore
      brewer.beerIds = beerIds.filter(i => this.props.beers.some(beer => beer.id === i));
    }
    this.setState({
      brewer: brewer,
    })
  }

  render() {
    const brewer = this.state.brewer;
    return (
      <form onSubmit={this.handleSubmit}>
        <h2>Name</h2>
        <input
          type="text" name="name"
          placeholder="Enter name of brewer"
          value={brewer.name}
          onChange={this.handleInputChange}
          required
        />
        <h2>City</h2>
        <input
          type="text" name="city"
          placeholder="Enter city of brewer"
          value={brewer.city}
          onChange={this.handleInputChange}
          required
        />
        <h2>Beers</h2>
          {this.props.beers.map(beer => {
            return (
              <label className="container" key={beer.id}>
                  {beer.name}
                <input
                  type="checkbox" name="beerIds"
                  onChange={this.handleInputChange}
                  checked={brewer.beerIds.includes(beer.id)}
                  value={beer.id} />
                <span className="checkmark"/>
              </label>);
          })}
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}
