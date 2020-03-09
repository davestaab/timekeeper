# Welcome to Time Keeper 🕰

Visual time entry.

![Time Keeper Screenshot](public/img/time-keeper-example.png?raw=true 'Time Keeper Screenshot')

# Demo

https://timekeeper.staabstory.com/

# What is this?

Do you have to track time at work? Maybe you have to bill clients/projects or just want to know how you've spent your day?

How much time did you spend on project A? How much on administration? How much on Project B?

Like most people, you end up counting hours between the events of the day. Scribbling hours on scrap paper, counting hours across the noon boundary and finally entering a simple number into an app. Maybe you wish there was a better way.

Time Keeper is a better way!

Create the categories you want to track, and click on the start of events that happened. Arrived at work, went to a meeting, called clients, met with project teams, took a walk, went home. Let Time Keeper do the hard work of adding up time for each category and totaling hours.

# How does it work?

Currently, your data is kept entirely in your browser, stored in the browser's `localStorge`. If you switch computers, switch browsers or use incognito mode, you'll be working with completely fresh data.

# Questions?

Leave an issue [here](https://github.com/davestaab/timekeeper/issues/new) and I'll get back to you!

# Build

Currently using npm as package manager

```shell script
npm install && npm run test:unit && npm run serve
```

# Deployment

Deployed to netlify automatically for branches master, develop and any PRs.
