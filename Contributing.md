# How to contribute

First, I want to say thank you for reading this -- as this project is a bit of an experiment.  We really need community contributors and volunteer developers for b2c-crm-sync to live up to its promise as a trustworthy integration foundation for B2C Commerce and the Salesforce Platform.

The Salesforce Community, Salesforce Architects, Salesforce Partners, and the SCPPE and Service Delivery teams within the Customer Success Group (CSG) all contribute to this repository. This repository isn’t supported by Salesforce Commerce Cloud or Salesforce Platform Technical Support. For feature requests or bugs, please [open a GitHub issue](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/issues/new/choose). Contributions are ALWAYS WELCOME -- and you can feel great about contributing back.

## Testing

All our mocha-tests live in the [test](test) folder off the folder root.  Here, you'll find unit tests for our [CLI tools](test/cli), our [B2C cartridges](test/b2c), and [multi-cloud unit tests](test/_use-cases) that exercise both integration environments via REST APIs.  We also have [Apex unit-tests](src/sfdc/base/main/default/classes) you can use to exercise our Apex code.

> Tests create trustworthiness, and trustworthiness is important to us.  If you're looking for a way to contribute, growing our test-coverage is a really great way to give back.  We are ALWAYS looking to improve our test coverage.

## Submitting Changes

Please send a [GitHub Pull Request to b2c-crm-sync](https://github.com/SalesforceCommerceCloud/b2c-crm-sync/pull/new/master) with a clear list of what you've done (read more about [pull requests](http://help.github.com/pull-requests/)). When you send a pull request, we will extol your praises if you include comments and pull-requests. We can always use more test coverage. Please make sure all of your commits are atomic (one feature per commit).

Always write a clear log message for your commits. One-line messages starting with the issue number are fine for small changes.  Bigger changes should look like this:

```bash
$ git commit -m "#1 A brief summary of the commit
> 
> A paragraph describing what changed and its impact."
```

> Issue numbers at the front of commit messages make it easier for us to follow changes as they're coming in.  Your willingness to align to this standard is appreciated.

## Coding Conventions

Start reading our code, and you'll get the hang of it. We optimize for readability:

  * We indent using four spaces (soft tabs)
  * We have an "interesting" mix of ES6 and ES5 code (don't hate the var statements in our B2C Commerce cartridges)
  * The project includes an ESLint configuration file; please use it.

 > Remember that this is an enablement solution that teaches how to integrate B2C Commerce with the Salesforce Platform.  It's community contributed and driven.  That said, consider the people who will read your code -- and make it look nice for them.

Above all else, let's #wintogether.  Nothing would make me happier than to have to ask my Manager for more Hoody Budget because we're getting so much support.

Thanks from all of us!  Looking forward to hearing from you. :)

Best :purple_heart: :purple_heart: :purple_heart:

<br/>"Sister from Another Mister"
<br/>Senior Regional Success Architect
<br/>**[Christa Matukaitis](https://www.linkedin.com/in/christa-matukaitis-152a5b35/)**

<br/>"Artisan Flow-Master"
<br/>Regional Success Architect
<br/>**[Eric Schultz](https://www.linkedin.com/in/ericszulc/)**

<br/>"Has Re-Written More of My Code than I Have"
<br/>Senior B2C Technical Architect
<br/>**[Jordane Bachelet](https://www.linkedin.com/in/jordane-bachelet/)**

<br/>"Tenacious, Relentless, and Continuous"
<br/>Regional Success Architect
<br/>**[Olena Baykur](https://www.linkedin.com/in/olena-baykur-2057617/)**

<br/>"Yes, These Are My Nicknames For Everyone"
<br/>Lead Evangelist: B2C Solution Architect Program
<br/>**[Abraham Lloyd](https://www.linkedin.com/in/abrahamlloyd/)**
