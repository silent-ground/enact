/**
 * A convenient tool for laying-out content using `Layout`, `Cell`, `Row`, and `Column`.
 *
 * Layout is a powerful and versatile tool used for arranging content on the screen. On a conceptual
 * level, it mixes the best parts of HTML tables with the best parts of HTML framesets, both of
 * which were largely abandoned for their drawbacks, ignoring their strengths. A `Layout` is simply
 * a container for `Cell`, the only "legal" child. Conversely, `Cell` may only be used in a
 * `Layout`. Cells in a Layout can either be positioned next to each other (horizontally) or
 * above/below each other (vertically) in what we refer to as a {@link ui/Layout.Row|Row} or
 * {@link ui/Layout.Column|Column}, respectively.
 *
 * The `Row` and `Column` layout presets describe the direction of layout for their children. This
 * can sometimes cause confusion. A `Row` of children naturally forms a _layout_ whose children can
 * have the _appearance_ of columns. To keep things clear, think about the layout rather than
 * what the children themselves represent.
 *
 * `Layout` is an implementation of flex-box, but with built-in rails, properties, and features to
 * help avoid common problems with flex-box; things like content overflowing, sizing quirks, and
 * positioning problems regarding content of unknown or undefined dimension.
 *
 * The following scenarios are some common cases where `Layout` can truly help out. A quality of
 * `Cell` you'll see below is that when a `Cell` has no defined size, it automatically sizes to fill
 * any remaining space in the `Layout`. If there are multiple auto-sizing `Cell` components, they
 * share the space, subdividing it equally among themselves. It's great to leverage this and only
 * apply sizes to `Cell`s which must have defined sizes. `shrink` is one of the ways you can impose
 * size guidelines on a `Cell`. It automatically fits the size of the Cell to the size of its
 * content.
 *
 * A row of cells where the last one should always attach to the right side, regardless of the size
 * of the main "content" cell:
 * ```
 * ┌───────┬─┐
 * │Main   │R│
 * └───────┴─┘
 * ```
 *
 * ```
 * <Row>
 * 	<Cell>Main Content</Cell>
 * 	<Cell shrink>Right Side</Cell>
 * </Row>
 * ```
 *
 * A "two-column" layout with equal sized cells using `Row`:
 * ```
 * ┌────┬────┐
 * │L   │R   │
 * └────┴────┘
 * ```
 *
 * ```
 * <Row style={{height: '100%'}}>
 * 	<Cell>Left Column</Cell>
 * 	<Cell>Right Column</Cell>
 * </Row>
 * ```
 * *Remember:* The cells of the `Row` are the columns in our layout. It's likely that in a complex
 * layout `Column` would be used inside the left and right cells to arrange the components, as in
 * the example below.
 *
 * A full-height sidebar with a header and body to the right:
 * ```
 * ┌──┬──────┐
 * │S │HEADER│
 * │  ├──────┤
 * │  │Body  │
 * │  │      │
 * └──┴──────┘
 * ```
 *
 * ```
 * <Row style={{height: '100%'}}>
 * 	<Cell size="20%">Sidebar</Cell>
 * 	<Cell>
 * 		<Column>
 * 			<Cell size={90} component="header">
 * 				<h1>HEADER</h1>
 * 			</Cell>
 * 			<Cell>
 * 				<p>Body area</p>
 * 			</Cell>
 * 		</Column>
 * 	</Cell>
 * </Row>
 * ```
 * *Note:* Here, we've set the height of `Row` so it fills the height of the screen, allowing the
 * Sidebar Cell and content Cell to stretch from the top to the bottom. We've also leveraged the
 * `component` prop on the header cell, which tells `Cell` to render itself as a "header" HTML tag
 * rather than its usual "div" tag.
 *
 * The example below produces a layout like the following:
 * ```
 * ┌─┬─────┬─┐
 * │o│Item │o│
 * └─┴─────┴─┘
 * ```
 *
 * You'll notice the use of some special classes in the example: `"debug layout"`. Adding these on
 * any element in your DOM hierarchy will enable borders in Layout and Cell to help visualize what
 * is happening in the layout. They automatically change color the deeper in the stack they go.
 *
 * @example
 * <Layout className="debug layout">
 * 	<Cell shrink>
 * 		<button>First</button>
 * 	</Cell>
 * 	<Cell>
 * 		<div>A div with some long text in it</div>
 * 	</Cell>
 * 	<Cell shrink>
 * 		<button>Last</button>
 * 	</Cell>
 * </Layout>
 *
 * @module ui/Layout
 * @exports Cell
 * @exports CellBase
 * @exports CellDecorator
 * @exports Column
 * @exports Layout
 * @exports LayoutBase
 * @exports LayoutDecorator
 * @exports Row
 */

