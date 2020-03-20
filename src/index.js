const fs = require('fs-extra');
const { format, setHours, setMinutes } = require('date-fns');
const events = require('./../json-archive/events');
const talks = require('./../json-archive/talks');
const sponsors = require('./../json-archive/sponsors');
const htmlencode = require('htmlencode');
const htmlencoder = new htmlencode.Encoder('numerical');

// delete everything under out
fs.removeSync('out');
fs.mkdirSync('out');

// ensure paths
const eventsContentPath = 'out/events-content';
const dataPath = 'out/_data';
const eventsPath = `${eventsContentPath}/_events`;
const talksPath = `${eventsContentPath}/_talks`;
const speakersPath = `${dataPath}/speakers`;
const sponsorsPath = `${dataPath}/sponsors`;

fs.mkdirSync(eventsContentPath);
fs.mkdirSync(dataPath);
fs.mkdirSync(eventsPath);
fs.mkdirSync(talksPath);
fs.mkdirSync(speakersPath);
fs.mkdirSync(sponsorsPath);

const approvedTalks = talks.Results.filter(t => t.Status === 'Approved');

// extract speakers from talks
const eventSpeakers = approvedTalks.map(talk => {
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

const distinctEvents = [...new Set(eventSpeakers.map(s => s.eventId))];

// create speaker event files
distinctEvents.forEach(eventId => {
  const speakersForEvent = eventSpeakers.filter(
    speaker => speaker.eventId === eventId
  );

  const speakerData = speakersForEvent.map(s => {
    return `${s.speakerId}:
  name: ${s.name}
  image: ${getYamlString(s.image)}
  bio: "${cleanseBio(s.bio)}"
  speakerUrl: ${getYamlString(s.url)}
  twitter: ${getTwitterString(s.twitter)}
  github: ${getYamlString(s.github)}
  event: ${eventId}`;
  });
  const speakerFileContent = speakerData.join('\n\n');
  const filePath = `${speakersPath}/${eventId}.yml`;
  fs.writeFileSync(filePath, speakerFileContent);
  console.log(filePath);
});

// create sponsor event files
distinctEvents.forEach(eventId => {
  const sponsorsForEvent = sponsors.Results.filter(
    sponsor => 'tccc' + sponsor.EventId.split('/')[1] === eventId
  );

  const sponsorData = sponsorsForEvent.map(s => {
    return `- name: ${s.Name}
  level: ${s.Level}
  image: ${s.Logo}
  link: ${s.Url}
  twitter: ${getTwitterString(s.Twitter)}
  description: "${cleanseBio(s.About)}"`;
  });

  const sponsorFileContent = sponsorData.join('\n\n');
  const filePath = `${sponsorsPath}/${eventId}.yml`;
  fs.writeFileSync(filePath, sponsorFileContent);
  console.log(filePath);
});

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
  const speakerid = eventSpeakers.find(
    e => e.eventId === eventString && e.talkId === talk['@metadata']['@id']
  ).speakerId;

  const content = `---
event: ${eventString}
title: "${cleanseBio(talk.Title.split('\n').join(' '))}"
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

function removeExtraSpaces(string) {
  return string.replace(/  +/g, ' ');
}

function removeDoubleUnderscores(string) {
  return string.replace(/_+/g, '_');
}

function cleanseBio(bio) {
  return removeExtraSpaces(htmlencoder.htmlEncode(bio.trim()));
}

function getYamlString(att) {
  return !att ? '' : `${att}`;
}

function getTwitterString(t) {
  if (!t) return '';
  if (t.charAt(0) === '@') return getYamlString(t.substring(1));
  return getYamlString(t);
}

function getTime(hour) {
  if (!hour) return '';
  const hourNumber = parseFloat(hour);
  if (hourNumber === 0) return '';
  const minutes = (hourNumber % 1) * 60;
  const now = new Date();
  const newDate = setMinutes(setHours(now, hour), minutes);
  return format(newDate, 'h:mm bbbb');
}
