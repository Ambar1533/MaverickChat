// src/pages/authentication/registration/Registration.js

import { Component } from 'react';
import { Alert, Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { DebounceInput } from 'react-debounce-input';

import chatHttpServer from '../../../utils/chatHttpServer';
import './Registration.css';

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      usernameAvailable: true,
      registrationError: false,
    };
  }

  handleRegistration = async (event) => {
    event.preventDefault();

    const { username, password } = this.state;

    if (!username || !password || !this.state.usernameAvailable) {
      this.setState({ registrationError: true });
      return;
    }

    this.props.loadingState(true);
    try {
      const response = await chatHttpServer.register({ username, password });
      this.props.loadingState(false);

      if (response?.error) {
        this.setState({ registrationError: true });
      } else {
        chatHttpServer.setLS('userid', response.userId);
        this.props.history.push('/home');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      this.props.loadingState(false);
      this.setState({ registrationError: true });
    }
  };

  checkUsernameAvailability = async (event) => {
    const username = event.target.value.trim();

    this.setState({ username });

    if (!username) {
      this.setState({ usernameAvailable: true });
      return;
    }

    this.props.loadingState(true);
    try {
      const response = await chatHttpServer.checkUsernameAvailability(username);
      this.setState({
        usernameAvailable: !response.error,
      });
    } catch (error) {
      console.error('Username check failed:', error);
      this.setState({ usernameAvailable: false });
    } finally {
      this.props.loadingState(false);
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value, registrationError: false });
  };

  render() {
    const { username, password, usernameAvailable, registrationError } = this.state;

    return (
      <Form className="auth-form" onSubmit={this.handleRegistration}>
        <Form.Group controlId="formUsername">
          <DebounceInput
            className="form-control"
            type="text"
            name="username"
            value={username}
            placeholder="Enter username"
            minLength={2}
            debounceTimeout={300}
            onChange={this.checkUsernameAvailability}
          />
          {!usernameAvailable && username && (
            <Alert className="username-availability-warning" variant="danger">
              <strong>{username}</strong> is already taken, try another username.
            </Alert>
          )}
        </Form.Group>

        <Form.Group controlId="formPassword">
          <Form.Control
            type="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={this.handleInputChange}
            required
          />
        </Form.Group>

        {registrationError && (
          <Alert variant="danger">Unable to register. Please try again later.</Alert>
        )}

        <Button variant="primary" type="submit">
          Registration
        </Button>
      </Form>
    );
  }
}

export default withRouter(Registration);
