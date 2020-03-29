const fs = require('fs-extra');
const {
  cleanseLongText,
  getTime,
  removeExtraSpaces,
  removeDoubleDashes
} = require('./util');

const createTalksFiles = (approvedTalks, eventSpeakerMap, talksPath) => {
  const talksFiles = approvedTalks.map(talk => {
    const fileName = getTalkFileName(talk);
    const eventString = `tccc${talk.EventId.split('/')[1]}`;
    const speakerid = eventSpeakerMap.find(
      e => e.eventId === eventString && e.talkId === talk['@metadata']['@id']
    ).speakerId;

    const content = `---
event: ${eventString}
title: "${cleanseLongText(talk.Title.split('\n').join(' '))}"
speakerId: ${speakerid}
layout: talk
room: ${talk.Room}
time: ${getTime(talk.Hour)}
tags: ${getTagsString(talk.Tags)}
---

${talk.Abstract}`;

    return { fileName, content, eventString };
  });

  talksFiles.forEach(async file => {
    const { fileName, content, eventString } = file;
    const folder = `${talksPath}/${eventString}`;

    await fs.ensureDir(folder);

    fs.writeFileSync(`${folder}/${fileName}`, content);
  });

  function getTalkFileName(talk) {
    const title = removeExtraSpaces(talk.Title.trim());
    const author = removeExtraSpaces(talk.Author.trim());

    const cleanTitle = removeDoubleDashes(
      title
        .replace(/\W/g, ' ')
        .split(' ')
        .join('-')
        .toLowerCase()
    );

    const cleanAuthor = removeDoubleDashes(
      author
        .replace(/\W/g, ' ')
        .split(' ')
        .join('-')
        .toLowerCase()
    );

    return `${cleanAuthor}-${cleanTitle}.html`;
  }
};

const getTagsString = tags => {
  return `[${tags.map(tag => `"${tag}"`).join(', ')}]`;
};

module.exports = createTalksFiles;
