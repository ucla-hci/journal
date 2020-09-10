var inDB = null;
var dataTable = null;
var markTable = null;

// IndexedDB
var openRequest = indexedDB.open('espresso', 1);
openRequest.addEventListener('success', e => {
    inDB = openRequest.result;
    console.log("db connected");
    checkInitialDB();
});

openRequest.addEventListener('error', e => {
    console.log("db failed");
});

openRequest.addEventListener('upgradeneeded', e => {
    inDB = e.target.result; // Database
    dataTable = inDB.createObjectStore('data', { keyPath: 'id', autoIncrement: false});  // Table header
    markTable = inDB.createObjectStore('mark', { keyPath: 'id', autoIncrement: false});
});

function addData(id, flag, title, content, date, mark, mouse, key) {
    let request = inDB.transaction(['data'], 'readwrite')
        .objectStore('data')
        .add({ id: id, flag: flag, title: title, content: content, date: date, marks: mark, mouseLog: mouse, keyLog: key});

    request.onsuccess = function (event) {
        console.log('add succeed');
        menuData();
    };

    request.onerror = function (event) {
        console.log('add failed');
        updateData(id, flag, title, content, date, mark, mouse, key);
    }
}

function updateData(id, flag, title, content, date, mark, mouse, key) {
    let request = inDB.transaction(['data'], 'readwrite')
        .objectStore('data')
        .put({ id: id, flag: flag, title: title, content: content, date: date, marks: mark, mouseLog: mouse, keyLog: key});

    request.onsuccess = function (event) {
        console.log('update succeed');
        menuData();
    };

    request.onerror = function (event) {
        console.log('update failed');
    }
}

function removeData(id) {
    console.log("deleting entry #", id)
    var request = inDB.transaction(['data'], 'readwrite')
      .objectStore('data')
      .delete(id);
  
    request.onsuccess = function (event) {
        console.log('delete data succeed, now deleting mark.');
        removeMark(id);
    };

    request.onerror = function (event) {
        console.log('delete data failed');
    }
}

function readData(id) {
    console.log("indexDB #"+id);
    let transaction = inDB.transaction(['data'], 'readonly');
    let objectStore = transaction.objectStore('data');
    let request = objectStore.get(id);
 
    request.onerror = function(event) {
        console.log('read data failed');
    };
 
    request.onsuccess = function(event) {
        console.log(request.result);
        loadContentRecall(id, request.result);
    };
}

function menuData() {
    console.log("menuData");
    var transaction = inDB.transaction(['data'], 'readonly');
    var objectStore = transaction.objectStore('data');
    var request = objectStore.openCursor();
    var menu = {}
    var maxID = 0; 
  
    request.onsuccess = function (event) {
        let cursor = event.target.result;
        
        if (cursor) {
            let id = cursor.value.id;
            maxID = id > maxID ? id : maxID;
            menu[id] = {flag: cursor.value.flag, title: cursor.value.title};
            cursor.continue();
        } else {
            console.log("DB traverse finished");
            buildMenu(menu, maxID);
        }
    };

    request.onerror = function (event) {
        console.log("menu Cursor onError");
        initMenu();
    };
}

// Marks DB
function addMark(id, commentLog, commentSet, tagCount) {
    let request = inDB.transaction(['mark'], 'readwrite')
        .objectStore('mark')
        .add({ id: id, commentLog: commentLog, commentSet: commentSet, tagCount: tagCount});

    request.onsuccess = function (event) {
        console.log('mark add succeed');
    };

    request.onerror = function (event) {
        console.log('mark add failed');
        updateMark(id, commentLog, commentSet, tagCount);
    }
}

function updateMark(id, commentLog, commentSet, tagCount) {
    let request = inDB.transaction(['mark'], 'readwrite')
        .objectStore('mark')
        .put({ id: id, commentLog: commentLog, commentSet: commentSet, tagCount: tagCount});

    request.onsuccess = function (event) {
        console.log('mark update succeed');
    };

    request.onerror = function (event) {
        console.log('mark update failed');
    }
}

