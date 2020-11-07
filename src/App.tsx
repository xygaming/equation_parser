// EQUATION PARSER MADE BY JOSH M (xygaming)
// IF YOU PLAN ON USING MY SH***Y CODE, MAKE SURE TO READ THE MIT LISENCE!
// THIS IS DESIGNED TO COMPLETE ADDITION, SUBTRACTION, MULTIPLICATION, AND DIVISION
// THE PURPOSE OF THIS PROJECT WAS TO UTILIZE REGEX IN A PROJECT
// COPYRIGHT 2020

import React from 'react';
import './App.css';

class App extends React.Component {
  state: {
    equation: string,
  }
  constructor(props: React.ReactPropTypes) {
    super(props);
    this.state = {
      equation: '',
    }
  }
  getEquation() {
    this.setState({
      equation: (document.getElementById("equation") as HTMLInputElement).value.replace(/ /g, ''),
    }, () => {
      if (this.isEquation()) {
        this.parseEquation();
        (document.getElementById("enter") as HTMLButtonElement).style.display = 'none';
        (document.getElementById("reset") as HTMLButtonElement).style.display = 'inherit';
      }
    })
  }
  isEquation() {
    if (this.state.equation.match(/[^*-+/() 0123456789]/g)) {
       (document.getElementById("solution") as HTMLDivElement).innerText = 'Please only use the characters, "* - + / ( )" for operations and "[0-9]" for digits.';
      return false
    } else if (!this.state.equation.trim().length) {
      (document.getElementById("equation") as HTMLInputElement).value = '';
      return false
    }
    return true
  }
  parseEquation() {
    let equation:string = this.state.equation.replace(/ /g, '') as string;
    (document.getElementById("equation") as HTMLInputElement).value = equation;
    const solution = this.PEMDAS(equation);
    (document.getElementById('solution') as HTMLDivElement).innerText = `${this.state.equation} = ${solution.toString()}`;
  }
  PEMDAS(equation:string): number {
    // CHANGES '.#' WITH '0.#'
    equation = equation.replace(/(?<!\d+)\./g, '0.');
    // CHANGES '-' WITH '+-' WHICH MAKES SUBTRACTION INTO ADDITION
    equation = equation.replace(/(?<=[0-9])-/, '+-');
    // CHANGES '/' WITH '*d' WHICH ALLOWS THE FLOW TO BE LEFT TO RIGHT!
    equation = equation.replace(/(?<=[0-9])\//, '*d');
    // RUNS UNTIL NO MORE OPERATIONS CAN BE MADE)
    if (equation.match(/[()-+*/]/)) {
      if (equation.match(/\((\d+(\p\d+)?([+-/*]?)){1,}\)|\((\d+(\p\d+)?([+-/*]?)){1,}$/g)) {
        let Element: string = (equation.match(/\((\d+(\p\d+)?([+-/*]?)){1,}\)|\((\d+(\p\d+)?([+-/*]?)){1,}$/g) as Array<string>)[0]
        console.log(Element);
        let inParen: string[] | string = Element.split('');
        // REMOVES PARENTHESIS TO SOLVE WHAT'S INSIDE
        inParen.shift();
        if (inParen[inParen.length - 1] === ')') {
          inParen.pop();
        }
        inParen = inParen.join('');
        // COMPLETES WHAT'S INSIDE OF PARENTHESIS
        if (inParen.match(/[()-+/*]/g)) {
          equation = equation.replace(inParen, (this.PEMDAS(inParen) as number).toString());
        }
        // DISCOVER PARENTHESIS TYPE (EARLY OPERATION OR MULTIPLICATION OR BOTH)
        if (equation.match(/(?<![+-/*(])(\(\d+(\.\d+)?\))|(?<![+-/*(])(\(\d+(\.\d+)?)/g)) {
          (equation.match(/(?<![+-/*(])(\(\d+(\.\d+)?\))|(?<![+-/*(])(\(\d+(\.\d+)?)/g) as string[]).forEach(Element => {
            let innerNum: string[] | number = Element.split('');
            innerNum.shift();
            if (innerNum[innerNum.length - 1] === ')') {
              innerNum.pop();
            }
            innerNum = parseFloat(innerNum.join(''));
            equation = equation.replace(Element, `*${innerNum}`);
            if (equation.split('')[0] === '*') {
              let temp: string[] = equation.split('');
              temp.shift();
              equation = temp.join('');
            }
          })
        } else {
          equation = equation.replace(/[)(]/g, '');
        }
      }
      // MULTIPLICATION (AND DIVISION)
      if (equation.match(/(?:-?\d+(\.\d+)?\*d?-?\d+(\.\d+)?){1}/g)) {
        let returnSol: number = 0;
        let Element: string = (equation.match(/(?:-?\d+(\.\d+)?\*d?-?\d+(\.\d+)?){1}/g) as Array<string>)[0];
        let nums: string[] = Element.split('*');
        returnSol = parseFloat(nums[0]);
        // CHECKS IF IT BEGINS WITH 'd' WHICH DECLARES DEVISION
        if (nums[1].match(/^d/)) {
          nums[1] = (((nums[1] as string).split('') as Array<string>).splice(1, nums[1].length) as string[]).join('');
          returnSol /= parseFloat(nums[1]);
        } else {
          returnSol *= parseFloat(nums[1]);
        }
        equation = equation.replace(Element, returnSol.toString());
        return this.PEMDAS(equation);
      }
      // ADDITION (AND SUBTRACTION)
      if (equation.match(/(?:-?\d+(\.\d+)?\+-?\d+(\.\d+)?){1}/g)) {
        let returnSol: number = 0;
        let Element: string = (equation.match(/(?:-?\d+(\.\d+)?\+-?\d+(\.\d+)?){1}/g) as Array<string>)[0]
        let add: string[] = Element.split('+');
        returnSol = parseFloat(add[0]) + parseFloat(add[1]);
        equation = equation.replace(Element, returnSol.toString());
        return this.PEMDAS(equation)
      }
    }
    return parseFloat(equation)
  }
  reset() {
    (document.getElementById('solution') as HTMLDivElement).innerText = '';
    this.setState({
      equation: '',
    }, () => {
      (document.getElementById('equation') as HTMLInputElement).value = '';
      (document.getElementById('enter') as HTMLButtonElement).style.display = 'inherit';
      (document.getElementById('reset') as HTMLButtonElement).style.display = 'none';
    });
  }
  render() {
    return (
      <>
        <input type='text' id='equation' autoComplete="off" aria-autocomplete="none" autoSave="off"></input>
        <span>
          <button onClick={() => this.getEquation()} id='enter'>Enter</button>
          <button onClick={() => this.reset()} id='reset' style={{'display':'none'}}>Reset</button>
        </span>
        <div id="solution"></div>
      </>
    )
  }
}

export default App;

/*
CHANGELOG :
  v1.1 11/6/2020 19:07 --
    FIXED BUG WITH NESTED PARENTHESIS
    **WILL POST ON GIT SOON

  v1.0 11/6/2020 18:13 --
    IMPLEMENTED ADDITION, SUBTRACTION, DIVISION, AND MULTIPLICATION
    IMPLEMENTED ABILITY TO USE PARENTHESIS
    PLANS :: WIP
      ADD TRIGONOMETRIC FUNCTIONS
      ADD ABILITY TO SPECIFY ROUNDING
      ADD CSS TO MAKE LOOK NICER
*/