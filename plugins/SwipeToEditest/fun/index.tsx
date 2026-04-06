import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

let patches = [];

export default {
  onLoad: () => {
    const SwipeModule = findByProps("useIsMessageSwipeActionsEnabled");

    if (SwipeModule) {
      patches.push(
        after("useIsMessageSwipeActionsEnabled", SwipeModule, () => true)
      );
    }
  },

  onUnload: () => {
    for (const p of patches) p();
    patches = [];
  },
};
