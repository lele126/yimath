import P from '../p.js'
import Node from '../Node.js'
import L from '../var/L.js'
import R from '../var/R.js'
var MathElement = P(Node, function(_, super_) {
  _.finalizeInsert = function(options, cursor) { // `cursor` param is only for
      // SupSub::contactWeld, and is deliberately only passed in by writeLatex,
      // see ea7307eb4fac77c149a11ffdf9a831df85247693
    var self = this;
    self.postOrder('finalizeTree', options);
    self.postOrder('contactWeld', cursor);

    // note: this order is important.
    // empty elements need the empty box provided by blur to
    // be present in order for their dimensions to be measured
    // correctly by 'reflow' handlers.
    self.postOrder('blur');

    self.postOrder('reflow');
    if (self[R].siblingCreated) self[R].siblingCreated(options, L);
    if (self[L].siblingCreated) self[L].siblingCreated(options, R);
    self.bubble('reflow');
  };
  // If the maxDepth option is set, make sure
  // deeply nested content is truncated. Just return
  // false if the cursor is already too deep.
  _.prepareInsertionAt = function(cursor) {
    var maxDepth = cursor.options.maxDepth;
    if (maxDepth !== undefined) {
      var cursorDepth = cursor.depth();
      if (cursorDepth > maxDepth) {
        return false;
      }
      this.removeNodesDeeperThan(maxDepth-cursorDepth);
    }
    return true;
  };
  // Remove nodes that are more than `cutoff`
  // blocks deep from this node.
  _.removeNodesDeeperThan = function (cutoff) {
    var depth = 0;
    var queue = [[this, depth]];
    var current;

    // Do a breadth-first search of this node's descendants
    // down to cutoff, removing anything deeper.
    while (queue.length) {
      current = queue.shift();
      current[0].children().each(function (child) {
        var i = (child instanceof MathBlock) ? 1 : 0;
        depth = current[1]+i;

        if (depth <= cutoff) {
          queue.push([child, depth]);
        } else {
          (i ? child.children() : child).remove();
        }
      });
    }
  };
});

export default MathElement;