function readMark(id) {
    console.log("indexDB mark #"+id);
    let transaction = inDB.transaction(['mark'], 'readonly');
    let objectStore = transaction.objectStore('mark');
    let request = objectStore.get(id);
 
    request.onerror = function(event) {
        console.log('read mark failed');
        loadMarkRecall(-1, "failed");
    };
 
    request.onsuccess = function(event) {
        console.log(request.result);
        loadMarkRecall(id, request.result);
    };
}

function removeMark(id) {
    var request = inDB.transaction(['mark'], 'readwrite')
      .objectStore('mark')
      .delete(id);
  
    request.onsuccess = function (event) {
        console.log('delete succeed');
        menuData();
    };

    request.onerror = function (event) {
        console.log('delete mark failed');
    }
}

function _reInitializeDB() {
    var DBDeleteRequest = indexedDB.deleteDatabase("espresso");

    DBDeleteRequest.onerror = function(event) {
        console.log("Error deleting indexedDB");
    };
    
    DBDeleteRequest.onsuccess = function(event) {
        console.log("indexedDB deleted successfully");
    };
}

function checkInitialDB() {
    let request = inDB.transaction(['data'], 'readwrite')
        .objectStore('data')
        .add({ id: 0, flag: null, title: null, content: null, date: null, marks: null, mouseLog: null, keyLog: null});

    request.onerror = function(event) {
        console.log('existing db detected');
        menuData();
    };
 
    request.onsuccess = function(event) {
        console.log('new db detected');
        initEntry();
        menuData();
        
    };
}

