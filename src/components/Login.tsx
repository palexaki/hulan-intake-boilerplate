import React  from "react";
import { Redirect } from "react-router-dom";
import { SessionToken, Credentials, api } from "../api/api"

export type LoginState = {
  credentials?: Credentials;
  onSuccess?: (token: SessionToken) => void;
  success?: boolean;
}

type LoginProps = {
  onSuccess: (token: SessionToken) => void;
}

function isKeyofLoginState(name: string): name is keyof Credentials {
  return ["username", "password"].includes(name);
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props:LoginProps) {
    super(props)
    this.state = {
      credentials: {
        username : '',
        password: ''
      },
      onSuccess: props.onSuccess,
      success: false,
    };
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    const credentials = Object.assign({},this.state.credentials);
    if (isKeyofLoginState(name)) {
      credentials[name] = value;
      this.setState({
        credentials: credentials
      });
    }
  }

  onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    api.login(this.state.credentials).then( token => {
      this.state.onSuccess(token);
      this.setState({
        success: true
      })
    }).catch(err => {
      console.error(err);
      alert("Error logging in please try again");
    });
  }

  render() {
    return (
      this.state.success ?
           <Redirect to="/" />
         : <form onSubmit={this.onSubmit}>
           <h1>Login Below!</h1>
           <input
             type="text"
             name="username"
             placeholder="Enter username"
             value={this.state.credentials.username}
             onChange={this.handleInputChange}
             required
           />
           <input
             type="password"
             name="password"
             placeholder="Enter password"
             value={this.state.credentials.password}
             onChange={this.handleInputChange}
             required
           />
           <input type="submit" value="Submit"/>
         </form>
    );
  }
}
