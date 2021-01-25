// Partially derived from https://github.com/joebullard/slack-arxivbot.

const { App } = require("@slack/bolt");
require("dotenv").config(); // Get the API keys from .env file

var Promise = require('bluebird');
var rp = require('request-promise');
var parseString = Promise.promisify(require('xml2js').parseString);

// Configure the Slack App from our API keys
const app = new App({
  signingSecret: process.env.SIGNING_SECRET,
  token: process.env.OAUTH_TOKEN
}); 

// Send a request with the arXivId of the paper to arXiv API
const fetchArxiv = function (arxivId, callback) {
  return rp(process.env.ARXIV_API_URL + arxivId).then(parseApiResponseBody);
};

// Parse the response of arXiv API
const parseApiResponseBody = function (body) {
  return parseString(body).then(result => {
    if (!result.feed.entry) {
      throw new Error('ArXiv entry not found');
    }
    var entry = result.feed.entry[0];
    return {
      id      : entry.id ?
                entry.id[0].split('/').pop() :
                '{No ID}',
      url     : entry.id ?
                entry.id[0] :
                '{No url}',
      title   : entry.title ?
                entry.title[0].trim().replace(/\n/g, ' ') :
                '{No title}',
      summary : entry.summary ?
                entry.summary[0].trim().replace(/\n/g, ' ') :
                '{No summary}',
      authors : entry.author ?
                entry.author.map(function (a) { return a.name[0]; }) :
                '{No authors}',
      categories : entry.category ? entry.category.map(c => c.$.term) : [],
      updated_time : Date.parse(entry.updated) / 1000,
    };
  });
}

let seenMessages = new Set();

// Trigger the bot every time an arxiv link is posted
app.event('link_shared', ({ event, say }) => {
  
  console.log("LINK SHARED");
  console.log(event);
  if (seenRecently(event.message_ts)) return
  
  if (event.links[0].domain == 'arxiv.org') {
    const url = new URL(event.links[0].url);
    const arxivID = url.pathname.substring(5);
    fetchArxiv(arxivID).then(arxiv => {
      var title = "*Title:* " + arxiv.title;
      var authors = "*Authors:* " + arxiv.authors;
      var abstract = "*Abstract:* " + arxiv.summary;
      var paperUrl = "*PDF:* " + 'https://arxiv.org/pdf/' + arxivID + '.pdf';
      say(title + '\n' + authors + '\n' + abstract + '\n' + paperUrl);
      });
      }
  let timeStamp = event.message_ts;
});

function seenRecently(timeStamp) {
  /*
  This is to prevent issues with double posting messages when the app cold starts and slack does a retry
  */
  if (seenMessages.has(timeStamp)) return true;

  seenMessages.add(timeStamp);
  // Remove timestamp from set in 5 minutes
  setTimeout(() => seenMessages.delete(timeStamp), 5000 * 60);
  return false;
}




(async () => {
  await app.start(process.env.PORT || 3000); // Launch the bot
  console.log("⚡️ Bolt app is running!");
})();
