import { findByProps, findByDisplayName } from "@kettu/metro";
import { after } from "@kettu/patcher";
import { createPlugin } from "@kettu/plugins";
import { showToast } from "@kettu/ui/toasts";

const defaultSettings = {
  rightAction: "reply",
  leftAction: "edit",
};

export default createPlugin({
  name: "SwipeActions",
  settings: defaultSettings,

  start(settings) {
    const patches = [];

    const MessageStore = findByProps("getMessage", "getMessages");
    const UserStore = findByProps("getCurrentUser");
    const ChannelStore = findByProps("getChannel", "getDMFromUserId");
    const FluxDispatcher = findByProps("dispatch", "subscribe");

    function handleAction(message, action) {
      const me = UserStore.getCurrentUser();
      const isOwn = message.author.id === me.id;

      switch (action) {
        case "reply":
          FluxDispatcher.dispatch({
            type: "CREATE_PENDING_REPLY",
            message,
            channel: ChannelStore.getChannel(message.channel_id),
            shouldMention: true,
          });
          break;

        case "edit":
          if (!isOwn) {
            showToast("You can only edit your own messages.");
            return;
          }
          FluxDispatcher.dispatch({
            type: "MESSAGE_START_EDIT",
            channelId: message.channel_id,
            messageId: message.id,
            content: message.content,
          });
          break;

        case "delete":
          if (!isOwn) {
            showToast("You can only delete your own messages.");
            return;
          }
          FluxDispatcher.dispatch({
            type: "MESSAGE_DELETE_CONFIRM",
            channelId: message.channel_id,
            messageId: message.id,
          });
          break;
      }
    }

    const MessageRow =
      findByDisplayName("MessageListItemWrapper") ??
      findByProps("onSwipeLeft", "onSwipeRight");

    if (!MessageRow) {
      showToast("SwipeActions: Could not find message component.");
      return;
    }

    patches.push(
      after("render", MessageRow.prototype ?? MessageRow, (args, res) => {
        if (!res?.props) return res;

        const message = args[0]?.message ?? res.props.message;
        if (!message) return res;

        res.props.onSwipeRight = () => handleAction(message, settings.rightAction);
        res.props.onSwipeLeft = () => handleAction(message, settings.leftAction);

        return res;
      })
    );

    return () => patches.forEach((p) => p());
  }
