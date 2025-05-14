// React App/src/pages/home/chat-list/ChatList.js

import React, { Component } from 'react';
import chatSocketServer from '../../../utils/chatSocketServer';
import './ChatList.css';

class ChatList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      selectedUserId: null,
      chatListUsers: []
    };
  }

  componentDidMount() {
    const { userId } = this.props;
    chatSocketServer.getChatList(userId);
    chatSocketServer.eventEmitter.on('chat-list-response', this.createChatListUsers);
  }

  componentWillUnmount() {
    chatSocketServer.eventEmitter.removeListener('chat-list-response', this.createChatListUsers);
  }

  createChatListUsers = (chatListResponse) => {
    if (!chatListResponse.error) {
      let updatedUsers = [...this.state.chatListUsers];

      if (chatListResponse.singleUser) {
        updatedUsers = updatedUsers.filter(u => u.id !== chatListResponse.chatList[0].id);
        updatedUsers.push(chatListResponse.chatList[0]);
      } else if (chatListResponse.userDisconnected) {
        updatedUsers = updatedUsers.map(user =>
          user.id === chatListResponse.userid ? { ...user, online: 'N' } : user
        );
      } else {
        updatedUsers = chatListResponse.chatList;
      }

      this.setState({ chatListUsers: updatedUsers });
    } else {
      console.error('❌ Error: Unable to load chat list. Redirecting to Login.');
    }

    this.setState({ loading: false });
  };

  selectedUser = (user) => {
    this.setState({ selectedUserId: user.id });
    this.props.updateSelectedUser(user);
  };

  render() {
    const { chatListUsers, selectedUserId, loading } = this.state;
    const noUsers = chatListUsers.length === 0;

    return (
      <>
        <ul className={`user-list ${noUsers ? 'visibility-hidden' : ''}`}>
          {chatListUsers.map(user => (
            <li
              key={user.id}
              className={selectedUserId === user.id ? 'active' : ''}
              onClick={() => this.selectedUser(user)}
            >
              {user.username}
              <span className={user.online === 'Y' ? 'online' : 'offline'}></span>
            </li>
          ))}
        </ul>

        <div
          className={`alert ${
            loading ? 'alert-info' : ''
          } ${!loading && noUsers ? '' : 'visibility-hidden'}`}
        >
          {loading
            ? 'Loading your chat list...'
            : 'No users available to chat.'}
        </div>
      </>
    );
  }
}

export default ChatList;
