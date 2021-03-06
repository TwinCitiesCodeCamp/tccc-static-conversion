const fs = require('fs-extra');
const { getTwitterString } = require('./util');
const createSponsorImage = require('./createSponsorImage');

const createSponsorFiles = (
  distinctEvents,
  sponsors,
  sponsorsPath,
  sponsorImagesPath
) => {
  distinctEvents.forEach(eventId => {
    const sponsorsForEvent = sponsors.filter(
      sponsor => 'tccc' + sponsor.EventId.split('/')[1] === eventId
    );

    sponsorsForEvent.forEach(async s => {
      const newImagePath = await createSponsorImage(
        eventId,
        { ...s, image: s.Logo },
        sponsorImagesPath
      );

      const content = `--- 
name: ${s.Name}
level: ${s.Level}
image: ${newImagePath ? newImagePath : ''}
link: ${s.Url}
twitter: ${getTwitterString(s.Twitter)}
event: ${eventId}
---

${s.About}`;

      const folder = `${sponsorsPath}/${eventId}`;
      fs.ensureDirSync(folder);
      const fileName = `${s.Name.split(' ')
        .join('-')
        .toLowerCase()}.html`;
      const filePath = `${folder}/${fileName}`;
      fs.writeFileSync(filePath, content);
      //console.log(filePath);
    });
  });
};

module.exports = createSponsorFiles;
