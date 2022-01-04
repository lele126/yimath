import P from '../p.js'
import MathBlock from './MathBlock.js'
import {RootBlockMixin} from '../publicapi.js'

var RootMathBlock = P(MathBlock, RootBlockMixin);

export default RootMathBlock;