"use client";

import { useEffect, useRef, type ReactNode } from "react";

const FOCUSABLE = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  const panelRef=useRef<HTMLElement|null>(null);
  const onCloseRef=useRef(onClose);
  onCloseRef.current=onClose;

  useEffect(()=>{
    const previous=document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const panel=panelRef.current;
    const first=panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first??panel)?.focus();

    function keydown(event:KeyboardEvent){
      if(event.key==="Escape"){
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if(event.key!=="Tab"||!panel) return;
      const focusable=Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((node)=>!node.hasAttribute("disabled"));
      if(focusable.length===0){event.preventDefault();panel.focus();return}
      const firstNode=focusable[0],lastNode=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===firstNode){event.preventDefault();lastNode.focus()}
      else if(!event.shiftKey&&document.activeElement===lastNode){event.preventDefault();firstNode.focus()}
    }

    document.addEventListener("keydown",keydown);
    return ()=>{
      document.removeEventListener("keydown",keydown);
      document.body.style.overflow=previousOverflow;
      previous?.focus();
    };
  },[]);

  return <div className={backdropClassName}>
    <section ref={panelRef} className={panelClassName} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
      {children}
    </section>
  </div>;
}
