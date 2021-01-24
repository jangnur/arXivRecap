# arXivRecap Slack bot

## Description

This code is sufficient to create a Slack bot which, triggered by a mention of an arXiv paper link in a channel, promptly provides its title, authors, abstract and a link to pdf.

---
## How to use the code

1. Host this code somewhere. Here we have used Glitch.
2. Create a new Slack app in your Slack team, using Slack API.
  - obtain credentials: SIGNING_SECRET (in _App Home_ tab) and OAUTH_TOKEN (_Permissions_ tab, under _Bot User OAuth Access Token_), and store them in .env file;
  - under _Event Subscriptions_: enable events, enter the URL of where the app is hosted (e.g. https://your-url.glitch.me/slack/events);
     - subscribe to bot events: _app\_mention_, _link\_shared_, _message.channels_, _message.im_;
     - add arxiv.org. to _App Unfurl Domains_.
  - under _Permissions_: add _chat:write_ and _links:read_.
3. Install the app to your workspace.

As the OAuth token is hardcoded, this app might not work in chats and channels which do not involve the user that installed the app.
