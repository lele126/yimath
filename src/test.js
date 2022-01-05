import MathQuill from './yimath.js';
var MQStatic = MathQuill.noConflict().getInterface(2);
var latex = document.getElementById('latex');
MQStatic.StaticMath(latex);
var MQ = MathQuill.getInterface(2);
var answerSpan = document.getElementById('math');
  var answerMathField = MQ.MathField(answerSpan, {
	handlers: {
	  edit: function() {
		var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
		console.log(enteredMath)
		var latex = document.getElementById('latex');
		latex.innerText = enteredMath;
		MQStatic.StaticMath(latex);
	  }
	}
  });