// src/pages/authentication/login/Login.js

import React, { Component } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import chatHttpServer from '../../../utils/chatHttpServer';
import './Login.css';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loginError: false,
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value, loginError: false });
  };

  handleLogin = async (event) => {
    event.preventDefault();

    const { username, password } = this.state;
    if (!username || !password) {
      this.setState({ loginError: true });
      return;
    }

    try {
      this.props.loadingState(true);
      const response = await chatHttpServer.login({ username, password });
      this.props.loadingState(false);

      if (response?.error) {
        this.setState({ loginError: true });
      } else {
        // Save user ID and redirect
        chatHttpServer.setLS('userid', response.userId);
        this.props.history.push('/home');
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.props.loadingState(false);
      this.setState({ loginError: true });
    }
  };

  render() {
    const { username, password, loginError } = this.state;

    return (
      <Form className="auth-form" onSubmit={this.handleLogin}>
        {loginError && (
          <Alert variant="danger">Invalid login details. Please try again.</Alert>
        )}

        <Form.Group controlId="loginUsername">
          <Form.Control
            type="text"
            name="username"
            value={username}
            placeholder="Enter username"
            onChange={this.handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="loginPassword">
          <Form.Control
            type="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={this.handleInputChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    );
  }
}

export default withRouter(Login);