import EnactPropTypes from '@enact/core/internal/prop-types';
import kind from '@enact/core/kind';
import PropTypes from 'prop-types';

import ForwardRef from '../ForwardRef';

import {Cell, CellBase, CellDecorator, toFlexAlign} from './Cell';

import css from './Layout.module.less';

/**
 * A container for `Cell`s.
 *
 * A stateless component that acts as a containing area for {@link ui/Layout.Cell|Cells} to be
 * positioned in a row or a column (horizontally or vertically, respectively. It supports an
 * {@link ui/Layout.LayoutBase.orientation|orientation} property for laying-out its contents
 * (`Cells`) in an organized, readable way.
 *
 * Example:
 * ```
 * import Input from '@enact/moonstone/Input';
 * import css from './LayoutExample.less';
 * ...
 * <fieldset>
 * 	<Layout align="center">
 * 		<Cell component="label" size="40%" className={css.label} shrink>First Name</Cell>
 * 		<Cell component={Input} placeholder="First" className={css.input} />
 * 	</Layout>
 * 	<Layout align="center">
 * 		<Cell component="label" size="40%" className={css.label} shrink>Last Name</Cell>
 * 		<Cell component={Input} placeholder="Last" className={css.input} />
 * 	</Layout>
 * </fieldset>
 * ```
 *
 * @class LayoutBase
 * @ui
 * @memberof ui/Layout
 * @public
 */
const LayoutBase = kind({
	name: 'LayoutBase',

	propTypes: /** @lends ui/Layout.LayoutBase.prototype */ {
		/**
		 * The alignment of children.
		 *
		 * Aligns the children {@link ui/Layout.Cell|Cells} vertically in the case of a horizontal
		 * layout or horizontally in the case of a vertical layout. `"start"`, `"center"` and
		 * `"end"` are the most commonly used, although all values of `align-items` are supported.
		 * `"start"` refers to the top in a horizontal layout, and left in a vertical LTR layout
		 * `"end"` refers to the bottom in a horizontal layout, and right in a vertical LTR layout
		 * `"start"` and `"end"` reverse places when in a vertical layout in a RTL locale.
		 * This includes support shorthand for combining `align-items` and `justify-content` into
		 * a single property, separated by a space, in that order. This allows you to specify both
		 * the horizontal and vertical alignment in one property, separated by a space.
		 *
		 * For example, `align="center space-between"` means `align-items: center` and
		 * `justify-content: space-between` for each. `justify-content` property can be used to
		 * align the Cells on the main axis and adjust gaps among the Cells. To declare the
		 * `justify-content` property only, just add a heading space for `align` prop string like
		 * `align=" space-between"`. The default value for `align-items` is `stretch`. It can be
		 * also used for `align` prop like `align="stretch space-between"`. All values of
		 * `justify-content` are supported, like `start`, `end`, `center`, `space-between`,
		 * `space-around`, and `space-evenly`.
		 *
		 * ```
		 * <Layout align="center space-around">
		 *     <Cell>Left Column</Cell>
		 *     <Cell>Right Column</Cell>
		 * </Layout>
		 * ```
		 * ```
		 * <Layout align=" space-between">
		 *     <Cell>Left Column</Cell>
		 *     <Cell>Right Column</Cell>
		 * </Layout>
		 * ```
		 *
		 * @type {String}
		 * @public
		 */
		align: PropTypes.string,

		/**
		 * Only {@link ui/Layout.Cell|Cell} components are supported as children.
		 *
		 * @type {Cell|Cell[]}
		 * @public
		 */
		children: PropTypes.any,

		/**
		 * The type of component to use to render as the `Layout`. May be a DOM node name (e.g 'div',
		 * 'span', etc.) or a custom component.
		 *
		 * @type {String|Component}
		 * @default 'div'
		 * @public
		 */
		component:  EnactPropTypes.renderable,

		/**
		 * Called with a reference to the root component.
		 *
		 * When using {@link ui/Layout.Layout}, the `ref` prop is forwarded to this component
		 * as `componentRef`.
		 *
		 * @type {Object|Function}
		 * @public
		 */
		componentRef: EnactPropTypes.ref,

		/**
		 * Allows this `Layout` to have following siblings drawn on the same line as itself
		 * instead of carving out the entire horizontal space for itself.
		 *
		 * @type {Boolean}
		 * @default false
		 * @public
		 */
		inline: PropTypes.bool,

		/**
		 * The orientation of the `Layout`, i.e. how the children {@link ui/Layout.Cell|Cells} are
		 * positioned on the screen. Must be either `'horizontal'` or `'vertical'`.
		 *
		 * @type {String}
		 * @default 'horizontal'
		 * @public
		 */
		orientation: PropTypes.oneOf(['horizontal', 'vertical']),

		/**
		 * Sets the Layout's `flex-wrap` values.
		 *
		 * Determines how a Layout handles its cells if there are more than fit in the available
		 * space. This works like a normal `Boolean` prop, but also accepts strings for customization
		 * beyond the basic on/off support. In addition to `true` and `false`, the following strings
		 * are supported: 'wrap', 'nowrap', 'reverse'. 'reverse' performs standard line wrapping but
		 * additional lines are placed above/before the preceding line instead of below/after.
		 *
		 * @type {Boolean|String}
		 * @public
		 */
		wrap: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['reverse', 'nowrap', 'wrap'])])
	},

	defaultProps: {
		component: 'div',
		inline: false,
		orientation: 'horizontal',
		wrap: false
	},

	styles: {
		css,
		className: 'layout'
	},

	computed: {
		className: ({inline, orientation, wrap, styler}) => {
			return styler.append(
				orientation,
				{
					inline,
					nowrap: wrap === false || wrap === 'nowrap',
					wrap: wrap === true || wrap === 'wrap',
					wrapReverse: wrap === 'wrapReverse'
				}
			);
		},
		style: ({align, style}) => {
			if (!align) return style;

			// This is effectively a polyfill for the upcoming `place-items` prop which is shorthand
			// for align-items and justify-items together
			const alignParts = align.split(' ');

			return {
				...style,
				alignItems: toFlexAlign(alignParts[0]),
				justifyContent: toFlexAlign(alignParts[1])
			};
		}
	},

	render: ({component: Component, componentRef, ...rest}) => {
		delete rest.align;
		delete rest.inline;
		delete rest.orientation;
		delete rest.wrap;

		return <Component ref={componentRef} {...rest} />;
	}
});

