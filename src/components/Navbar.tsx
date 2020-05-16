import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export interface NavLink {
  url: string;
  title: string;
}

export interface NavProp  {links: NavLink[]}

export class Navbar extends React.Component<NavProp,
                                            {sidebarToggled:boolean}> {
  constructor(props:any) {
    super(props);
    this.state = {
      sidebarToggled: false,
    };
  }

  toggleSidebar():void {
    this.setState({
      sidebarToggled: !this.state.sidebarToggled,
    })
  }

  public render(): React.ReactNode {
    let sidebarStyle = this.state.sidebarToggled ? { left: 0 } : {} ;
    return (
      <nav>
        <SidebarToggle onClick={() => this.toggleSidebar()}/>

        <SideBar style={sidebarStyle} onClick={() => this.toggleSidebar()}>
          <ul>
            {this.props.links.map(({url, title}) => {
              return (
                <li key={url}><Link onClick={() => this.toggleSidebar() } to={url}>{title}</Link></li>
              );
            }
            )}
          </ul>
        </SideBar>

        <div className="navbar-header">
           Hulan Bier
        </div>
      </nav>
    );
  }
}

type OnClickEvent = {
  onClick: () => void;
}

class SideBar extends React.Component {
  props: {
    readonly children: React.ReactElement;
    style: React.CSSProperties;
  } & OnClickEvent;
  public render(): React.ReactNode {
    return (
      <div style={this.props.style} className="navbar-sidebar">
        <div className="sidebar-topbar">
          <div className="sidebar-title">
            Pages
          </div>
          <button className="navbar-close" onClick={()=>this.props.onClick()}>×</button>
        </div>
        {this.props.children}
      </div>
    );
  }
}

function SidebarToggle(props: OnClickEvent): React.ReactElement {
  return (
    <button className="navbar-toggle" onClick={() => props.onClick() } >
      <span className="icon-bar"/>
      <span className="icon-bar"/>
      <span className="icon-bar"/>
    </button>
  )

}
