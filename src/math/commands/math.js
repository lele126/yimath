import P from '../p.js'
import L from '../var/L.js'
import R from '../var/R.js'
import {RootBlockMixin} from '../publicapi.js'
import Options from '../var/Options.js'
import API from '../var/API.js'
import APIClasses from '../var/APIClasses.js'
import Node from '../Node.js'
import {Digit } from './math/basicSymbols.js'
import BinaryOperator from './BinaryOperator.js'
import MathBlock from './MathBlock.js'
import RootMathBlock from './RootMathBlock.js'
import {noop} from '../intro.js'
/*************************************************
 * Abstract classes of math blocks and commands.
 ************************************************/
Options.p.mouseEvents = true;
API.StaticMath = function(APIClasses) {
  return P(APIClasses.AbstractMathQuill, function(_, super_) {
    this.RootBlock = MathBlock;
    _.__mathquillify = function(opts, interfaceVersion) {
      this.config(opts);
      super_.__mathquillify.call(this, 'mq-math-mode');
      if (this.__options.mouseEvents) {
        this.__controller.delegateMouseEvents();
        this.__controller.staticMathTextareaEvents();
      }
      return this;
    };
    _.init = function() {
      super_.init.apply(this, arguments);
      this.__controller.root.postOrder(
        'registerInnerField', this.innerFields = [], APIClasses.InnerMathField);
    };
    _.latex = function() {
      var returned = super_.latex.apply(this, arguments);
      if (arguments.length > 0) {
        this.__controller.root.postOrder(
          'registerInnerField', this.innerFields = [], APIClasses.InnerMathField);
      }
      return returned;
    };
  });
};

API.MathField = function(APIClasses) {
  return P(APIClasses.EditableField, function(_, super_) {
    this.RootBlock = RootMathBlock;
    _.__mathquillify = function(opts, interfaceVersion) {
      this.config(opts);
      if (interfaceVersion > 1) this.__controller.root.reflow = noop;
      super_.__mathquillify.call(this, 'mq-editable-field mq-math-mode');
      delete this.__controller.root.reflow;
      return this;
    };
  });
};

API.InnerMathField = function(APIClasses) {
  return P(APIClasses.MathField, function(_, super_) {
    _.makeStatic = function() {
      this.__controller.editable = false;
      this.__controller.root.blur();
      this.__controller.unbindEditablesEvents();
      this.__controller.container.removeClass('mq-editable-field');
    };
    _.makeEditable = function() {
      this.__controller.editable = true;
      this.__controller.editablesTextareaEvents();
      this.__controller.cursor.insAtRightEnd(this.__controller.root);
      this.__controller.container.addClass('mq-editable-field');
    };
  });
};

export default MathBlock;
