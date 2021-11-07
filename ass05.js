const inputField = document.getElementById("word_input");
const outputField = document.getElementById("word_output");
const savedWordsField = document.getElementById("saved_words");
const outputDescriptionField = document.getElementById("output_description");
const showRhymesButton = document.getElementById("show_rhymes");
const showSynonymsButton = document.getElementById("show_synonyms");
const savedWords = [];


/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
  // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
  // value for property (obj[property])
  if (typeof property !== "function") {
    const propName = property;
    property = (obj) => obj[propName];
  }

  const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
  for (const object of objects) {
    const groupName = property(object);
    //Make sure that the group exists
    if (!groupedObjects.has(groupName)) {
      groupedObjects.set(groupName, []);
    }
    groupedObjects.get(groupName).push(object);
  }

  // Create an object with the results. Sort the keys so that they are in a sensible "order"
  const result = {};
  for (const key of Array.from(groupedObjects.keys()).sort()) {
    result[key] = groupedObjects.get(key);
  }
  return result;
}

//Create the word list
function addSavedWords(word) {
  if (!savedWords.includes(word)) {
    savedWords.push(word);
  } savedWordsField.innerText = savedWords.join(', ');
}

//API for data fetching
function getRhymes(rel_rhy, callback) {
  fetch(
    `https://api.datamuse.com/words?${new URLSearchParams({
      rel_rhy,}).toString()}`)
    .then(
      (response) => response.json())
    .then(
      (data) => {callback(data);},
      (err) => {console.error(err);}); 
}

function getSynonyms(ml, callback) {
  fetch(
    `https://api.datamuse.com/words?${new URLSearchParams({ ml }).toString()}`)
    .then(
      (response) => response.json())
    .then(
      (data) => {callback(data);},
      (err) => {console.error(err);});
}

function addS(num) {
  if (num === 1) {return "";} 
  else {return "s";}
}

function displayRhymeList(data) {
  if (data.length == 0) {
    outputDescriptionField.innerText = "(no results)";
  } else {
    outputDescriptionField.innerText = `Words that rhyme with ${inputField.value}: `;
    data = groupBy(data, "numSyllables");
    for (let group in data) {
      let groupTitle = document.createElement("h3");
      groupTitle.innerText = `${group} syllable${addS(Number(group))}:`;
      let rhymesOutput = document.createElement("ul");
      for (let ele of data[group]) {
        let liElement = document.createElement("li"); let saveButton = document.createElement("button");
        saveButton.innerText = "(save)";
        saveButton.className = "btn btn-outline-success";
        saveButton.addEventListener("click", () => {
          addSavedWords(ele["word"]);
        });
        liElement.innerText = ele["word"];
        rhymesOutput.append(liElement);
        liElement.append(saveButton);
      }
      outputField.append(groupTitle);
      outputField .append(rhymesOutput);
    }
  }
}

function displaySynonmList(data){
  if (data.length == 0) {
    outputDescriptionField.innerText = "(no results)";
  } else {
    outputDescriptionField.innerText = `Words with a meaning similar to ${inputField.value}: `;
    console.log(data)
    let rhymesOutput = document.createElement("ul");
    for (let ele of data) {
        let liElement = document.createElement("li");let saveButton = document.createElement("button");
        saveButton.innerText = "(save)";
        saveButton.className = "btn btn-outline-success";
        saveButton.addEventListener("click", () => {
          addSavedWords(ele["word"]);
        });
        liElement.innerText = ele["word"];
        rhymesOutput.append(liElement);
        liElement.append(saveButton);
    }
    outputField.append(rhymesOutput);
  }
}

showSynonymsButton.addEventListener("click", ()=>{
  while (outputField.firstChild) {
    outputField.removeChild(outputField.lastChild);
  }
  outputDescriptionField.innerText = `...loading`;
  getSynonyms(inputField.value, displaySynonmList);
});

showRhymesButton.addEventListener("click", getAndDisplayRhymes);
inputField.addEventListener("keydown", (event) => {
  if (event.isComposing || event.keyCode === 13) {
    getAndDisplayRhymes();
  }
});

function getAndDisplayRhymes() {
  while (outputField.firstChild) {
    outputField.removeChild(outputField.lastChild);
  }
  outputDescriptionField.innerText = `...loading`;
  getRhymes(inputField.value, displayRhymeList);
}





