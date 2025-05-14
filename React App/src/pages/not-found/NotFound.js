/**React App\src\pages\not-found\NotFound.js */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

class NotFound extends Component {
  render() {
    return (
      <div className="not-found-container text-center">
        <h1 className="display-4">404</h1>
        <p className="lead">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Go Back Home
        </Link>
      </div>
    );
  }
}

export default NotFound;
