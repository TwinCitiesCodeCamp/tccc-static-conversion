const download = require('image-downloader');
const fs = require('fs-extra');

const createSpeakerImage = async (eventId, speaker, basePath) => {
  if (!eventId) {
    console.warn('no event ID passed to createSpeakerImage');
    return;
  }

  if (!speaker.image) {
    console.warn('speaker image was falsey', speaker.name);
    return;
  }

  try {
    const dir = `${basePath}/${eventId}`;
    fs.ensureDirSync(dir);

    const origParts = speaker.image.split('/');
    const fileName = origParts[origParts.length - 1];
    const dest = `${dir}/${fileName}`;

    const options = {
      url: speaker.image,
      dest
    };

    const { filename, image } = await download.image(options);
    console.log(filename); // => /path/to/dest/image.jpg
    return filename.replace('out', '');
  } catch (err) {
    console.error('error downloading image', {
      url: speaker.image,
      error: err.message
    });
    return null;
  }
};

module.exports = createSpeakerImage;
