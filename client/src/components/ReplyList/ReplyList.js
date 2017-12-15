import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TransitionGroup from 'react-transition-group-plus';
import Reply from '../Reply';


class ReplyList extends Component {

  render() {
    const { comments } = this.props;
    console.log(comments);
    const mapToComponents = (data) => {
      return data.map((comment, index) => {
        return (
          !comment.deleted &&
          <Reply
            commentAuthor={comment.author}
            postAuthor={this.props.activePost.author}
            comment={comment.memo}
            date={comment.date}
            key={comment.date}
            postId={this.props.activePost._id}
            isEdited={comment.isEdited}
            likes={comment.likes}
            disLikes={comment.disLikes}
            index={index}
            form={`form-${index}`}
            openUserInfoModal={this.props.openUserInfoModal}
            />
        );
      });
    };

    return (
      <div>
        <TransitionGroup component="div">
          {mapToComponents(comments)}
        </TransitionGroup>
      </div>
    );
  }
}

ReplyList.defaultProps = {
  comments: []
};

ReplyList.propTypes = {
  comments: PropTypes.array,
};

export default ReplyList;
