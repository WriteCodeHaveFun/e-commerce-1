"use strict";

// ***Events
const pointerdownEventTargets = document.querySelectorAll('.set-number-of-items');
pointerdownEventTargets.forEach(
  e => e.addEventListener('pointerdown', onPointerDown)
);

document.addEventListener('click', onClick);
document.addEventListener('scroll', onScroll);

window.addEventListener('unload', onUnload);

let mainSearch = document.getElementById('mainSearch');
mainSearch.addEventListener('input', onInputChange);
mainSearch.addEventListener('focus', onInputFocus);
// ***end of Events

// ***GLOBAL VARIABLES
const MAX_PRICE = 999999;
const MAX_ITEMS_SHOWN = 4;
let searchResultClone = document.getElementById('searchResult').cloneNode(true);
let collectionOfItems = new Set();
// ***eng of GLOBAL VARIABLES

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
function addClassHere(target, className){
  if(target.classList.contains(className)) return;
  target.classList.add(className);
}

function toggleClassHere(target, className){
  target.classList.toggle(className);
}

function addClassTo(str){
  if(!~str.indexOf(' ')) return;
  let cssClass = str.slice(0, str.indexOf(' '));
  let addTo = str.slice(str.indexOf(' ')+1);
  document.querySelector('.' + addTo).classList.add(cssClass);
}

function removeClassFrom(str){
  if(!~str.indexOf(' ')) return;
  let cssClass = str.slice(0, str.indexOf(' '));
  let removeFrom = str.slice(str.indexOf(' ')+1);
  document.querySelector('.' + removeFrom).classList.remove(cssClass);
}

function toggleClassToThisNeighbor(target, str){
  if(!~str.indexOf(' ')) return;
  let cssClass = str.slice(0, str.indexOf(' '));
  let toggleTo = str.slice(str.indexOf(' ')+1);
  target.parentNode.querySelector('.' + toggleTo).classList.toggle(cssClass);
}

function toggleClassAtThisPosition(str){
  if(!~str.indexOf(' ')) return;
  let cssClass = str.slice(0, str.indexOf(' '));
  let toggleTo = str.slice(str.indexOf(' ')+1);
  if(document.querySelector(toggleTo)){
    document.querySelector(toggleTo).classList.toggle(cssClass);
  }
}

function setNumberOfItems(e){ // replace with next HTML+JS functionality:
                              // <input type="button" id="a" value="1" onclick="x.value=parseInt(--x.value)">
                              // <output name="x" for="a b">1</output>
                              // <input type="button" id="b" value="1" onclick="x.value=parseInt(++x.value)">
  let settings = Object.values(e.target.dataset)[0];

  if(!~settings.indexOf(' ')) return;

  let value = settings.slice(0, settings.indexOf(' '));
  let cssMarker = settings.slice(settings.indexOf(' ')+1);
  let inputField = e.target.parentNode.querySelector('.' + cssMarker);
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

function showElement(itemToShowId, whenThisElemNotOnScreen){ // Done

  let showThisElem = document.getElementById(itemToShowId);

  function hideEleme(){
    showThisElem.classList.add('negative-z-index');
    showThisElem.removeEventListener('transitionend', hideEleme);
  }

  if(!isOnScreen(whenThisElemNotOnScreen)){

    if(showThisElem.dataset.status == `show`) return;

    showThisElem.classList.add('animated-appearance');
    showThisElem.classList.remove('negative-z-index');
    showThisElem.removeEventListener('transitionend', hideEleme);

    showThisElem.dataset.status = `show`;
  } else{

    if(showThisElem.dataset.status == `hide`) return;

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

  if(e.target.dataset.clickAddClass){
    addClassHere(e.target, e.target.dataset.clickAddClass);
    e.preventDefault();
  } 

  if(e.target.dataset.clickToggleClass){
    toggleClassHere(e.target, e.target.dataset.clickToggleClass);
    e.preventDefault();
  } 

  if(e.target.dataset.clickAddClassTo){
    addClassTo(e.target.dataset.clickAddClassTo);
    e.preventDefault();
  } 
  if(e.target.dataset.clickRemoveClassFrom){
    removeClassFrom(e.target.dataset.clickRemoveClassFrom);
    e.preventDefault();
  } 
  if(e.target.dataset.clickToggleClassToThisNeighbor){
    toggleClassToThisNeighbor(e.target, e.target.dataset.clickToggleClassToThisNeighbor);
    e.preventDefault();
  }
  if(e.target.dataset.clickToggleClassAtThisPosition){
    toggleClassAtThisPosition(e.target.dataset.clickToggleClassAtThisPosition);
  }
  
  if(e.target.dataset.itemId){
    let id = Number(e.target.dataset.itemId);
    let obj = findObjById(id, collectionOfItems);
    generateBuyMenu(obj);
  }

  if(e.target.closest('#miniGalery')){ // этот функциона по-идее можно заменить на список из input radio:
                                       // какой input выбран, тот и показываем
    e.preventDefault();
    let src;
    if(e.target.tagName == 'IMG'){
      let img = e.target;
      src = img.getAttribute('src') || '';
    }else{
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
  if (!(e.target.dataset.decreaseValue || e.target.dataset.increaseValue)) return;
  
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

function onInputFocus(){
  if(this.value.length != 0){
    this.classList.add('showing');
  }
}

function onInputChange(){

  if(this.value.length != 0){
    this.classList.add('showing');
  }
  let searchResultField = document.getElementById('searchResult');

  searchResultField.innerHTML = ` `;

  if(this.value.length == 0) return;

  let input = this;
  for(let i = 0; i < 10; i++){
          let div = document.createElement('div');
          div = searchResultClone.firstElementChild.cloneNode(true);
          let markers = div.querySelectorAll('[data-marker]');
          for(let j = 0; j < markers.length; j++){
            markers[j].innerHTML = input[markers[j].dataset.marker];
          }
    searchResultField.append(div);
  }
}
// ***end of EVENT funcitons

// ***CHECK functions
function isOnScreen(elem){
  return elem.getBoundingClientRect().bottom > 0 && elem.getBoundingClientRect().top < window.innerHeight;
}
// ***end of CHECK functions

// ***other functions
function findObjById(id, collection){
  for(let obj of collection){
    if(id == obj.id) return obj;
  }
  return null;
}

function generateBuyMenu(obj){ 
  if(!obj){
    generateErrorMessage();
    return;
  }
  let itemName = document.querySelector(`[data-template-field='item-name']`);
  let img = document.querySelector(`[data-template-field='img']`);
  let errorMessage = 'failed to get item name';
  itemName.innerHTML = obj.itemName || errorMessage;
  img.setAttribute('src', obj.imgSrc || '');
}

function generateErrorMessage(){
  console.log('error');
}

function changeImgSrc(newSrc, elemToChange){
  elemToChange.src = newSrc;
}
// ***end of other functions