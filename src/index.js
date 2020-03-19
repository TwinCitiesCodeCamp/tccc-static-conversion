const fs = require('fs');
const { format } = require('date-fns');
const events = require('./../json-archive/events');

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
