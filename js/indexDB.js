var inDB = null;
var dataTable = null;
var markTable = null;

// IndexedDB
var openRequest = indexedDB.open('espresso', 1);
openRequest.addEventListener('success', e => {
    inDB = openRequest.result;
    console.log("db connected");
    createMenu();
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
        console.log('delete succeed');
        menuData();
    };

    request.onerror = function (event) {
        console.log('delete failed');
    }
}

function readData(id) {
    console.log("indexDB #"+id);
    let transaction = inDB.transaction(['data'], 'readonly');
    let objectStore = transaction.objectStore('data');
    let request = objectStore.get(id);
 
    request.onerror = function(event) {
        console.log('read failed');
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
        buildMenu("menuFailed", 0);
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
        updateData(id, commentLog, commentSet, tagCount);
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
        console.log('read failed');
        loadMarkRecall(-1, "failed");
    };
 
    request.onsuccess = function(event) {
        console.log(request.result);
        loadMarkRecall(id, request.result);
    };
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
            let data = {title: cursor.value.title, content: cursor.value.content, date: cursor.value.date, flag: cursor.value.flag, mouse: cursor.value.mouseLog, key: cursor.value.keyLog}
            returnPack[id] = {data: data, mark: null};
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
            let mark = {commentLog: cursor.value.commentLog, commentSet: cursor.value.commentSet, tagCount: cursor.value.tagCount}
            returnPack[id].mark = mark;
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