(()=>{
  'use strict';
  const editable=target=>target instanceof Element&&Boolean(target.closest('textarea,select,[contenteditable=""],[contenteditable="true"],[role="textbox"],input:not([type]),input[type="text"],input[type="search"],input[type="email"],input[type="url"],input[type="tel"],input[type="number"],input[type="password"]'));
  // Keep native editing, paste, and accessibility controls available in real fields.
  document.addEventListener('contextmenu',event=>{
    if(!editable(event.target))event.preventDefault();
  },{capture:true});
  document.addEventListener('selectstart',event=>{
    if(!editable(event.target))event.preventDefault();
  },{capture:true});
  document.addEventListener('dragstart',event=>{
    if(!editable(event.target))event.preventDefault();
  },{capture:true});
})();
