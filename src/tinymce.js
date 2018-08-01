// @flow

import update from "undate/lib/update"

import Editor from "./editor"
import { calculateElementOffset, getLineHeightPx } from "./utils"
import SearchResult from "./search_result"

const getCaretCoordinates = require("textarea-caret")

const CALLBACK_METHODS = ["onInput", "onKeydown"]

/**
 * Encapsulate the target textarea element.
 */
export default class TinyMCE extends Editor {
  el: HTMLTextAreaElement;
  elTinyMCE;

  /**
   * @param {HTMLTextAreaElement} el - Where the textcomplete works on.
   */
  constructor(el: HTMLTextAreaElement) {
    super()
    this.elTinyMCE = el

    CALLBACK_METHODS.forEach(method => {
      ;(this: any)[method] = (this: any)[method].bind(this)
    })

    this.startListening()
  }

  /**
   * @return {this}
   */
  destroy() {
    super.destroy()
    this.stopListening()
    // Release the element reference early to help garbage collection.
    ;(this: any).el = null
    return this
  }

  /**
   * Implementation for {@link Editor#applySearchResult}
   */
  applySearchResult(searchResult: SearchResult) {
    const before = this.getBeforeCursor()
    if (before != null) {
      const replace = searchResult.replace(before, this.getAfterCursor())
    //  this.el.focus() // Clicking a dropdown item removes focus from the element.
      if (Array.isArray(replace)) {
        //update(this.el, replace[0], replace[1])
        this.elTinyMCE.activeEditor.setContent(replace[0] + replace[1]);
        this.el.dispatchEvent(new Event("input"))
      }
    }
  }

  /**
   * Implementation for {@link Editor#getCursorOffset}
   */
  getCursorOffset() {

    return {top: 0, left: 0, lineHeight: 0};
    const elOffset = calculateElementOffset(this.el)
    const elScroll = this.getElScroll()
    const cursorPosition = this.getCursorPosition()
    const lineHeight = getLineHeightPx(this.el)
    const top = elOffset.top - elScroll.top + cursorPosition.top + lineHeight
    const left = elOffset.left - elScroll.left + cursorPosition.left
    if (this.el.dir !== "rtl") {
      return { top, left, lineHeight }
    } else {
      const right = document.documentElement
        ? document.documentElement.clientWidth - left
        : 0
      return { top, right, lineHeight }
    }
  }

  /**
   * Implementation for {@link Editor#getBeforeCursor}
   */
  getBeforeCursor() {

      return this.elTinyMCE.activeEditor.selection.getRng().startContainer.textContent;
  }

  /** @private */
  getAfterCursor() {

      return this.elTinyMCE.activeEditor.selection.getRng().endContainer.textContent;
  }

  /** @private */
  getElScroll(): { top: number, left: number } {
    return { top: this.el.scrollTop, left: this.el.scrollLeft }
  }

  /**
   * The input cursor's relative coordinates from the textarea's left
   * top corner.
   *
   * @private
   */
  getCursorPosition(): { top: number, left: number } {
    return getCaretCoordinates(this.el, this.el.selectionEnd)
  }

  /** @private */
  onInput() {
    this.emitChangeEvent()
  }

  /** @private */
  onKeydown(e: KeyboardEvent) {
    const code = this.getCode(e)
    let event
    if (code === "UP" || code === "DOWN") {
      event = this.emitMoveEvent(code)
    } else if (code === "ENTER") {
      event = this.emitEnterEvent()
    } else if (code === "ESC") {
      event = this.emitEscEvent()
    }
    if (event && event.defaultPrevented) {
      e.preventDefault()
    }
  }

  /** @private */
  startListening() {
    this.elTinyMCE.activeEditor.on('input', this.onInput);
    this.elTinyMCE.activeEditor.on('keydown', this.onKeydown);
  }

  /** @private */
  stopListening() {
    this.elTinyMCE.activeEditor.off('input', this.onInput);
    this.elTinyMCE.activeEditor.off('keydown', this.onKeydown);
  }
}