function initEntry() {
    let prompts = `1. Thoughts and feelings about COVID-19 
    
For the next 10 minutes (or longer if you like), really let go and explore your deepest thoughts and feelings about the COVID-19 outbreak. How is it affecting you and the people around you? How is it related to other significant experiences in your life? Or how are you dealing with feelings such as anxiety or isolation? Really try to address those issues most important and significant for you.
    
2. Social life
    
COVID-19 has changed the way most people interact with others around them. How is your social world changing? How are you handling the changes in physical and social distance? Does the COVID outbreak make you feel alone or isolated? This might also be an opportunity to write about your feelings concerning some of your friendships that may be changing.
    
3. Work and money
    
For a large number of people, the current situation is having a major impact on their work life and their financial situation. If these topics are important for you, this might be a good time to write about them. In your writing you might touch on your emotions and thoughts concerning money, changes in relationships with coworkers, clients, managers, or others, or the very nature of your job.
    
4. Health
    
The spread of the COVID-19 virus is a threat to people's physical and mental health. Many people are justifiably frightened about the disease because it can kill people of all ages. If you are fundamentally concerned about your own or others' health or even the prospect of death, you might write about the nature of your thoughts and anxieties and analyze why you feel the way you do.
    
5. Feelings of uncertainty, fear, and the future
    
The COVID-19 is one of the most anxiety-provoking experiences that our culture has experienced in a generation. If you are feeling high levels of fear and uncertainty, use this time to look inward and ask yourself, why are you so anxious? What is the root of this uncertainty? What would be healthy ways to cope with it? In this exercise, really try to analyze your feelings of uncertainty about the future in order to better understand them.
    
6. Romantic and family relationships
    
Many romantic and other family relationships have been changing because of COVID-19. With shelter-in-place rules, your living arrangements have likely changed which may be affecting your feelings about privacy, loneliness, or the kinds of interactions you would like to have. For some this could be a positive experience, a negative experience, or even both. If this is something you would benefit writing about, use this opportunity to explore your thoughts and feelings about your current relationships with others.
    
7. Life path
    
Many people are thinking about some of the basic aspects of their lives. If this is true for you, please use this time to explore your thoughts and feelings about some of the basic directions or purpose in your life. How might you be thinking differently about your goals and the ways you are approaching work, family, spiritual issues, your life's meaning, and related big questions. How might you take advantage of this time?
    
8. Education and Student life
    
Many people have seen their education and educational plans disrupted. Some things about school life may never be rescheduled or replaced. Write your deepest thoughts and feelings about how COVID-19 has changed your life as a student. You might think about how these school-related changes have affected your plans for the future, your interactions with teachers and classmates, the topics you are studying, and even your life at a real campus.
    
    
Check more prompts from (http://exw.utpsyc.org/index.php](http://exw.utpsyc.org/index.php)`

    updateData(0, 1, 'Prompts', prompts, '', [], [], []);

    let dataOne = {"id":1,"flag":1,"title":"Writing Sample","content":"I feel better than before. The future is still unknown, a lot of uncertainties. I can't control all of them. Previously, my world was small and I just focused on the things that happened around me. Now, I feel I am sitting on a little boat, floating on the waves of the sea. I started to think about what is meaningful to me. I have tons of things to do every day. Did these make me feel happy? Now, one year later, or ten years later? Why do I spend my effort and time on them? I don't have an answer in my mind now. Before I figure it out, I just want to slow down a little bit and keep going. \n\nUntil now, I can't say that I totally recovered from this experience. It made me feel afraid of collaboration. Before this event, I feel I enjoyed every moment working in a team. This experience especially hurt me because it happened between me and one teammate who used to have a close relationship with me. But one morning, we both had great pressure on pushing forward the progress. When I pointed out that one more modification should be done as soon as possible, he suddenly went mad, shouted at me and threw the device into the table, making a huge sound. I was scared, but I found myself still pretending to be calm enough to deal with the situation. I just walked away in case he would have more behaviors out of control. Then I talked with the manager of the lab and later the team member also sent a very short sorry message. I feel something has happened in my mind deeply. I feel this message was useless and meaningless to me. And I refused to recover from this event. Every time I had to go to the place where it happened, I recalled all the memories and felt bad. I spent almost two or three days just uncontrollably weeping occasionally.\n","date":"08/15/2020 13:47","marks":[{"tag":"comment-hl 0","from":{"line":0,"ch":0},"to":{"line":0,"ch":26}},{"tag":"pause-hl 1","from":{"line":0,"ch":80},"to":{"line":0,"ch":87}},{"tag":"fluent-hl 2","from":{"line":0,"ch":326},"to":{"line":0,"ch":596}},{"tag":"comment-hl 3","from":{"line":2,"ch":30},"to":{"line":2,"ch":37}},{"tag":"fluent-hl 4","from":{"line":2,"ch":309},"to":{"line":2,"ch":730}},{"tag":"pause-hl 5","from":{"line":2,"ch":111},"to":{"line":2,"ch":129}},{"tag":"comment-hl 6","from":{"line":2,"ch":843},"to":{"line":2,"ch":865}},{"tag":"comment-hl 7","from":{"line":2,"ch":940},"to":{"line":3,"ch":0}}],"mouselog":[],"keyboardlog":[]}
    let markOne = {"id":1,"commentLog":{"1":{"tag":"others","comment":"As a good friend of myself, I will say to myself, \"wow! it is so glad to hear that you feel better than before"},"2":{"content":"I can't","tag":"pause","comment":"I think I have a lot of uncertainties in my mind, kind of a mess, mixing together, which hindered me from describing them.","from":{"line":0,"ch":80,"sticky":"after","xRel":3.387451171875},"to":{"line":0,"ch":87,"sticky":"before","xRel":-3.8250732421875}},"3":{"content":"I have tons of things to do every day. Did these make me feel happy? Now, one year later, or ten years later? Why do I spend my effort and time on them? I don't have an answer in my mind now. Before I figure it out, I just want to slow down a little bit and keep going. ","tag":"fluent","comment":"I wrote very fluently here. I was just pouring out all the questions that bothered me in my mind. Instead of saying that \"I don't have an answer\", I hope someone or some guidance can help me to check these \"tons of things\" one by one.","from":{"line":0,"ch":326,"sticky":"before","xRel":-0.57501220703125},"to":{"line":0,"ch":596,"sticky":"before","xRel":-2.6875}},"4":{"tag":"others","comment":"Am I thinking in absolutes? I guess no one can totally recover from one traumatic event very quickly. I need to give myself more time."},"5":{"content":"But one morning, we both had great pressure on pushing forward the progress. When I pointed out that one more modification should be done as soon as possible, he suddenly went mad, shouted at me and threw the device into the table, making a huge sound. I was scared, but I found myself still pretending to be calm enough to deal with the situation. I just walked away in case he would have more behaviors out of control. ","tag":"fluent","comment":"I wrote fluently here because I remember every detail very clearly. I can still feel the strong emotion I had at that moment and it was hurt.","from":{"line":2,"ch":309,"sticky":"after","xRel":3.3499755859375},"to":{"line":2,"ch":730,"sticky":"before","xRel":-0.2750244140625}},"6":{"content":"Before this event,","tag":"pause","comment":"I paused for a long long time here and felt really sad. I know collaboration is very important and I should not hold this kind of attitude towards it.","from":{"line":2,"ch":111,"sticky":"before","xRel":-0.9000244140625},"to":{"line":2,"ch":129,"sticky":"before","xRel":-2.7125244140625}},"7":{"tag":"others","comment":"If I can send this writing to one therapist, I hope the therapist can help me dig out this \"something\"."},"8":{"tag":"others","comment":"I really don't know what to say to comfort you, just a warm hug. And you always have the choice to recover from it. Take it easy!"}},"commentSet":["As a good friend of myself, I will say to myself, \"wow! it is so glad to hear that you feel better than before","I think I have a lot of uncertainties in my mind, kind of a mess, mixing together, which hindered me from describing them.","I wrote very fluently here. I was just pouring out all the questions that bothered me in my mind. Instead of saying that \"I don't have an answer\", I hope someone or some guidance can help me to check these \"tons of things\" one by one.","Am I thinking in absolutes? I guess no one can totally recover from one traumatic event very quickly. I need to give myself more time.","I wrote fluently here because I remember every detail very clearly. I can still feel the strong emotion I had at that moment and it was hurt.","I paused for a long long time here and felt really sad. I know collaboration is very important and I should not hold this kind of attitude towards it.","If I can send this writing to one therapist, I hope the therapist can help me dig out this \"something\".","I really don't know what to say to comfort you, just a warm hug. And you always have the choice to recover from it. Take it easy!"],"tagCount":8}

    addData(dataOne.id, dataOne.flag, dataOne.title, dataOne.content, dataOne.date, dataOne.marks, dataOne.mouselog, dataOne.keyboardlog);
    addMark(markOne.id, markOne.commentLog, markOne.commentSet, markOne.tagCount)
    console.log("db initialization succeeeded!")
}

