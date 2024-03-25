# Assignment 03 for CSCI E-114

What was the GraphQL mutation you used to create a discussion post?
```
mutation MyMutation {
  createDiscussionEntry(input: {discussionTopicId: "1013606", message: "Hello from Kai! This is my GraphQL Entry:)"}) {
    discussionEntry {
      id
      message
    }
  }
}
```

