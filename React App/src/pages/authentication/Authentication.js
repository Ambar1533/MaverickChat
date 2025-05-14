// src/pages/authentication/Authentication.js

import React, { Component } from 'react';
import { Tabs, Tab, Spinner } from 'react-bootstrap';

import Login from './login/Login';
import Registration from './registration/Registration';

import './Authentication.css';

class Authentication extends Component {
  state = {
    loadingState: false
  };

  setRenderLoadingState = (loadingState) => {
    this.setState({ loadingState });
  };

  render() {
    const { loadingState } = this.state;

    return (
      <div className="container">
        <div
          className={`overlay auth-loading ${loadingState ? '' : 'visibility-hidden'}`}
          role="status"
          aria-live="polite"
        >
          <Spinner animation="border" role="status" variant="primary" />
          <span className="loading-text ms-2">Loading...</span>
        </div>

        <div className="authentication-screen">
          <Tabs variant="pills" defaultActiveKey="login" className="mb-3">
            <Tab eventKey="login" title="Login">
              <Login loadingState={this.setRenderLoadingState} />
            </Tab>
            <Tab eventKey="registration" title="Registration">
              <Registration loadingState={this.setRenderLoadingState} />
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Authentication;
