# Decisions

## 000001 - General - children - 2022-02-25
The `ActiveList` component in the react package, passes along the 
children prop to the core `ActiveList` via the config argument. This
was so TypeScript better understands the typings. This means that if
in the future core::`ActiveList` ever gets a children key that this
will break the react package.

Never add a `children` key to the `ActiveListConfig` type.

This is probably true for all other components in in the future,
never call anything `children`.

## 000002 - Core - license minification - 2022-05-26
We want to provide minified components to our users. It has been
decided that we will provide each component minified in a separate
file. This way our users can pick the components they need, without
getting a massive bundle. 

There is one problem though, then need to activate uiloos first 
via the license checker. It has been decided that the license checker
will also have its own minification file, the user must include it 
before the other scripts the want to use.

Alternatives which were considered:

1. Packing the license checking code with each component, was 
   undesirable due to bloating.

2. One file for the entire core: undesirable due to the size.

## 000003 - Core - minification of private methods and fields and helpers - 2022-05-26
To make the provided minified bundle as small as possible we now
minify private methods and fields. To make this easier all private 
methods and fields now start with an underscore.

This makes it easier to configure `terser` to pick these private
methods and fields out. 

Private helper classes also start all their fields with an underscore,
so they can be minified more aggressively.

Also having an underscore makes using private fields / methods even 
more apparent to the users of the esm en cjs modules.

## 000004 - Core - readonly arrays - 2022-08-22
When we expose arrays like the ActiveList and ViewChannel do, they
should be readonly. This makes it impossible to change the reference
of the array (like const does). This is needed so frameworks such
as Vue and Angular have an easier time to detect changes.

## 000004 - Core - ban on computed state - 2022-08-24
Methods should always perform an action, instance variables should
reflect the state. No method should ever be a "getter" for the current
state, this means a ban on computed state. 

Before the ActiveList had a method called `isPlaying()` it told if the 
autoPlay was active or not. This was in contrast with variables such
as `activeIndexes` or `isActive`. Why is one a method and one a 
variable, this is inconsistent.

We should strive for uniformity in the API even at the cost of 
complexity on our end. 

We had two options: either turn isPlaying into a `getter` via the 
`get` keyword, or simply turn it into a variable. We choose the latter
as the `get` keyword also complicates things.