const fs = require('fs-extra');
const { format } = require('date-fns');
const events = require('./../json-archive/events');
const talks = require('./../json-archive/talks');

// delete everything under out
fs.removeSync('out');
fs.mkdirSync('out');

// ensure paths
const eventsContentPath = 'out/events-content';
const eventsPath = `${eventsContentPath}/_events`;
const talksPath = `${eventsContentPath}/_talks`;

fs.mkdirSync(eventsContentPath);
fs.mkdirSync(eventsPath);
fs.mkdirSync(talksPath);

/*
for each event, create events-content/_events/tccc##.md file

---
layout: event
event: tccc##
title: TCCC ##
eventDate: 2019-04-19
---

*/

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
  fs.writeFile(`out/events-content/_events/${fileName}`, content, function(
    err
  ) {
    if (err) {
      throw err;
    }

    console.log(`${fileName}`);
  });
});

const talksFiles = talks.Results.map(talk => {
  const fileName = getTalkFileName(talk);
  const eventString = `tccc${talk.EventId.split('/')[1]}`;
  const speakerid = 'asdf';
  const content = `---
event: ${eventString}
title: ${talk.Title}
speaker: ${speakerid}
layout: talk
room: ${talk.Room}
time: ${talk.Hour}
---
${talk.Abstract}`;

  return { fileName, content, eventString };
});

talksFiles.forEach(async file => {
  const { fileName, content, eventString } = file;
  const folder = `out/events-content/_talks/${eventString}`;

  await fs.ensureDir(folder);

  fs.writeFileSync(`${folder}/${fileName}`, content);
  console.log(fileName);
});

function getTalkFileName(talk) {
  const originalTitle = talk.Title;
  const author = talk.Author;
  const titleWithoutSpaces = `${author
    .split(' ')
    .join('_')}_${originalTitle.split(' ').join('_')}`;
  return `${titleWithoutSpaces.replace(/\W/g, '').toLowerCase()}.html`;
}
