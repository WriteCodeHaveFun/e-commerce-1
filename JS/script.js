"use strict";

// ***GLOBAL VARIABLES
const MAX_PRICE = 999999;
const MAX_ITEMS_SHOWN = 4;
const mainSearch = document.getElementById('mainSearch');
let collectionOfItems = new Set();
// ***eng of GLOBAL VARIABLES

// ***Events setting
function setEventListeners(targetSelector, eventName, func) {
  const target = document.querySelectorAll(targetSelector);
  target.forEach(
    e => e.addEventListener(eventName, func)
  );
}

setEventListeners('.set-number-of-items', 'pointerdown', onPointerDown);
setEventListeners('[data-click-add-class-to]', 'click', addClassTo);
setEventListeners('[data-click-remove-class-from]', 'click', removeClassFrom);
setEventListeners('[data-click-toggle-class-to-this-neighbor]', 'click', toggleClassToThisNeighbor);
setEventListeners('[data-click-toggle-class-at-this-position]', 'click', toggleClassAtThisPosition);

mainSearch.addEventListener('input', onInputChange);
mainSearch.addEventListener('focus', onInputFocus);

document.addEventListener('click', onClick);
document.addEventListener('scroll', onScroll);

window.addEventListener('unload', onUnload);
// ***end of Events setting


// ***Animations
function animatedDelete(elemToDelete){  // Done
  if(!elemToDelete) return;

  let styles = getComputedStyle(elemToDelete);
  let timeOfTransition = parseFloat(styles.transitionDuration) * 1000;
  setTimeout(() => elemToDelete.remove(), timeOfTransition);
  
  elemToDelete.classList.add('delete-item');
}
// ***End of Animations

// ***DOM interaction functions
function addClassTo(e){
  let settings = e.target.dataset.clickAddClassTo;
  if (settings.indexOf(' ') == -1) return;

  let cssClass = settings.slice(0, settings.indexOf(' '));
  let selector = settings.slice(settings.indexOf(' ')+1);
  document.querySelector('.' + selector).classList.add(cssClass);

  e.preventDefault();
}

function removeClassFrom(e){
  let settings = e.target.dataset.clickRemoveClassFrom;
  if (settings.indexOf(' ') == -1) return;

  let cssClass = settings.slice(0, settings.indexOf(' '));
  let selector = settings.slice(settings.indexOf(' ')+1);
  document.querySelector('.' + selector).classList.remove(cssClass);

  e.preventDefault();
}

function toggleClassToThisNeighbor(e){
  let target = e.target;
  let settings = e.target.dataset.clickToggleClassToThisNeighbor
  if(settings.indexOf(' ') == -1) return;
  
  let cssClass = settings.slice(0, settings.indexOf(' '));
  let selector = settings.slice(settings.indexOf(' ')+1);
  target.parentNode.querySelector('.' + selector).classList.toggle(cssClass);

  e.preventDefault();
}

function toggleClassAtThisPosition(e){
  let settings = e.target.dataset.clickToggleClassAtThisPosition
  if(settings.indexOf(' ') == -1) return;

  let cssClass = settings.slice(0, settings.indexOf(' '));
  let selector = settings.slice(settings.indexOf(' ')+1);
  if(document.querySelector(selector)){
    document.querySelector(selector).classList.toggle(cssClass);
  }
}

function setNumberOfItems(e){ // Done
  let settings = Object.values(e.target.dataset)[0];

  if (settings.indexOf(' ') == -1) {
    throw new SyntaxError(`invalid setting string: should look like 'value target'`);
  }

  let value = settings.slice(0, settings.indexOf(' '));
  let selector = settings.slice(settings.indexOf(' ')+1);
  let inputField = e.target.parentNode.querySelector('.' + selector);
  let currentValue = inputField.value;

  if (e.target.dataset.decreaseValue) {
    let result = Number(currentValue) - Number(value);
    if (result < 1) result = 1;
    inputField.value = result;
  } else {
    let result = Number(currentValue) + Number(value);
    inputField.value = result;
  }
}

function clearInputCheckboxes(){
  let inputs = document.querySelectorAll('input[type=checkbox]');
  for(let i = 0; i < inputs.length; i++){
    inputs[i].checked = false;
  }
}

function clearInputValue(input){
  input.value = '';
}

