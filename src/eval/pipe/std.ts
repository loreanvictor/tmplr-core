import {
  camelCase, capitalCase, constantCase,
  dotCase, headerCase, paramCase, pascalCase,
  pathCase, sentenceCase, snakeCase
} from 'change-case'


function skip(str: string, param: number | string) {
  if (typeof param === 'string') {
    if (/^\d+$/.test(param)) {
      return skip(str, parseInt(param))
    } else {
      return str.startsWith(param) ? str.slice(param.length) : str
    }
  } else {
    return str.slice(param)
  }
}


function trim(str: string, param: number | string) {
  if (typeof param === 'string') {
    if (/^\d+$/.test(param)) {
      return trim(str, parseInt(param))
    } else {
      return str.endsWith(param) ? str.slice(0, -param.length) : str
    }
  } else {
    return str.substring(0, str.length - param)
  }
}


function upperCase(str: string) {
  return str.toUpperCase()
}


function lowerCase(str: string) {
  return str.toLowerCase()
}


export const STANDARD_PIPES = {
  camelCase: (str: string) => camelCase(str),
  'Capital Case': (str: string) => capitalCase(str),
  CONSTANT_CASE: (str: string) => constantCase(str),
  'dot.case': (str: string) => dotCase(str),
  'Header-Case': (str: string) => headerCase(str),
  'param-case': (str: string) => paramCase(str),
  'kebab-case': (str: string) => paramCase(str),
  PascalCase: (str: string) => pascalCase(str),
  'path/case': (str: string) => pathCase(str),
  'Sentence case': (str: string) => sentenceCase(str),
  snake_case: (str: string) => snakeCase(str),
  UPPERCASE: upperCase,
  lowercase: lowerCase,
  skip,
  trim,
}
