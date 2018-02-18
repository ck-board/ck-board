// components added to the manifest can be accessed in browser via /test/{componentName}

export default {
  // Button: {
  //   components: require('../components/Button/Button'),
  //   props: {
  //   }
  // },
  // RichTextEditor: {
  //   components: require('../components/RichTextEditor/RichTextEditor'),
  //   props: {}
  // },
  // ReplyOnReply: {
  //   components: require('../components/ReplyOnReply/ReplyOnReply'),
  //   props: {
  //     author: 'author',
  //     content: 'content'
  //   }
  // },
  // Tags: {
  //   components: require('../components/Tags/Tags'),
  //   props: {}
  // },
  CommunityAll: {
    component: require('../containers/CommunityAll'),
    props: {}
  },
  BoardList: {
    components: require('../components/BoardList/BoardList'),
    props: {}
  },
  Articles: {
    components: require('../containers/Articles'),
    props: { }
  }
};
