import React from "react";
import { Route,
         Link,
         Switch,
         HashRouter as Router,
         Redirect} from "react-router-dom";
import { Navbar, NavLink, NavProp } from "./components/Navbar";
import { Login } from "./components/Login";
import { Role, User, SessionToken, api } from "./api/api";
import { Beers } from "./components/Beer";
import { Brewers } from "./components/Brewers";
import "./styles/index.css";

type AppState = {
  links: NavLink[];
  loggedIn: boolean;
  user?: User;
}


export class App extends React.Component<{}, AppState> {
  constructor(props) {
    super(props);
    this.state = {
      links: [
        {url: "/", title: "Home"},{url: "/login", title: "Login"}
      ],
      loggedIn: false,
      user: null
    };
  }

  componentDidMount() {
    this.validate();
  }


  successfullLogin(token: SessionToken) {
    const links: NavLink[] = this.state.links.slice(0, 1);
    localStorage.setItem("token", token.token);
    this.setState({
      links: links.concat([
        {url: "/beers", title: "Beers"},
        {url: "/brewers", title: "Brewers"},
        {url: "/logout", title: "Logout" }
      ]),
      loggedIn: true
    })
    api.getUser(token.userId).then((user) => this.setState({user: user}))
  }

  logout() {
    api.logout().then(res => {
      if (res) {
        this.setState({
          links: this.state.links.slice(0, 1).concat([{url:"/login", title:"Login"}]),
          loggedIn: false,
          user: null,
        })
        localStorage.removeItem("token");
      }
    }).catch(err => {
      console.log(err);
      alert("Error logging out please try again");
    });
  }

  validate() {
    if (localStorage.getItem("token")) {
      api.validateSession(localStorage.getItem("token")).then((token) => {
        this.successfullLogin(token);
      })
    }
  }

  public render(): React.ReactNode {
    return (
      <Router>
        <Navbar links={this.state.links} />

        <div style={{
          lineHeight: "1.5em",
          maxWidth: 600,
          padding: 20,
          margin: "0 auto"
        }}>
        <Switch>
          <Route exact path="/">
            <Home user={this.state.user} />
          </Route>
          <Route path="/login">
            <Login onSuccess={(token: SessionToken) => this.successfullLogin(token) } />
          </Route>
          <Route path="/logout">
            <Logout
              loggedIn={this.state.loggedIn}
              onClick={() => this.logout() }
            />
          </Route>
          {this.state.loggedIn ? ([
            <Route key="/beers" path="/beers">
              <Beers />
            </Route>,
            <Route key="/brewers" path="/brewers">
              <Brewers />
            </Route>
          ]) : []
          }
        </Switch>
        </div>
      </Router>
    );
  }
}

function Logout(props: {loggedIn: boolean; onClick: () => void}): React.ReactElement {
  return (props.loggedIn ?
          <button onClick={() => props.onClick() }> Logout </button>
         : <Redirect to="/" />);
}

type HomeProps = {
  user?: User
}

function Home(props: HomeProps): React.ReactElement {
  return (
    <div >
      <h1>Hello, world!</h1>
      <p className="test">
        Welkom in het Hulan intake-project van Philippos.
      </p>
      { props.user ?
        (<p>
          Je bent ingelogd als {props.user.username}, en je heb de rol {Role[props.user.role]}.
        </p>) :
        (<p>
          Je bent nog niet ingelogd, om toegang te hebben moet je eerst <Link to="/login">inloggen</Link>.
        </p>)
      }

    </div>
    );
}
