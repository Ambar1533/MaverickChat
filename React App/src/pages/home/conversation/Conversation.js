// React App/src/pages/home/conversation/Conversation.js

import React, { Component } from 'react';
import chatHttpServer from '../../../utils/chatHttpServer';
import chatSocketServer from '../../../utils/chatSocketServer';
import { uploadFile } from '../../../utils/uploadAPI';

import './Conversation.css';

class Conversation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messageLoading: true,
      conversations: [],
      selectedUser: null,
      isTyping: false,
      typingUser: '',
      previewUrl: null,
      selectedFile: null
    };
    this.messageContainer = React.createRef();
    this.typingTimeout = null;
  }

  componentDidMount() {
    chatSocketServer.receiveMessage();
    chatSocketServer.socket.on('typing', this.handleTypingIndicator);
    chatSocketServer.socket.on('stopTyping', this.handleStopTypingIndicator);
    chatSocketServer.socket.on('message-read', this.handleMessageRead);
    chatSocketServer.eventEmitter.on('add-message-response', this.receiveSocketMessages);
  }

  componentWillUnmount() {
    chatSocketServer.eventEmitter.removeListener('add-message-response', this.receiveSocketMessages);
    chatSocketServer.socket.off('typing', this.handleTypingIndicator);
    chatSocketServer.socket.off('stopTyping', this.handleStopTypingIndicator);
    chatSocketServer.socket.off('message-read', this.handleMessageRead);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.newSelectedUser === null ||
      this.props.newSelectedUser.id !== prevProps.newSelectedUser.id
    ) {
      this.getMessages();
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (state.selectedUser === null || state.selectedUser.id !== props.newSelectedUser.id) {
      return {
        selectedUser: props.newSelectedUser
      };
    }
    return null;
  }

  receiveSocketMessages = (socketResponse) => {
    const { selectedUser } = this.state;
    if (selectedUser && selectedUser.id === socketResponse.fromUserId) {
      this.setState(prevState => ({
        conversations: [...prevState.conversations, socketResponse]
      }));
      this.scrollMessageContainer();

      chatSocketServer.sendMessageRead({
        fromUserId: this.props.userId,
        toUserId: selectedUser.id,
        messageId: socketResponse._id
      });
    }
  };

  handleTypingIndicator = (data) => {
    if (this.props.newSelectedUser && data.fromUserId === this.props.newSelectedUser.id) {
      this.setState({ isTyping: true, typingUser: data.username });
    }
  };

  handleStopTypingIndicator = (data) => {
    if (this.props.newSelectedUser && data.fromUserId === this.props.newSelectedUser.id) {
      this.setState({ isTyping: false, typingUser: '' });
    }
  };

  handleMessageRead = ({ messageId }) => {
    this.setState(prevState => ({
      conversations: prevState.conversations.map(msg =>
        msg._id === messageId ? { ...msg, read: true } : msg
      )
    }));
  };

  getMessages = async () => {
    try {
      const { userId, newSelectedUser } = this.props;
      const response = await chatHttpServer.getMessages(userId, newSelectedUser.id);
      if (!response.error) {
        this.setState({ conversations: response.messages });
        this.scrollMessageContainer();
      } else {
        console.error('Unable to fetch messages');
      }
      this.setState({ messageLoading: false });
    } catch (error) {
      console.error('Fetch error:', error);
      this.setState({ messageLoading: false });
    }
  };

  sendMessage = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const message = event.target.value.trim();
      const { userId, newSelectedUser } = this.props;

      if (!message || !userId || !newSelectedUser) return;

      this.sendAndUpdateMessages({
        fromUserId: userId,
        message,
        toUserId: newSelectedUser.id,
        timestamp: new Date()
      });

      event.target.value = '';
      chatSocketServer.stopTyping({ fromUserId: userId, toUserId: newSelectedUser.id });
    }
  };

  handleTyping = () => {
    const { userId, newSelectedUser } = this.props;
    if (!newSelectedUser) return;

    chatSocketServer.typing({
      fromUserId: userId,
      toUserId: newSelectedUser.id,
      username: this.props.username || 'User'
    });

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      chatSocketServer.stopTyping({ fromUserId: userId, toUserId: newSelectedUser.id });
    }, 1000);
  };

  handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      this.setState({ previewUrl, selectedFile: file });
    }
  };

  handleFileUpload = async () => {
    const { userId, newSelectedUser } = this.props;
    const { selectedFile } = this.state;

    if (!selectedFile || !userId || !newSelectedUser) return;

    try {
      const uploadRes = await uploadFile(selectedFile);
      if (uploadRes && uploadRes.imageUrl) {
        this.sendAndUpdateMessages({
          fromUserId: userId,
          toUserId: newSelectedUser.id,
          message: uploadRes.imageUrl,
          isFile: true,
          timestamp: new Date()
        });
        this.setState({ previewUrl: null, selectedFile: null });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  sendAndUpdateMessages = (message) => {
    try {
      chatSocketServer.sendMessage(message);
      this.setState(prevState => ({
        conversations: [...prevState.conversations, { ...message, read: false }]
      }));
      this.scrollMessageContainer();
    } catch (error) {
      console.error(`Message send error`, error);
    }
  };

  scrollMessageContainer = () => {
    if (this.messageContainer.current) {
      setTimeout(() => {
        this.messageContainer.current.scrollTop = this.messageContainer.current.scrollHeight;
      }, 100);
    }
  };

  alignMessages = (toUserId) => {
    return this.props.userId !== toUserId;
  };

  formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  getMessageUI = () => {
    return (
      <ul ref={this.messageContainer} className="message-thread">
        {this.state.conversations.map((msg, index) => (
          <li key={index} className={this.alignMessages(msg.toUserId) ? 'align-right' : ''}>
            <div>
              {msg.isFile ? (
                msg.message.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={msg.message} alt="sent file" className="chat-image" />
                ) : (
                  <a href={msg.message} target="_blank" rel="noopener noreferrer">Download File</a>
                )
              ) : (
                msg.message
              )}
            </div>
            <div className="message-meta">
              <span className="timestamp">{this.formatTimestamp(msg.timestamp)}</span>
              {this.alignMessages(msg.toUserId) && (
                <span className="read-status">{msg.read ? '✔' : '🕓'}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  getInitiateConversationUI = () => {
    const { newSelectedUser } = this.props;
    if (newSelectedUser) {
      return (
        <div className="message-thread start-chatting-banner">
          <p className="heading">
            You haven't chatted with {newSelectedUser.username} yet,{' '}
            <span className="sub-heading">Say Hi 👋</span>
          </p>
        </div>
      );
    }
    return null;
  };

  render() {
    const { messageLoading, selectedUser, isTyping, typingUser, previewUrl } = this.state;
    return (
      <>
        <div className={`message-overlay ${!messageLoading ? 'visibility-hidden' : ''}`}>
          <h3>
            {selectedUser?.username ? 'Loading Messages...' : 'Select a user to start chatting'}
          </h3>
        </div>

        <div className={`message-wrapper ${messageLoading ? 'visibility-hidden' : ''}`}>
          <div className="message-container">
            <div className="opposite-user">
              Chatting with {this.props.newSelectedUser?.username || '----'}
            </div>

            {this.state.conversations.length > 0
              ? this.getMessageUI()
              : this.getInitiateConversationUI()}

            {isTyping && <div className="typing-indicator">{typingUser} is typing...</div>}
          </div>

          <div className="message-typer">
            <form>
              <textarea
                className="message form-control"
                placeholder="Type and hit Enter"
                onKeyPress={this.sendMessage}
                onChange={this.handleTyping}
              ></textarea>

              <div className="file-upload">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={this.handleFileChange}
                />
              </div>

              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="preview" width="100" />
                  <button type="button" onClick={this.handleFileUpload}>
                    Send Image
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </>
    );
  }
}

export default Conversation;
