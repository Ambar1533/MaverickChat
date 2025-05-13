/* React App\src\pages\home\conversation\Conversation.js */
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
      this.setState({
        conversations: [...this.state.conversations, socketResponse]
      });
      this.scrollMessageContainer();

      chatSocketServer.sendMessageRead({
        fromUserId: this.props.userId,
        toUserId: selectedUser.id,
        messageId: socketResponse._id
      });
    }
  };

  handleTypingIndicator = (data) => {
    const { newSelectedUser } = this.props;
    if (newSelectedUser && data.fromUserId === newSelectedUser.id) {
      this.setState({ isTyping: true, typingUser: data.username });
    }
  };

  handleStopTypingIndicator = (data) => {
    const { newSelectedUser } = this.props;
    if (newSelectedUser && data.fromUserId === newSelectedUser.id) {
      this.setState({ isTyping: false, typingUser: '' });
    }
  };

  handleMessageRead = ({ messageId }) => {
    const updated = this.state.conversations.map((msg) =>
      msg._id === messageId ? { ...msg, read: true } : msg
    );
    this.setState({ conversations: updated });
  };

  getMessages = async () => {
    try {
      const { userId, newSelectedUser } = this.props;
      const messageResponse = await chatHttpServer.getMessages(userId, newSelectedUser.id);
      if (!messageResponse.error) {
        this.setState({ conversations: messageResponse.messages });
        this.scrollMessageContainer();
      } else {
        console.error('Unable to fetch messages');
      }
      this.setState({ messageLoading: false });
    } catch (error) {
      console.error('Message fetch error:', error);
      this.setState({ messageLoading: false });
    }
  };

  sendMessage = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const message = event.target.value.trim();
      const { userId, newSelectedUser } = this.props;

      if (!message || !userId || !newSelectedUser) {
        return;
      }

      this.sendAndUpdateMessages({
        fromUserId: userId,
        message: message,
        toUserId: newSelectedUser.id,
        timestamp: new Date()
      });

      event.target.value = '';
      chatSocketServer.stopTyping({ fromUserId: userId, toUserId: newSelectedUser.id });
    }
  };

  handleTyping = (event) => {
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
        const fileMessage = {
          fromUserId: userId,
          toUserId: newSelectedUser.id,
          message: uploadRes.imageUrl,
          isFile: true,
          timestamp: new Date()
        };
        this.sendAndUpdateMessages(fileMessage);
        this.setState({ previewUrl: null, selectedFile: null });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  sendAndUpdateMessages(message) {
    try {
      chatSocketServer.sendMessage(message);
      this.setState({
        conversations: [...this.state.conversations, { ...message, read: false }]
      });
      this.scrollMessageContainer();
    } catch (error) {
      console.error(`Can't send your message`, error);
    }
  }

  scrollMessageContainer() {
    if (this.messageContainer.current !== null) {
      try {
        setTimeout(() => {
          this.messageContainer.current.scrollTop = this.messageContainer.current.scrollHeight;
        }, 100);
      } catch (error) {
        console.warn(error);
      }
    }
  }

  alignMessages(toUserId) {
    return this.props.userId !== toUserId;
  }

  formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getMessageUI() {
    return (
      <ul ref={this.messageContainer} className="message-thread">
        {this.state.conversations.map((conversation, index) => (
          <li
            className={`${this.alignMessages(conversation.toUserId) ? 'align-right' : ''}`}
            key={index}
          >
            <div>
              {conversation.isFile ? (
                conversation.message.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img src={conversation.message} alt="sent" className="chat-image" />
                ) : (
                  <a href={conversation.message} target="_blank" rel="noopener noreferrer">Download File</a>
                )
              ) : (
                conversation.message
              )}
            </div>
            <div className="message-meta">
              <span className="timestamp">{this.formatTimestamp(conversation.timestamp)}</span>
              {this.alignMessages(conversation.toUserId) && (
                <span className="read-status">{conversation.read ? '✔' : '🕓'}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  getInitiateConversationUI() {
    if (this.props.newSelectedUser !== null) {
      return (
        <div className="message-thread start-chatting-banner">
          <p className="heading">
            You haven't chatted with {this.props.newSelectedUser.username} in a while,
            <span className="sub-heading"> Say Hi.</span>
          </p>
        </div>
      );
    }
  }

  render() {
    const { messageLoading, selectedUser, isTyping, typingUser, previewUrl } = this.state;
    return (
      <>
        <div className={`message-overlay ${!messageLoading ? 'visibility-hidden' : ''}`}>
          <h3>
            {selectedUser && selectedUser.username ? 'Loading Messages' : ' Select a User to chat.'}
          </h3>
        </div>
        <div className={`message-wrapper ${messageLoading ? 'visibility-hidden' : ''}`}>
          <div className="message-container">
            <div className="opposite-user">
              Chatting with{' '}
              {this.props.newSelectedUser ? this.props.newSelectedUser.username : '----'}
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
                  onChange={this.handleFileChange}
                  accept="image/*,application/pdf"
                />
              </div>
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="preview" width="100" />
                  <button type="button" onClick={this.handleFileUpload}>Send Image</button>
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
