const fetchArxiv = function (arxivId, callback) {
  return rp(process.env.ARXIV_API_URL + arxivId).then(parseApiResponseBody);
};

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

var formatArxivAsAttachment = function (arxivData, callback) {
  var attachment = {
    author_name: arxivData.authors.slice(0, 3).join(', '),
    title      : '[' + arxivData.id + '] ' + arxivData.title,
    title_link : arxivData.url,
    text       : arxivData.summary.split(' ').slice(0, 30).join(' ') + ' ...'
  };

  if (arxivData.authors.length > 3) {
    attachment.author_name += ' and others';
  }

  callback(null, attachment);
}


app.event([ARXIV_LINK], ({ event, say }) => {
  say(
    `Hey there <@${event.user}>!\nYour url is <@${event.links[0].url}>`
  );
  if (event.links[0].domain == 'arxiv.org') {
        return fetchArxiv(event.links[0].url.match(ARXIV_ID)[0]).then(arxiv => {
        say('formatArxivAsAttachment(arxiv).author_name');
      });
      }
});