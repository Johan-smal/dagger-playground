import {type  Alpine } from "alpinejs"

export function formComponent (Alpine: Alpine) {
  Alpine.data("form", (formId?: string) => ({
    init() {
      this.$watch("filters", (newValue, oldValue) => {
        this.$nextTick(() => {
          this.$refs.submit.click()
        })
      })
    },
    filters: {} as { [x: string]: { [x: string]: string | string[]}},
    sortBy: {},
    get computedInputs() {
      const inputs = []
      for (const primary in this.filters) {
        for (const secondary in this.filters[primary]) {
          const val = this.filters[primary][secondary]
          const name = `${primary}[${secondary}]`
          
          if (Array.isArray(val)) {
            val.forEach(v => inputs.push({ name, value: v }))
          } else {
            inputs.push({ name, value: val })
          }
        }
      }
      return inputs
    },
    ['form']: {
      [`x-on:filters-update-${formId}.window.debounce`](filters: CustomEvent<{ [x: string]: { [x: string]: string | string[]}}>) {
        this.filters = filters.detail
      }
    }
  }))
  Alpine.data("filters", (formId?: string) => ({
    init(){
      this.$watch("filters", () => {
        if (formId) {
          this.$dispatch(`filters-update-${formId}`, Object.assign({}, this.filters))
        }
      })
    },
    isOpen: false,
    openedWithKeyboard: false,
    primary: null as string | null,
    secondary: null as string | null,
    values: {} as { [x: string]: null | string | string[]},
    filters: {} as { [x: string]: { [x: string]: string | string[]}},
    inputFocus: false,
    // computed properties
    get computedChips() {
      const chips = []
      for (const primary in this.filters) {
        for (const secondary in this.filters[primary]) {
          const value = this.filters[primary][secondary]
          const label = Array.isArray(value)
            ? `${primary} ${secondary} ${value.join(' and ')}`
            : `${primary} ${secondary} ${value}`

          chips.push({
            label,
            name: primary,
            key: secondary,
            value
          })
        }
      }
      return chips
    },

    // functions
    setTarget(target: "primary" | "secondary") {
      // resets values when target change
      this.values = {}
      const value = this.$el.dataset[target];
      if (!value) {
        alert(`data-${target} needs to be set for ${this.$el.outerHTML}`)
        return;
      }
      this[target] = value
    },
    resetTarget(target: "primary" | "secondary") {
      this[target] = null
    },
    clearAllFilters() {
      this.filters = {}
    },

    // bindings
    main: {
      ["x-on:keydown.esc.window"]() { 
        this.isOpen = false
        this.openedWithKeyboard = false
        this.resetTarget("primary")
        this.resetTarget("secondary")
      },
      ['x-on:mouseleave']() { 
        if (this.inputFocus) return
        this.isOpen = false
        this.openedWithKeyboard = false  
        this.resetTarget("primary")
        this.resetTarget("secondary")     
      }
    },
    ["main_button"]: {
      ['x-on:click']() { this.isOpen = ! this.isOpen },
      ['x-on:mouseenter']() { this.isOpen = true },
      ['x-bind:aria-expanded']() {
        return this.isOpen || this.openedWithKeyboard
      }
    },
    ['primary_dropdown']: {
      ["x-show"]() { return this.isOpen || this.openedWithKeyboard },
      ["x-cloak"]: "",
      ["x-transition"]: "",
      ["x-on:click.outside"]() { 
        this.isOpen = false
        this.openedWithKeyboard = false
        this.resetTarget("primary")
        this.resetTarget("secondary")
      },
      ["x-trap"]: "isOpen || openedWithKeyboard",
      ["x-on:keydown.down.prevent"]() { this.$focus.wrap().next() },
      ["x-on:keydown.up.prevent"]() { this.$focus.wrap().previous() }
    },
    ['primary_item']: {
      ['x-on:focus']() { this.setTarget("primary") },
      ['x-on:mouseenter']() { this.setTarget("primary") } 
    },
    ['secondary_dropdown']: {
      "x-show"() {
        const { primary } = this.$el.dataset
        if (!primary) { alert("data-primary needs to be set for x-bind=secondary_dropdown"); return }
        return this.primary === primary
      },
      "x-cloak": "",
      "x-transition": "",
      // "x-on:mouseleave"() { this.resetTarget("secondary") }
    },
    ['secondary_item']: {
      ['x-on:focus']() { this.setTarget("secondary")},
      ['x-on:mouseenter']() { this.setTarget("secondary")}
    },
    ['input_container']: {
      ['x-anchor.right']() {
        const { ref } = this.$el.dataset
        if (!ref) { alert("data-ref needs to be set for z-bind=input"); return; }
        return this.$refs[ref]
      },
    },
    ['input']: {
      ['x-on:focusin']() {
        this.inputFocus = true
      },
      ['x-on:focusout']() {
        this.inputFocus = false
      } 
    },
    ['add_input']: {
      'x-on:click.prevent'() {
        const { primary, secondary, ref } = this.$el.dataset
        if (!primary || !secondary || !ref || !this.values[ref]) {
          return;
        }
        this.filters = {
          ...this.filters,
          [primary]: {
            ...this.filters[primary],
            [secondary]: this.values[ref]
          }
        }
        this.$nextTick(() => {
          this.values = {}
          this.isOpen = false
          this.openedWithKeyboard = false
          this.resetTarget("primary")
          this.resetTarget("secondary")
        })
      }
    },
    ['remove_chip']: {
      'x-on:click.prevent'() {
        const { primary, secondary } = this.$el.dataset
        if (!primary || !secondary) { alert('primary and secondary not set'); return }

        const updatedFilters = JSON.parse(JSON.stringify(this.filters)) // deep clone

        if (updatedFilters[primary]) {
          delete updatedFilters[primary][secondary]
          if (Object.keys(updatedFilters[primary]).length === 0) {
            delete updatedFilters[primary]
          }
        }

        this.filters = updatedFilters
      }
    }
  }))
}