import MathQuill from './yimath.js';
var MQStatic = MathQuill.getInterface(2);
var problemSpan = document.getElementById('problem');
MQStatic.StaticMath(problemSpan);