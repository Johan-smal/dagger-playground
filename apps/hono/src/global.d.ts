import "typed-htmx";

interface AlpineAttributes {
  /**
	 * x-data defines a chunk of HTML as an Alpine component and provides the reactive data for that component to reference.
	 * @see https://alpinejs.dev/directives/data
	 * @category Core
	 */
  ['x-data']?: string
}

// A demo of how to augment foreign types with htmx attributes.
// In this case, Hono sources its types from its own namespace, so we do the same
// and directly extend its namespace.
declare global {
  namespace Hono {
    interface HTMLAttributes extends HtmxAttributes, AlpineAttributes {
    }
  }
}
