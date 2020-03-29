const fs = require('fs-extra');
const {
  getYamlString,
  removeLineBreaks,
  cleanseLongText,
  getTwitterString
} = require('./util');

const createSpeakerFiles = (distinctEvents, eventSpeakerMap, speakersPath) => {
  // create speaker files
  distinctEvents.forEach(eventId => {
    const speakersForEvent = eventSpeakerMap.filter(
      speaker => speaker.eventId === eventId
    );

    speakersForEvent.forEach(s => {
      const name = s.name.trim();
      const content = `---
speakerId: ${s.speakerId}
name: ${name}
image: ${getYamlString(s.image)}
speakerUrl: ${getYamlString(s.url)}
twitter: ${getTwitterString(s.twitter)}
github: ${getYamlString(s.github)}
event: ${eventId}
---

${s.bio}`;

      const folder = `${speakersPath}/${eventId}`;
      fs.ensureDirSync(folder);
      const fileName = `${name.split(' ').join('')}.html`;

      const path = `${folder}/${fileName}`;
      fs.writeFileSync(path, content);
      console.log(path);
    });
  });
};

module.exports = createSpeakerFiles;