function generatePackOne() {
    console.log("Pack One");
    var returnPack = {};

    var transaction = inDB.transaction(['data'], 'readonly');
    var objectStore = transaction.objectStore('data');
    var request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        
        if (cursor) {
            console.log(cursor);
            let id = cursor.value.id;
            if (!(id === 0 || id === '0')) {
                let data = {title: cursor.value.title, content: cursor.value.content, date: cursor.value.date, flag: cursor.value.flag, marks: cursor.value.marks, mouse: cursor.value.mouseLog, key: cursor.value.keyLog}
                returnPack[id] = {data: data, mark: null};
            }
            cursor.continue();
        } else {
            console.log("DB1 traverse finished");
            generatePackTwo(returnPack);
        }
    };

    request.onerror = function (event) {
        console.log("output data genearting onError1");
    };
}

function generatePackTwo(_returnPack) {
    console.log("Pack Two");
    var returnPack = _returnPack;
    
    var transaction = inDB.transaction(['mark'], 'readonly');
    var objectStore = transaction.objectStore('mark');
    var request = objectStore.openCursor();

    request.onsuccess = function (event) {
        let cursor = event.target.result;
        
        if (cursor) {
            console.log(cursor);
            let id = cursor.value.id;
            if (!(id === 0 || id === '0')) {
                let mark = {commentLog: cursor.value.commentLog, commentSet: cursor.value.commentSet, tagCount: cursor.value.tagCount}
                if (returnPack[id]) {
                    returnPack[id].mark = mark;
                }
                else {
                    returnPack[id] = {data: null, mark: mark};
                }
            }
            cursor.continue();
        } else {
            console.log("DB2 traverse finished");
            generatePackRecall(returnPack);
        }
    };

    request.onerror = function (event) {
        console.log("output data genearting onError2");
    };
}