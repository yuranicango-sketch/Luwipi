"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type BackgroundState = {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
};

export function AccessibleModal({
  label,
  onClose,
  backdropClassName,
  panelClassName,
  children,
}: {
  label: string;
  onClose: () => void;
  backdropClassName: string;
  panelClassName: string;
  children: ReactNode;
}) {
  const [host,setHost]=useState<HTMLDivElement|null>(null);
  const panelRef=useRef<HTMLElement|null>(null);
  const previousFocusRef=useRef<HTMLElement|null>(null);
  const onCloseRef=useRef(onClose);
  onCloseRef.current=onClose;

  useEffect(()=>{
    previousFocusRef.current=document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const portalHost=document.createElement("div");
    portalHost.dataset.luwipiModalHost="true";
    document.body.appendChild(portalHost);

    const backgroundStates:BackgroundState[]=Array.from(document.body.children)
      .filter((node):node is HTMLElement=>node instanceof HTMLElement&&node!==portalHost)
      .map((element)=>({element,inert:element.inert,ariaHidden:element.getAttribute("aria-hidden")}));

    for(const {element} of backgroundStates){
      element.inert=true;
      element.setAttribute("aria-hidden","true");
    }

    setHost(portalHost);

    return ()=>{
      for(const {element,inert,ariaHidden} of backgroundStates){
        element.inert=inert;
        if(ariaHidden===null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden",ariaHidden);
      }
      portalHost.remove();
      previousFocusRef.current?.focus();
    };
  },[]);

  useEffect(()=>{
    if(!host) return;

    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";

    const panel=panelRef.current;
    const first=panel?.querySelector<HTMLElement>(FOCUSABLE);
    window.requestAnimationFrame(()=>{(first??panel)?.focus()});

    function keydown(event:KeyboardEvent){
      if(event.key==="Escape"){
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if(event.key!=="Tab"||!panel) return;

      const focusable=Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter((node)=>!node.hasAttribute("disabled")&&!node.closest('[aria-hidden="true"]'));

      if(focusable.length===0){
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstNode=focusable[0];
      const lastNode=focusable[focusable.length-1];

      if(event.shiftKey&&document.activeElement===firstNode){
        event.preventDefault();
        lastNode.focus();
      }else if(!event.shiftKey&&document.activeElement===lastNode){
        event.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown",keydown);

    return ()=>{
      document.removeEventListener("keydown",keydown);
      document.body.style.overflow=previousOverflow;
    };
  },[host]);

  if(!host) return null;

  return createPortal(
    <div className={backdropClassName}>
      <section ref={panelRef} className={panelClassName} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        {children}
      </section>
    </div>,
    host,
  );
}
