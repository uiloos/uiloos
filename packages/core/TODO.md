# Future

1. Multi insert
2. Multi remove
3. More cooldown types for deletion and swapping.
4. sort operations
5. update operation?
6. isCircular representation of the content for carousel

# Own cursor rules

1. When a text is selected and backspace is pressed the whole text
   vanishes.

2. When a text is selected and a letter is typed the whole text is 
   replaced by the new letter.

2. When the left arrow key is pressed the user deselects and moves
   to start of selection.

3. When the right arrow key is pressed the user deselects and moves
   to end of selection. 

# Multiple selection rules

// TODO: add these scenarios as tests for multi cursor

1. If user A selects a text and user B types inside of the selection.
   
   Where inside is before last letter of selection but before
   first letter! 
   
   Than the selection of user A will automatically grow.

2. If user A selects a text and user B removes letters from the selection
   the selection shrinks. Can even remove the selection this way!

3. If user A selects a text and user B removes the text and more
   surrounding letters the selection of A disappears.

