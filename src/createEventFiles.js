const { format } = require('date-fns');
const fs = require('fs-extra');

const createEventFiles = (events, eventsPath) => {
  const eventsFiles = events.map(e => {
    const number = e.Number;
    const dateString = format(new Date(e.DateTime), 'yyyy-MM-dd');
    const fileName = `tccc${number}.html`;
    const content = `---
layout: event
event: tccc${number}
title: TCCC ${number}
eventDate: ${dateString}
address: "${e.Address}"
locationName: "${e.LocationFriendlyName}"
number: ${e.Number}
registerUrl: ${e.RegisterUrl}
seasonYear: "${e.SeasonYear}"
---`;
    return { fileName, content };
  });

  eventsFiles.forEach(file => {
    const { fileName, content } = file;
    fs.writeFileSync(`${eventsPath}/${fileName}`, content);
    console.log(`${fileName}`);
  });
};

module.exports = createEventFiles;
