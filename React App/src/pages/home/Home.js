/* eslint-disable jsx-a11y/anchor-is-valid */
// React App/src/pages/home/Home.js

import React, { Component } from 'react';
import { withRouter } from "react-router-dom";

import chatSocketServer from '../../utils/chatSocketServer';
import chatHttpServer from '../../utils/chatHttpServer';

import ChatList from './chat-list/ChatList';
import Conversation from './conversation/Conversation';

import './Home.css';

class Home extends Component {
  userId = null;

  state = {
    isOverlayVisible: true,
    username: '______',
    selectedUser: null
  };

  setRenderLoadingState = (loadingState) => {
    this.setState({ isOverlayVisible: loadingState });
  };

  async componentDidMount() {
    try {
      this.setRenderLoadingState(true);

      this.userId = await chatHttpServer.getUserId();
      const response = await chatHttpServer.userSessionCheck(this.userId);

      if (response.error) {
        this.props.history.push(`/`);
        return;
      }

      this.setState({ username: response.username });
      chatHttpServer.setLS('username', response.username);
      chatSocketServer.establishSocketConnection(this.userId);

      this.setRenderLoadingState(false);
    } catch (error) {
      console.error('Session check error:', error);
      this.setRenderLoadingState(false);
      this.props.history.push(`/`);
    }
  }

  logout = async () => {
    try {
      await chatHttpServer.removeLS();

      chatSocketServer.logout({ userId: this.userId });

      chatSocketServer.eventEmitter.once('logout-response', () => {
        this.props.history.push(`/`);
      });
    } catch (error) {
      console.error('Logout error:', error);
      alert('This App is broken. We are working on it. Please try again later.');
    }
  };

  updateSelectedUser = (user) => {
    this.setState({ selectedUser: user });
  };

  render() {
    const { isOverlayVisible, username, selectedUser } = this.state;

    return (
      <div className="App">
        <div className={`${isOverlayVisible ? 'overlay' : 'visibility-hidden'}`}>
          <h1>Loading</h1>
        </div>

        <header className="app-header">
          <nav className="navbar navbar-expand-md">
            <h4>Hello {username}</h4>
          </nav>
          <ul className="nav justify-content-end">
            <li className="nav-item">
              <button className="nav-link btn btn-link" onClick={this.logout}>
                Logout
              </button>
            </li>
          </ul>
        </header>

        <main role="main" className="container content">
          <div className="row chat-content">
            <div className="col-3 chat-list-container">
              {!isOverlayVisible && (
                <ChatList userId={this.userId} updateSelectedUser={this.updateSelectedUser} />
              )}
            </div>
            <div className="col-8 message-container">
              {!isOverlayVisible && (
                <Conversation userId={this.userId} newSelectedUser={selectedUser} />
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default withRouter(Home);
