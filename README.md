The core idea behind my execution is having only a single function and a single global object control DOM updates.  Any dom changes (image upload/deletion, annotation creation/removal, etc) is done by editing the SAVE_FILE global variable and then running the renderSaveFile function.  The pattern is based on how ReactJS' state - works where dom update is done by calling the setState function.

The advantage of this approach is easier data-tracking because there is pretty much only one variable to track.  It is also really easy to save the data to the browser because I just need to stringify/parse the SAVE_FILE variable and then save/load it to/from localStorage.

Image switching is done by assigning a randomly generated ID to every image.  The id of the currently displayed image/annotation set is then just saved as SAVE_FILE.mainId and renderSaveFile just digs up the matching id from the array of images.


Note:
As instructed, no libraries were used.  However, I wrote my code in es6 because I find it easier.  I just ran the code through an online es6 -> es5 transpiler for better browser compatibility.  The es6 source code is script.js.  
