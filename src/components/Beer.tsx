import React from "react";

import { Beer as BeerData, api, beerTypeName, beerTypes, BeerType } from "../api/api";
import "../styles/Beer.css";
import Modal from "./Modal";
// @ts-ignore
import bottle from "../assets/beer-bottle.png";

type BeersState = {
  beers: BeerData[];
  selectedBeer?: BeerData;
}

export class Beers extends React.Component<{}, BeersState> {
  constructor(props) {
    super(props);
    this.state = {
      beers: [],
    }
  }

  componentDidMount() {
    api.getBeers()
       .then((res: BeerData[]) => this.setState({ beers: res }));
  }

  handleBeerClick(beer: BeerData) {
    this.setState({
      selectedBeer: beer,
    })
  }

  handleBeerDelete(beer: BeerData) {
    api.deleteBeer(beer).then(b => {
      const beers = this.state.beers.filter(i => i.id !== beer.id);
      this.setState({
        beers: beers,
      })
    });
  }

  handleEditClick(beer: BeerData) {
    let beers: BeerData[];
    if (this.state.beers.some(i => beer.id === i.id)) {
      beers = this.state.beers.map(i => i.id === beer.id ? beer : i);
    } else {
      beers = this.state.beers.concat([beer]);
    }
    this.setState({
      beers: beers,
    })
    this.handleEditClose();
  }

  handleEditClose() {
    this.setState({
      selectedBeer: null,
    })
  }

  render() {
    return (
      <div className="beer-list">
        <button onClick={() => this.handleBeerClick({
          id: "new",
          name: "",
          description: "",
          type: BeerType.PILSNER,
          percentage: 0
        })}>+</button>
        {this.state.beers.map((beer) => <Beer key={beer.id} beer={beer}
                                          onDelete={() => this.handleBeerDelete(beer) }
                                          onEdit={() => this.handleBeerClick(beer) } />)}

        <Modal onClose={() => this.handleEditClose()} show={Boolean(this.state.selectedBeer)}>
         <BeerEdit
           beer={this.state.selectedBeer}
           onSubmit={(beer) => this.handleEditClick(beer)} />
        </Modal>
      </div>
    )
  }
}

type BeerProps = {
  beer: BeerData;
  onEdit: () => void;
  onDelete: () => void;
}

function Beer(props: BeerProps): React.ReactElement {
  const beer = props.beer;
  return (
    <div className="beer">
      <div className="beer-details">
        <div className="beer-name">{beer.name}</div>
        <div className="beer-description-short"> {beerTypeName(beer.type)} - {beer.percentage}%</div>
        <div className="beer-description">
          {beer.description}
        </div>
      </div>
      <div className="beer-bottle">
        <img src={bottle}/>
      </div>
      <div className="edit-buttons">
        <button onClick={() => props.onEdit()}>Edit</button>
        <button onClick={() => props.onDelete()}>Delete</button>
      </div>
    </div>
  );
}

type BeerEditProps = {
  beer: BeerData;
  onSubmit: (brewer: BeerData) => void;
}

type BeerEditState = {
  beer: BeerData;
}

class BeerEdit extends React.Component<BeerEditProps, BeerEditState> {
  constructor(props) {
    super(props);
    this.state = {
      beer: props.beer,
    }
  }

  onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    let res: Promise<BeerData>;
    if (this.state.beer.id === "new") {
      res = api.createBeer(this.state.beer)
    } else {
      res = api.updateBeer(this.state.beer);
    }
    res.then((beer) => this.props.onSubmit(beer));
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    const beer: BeerData = Object.assign({}, this.state.beer);
    if ((name === "name" || name === "description") && typeof value === "string") {
      beer[name] = value;
    } else if (name === "type") {
      beer[name] = parseInt(value);
    } else if (name === "percentage") {
      beer[name] = parseFloat(value);
    }
    this.setState({
      beer: beer
    })
  }

  render() {
    const beer = this.state.beer;
    return (
      <form onSubmit={this.onSubmit}>
        <h2>Name</h2>
        <input
          type="text"
          name="name"
          placeholder="Enter name of beer"
          value={beer.name}
          onChange={this.handleInputChange}
          required
        />
        <h2>Description</h2>
        <textarea
          name="description"
          required
          onChange={this.handleInputChange}
          value={beer.description}
        />
        <h2>Type</h2>
        <select value={beer.type} onChange={this.handleInputChange} name="type">
          {
            beerTypes.map((type) => {
              return (
                <option key={type} value={type}>
                  {beerTypeName(type)}
                </option>
              );
            })
          }
        </select>
        <h2>Percentage</h2>
        <input
          type="number"
          name="percentage"
          placeholder="Enter name of beer"
          value={beer.percentage}
          onChange={this.handleInputChange}
          required
        />

        <input type="submit" value="Submit"/>
      </form>
    );
  }
}
