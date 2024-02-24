# selforganizing
Nodes placed randomly on the screen organize themselves into circles.

![circles](https://github.com/joshon/selforganizing/assets/1111339/f1fa55d5-a412-47cd-a1da-fb19121fac7d)

## Get started
- ``npm i``
- ``npm start``

## Inspiration

This project was inspired by [What Do Algorithms Want?](https://thoughtforms.life/what-do-algorithms-want-a-new-paper-on-the-emergence-of-surprising-behavior-in-the-most-unexpected-places/) by Michael Levin. In the paper he describes placing sorting algorithms on the items to be sorted. I thought that it would be fun to try this with some more visual goals - like, for example - nodes want to organize themselves into circles with their neightbors. The first version was created as a colaboration between Josh On (myself) and Miles Thompson.

## Potential next steps

- Understand the reasons why there is often a single node sitting outside a circle in a stable formation.
- Add UI controls for the main values
- Add different circle algorithms
- Make the default values work on any size screen
- Introduce a destruction node that bounces around with a disruptive force on other nodes
- Have some nodes that want to organize themselves into squares... (this is a more complex set of coordination - four nodes will be corners... maybe this is why we don't see a lot of squares in nature...)
- Add lifespans, and reproduction
- Add interactivity
- Have higher level goals - make the circles have objectives - e.g. to find other and circles and share the same center...
