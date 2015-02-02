#####Naming Conventions

Clam's naming conventions are influenced by the BEM methodology and several
articles about different flavours of it. The reasoning behind BEM and other
OOCSS methodologys is to separate blocks of html elements and their styling
(Trying to sort of simulate namespacing in CSS.), and also avoid the cascade
 where it would just cause trouble.

(Reading up on these topics is highly encouraged if you're not already familiar
with them.)

BEM means: "**B**lock **E**lement **M**odifier".

This naming convention is usually used for CSS only, but Clam uses it for it's
modules too.

Explaining the conventions is easier through examples, so here's one (From the clam demo.):

**SCSS**
```scss
// "b-" here is a prefix for CSS blocks. Clam modules use the "jsm-" prefix,
// so javascript modules and CSS blocks are easy to distinguish.
// The "$amp" variable here replaces the "&" in some cases, and it's also
// generally a good idea to organize CSS blocks in separate files having
// their names in the first line.
$amp: ".b-btn";

#{$amp} {
    display: inline-block;
    padding: 5px 10px;
    font-size: 12px;
    background: #ccc;
    cursor: pointer;
    position: relative;

    &:hover, &#{$amp}--active { // A use-case for the $amp variable.
        background: darken(#ccc, 10%);

        // Here we must use the $amp variable instead of "&", because
        // the & is not referring to the block's name anymore.
        #{$amp}__text {
            color: #fff;
        }
    }

    &--has-btn {
        padding-right: 35px;
    }

    // The "close-btn" element of the "btn" block
    &__close-btn {
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.85em;
        width: 25px;
        text-align: center;
        background: rgba(0,0,0,.1);
        border-radius: 10px;

        &:hover {
            background: rgba(0,0,0,.7);
            color: #fff;
        }


        // Elements can have modifiers too.
        &--reverse-styling {
            background: rgba(0,0,0,.7);
            color: #fff;

            &:hover {
                background: rgba(0,0,0,.1);
                color: #000;
            }
        } 
    }

    &--size_medium {
        font-size: 1.25em;
    }

    &--size_large {
        font-size: 1.5em;
    }
}
```

**HTML**

```html
<!-- A large button. -->
<div class="b-btn b-btn--size_large">
    <span class="b-btn__text">button</span>
</div>
<!-- A large and active button. -->
<div class="b-btn b-btn--size_large b-btn--active">
    <span class="b-btn__text">active button</span>
</div>
<!-- A large button with a close-btn element. --> 
<div class="b-btn b-btn--size_large b-btn--has-btn">
    <span class="b-btn__text">button with x</span>
    <div class="b-btn__close-btn">x</div>
</div>
<!-- A large button with a close-btn element with reversed styling. --> 
<div class="b-btn b-btn--size_large b-btn--has-btn">
    <span class="b-btn__text">button (reversed x)</span>
    <div class="b-btn__close-btn b-btn__close-btn--reverse-styling">x</div>
</div>
```

So what does this means from the clam modules point of view?

Clam modules have a "jsm-" prefix, they have elements called "hooks", but they
don't have modifiers.

Taking the example from the main README:

    <div class="jsm-popup__open-btn" data-jsm-popup='{"type": "contact"}'></div>

This is the "open-btn" (global) hook for the "popup" module, which also has some
hook-configuration passed to the module via the "data-jsm-popup" attribute.

We assume here, that the the body also has something similar to this:

```html
<!-- Calling "cutil.createPrototypes(popup)" will search for "jsm-popup"
classes in the DOM tree. (Assuming the module's name is "popup".) Since in
this example the popup module is a singleton, having more than one element
having this class will cause an error. -->
<div class="jsm-popup">
    <!-- Some type of solution for containing different types of popups. -->
</div>
```
