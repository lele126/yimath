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
import MathElement from './MathElement.js'
import RootMathBlock from './RootMathBlock.js'
import {noop} from '../intro.js'
/*************************************************
 * Abstract classes of math blocks and commands.
 ************************************************/

/**
 * Math tree node base class.
 * Some math-tree-specific extensions to Node.
 * Both MathBlock's and MathCommand's descend from it.
 */


/**
 * Commands and operators, like subscripts, exponents, or fractions.
 * Descendant commands are organized into blocks.
 */




/**
 * Children and parent of MathCommand's. Basically partitions all the
 * symbols and operators that descend (in the Math DOM tree) from
 * ancestor operators.
 */
var MathBlock = P(MathElement, function(_, super_) {
  _.join = function(methodName) {
    return this.foldChildren('', function(fold, child) {
      return fold + child[methodName]();
    });
  };
  _.html = function() { return this.join('html'); };
  _.latex = function() { return this.join('latex'); };
  _.text = function() {
    return (this.ends[L] === this.ends[R] && this.ends[L] !== 0) ?
      this.ends[L].text() :
      this.join('text')
    ;
  };

  _.keystroke = function(key, e, ctrlr) {
    if (ctrlr.options.spaceBehavesLikeTab
        && (key === 'Spacebar' || key === 'Shift-Spacebar')) {
      e.preventDefault();
      ctrlr.escapeDir(key === 'Shift-Spacebar' ? L : R, key, e);
      return;
    }
    return super_.keystroke.apply(this, arguments);
  };

  // editability methods: called by the cursor for editing, cursor movements,
  // and selection of the MathQuill tree, these all take in a direction and
  // the cursor
  _.moveOutOf = function(dir, cursor, updown) {
    var updownInto = updown && this.parent[updown+'Into'];
    if (!updownInto && this[dir]) cursor.insAtDirEnd(-dir, this[dir]);
    else cursor.insDirOf(dir, this.parent);
  };
  _.selectOutOf = function(dir, cursor) {
    cursor.insDirOf(dir, this.parent);
  };
  _.deleteOutOf = function(dir, cursor) {
    cursor.unwrapGramp();
  };
  _.seek = function(pageX, cursor) {
    var node = this.ends[R];
    if (!node || node.jQ.offset().left + node.jQ.outerWidth() < pageX) {
      return cursor.insAtRightEnd(this);
    }
    if (pageX < this.ends[L].jQ.offset().left) return cursor.insAtLeftEnd(this);
    while (pageX < node.jQ.offset().left) node = node[L];
    return node.seek(pageX, cursor);
  };
  _.chToCmd = function(ch, options) {
    var cons;
    // exclude f because it gets a dedicated command with more spacing
    if (ch.match(/^[a-eg-zA-Z]$/))
      return Letter(ch);
    else if (/^\d$/.test(ch))
      return Digit(ch);
    else if (options && options.typingSlashWritesDivisionSymbol && ch === '/')
      return LatexCmds['÷'](ch);
    else if (options && options.typingAsteriskWritesTimesSymbol && ch === '*')
      return LatexCmds['×'](ch);
    else if (cons = CharCmds[ch] || LatexCmds[ch])
      return cons(ch);
    else
      return VanillaSymbol(ch);
  };
  _.write = function(cursor, ch) {
    var cmd = this.chToCmd(ch, cursor.options);
    if (cursor.selection) cmd.replaces(cursor.replaceSelection());
    if (!cursor.isTooDeep()) {
      cmd.createLeftOf(cursor.show());
    }
  };

  _.writeLatex = function(cursor, latex) {

    var all = Parser.all;
    var eof = Parser.eof;

    var block = latexMathParser.skip(eof).or(all.result(false)).parse(latex);

    if (block && !block.isEmpty() && block.prepareInsertionAt(cursor)) {
      block.children().adopt(cursor.parent, cursor[L], cursor[R]);
      var jQ = block.jQize();
      jQ.insertBefore(cursor.jQ);
      cursor[L] = block.ends[R];
      block.finalizeInsert(cursor.options, cursor);
      if (block.ends[R][R].siblingCreated) block.ends[R][R].siblingCreated(cursor.options, L);
      if (block.ends[L][L].siblingCreated) block.ends[L][L].siblingCreated(cursor.options, R);
      cursor.parent.bubble('reflow');
    }
  };

  _.focus = function() {
    this.jQ.addClass('mq-hasCursor');
    this.jQ.removeClass('mq-empty');

    return this;
  };
  _.blur = function() {
    this.jQ.removeClass('mq-hasCursor');
    if (this.isEmpty())
      this.jQ.addClass('mq-empty');

    return this;
  };
});

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
