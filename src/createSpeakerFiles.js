const fs = require('fs-extra');
const { getYamlString, getTwitterString } = require('./util');

const createSpeakerImage = require('./createSpeakerImage');

const createSpeakerFiles = (
  distinctEvents,
  eventSpeakerMap,
  speakersPath,
  speakerImagesPath
) => {
  // create speaker files
  distinctEvents.forEach(eventId => {
    const speakersForEvent = eventSpeakerMap.filter(
      speaker => speaker.eventId === eventId
    );

    speakersForEvent.forEach(async s => {
      const newImagePath = await createSpeakerImage(
        eventId,
        s,
        speakerImagesPath
      );

      // image: ${getYamlString(s.image)}

      const name = s.name.trim();
      const content = `---
speakerId: ${s.speakerId}
name: ${name}
image: ${getYamlString(newImagePath)}
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
      //console.log(path);
    });
  });
};

module.exports = createSpeakerFiles;
