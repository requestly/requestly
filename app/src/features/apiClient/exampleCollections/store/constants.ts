import { RQAPI } from "features/apiClient/types";

type ExampleCollections = {
  version: number;
  collections: {
    schema_version: string;
    records: RQAPI.Record[];
  };
};

// TODO: add both example collections

export const EXAMPLE_COLLECTIONS: ExampleCollections = {
  version: 1,
  collections: {
    schema_version: "1.0.0",
    records: [
      {
        name: "HackerNews API",
        type: "collection",
        data: {
          variables: {
            url: {
              id: 0,
              syncValue: "https://hacker-news.firebaseio.com",
              type: "string",
            },
            "item-id": {
              id: 1,
              syncValue: "33678808",
              type: "string",
            },
          },
          auth: {
            currentAuthType: "INHERIT",
            authConfigStore: {},
          },
        },
        collectionId: "",
        deleted: false,
        description:
          'Documentation is here: [https://github.com/HackerNews/API](https://github.com/HackerNews/API)\n\n## Overview\n\nIn partnership with [Firebase](https://firebase.google.com/), we\'re making the public Hacker News data available in near real time. Firebase enables easy access from [Android](https://firebase.google.com/docs/android/setup), [iOS](https://firebase.google.com/docs/ios/setup) and the [web](https://firebase.google.com/docs/web/setup). [Servers](https://firebase.google.com/docs/server/setup) aren\'t left out.\n\nIf you can use one of the many [Firebase client libraries](https://firebase.google.com/docs/libraries/), you really should. The libraries handle networking efficiently and can raise events when things change. Be sure to check them out.\n\nPlease email api@ycombinator.com if you find any bugs.\n\n## URI and Versioning\n\nWe hope to improve the API over time. The changes won\'t always be backward compatible, so we\'re going to use versioning. This first iteration will have URIs prefixed with `https://hacker-news.firebaseio.com/v0/` and is structured as described below. There is currently no rate limit.\n\nFor versioning purposes, only removal of a non-optional field or alteration of an existing field will be considered incompatible changes. *Clients should gracefully handle additional fields they don\'t expect, and simply ignore them.*\n\n## Design\n\nThe v0 API is essentially a dump of our in-memory data structures. We know, what works great locally in memory isn\'t so hot over the network. Many of the awkward things are just the way HN works internally. Want to know the total number of comments on an article? Traverse the tree and count. Want to know the children of an item? Load the item and get their IDs, then load them. The newest page? Starts at item maxid and walks backward, keeping only the top level stories. Same for Ask, Show, etc.\n\nI\'m not saying this to defend it - It\'s not the ideal public API, but it\'s the one we could release in the time we had. While awkward, it\'s possible to implement most of HN using it.\n\n## Items\n\nStories, comments, jobs, Ask HNs and even polls are just items. They\'re identified by their ids, which are unique integers, and live under `/v0/item/\u003Cid\u003E`.\n\nAll items have some of the following properties, with required properties in bold:\n\nField | Description\n------|------------\n**id** | The item\'s unique id.\ndeleted | `true` if the item is deleted.\ntype | The type of item. One of "job", "story", "comment", "poll", or "pollopt".\nby | The username of the item\'s author.\ntime | Creation date of the item, in [Unix Time](http://en.wikipedia.org/wiki/Unix_time).\ntext | The comment, story or poll text. HTML.\ndead | `true` if the item is dead.\nparent | The comment\'s parent: either another comment or the relevant story.\npoll | The pollopt\'s associated poll.\nkids | The ids of the item\'s comments, in ranked display order.\nurl | The URL of the story.\nscore | The story\'s score, or the votes for a pollopt.\ntitle | The title of the story, poll or job. HTML.\nparts | A list of related pollopts, in display order.\ndescendants | In the case of stories or polls, the total comment count.\n\nFor example, a story: https://hacker-news.firebaseio.com/v0/item/8863.json?print=pretty\n\n```javascript\n{\n  "by" : "dhouston",\n  "descendants" : 71,\n  "id" : 8863,\n  "kids" : [ 8952, 9224, 8917, 8884, 8887, 8943, 8869, 8958, 9005, 9671, 8940, 9067, 8908, 9055, 8865, 8881, 8872, 8873, 8955, 10403, 8903, 8928, 9125, 8998, 8901, 8902, 8907, 8894, 8878, 8870, 8980, 8934, 8876 ],\n  "score" : 111,\n  "time" : 1175714200,\n  "title" : "My YC app: Dropbox - Throw away your USB drive",\n  "type" : "story",\n  "url" : "http://www.getdropbox.com/u/2/screencast.html"\n}\n```\n\ncomment: https://hacker-news.firebaseio.com/v0/item/2921983.json?print=pretty\n\n```javascript\n{\n  "by" : "norvig",\n  "id" : 2921983,\n  "kids" : [ 2922097, 2922429, 2924562, 2922709, 2922573, 2922140, 2922141 ],\n  "parent" : 2921506,\n  "text" : "Aw shucks, guys ... you make me blush with your compliments.\u003Cp\u003ETell you what, Ill make a deal: I\'ll keep writing if you keep reading. K?",\n  "time" : 1314211127,\n  "type" : "comment"\n}\n```\n\nask: https://hacker-news.firebaseio.com/v0/item/121003.json?print=pretty\n\n```javascript\n{\n  "by" : "tel",\n  "descendants" : 16,\n  "id" : 121003,\n  "kids" : [ 121016, 121109, 121168 ],\n  "score" : 25,\n  "text" : "\u003Ci\u003Eor\u003C/i\u003E HN: the Next Iteration\u003Cp\u003EI get the impression that with Arc being released a lot of people who never had time for HN before are suddenly dropping in more often. (PG: what are the numbers on this? I\'m envisioning a spike.)\u003Cp\u003ENot to say that isn\'t great, but I\'m wary of Diggification. Between links comparing programming to sex and a flurry of gratuitous, ostentatious  adjectives in the headlines it\'s a bit concerning.\u003Cp\u003E80% of the stuff that makes the front page is still pretty awesome, but what\'s in place to keep the signal/noise ratio high? Does the HN model still work as the community scales? What\'s in store for (++ HN)?",\n  "time" : 1203647620,\n  "title" : "Ask HN: The Arc Effect",\n  "type" : "story"\n}\n```\n\njob: https://hacker-news.firebaseio.com/v0/item/192327.json?print=pretty\n\n```javascript\n{\n  "by" : "justin",\n  "id" : 192327,\n  "score" : 6,\n  "text" : "Justin.tv is the biggest live video site online. We serve hundreds of thousands of video streams a day, and have supported up to 50k live concurrent viewers. Our site is growing every week, and we just added a 10 gbps line to our colo. Our unique visitors are up 900% since January.\u003Cp\u003EThere are a lot of pieces that fit together to make Justin.tv work: our video cluster, IRC server, our web app, and our monitoring and search services, to name a few. A lot of our website is dependent on Flash, and we\'re looking for talented Flash Engineers who know AS2 and AS3 very well who want to be leaders in the development of our Flash.\u003Cp\u003EResponsibilities\u003Cp\u003E\u003Cpre\u003E\u003Ccode\u003E    * Contribute to product design and implementation discussions\\n    * Implement projects from the idea phase to production\\n    * Test and iterate code before and after production release \\n\u003C/code\u003E\u003C/pre\u003E\\nQualifications\u003Cp\u003E\u003Cpre\u003E\u003Ccode\u003E    * You should know AS2, AS3, and maybe a little be of Flex.\\n    * Experience building web applications.\\n    * A strong desire to work on website with passionate users and ideas for how to improve it.\\n    * Experience hacking video streams, python, Twisted or rails all a plus.\\n\u003C/code\u003E\u003C/pre\u003E\\nWhile we\'re growing rapidly, Justin.tv is still a small, technology focused company, built by hackers for hackers. Seven of our ten person team are engineers or designers. We believe in rapid development, and push out new code releases every week. We\'re based in a beautiful office in the SOMA district of SF, one block from the caltrain station. If you want a fun job hacking on code that will touch a lot of people, JTV is for you.\u003Cp\u003ENote: You must be physically present in SF to work for JTV. Completing the technical problem at \u003Ca href=\\"http://www.justin.tv/problems/bml\\" rel=\\"nofollow\\"\u003Ehttp://www.justin.tv/problems/bml\u003C/a\u003E will go a long way with us. Cheers!",\n  "time" : 1210981217,\n  "title" : "Justin.tv is looking for a Lead Flash Engineer!",\n  "type" : "job",\n  "url" : ""\n}\n```\n\npoll: https://hacker-news.firebaseio.com/v0/item/126809.json?print=pretty\n\n```javascript\n{\n  "by" : "pg",\n  "descendants" : 54,\n  "id" : 126809,\n  "kids" : [ 126822, 126823, 126993, 126824, 126934, 127411, 126888, 127681, 126818, 126816, 126854, 127095, 126861, 127313, 127299, 126859, 126852, 126882, 126832, 127072, 127217, 126889, 127535, 126917, 126875 ],\n  "parts" : [ 126810, 126811, 126812 ],\n  "score" : 46,\n  "text" : "",\n  "time" : 1204403652,\n  "title" : "Poll: What would happen if News.YC had explicit support for polls?",\n  "type" : "poll"\n}\n```\n\nand one of its parts: https://hacker-news.firebaseio.com/v0/item/160705.json?print=pretty\n\n```javascript\n{\n  "by" : "pg",\n  "id" : 160705,\n  "poll" : 160704,\n  "score" : 335,\n  "text" : "Yes, ban them; I\'m tired of seeing Valleywag stories on News.YC.",\n  "time" : 1207886576,\n  "type" : "pollopt"\n}\n```\n\n## Users\n\nUsers are identified by case-sensitive ids, and live under `/v0/user/`. Only users that have public activity (comments or story submissions) on the site are available through the API.\n\nField | Description\n------|------------\n**id** | The user\'s unique username. Case-sensitive. Required.\n**created** | Creation date of the user, in [Unix Time](http://en.wikipedia.org/wiki/Unix_time).\n**karma** | The user\'s karma.\nabout | The user\'s optional self-description. HTML.\nsubmitted | List of the user\'s stories, polls and comments.\n\nFor example: https://hacker-news.firebaseio.com/v0/user/jl.json?print=pretty\n\n```javascript\n{\n  "about" : "This is a test",\n  "created" : 1173923446,\n  "delay" : 0,\n  "id" : "jl",\n  "karma" : 2937,\n  "submitted" : [ 8265435, 8168423, 8090946, 8090326, 7699907, 7637962, 7596179, 7596163, 7594569, 7562135, 7562111, 7494708, 7494171, 7488093, 7444860, 7327817, 7280290, 7278694, 7097557, 7097546, 7097254, 7052857, 7039484, 6987273, 6649999, 6649706, 6629560, 6609127, 6327951, 6225810, 6111999, 5580079, 5112008, 4907948, 4901821, 4700469, 4678919, 3779193, 3711380, 3701405, 3627981, 3473004, 3473000, 3457006, 3422158, 3136701, 2943046, 2794646, 2482737, 2425640, 2411925, 2408077, 2407992, 2407940, 2278689, 2220295, 2144918, 2144852, 1875323, 1875295, 1857397, 1839737, 1809010, 1788048, 1780681, 1721745, 1676227, 1654023, 1651449, 1641019, 1631985, 1618759, 1522978, 1499641, 1441290, 1440993, 1436440, 1430510, 1430208, 1385525, 1384917, 1370453, 1346118, 1309968, 1305415, 1305037, 1276771, 1270981, 1233287, 1211456, 1210688, 1210682, 1194189, 1193914, 1191653, 1190766, 1190319, 1189925, 1188455, 1188177, 1185884, 1165649, 1164314, 1160048, 1159156, 1158865, 1150900, 1115326, 933897, 924482, 923918, 922804, 922280, 922168, 920332, 919803, 917871, 912867, 910426, 902506, 891171, 807902, 806254, 796618, 786286, 764412, 764325, 642566, 642564, 587821, 575744, 547504, 532055, 521067, 492164, 491979, 383935, 383933, 383930, 383927, 375462, 263479, 258389, 250751, 245140, 243472, 237445, 229393, 226797, 225536, 225483, 225426, 221084, 213940, 213342, 211238, 210099, 210007, 209913, 209908, 209904, 209903, 170904, 165850, 161566, 158388, 158305, 158294, 156235, 151097, 148566, 146948, 136968, 134656, 133455, 129765, 126740, 122101, 122100, 120867, 120492, 115999, 114492, 114304, 111730, 110980, 110451, 108420, 107165, 105150, 104735, 103188, 103187, 99902, 99282, 99122, 98972, 98417, 98416, 98231, 96007, 96005, 95623, 95487, 95475, 95471, 95467, 95326, 95322, 94952, 94681, 94679, 94678, 94420, 94419, 94393, 94149, 94008, 93490, 93489, 92944, 92247, 91713, 90162, 90091, 89844, 89678, 89498, 86953, 86109, 85244, 85195, 85194, 85193, 85192, 84955, 84629, 83902, 82918, 76393, 68677, 61565, 60542, 47745, 47744, 41098, 39153, 38678, 37741, 33469, 12897, 6746, 5252, 4752, 4586, 4289 ]\n}\n```\n\n## Live Data\n\nThe coolest part of Firebase is its support for change notifications. While you can subscribe to individual items and profiles, you\'ll need to use the following to observe front page ranking, new items, and new profiles.\n\n### Max Item ID\n\nThe current largest item id is at `/v0/maxitem`. You can walk backward from here to discover all items.\n\nExample: https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty\n\n```javascript\n9130260\n```\n\n### New, Top and Best Stories\n\nUp to 500 top and new stories are at `/v0/topstories` (also contains jobs) and `/v0/newstories`. Best stories are at `/v0/beststories`.\n\nExample: https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty\n\n```javascript\n[ 9129911, 9129199, 9127761, 9128141, 9128264, 9127792, 9129248, 9127092, 9128367, ..., 9038733 ]\n```\n\n### Ask, Show and Job Stories\n\nUp to 200 of the latest Ask HN, Show HN, and Job stories are at `/v0/askstories`, `/v0/showstories`, and `/v0/jobstories`.\n\nExample: https://hacker-news.firebaseio.com/v0/askstories.json?print=pretty\n\n```javascript\n[ 9127232, 9128437, 9130049, 9130144, 9130064, 9130028, 9129409, 9127243, 9128571, ..., 9120990 ]\n```\n\n### Changed Items and Profiles\n\nThe item and profile changes are at `/v0/updates`.\n\nExample: https://hacker-news.firebaseio.com/v0/updates.json?print=pretty\n\n```javascript\n{\n  "items" : [ 8423305, 8420805, 8423379, 8422504, 8423178, 8423336, 8422717, 8417484, 8423378, 8423238, 8423353, 8422395, 8423072, 8423044, 8423344, 8423374, 8423015, 8422428, 8423377, 8420444, 8423300, 8422633, 8422599, 8422408, 8422928, 8394339, 8421900, 8420902, 8422087 ],\n  "profiles" : [ "thefox", "mdda", "plinkplonk", "GBond", "rqebmm", "neom", "arram", "mcmancini", "metachris", "DubiousPusher", "dochtman", "kstrauser", "biren34", "foobarqux", "mkehrt", "nathanm412", "wmblaettler", "JoeAnzalone", "rcconf", "johndbritton", "msie", "cktsai", "27182818284", "kevinskii", "wildwood", "mcherm", "naiyt", "matthewmcg", "joelhaus", "tshtf", "MrZongle2", "Bogdanp" ]\n}\n```',
        id: "wYoAIzqudaJWf4KKQeXL",
      },
      {
        name: "Best Stories",
        type: "api",
        data: {
          request: {
            url: "{{url}}/v0/beststories.json?print=pretty",
            method: "GET",
            queryParams: [
              {
                id: 0,
                key: "print",
                value: "pretty",
                isEnabled: true,
              },
            ],
            // @ts-ignore
            headers: [],

            // @ts-ignore
            body: null,
            contentType: "text/plain",
          },
          auth: {
            currentAuthType: "INHERIT",
            authConfigStore: {},
          },
          scripts: {
            preRequest: "",
            postResponse: "",
          },
        },
        collectionId: "wYoAIzqudaJWf4KKQeXL",
        deleted: false,
        id: "p4g1isJL2hHnnb3WqVlW",
      },
      {
        name: "New Stories",
        type: "api",
        data: {
          request: {
            url: "{{url}}/v0/newstories.json?print=pretty",
            method: "GET",
            queryParams: [
              {
                id: 0,
                key: "print",
                value: "pretty",
                isEnabled: true,
              },
            ],
            headers: [],
            body: null,
            contentType: "text/plain",
          },
          auth: {
            currentAuthType: "INHERIT",
            authConfigStore: {},
          },
          scripts: {
            preRequest: "",
            postResponse: "",
          },
        },
        collectionId: "wYoAIzqudaJWf4KKQeXL",
        deleted: false,
        id: "BZpHuJzguAuREjgLj5Zn",
      },
      {
        name: "Story",
        type: "api",
        data: {
          request: {
            url: "https://hacker-news.firebaseio.com/v0/item/{{item-id}}.json?print=pretty",
            method: "GET",
            queryParams: [
              {
                id: 0,
                key: "print",
                value: "pretty",
                isEnabled: true,
              },
            ],
            headers: [],
            body: null,
            contentType: "text/plain",
          },
          auth: {
            currentAuthType: "INHERIT",
            authConfigStore: {},
          },
          scripts: {
            preRequest: "",
            postResponse: "",
          },
        },
        collectionId: "wYoAIzqudaJWf4KKQeXL",
        deleted: false,
        id: "UyEDrrLgpZMkeOUIFtjZ",
      },
      {
        name: "Top Stories",
        type: "api",
        data: {
          request: {
            url: "{{url}}/v0/topstories.json?print=pretty",
            method: "GET",
            queryParams: [
              {
                id: 0,
                key: "print",
                value: "pretty",
                isEnabled: true,
              },
            ],
            headers: [],
            body: null,
            contentType: "text/plain",
          },
          auth: {
            currentAuthType: "INHERIT",
            authConfigStore: {},
          },
          scripts: {
            preRequest: "",
            postResponse:
              '\nrq.test("Response status code is 200", function () {\n  rq.response.to.have.status(200);\n});\n\n\nrq.test("Response is an array", function () {\n  const responseData = rq.response.json();\n\n  rq.expect(responseData).to.be.an(\'array\');\n});\n\n\nrq.test("Response array should contain at least one element", function () {\n  const responseData = rq.response.json();\n\n  rq.expect(responseData).to.be.an(\'array\').and.to.have.lengthOf.at.least(1);\n});\n\n\nrq.test("Response array elements are integers", function () {\n  const responseData = rq.response.json();\n\n  rq.expect(responseData).to.be.an(\'array\');\n  responseData.forEach(function (element) {\n    rq.expect(element).to.be.a(\'number\');\n  });\n});\n\n\nrq.test("Response time is less than 500ms", function () {\n  rq.expect(rq.response.responseTime).to.be.below(500);\n});\n\n',
          },
        },
        collectionId: "wYoAIzqudaJWf4KKQeXL",
        deleted: false,
        id: "SUgxy706BQCDsqmwdhp3",
      },
    ] as RQAPI.Record[],
  },
};
