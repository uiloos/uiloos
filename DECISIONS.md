# Decisions

## 000001 React::ActiveContent children - 2022-02-25
The ActiveContent component in the react package, passes along the 
children prop to the core ActiveContent via the config argument. This
was so TypeScript better understands the typings. This means that if
in the future core::ActiveContent ever gets a children key that this
will break the react package.

Never add a `children` key to the ActiveContentConfig type.