/**
 * Applies Layout behaviors.
 *
 * @hoc
 * @memberof ui/Layout
 * @mixes ui/ForwardRef.ForwardRef
 * @public
 */
const LayoutDecorator = ForwardRef({prop: 'componentRef'});

/**
 * A container for `Cell`s.
 *
 * A stateless component that acts as a containing area for {@link ui/Layout.Cell|Cells} to be
 * positioned in a row or a column (horizontally or vertically, respectively. It supports an
 * {@link ui/Layout.LayoutBase.orientation|orientation} property for laying-out its contents
 * (`Cells`) in an organized, readable way.
 *
 * Example:
 * ```
 * import Input from '@enact/moonstone/Input';
 * import css from './LayoutExample.less';
 * ...
 * <fieldset>
 * 	<Layout align="center">
 * 		<Cell component="label" size="40%" className={css.label} shrink>First Name</Cell>
 * 		<Cell component={Input} placeholder="First" className={css.input} />
 * 	</Layout>
 * 	<Layout align="center">
 * 		<Cell component="label" size="40%" className={css.label} shrink>Last Name</Cell>
 * 		<Cell component={Input} placeholder="Last" className={css.input} />
 * 	</Layout>
 * </fieldset>
 * ```
 *
 * @class Layout
 * @memberof ui/Layout
 * @extends ui/Layout.LayoutBase
 * @mixes ui/ForwardRef.ForwardRef
 * @omit componentRef
 * @ui
 * @public
 */
const Layout = LayoutDecorator(LayoutBase);

/**
 * Shorthand for `<Layout orientation="vertical">`, which positions its
 * {@link ui/Layout.Cell|Cells} vertically.
 * ```
 * ┌────┐
 * ├────┤
 * ├────┤
 * ├────┤
 * └────┘
 * ```
 *
 * @class Column
 * @memberof ui/Layout
 * @extends ui/Layout.Layout
 * @mixes ui/ForwardRef.ForwardRef
 * @ui
 * @public
 */
const Column = LayoutDecorator((props) => (
	LayoutBase.inline({
		...props,
		orientation: 'vertical'
	})
));
Column.displayName = 'Column';

/**
 * Shorthand for `<Layout orientation="horizontal">`, which positions its
 * {@link ui/Layout.Cell|Cells} horizontally.
 * ```
 * ┌─┬─┬─┬─┐
 * │ │ │ │ │
 * └─┴─┴─┴─┘
 * ```
 *
 * @class Row
 * @memberof ui/Layout
 * @extends ui/Layout.Layout
 * @mixes ui/ForwardRef.ForwardRef
 * @ui
 * @public
 */
const Row = LayoutDecorator((props) => (
	LayoutBase.inline({
		...props,

		orientation: 'horizontal'
	})
));
Row.displayName = 'Row';

export default Layout;
export {
	Cell,
	CellBase,
	CellDecorator,
	Column,
	Layout,
	LayoutBase,
	LayoutDecorator,
	Row
};