function showElement(itemToShowId, whenThisElemNotOnScreen){ // try to use IntersectionObserver
                                                             // this func do 2 things instead of 1
  let showThisElem = document.getElementById(itemToShowId);

  function hideEleme(){
    showThisElem.classList.add('negative-z-index');
    showThisElem.removeEventListener('transitionend', hideEleme);
  }

  if (!isOnScreen(whenThisElemNotOnScreen)) {

    if (showThisElem.dataset.status == `show`) return;

    showThisElem.classList.add('animated-appearance');
    showThisElem.classList.remove('negative-z-index');
    showThisElem.removeEventListener('transitionend', hideEleme);

    showThisElem.dataset.status = `show`;
  } else {

    if (showThisElem.dataset.status == `hide`) return;

    showThisElem.classList.remove('animated-appearance');
    showThisElem.addEventListener('transitionend', hideEleme);

    showThisElem.dataset.status = `hide`;
  }
}
// ***end of DOM interaction functions

// ***EVENT functions
function onScroll(){
  showElement('backToTop', document.getElementById('mainHeader'));
}

function onClick(e){  
  if(e.target.dataset.itemId){
    let id = Number(e.target.dataset.itemId);
    let item = findItemById(id, collectionOfItems);
    generateBuyMenu(item);
  }

  if(e.target.closest('#miniGalery')){ // этот функциона по-идее можно заменить на список из input radio:
                                       // какой input выбран, тот и показываем
    e.preventDefault();
    let src;
    if (e.target.tagName == 'IMG') {
      let img = e.target;
      src = img.getAttribute('src') || '';
    } else {
      let img = e.target.querySelector('img');
      src = img.getAttribute('src') || '';
    }

    changeImgSrc(src, document.getElementById('mainImg'));
  }

  if(e.target.hasAttribute('data-click-delete')){
    let nodeToDelete = e.target.closest(`[data-delete-marker]`);
      animatedDelete(nodeToDelete);
  }

  if(e.target != document.getElementById('mainSearch') && e.target != document.getElementById('searchResult')){
    document.getElementById('mainSearch').classList.remove('showing');
  }
}

function onPointerDown(e){
  let delayTimerId, intervalTimerId;

  function intervalCallbacks(){
    intervalTimerId = setInterval(setNumberOfItems, 50, e);
  };
  function delayedCallback(){
    delayTimerId = setTimeout(intervalCallbacks, 500);
  };
  function setStopCondition(){
    let handler = () => {
      clearInterval(delayTimerId);
      clearInterval(intervalTimerId);
      document.removeEventListener('pointerup', handler);
    }

    document.addEventListener('pointerup', handler);
  };

  setNumberOfItems(e);
  delayedCallback();
  setStopCondition();
}

function onUnload(){
  clearInputCheckboxes();
  clearInputValue(document.getElementById('mainSearch'));
}

function onInputFocus(e){
  let input = e.target;
  if (input.value.length != 0) {
    input.classList.add('showing');
  }
}

function onInputChange(e){
  let input = e.target;
  let searchResultField = document.getElementById('searchResult');
  let searchResultFieldClone = searchResultField.cloneNode(true);
  let divTamplate = searchResultFieldClone.firstElementChild.cloneNode(true);
  let maxResults = 10;

  function appendResult() {
    let div = document.createElement('div');
    div = divTamplate.cloneNode(true);
    let resultContainingTag = div.querySelector('[data-marker]');
    resultContainingTag.innerHTML = input[resultContainingTag.dataset.marker];
    searchResultField.append(div);
  };

  if (input.value.length != 0) {
    input.classList.add('showing');
  } else {
    input.classList.remove('showing');
  }

  searchResultField.innerHTML = ` `;

  if (input.value.length == 0) maxResults = 1;

  for (let i = 0; i < maxResults; i++) {
    appendResult();
  }
}
// ***end of EVENT funcitons

// ***CHECK functions
function isOnScreen(elem){
  return elem.getBoundingClientRect().bottom > 0 && elem.getBoundingClientRect().top < window.innerHeight;
}
// ***end of CHECK functions

// ***other functions
function findItemById(id, collection){
  for(let obj of collection){
    if(id == obj.id) return obj;
  }
  return null;
}

function generateBuyMenu(item){ 
  if(!item){
    generateErrorMessage();
    return;
  }
  let itemName = document.querySelector(`[data-template-field='item-name']`);
  let img = document.querySelector(`[data-template-field='img']`);
  let errorMessage = 'failed to get item name';
  itemName.innerHTML = item.itemName || errorMessage;
  img.setAttribute('src', item.imgSrc || '');
}

function generateErrorMessage(){
  console.log('error');
}

function changeImgSrc(newSrc, elemToChange){
  elemToChange.src = newSrc;
}
// ***end of other functions