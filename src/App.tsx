// EQUATION PARSER MADE BY JOSH M (github : xygaming)
// IF YOU PLAN ON USING MY SH***Y CODE, MAKE SURE TO FOLLOW THE MIT LICENSE!
// THIS IS DESIGNED TO COMPLETE ADDITION, SUBTRACTION, MULTIPLICATION, AND DIVISION
// THE PURPOSE OF THIS PROJECT WAS TO UTILIZE REGEX IN A PROJECT
// COPYRIGHT 2020

// NOTE : AS OF TYPING THIS, VERY LITTLE REACT SYNTAX IS IN THE CODE
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
  isEquation(equation = this.state.equation): boolean {
    if (equation.match(/[^*+-^/() 0123456789]/g) && !equation.match(/\b(sin|tan|cos|csc|sec|cot)\b\(.{1,}\)/g)) {
      (document.getElementById("solution") as HTMLDivElement).innerText = 'Please only use the characters, "* - + ^ / ( )" or trig functions for operations and "[0-9]" for digits.';
      return false
    } else if (!equation.trim().length) {
      (document.getElementById("equation") as HTMLInputElement).value = '';
      return false
    }
    return true
  }
  parseEquation() {
    let equation:string = this.state.equation.replace(/ /g, '') as string;
    (document.getElementById("equation") as HTMLInputElement).value = equation;
    equation = this.transformEquation(equation);
    const solution = this.PEMDAS(equation);
    if (!isNaN(solution)) {
      (document.getElementById('solution') as HTMLDivElement).innerText = `${this.state.equation} = ${solution.toString()}`;
    }
  }
  transformEquation(equation: string): string {
    // CHANGES '.#' WITH '0.#'
    equation = equation.replace(/(?<!\d|\))\./g, '0.');
    // CHANGES '-' WITH '+-' WHICH MAKES SUBTRACTION INTO ADDITION
    equation = equation.replace(/(?<=\d|\))-/g, '+-');
    // PUTS ALL TRIG FUNCTIONS IN PARENTHESIS
    equation = equation.replace(/\b(sin|tan|cos|csc|sec|cot)+?\b\(.*\){1,}/g, '($&)');
    // CHANGES '/' WITH '*d' WHICH ALLOWS THE FLOW TO BE LEFT TO RIGHT!
    equation = equation.replace(/(?<=\d|\))\//g, '*d');
    // TRANSFORMS EXPONENTS (MIGHT DO AGAIN SO SEPERATE FUNCTION)
    equation = this.transformExponents(equation);
    return equation;
  }
  transformExponents(equation: string): string { // THIS IS SEPERATE FOR EXPONENT RULES!
    // CHANGES #^# TO (#^#) FOR MATH REASONS
    let closingParens: string[] | string = [];
    if (equation.match(/(\d+(\.\d+)?\^)+\d+(\.\d+)?/g)) {
      for (let i of equation.match(/(\d+(\.\d+)?\^)+\d+(\.\d+)?/g) as string[]) {
        closingParens.push(')');
        for (let j = 0; j < (i.match(/\^/g) as string[]).length - 1; j++) {
          closingParens[equation.indexOf(i)] += ')';
        }
      }
    }
    equation = equation.replace(/\d+(\.\d+)?(?=\^)/g, '($&');
    for (let i = 0; i < closingParens.length; i++) {
      equation = equation.replace(/((?<=\^)\d+(\.\d+)?)(?!^)/g, '$&' + closingParens[i]);
    }
    return equation;
  }
  PEMDAS(equation: string): number {
    if (equation === 'NaN') {
      (document.getElementById("solution") as HTMLDivElement).innerText = 'Something went wrong, clear and try again!';
      return NaN
    }
    if (equation.match(/^\(\d+(\.\d+)?\)$/g)) {return parseFloat((equation.match(/\d+(\.\d+)?/g) as string[])[0] as string)}
    // RUNS UNTIL NO MORE OPERATIONS CAN BE MADE)
    if (equation.match(/[-+*d^()]/)) {
      // SOLVE TIG FUNCTIONS
      if (equation.match(/\b(sin|tan|cos|csc|sec|cot)+?\b\(.*\)/g)) {
        (equation.match(/\b(sin|tan|cos|csc|sec|cot)+?\b\(.*\)/g)as string[]).forEach(Element => {
          let tempCheck: string = Element.split('').slice(4, Element.length - Element.split('').reverse().indexOf(')')-2).join('');
          while (tempCheck.split('')[tempCheck.length - 1] === ')') {
            tempCheck = tempCheck.split('').slice(0, tempCheck.length - 1).join('');
          }
          if (this.isEquation(tempCheck)) {
            equation = equation.replace(tempCheck, this.PEMDAS(tempCheck).toString());
          } else {
            equation = 'NaN';
          }
        });
        (equation.match(/\b(sin|tan|cot|cos|csc|sec)\b\(\d+(\.\d+)?\)/g))?.forEach(Element => {
          let returnSol: number = 0;
          let trigFunc: string = Element.split('').slice(0,3).join('');
          switch(trigFunc) {
            case 'sin':
              returnSol = Math.sin(this.toDegrees(parseFloat(Element.split('').slice(4,Element.length-1).join(''))));
              break;
            case 'cos':
              returnSol = Math.cos(this.toDegrees(parseFloat(Element.split('').slice(4,Element.length-1).join(''))));
              break;
            case 'tan':
              returnSol = Math.tan(this.toDegrees(parseFloat(Element.split('').slice(4,Element.length-1).join(''))));
              break;
            case 'cot':
              returnSol = 1/Math.tan(this.toDegrees(parseFloat(Element.split('').slice(4,Element.length-1).join(''))));
              break;
            case 'csc':
              returnSol = 1/Math.sin(this.toDegrees(parseFloat(Element.split('').slice(4,Element.length-1).join(''))));
              break;
            case 'sec':
              returnSol = 1/Math.cos(this.toDegrees(parseFloat(Element.split('').slice(4,Element.length-1).join(''))));
              break;
          }
          equation = equation.replace(Element, `${returnSol}`);
        })
        return this.PEMDAS(equation);
      }
      // PARENTHESIS CHECKER
      if (equation.match(/(\((\d+(\.\d+)?[-+*d^()]*?)\d+(\.\d+)?\))|(\((\d+(\.\d+)?[-+*d()]*?)\d+(\.\d+)?$)/g)) {
        (equation.match(/(\((\d+(\.\d+)?[-+*d^()]*?)\d+(\.\d+)?\))|(\((\d+(\.\d+)?[-+*d()]*?)\d+(\.\d+)?$)/g) as Array<string>).forEach(Element => {
          let inParen: string[] | string = Element.split('');
          // REMOVES PARENTHESIS TO SOLVE WHAT'S INSIDE
          inParen.shift();
          if (inParen[inParen.length - 1] === ')') {
            inParen.pop();
          }
          inParen = inParen.join('');
          // COMPLETES WHAT'S INSIDE OF PARENTHESIS
        if (inParen.match(/[-+*d^()]/g)) {
            equation = equation.replace(inParen, this.PEMDAS(inParen).toString());
          }
        });
        // DISCOVER PARENTHESIS TYPE (EARLY OPERATION OR MULTIPLICATION OR BOTH)
        if (equation.match(/(?<![-+*^(d])(\(-?\d+(\.\d+)?\))|(?<![+-/^*(d])(\(-?\d+(\.\d+)?)/g)) {
          (equation.match(/(?<![-+/*^(d])(\(-?\d+(\.\d+)?\))|(?<![+-/^*(d])(\(-?\d+(\.\d+)?)/g) as string[]).forEach(Element => {
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
        }
        // Get's rid of the rest of the parenthesis
        equation = equation.replace(/[)(]/g, '');
        // This will reset parenthesis for exponents (cuz exponents suck)
        equation = this.transformExponents(equation);
        return this.PEMDAS(equation);
      }
      // EXPONENTS
      if (equation.match(/(?:-?\d+(\.\d+)?\^-?\d+(\.\d+)?){1}/g)) {
        let returnSol: number = 0;
        let Element: string = (equation.match(/(?:-?\d+(\.\d+)?\^-?\d+(\.\d+)?){1}/g) as string[])[0];
        let nums: string[] = Element.split('^');
        returnSol = parseFloat(nums[0])**parseFloat(nums[1]);
        equation = equation.replace(Element, returnSol.toString());
        return this.PEMDAS(equation);
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
        if (nums[0].split('')[0] === '-') {
          equation = equation.replace(Element, '+' + returnSol.toString());
        } else {
          equation = equation.replace(Element, returnSol.toString());
        }
        return this.PEMDAS(equation);
      }
      // ADDITION (AND SUBTRACTION)
      if (equation.match(/(?:-?\d+(\.\d+)?\++-?\d+(\.\d+)?)/g)) {
        let returnSol: number = 0;
        let Element: string = (equation.match(/-?\d+(\.\d+)?\++-?\d+(\.\d+)?/g) as Array<string>)[0]
        let add: string[] = Element.split(/\++/);
        returnSol = parseFloat(add[0]) + parseFloat(add[1]);
        equation = equation.replace(Element, returnSol.toString());
        return this.PEMDAS(equation)
      }
    }
    return parseFloat(equation)
  }
  toDegrees(angle: number): number {
    return angle*(Math.PI/180);
  }
  reset() {
    console.clear();
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
  v1.42 11/11/2020 15:03 --
    FIXED BREAKING IF TRIG FUNCTION IS WRONG
    GOT WIFI BACK YAY

  v1.4  11/10/2020 23:56 --
    FIXED BUG WITH DOUBLE ADDITION SIGNS BEING CAUSED BY MULTIPLICATION
    WOW AM I BAD AT REGEX + TRIG LOL === FIXED MORE TRIG BUGS
    FIXED A MAJOR DIVISION BUG
      I HAD IT CHECKING FOR '[*.../]' [ignore ellipse] WHERE DIVISION IS SEEN AS '[*d]'
    CREATOR NOTE : I HAVE NO WIFI SO THE COMMIT WILL BE REALLY AFTER THIS TIMESTAMP

  v1.3 11/9/2020 16:27 --
    WOAH THERE BUGS, WASSUP?
    FIXED WAYYY TOO MANY BUGS THAT SEEMED TO BE MISSED BEFORE
    FINISHED ADDING TRIG FUNCTIONS

  v1.3 11/9/2020 11:36 --
    FIXED SOME REALLY MEAN PARENTHESIS BUGS :(
    STARTING TRIG FUNCTIONS

  v1.2 11/8/2020 22:44 --
    ADDED EXPONENTS
    FIXED SOME INFINITE LOOP ISSUES
    FIXED PARENTHESIS MESSING UP ISSUES

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
