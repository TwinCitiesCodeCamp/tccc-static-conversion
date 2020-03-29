const download = require('image-downloader');
const fs = require('fs-extra');
const { getDownloadUrl } = require('./util');

const createSponsorImage = async (eventId, sponsor, basePath) => {
  if (!eventId) {
    console.warn('no event ID passed to createSponsorImage');
    return;
  }

  if (!sponsor.image) {
    console.warn('sponsor image was falsey', sponsor);
    return;
  }

  let fileName;

  try {
    const dir = `${basePath}/${eventId}`;
    fs.ensureDirSync(dir);

    const origParts = sponsor.image.split('/');
    const rawFileName = origParts[origParts.length - 1];
    const fileNameParts = rawFileName.split('?');
    fileName = fileNameParts[0];

    const dest = `${dir}/${fileName}`;

    const options = {
      url: getDownloadUrl(sponsor.image.trim()),
      dest
    };

    const { filename, image } = await download.image(options);
    // console.log(filename); // => /path/to/dest/image.jpg
    return filename.replace('out', '');
  } catch (err) {
    console.error('error downloading sponsor image', {
      fileName,
      url: sponsor.image,
      error: err.message
    });
    return null;
  }
};

module.exports = createSponsorImage;
