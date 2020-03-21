const fs = require('fs-extra');
const { format } = require('date-fns');
const events = require('./../json-archive/events');
const talks = require('./../json-archive/talks');
const sponsors = require('./../json-archive/sponsors');
const {
  cleanseLongText,
  removeExtraSpaces,
  removeDoubleUnderscores,
  getTime
} = require('./util');

const createSpeakerFiles = require('./createSpeakerFiles');
const createSponsorFiles = require('./createSponsorFiles');

// delete everything under out
fs.removeSync('out');
fs.mkdirSync('out');

// ensure paths
const eventsContentPath = 'out/events-content';
const eventsPath = `${eventsContentPath}/_events`;
const talksPath = `${eventsContentPath}/_talks`;
const speakersPath = `${eventsContentPath}/_speakers`;
const sponsorsPath = `${eventsContentPath}/_sponsors`;

fs.mkdirSync(eventsContentPath);
fs.mkdirSync(eventsPath);
fs.mkdirSync(talksPath);
fs.mkdirSync(speakersPath);
fs.mkdirSync(sponsorsPath);

const approvedTalks = talks.Results.filter(t => t.Status === 'Approved').map(
  talk => {
    return { ...talk, Author: talk.Author === '' ? 'Unknown' : talk.Author };
  }
);

// extract speakers from talks
const eventSpeakerMap = approvedTalks.map(talk => {
  return {
    eventId: `tccc${talk.EventId.split('/')[1]}`,
    speakerId: talk.Author.split(' ').join(''),
    name: removeExtraSpaces(talk.Author),
    bio: talk.AuthorBio,
    email: talk.AuthorEmail,
    url: talk.AuthorUrl,
    twitter: talk.AuthorTwitter,
    github: talk.AuthorGitHub,
    image: talk.PictureUrl,
    talkId: talk['@metadata']['@id']
  };
});

const distinctEvents = [...new Set(eventSpeakerMap.map(s => s.eventId))];

createSpeakerFiles(distinctEvents, eventSpeakerMap, speakersPath);
createSponsorFiles(distinctEvents, sponsors.Results, sponsorsPath);

const eventsFiles = events.Results.map(e => {
  const number = e.Number;
  const dateString = format(new Date(e.DateTime), 'yyyy-MM-dd');
  const fileName = `tccc${number}.html`;
  const content = `---
layout: event
event: tccc${number}
title: TCCC ${number}
eventDate: ${dateString}
---`;
  return { fileName, content };
});

eventsFiles.forEach(file => {
  const { fileName, content } = file;
  fs.writeFileSync(`out/events-content/_events/${fileName}`, content);
  console.log(`${fileName}`);
});

const talksFiles = approvedTalks.map(talk => {
  const fileName = getTalkFileName(talk);
  const eventString = `tccc${talk.EventId.split('/')[1]}`;
  const speakerid = eventSpeakerMap.find(
    e => e.eventId === eventString && e.talkId === talk['@metadata']['@id']
  ).speakerId;

  const content = `---
event: ${eventString}
title: "${cleanseLongText(talk.Title.split('\n').join(' '))}"
speaker: ${speakerid}
layout: talk
room: ${talk.Room}
time: ${getTime(talk.Hour)}
---
${talk.Abstract}`;

  return { fileName, content, eventString };
});

talksFiles.forEach(async file => {
  const { fileName, content, eventString } = file;
  const folder = `out/events-content/_talks/${eventString}`;

  await fs.ensureDir(folder);

  fs.writeFileSync(`${folder}/${fileName}`, content);
  // console.log(fileName);
});

function getTalkFileName(talk) {
  const title = removeExtraSpaces(talk.Title.trim());
  const author = removeExtraSpaces(talk.Author.trim());

  const cleanTitle = removeDoubleUnderscores(
    title
      .split(' ')
      .join('_')
      .replace(/\W/g, '')
      .toLowerCase()
  );

  const cleanAuthor = removeDoubleUnderscores(
    author
      .split(' ')
      .join('_')
      .replace(/\W/g, '')
      .toLowerCase()
  );

  return `${cleanAuthor}_${cleanTitle}.html`;
}
