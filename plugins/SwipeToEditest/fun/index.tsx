// V2
import { findByProps } from "@vendetta/metro";

export default {
  onLoad: () => {
    const m1 = findByProps("swipeToEditIconUrl");
    console.log("swipeToEditIconUrl module:", m1);
    
    const m2 = findByProps("swipe_edit_undo");
    console.log("swipe_edit_undo module:", m2);

    const m3 = findByProps("canEditMessage");
    console.log("canEditMessage module:", m3);
  },

  onUnload: () => {},
};
