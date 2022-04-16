
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Clock.svelte generated by Svelte v3.47.0 */

    const file$6 = "src\\Clock.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let p1;
    	let t8;
    	let t9;
    	let t10;
    	let t11;
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(/*weekDay*/ ctx[4]);
    			t1 = text(", ");
    			t2 = text(/*day*/ ctx[3]);
    			t3 = space();
    			t4 = text(/*month*/ ctx[5]);
    			t5 = space();
    			t6 = text(/*year*/ ctx[6]);
    			t7 = space();
    			p1 = element("p");
    			t8 = text(/*hours*/ ctx[2]);
    			t9 = text(":");
    			t10 = text(/*minutes*/ ctx[1]);
    			t11 = text(":");
    			t12 = text(/*seconds*/ ctx[0]);
    			attr_dev(p0, "class", "date svelte-nwpr6z");
    			add_location(p0, file$6, 19, 4, 669);
    			attr_dev(p1, "class", "time svelte-nwpr6z");
    			add_location(p1, file$6, 20, 4, 726);
    			attr_dev(div, "class", "clock svelte-nwpr6z");
    			add_location(div, file$6, 18, 0, 644);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div, t7);
    			append_dev(div, p1);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(p1, t11);
    			append_dev(p1, t12);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*weekDay*/ 16) set_data_dev(t0, /*weekDay*/ ctx[4]);
    			if (dirty & /*day*/ 8) set_data_dev(t2, /*day*/ ctx[3]);
    			if (dirty & /*month*/ 32) set_data_dev(t4, /*month*/ ctx[5]);
    			if (dirty & /*year*/ 64) set_data_dev(t6, /*year*/ ctx[6]);
    			if (dirty & /*hours*/ 4) set_data_dev(t8, /*hours*/ ctx[2]);
    			if (dirty & /*minutes*/ 2) set_data_dev(t10, /*minutes*/ ctx[1]);
    			if (dirty & /*seconds*/ 1) set_data_dev(t12, /*seconds*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let clock;
    	let year;
    	let month;
    	let weekDay;
    	let day;
    	let hours;
    	let minutes;
    	let seconds;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Clock', slots, []);
    	let time = new Date();

    	setInterval(
    		() => {
    			$$invalidate(7, time = new Date());
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Clock> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		time,
    		seconds,
    		minutes,
    		hours,
    		day,
    		weekDay,
    		month,
    		year,
    		clock
    	});

    	$$self.$inject_state = $$props => {
    		if ('time' in $$props) $$invalidate(7, time = $$props.time);
    		if ('seconds' in $$props) $$invalidate(0, seconds = $$props.seconds);
    		if ('minutes' in $$props) $$invalidate(1, minutes = $$props.minutes);
    		if ('hours' in $$props) $$invalidate(2, hours = $$props.hours);
    		if ('day' in $$props) $$invalidate(3, day = $$props.day);
    		if ('weekDay' in $$props) $$invalidate(4, weekDay = $$props.weekDay);
    		if ('month' in $$props) $$invalidate(5, month = $$props.month);
    		if ('year' in $$props) $$invalidate(6, year = $$props.year);
    		if ('clock' in $$props) clock = $$props.clock;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*time*/ 128) {
    			$$invalidate(6, year = time.getFullYear());
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			$$invalidate(5, month = ({
    				1: 'jan',
    				2: 'feb',
    				3: 'mar',
    				4: 'apr',
    				5: 'may',
    				6: 'jun',
    				7: 'jul',
    				8: 'aug',
    				9: 'sep',
    				10: 'oct',
    				11: 'nov',
    				12: 'dec'
    			})[time.getMonth() + 1]);
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			$$invalidate(4, weekDay = ({
    				1: 'mon',
    				2: 'tue',
    				3: 'wed',
    				4: 'thu',
    				5: 'fri',
    				6: 'sat',
    				7: 'sun'
    			})[time.getDay()]);
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			$$invalidate(3, day = time.getDate());
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			$$invalidate(2, hours = ("0" + time.getHours()).slice(-2));
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			$$invalidate(1, minutes = ("0" + time.getMinutes()).slice(-2));
    		}

    		if ($$self.$$.dirty & /*time*/ 128) {
    			$$invalidate(0, seconds = ("0" + time.getSeconds()).slice(-2));
    		}
    	};

    	clock = new Date();
    	return [seconds, minutes, hours, day, weekDay, month, year, time];
    }

    class Clock extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Clock",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Login.svelte generated by Svelte v3.47.0 */

    const file$5 = "src\\Login.svelte";

    function create_fragment$6(ctx) {
    	let div;
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t = text("log in");
    			attr_dev(a, "href", /*loginUrl*/ ctx[0]);
    			add_location(a, file$5, 27, 4, 1038);
    			attr_dev(div, "class", "login");
    			add_location(div, file$5, 26, 0, 1013);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*loginUrl*/ 1) {
    				attr_dev(a, "href", /*loginUrl*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function makeID(length) {
    	var result = "";
    	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    	var charactersLength = characters.length;

    	for (var i = 0; i < length; i++) {
    		result += characters.charAt(Math.floor(Math.random() * charactersLength));
    	}

    	return result;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	var client_id = "ad006f6397254bbd9dbe5e6bfbb35407";
    	var redirect_uri = location.protocol + "//" + location.host + location.pathname;
    	let scope = "user-read-currently-playing";
    	var state = makeID(16);
    	let loginUrl = "https://accounts.spotify.com/authorize";
    	loginUrl += "?response_type=token";
    	loginUrl += "&client_id=" + encodeURIComponent(client_id);
    	loginUrl += "&scope=" + encodeURIComponent(scope);
    	loginUrl += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    	loginUrl += "&state=" + encodeURIComponent(state);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		makeID,
    		client_id,
    		redirect_uri,
    		scope,
    		state,
    		loginUrl
    	});

    	$$self.$inject_state = $$props => {
    		if ('client_id' in $$props) client_id = $$props.client_id;
    		if ('redirect_uri' in $$props) redirect_uri = $$props.redirect_uri;
    		if ('scope' in $$props) scope = $$props.scope;
    		if ('state' in $$props) state = $$props.state;
    		if ('loginUrl' in $$props) $$invalidate(0, loginUrl = $$props.loginUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loginUrl];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Auth.svelte generated by Svelte v3.47.0 */

    function create_fragment$5(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Auth', slots, []);
    	var urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    	var token = urlParams.get("access_token");
    	localStorage.setItem('token', token);
    	location.href = '/';
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Auth> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ urlParams, token });

    	$$self.$inject_state = $$props => {
    		if ('urlParams' in $$props) urlParams = $$props.urlParams;
    		if ('token' in $$props) token = $$props.token;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class Auth extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Auth",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const logged = writable(false);

    /* src\Progress.svelte generated by Svelte v3.47.0 */
    const file$4 = "src\\Progress.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "point svelte-1nyihoe");
    			add_location(div0, file$4, 19, 4, 461);
    			attr_dev(div1, "class", "progress svelte-1nyihoe");
    			add_location(div1, file$4, 18, 0, 412);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[4](div0);
    			/*div1_binding*/ ctx[5](div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div0_binding*/ ctx[4](null);
    			/*div1_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Progress', slots, []);
    	let { duration } = $$props;
    	let { current } = $$props;
    	let progress, point;

    	setInterval(
    		() => {
    			const r = current * 100 / duration;
    			const pointPixels = progress.clientWidth * r / 100;

    			if (pointPixels < progress.clientWidth) {
    				$$invalidate(1, point.style.width = `${pointPixels}px`, point);
    			}
    		},
    		1000
    	);

    	const writable_props = ['duration', 'current'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Progress> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			point = $$value;
    			$$invalidate(1, point);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			progress = $$value;
    			$$invalidate(0, progress);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('current' in $$props) $$invalidate(3, current = $$props.current);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		duration,
    		current,
    		progress,
    		point
    	});

    	$$self.$inject_state = $$props => {
    		if ('duration' in $$props) $$invalidate(2, duration = $$props.duration);
    		if ('current' in $$props) $$invalidate(3, current = $$props.current);
    		if ('progress' in $$props) $$invalidate(0, progress = $$props.progress);
    		if ('point' in $$props) $$invalidate(1, point = $$props.point);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [progress, point, duration, current, div0_binding, div1_binding];
    }

    class Progress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { duration: 2, current: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Progress",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*duration*/ ctx[2] === undefined && !('duration' in props)) {
    			console.warn("<Progress> was created without expected prop 'duration'");
    		}

    		if (/*current*/ ctx[3] === undefined && !('current' in props)) {
    			console.warn("<Progress> was created without expected prop 'current'");
    		}
    	}

    	get duration() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Player.svelte generated by Svelte v3.47.0 */
    const file$3 = "src\\Player.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (134:4) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("asas");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(134:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#if song}
    function create_if_block$1(ctx) {
    	let div0;
    	let p0;
    	let a0;
    	let t0_value = /*song*/ ctx[0].item.name + "";
    	let t0;
    	let a0_href_value;
    	let t1;
    	let p1;
    	let a1;
    	let t2_value = /*song*/ ctx[0].item.album.name + "";
    	let t2;
    	let a1_href_value;
    	let t3;
    	let p2;
    	let t4;
    	let p3;
    	let t5_value = Math.floor(/*currentMs*/ ctx[1] / 1000 / 60) + "";
    	let t5;
    	let t6;
    	let t7_value = ("0" + Math.floor(/*currentMs*/ ctx[1] / 1000 % 60)).slice(-2) + "";
    	let t7;
    	let t8;
    	let t9_value = Math.floor(/*song*/ ctx[0].item.duration_ms / 1000 / 60) + "";
    	let t9;
    	let t10;
    	let t11_value = ("0" + Math.floor(/*song*/ ctx[0].item.duration_ms / 1000 % 60)).slice(-2) + "";
    	let t11;
    	let t12;
    	let progress;
    	let t13;
    	let div1;
    	let current;
    	let each_value = /*song*/ ctx[0].item.artists;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	progress = new Progress({
    			props: {
    				duration: /*song*/ ctx[0].item.duration_ms,
    				current: /*currentMs*/ ctx[1]
    			},
    			$$inline: true
    		});

    	function select_block_type_1(ctx, dirty) {
    		if (/*song*/ ctx[0].fake) return create_if_block_1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p0 = element("p");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			a1 = element("a");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			p3 = element("p");
    			t5 = text(t5_value);
    			t6 = text(":");
    			t7 = text(t7_value);
    			t8 = text(" / ");
    			t9 = text(t9_value);
    			t10 = text(":");
    			t11 = text(t11_value);
    			t12 = space();
    			create_component(progress.$$.fragment);
    			t13 = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(a0, "href", a0_href_value = /*song*/ ctx[0].item.external_urls.spotify);
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-k1tj2s");
    			add_location(a0, file$3, 91, 16, 2715);
    			attr_dev(p0, "class", "title svelte-k1tj2s");
    			add_location(p0, file$3, 90, 12, 2680);
    			attr_dev(a1, "href", a1_href_value = /*song*/ ctx[0].item.album.external_urls.spotify);
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-k1tj2s");
    			add_location(a1, file$3, 96, 16, 2900);
    			attr_dev(p1, "class", "album svelte-k1tj2s");
    			add_location(p1, file$3, 95, 12, 2865);
    			attr_dev(p2, "class", "artists svelte-k1tj2s");
    			add_location(p2, file$3, 100, 12, 3062);
    			attr_dev(p3, "class", "time svelte-k1tj2s");
    			add_location(p3, file$3, 111, 12, 3445);
    			attr_dev(div0, "class", "content svelte-k1tj2s");
    			add_location(div0, file$3, 89, 8, 2645);
    			attr_dev(div1, "class", "cover svelte-k1tj2s");
    			add_location(div1, file$3, 122, 8, 3931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(p0, a0);
    			append_dev(a0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, a1);
    			append_dev(a1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(p2, null);
    			}

    			append_dev(div0, t4);
    			append_dev(div0, p3);
    			append_dev(p3, t5);
    			append_dev(p3, t6);
    			append_dev(p3, t7);
    			append_dev(p3, t8);
    			append_dev(p3, t9);
    			append_dev(p3, t10);
    			append_dev(p3, t11);
    			append_dev(div0, t12);
    			mount_component(progress, div0, null);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*song*/ 1) && t0_value !== (t0_value = /*song*/ ctx[0].item.name + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*song*/ 1 && a0_href_value !== (a0_href_value = /*song*/ ctx[0].item.external_urls.spotify)) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if ((!current || dirty & /*song*/ 1) && t2_value !== (t2_value = /*song*/ ctx[0].item.album.name + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*song*/ 1 && a1_href_value !== (a1_href_value = /*song*/ ctx[0].item.album.external_urls.spotify)) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*song*/ 1) {
    				each_value = /*song*/ ctx[0].item.artists;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(p2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if ((!current || dirty & /*currentMs*/ 2) && t5_value !== (t5_value = Math.floor(/*currentMs*/ ctx[1] / 1000 / 60) + "")) set_data_dev(t5, t5_value);
    			if ((!current || dirty & /*currentMs*/ 2) && t7_value !== (t7_value = ("0" + Math.floor(/*currentMs*/ ctx[1] / 1000 % 60)).slice(-2) + "")) set_data_dev(t7, t7_value);
    			if ((!current || dirty & /*song*/ 1) && t9_value !== (t9_value = Math.floor(/*song*/ ctx[0].item.duration_ms / 1000 / 60) + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*song*/ 1) && t11_value !== (t11_value = ("0" + Math.floor(/*song*/ ctx[0].item.duration_ms / 1000 % 60)).slice(-2) + "")) set_data_dev(t11, t11_value);
    			const progress_changes = {};
    			if (dirty & /*song*/ 1) progress_changes.duration = /*song*/ ctx[0].item.duration_ms;
    			if (dirty & /*currentMs*/ 2) progress_changes.current = /*currentMs*/ ctx[1];
    			progress.$set(progress_changes);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks, detaching);
    			destroy_component(progress);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(89:4) {#if song}",
    		ctx
    	});

    	return block;
    }

    // (102:16) {#each song.item.artists as artist}
    function create_each_block(ctx) {
    	let a;
    	let t0_value = /*artist*/ ctx[5].name + "";
    	let t0;
    	let t1;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", a_href_value = /*artist*/ ctx[5].external_urls.spotify);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "artist svelte-k1tj2s");
    			add_location(a, file$3, 102, 20, 3156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*song*/ 1 && t0_value !== (t0_value = /*artist*/ ctx[5].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*song*/ 1 && a_href_value !== (a_href_value = /*artist*/ ctx[5].external_urls.spotify)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(102:16) {#each song.item.artists as artist}",
    		ctx
    	});

    	return block;
    }

    // (130:12) {:else}
    function create_else_block$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*song*/ ctx[0].item.album.images[1].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Album Cover");
    			attr_dev(img, "class", "svelte-k1tj2s");
    			add_location(img, file$3, 130, 16, 4190);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*song*/ 1 && !src_url_equal(img.src, img_src_value = /*song*/ ctx[0].item.album.images[1].url)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(130:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (124:12) {#if song.fake}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*song*/ ctx[0].item.album.images[1].url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Album Cover");
    			attr_dev(img, "class", "fake svelte-k1tj2s");
    			add_location(img, file$3, 124, 16, 3997);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*song*/ 1 && !src_url_equal(img.src, img_src_value = /*song*/ ctx[0].item.album.images[1].url)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(124:12) {#if song.fake}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*song*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "player svelte-k1tj2s");
    			add_location(div, file$3, 87, 0, 2599);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Player', slots, []);
    	const token = localStorage.getItem("token");
    	let song;
    	let currentMs = 0;
    	onMount(newSong);

    	setInterval(
    		() => {
    			newSong();
    		},
    		1000
    	);

    	const fakeSong = {
    		fake: true,
    		progress_ms: 0,
    		item: {
    			duration_ms: 0,
    			id: 42,
    			name: "No song playing",
    			external_urls: { spotify: "" },
    			album: {
    				name: "No album playing",
    				external_urls: { spotify: "" },
    				images: [{}, { url: "./Spotify_Icon_RGB_White.png" }]
    			},
    			artists: [
    				{
    					name: "No artist playing",
    					external_urls: { spotify: "" }
    				}
    			]
    		}
    	};

    	async function newSong() {
    		var res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    			headers: {
    				Authorization: `Bearer ${token}`,
    				"Content-Type": "application/json"
    			}
    		});

    		if (res.status !== 200 && res.status !== 204) {
    			logged.set(false);
    			$$invalidate(0, song = fakeSong);
    		} else {
    			let data;

    			if (res.status === 204) {
    				data = fakeSong;
    			} else {
    				data = await res.json();
    			}

    			if (data.item) {
    				if (song) {
    					if (song.item.id !== data.item.id) {
    						$$invalidate(0, song = data);
    					}
    				} else {
    					$$invalidate(0, song = data);
    				}

    				$$invalidate(1, currentMs = data.progress_ms);
    			} else {
    				$$invalidate(0, song = fakeSong);
    			}
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		logged,
    		Progress,
    		token,
    		song,
    		currentMs,
    		fakeSong,
    		newSong
    	});

    	$$self.$inject_state = $$props => {
    		if ('song' in $$props) $$invalidate(0, song = $$props.song);
    		if ('currentMs' in $$props) $$invalidate(1, currentMs = $$props.currentMs);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [song, currentMs];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Spotify.svelte generated by Svelte v3.47.0 */
    const file$2 = "src\\Spotify.svelte";

    // (43:4) {:else}
    function create_else_block(ctx) {
    	let player;
    	let current;
    	player = new Player({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(player.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(player, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(player.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(player.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(player, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:4) {#if !loggedIn}
    function create_if_block(ctx) {
    	let login;
    	let current;
    	login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(login.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(41:4) {#if !loggedIn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*loggedIn*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "spotify");
    			add_location(div, file$2, 39, 0, 1078);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Spotify', slots, []);
    	var urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    	var token = urlParams.get("access_token");

    	if (token) {
    		localStorage.setItem("token", token);
    		location.href = "/";
    	}

    	let loggedIn = false;

    	logged.subscribe(value => {
    		$$invalidate(0, loggedIn = value);
    	});

    	onMount(async () => {
    		if (localStorage.getItem("token")) {
    			let res = await fetch("https://api.spotify.com/v1/me", {
    				headers: {
    					Authorization: `Bearer ${localStorage.getItem("token")}`,
    					"Content-Type": "application/json"
    				}
    			});

    			if (res.status === 200) {
    				logged.set(true);
    			} else {
    				logged.set(false);
    			}
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Spotify> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Login,
    		Auth,
    		Player,
    		logged,
    		urlParams,
    		token,
    		loggedIn
    	});

    	$$self.$inject_state = $$props => {
    		if ('urlParams' in $$props) urlParams = $$props.urlParams;
    		if ('token' in $$props) token = $$props.token;
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loggedIn];
    }

    class Spotify extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spotify",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Background.svelte generated by Svelte v3.47.0 */

    const file$1 = "src\\Background.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", "sand svelte-10va4ir");
    			if (!src_url_equal(img.src, img_src_value = "./sand.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Sand");
    			add_location(img, file$1, 1, 4, 30);
    			attr_dev(div, "class", "background svelte-10va4ir");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Background', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.47.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div2;
    	let div0;
    	let clock;
    	let t0;
    	let div1;
    	let spotify;
    	let t1;
    	let background;
    	let current;
    	clock = new Clock({ $$inline: true });
    	spotify = new Spotify({ $$inline: true });
    	background = new Background({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(clock.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(spotify.$$.fragment);
    			t1 = space();
    			create_component(background.$$.fragment);
    			attr_dev(div0, "class", "clock svelte-1kcbo1t");
    			add_location(div0, file, 8, 8, 205);
    			attr_dev(div1, "class", "spotify svelte-1kcbo1t");
    			add_location(div1, file, 11, 8, 273);
    			attr_dev(div2, "class", "container svelte-1kcbo1t");
    			add_location(div2, file, 7, 4, 172);
    			attr_dev(main, "class", "svelte-1kcbo1t");
    			add_location(main, file, 6, 0, 160);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			mount_component(clock, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(spotify, div1, null);
    			insert_dev(target, t1, anchor);
    			mount_component(background, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(clock.$$.fragment, local);
    			transition_in(spotify.$$.fragment, local);
    			transition_in(background.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(clock.$$.fragment, local);
    			transition_out(spotify.$$.fragment, local);
    			transition_out(background.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(clock);
    			destroy_component(spotify);
    			if (detaching) detach_dev(t1);
    			destroy_component(background, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Clock, Spotify, Background });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
