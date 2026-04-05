import { before } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import settings from "./settings.js";

storage.BubbleEnabled    ??= true;
storage.MyBubbleColor    ??= "#5865F2";
storage.OtherBubbleColor ??= "#FFFFFF";
storage.BubbleRadius     ??= 12;

let patches = [];

export default {
    onLoad: () => {
        if (!storage.BubbleEnabled) return;

        try {
            const UserStore = findByProps("getCurrentUser");

            // Try multiple possible component names
            const candidates = [
                findByProps("renderMessage", "renderSystemMessage"),
                findByProps("getMessageGroupProps"),
                findByProps("renderMessageContent"),
                findByProps("ChannelMessage"),
                findByProps("InboxMessage"),
            ].filter(Boolean);

            console.log("[ChatBubbles] Found candidates:", candidates.length);

            for (const candidate of candidates) {
                // Find any render-like function we can patch
                const keys = Object.keys(candidate).filter(k =>
                    typeof candidate[k] === "function" &&
                    (k.includes("render") || k.includes("Message") || k.includes("message"))
                );

                for (const key of keys) {
                    try {
                        patches.push(
                            before(key, candidate, (args) => {
                                // args[0] is usually props
                                const props = args[0];
                                if (!props?.message) return;

                                const currentUser = UserStore?.getCurrentUser?.();
                                const isMe = props.message?.author?.id === currentUser?.id;
                                const color = isMe
                                    ? storage.MyBubbleColor + "33"
                                    : storage.OtherBubbleColor + "22";
                                const radius = storage.BubbleRadius ?? 12;

                                props.__bubbleStyle = {
                                    backgroundColor: color,
                                    borderRadius: radius,
                                    marginHorizontal: 4,
                                    marginVertical: 1,
                                    paddingHorizontal: 6,
                                    paddingVertical: 2,
                                };
                            })
                        );
                        console.log("[ChatBubbles] Patched:", key);
                    } catch (e) {}
                }
            }

            // Fallback: patch View renders that contain message data
            const { General } = require("@vendetta/ui/components");
            patches.push(
                before("render", General.View, (args) => {
                    const [props] = args;
                    if (!props) return;

                    // Look for message content containers
                    const hasMessageContent =
                        props?.accessibilityLabel?.includes?.("Message") ||
                        props?.["data-message-id"] ||
                        props?.messageId;

                    if (!hasMessageContent) return;

                    const currentUser = UserStore?.getCurrentUser?.();
                    const authorId = props?.authorId ?? props?.message?.author?.id;
                    const isMe = authorId === currentUser?.id;
                    const color = isMe
                        ? storage.MyBubbleColor + "33"
                        : storage.OtherBubbleColor + "22";

                    props.style = [
                        props.style,
                        {
                            backgroundColor: color,
                            borderRadius: storage.BubbleRadius ?? 12,
                            marginHorizontal: 4,
                            marginVertical: 1,
                        }
                    ];
                })
            );

        } catch (e) {
            console.log("[ChatBubbles] Error:", e);
        }
    },

    onUnload: () => {
        for (const x of patches) x();
    },

    settings,
};
