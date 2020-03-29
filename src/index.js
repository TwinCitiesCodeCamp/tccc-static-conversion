const fs = require('fs-extra');
const { format } = require('date-fns');
const events = require('./../json-archive/events');
const talks = require('./../json-archive/talks');
const sponsors = require('./../json-archive/sponsors');
const { removeExtraSpaces } = require('./util');

const createSpeakerFiles = require('./createSpeakerFiles');
const createSponsorFiles = require('./createSponsorFiles');
const createTalksFiles = require('./createTalksFiles');
const createEventFiles = require('./createEventFiles');

// delete everything under out
fs.removeSync('out');
fs.mkdirSync('out');

// ensure paths
const eventsContentPath = 'out/_collections';
const eventsPath = `${eventsContentPath}/_events`;
const talksPath = `${eventsContentPath}/_talks`;
const speakersPath = `${eventsContentPath}/_speakers`;
const sponsorsPath = `${eventsContentPath}/_sponsors`;

fs.mkdirSync(eventsContentPath);
fs.mkdirSync(eventsPath);
fs.mkdirSync(talksPath);
fs.mkdirSync(speakersPath);
fs.mkdirSync(sponsorsPath);

const approvedTalks = talks.Results.filter(
  t => t.Status === 'Approved' && t.EventId !== 'events/24'
).map(talk => {
  return { ...talk, Author: talk.Author === '' ? 'Unknown' : talk.Author };
});

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
createEventFiles(
  events.Results.filter(e => e.Number !== 24),
  eventsPath
);
createTalksFiles(approvedTalks, eventSpeakerMap, talksPath);
