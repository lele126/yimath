import P from '../p.js'
import Symbol from './Symbol.js'
var VanillaSymbol = P(Symbol, function(_, super_) {
  _.init = function(ch, html) {
    super_.init.call(this, ch, '<span>'+(html || ch)+'</span>');
  };
});
export default VanillaSymbol;