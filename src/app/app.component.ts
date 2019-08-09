import { Component, ViewChild, ElementRef, HostListener, NgZone, OnInit, OnDestroy } from '@angular/core';
import { Circle } from './circle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Japanese Number Translator';

  private written = new Array();
  private tempWritten = new Array();
  private finalStr = '';
  private total: number;
  private subTotal: number;

  // Canvas variables
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  ctx: CanvasRenderingContext2D;
  requestId;
  interval;
  resizeTimeout;
  fireflies: Circle[] = [];
  numberOfFireflies = 100;
  refreshInterval = 30;

  @HostListener('window:resize')
  onWindowResize() {
    // debounce resize, wait for resize to finish before doing stuff
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = setTimeout((() => {
      this.canvas.nativeElement.setAttribute('width', window.innerWidth.toString());
      this.canvas.nativeElement.setAttribute('height', window.innerHeight.toString());
    }).bind(this), this.refreshInterval);
  }

  constructor( private ngZone: NgZone ) {}

  ngOnInit() {
    this.canvas.nativeElement.setAttribute('width', window.innerWidth.toString());
    this.canvas.nativeElement.setAttribute('height', window.innerHeight.toString());

    this.ctx = this.canvas.nativeElement.getContext('2d');

    for (let i = 0; i < this.numberOfFireflies; i++) {
      this.fireflies[i] = new Circle(this.ctx);
      this.fireflies[i].reset();
    }
    this.ngZone.runOutsideAngular(() => this.draw());
    this.interval = setInterval(() => {
      this.draw();
    }, this.refreshInterval);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.fireflies.forEach((firefly: Circle) => {
      firefly.fade();
      firefly.move();
      firefly.draw();
    });
    this.requestId = requestAnimationFrame(() => this.draw);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    cancelAnimationFrame(this.requestId);
  }

  translate(userInput: string): void {
    this.convertToDecimal(userInput);
    this.convertToFullWritten(this.total);
  }

  // 五億百九十万二千三百八
  // 百九十万二千三百八
  // 001 902 308

  convertToFullWritten(numeric: number): void {
    this.written = new Array();
    this.tempWritten = new Array();
    this.finalStr = '';

    if (numeric === 0) {
      this.written.push('Zero');
      return;
    }

    let numericString = this.reverseString(numeric.toString());
    numericString = this.fillWithZeroes(numericString);

    const length = numericString.length;
    const setsArray = new Array();
    let set = new Array();

    // Split number in groups of 3
    let i = 0;
    while (i < length) {
      set.push(numericString.charAt(i));

      i++;

      if (i % 3 === 0　|| i + 1 > length) {
        set.reverse();
        setsArray.push(set);
        set = new Array();
      }
    }

    for (let j = 0; j < setsArray.length; j++) {
      this.tempWritten = new Array();
      this.getNumberWordSet(setsArray[j], j);

      switch (j) {
        case 1:
          this.tempWritten.push('thousand');
          break;
        case 2:
          this.tempWritten.push('million');
          break;
        case 3:
          this.tempWritten.push('billion');
          break;
        case 4:
          this.tempWritten.push('trillion');
          break;
        case 5:
          this.tempWritten.push('quadrillion');
          break;
      }

      this.tempWritten.reverse();
      this.written.push(this.tempWritten);
    }

    this.written.reverse();

    this.written.forEach(group => {
      group.reverse();

      group.forEach(part => this.finalStr += part + ' ');
    });
  }

  getNumberWordSet(set: string, mult: number) {
    let i = 0;
    while (i < 3) {
      const num = set[i];
      if (num !== '0') {
        if (i === 0) {
          this.getWrittenHundreds(num);
          if (set[1] === '0') { this.tempWritten.push('and'); }
        } else if (i === 1) {
          this.getWrittenTens(num, set[i + 1]);
          if (set[1] === '1') { i++; }
        } else {
          this.getWrittenDigits(num);
        }
      }
      i++;
    }
  }

  getWrittenDigits(str: string): void {
    switch (str) {
      case '1':
        this.tempWritten.push('one');
        return;
      case '2':
          this.tempWritten.push('two');
        return;
      case '3':
          this.tempWritten.push('three');
        return;
      case '4':
          this.tempWritten.push('four');
        return;
      case '5':
          this.tempWritten.push('five');
        return;
      case '6':
          this.tempWritten.push('six');
        return;
      case '7':
          this.tempWritten.push('seven');
        return;
      case '8':
          this.tempWritten.push('eight');
        return;
      case '9':
          this.tempWritten.push('nine');
        return;
    }
  }

  getWrittenTeens(str: string): void {
    switch (str) {
      case '1':
          this.tempWritten.push('eleven');
        return;
      case '2':
          this.tempWritten.push('twelve');
        return;
      case '3':
          this.tempWritten.push('thirteen');
        return;
      case '4':
          this.tempWritten.push('fourteen');
        return;
      case '5':
          this.tempWritten.push('fifteen');
        return;
      case '6':
          this.tempWritten.push('sixteen');
        return;
      case '7':
          this.tempWritten.push('seventeen');
        return;
      case '8':
          this.tempWritten.push('eighteen');
        return;
      case '9':
          this.tempWritten.push('nineteen');
        return;
    }
  }

  getWrittenTens(str: string, next: string): void {
    switch (str) {
      case '1':
        this.getWrittenTeens(next);
        return;
      case '2':
          this.tempWritten.push('twenty');
        return;
      case '3':
          this.tempWritten.push('thirty');
        return;
      case '4':
          this.tempWritten.push('forty');
        return;
      case '5':
          this.tempWritten.push('fifty');
        return;
      case '6':
          this.tempWritten.push('sixty');
        return;
      case '7':
          this.tempWritten.push('seventy');
        return;
      case '8':
          this.tempWritten.push('eighty');
        return;
      case '9':
          this.tempWritten.push('ninety');
        return;
    }
  }

  getWrittenHundreds(str: string): void {
    switch (str) {
      case '1':
          this.tempWritten.push('one hundred');
        return;
      case '2':
          this.tempWritten.push('two hundred');
        return;
      case '3':
          this.tempWritten.push('three hundred');
        return;
      case '4':
          this.tempWritten.push('four hundred');
        return;
      case '5':
          this.tempWritten.push('five hundred');
        return;
      case '6':
          this.tempWritten.push('six hundred');
        return;
      case '7':
        this.tempWritten.push('seven hundred');
        return;
      case '8':
        this.tempWritten.push('eight hundred');
        return;
      case '9':
        this.tempWritten.push('nine hundred');
        return;
    }
  }

  fillWithZeroes(str: string): string {
    while (str.length % 3 !== 0) {
      str += '0';
    }
    return str;
  }

  convertToDecimal(userInput: string): void {
    this.total = 0;
    this.subTotal = 0;
    const length = userInput.length;
    let currentNumber = 0;
    let multiplier = 1;
    let base: number;

    // Go through each character
    for (let i = 0; i < length; i++) {
      currentNumber = this.getValue(userInput.charAt(i));
      base = 0;

      // It's a number from 1 to 9
      if (currentNumber < 10) {
        multiplier = currentNumber;
        // Check if this is the last number
        if (i === length - 1) {
          this.subTotal += multiplier;
          multiplier = 1;
          this.total += this.subTotal;
          this.subTotal = 0;
        } else if (this.getValue(userInput.charAt(i + 1)) > 1000) { // If a big multiplier is next, add this value to the subtotal
          this.subTotal += multiplier;
          multiplier = 1;
        }
      } else if (currentNumber >= 10 && currentNumber <= 1000) { // Add 十, 百 and 千
        base = currentNumber;
        this.subTotal += base * multiplier;
        multiplier = 1;

        // Check if this is the last number
        if (i === length - 1) {
          this.total += this.subTotal;
          this.subTotal = 0;
        }
      } else { // Treat big multipliers
        this.subTotal === 0 ? this.total += currentNumber : this.total += this.subTotal * currentNumber;
        this.subTotal = 0;
        multiplier = 1;
      }
    }
  }

  isSpecialMultiplier(value: number): boolean {
    switch (value) {
      case 10000:
      case 100000000:
      case 1000000000000:
        return true;
      default:
        return false;
    }
  }

  // Return each kanji's numerical value
  getValue(symbol: string): number {
    switch (symbol) {
      case '一':
        return 1;
      case '二':
        return 2;
      case '三':
        return 3;
      case '四':
        return 4;
      case '五':
        return 5;
      case '六':
        return 6;
      case '七':
        return 7;
      case '八':
        return 8;
      case '九':
        return 9;
      case '十':
        return 10;
      case '百':
        return 100;
      case '千':
        return 1000;
      case '万':
        return 10000;
      case '億':
        return 100000000;
      case '兆':
        return 1000000000000;
      default:
        return 0;
    }
  }

  // Reverse a string
  reverseString(str: string): string {
    return str.split('').reverse().join('');
  }
}
