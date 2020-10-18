import {toInlineStyles} from '@core/utils'
import {defaultStyles} from '@/constants'
import {parse} from '@core/parse'

const CODES = {
  A: 65,
  Z: 90
}
const DEFAULT_WIDTH = 120
const DEFAULT_HEIGHT = 24

function getWidth(state, index) {
  return (state[index] || DEFAULT_WIDTH) + 'px'
}

function getHeight(state, index) {
  return (state[index] || DEFAULT_HEIGHT) + 'px'
}

function toCell(state, rowIndex) {
  return function(_, colIndex) {
    const id = `${rowIndex}:${colIndex}`
    const width = getWidth(state.colState, colIndex)
    const data = state.dataState[id]
    const styles = toInlineStyles({
      ...defaultStyles,
      ...state.stylesState[id]
    })
    return `
      <div
        class="cell" 
        contenteditable 
        data-col="${colIndex}"
        data-type="cell"
        data-id="${id}"
        data-value="${data || ''}"
        style="${styles};width: ${width}"
      >${parse(data) || ''}</div>
    `
  }
}

function toColumn({col, index, width}) {
  return `
    <div 
      class="column" 
      data-type="resizable" 
      data-col="${index}" 
      style="width: ${width}"
    >
      ${col}
      <div class="col-resize" data-resize="col"></div>
    </div>
  `
}

function createRow(index, content, state) {
  const resize = index ? '<div class="row-resize" data-resize="row"></div>' : ''
  const height = getHeight(state, index)
  return `
    <div 
      class="row" 
      data-type="resizable" 
      data-row="${index}" 
      style="height: ${height}"
    >
     <div class="row-info">
        ${index ?? ''}
        ${resize}
     </div>
     <div class="row-data">${content}</div>
    </div>
  `
}

function toChar(_, index) {
  return String.fromCharCode(CODES.A + index)
}

function withWidthFrom(state) {
  return function(col, index) {
    return {
      col, index, width: getWidth(state.colState, index)
    }
  }
}

export function createTable(rowsCount = 20, state = {}) {
  const colsCount = CODES.Z - CODES.A + 1
  const rows = []
  const cols = new Array(colsCount)
      .fill('')
      .map(toChar)
      .map(withWidthFrom(state))
      .map(toColumn)
      .join('')

  rows.push(createRow(null, cols, {}))
  for (let rowIdx = 0; rowIdx < rowsCount; rowIdx++) {
    const cells = new Array(colsCount)
        .fill('')
        .map(toCell(state, rowIdx))
        .join('')
    rows.push(createRow(rowIdx + 1, cells, state.rowState))
  }

  return rows.join('')
}
