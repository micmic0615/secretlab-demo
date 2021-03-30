The core idea behind my execution is having only a single function and a single global object control all updates to the DOM.  Any updates (image upload/deletion, annotation creation/removal, etc) is done via editing the SAVE_FILE global variable and then running the renderSaveFile function.  The pattern is based on how ReactJS' state works where all element manipulation is done via editing the component state and then calling the setState function.

The advantage of this approach is the ease of tracking data because there is pretty much only one variable to track.  It is also really easy to save the data to the browser because I just need to stringify/parse the SAVE_FILE variable and then save/load it to/from localStorage.

Image switching is done by assigning a randomly generated ID to every image.  The id of the currently displayed image/annotation set is then just saved as SAVE_FILE.mainId and renderSaveFile just digs up the matching id from the array of images.


Note:
As instructed, no libraries were used.  However, I wrote my code in es6 because I find it easier.  I just ran the code through an online es6 -> es5 transpiler for better browser compatibility.  The es6 source code is script.js.  
